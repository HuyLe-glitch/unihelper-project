import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FacultyForm.css';

const AddFaculty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên khoa là bắt buộc';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên khoa không quá 100 ký tự';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã khoa là bắt buộc';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Mã khoa không quá 10 ký tự';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call API to create faculty
      // const response = await createFaculty({
      //   ...formData,
      //   code: formData.code.toUpperCase()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating faculty:', {
        ...formData,
        code: formData.code.toUpperCase()
      });

      alert('Thêm khoa thành công!');
      
      // TODO: Navigate back to faculty list
      // navigate('/faculty');
      handleCancel();
      
    } catch (error) {
      console.error('Error creating faculty:', error);
      alert('Có lỗi xảy ra khi thêm khoa!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // TODO: Navigate back to faculty list
    if (window.confirm('Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      alert('Quay lại trang danh sách khoa');
    }
    //navigate('/admin/faculty-management');
    navigate(-1);
  };

  return (
    <div className="faculty-form-container">
      <div className="faculty-form-wrapper">
        {/* Header */}
        <div className="form-header">
          <button onClick={handleCancel} className="btn-back">
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="form-header-content">
            <h1 className="form-title">Thêm khoa mới</h1>
            <p className="form-subtitle">Nhập thông tin để tạo khoa mới</p>
          </div>
        </div>

        {/* Form */}
        <div className="form-content">
          <div className="form-card">
            <div className="form-section">
              <h2 className="section-title">Thông tin cơ bản</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Tên khoa <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="Nhập tên khoa"
                    maxLength={100}
                  />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="code" className="form-label">
                    Mã khoa <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={(e) => {
                      handleChange({
                        target: {
                          name: 'code',
                          value: e.target.value.toUpperCase(),
                          type: 'text'
                        }
                      });
                    }}
                    className={`form-input form-input-code ${errors.code ? 'form-input-error' : ''}`}
                    placeholder="VD: CNTT"
                    maxLength={10}
                  />
                  {errors.code && <p className="error-message">{errors.code}</p>}
                  <p className="form-hint">Mã khoa sẽ tự động chuyển thành chữ in hoa</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
                  placeholder="Nhập mô tả về khoa"
                  rows={5}
                  maxLength={500}
                />
                {errors.description && <p className="error-message">{errors.description}</p>}
                <p className="char-count">
                  {formData.description.length}/500 ký tự
                </p>
              </div>

              <div className="form-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="isActive" className="checkbox-label">
                    <span className="checkbox-title">Khoa đang hoạt động</span>
                    <span className="checkbox-description">
                      Khoa sẽ được hiển thị và có thể đăng ký chuyên ngành
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-submit"
              disabled={isSubmitting}
            >
              <Save size={20} />
              {isSubmitting ? 'Đang lưu...' : 'Thêm khoa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;