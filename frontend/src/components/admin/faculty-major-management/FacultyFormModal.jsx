import React, { useState, useEffect } from 'react';
import './FormModal.css';

/**
 * FacultyFormModal - Form thêm/sửa Khoa
 * Reusable component cho cả Add và Edit
 */
const FacultyFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingFaculty, 
  isLoading 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Error state cho inline validation
  const [errors, setErrors] = useState({});

  // Reset form khi modal mở/đóng hoặc editingFaculty thay đổi
  useEffect(() => {
    if (isOpen) {
      if (editingFaculty) {
        setFormData({
          name: editingFaculty.name || '',
          code: editingFaculty.code || '',
          description: editingFaculty.description || ''
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingFaculty]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên khoa là bắt buộc';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Tên khoa phải từ 2-100 ký tự';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã khoa là bắt buộc';
    } else if (formData.code.length < 2 || formData.code.length > 10) {
      newErrors.code = 'Mã khoa phải từ 2-10 ký tự';
    } else if (!/^[A-Za-z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Mã khoa chỉ chứa chữ cái và số';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data (uppercase code)
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase()
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      // Handle API errors and display inline
      if (error.response?.data) {
        const { field, message, errors: apiErrors } = error.response.data;
        
        if (field) {
          // Single field error from service
          setErrors(prev => ({ ...prev, [field]: message }));
        } else if (apiErrors && Array.isArray(apiErrors)) {
          // Multiple validation errors
          const newErrors = {};
          apiErrors.forEach(err => {
            newErrors[err.field] = err.message;
          });
          setErrors(prev => ({ ...prev, ...newErrors }));
        } else {
          // Generic error
          setErrors(prev => ({ ...prev, general: message || 'Có lỗi xảy ra' }));
        }
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({ name: '', code: '', description: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingFaculty ? 'Chỉnh sửa Khoa' : 'Thêm Khoa mới'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {/* General error */}
            {errors.general && (
              <div className="error-banner">{errors.general}</div>
            )}

            {/* Name field */}
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">
                Tên khoa <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên khoa (VD: Khoa Công nghệ Thông tin)"
                disabled={isLoading}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Code field */}
            <div className={`form-group ${errors.code ? 'has-error' : ''}`}>
              <label htmlFor="code">
                Mã khoa <span className="required">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Nhập mã khoa (VD: CNTT)"
                disabled={isLoading}
                className={errors.code ? 'input-error' : ''}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <span className="error-message">{errors.code}</span>}
            </div>

            {/* Description field */}
            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả về khoa..."
                disabled={isLoading}
                rows={3}
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              <span className="char-count">{formData.description.length}/500</span>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Đang xử lý...
                </>
              ) : (
                editingFaculty ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyFormModal;
