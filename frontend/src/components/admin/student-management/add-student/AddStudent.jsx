import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    name: '',
    email: '',
    studentId: '',
    phone: '',
    dateOfBirth: '',
    
    // Thông tin học tập
    major: '',
    academicYear: '',
    className: '',
    gpa: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    
    // Địa chỉ
    currentAddress: '',
    permanentAddress: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Thông tin công dân
    citizenId: '',
    nationality: 'Việt Nam',
    ethnicity: 'Kinh',
    religion: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate thông tin cơ bản
    if (!formData.name.trim()) newErrors.name = 'Họ tên là bắt buộc';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email không hợp lệ';
    if (!formData.studentId.trim()) newErrors.studentId = 'Mã sinh viên là bắt buộc';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    
    // Validate thông tin học tập
    if (!formData.major) newErrors.major = 'Chuyên ngành là bắt buộc';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Niên khóa là bắt buộc';
    if (!formData.className.trim()) newErrors.className = 'Lớp là bắt buộc';
    
    // Validate địa chỉ
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Địa chỉ hiện tại là bắt buộc';
    if (!formData.permanentAddress.trim()) newErrors.permanentAddress = 'Địa chỉ thường trú là bắt buộc';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Form submitted:', formData);
      alert('Thêm sinh viên thành công!');
      navigate('/admin/users');
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.')) {
      navigate(-1);
    }
  };

  return (
    <div className="add-student-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-btn">← Quay lại</button>
        <h1>Thêm sinh viên mới 🎓</h1>
        <p>Điền thông tin để tạo tài khoản sinh viên</p>
      </div>

      <form onSubmit={handleSubmit} className="add-student-form">
        {/* Thông tin cơ bản */}
        <div className="section-title">📋 Thông tin cơ bản</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Nguyễn Văn A"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="student@tdtu.edu.vn"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mã sinh viên <span className="required">*</span></label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={errors.studentId ? 'error' : ''}
              placeholder="SV2024001"
            />
            {errors.studentId && <span className="error-text">{errors.studentId}</span>}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh <span className="required">*</span></label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'error' : ''}
            />
            {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label>Số CMND/CCCD</label>
            <input
              type="text"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleChange}
              placeholder="079200001234"
            />
          </div>

          <div className="form-group">
            <label>Quốc tịch</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="Việt Nam"
            />
          </div>

          <div className="form-group">
            <label>Dân tộc</label>
            <input
              type="text"
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
              placeholder="Kinh"
            />
          </div>

          <div className="form-group">
            <label>Tôn giáo</label>
            <input
              type="text"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              placeholder="Không"
            />
          </div>
        </div>

        {/* Thông tin học tập */}
        <div className="section-title">📚 Thông tin học tập</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Chuyên ngành <span className="required">*</span></label>
            <select
              name="major"
              value={formData.major}
              onChange={handleChange}
              className={errors.major ? 'error' : ''}
            >
              <option value="">-- Chọn chuyên ngành --</option>
              <option value="CNTT">Công nghệ thông tin</option>
              <option value="KTPM">Kỹ thuật phần mềm</option>
              <option value="HTTT">Hệ thống thông tin</option>
              <option value="KHMT">Khoa học máy tính</option>
              <option value="ATTT">An toàn thông tin</option>
            </select>
            {errors.major && <span className="error-text">{errors.major}</span>}
          </div>

          <div className="form-group">
            <label>Niên khóa <span className="required">*</span></label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className={errors.academicYear ? 'error' : ''}
              placeholder="2020-2024"
            />
            {errors.academicYear && <span className="error-text">{errors.academicYear}</span>}
          </div>

          <div className="form-group">
            <label>Lớp <span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className={errors.className ? 'error' : ''}
              placeholder="20DTHD1"
            />
            {errors.className && <span className="error-text">{errors.className}</span>}
          </div>

          <div className="form-group">
            <label>GPA</label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="4"
              placeholder="3.5"
            />
          </div>

          <div className="form-group">
            <label>Ngày nhập học</label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Đang học</option>
              <option value="INACTIVE">Tạm nghỉ</option>
              <option value="GRADUATED">Đã tốt nghiệp</option>
              <option value="SUSPENDED">Đình chỉ</option>
            </select>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="section-title">🏠 Địa chỉ</div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Địa chỉ hiện tại <span className="required">*</span></label>
            <input
              type="text"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
              className={errors.currentAddress ? 'error' : ''}
              placeholder="123 Nguyễn Văn Cừ, Phường 4, Quận 5"
            />
            {errors.currentAddress && <span className="error-text">{errors.currentAddress}</span>}
          </div>

          <div className="form-group full-width">
            <label>Địa chỉ thường trú <span className="required">*</span></label>
            <input
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              className={errors.permanentAddress ? 'error' : ''}
              placeholder="456 Lê Lai, Xã Tân Hòa, Huyện Châu Thành"
            />
            {errors.permanentAddress && <span className="error-text">{errors.permanentAddress}</span>}
          </div>

          <div className="form-group">
            <label>Thành phố</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Thành phố Hồ Chí Minh"
            />
          </div>

          <div className="form-group">
            <label>Tỉnh/Thành phố</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="Hồ Chí Minh"
            />
          </div>

          <div className="form-group">
            <label>Mã bưu chính</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="700000"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary" disabled={submitting}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Đang thêm...' : 'Thêm sinh viên'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;