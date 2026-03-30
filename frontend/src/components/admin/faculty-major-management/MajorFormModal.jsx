import React, { useState, useEffect } from 'react';
import './FormModal.css';

/**
 * MajorFormModal - Form thêm/sửa Chuyên ngành
 * Hỗ trợ thêm hàng loạt chuyên ngành (batch add)
 * Khi Edit: chỉ sửa 1 chuyên ngành
 * Khi Add: có thể thêm nhiều chuyên ngành cùng lúc
 * 
 * Business Logic (batch validation, duplicate check) được xử lý ở Backend
 * Frontend chỉ validate cơ bản (required fields, format) và gọi API
 */
const MajorFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingMajor,
  faculties,
  isLoading,
  preSelectedFacultyId 
}) => {
  // Khoa được chọn (dùng chung cho tất cả chuyên ngành khi thêm mới)
  const [selectedFaculty, setSelectedFaculty] = useState('');
  
  // Danh sách các chuyên ngành để thêm (batch mode)
  const [majorEntries, setMajorEntries] = useState([
    { id: 1, name: '', code: '', description: '' }
  ]);

  // Form data cho chế độ edit (1 chuyên ngành)
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    description: ''
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState({}); // { entryId: { field: message } }
  const [generalError, setGeneralError] = useState('');

  // Reset form khi modal mở/đóng hoặc editingMajor thay đổi
  useEffect(() => {
    if (isOpen) {
      if (editingMajor) {
        // Chế độ Edit: load dữ liệu chuyên ngành
        setEditFormData({
          name: editingMajor.name || '',
          code: editingMajor.code || '',
          faculty: editingMajor.faculty?._id || editingMajor.faculty || '',
          description: editingMajor.description || ''
        });
        setSelectedFaculty('');
        setMajorEntries([{ id: 1, name: '', code: '', description: '' }]);
      } else {
        // Chế độ Add: reset form, set preSelectedFacultyId nếu có
        setSelectedFaculty(preSelectedFacultyId || '');
        setMajorEntries([{ id: 1, name: '', code: '', description: '' }]);
        setEditFormData({ name: '', code: '', faculty: '', description: '' });
      }
      setErrors({});
      setEntryErrors({});
      setGeneralError('');
    }
  }, [isOpen, editingMajor, preSelectedFacultyId]);

  // ============ EDIT MODE HANDLERS ============
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ============ ADD MODE HANDLERS ============
  
  // Thay đổi khoa
  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
    if (errors.faculty) {
      setErrors(prev => ({ ...prev, faculty: '' }));
    }
  };

  // Thay đổi field của entry
  const handleEntryChange = (entryId, field, value) => {
    setMajorEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );
    
    // Clear error for this entry field
    if (entryErrors[entryId]?.[field]) {
      setEntryErrors(prev => ({
        ...prev,
        [entryId]: { ...prev[entryId], [field]: '' }
      }));
    }
  };

  // Thêm entry mới
  const addNewEntry = () => {
    const newId = Math.max(...majorEntries.map(e => e.id)) + 1;
    setMajorEntries(prev => [
      ...prev,
      { id: newId, name: '', code: '', description: '' }
    ]);
  };

  // Xóa entry
  const removeEntry = (entryId) => {
    if (majorEntries.length <= 1) return;
    setMajorEntries(prev => prev.filter(entry => entry.id !== entryId));
    setEntryErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[entryId];
      return newErrors;
    });
  };

  // ============ VALIDATION ============
  
  // Validate cho chế độ Edit
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editFormData.name.trim()) {
      newErrors.name = 'Tên chuyên ngành là bắt buộc';
    } else if (editFormData.name.length < 2 || editFormData.name.length > 100) {
      newErrors.name = 'Tên chuyên ngành phải từ 2-100 ký tự';
    }

    if (!editFormData.code.trim()) {
      newErrors.code = 'Mã chuyên ngành là bắt buộc';
    } else if (editFormData.code.length < 2 || editFormData.code.length > 10) {
      newErrors.code = 'Mã chuyên ngành phải từ 2-10 ký tự';
    } else if (!/^[A-Za-z0-9]+$/.test(editFormData.code)) {
      newErrors.code = 'Mã chuyên ngành chỉ chứa chữ cái và số';
    }

    if (!editFormData.faculty) {
      newErrors.faculty = 'Vui lòng chọn khoa';
    }

    if (editFormData.description && editFormData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate cho chế độ Add (batch)
  const validateAddForm = () => {
    const newErrors = {};
    const newEntryErrors = {};
    let hasError = false;

    // Validate khoa
    if (!selectedFaculty) {
      newErrors.faculty = 'Vui lòng chọn khoa';
      hasError = true;
    }

    // Validate từng entry
    const codeMap = {}; // { code: entryId } - để kiểm tra trùng lặp
    const nameMap = {}; // { name: entryId } - để kiểm tra trùng lặp

    majorEntries.forEach((entry, index) => {
      const entryError = {};
      const entryNumber = index + 1;

      // Validate name
      if (!entry.name.trim()) {
        entryError.name = 'Tên chuyên ngành là bắt buộc';
        hasError = true;
      } else if (entry.name.length < 2 || entry.name.length > 100) {
        entryError.name = 'Tên chuyên ngành phải từ 2-100 ký tự';
        hasError = true;
      } else {
        // Kiểm tra trùng tên với các entry khác
        const normalizedName = entry.name.trim().toLowerCase();
        if (nameMap[normalizedName] !== undefined) {
          const duplicateEntryNum = nameMap[normalizedName];
          entryError.name = `Trùng tên với chuyên ngành #${duplicateEntryNum}`;
          hasError = true;
        } else {
          nameMap[normalizedName] = entryNumber;
        }
      }

      // Validate code
      if (!entry.code.trim()) {
        entryError.code = 'Mã chuyên ngành là bắt buộc';
        hasError = true;
      } else if (entry.code.length < 2 || entry.code.length > 10) {
        entryError.code = 'Mã chuyên ngành phải từ 2-10 ký tự';
        hasError = true;
      } else if (!/^[A-Za-z0-9]+$/.test(entry.code)) {
        entryError.code = 'Mã chuyên ngành chỉ chứa chữ cái và số';
        hasError = true;
      } else {
        // Kiểm tra trùng mã với các entry khác
        const normalizedCode = entry.code.trim().toUpperCase();
        if (codeMap[normalizedCode] !== undefined) {
          const duplicateEntryNum = codeMap[normalizedCode];
          entryError.code = `Trùng mã với chuyên ngành #${duplicateEntryNum}`;
          hasError = true;
        } else {
          codeMap[normalizedCode] = entryNumber;
        }
      }

      // Validate description
      if (entry.description && entry.description.length > 75) {
        entryError.description = 'Mô tả không được vượt quá 75 ký tự';
        hasError = true;
      }

      if (Object.keys(entryError).length > 0) {
        newEntryErrors[entry.id] = entryError;
      }
    });

    setErrors(newErrors);
    setEntryErrors(newEntryErrors);
    return !hasError;
  };

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (editingMajor) {
      // Chế độ Edit - validate và gọi API update
      if (!validateEditForm()) return;

      const submitData = {
        ...editFormData,
        code: editFormData.code.toUpperCase()
      };

      try {
        await onSubmit(submitData);
      } catch (error) {
        handleApiError(error);
      }
    } else {
      // Chế độ Add (batch) - CHỈ validate client-side cơ bản
      // Business logic (kiểm tra trùng DB, atomic insert) do Backend xử lý
      if (!validateAddForm()) {
        return;
      }

      // Chuẩn bị dữ liệu cho batch API
      const majorsData = majorEntries.map(entry => ({
        name: entry.name.trim(),
        code: entry.code.trim().toUpperCase(),
        description: entry.description?.trim() || ''
      }));

      try {
        // Gọi 1 API duy nhất - toàn bộ logic batch ở Backend
        await onSubmit({
          faculty: selectedFaculty,
          majors: majorsData,
          isBatch: true  // Flag để parent component biết đây là batch
        });
      } catch (error) {
        handleBatchApiError(error);
      }
    }
  };

  // Handle API errors cho Edit mode
  const handleApiError = (error) => {
    if (error.response?.data) {
      const { field, message, errors: apiErrors } = error.response.data;
      
      if (field) {
        setErrors(prev => ({ ...prev, [field]: message }));
      } else if (apiErrors && Array.isArray(apiErrors)) {
        const newErrors = {};
        apiErrors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      } else {
        setGeneralError(message || 'Có lỗi xảy ra');
      }
    } else {
      setGeneralError('Có lỗi xảy ra khi kết nối server');
    }
  };

  // Handle API errors cho Batch mode - Backend trả về errors theo format chuẩn
  const handleBatchApiError = (error) => {
    if (error.response?.data) {
      const { message, errors: apiErrors } = error.response.data;
      
      if (apiErrors && Array.isArray(apiErrors)) {
        // Backend trả về { errors: [{ entryIndex, field, message }] }
        const newEntryErrors = {};
        
        apiErrors.forEach(err => {
          const entryId = majorEntries[err.entryIndex]?.id;
          if (entryId) {
            if (!newEntryErrors[entryId]) {
              newEntryErrors[entryId] = {};
            }
            newEntryErrors[entryId][err.field] = err.message;
          }
        });
        
        setEntryErrors(prev => ({ ...prev, ...newEntryErrors }));
        setGeneralError(message || 'Có lỗi trong danh sách chuyên ngành');
      } else {
        setGeneralError(message || 'Có lỗi xảy ra');
      }
    } else {
      setGeneralError('Có lỗi xảy ra khi kết nối server');
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedFaculty('');
    setMajorEntries([{ id: 1, name: '', code: '', description: '' }]);
    setEditFormData({ name: '', code: '', faculty: '', description: '' });
    setErrors({});
    setEntryErrors({});
    setGeneralError('');
    onClose();
  };

  if (!isOpen) return null;

  // ============ RENDER ============
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className={`modal form-modal ${!editingMajor ? 'batch-mode' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{editingMajor ? 'Chỉnh sửa Chuyên ngành' : 'Thêm Chuyên ngành mới'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {/* General error - chỉ hiện cho Edit mode */}
            {editingMajor && generalError && (
              <div className="error-banner">{generalError}</div>
            )}

            {editingMajor ? (
              // ============ EDIT MODE ============
              <>
                {/* Faculty select */}
                <div className={`form-group ${errors.faculty ? 'has-error' : ''}`}>
                  <label htmlFor="faculty">
                    Khoa <span className="required">*</span>
                  </label>
                  <select
                    id="faculty"
                    name="faculty"
                    value={editFormData.faculty}
                    onChange={handleEditChange}
                    disabled={isLoading}
                    className={errors.faculty ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn khoa --</option>
                    {faculties.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.code})
                      </option>
                    ))}
                  </select>
                  {errors.faculty && <span className="error-message">{errors.faculty}</span>}
                </div>

                {/* Name field */}
                <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">
                    Tên chuyên ngành <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    placeholder="Nhập tên chuyên ngành (VD: Công nghệ Phần mềm)"
                    disabled={isLoading}
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                {/* Code field */}
                <div className={`form-group ${errors.code ? 'has-error' : ''}`}>
                  <label htmlFor="code">
                    Mã chuyên ngành <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={editFormData.code}
                    onChange={handleEditChange}
                    placeholder="Nhập mã chuyên ngành (VD: CNPM)"
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
                    value={editFormData.description}
                    onChange={handleEditChange}
                    placeholder="Nhập mô tả về chuyên ngành..."
                    disabled={isLoading}
                    rows={3}
                    className={errors.description ? 'input-error' : ''}
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                  <span className="char-count">{editFormData.description.length}/500</span>
                </div>
              </>
            ) : (
              // ============ ADD MODE (BATCH) ============
              <>
                {/* Faculty select - ở đầu, dùng chung cho tất cả */}
                <div className={`form-group ${errors.faculty ? 'has-error' : ''}`}>
                  <label htmlFor="faculty">
                    Chọn Khoa <span className="required">*</span>
                  </label>
                  <select
                    id="faculty"
                    value={selectedFaculty}
                    onChange={handleFacultyChange}
                    disabled={isLoading}
                    className={errors.faculty ? 'input-error' : ''}
                  >
                    <option value="">-- Chọn khoa --</option>
                    {faculties.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.code})
                      </option>
                    ))}
                  </select>
                  {errors.faculty && <span className="error-message">{errors.faculty}</span>}
                  <span className="field-hint">Tất cả chuyên ngành bên dưới sẽ thuộc khoa này</span>
                </div>

                <div className="entries-divider">
                  <span>Danh sách chuyên ngành ({majorEntries.length})</span>
                </div>

                {/* Danh sách các entries */}
                <div className="major-entries">
                  {majorEntries.map((entry, index) => (
                    <div key={entry.id} className="entry-card">
                      <div className="entry-header">
                        <span className="entry-number">Chuyên ngành #{index + 1}</span>
                        {majorEntries.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-entry"
                            onClick={() => removeEntry(entry.id)}
                            disabled={isLoading}
                            title="Xóa chuyên ngành này"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="entry-fields">
                        {/* Name */}
                        <div className={`form-group ${entryErrors[entry.id]?.name ? 'has-error' : ''}`}>
                          <label>
                            Tên chuyên ngành <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.name}
                            onChange={(e) => handleEntryChange(entry.id, 'name', e.target.value)}
                            placeholder="VD: Công nghệ Phần mềm"
                            disabled={isLoading}
                            className={entryErrors[entry.id]?.name ? 'input-error' : ''}
                          />
                          {entryErrors[entry.id]?.name && (
                            <span className="error-message">{entryErrors[entry.id].name}</span>
                          )}
                        </div>

                        {/* Code */}
                        <div className={`form-group ${entryErrors[entry.id]?.code ? 'has-error' : ''}`}>
                          <label>
                            Mã chuyên ngành <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.code}
                            onChange={(e) => handleEntryChange(entry.id, 'code', e.target.value)}
                            placeholder="VD: CNPM"
                            disabled={isLoading}
                            className={entryErrors[entry.id]?.code ? 'input-error' : ''}
                            style={{ textTransform: 'uppercase' }}
                          />
                          {entryErrors[entry.id]?.code && (
                            <span className="error-message">{entryErrors[entry.id].code}</span>
                          )}
                        </div>

                        {/* Description */}
                        <div className={`form-group ${entryErrors[entry.id]?.description ? 'has-error' : ''}`}>
                          <label>Mô tả</label>
                          <textarea
                            value={entry.description}
                            onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                            placeholder="Nhập mô tả về chuyên ngành..."
                            disabled={isLoading}
                            rows={2}
                            className={entryErrors[entry.id]?.description ? 'input-error' : ''}
                          />
                          {entryErrors[entry.id]?.description && (
                            <span className="error-message">{entryErrors[entry.id].description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button thêm entry mới */}
                <button
                  type="button"
                  className="btn-add-entry"
                  onClick={addNewEntry}
                  disabled={isLoading}
                >
                  <span className="btn-icon">+</span>
                  Thêm chuyên ngành khác
                </button>

                {/* Error Summary - hiển thị ở cuối form */}
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
                          {majorEntries.map((entry, index) => {
                            const errors = entryErrors[entry.id];
                            if (!errors || Object.keys(errors).length === 0) return null;
                            return (
                              <li key={entry.id} className="error-item">
                                <strong>Chuyên ngành #{index + 1}:</strong>
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
                editingMajor ? 'Cập nhật' : `Thêm ${majorEntries.length} chuyên ngành`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MajorFormModal;
