const studentService = require('../services/studentService');
const { validationResult } = require('express-validator');
const {
  formatDateOnlyVN,
  generateCSVFilename,
  jsonToCSV,
  studentCSVFields,
  studentDormCSVFields
} = require('../utils/csvExporter');

/**
 * Student Controller - Thin Controller
 * Chỉ nhận request, gọi service và trả response
 * KHÔNG chứa business logic
 */
class StudentController {
  /**
   * POST /api/students
   * Tạo sinh viên mới
   */
  createStudent = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await studentService.createStudent(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students
   * Lấy danh sách sinh viên
   */
  listStudents = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      const filters = {};
      if (req.query.major) filters.major = req.query.major;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.isDormResident !== undefined) {
        filters.isDormResident = req.query.isDormResident === 'true';
      }

      const result = await studentService.listStudents(page, limit, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/dormitory
   * Lấy danh sách sinh viên ở KTX
   */
  listDormStudents = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      const filters = {};
      if (req.query.roomId) filters.roomId = req.query.roomId;

      const result = await studentService.listDormStudents(page, limit, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/:id
   * Lấy sinh viên theo ID
   */
  getStudentById = async (req, res, next) => {
    try {
      const result = await studentService.getStudentById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/students/:id
   * Cập nhật sinh viên
   */
  updateStudent = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await studentService.updateStudent(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/:id/delete-preview
   * Xem trước dữ liệu sẽ bị xóa khi xóa sinh viên
   */
  getDeletePreview = async (req, res, next) => {
    try {
      const result = await studentService.getDeletePreview(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/students/:id
   * Xóa sinh viên hoàn toàn (bao gồm tất cả yêu cầu CTSV & KTX)
   */
  deleteStudent = async (req, res, next) => {
    try {
      const result = await studentService.deleteStudent(req.params.id);
      
      if (req.io) {
        // Emit socket event nếu sinh viên ở KTX (để cập nhật số người trong phòng)
        if (result.data?.affectedRoomId) {
          req.io.emit('STUDENT_ROOM_UPDATED', {
            action: 'deleted',
            roomId: result.data.affectedRoomId
          });
        }
        
        // Emit event để Staff CTSV cập nhật danh sách yêu cầu
        if (result.data?.deletedCertificateRequests > 0) {
          req.io.emit('STUDENT_REQUESTS_DELETED', {
            type: 'certificate',
            deletedCount: result.data.deletedCertificateRequests
          });
        }
        
        // Emit event để Staff KTX cập nhật danh sách yêu cầu
        if (result.data?.deletedDormitoryRequests > 0) {
          req.io.emit('STUDENT_REQUESTS_DELETED', {
            type: 'dormitory',
            deletedCount: result.data.deletedDormitoryRequests
          });
        }
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/students/:id/remove-dormitory
   * Chỉ xóa sinh viên khỏi KTX (giữ lại sinh viên và yêu cầu CTSV)
   */
  removeFromDormitory = async (req, res, next) => {
    try {
      const result = await studentService.removeFromDormitory(req.params.id);
      
      // Emit socket event để cập nhật số người trong phòng
      if (result.data?.affectedRoomId && req.io) {
        req.io.emit('STUDENT_ROOM_UPDATED', {
          action: 'removed_from_dorm',
          roomId: result.data.affectedRoomId
        });
        console.log('📡 Emitted STUDENT_ROOM_UPDATED for room:', result.data.affectedRoomId);
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/available-rooms
   * Lấy danh sách phòng còn chỗ trống
   */
  getAvailableRooms = async (req, res, next) => {
    try {
      const result = await studentService.getAvailableRooms();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/stats
   * Lấy thống kê sinh viên
   */
  getStats = async (req, res, next) => {
    try {
      const result = await studentService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // IMPORT CSV APIs
  // ==========================================

  /**
   * POST /api/students/import/preview
   * API Preview - Validate dữ liệu CSV KHÔNG lưu DB
   * [PHỤC VỤ FRONTEND BƯỚC 2: XEM TRƯỚC & VALIDATE]
   */
  previewImport = async (req, res, next) => {
    try {
      const { rows, majorId } = req.body;
      
      if (!rows || !Array.isArray(rows)) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ - cần mảng rows'
        });
      }
      
      if (!majorId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu majorId - chuyên ngành'
        });
      }
      
      const result = await studentService.previewImport(rows, majorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/students/import/execute
   * API Import - Lưu dữ liệu hợp lệ vào DB
   * [PHỤC VỤ FRONTEND BƯỚC 3: XỬ LÝ]
   */
  executeImport = async (req, res, next) => {
    try {
      const { validRows, majorId } = req.body;
      
      if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có dữ liệu hợp lệ để import'
        });
      }
      
      if (!majorId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu majorId - chuyên ngành'
        });
      }
      
      const result = await studentService.executeImport(validRows, majorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/students/bulk-delete-preview
   * Xem trước dữ liệu sẽ bị xóa khi xóa hàng loạt
   */
  getBulkDeletePreview = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { ids } = req.body;
      const result = await studentService.getBulkDeletePreview(ids);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/students/bulk
   * Xóa nhiều sinh viên cùng lúc
   */
  bulkDeleteStudents = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { ids } = req.body;
      const result = await studentService.bulkDeleteStudents(ids);
      
      if (req.io) {
        // Emit socket event cho các phòng bị ảnh hưởng
        if (result.data?.affectedRoomIds?.length > 0) {
          result.data.affectedRoomIds.forEach(roomId => {
            req.io.emit('STUDENT_ROOM_UPDATED', {
              action: 'bulk_deleted',
              roomId
            });
          });
          console.log('📡 Emitted STUDENT_ROOM_UPDATED for rooms:', result.data.affectedRoomIds);
        }
        
        // Emit event để Staff CTSV cập nhật danh sách yêu cầu
        if (result.data?.deletedCertificateRequests > 0) {
          req.io.emit('STUDENT_REQUESTS_DELETED', {
            type: 'certificate',
            deletedCount: result.data.deletedCertificateRequests
          });
          console.log('📡 Emitted STUDENT_REQUESTS_DELETED (certificate):', result.data.deletedCertificateRequests);
        }
        
        // Emit event để Staff KTX cập nhật danh sách yêu cầu
        if (result.data?.deletedDormitoryRequests > 0) {
          req.io.emit('STUDENT_REQUESTS_DELETED', {
            type: 'dormitory',
            deletedCount: result.data.deletedDormitoryRequests
          });
          console.log('📡 Emitted STUDENT_REQUESTS_DELETED (dormitory):', result.data.deletedDormitoryRequests);
        }
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/students/bulk-remove-dormitory
   * Xóa nhiều sinh viên khỏi KTX (giữ lại sinh viên)
   */
  bulkRemoveFromDormitory = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { ids } = req.body;
      const result = await studentService.bulkRemoveFromDormitory(ids);
      
      if (req.io) {
        // Emit socket event cho các phòng bị ảnh hưởng
        if (result.data?.affectedRoomIds?.length > 0) {
          result.data.affectedRoomIds.forEach(roomId => {
            req.io.emit('STUDENT_ROOM_UPDATED', {
              action: 'bulk_removed_from_dorm',
              roomId
            });
          });
          console.log('📡 Emitted STUDENT_ROOM_UPDATED for rooms:', result.data.affectedRoomIds);
        }
        
        // Emit event để Staff KTX cập nhật danh sách yêu cầu
        if (result.data?.deletedDormitoryRequests > 0) {
          req.io.emit('STUDENT_REQUESTS_DELETED', {
            type: 'dormitory',
            deletedCount: result.data.deletedDormitoryRequests
          });
          console.log('📡 Emitted STUDENT_REQUESTS_DELETED (dormitory):', result.data.deletedDormitoryRequests);
        }
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/students/transfer
   * Chuyển phòng cho nhiều sinh viên
   */
  transferStudentsRoom = async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { studentIds, targetRoomId } = req.body;
      const result = await studentService.transferStudentsRoom(studentIds, targetRoomId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/students/export-csv
   * Xuất danh sách sinh viên ra file CSV
   * Query params:
   * - isDormResident: true/false - Lọc theo tình trạng KTX
   * - faculty: ID khoa - Lọc theo khoa
   * - major: ID ngành - Lọc theo ngành
   * - roomId: ID phòng - Lọc theo phòng
   */
  exportStudentsCSV = async (req, res, next) => {
    try {
      const { isDormResident, faculty, major, roomId } = req.query;
      const isDormExport = isDormResident === 'true';
      
      // Build filters cho service
      const filters = {};
      if (isDormResident !== undefined) {
        filters.isDormResident = isDormExport;
      }
      if (faculty) {
        filters.faculty = faculty;
      }
      if (major) {
        filters.major = major;
      }
      if (roomId) {
        filters.roomId = roomId;
      }

      // Lấy dữ liệu từ service
      const result = await studentService.getDataForCSVExport(filters);

      // Map dữ liệu cho CSV - khác nhau tùy loại
      const csvData = result.data.map(student => {
        const baseData = {
          studentId: student.studentId || '',
          fullName: student.fullName || '',
          email: student.user?.email || '',
          phone: student.phone || '',
          citizenId: student.citizenId || '',
          dateOfBirth: formatDateOnlyVN(student.dateOfBirth),
          address: student.address || '',
          facultyName: student.major?.faculty?.name || '',
          majorName: student.major?.name || '',
          createdAt: formatDateOnlyVN(student.createdAt)
        };

        if (isDormExport) {
          // Sinh viên KTX - có cột Phòng
          return {
            ...baseData,
            roomName: student.roomId?.name || ''
          };
        } else {
          // Tất cả sinh viên - có cột Ở KTX
          return {
            ...baseData,
            isDormResident: student.isDormResident ? 'Có' : 'Không'
          };
        }
      });

      // Chọn bộ fields phù hợp
      const fields = isDormExport ? studentDormCSVFields : studentCSVFields;

      // Tạo CSV string
      const csvString = jsonToCSV(csvData, fields);

      // Tạo tên file
      const prefix = isDormExport ? 'DS_SinhVien_KTX' : 'DS_SinhVien';
      const filename = generateCSVFilename(prefix);

      // Set headers và gửi response
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvString);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new StudentController();
