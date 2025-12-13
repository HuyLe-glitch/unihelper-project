const studentRepository = require('../repositories/studentRepository');
const userRepository = require('../repositories/userRepository');
const Major = require('../models/Major');
const User = require('../models/User');
const userService = require('./userService');
const { AppError } = require('../utils/appError');

class StudentService {
  // New createStudent method
  async createStudent(payload = {}) {
    const mongoose = require('mongoose');
    const Student = require('../models/Student');
    const User = require('../models/User');
    const Major = require('../models/Major');

    const {
      user,            // optional existing userId
      fullName,        // moved to Student model
      studentId,
      major,
      academicYear,
      className,
      dateOfBirth,
      email,
      password,
      phone,
      address,
      citizenId,
      enrollmentDate,
      gpa,
      status
    } = payload;

    // =========================
    // 1. Validate required fields
    // =========================
    if (!fullName || !studentId || !major || !academicYear || !className || !dateOfBirth) {
      throw new AppError('Missing required student fields', 400);
    }

    // =========================
    // 2. Case A: client supplies existing userId
    // =========================
    if (user) {
      if (!mongoose.Types.ObjectId.isValid(String(user))) {
        throw new AppError('Invalid user id', 400);
      }

      const existingUser = await userRepository.findById(user);
      if (!existingUser) throw new AppError('User not found', 404);

      if (existingUser.role !== 'STUDENT') {
        throw new AppError('User is not STUDENT role', 400);
      }

      // ensure no existing student profile
      const existingStudent = await studentRepository.findByUser(user);
      if (existingStudent) throw new AppError('Student profile already exists for this user', 400);

      // ensure studentId not used
      const existsStudentId = await Student.findOne({ studentId });
      if (existsStudentId) throw new AppError('studentId already exists', 400);
    }

    // =========================
    // 3. Case B: No user supplied → Create new User
    // =========================
    let createdUser = null;
    let userId = user;

    if (!userId) {
      if (!email || !password) {
        throw new AppError('Missing email/password for new user creation', 400);
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existsUser = await userRepository.findByEmail(normalizedEmail);
      if (existsUser) throw new AppError('Email already exists', 400);

      // ensure studentId not duplicated
      const existsStudent = await Student.findOne({ studentId });
      if (existsStudent) throw new AppError('studentId already exists', 400);

      const newUser = new User({
        email: normalizedEmail,
        password,
        role: 'STUDENT',
        isActive: true
      });

      createdUser = await newUser.save();
      userId = createdUser._id;
    }

    // =========================
    // 4. Validate major exists
    // =========================
    const majorDoc = await Major.findById(major);
    if (!majorDoc) {
      if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => { });
      throw new AppError('Major not found', 404);
    }

    // =========================
    // 5. Create Student profile
    // =========================
    const studentData = {
      user: userId,
      fullName,
      studentId,
      major,
      academicYear,
      className,
      dateOfBirth
    };

    if (phone) studentData.phone = phone;
    if (address) studentData.address = address;
    if (citizenId) studentData.citizenId = citizenId;
    if (enrollmentDate) studentData.enrollmentDate = enrollmentDate;
    if (typeof gpa !== 'undefined') studentData.gpa = gpa;
    if (status) studentData.status = status;

    try {
      const createdStudent = await Student.create(studentData);

      return {
        success: true,
        message: 'Student created successfully',
        data: createdStudent
      };

    } catch (err) {
      // Rollback User if Student creation failed
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id).catch(() => { });
      }

      // Duplicate key clear error
      if (err && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        throw new AppError(`Duplicate value for ${field}: ${value}`, 400);
      }

      throw new AppError(err.message || 'Student creation failed', 500);
    }
  }

  async listStudents(page = 1, limit = 20, filters = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const { docs, total } = await studentRepository.findAll({ skip, limit, filters });
    return { docs, total };
  }

  async getStudentById(id) {
    const doc = await studentRepository.findById(id);
    if (!doc) throw new AppError('Student not found', 404);
    return doc;
  }

  async updateStudent(id, payload = {}) {
    const mongoose = require('mongoose');
    const Student = require('../models/Student');
    const User = require('../models/User');
    const Major = require('../models/Major');

    const {
      email,
      fullName,
      studentId,
      major,
      academicYear,
      className,
      citizenId,
      address,
      dateOfBirth,
      phone,
      enrollmentDate,
      gpa,
      status
    } = payload;

    // Tìm student hiện tại
    const student = await Student.findById(id).populate('user');
    if (!student) throw new AppError('Student not found', 404);

    // Cập nhật User nếu có email
    if (email) {
      const emailNorm = email.toLowerCase().trim();
      const existsEmail = await User.findOne({ email: emailNorm, _id: { $ne: student.user._id } });
      if (existsEmail) throw new AppError('Email already exists', 400);

      await User.findByIdAndUpdate(student.user._id, { email: emailNorm });
    }

    // Validate major nếu có
    if (major) {
      if (!mongoose.Types.ObjectId.isValid(String(major))) {
        throw new AppError('Invalid major id', 400);
      }
      const majorDoc = await Major.findById(major);
      if (!majorDoc) throw new AppError('Major not found', 404);
    }

    // Validate studentId nếu có
    if (studentId && studentId !== student.studentId) {
      const existsStudentId = await Student.findOne({ studentId, _id: { $ne: id } });
      if (existsStudentId) throw new AppError('studentId already exists', 400);
    }

    // Validate citizenId nếu có
    if (citizenId && citizenId !== student.citizenId) {
      const existsCitizenId = await Student.findOne({ citizenId, _id: { $ne: id } });
      if (existsCitizenId) throw new AppError('citizenId already exists', 400);
    }

    // Cập nhật Student
    const studentUpdate = {};
    if (fullName) studentUpdate.fullName = fullName;
    if (studentId) studentUpdate.studentId = studentId;
    if (major) studentUpdate.major = major;
    if (academicYear) studentUpdate.academicYear = academicYear;
    if (className) studentUpdate.className = className;
    if (citizenId) studentUpdate.citizenId = citizenId;
    if (address) studentUpdate.address = address;
    if (dateOfBirth) studentUpdate.dateOfBirth = dateOfBirth;
    if (phone) studentUpdate.phone = phone;
    if (enrollmentDate) studentUpdate.enrollmentDate = enrollmentDate;
    if (typeof gpa !== 'undefined') studentUpdate.gpa = gpa;
    if (status) studentUpdate.status = status;

    const updated = await Student.findByIdAndUpdate(id, studentUpdate, { new: true, runValidators: true });

    return {
      success: true,
      message: 'Student updated successfully',
      data: updated
    };
  }

  // Xóa phương thức này khi triển khai hệ thống thật
  async deleteStudent(id) {
    const deleted = await studentRepository.deleteById(id);
    if (!deleted) throw new AppError('Student not found', 404);
    return deleted;
  }
}

module.exports = new StudentService();