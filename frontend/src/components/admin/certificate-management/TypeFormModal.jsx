import React, { useState, useEffect } from 'react';
import '../faculty-major-management/FormModal.css';

/**
 * TypeFormModal - Form thêm/sửa loại chứng nhận
 */
const TypeFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingType = null
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form khi modal mở/đóng hoặc editingType thay đổi
  useEffect(() => {
    if (isOpen) {
      if (editingType) {
        setFormData({
          name: editingType.name || '',
          description: editingType.description || ''
        });
      } else {
        setFormData({ name: '', description: '' });
      }
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, editingType]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên loại chứng nhận là bắt buộc';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Tên loại chứng nhận phải từ 2-100 ký tự';
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
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      // Success - close modal
      onClose();
    } catch (error) {
      // Handle API errors
      if (error.field === 'name') {
        setErrors({ name: error.message });
      } else if (error.response?.data) {
        const { field, message } = error.response.data;
        if (field) {
          setErrors(prev => ({ ...prev, [field]: message }));
        } else {
          setErrors(prev => ({ ...prev, general: message || 'Có lỗi xảy ra' }));
        }
      } else {
        setErrors({ general: error.message || 'Có lỗi xảy ra' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isLoading) return; // Prevent closing while submitting
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingType ? 'Chỉnh sửa loại chứng nhận' : 'Thêm loại chứng nhận mới'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {/* General error */}
            {errors.general && (
              <div className="error-banner">{errors.general}</div>
            )}

            {/* Name field */}
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="type-name">
                Tên loại chứng nhận <span className="required">*</span>
              </label>
              <input
                type="text"
                id="type-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên loại (VD: Chứng nhận học vụ)"
                disabled={isLoading}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Description field */}
            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label htmlFor="type-description">Mô tả</label>
              <textarea
                id="type-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả cho loại chứng nhận..."
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
                editingType ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TypeFormModal;
