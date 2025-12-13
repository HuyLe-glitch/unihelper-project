import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader, User, GraduationCap, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './EditStudent.css';

// Mock data cho Major
const mockMajors = [
  { 
    _id: '1', 
    name: 'Công nghệ Phần mềm', 
    code: 'CNPM',
    faculty: { name: 'Khoa Công nghệ Thông tin', code: 'CNTT' }
  },
  { 
    _id: '2', 
    name: 'Khoa học Máy tính', 
    code: 'KHMT',
    faculty: { name: 'Khoa Công nghệ Thông tin', code: 'CNTT' }
  },
  { 
    _id: '3', 
    name: 'Quản trị Kinh doanh', 
    code: 'QTKD',
    faculty: { name: 'Khoa Kinh tế', code: 'KT' }
  },
  { 
    _id: '4', 
    name: 'Kỹ thuật Cơ khí', 
    code: 'KTCK',
    faculty: { name: 'Khoa Kỹ thuật', code: 'KT' }
  }
];

// Academic years
const academicYears = ['2020', '2021', '2022', '2023', '2024', '2025'];

// Status options
const statusOptions = [
  { value: 'ACTIVE', label: 'Đang học' },
  { value: 'INACTIVE', label: 'Tạm ngừng' },
  { value: 'GRADUATED', label: 'Đã tốt nghiệp' },
  { value: 'SUSPENDED', label: 'Bị đình chỉ' },
  { value: 'DROPPED', label: 'Bỏ học' },
  { value: 'TEMPORARY_LEAVE', label: 'Tạm nghỉ' }
];

const EditStudent = () => {
  // TODO: Get student ID from URL params
  // const { id } = useParams();
  const studentId = '1'; // Mock ID
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    major: '',
    academicYear: '',
    className: '',
    phone: '',
    address: '',
    citizenId: '',
    dateOfBirth: '',
    enrollmentDate: '',
    gpa: 0,
    status: 'ACTIVE'
  });
  const [userEmail, setUserEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - Replace with API call
  const mockStudent = {
    _id: '1',
    user: {
      _id: 'user1',
      email: 'student@example.com'
    },
    studentId: '2024001',
    fullName: 'Nguyễn Văn A',
    major: {
      _id: '1',
      name: 'Công nghệ Phần mềm',
      code: 'CNPM',
      faculty: { name: 'Khoa Công nghệ Thông tin', code: 'CNTT' }
    },
    academicYear: '2024',
    className: 'CNPM01',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    citizenId: '079012345678',
    dateOfBirth: '2002-05-15',
    enrollmentDate: '2024-09-01',
    gpa: 3.25,
    status: 'ACTIVE',
    createdAt: '2024-09-01T08:00:00Z'
  };

  // Load student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Call API to get student by ID with populated user and major
        // const response = await getStudentById(studentId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set form data from API response
        setFormData({
          studentId: mockStudent.studentId,
          fullName: mockStudent.fullName,
          major: mockStudent.major._id,
          academicYear: mockStudent.academicYear,
          className: mockStudent.className,
          phone: mockStudent.phone || '',
          address: mockStudent.address,
          citizenId: mockStudent.citizenId,
          dateOfBirth: mockStudent.dateOfBirth,
          enrollmentDate: mockStudent.enrollmentDate,
          gpa: mockStudent.gpa,
          status: mockStudent.status
        });
        
        setUserEmail(mockStudent.user.email);
        
      } catch (error) {
        console.error('Error fetching student:', error);
        alert('Có lỗi xảy ra khi tải thông tin sinh viên!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Mã sinh viên là bắt buộc';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = 'Họ và tên không quá 50 ký tự';
    }

    if (!formData.major) {
      newErrors.major = 'Vui lòng chọn chuyên ngành';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Vui lòng chọn niên khóa';
    }

    if (!formData.className.trim()) {
      newErrors.className = 'Lớp là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.citizenId.trim()) {
      newErrors.citizenId = 'CCCD/CMND là bắt buộc';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }

    if (formData.gpa < 0 || formData.gpa > 4) {
      newErrors.gpa = 'GPA phải từ 0 đến 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call API to update student
      // const response = await updateStudent(studentId, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updating student:', {
        id: studentId,
        ...formData
      });

      alert('Cập nhật sinh viên thành công!');
      
      // TODO: Navigate back to student list
      // navigate('/students');
      handleCancel();
      
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Có lỗi xảy ra khi cập nhật sinh viên!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // TODO: Navigate back to student list
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.')) {
      alert('Quay lại trang danh sách sinh viên');
    }
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="student-form-container">
        <div className="student-form-wrapper">
          <div className="loading-container">
            <Loader className="loading-spinner" size={48} />
            <p className="loading-text">Đang tải thông tin sinh viên...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-form-container">
      <div className="student-form-wrapper">
        {/* Header */}
        <div className="form-header">
          <button onClick={handleCancel} className="btn-back">
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="form-header-content">
            <h1 className="form-title">Chỉnh sửa thông tin sinh viên</h1>
            <p className="form-subtitle">Cập nhật thông tin: {mockStudent.fullName}</p>
          </div>
        </div>

        {/* Form */}
        <div className="form-content">
          {/* Account Info - Read Only */}
          <div className="form-card">
            <div className="form-section info-section">
              <h2 className="section-title">
                <User size={20} />
                Thông tin tài khoản
              </h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Email đăng nhập:</span>
                  <span className="info-value">{userEmail}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày tạo:</span>
                  <span className="info-value">
                    {new Date(mockStudent.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
              <p className="info-note">
                ℹ️ Thông tin tài khoản không thể chỉnh sửa. Liên hệ quản trị viên nếu cần thay đổi email hoặc mật khẩu.
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-card">
            <div className="form-section">
              <h2 className="section-title">
                <GraduationCap size={20} />
                Thông tin cơ bản
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">
                    Mã sinh viên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`form-input form-input-code ${errors.studentId ? 'form-input-error' : ''}`}
                    placeholder="VD: 2024001"
                  />
                  {errors.studentId && <p className="error-message">{errors.studentId}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
                    placeholder="Nhập họ và tên"
                    maxLength={50}
                  />
                  {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="major" className="form-label">
                    Chuyên ngành <span className="required">*</span>
                  </label>
                  <select
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className={`form-select ${errors.major ? 'form-input-error' : ''}`}
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {mockMajors.map(major => (
                      <option key={major._id} value={major._id}>
                        [{major.code}] {major.name} - {major.faculty.name}
                      </option>
                    ))}
                  </select>
                  {errors.major && <p className="error-message">{errors.major}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="academicYear" className="form-label">
                    Niên khóa <span className="required">*</span>
                  </label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`form-select ${errors.academicYear ? 'form-input-error' : ''}`}
                  >
                    <option value="">-- Chọn niên khóa --</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>
                        Khóa {year}
                      </option>
                    ))}
                  </select>
                  {errors.academicYear && <p className="error-message">{errors.academicYear}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="className" className="form-label">
                    Lớp <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="className"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className={`form-input ${errors.className ? 'form-input-error' : ''}`}
                    placeholder="VD: CNPM01"
                  />
                  {errors.className && <p className="error-message">{errors.className}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="form-card">
            <div className="form-section">
              <h2 className="section-title">
                <CreditCard size={20} />
                Thông tin cá nhân
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="citizenId" className="form-label">
                    CCCD/CMND <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="citizenId"
                    name="citizenId"
                    value={formData.citizenId}
                    onChange={handleChange}
                    className={`form-input ${errors.citizenId ? 'form-input-error' : ''}`}
                    placeholder="Nhập số CCCD/CMND"
                  />
                  {errors.citizenId && <p className="error-message">{errors.citizenId}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Ngày sinh <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`form-input ${errors.dateOfBirth ? 'form-input-error' : ''}`}
                  />
                  {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0123456789"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="enrollmentDate" className="form-label">
                    Ngày nhập học
                  </label>
                  <input
                    type="date"
                    id="enrollmentDate"
                    name="enrollmentDate"
                    value={formData.enrollmentDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Địa chỉ <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`form-textarea ${errors.address ? 'form-input-error' : ''}`}
                  placeholder="Nhập địa chỉ đầy đủ"
                  rows={3}
                />
                {errors.address && <p className="error-message">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="form-card">
            <div className="form-section">
              <h2 className="section-title">
                <Calendar size={20} />
                Thông tin học tập
              </h2>
              
              <div className="form-group">
                <label htmlFor="gpa" className="form-label">
                  GPA
                </label>
                <input
                  type="number"
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className={`form-input ${errors.gpa ? 'form-input-error' : ''}`}
                  min="0"
                  max="4"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.gpa && <p className="error-message">{errors.gpa}</p>}
                <p className="form-hint">GPA từ 0.00 đến 4.00</p>
              </div>

              <div className="gpa-display">
                <div className="gpa-card">
                  <span className="gpa-label">GPA hiện tại</span>
                  <span className={`gpa-value ${formData.gpa >= 3.5 ? 'gpa-excellent' : formData.gpa >= 3.0 ? 'gpa-good' : formData.gpa >= 2.0 ? 'gpa-average' : 'gpa-poor'}`}>
                    {formData.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="gpa-info">
                  <p className="gpa-rank">
                    Xếp loại: {
                      formData.gpa >= 3.6 ? 'Xuất sắc' :
                      formData.gpa >= 3.2 ? 'Giỏi' :
                      formData.gpa >= 2.5 ? 'Khá' :
                      formData.gpa >= 2.0 ? 'Trung bình' : 'Yếu'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="form-card">
            <div className="form-section">
              <p className="info-warning">
                ⚠️ Lưu ý: Thay đổi trạng thái sinh viên có thể ảnh hưởng đến quyền truy cập hệ thống và các thông tin liên quan.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-submit"
              disabled={isSubmitting}
            >
              <Save size={20} />
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;