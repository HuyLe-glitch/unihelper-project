import React, { useState, useEffect, useCallback } from 'react';
import studentService from '../../../../services/student';
import certificateService from '../../../../services/certificate';
import certificateRequestService from '../../../../services/certificateRequest';
import { semesterService } from '../../../../services/semester';
import './StudentAffairs.css';

/**
 * StudentAffairs - Trang gửi yêu cầu CTSV cho sinh viên
 * Sử dụng dữ liệu thật từ API, tuân thủ Separation of Concerns
 */
const StudentAffairs = () => {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states - từ API
  const [studentInfo, setStudentInfo] = useState(null);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);

  // Form state
  const [certificateForm, setCertificateForm] = useState({
    certificateType: '',
    certificate: '',
    note: '',
    reason: '',
    showReasonField: false,
    isConfirmed: false
  });

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch song song: thông tin sinh viên, loại chứng nhận, học kỳ active
        const [profileRes, typesRes, semesterRes] = await Promise.all([
          studentService.getMyProfile(),
          certificateService.getAllTypes(),
          semesterService.getActiveSemester()
        ]);

        // Set student info
        if (profileRes.success && profileRes.data) {
          setStudentInfo(profileRes.data);
        }

        // Set certificate types
        if (typesRes.success && typesRes.data) {
          setCertificateTypes(typesRes.data);
        }

        // Set active semester
        if (semesterRes.success && semesterRes.data) {
          setActiveSemester(semesterRes.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Không thể tải dữ liệu. Vui lòng thử lại.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Fetch certificates when certificate type changes
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!certificateForm.certificateType) {
        setCertificates([]);
        return;
      }

      try {
        const res = await certificateService.getCertificatesByType(certificateForm.certificateType);
        if (res.success && res.data) {
          setCertificates(res.data);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setCertificates([]);
      }
    };

    fetchCertificates();
  }, [certificateForm.certificateType]);

  // Handle certificate form changes
  const handleCertificateChange = (field, value) => {
    setCertificateForm(prev => {
      const updated = { ...prev, [field]: value };

      // Reset certificate when type changes
      if (field === 'certificateType') {
        updated.certificate = '';
      }

      // Show reason field for specific certificate types (có thể điều chỉnh logic)
      if (field === 'certificateType') {
        const selectedType = certificateTypes.find(t => t._id === value);
        // Hiển thị lý do cho một số loại nhất định
        updated.showReasonField = selectedType?.name?.toLowerCase().includes('phúc khảo') ||
                                  selectedType?.name?.toLowerCase().includes('thẻ sinh viên');
        if (!updated.showReasonField) {
          updated.reason = '';
        }
      }

      return updated;
    });
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validation
    if (!certificateForm.certificateType) {
      showToast('Vui lòng chọn loại chứng nhận', 'error');
      return;
    }

    if (!certificateForm.certificate) {
      showToast('Vui lòng chọn chứng nhận cụ thể', 'error');
      return;
    }

    if (!certificateForm.isConfirmed) {
      showToast('Vui lòng xác nhận cam kết thông tin', 'error');
      return;
    }

    if (certificateForm.showReasonField && !certificateForm.reason.trim()) {
      showToast('Vui lòng nhập lý do yêu cầu', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Chuẩn bị dữ liệu gửi yêu cầu
      const requestData = {
        certificateType: certificateForm.certificateType,
        certificateName: certificateForm.certificate,
        semester: activeSemester?.name || '',
        notes: certificateForm.note || certificateForm.reason || ''
      };

      // Gọi API gửi yêu cầu
      const result = await certificateRequestService.createRequest(requestData);
      
      if (result.success) {
        showToast('Gửi yêu cầu thành công!', 'success');
        
        // Reset form
        setCertificateForm({
          certificateType: '',
          certificate: '',
          note: '',
          reason: '',
          showReasonField: false,
          isConfirmed: false
        });
      } else {
        showToast(result.message || 'Có lỗi xảy ra', 'error');
      }

    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="student-affairs">
        <div className="student-affairs-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-affairs">
      <div className="student-affairs-container">
        {/* Thông tin cơ bản */}
        <div className="info-section">
          <div className="section-header">
            <h2>Thông tin cơ bản (Sinh viên xác nhận từng thông tin cá nhân của bản thân)</h2>
          </div>

          <div className="info-form">
            <div className="sa-form-group">
              <label>HỌ VÀ TÊN</label>
              <input
                type="text"
                value={studentInfo?.fullName || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>NGÀY SINH</label>
              <input
                type="text"
                value={formatDate(studentInfo?.dateOfBirth)}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>EMAIL</label>
              <input
                type="text"
                value={studentInfo?.user?.email || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>SỐ ĐIỆN THOẠI</label>
              <input
                type="text"
                value={studentInfo?.phone || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>ĐỊA CHỈ</label>
              <input
                type="text"
                value={studentInfo?.address || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>CCCD</label>
              <input
                type="text"
                value={studentInfo?.citizenId || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>CHUYÊN NGÀNH</label>
              <input
                type="text"
                value={studentInfo?.major?.name || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            <div className="sa-form-group">
              <label>KHOA</label>
              <input
                type="text"
                value={studentInfo?.major?.faculty?.name || 'Chưa cập nhật'}
                readOnly
              />
            </div>

            {studentInfo?.isDormResident && (
              <div className="sa-form-group">
                <label>PHÒNG KTX</label>
                <input
                  type="text"
                  value={studentInfo?.roomId?.name || 'Chưa xếp phòng'}
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="note-section">
            <p className="note-text">
              <strong>LƯU Ý:</strong><br />
              Sinh viên cần kiểm tra kỹ thông tin trước khi thực hiện chứng nhận sinh viên. Trường hợp sinh viên cần cập nhật thông tin, sinh viên gửi email về Bộ phận hỗ trợ sinh viên, Phòng Công tác sinh viên - sinh viên: dssa@tdtu.edu.vn để được hỗ trợ.
            </p>
          </div>
        </div>

        {/* Certificate Selection Form */}
        <div className="info-section">
          <div className="section-header">
            <h2>Chọn chứng nhận, yêu cầu</h2>
          </div>

          <div className="certificate-form">
            <div className="form-row">
              <div className="form-group-certificate">
                <label>LOẠI CHỨNG NHẬN, YÊU CẦU <span className="required">*</span></label>
                <div className="select-container">
                  <select
                    value={certificateForm.certificateType}
                    onChange={(e) => handleCertificateChange('certificateType', e.target.value)}
                    className="select-input"
                  >
                    <option value="">-- Chọn loại chứng nhận --</option>
                    {certificateTypes.map((type) => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-certificate">
                <label>CHỨNG NHẬN, YÊU CẦU <span className="required">*</span></label>
                <div className="select-container">
                  <select
                    value={certificateForm.certificate}
                    onChange={(e) => handleCertificateChange('certificate', e.target.value)}
                    className="select-input"
                    disabled={!certificateForm.certificateType}
                  >
                    <option value="">-- Chọn chứng nhận --</option>
                    {certificates.map((cert) => (
                      <option key={cert._id} value={cert._id}>{cert.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-certificate">
                <label>GHI CHÚ</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Nhập ghi chú (nếu có)"
                  value={certificateForm.note}
                  onChange={(e) => handleCertificateChange('note', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-certificate">
                <label>HỌC KỲ</label>
                <div className="select-container">
                  <input
                    type="text"
                    className="text-input semester-input"
                    value={activeSemester?.name || 'Chưa có học kỳ hoạt động'}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="info-note">
              <p>Các thông tin bắt buộc (phải điền đầy đủ những thông tin không bị làm mờ)</p>
            </div>

            {certificateForm.showReasonField && (
              <div className="form-row">
                <div className="form-group-certificate">
                  <label>LÝ DO YÊU CẦU <span className="required">*</span></label>
                  <textarea
                    value={certificateForm.reason}
                    onChange={(e) => handleCertificateChange('reason', e.target.value)}
                    className="textarea-input"
                    placeholder="Vui lòng nêu lý do cần làm đơn này..."
                    rows="4"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group-certificate confirmation-row">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  id="confirmation-checkbox"
                  checked={certificateForm.isConfirmed}
                  onChange={(e) => handleCertificateChange('isConfirmed', e.target.checked)}
                />
                <label htmlFor="confirmation-checkbox" className="confirmation-label">
                  Tôi xin cam kết tất cả những thông tin khai trên đây<br />hoàn toàn đúng sự thật!
                </label>
              </div>
            </div>

            <div className="submit-section">
              <button
                type="button"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default StudentAffairs;