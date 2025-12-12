import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MajorForm.css';

// Mock data cho Faculty
const mockFaculties = [
  { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT', isActive: true },
  { _id: '2', name: 'Khoa Kinh tế', code: 'KT', isActive: true },
  { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT', isActive: true },
  { _id: '4', name: 'Khoa Ngoại ngữ', code: 'NN', isActive: false },
  { _id: '5', name: 'Khoa Khoa học Tự nhiên', code: 'KHTN', isActive: true }
];

const EditMajor = () => {
  // TODO: Get major ID from URL params
  // const { id } = useParams();
  const majorId = '1'; // Mock ID
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - Replace with API call
  const mockMajor = {
    _id: '1',
    name: 'Công nghệ Phần mềm',
    code: 'CNPM',
    faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
    description: 'Đào tạo kỹ sư phần mềm, phát triển ứng dụng, hệ thống thông tin',
    isActive: true,
    studentCount: 120
  };

  // Get active faculties
  const activeFaculties = mockFaculties.filter(f => f.isActive);

  // Load major data
  useEffect(() => {
    const fetchMajor = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Call API to get major by ID
        // const response = await getMajorById(majorId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set form data from API response
        setFormData({
          name: mockMajor.name,
          code: mockMajor.code,
          faculty: mockMajor.faculty._id,
          description: mockMajor.description || '',
          isActive: mockMajor.isActive
        });
        
      } catch (error) {
        console.error('Error fetching major:', error);
        alert('Có lỗi xảy ra khi tải thông tin chuyên ngành!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMajor();
  }, [majorId]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên chuyên ngành là bắt buộc';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên chuyên ngành không quá 100 ký tự';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã chuyên ngành là bắt buộc';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Mã chuyên ngành không quá 10 ký tự';
    }

    if (!formData.faculty) {
      newErrors.faculty = 'Vui lòng chọn khoa';
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
      // TODO: Call API to update major
      // const response = await updateMajor(majorId, {
      //   ...formData,
      //   code: formData.code.toUpperCase()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updating major:', {
        id: majorId,
        ...formData,
        code: formData.code.toUpperCase()
      });

      alert('Cập nhật chuyên ngành thành công!');
      
      // TODO: Navigate back to major list
      // navigate('/major');
      handleCancel();
      
    } catch (error) {
      console.error('Error updating major:', error);
      alert('Có lỗi xảy ra khi cập nhật chuyên ngành!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // TODO: Navigate back to major list
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.')) {
      alert('Quay lại trang danh sách chuyên ngành');
    }
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="major-form-container">
        <div className="major-form-wrapper">
          <div className="loading-container">
            <Loader className="loading-spinner" size={48} />
            <p className="loading-text">Đang tải thông tin chuyên ngành...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="major-form-container">
      <div className="major-form-wrapper">
        {/* Header */}
        <div className="form-header">
          <button onClick={handleCancel} className="btn-back">
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="form-header-content">
            <h1 className="form-title">Chỉnh sửa chuyên ngành</h1>
            <p className="form-subtitle">Cập nhật thông tin: {mockMajor.name}</p>
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
                    Tên chuyên ngành <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="Nhập tên chuyên ngành"
                    maxLength={100}
                  />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="code" className="form-label">
                    Mã chuyên ngành <span className="required">*</span>
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
                    placeholder="VD: CNPM"
                    maxLength={10}
                  />
                  {errors.code && <p className="error-message">{errors.code}</p>}
                  <p className="form-hint">Mã chuyên ngành sẽ tự động chuyển thành chữ in hoa</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="faculty" className="form-label">
                  Khoa <span className="required">*</span>
                </label>
                <select
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={`form-select ${errors.faculty ? 'form-input-error' : ''}`}
                >
                  <option value="">-- Chọn khoa --</option>
                  {activeFaculties.map(faculty => (
                    <option key={faculty._id} value={faculty._id}>
                      [{faculty.code}] {faculty.name}
                    </option>
                  ))}
                </select>
                {errors.faculty && <p className="error-message">{errors.faculty}</p>}
                <p className="form-hint">Chỉ hiển thị các khoa đang hoạt động</p>
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
                  placeholder="Nhập mô tả về chuyên ngành"
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
                    <span className="checkbox-title">Chuyên ngành đang hoạt động</span>
                    <span className="checkbox-description">
                      Chuyên ngành sẽ được hiển thị và có thể đăng ký
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="form-section info-section">
              <h2 className="section-title">Thông tin bổ sung</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Thuộc khoa:</span>
                  <span className="info-value">{mockMajor.faculty.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số sinh viên:</span>
                  <span className="info-value">{mockMajor.studentCount} sinh viên</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mã chuyên ngành hiện tại:</span>
                  <span className="info-value info-code">{mockMajor.code}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mã khoa:</span>
                  <span className="info-value info-code">{mockMajor.faculty.code}</span>
                </div>
              </div>
              <p className="info-warning">
                ⚠️ Lưu ý: Thay đổi trạng thái chuyên ngành sẽ ảnh hưởng đến tất cả sinh viên thuộc chuyên ngành này.
              </p>
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
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMajor;