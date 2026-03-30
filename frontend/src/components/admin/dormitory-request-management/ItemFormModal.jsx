import React, { useState, useEffect } from 'react';
import '../faculty-major-management/FormModal.css';

/**
 * ItemFormModal - Form thêm/sửa thiết bị
 * Pattern giống MajorFormModal với batch mode entry-card
 * 
 * Props:
 *   - isOpen: boolean
 *   - onClose: function
 *   - onSubmit: function(data) - single item submit (edit mode)
 *   - onBatchSubmit: function(categoryId, items) - batch submit (add mode)
 *   - editingItem: object | null
 *   - categories: array - danh sách danh mục để chọn
 *   - preSelectedCategoryId: string | null - danh mục được chọn sẵn
 */
const ItemFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onBatchSubmit,
  editingItem = null, 
  categories = [],
  preSelectedCategoryId = null
}) => {
  // Single item state (for editing)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  });

  // Batch entries state (for adding)
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [itemEntries, setItemEntries] = useState([
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

      if (editingItem) {
        // Edit mode - single form
        setFormData({
          name: editingItem.name || '',
          category: editingItem.category?._id || editingItem.category || '',
          description: editingItem.description || ''
        });
      } else {
        // Add mode - batch form
        setFormData({ name: '', category: '', description: '' });
        setSelectedCategoryId(preSelectedCategoryId || '');
        setItemEntries([{ id: generateId(), name: '', description: '' }]);
      }
    }
  }, [isOpen, editingItem, preSelectedCategoryId]);

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
      newErrors.name = 'Tên thiết bị là bắt buộc';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Tên thiết bị phải từ 2-100 ký tự';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Mô tả không được vượt quá 200 ký tự';
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
        category: formData.category,
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
    setItemEntries(prev => 
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
    setItemEntries(prev => [...prev, { id: generateId(), name: '', description: '' }]);
  };

  const removeEntry = (entryId) => {
    if (itemEntries.length === 1) return;
    setItemEntries(prev => prev.filter(entry => entry.id !== entryId));
    
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

    // Validate category
    if (!selectedCategoryId) {
      setErrors({ category: 'Vui lòng chọn danh mục' });
      hasErrors = true;
    } else {
      setErrors({});
    }

    // Validate each entry
    itemEntries.forEach(entry => {
      const errs = {};
      
      if (!entry.name.trim()) {
        errs.name = 'Tên thiết bị là bắt buộc';
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
        const entry = itemEntries[err.entryIndex];
        if (entry) {
          if (!newEntryErrors[entry.id]) {
            newEntryErrors[entry.id] = {};
          }
          newEntryErrors[entry.id][err.field] = err.message;
        }
      });
      setEntryErrors(newEntryErrors);
    } else {
      setGeneralError(error.message || 'Có lỗi xảy ra khi thêm thiết bị');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateAddForm()) return;

    setIsLoading(true);
    try {
      const items = itemEntries.map(entry => ({
        name: entry.name.trim(),
        description: entry.description.trim()
      }));

      await onBatchSubmit(selectedCategoryId, items);
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
    setFormData({ name: '', category: '', description: '' });
    setSelectedCategoryId('');
    setItemEntries([{ id: generateId(), name: '', description: '' }]);
    setErrors({});
    setEntryErrors({});
    setGeneralError('');
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!editingItem;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className={`modal form-modal ${!isEditMode ? 'batch-mode' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</h2>
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
                  <label htmlFor="item-name">
                    Tên thiết bị <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="item-name"
                    name="name"
                    value={formData.name}
                    onChange={handleEditChange}
                    placeholder="Nhập tên thiết bị"
                    disabled={isLoading}
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                {/* Category */}
                <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
                  <label htmlFor="item-category">
                    Danh mục <span className="required">*</span>
                  </label>
                  <select
                    id="item-category"
                    name="category"
                    value={formData.category}
                    onChange={handleEditChange}
                    disabled={isLoading}
                    className={errors.category ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                {/* Description */}
                <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                  <label htmlFor="item-description">Mô tả</label>
                  <textarea
                    id="item-description"
                    name="description"
                    value={formData.description}
                    onChange={handleEditChange}
                    placeholder="Nhập mô tả cho thiết bị..."
                    disabled={isLoading}
                    rows={3}
                    className={errors.description ? 'input-error' : ''}
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                  <span className="char-count">{formData.description.length}/200</span>
                </div>
              </>
            ) : (
              /* === ADD MODE: Batch Form === */
              <>
                {/* Category Selection */}
                <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
                  <label>
                    Danh mục <span className="required">*</span>
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
                    disabled={isLoading}
                    className={errors.category ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                  <span className="field-hint">
                    Tất cả thiết bị bên dưới sẽ thuộc danh mục này
                  </span>
                </div>

                {/* Entries Divider */}
                <div className="entries-divider">
                  <span>Danh sách thiết bị ({itemEntries.length})</span>
                </div>

                {/* Item Entries - Similar to Major Entries */}
                <div className="major-entries">
                  {itemEntries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`entry-card ${entryErrors[entry.id] ? 'has-error' : ''}`}
                    >
                      <div className="entry-header">
                        <span className="entry-number">Thiết bị #{index + 1}</span>
                        {itemEntries.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-entry"
                            onClick={() => removeEntry(entry.id)}
                            disabled={isLoading}
                            title="Xóa thiết bị này"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="entry-fields">
                        {/* Name */}
                        <div className={`form-group ${entryErrors[entry.id]?.name ? 'has-error' : ''}`}>
                          <label>
                            Tên thiết bị <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.name}
                            onChange={(e) => handleEntryChange(entry.id, 'name', e.target.value)}
                            placeholder="Nhập tên thiết bị"
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
                  Thêm thiết bị khác
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
                          {itemEntries.map((entry, index) => {
                            const errors = entryErrors[entry.id];
                            if (!errors || Object.keys(errors).length === 0) return null;
                            return (
                              <li key={entry.id} className="error-item">
                                <strong>Thiết bị #{index + 1}:</strong>
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
                isEditMode ? 'Cập nhật' : `Thêm ${itemEntries.length} thiết bị`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
