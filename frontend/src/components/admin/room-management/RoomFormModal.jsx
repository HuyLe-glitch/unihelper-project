import React, { useState, useEffect } from 'react';
import { roomService } from '../../../services/room';
import './RoomFormModal.css';

/**
 * RoomFormModal - Form tạo/chỉnh sửa phòng KTX
 * 
 * Props:
 * - isOpen: boolean - Hiển thị modal
 * - onClose: function - Đóng modal
 * - onSuccess: function - Callback khi tạo/cập nhật thành công
 * - editingItem: object | null - Nếu có thì là chế độ edit
 */
const RoomFormModal = ({ isOpen, onClose, onSuccess, editingItem = null }) => {
  // Form data - Chỉ giữ các trường cơ bản
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    description: ''
  });

  // Error states - Hiển thị inline errors
  const [errors, setErrors] = useState({
    name: '',
    capacity: '',
    general: ''
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Chế độ Edit
        setFormData({
          name: editingItem.name || '',
          capacity: editingItem.capacity || 4,
          description: editingItem.description || ''
        });
      } else {
        // Chế độ Create
        setFormData({
          name: '',
          capacity: 4,
          description: ''
        });
      }
      setErrors({ name: '', capacity: '', general: '' });
    }
  }, [isOpen, editingItem]);

  const validateForm = () => {
    const newErrors = { name: '', capacity: '', general: '' };
    let isValid = true;

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên phòng';
      isValid = false;
    } else if (formData.name.length > 20) {
      newErrors.name = 'Tên phòng không được vượt quá 20 ký tự';
      isValid = false;
    } else if (!/^[A-Za-z0-9\-_]+$/.test(formData.name)) {
      newErrors.name = 'Tên phòng chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới';
      isValid = false;
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Sức chứa phải ít nhất là 1';
      isValid = false;
    } else if (formData.capacity > 20) {
      newErrors.capacity = 'Sức chứa không được vượt quá 20';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrors({ name: '', capacity: '', general: '' });

      let response;
      if (editingItem) {
        // Update
        response = await roomService.updateRoom(editingItem._id, {
          name: formData.name.trim(),
          capacity: parseInt(formData.capacity),
          description: formData.description.trim()
        });
      } else {
        // Create - không gửi occupied, mặc định = 0
        response = await roomService.createRoom({
          name: formData.name.trim(),
          capacity: parseInt(formData.capacity),
          description: formData.description.trim()
        });
      }

      if (response.success) {
        onSuccess(response.data, editingItem ? 'update' : 'create');
        onClose();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (error) => {
    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.message || 'Đã xảy ra lỗi';
    const errorField = errorResponse?.field;
    const statusCode = error.response?.status;

    // 409 Conflict - Trùng tên phòng
    if (statusCode === 409) {
      if (errorField === 'name') {
        setErrors(prev => ({ ...prev, name: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } else if (errorField === 'name') {
      setErrors(prev => ({ ...prev, name: errorMessage }));
    } else if (errorField === 'capacity') {
      setErrors(prev => ({ ...prev, capacity: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, general: errorMessage }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error khi user bắt đầu sửa
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="room-modal-header">
          <h3 className="room-modal-title">
            {editingItem ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="room-modal-body">
            {/* Error chung */}
            {errors.general && (
              <div className="room-error-banner">
                <span className="error-icon">⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Tên phòng */}
            <div className="room-form-group">
              <label className="room-form-label">
                Tên phòng <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`room-form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: A101, B202"
                maxLength={20}
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="room-error-text">{errors.name}</span>
              )}
            </div>

            {/* Sức chứa */}
            <div className="room-form-group">
              <label className="room-form-label">
                Sức chứa <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`room-form-input ${errors.capacity ? 'has-error' : ''}`}
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                min="1"
                max="20"
                disabled={isSubmitting}
              />
              {errors.capacity && (
                <span className="room-error-text">{errors.capacity}</span>
              )}
            </div>

            {/* Mô tả */}
            <div className="room-form-group">
              <label className="room-form-label">Mô tả</label>
              <textarea
                className="room-form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả thêm về phòng (không bắt buộc)"
                maxLength={500}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="room-modal-footer">
            <button
              type="button"
              className="room-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="room-btn-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : (editingItem ? 'Cập nhật' : 'Thêm phòng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
