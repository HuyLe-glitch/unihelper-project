import React, { useState, useEffect, useMemo } from 'react';
import { semesterService, semesterTemplateService } from '../../../services/semester';
import './SemesterModal.css';

/**
 * SemesterModal - Form tạo/chỉnh sửa học kỳ
 * 
 * Props:
 * - isOpen: boolean - Hiển thị modal
 * - onClose: function - Đóng modal
 * - onSuccess: function - Callback khi tạo/cập nhật thành công
 * - editingItem: object | null - Nếu có thì là chế độ edit
 */
const SemesterModal = ({ isOpen, onClose, onSuccess, editingItem = null }) => {
  // Templates từ API
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  // Form data
  const [formData, setFormData] = useState({
    templateId: '',
    year: new Date().getFullYear(),
    name: '',
    isActive: false,
    note: ''
  });
  
  // Preview data từ backend
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Error states - Hiển thị inline errors
  const [errors, setErrors] = useState({
    templateId: '',
    year: '',
    name: '',
    duplicate: ''
  });
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load templates khi mở modal
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      
      // Reset form khi mở modal
      if (editingItem) {
        // Chế độ Edit
        setFormData({
          templateId: editingItem.templateId?._id || editingItem.templateId || '',
          year: editingItem.year,
          name: editingItem.name,
          isActive: editingItem.isActive,
          note: editingItem.note || ''
        });
      } else {
        // Chế độ Create
        setFormData({
          templateId: '',
          year: new Date().getFullYear(),
          name: '',
          isActive: false,
          note: ''
        });
      }
      setPreviewData(null);
      setErrors({ templateId: '', year: '', name: '', duplicate: '' });
    }
  }, [isOpen, editingItem]);

  // Load preview khi chọn template và năm
  useEffect(() => {
    if (formData.templateId && formData.year && !editingItem) {
      loadPreview();
    } else {
      setPreviewData(null);
    }
  }, [formData.templateId, formData.year, editingItem]);

  // Auto-generate name từ preview - Luôn cập nhật khi preview thay đổi (trừ edit mode)
  useEffect(() => {
    if (previewData && !editingItem) {
      // Format: "HK1 (2025-2026)" thay vì "Học kỳ 1 (2025-2026)"
      const suggestedName = `${previewData.templateCode} (${previewData.academicYear})`;
      setFormData(prev => ({ ...prev, name: suggestedName }));
    }
  }, [previewData, editingItem]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await semesterTemplateService.getAllTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Lỗi load templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      setErrors(prev => ({ ...prev, duplicate: '' }));
      
      const response = await semesterService.previewDates(formData.templateId, formData.year);
      if (response.success) {
        setPreviewData(response.data);
      }
    } catch (error) {
      console.error('Lỗi load preview:', error);
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const validateForm = () => {
    const newErrors = { templateId: '', year: '', name: '', duplicate: '' };
    let isValid = true;

    if (!formData.templateId && !editingItem) {
      newErrors.templateId = 'Vui lòng chọn mẫu học kỳ';
      isValid = false;
    }

    if (!formData.year) {
      newErrors.year = 'Vui lòng nhập năm';
      isValid = false;
    } else if (formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Năm phải từ 2000 đến 2100';
      isValid = false;
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên học kỳ';
      isValid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên học kỳ không được vượt quá 100 ký tự';
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
      setErrors({ templateId: '', year: '', name: '', duplicate: '' });

      let response;
      if (editingItem) {
        // Update - chỉ gửi các field được phép update
        response = await semesterService.updateSemester(editingItem._id, {
          name: formData.name.trim(),
          isActive: formData.isActive,
          note: formData.note.trim()
        });
      } else {
        // Create
        response = await semesterService.createSemester({
          templateId: formData.templateId,
          year: parseInt(formData.year),
          name: formData.name.trim(),
          isActive: formData.isActive,
          note: formData.note.trim()
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

    // 409 Conflict - Trùng dữ liệu
    if (statusCode === 409) {
      if (errorField === 'name') {
        setErrors(prev => ({ ...prev, name: errorMessage }));
      } else if (errorField === 'duplicate') {
        // Trùng cặp {templateId, year}
        const existingSemester = errorResponse?.existingSemester;
        let duplicateMessage = errorMessage;
        if (existingSemester) {
          duplicateMessage = `Học kỳ "${existingSemester.templateName}" năm ${existingSemester.year} đã tồn tại với tên: "${existingSemester.name}"`;
        }
        setErrors(prev => ({ ...prev, duplicate: duplicateMessage }));
      } else {
        setErrors(prev => ({ ...prev, duplicate: errorMessage }));
      }
    } else if (errorField === 'templateId') {
      setErrors(prev => ({ ...prev, templateId: errorMessage }));
    } else if (errorField === 'year') {
      setErrors(prev => ({ ...prev, year: errorMessage }));
    } else {
      // Lỗi chung
      setErrors(prev => ({ ...prev, duplicate: errorMessage }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error khi user bắt đầu sửa
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear duplicate error khi thay đổi template hoặc năm
    if (field === 'templateId' || field === 'year') {
      setErrors(prev => ({ ...prev, duplicate: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="semester-modal-overlay" onClick={onClose}>
      <div className="semester-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="semester-modal-header">
          <h3 className="semester-modal-title">
            {editingItem ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="semester-modal-body">
            {/* Error chung - Duplicate */}
            {errors.duplicate && (
              <div className="semester-error-banner">
                <span className="error-icon">⚠️</span>
                <span>{errors.duplicate}</span>
              </div>
            )}

            {/* Template Selection - Chỉ hiển thị khi Create */}
            {!editingItem && (
              <div className="semester-form-group">
                <label className="semester-form-label">
                  Chọn mẫu học kỳ (Template) <span className="required">*</span>
                </label>
                <select
                  className={`semester-form-select ${errors.templateId ? 'has-error' : ''}`}
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  disabled={loadingTemplates || isSubmitting}
                >
                  <option value="">-- Chọn mẫu --</option>
                  {templates.map(template => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.code})
                    </option>
                  ))}
                </select>
                {errors.templateId && (
                  <span className="semester-error-text">{errors.templateId}</span>
                )}
              </div>
            )}

            {/* Year Input */}
            <div className="semester-form-group">
              <label className="semester-form-label">
                Năm bắt đầu <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`semester-form-input ${errors.year ? 'has-error' : ''}`}
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                min="2000"
                max="2100"
                disabled={editingItem || isSubmitting}
              />
              {errors.year && (
                <span className="semester-error-text">{errors.year}</span>
              )}
              {editingItem && (
                <span className="semester-hint-text">Không thể thay đổi năm khi chỉnh sửa</span>
              )}
            </div>

            {/* Preview Section - Hiển thị thời gian bắt đầu/kết thúc */}
            {loadingPreview && (
              <div className="semester-preview-loading">
                <span>Đang tải thông tin...</span>
              </div>
            )}
            
            {previewData && !editingItem && (
              <div className="semester-preview-section">
                <h4 className="semester-preview-title">Thông tin thời gian học kỳ</h4>
                <div className="semester-preview-grid">
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Năm học:</span>
                    <span className="semester-preview-value">{previewData.academicYear}</span>
                  </div>
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Ngày bắt đầu:</span>
                    <span className="semester-preview-value highlight">{previewData.startDateFormatted}</span>
                  </div>
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Ngày kết thúc:</span>
                    <span className="semester-preview-value highlight">{previewData.endDateFormatted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị thời gian khi edit */}
            {editingItem && (
              <div className="semester-preview-section">
                <h4 className="semester-preview-title">Thông tin thời gian</h4>
                <div className="semester-preview-grid">
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Năm học:</span>
                    <span className="semester-preview-value">{editingItem.academicYear}</span>
                  </div>
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Ngày bắt đầu:</span>
                    <span className="semester-preview-value highlight">
                      {new Date(editingItem.startDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="semester-preview-item">
                    <span className="semester-preview-label">Ngày kết thúc:</span>
                    <span className="semester-preview-value highlight">
                      {new Date(editingItem.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="semester-form-group">
              <label className="semester-form-label">
                Tên học kỳ <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`semester-form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: Học kỳ 1 (2024-2025)"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="semester-error-text">{errors.name}</span>
              )}
            </div>

            {/* Note Input */}
            <div className="semester-form-group">
              <label className="semester-form-label">Ghi chú</label>
              <textarea
                className="semester-form-textarea"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Ghi chú thêm (không bắt buộc)"
                maxLength={500}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Active Checkbox */}
            <div className="semester-form-group semester-checkbox-group">
              <label className="semester-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="semester-checkbox-input"
                  disabled={isSubmitting}
                />
                <span className="semester-checkbox-text">
                  Kích hoạt ngay học kỳ này
                </span>
              </label>
              <span className="semester-hint-text">
                Nếu chọn, học kỳ khác đang active sẽ bị tắt
              </span>
            </div>
          </div>

          <div className="semester-modal-footer">
            <button 
              type="button" 
              className="semester-btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="semester-btn-save"
              disabled={isSubmitting || loadingTemplates}
            >
              {isSubmitting ? 'Đang xử lý...' : (editingItem ? 'Cập nhật' : 'Tạo học kỳ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SemesterModal;
