import React, { useState } from 'react';
import './StudentAffairs.css';

const StudentAffairs = () => {
  const [studentInfo, setStudentInfo] = useState({
    fullName: 'Alysia Nguyen',
    birthDate: '15/03/2002',
    studentId: '2051063001',
    currentAddress: '108B6 KTX Đại học Tôn Đức Thắng, Nguyễn Hữu Thọ, phường Tân Hưng, TP Hồ Chí Minh',
    permanentAddress: 'Ấp 2, Ấp 3, Xã Đông Tâm, Đồng Nai',
    cccd: '079204012345',
    issueDate: '25/05/2020',
    issuePlace: 'Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội'
  });

  const [checkedFields, setCheckedFields] = useState({
    fullName: false,
    birthDate: false,
    studentId: false,
    currentAddress: false,
    permanentAddress: false,
    cccd: false,
    issueDate: false,
    issuePlace: false
  });

  const [certificateForm, setCertificateForm] = useState({
    certificateType: '',
    searchTerm: '',
    requirement: '',
    reason: '',
    showReasonField: false
  });

  const certificateTypes = [
    'Bổ sung hồ sơ cá nhân',
    'Nghĩa vụ quân sự',
    'Bổ sung hồ sơ chế độ chính sách',
    'Thẻ sinh viên',
    'Xin phúc khảo điểm'
  ];

  const requirements = [
    'Cấp lại thẻ tạm',
    'Đăng ký thẻ tạm',
    'HK1 - 2025'
  ];

  const handleInputChange = (field, value) => {
    setStudentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field) => {
    setCheckedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCertificateChange = (field, value) => {
    setCertificateForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Show reason field for specific certificate types
      if (field === 'certificateType') {
        updated.showReasonField = value === 'Thẻ sinh viên' || value === 'Xin phúc khảo điểm';
        if (!updated.showReasonField) {
          updated.reason = '';
        }
      }
      
      return updated;
    });
  };

  const filteredCertificateTypes = certificateTypes.filter(type =>
    type.toLowerCase().includes(certificateForm.searchTerm.toLowerCase())
  );

  return (
    <div className="student-affairs">
      <div className="student-affairs-container">
        <div className="info-section">
          <div className="section-header">
            <h2>Thông tin cơ bản (Sinh viên xác nhận từng thông tin cá nhân của bản thân)</h2>
          </div>
          
          <div className="info-form">
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.fullName}
                  onChange={() => handleCheckboxChange('fullName')}
                />
                <label>HỌ VÀ TÊN</label>
                <input 
                  type="text" 
                  value={studentInfo.fullName}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.birthDate}
                  onChange={() => handleCheckboxChange('birthDate')}
                />
                <label>NGÀY SINH</label>
                <input 
                  type="text" 
                  value={studentInfo.birthDate}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.studentId}
                  onChange={() => handleCheckboxChange('studentId')}
                />
                <label>MSSV</label>
                <input 
                  type="text" 
                  value={studentInfo.studentId}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.currentAddress}
                  onChange={() => handleCheckboxChange('currentAddress')}
                />
                <label>NƠI Ở HIỆN NAY</label>
                <input 
                  type="text" 
                  value={studentInfo.currentAddress}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.permanentAddress}
                  onChange={() => handleCheckboxChange('permanentAddress')}
                />
                <label>NƠI THƯỜNG TRÚ</label>
                <input 
                  type="text" 
                  value={studentInfo.permanentAddress}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.cccd}
                  onChange={() => handleCheckboxChange('cccd')}
                />
                <label>CCCD</label>
                <input 
                  type="text" 
                  value={studentInfo.cccd}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.issueDate}
                  onChange={() => handleCheckboxChange('issueDate')}
                />
                <label>NGÀY CẤP</label>
                <input 
                  type="text" 
                  value={studentInfo.issueDate}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input 
                  type="checkbox" 
                  className="form-checkbox"
                  checked={checkedFields.issuePlace}
                  onChange={() => handleCheckboxChange('issuePlace')}
                />
                <label>NƠI CẤP</label>
                <input 
                  type="text" 
                  value={studentInfo.issuePlace}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="note-section">
            <p className="note-text">
              <strong>LƯU Ý:</strong><br/>
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
                    <option value="">Bổ sung hồ sơ cá nhân</option>
                    {certificateTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
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
                    value={certificateForm.requirement}
                    onChange={(e) => handleCertificateChange('requirement', e.target.value)}
                    className="select-input"
                  >
                    <option value="">Đăng ký thẻ tạm</option>
                    {requirements.map((req, index) => (
                      <option key={index} value={req}>{req}</option>
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
                  placeholder=""
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-certificate">
                <label>HỌC KỲ</label>
                <div className="select-container">
                  <select className="select-input">
                    <option value="">HK1 - 2025</option>
                  </select>
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
                />
                <label htmlFor="confirmation-checkbox" className="confirmation-label">
                  Tôi xin cam kết tất cả những thông tin khai trên đây<br/>hoàn toàn đúng sự thật!
                </label>
              </div>
            </div>

            <div className="submit-section">
              <button type="button" className="submit-btn">Gửi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAffairs;