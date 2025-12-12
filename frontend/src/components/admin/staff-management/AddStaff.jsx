import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStaff.css';

const AddStaff = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    staffId: '',
    staffType: '',
    department: '',
    staffRole: '',
    phone: '',
    status: 'ACTIVE'
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
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email không hợp lệ';
    if (!formData.staffId.trim()) newErrors.staffId = 'Mã nhân viên là bắt buộc';
    
    // Validate thông tin công việc
    if (!formData.staffType) newErrors.staffType = 'Loại nhân viên là bắt buộc';
    if (!formData.department.trim()) newErrors.department = 'Phòng ban là bắt buộc';
    if (!formData.staffRole.trim()) newErrors.staffRole = 'Chức vụ là bắt buộc';
    
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
      // Gọi API tạo nhân viên
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Form submitted:', formData);
      alert('Thêm nhân viên thành công!');
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
    <div className="add-staff-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-btn">← Quay lại</button>
        <h1>Thêm nhân viên mới 👔</h1>
        <p>Điền thông tin để tạo tài khoản nhân viên</p>
      </div>

      <form onSubmit={handleSubmit} className="add-staff-form">
        {/* Thông tin cơ bản */}
        <div className="section-title">📋 Thông tin cơ bản</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="staff@tdtu.edu.vn"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mã nhân viên <span className="required">*</span></label>
            <input
              type="text"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              className={errors.staffId ? 'error' : ''}
              placeholder="NV2024001"
            />
            {errors.staffId && <span className="error-text">{errors.staffId}</span>}
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
        </div>

        {/* Thông tin công việc */}
        <div className="section-title">💼 Thông tin công việc</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Loại nhân viên <span className="required">*</span></label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              className={errors.staffType ? 'error' : ''}
            >
              <option value="">-- Chọn loại nhân viên --</option>
              <option value="FULL_TIME">Toàn thời gian</option>
              <option value="PART_TIME">Bán thời gian</option>
              <option value="CONTRACT">Hợp đồng</option>
              <option value="INTERN">Thực tập</option>
            </select>
            {errors.staffType && <span className="error-text">{errors.staffType}</span>}
          </div>

          <div className="form-group">
            <label>Phòng ban <span className="required">*</span></label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'error' : ''}
              placeholder="Phòng Đào tạo"
            />
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label>Chức vụ <span className="required">*</span></label>
            <input
              type="text"
              name="staffRole"
              value={formData.staffRole}
              onChange={handleChange}
              className={errors.staffRole ? 'error' : ''}
              placeholder="Chuyên viên"
            />
            {errors.staffRole && <span className="error-text">{errors.staffRole}</span>}
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Đang làm việc</option>
              <option value="INACTIVE">Tạm nghỉ</option>
              <option value="RESIGNED">Đã nghỉ việc</option>
              <option value="SUSPENDED">Đình chỉ</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary" disabled={submitting}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Đang thêm...' : 'Thêm nhân viên'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;