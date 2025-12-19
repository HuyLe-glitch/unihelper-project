import React, { useState, useEffect } from 'react';
import '../faculty-major-management/FormModal.css';

/**
 * CertificateFormModal - Form thêm/sửa chứng nhận
 * Pattern giống ItemFormModal với batch mode entry-card
 * 
 * Props:
 *   - isOpen: boolean
 *   - onClose: function
 *   - onSubmit: function(data) - single certificate submit (edit mode)
 *   - onBatchSubmit: function(typeId, certificates) - batch submit (add mode)
 *   - editingCertificate: object | null
 *   - types: array - danh sách loại chứng nhận để chọn
 *   - preSelectedTypeId: string | null - loại được chọn sẵn
 */
const CertificateFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onBatchSubmit,
  editingCertificate = null, 
  types = [],
  preSelectedTypeId = null
}) => {
  // Single certificate state (for editing)
  const [formData, setFormData] = useState({
    name: '',
    certificateType: '',
    description: ''
  });

  // Batch entries state (for adding)
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [certificateEntries, setCertificateEntries] = useState([
    { id: Date.now(), name: '', description: '' }
  ]);

  // Error states
  const [errors, setErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate unique ID for new entries
  const generateId = () => Date.now() + Math.random();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setEntryErrors({});
      setGeneralError('');
      setIsLoading(false);

      if (editingCertificate) {
        // Edit mode - single form
        setFormData({
          name: editingCertificate.name || '',
          certificateType: editingCertificate.certificateType?._id || editingCertificate.certificateType || '',
          description: editingCertificate.description || ''
        });
      } else {
        // Add mode - batch form
        setFormData({ name: '', certificateType: '', description: '' });
        setSelectedTypeId(preSelectedTypeId || '');
        setCertificateEntries([{ id: generateId(), name: '', description: '' }]);
      }
    }
  }, [isOpen, editingCertificate, preSelectedTypeId]);

  // === Edit Mode Handlers ===
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên chứng nhận là bắt buộc';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Tên chứng nhận phải từ 2-100 ký tự';
    }

    if (!formData.certificateType) {
      newErrors.certificateType = 'Vui lòng chọn loại chứng nhận';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        certificateType: formData.certificateType,
        description: formData.description.trim()
      });
      // Success - close modal
      onClose();
    } catch (error) {
      if (error.field) {
        setErrors(prev => ({ ...prev, [error.field]: error.message }));
      } else if (error.response?.data) {
        const { field, message } = error.response.data;
        if (field) {
          setErrors(prev => ({ ...prev, [field]: message }));
        } else {
          setGeneralError(message || 'Có lỗi xảy ra');
        }
      } else {
        setGeneralError(error.message || 'Có lỗi xảy ra');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // === Add Mode (Batch) Handlers ===
  const handleEntryChange = (entryId, field, value) => {
    setCertificateEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );

    // Clear error for this entry/field
    if (entryErrors[entryId]?.[field]) {
      setEntryErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[entryId]) {
          delete newErrors[entryId][field];
          if (Object.keys(newErrors[entryId]).length === 0) {
            delete newErrors[entryId];
          }
        }
        return newErrors;
      });
    }
  };

  const addNewEntry = () => {
    setCertificateEntries(prev => [...prev, { id: generateId(), name: '', description: '' }]);
  };

  const removeEntry = (entryId) => {
    if (certificateEntries.length === 1) return;
    setCertificateEntries(prev => prev.filter(entry => entry.id !== entryId));
    
    // Clear errors for removed entry
    setEntryErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[entryId];
      return newErrors;
    });
  };

  const validateAddForm = () => {
    let hasErrors = false;
    const newEntryErrors = {};

    // Validate type
    if (!selectedTypeId) {
      setErrors({ certificateType: 'Vui lòng chọn loại chứng nhận' });
      hasErrors = true;
    } else {
      setErrors({});
    }

    // Validate each entry
    certificateEntries.forEach(entry => {
      const errs = {};
      
      if (!entry.name.trim()) {
        errs.name = 'Tên chứng nhận là bắt buộc';
        hasErrors = true;
      } else if (entry.name.length < 2) {
        errs.name = 'Tên phải có ít nhất 2 ký tự';
        hasErrors = true;
      }

      if (Object.keys(errs).length > 0) {
        newEntryErrors[entry.id] = errs;
      }
    });

    setEntryErrors(newEntryErrors);
    return !hasErrors;
  };

  const handleBatchApiError = (error) => {
    if (error.errors && Array.isArray(error.errors)) {
      // API returned per-entry errors
      const newEntryErrors = {};
      error.errors.forEach(err => {
        const entry = certificateEntries[err.entryIndex];
        if (entry) {
          if (!newEntryErrors[entry.id]) {
            newEntryErrors[entry.id] = {};
          }
          newEntryErrors[entry.id][err.field] = err.message;
        }
      });
      setEntryErrors(newEntryErrors);
    } else {
      setGeneralError(error.message || 'Có lỗi xảy ra khi thêm chứng nhận');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateAddForm()) return;

    setIsLoading(true);
    try {
      const certificates = certificateEntries.map(entry => ({
        name: entry.name.trim(),
        description: entry.description.trim()
      }));

      await onBatchSubmit(selectedTypeId, certificates);
      // Success - close modal
      onClose();
    } catch (error) {
      handleBatchApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // === Common Handlers ===
  const handleClose = () => {
    if (isLoading) return; // Prevent closing while submitting
    setFormData({ name: '', certificateType: '', description: '' });
    setSelectedTypeId('');
    setCertificateEntries([{ id: generateId(), name: '', description: '' }]);
    setErrors({});
    setEntryErrors({});
    setGeneralError('');
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!editingCertificate;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className={`modal form-modal ${!isEditMode ? 'batch-mode' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditMode ? 'Chỉnh sửa chứng nhận' : 'Thêm chứng nhận mới'}</h2>
        </div>

        <form onSubmit={isEditMode ? handleEditSubmit : handleAddSubmit}>
          <div className="modal-content">
            {/* General Error Banner */}
            {generalError && (
              <div className="error-banner">{generalError}</div>
            )}

            {/* === EDIT MODE: Single Form === */}
            {isEditMode ? (
              <>
                {/* Name */}
                <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="cert-name">
                    Tên chứng nhận <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="cert-name"
                    name="name"
                    value={formData.name}
                    onChange={handleEditChange}
                    placeholder="Nhập tên chứng nhận"
                    disabled={isLoading}
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                {/* Certificate Type */}
                <div className={`form-group ${errors.certificateType ? 'has-error' : ''}`}>
                  <label htmlFor="cert-type">
                    Loại chứng nhận <span className="required">*</span>
                  </label>
                  <select
                    id="cert-type"
                    name="certificateType"
                    value={formData.certificateType}
                    onChange={handleEditChange}
                    disabled={isLoading}
                    className={errors.certificateType ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn loại chứng nhận --</option>
                    {types.map(type => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.certificateType && <span className="error-message">{errors.certificateType}</span>}
                </div>

                {/* Description */}
                <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                  <label htmlFor="cert-description">Mô tả</label>
                  <textarea
                    id="cert-description"
                    name="description"
                    value={formData.description}
                    onChange={handleEditChange}
                    placeholder="Nhập mô tả cho chứng nhận..."
                    disabled={isLoading}
                    rows={3}
                    className={errors.description ? 'input-error' : ''}
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                  <span className="char-count">{formData.description.length}/500</span>
                </div>
              </>
            ) : (
              /* === ADD MODE: Batch Form === */
              <>
                {/* Type Selection */}
                <div className={`form-group ${errors.certificateType ? 'has-error' : ''}`}>
                  <label>
                    Loại chứng nhận <span className="required">*</span>
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => {
                      setSelectedTypeId(e.target.value);
                      if (errors.certificateType) {
                        setErrors(prev => ({ ...prev, certificateType: '' }));
                      }
                    }}
                    disabled={isLoading}
                    className={errors.certificateType ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn loại chứng nhận --</option>
                    {types.map(type => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.certificateType && <span className="error-message">{errors.certificateType}</span>}
                  <span className="field-hint">
                    Tất cả chứng nhận bên dưới sẽ thuộc loại này
                  </span>
                </div>

                {/* Entries Divider */}
                <div className="entries-divider">
                  <span>Danh sách chứng nhận ({certificateEntries.length})</span>
                </div>

                {/* Certificate Entries */}
                <div className="major-entries">
                  {certificateEntries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`entry-card ${entryErrors[entry.id] ? 'has-error' : ''}`}
                    >
                      <div className="entry-header">
                        <span className="entry-number">Chứng nhận #{index + 1}</span>
                        {certificateEntries.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-entry"
                            onClick={() => removeEntry(entry.id)}
                            disabled={isLoading}
                            title="Xóa chứng nhận này"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="entry-fields">
                        {/* Name */}
                        <div className={`form-group ${entryErrors[entry.id]?.name ? 'has-error' : ''}`}>
                          <label>
                            Tên chứng nhận <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.name}
                            onChange={(e) => handleEntryChange(entry.id, 'name', e.target.value)}
                            placeholder="Nhập tên chứng nhận"
                            disabled={isLoading}
                            className={entryErrors[entry.id]?.name ? 'input-error' : ''}
                          />
                          {entryErrors[entry.id]?.name && (
                            <span className="error-message">{entryErrors[entry.id].name}</span>
                          )}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                          <label>Mô tả</label>
                          <textarea
                            value={entry.description}
                            onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                            placeholder="Mô tả (không bắt buộc)"
                            disabled={isLoading}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Entry Button */}
                <button
                  type="button"
                  className="btn-add-entry"
                  onClick={addNewEntry}
                  disabled={isLoading}
                >
                  <span className="btn-icon">+</span>
                  Thêm chứng nhận khác
                </button>

                {/* Error Summary */}
                {(generalError || Object.keys(entryErrors).length > 0) && (
                  <div className="error-summary">
                    <div className="error-summary-header">
                      <span className="error-icon">⚠️</span>
                      <span className="error-title">Có lỗi cần sửa</span>
                    </div>
                    <div className="error-summary-content">
                      {generalError && (
                        <p className="error-general">{generalError}</p>
                      )}
                      {Object.keys(entryErrors).length > 0 && (
                        <ul className="error-list">
                          {certificateEntries.map((entry, index) => {
                            const errors = entryErrors[entry.id];
                            if (!errors || Object.keys(errors).length === 0) return null;
                            return (
                              <li key={entry.id} className="error-item">
                                <strong>Chứng nhận #{index + 1}:</strong>
                                <span>{Object.values(errors).join(', ')}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
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
                isEditMode ? 'Cập nhật' : `Thêm ${certificateEntries.length} chứng nhận`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateFormModal;
