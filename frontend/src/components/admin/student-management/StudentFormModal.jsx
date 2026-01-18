import React, { useState, useEffect, useMemo } from 'react';
import SFCustomDropdown from './SFCustomDropdown';
import './StudentFormModal.css';

/**
 * StudentFormModal - Form thêm/sửa Sinh viên
 * Mỗi ô nhập liệu trên 1 dòng riêng
 * 
 * Model Student: fullName, dateOfBirth, phone, email, citizenId, address, major, isDormResident, roomId
 */
const StudentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
  faculties,
  majors,
  availableRooms,
  isLoading
}) => {
  // Form data theo đúng model (Mật khẩu mặc định 123456 - backend tự tạo)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    citizenId: '',
    dateOfBirth: '',
    address: '',
    facultyId: '',
    major: '',
    isDormResident: false,
    roomId: ''
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      if (editingStudent) {
        const facultyId = editingStudent.major?.faculty?._id || 
                          editingStudent.major?.faculty || '';
        
        setFormData({
          fullName: editingStudent.fullName || '',
          email: editingStudent.user?.email || '',
          phone: editingStudent.phone || '',
          citizenId: editingStudent.citizenId || '',
          dateOfBirth: editingStudent.dateOfBirth 
            ? new Date(editingStudent.dateOfBirth).toISOString().split('T')[0] 
            : '',
          address: editingStudent.address || '',
          facultyId: facultyId,
          major: editingStudent.major?._id || '',
          isDormResident: editingStudent.isDormResident || false,
          roomId: editingStudent.roomId?._id || editingStudent.roomId || ''
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          citizenId: '',
          dateOfBirth: '',
          address: '',
          facultyId: '',
          major: '',
          isDormResident: false,
          roomId: ''
        });
      }
      setErrors({});
      setGeneralError('');
    }
  }, [isOpen, editingStudent]);

  // Lọc chuyên ngành theo khoa - BẮT BUỘC chọn khoa trước
  const filteredMajors = useMemo(() => {
    if (!formData.facultyId) return []; // Phải chọn khoa trước mới hiện chuyên ngành
    return majors.filter(major => {
      const majorFacultyId = major.faculty?._id || major.faculty;
      return majorFacultyId === formData.facultyId;
    });
  }, [majors, formData.facultyId]);

  // Khi thay đổi khoa, reset chuyên ngành
  useEffect(() => {
    if (formData.facultyId && formData.major) {
      const majorInFaculty = filteredMajors.find(m => m._id === formData.major);
      if (!majorInFaculty) {
        setFormData(prev => ({ ...prev, major: '' }));
      }
    }
  }, [formData.facultyId, filteredMajors]);

  // Khi tắt isDormResident, reset roomId
  useEffect(() => {
    if (!formData.isDormResident) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  }, [formData.isDormResident]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (!formData.facultyId) {
      newErrors.facultyId = 'Khoa là bắt buộc';
    }

    if (!editingStudent) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      }
    }

    // Số điện thoại bắt buộc
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.citizenId.trim()) {
      newErrors.citizenId = 'CCCD là bắt buộc';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.major) {
      newErrors.major = 'Chuyên ngành là bắt buộc';
    }

    if (formData.isDormResident && !formData.roomId) {
      newErrors.roomId = 'Phải chọn phòng KTX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    try {
      const submitData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        citizenId: formData.citizenId.trim(),
        dateOfBirth: formData.dateOfBirth,
        address: formData.address.trim(),
        major: formData.major,
        isDormResident: formData.isDormResident,
        roomId: formData.isDormResident ? formData.roomId : null
      };

      // Mật khẩu mặc định 123456 - backend tự tạo

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        setGeneralError(error.message || 'Có lỗi xảy ra');
      } else if (error.field) {
        setErrors(prev => ({ ...prev, [error.field]: error.message }));
      } else {
        setGeneralError(error.message || 'Có lỗi xảy ra');
      }
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!editingStudent;
  const modalTitle = isEditMode ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal batch-mode" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="modal-header">
            <h2>{modalTitle}</h2>
          </div>

          {/* Content - Có scroll */}
          <div className="modal-content">
            {generalError && (
              <div className="error-banner">{generalError}</div>
            )}

            {/* Họ và tên */}
            <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
              <label>
                Họ và tên <span className="required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              {isEditMode && <span className="field-hint">Không được phép sửa tên</span>}
            </div>

            {/* Email */}
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="email@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
              {!isEditMode && (
                <span className="field-hint">Mật khẩu mặc định: 123456</span>
              )}
            </div>

            {/* Số điện thoại + CCCD trên cùng 1 hàng */}
            <div className="form-row">
              {/* Số điện thoại */}
              <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="VD: 0901234567"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              {/* CCCD */}
              <div className={`form-group ${errors.citizenId ? 'has-error' : ''}`}>
                <label>
                  CCCD <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="citizenId"
                  value={formData.citizenId}
                  onChange={handleChange}
                  placeholder="Số CCCD 12 chữ số"
                />
                {errors.citizenId && <span className="error-message">{errors.citizenId}</span>}
              </div>
            </div>

            {/* Ngày sinh */}
            <div className={`form-group ${errors.dateOfBirth ? 'has-error' : ''}`}>
              <label>
                Ngày sinh <span className="required">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            {/* Địa chỉ */}
            <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
              <label>
                Địa chỉ <span className="required">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ thường trú"
                rows="2"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            {/* Khoa - BẮT BUỘC */}
            <div className={`form-group ${errors.facultyId ? 'has-error' : ''}`}>
              <label>
                Khoa <span className="required">*</span>
              </label>
              <SFCustomDropdown
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                placeholder="-- Chọn khoa --"
                hasError={!!errors.facultyId}
                options={faculties.map(faculty => ({
                  value: faculty._id,
                  label: faculty.name
                }))}
              />
              {errors.facultyId && <span className="error-message">{errors.facultyId}</span>}
            </div>

            {/* Chuyên ngành - Phải chọn Khoa trước */}
            <div className={`form-group ${errors.major ? 'has-error' : ''}`}>
              <label>
                Chuyên ngành <span className="required">*</span>
              </label>
              <SFCustomDropdown
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder={!formData.facultyId ? '-- Vui lòng chọn Khoa trước --' : '-- Chọn chuyên ngành --'}
                disabled={!formData.facultyId}
                hasError={!!errors.major}
                options={filteredMajors.map(major => ({
                  value: major._id,
                  label: major.name
                }))}
              />
              {errors.major && <span className="error-message">{errors.major}</span>}
            </div>

            {/* Ở KTX */}
            <div className="form-group form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDormResident"
                  checked={formData.isDormResident}
                  onChange={handleChange}
                />
                Ở ký túc xá
              </label>
            </div>

            {/* Phòng KTX */}
            {formData.isDormResident && (
              <div className={`form-group ${errors.roomId ? 'has-error' : ''}`}>
                <label>
                  Phòng KTX <span className="required">*</span>
                </label>
                <SFCustomDropdown
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  placeholder="-- Chọn phòng --"
                  hasError={!!errors.roomId}
                  options={availableRooms.map(room => ({
                    value: room._id,
                    label: `${room.name} (Còn ${room.available} chỗ)`
                  }))}
                />
                {errors.roomId && <span className="error-message">{errors.roomId}</span>}
                {availableRooms.length === 0 && (
                  <span className="field-hint" style={{ color: '#e53e3e' }}>
                    Không có phòng nào còn chỗ trống
                  </span>
                )}
              </div>
            )}

            {/* Error Summary - Tổng hợp lỗi ở cuối form */}
            {Object.keys(errors).length > 0 && (
              <div className="error-summary">
                <div className="error-summary-header">
                  <span className="error-icon">⚠️</span>
                  <span>Có {Object.keys(errors).length} lỗi cần sửa:</span>
                </div>
                <ul className="error-summary-list">
                  {errors.fullName && <li>• Họ và tên: {errors.fullName}</li>}
                  {errors.email && <li>• Email: {errors.email}</li>}
                  {errors.password && <li>• Mật khẩu: {errors.password}</li>}
                  {errors.citizenId && <li>• CCCD: {errors.citizenId}</li>}
                  {errors.dateOfBirth && <li>• Ngày sinh: {errors.dateOfBirth}</li>}
                  {errors.address && <li>• Địa chỉ: {errors.address}</li>}
                  {errors.facultyId && <li>• Khoa: {errors.facultyId}</li>}
                  {errors.major && <li>• Chuyên ngành: {errors.major}</li>}
                  {errors.roomId && <li>• Phòng KTX: {errors.roomId}</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner"></span>}
              {isEditMode ? 'Cập nhật' : 'Thêm sinh viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
