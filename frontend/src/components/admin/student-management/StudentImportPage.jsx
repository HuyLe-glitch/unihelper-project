import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyService } from '../../../services/faculty';
import { majorService } from '../../../services/major';
import studentService from '../../../services/student';
import './StudentImportPage.css';

/**
 * StudentImportPage - Trang Import sinh viên từ CSV
 * 4 bước: Setup → Validation → Processing → Report
 */
const StudentImportPage = () => {
  const navigate = useNavigate();
  
  // Current step (1-4)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Setup state
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Step 2: Validation state
  const [parsedData, setParsedData] = useState([]);
  const [validationFilter, setValidationFilter] = useState('all'); // 'all', 'valid', 'duplicate', 'error'
  const [isValidating, setIsValidating] = useState(false);
  
  // Step 3: Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Step 4: Report state
  const [importResult, setImportResult] = useState(null);
  
  // Fetch faculties on mount
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await facultyService.getAllFaculties();
        setFaculties(res.data || []);
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };
    fetchFaculties();
  }, []);
  
  // Fetch majors when faculty changes
  useEffect(() => {
    const fetchMajors = async () => {
      if (!selectedFaculty) {
        setMajors([]);
        setSelectedMajor('');
        return;
      }
      try {
        // Gọi API với filter faculty
        const res = await majorService.getMajorsByFaculty(selectedFaculty);
        setMajors(res.data || []);
        setSelectedMajor('');
      } catch (error) {
        console.error('Error fetching majors:', error);
        setMajors([]);
      }
    };
    fetchMajors();
  }, [selectedFaculty]);
  
  // Validation statistics
  const validationStats = useMemo(() => {
    const valid = parsedData.filter(row => row.status === 'valid').length;
    const duplicate = parsedData.filter(row => row.status === 'duplicate').length;
    const error = parsedData.filter(row => row.status === 'error').length;
    return { valid, duplicate, error, total: parsedData.length };
  }, [parsedData]);
  
  // Filtered data for display
  const filteredData = useMemo(() => {
    if (validationFilter === 'all') return parsedData;
    return parsedData.filter(row => row.status === validationFilter);
  }, [parsedData, validationFilter]);
  
  // Check if can proceed to next step
  const canProceedStep1 = selectedFaculty && selectedMajor && selectedFile;
  const canProceedStep2 = validationStats.valid > 0;
  
  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Vui lòng chọn file CSV');
    }
  };
  
  // Handle drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };
  
  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      // Handle CSV with quoted values containing commas
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 6) {
        // Xử lý cột "Ở KTX" (cột 7, index 6)
        const isDormValue = (values[6] || '').toLowerCase();
        const isDormResident = isDormValue === 'có' || isDormValue === 'co' || isDormValue === 'yes' || isDormValue === 'true' || isDormValue === '1';
        
        rows.push({
          id: i,
          fullName: values[0] || '',
          email: values[1] || '',
          phone: values[2] || '',
          citizenId: values[3] || '',
          dateOfBirth: values[4] || '',
          address: values[5] || '',
          isDormResident: isDormResident,
          roomName: values[7]?.trim() || '', // Cột 8: Tên phòng KTX
          status: 'pending',
          message: ''
        });
      }
    }
    return rows;
  };
  
  // Handle proceed to step 2 - Gọi API Backend để validate
  const handleProceedToStep2 = async () => {
    if (!selectedFile) return;
    
    setIsValidating(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const data = parseCSV(text);
        
        // Gọi API Backend để validate
        const result = await studentService.previewImport(data, selectedMajor);
        
        if (result.success) {
          // Map kết quả từ backend sang format frontend
          const mappedResults = result.results.map(r => ({
            ...r.data,
            rowIndex: r.rowIndex,
            status: r.status,
            message: r.errors?.join(', ') || (r.status === 'valid' ? 'Hợp lệ' : '')
          }));
          setParsedData(mappedResults);
          setCurrentStep(2);
        }
      } catch (error) {
        console.error('Error validating data:', error);
        alert('Có lỗi xảy ra khi kiểm tra dữ liệu: ' + (error.message || 'Lỗi không xác định'));
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };
  
  // Handle import process - Gọi API Backend để import
  const handleStartImport = async () => {
    setCurrentStep(3);
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Đang khởi tạo...');
    
    try {
      // Lọc lấy các dòng hợp lệ
      const validRows = parsedData
        .filter(row => row.status === 'valid')
        .map((row, index) => ({
          ...row,
          rowIndex: row.rowIndex || index + 1
        }));
      
      setProcessingProgress(10);
      setProcessingMessage(`Đang gửi ${validRows.length} sinh viên đến server...`);
      
      // Gọi API Backend để import - Batch processing
      const result = await studentService.executeImport(validRows, selectedMajor);
      
      setProcessingProgress(100);
      setProcessingMessage('Hoàn tất!');
      
      // Set result từ backend
      setImportResult({
        total: result.data.total,
        success: result.data.successCount,
        failed: result.data.failedCount,
        skipped: validationStats.duplicate + validationStats.error,
        errors: result.data.errors || []
      });
      
    } catch (error) {
      console.error('Error importing:', error);
      setImportResult({
        total: validationStats.valid,
        success: 0,
        failed: validationStats.valid,
        skipped: validationStats.duplicate + validationStats.error,
        errors: [{ error: error.message || 'Lỗi không xác định' }]
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep(4);
    }
  };
  
  // Reset and start over
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFaculty('');
    setSelectedMajor('');
    setSelectedFile(null);
    setParsedData([]);
    setValidationFilter('all');
    setImportResult(null);
  };
  
  // Go back to student list
  const handleGoBack = () => {
    navigate('/admin/students');
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'valid': return 'status-badge valid';
      case 'duplicate': return 'status-badge duplicate';
      case 'error': return 'status-badge error';
      default: return 'status-badge';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'valid': return 'Hợp lệ';
      case 'duplicate': return 'Trùng lặp';
      case 'error': return 'Lỗi';
      default: return 'Đang xử lý';
    }
  };

  return (
    <div className="student-import-page">
      {/* Header */}
      <div className="import-header">
        <button className="back-button" onClick={handleGoBack} disabled={isProcessing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Quay lại</span>
        </button>
        <div className="header-title">
          <h1>📥 Import Sinh viên từ CSV</h1>
          <p>Nhập danh sách sinh viên hàng loạt từ file CSV</p>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="steps-container">
        <div className="steps-wrapper">
          {[
            { num: 1, title: 'Cấu hình', icon: '⚙️' },
            { num: 2, title: 'Kiểm tra', icon: '🔍' },
            { num: 3, title: 'Xử lý', icon: '⚡' },
            { num: 4, title: 'Kết quả', icon: '✅' }
          ].map((step, index) => (
            <React.Fragment key={step.num}>
              <div className={`step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                <div className="step-circle">
                  {currentStep > step.num ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
              {index < 3 && <div className={`step-line ${currentStep > step.num ? 'completed' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="step-content">
        {/* Step 1: Setup */}
        {currentStep === 1 && (
          <div className="step-1-content">
            <div className="setup-grid">
              {/* Left: Context Selection */}
              <div className="setup-card context-selection">
                <div className="card-header">
                  <span className="card-icon">🎓</span>
                  <h3>Chọn Khoa & Chuyên ngành</h3>
                </div>
                <p className="card-description">
                  Tất cả sinh viên trong file sẽ được gán vào Khoa và Chuyên ngành này
                </p>
                
                <div className="form-group">
                  <label>Khoa <span className="required">*</span></label>
                  <select 
                    value={selectedFaculty} 
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                  >
                    <option value="">-- Chọn Khoa --</option>
                    {faculties.map(f => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Chuyên ngành <span className="required">*</span></label>
                  <select 
                    value={selectedMajor} 
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    disabled={!selectedFaculty}
                  >
                    <option value="">-- Chọn Chuyên ngành --</option>
                    {majors.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  {!selectedFaculty && (
                    <span className="field-hint">Vui lòng chọn Khoa trước</span>
                  )}
                </div>
              </div>
              
              {/* Right: File Upload */}
              <div className="setup-card file-upload">
                <div className="card-header">
                  <span className="card-icon">📄</span>
                  <h3>Tải file CSV</h3>
                </div>
                
                <div 
                  className={`upload-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input 
                    type="file" 
                    id="file-input" 
                    accept=".csv" 
                    hidden 
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  
                  {selectedFile ? (
                    <div className="file-selected">
                      <div className="file-icon">📋</div>
                      <div className="file-info">
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button 
                        className="remove-file" 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                      </div>
                      <p>Kéo thả file CSV vào đây</p>
                      <span>hoặc click để chọn file</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Format Guide */}
            <div className="format-guide-card">
              <div className="card-header">
                <span className="card-icon">📋</span>
                <h3>Hướng dẫn định dạng file CSV</h3>
              </div>
              <p className="card-description">
                File CSV của bạn cần có các cột theo đúng thứ tự sau. Hàng đầu tiên là tiêu đề cột.
              </p>
              
              <div className="format-table-wrapper">
                <table className="format-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên cột</th>
                      <th>Bắt buộc</th>
                      <th>Định dạng</th>
                      <th>Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td><strong>Họ và tên</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>Văn bản</td>
                      <td>Nguyễn Văn A</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td><strong>Email</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>Email hợp lệ</td>
                      <td>nguyenvana@email.com</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td><strong>Số điện thoại</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>10 chữ số, bắt đầu bằng 0</td>
                      <td>0901234567</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td><strong>CCCD</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>12 chữ số</td>
                      <td>012345678901</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td><strong>Ngày sinh</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>DD/MM/YYYY</td>
                      <td>15/06/2000</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td><strong>Địa chỉ</strong></td>
                      <td><span className="badge required">Bắt buộc</span></td>
                      <td>Văn bản</td>
                      <td>123 Đường ABC, Quận 1, TP.HCM</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td><strong>Ở KTX</strong></td>
                      <td><span className="badge optional">Tùy chọn</span></td>
                      <td>"Có" hoặc "Không" (mặc định: Không)</td>
                      <td>Có</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td><strong>Tên phòng KTX</strong></td>
                      <td><span className="badge optional">Tùy chọn</span></td>
                      <td>Tên phòng (bắt buộc nếu Ở KTX = Có)</td>
                      <td>P101</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="format-example">
                <h4>📝 Ví dụ nội dung file CSV:</h4>
                <div className="code-block">
                  <code>
                    Họ và tên,Email,Số điện thoại,CCCD,Ngày sinh,Địa chỉ,Ở KTX,Tên phòng<br/>
                    Nguyễn Văn A,nguyenvana@email.com,0901234567,012345678901,15/06/2000,"123 Đường ABC, Quận 1",Không,<br/>
                    Trần Thị B,tranthib@email.com,0912345678,012345678902,20/08/2001,"456 Đường XYZ, Quận 2",Có,P101
                  </code>
                </div>
              </div>
              
              <div className="format-notes">
                <h4>⚠️ Lưu ý quan trọng:</h4>
                <ul>
                  <li>File phải được lưu với định dạng <strong>UTF-8</strong> để hiển thị tiếng Việt đúng</li>
                  <li>Nếu địa chỉ có dấu phẩy, hãy đặt trong dấu ngoặc kép: <code>"123 Đường ABC, Quận 1"</code></li>
                  <li>Email, Số điện thoại, CCCD phải là <strong>duy nhất</strong> - không được trùng với sinh viên đã có</li>
                  <li>Mật khẩu mặc định cho tất cả sinh viên mới là: <strong>123456</strong></li>
                  <li>Khoa và Chuyên ngành được lấy từ lựa chọn bên dưới</li>
                  <li>Nếu sinh viên ở KTX (<strong>Ở KTX = Có</strong>), phải điền <strong>Tên phòng KTX</strong> hợp lệ</li>
                  <li>Hệ thống sẽ tự động kiểm tra số slot còn trống của mỗi phòng</li>
                </ul>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="step-actions">
              <button 
                className="btn-primary btn-next"
                disabled={!canProceedStep1}
                onClick={handleProceedToStep2}
              >
                Tiếp tục
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Validation */}
        {currentStep === 2 && (
          <div className="step-2-content">
            {isValidating ? (
              <div className="validating-loader">
                <div className="spinner"></div>
                <p>Đang kiểm tra dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="validation-stats">
                  <div className="stat-card valid">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <span className="stat-value">{validationStats.valid}</span>
                      <span className="stat-label">Hợp lệ</span>
                    </div>
                  </div>
                  <div className="stat-card duplicate">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                      <span className="stat-value">{validationStats.duplicate}</span>
                      <span className="stat-label">Trùng lặp</span>
                    </div>
                  </div>
                  <div className="stat-card error">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                      <span className="stat-value">{validationStats.error}</span>
                      <span className="stat-label">Lỗi</span>
                    </div>
                  </div>
                  <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <span className="stat-value">{validationStats.total}</span>
                      <span className="stat-label">Tổng cộng</span>
                    </div>
                  </div>
                </div>
                
                {/* Filter Tabs */}
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${validationFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setValidationFilter('all')}
                  >
                    Tất cả ({validationStats.total})
                  </button>
                  <button 
                    className={`filter-tab valid ${validationFilter === 'valid' ? 'active' : ''}`}
                    onClick={() => setValidationFilter('valid')}
                  >
                    Hợp lệ ({validationStats.valid})
                  </button>
                  <button 
                    className={`filter-tab duplicate ${validationFilter === 'duplicate' ? 'active' : ''}`}
                    onClick={() => setValidationFilter('duplicate')}
                  >
                    Trùng lặp ({validationStats.duplicate})
                  </button>
                  <button 
                    className={`filter-tab error ${validationFilter === 'error' ? 'active' : ''}`}
                    onClick={() => setValidationFilter('error')}
                  >
                    Lỗi ({validationStats.error})
                  </button>
                </div>
                
                {/* Data Table */}
                <div className="validation-table-wrapper">
                  <table className="validation-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>CCCD</th>
                        <th>Ngày sinh</th>
                        <th style={{ width: '80px' }}>Ở KTX</th>
                        <th style={{ width: '120px' }}>Trạng thái</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <tr key={row.id} className={row.status}>
                          <td>{index + 1}</td>
                          <td>{row.fullName}</td>
                          <td>{row.email}</td>
                          <td>{row.phone}</td>
                          <td>{row.citizenId}</td>
                          <td>{row.dateOfBirth}</td>
                          <td>{row.isDormResident ? '✅ Có' : '❌ Không'}</td>
                          <td>
                            <span className={getStatusBadgeClass(row.status)}>
                              {getStatusLabel(row.status)}
                            </span>
                          </td>
                          <td className="message-cell">{row.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Action Buttons */}
                <div className="step-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                  </button>
                  <button 
                    className="btn-primary btn-import"
                    disabled={!canProceedStep2}
                    onClick={handleStartImport}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Tiến hành Import ({validationStats.valid} sinh viên)
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Step 3: Processing */}
        {currentStep === 3 && (
          <div className="step-3-content">
            <div className="processing-container">
              <div className="processing-animation">
                <div className="processing-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="progress-bg" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      className="progress-bar"
                      style={{ strokeDashoffset: 283 - (283 * processingProgress) / 100 }}
                    />
                  </svg>
                  <span className="progress-text">{processingProgress}%</span>
                </div>
              </div>
              
              <h2>Đang xử lý...</h2>
              <p className="processing-message">{processingMessage}</p>
              
              <div className="processing-hint">
                <span className="hint-icon">💡</span>
                <span>Vui lòng không đóng trang này cho đến khi hoàn tất</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Report */}
        {currentStep === 4 && importResult && (
          <div className="step-4-content">
            <div className="result-container">
              <div className="result-header">
                <div className="result-icon success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <h2>Import hoàn tất!</h2>
                <p>Quá trình import sinh viên đã được thực hiện xong</p>
              </div>
              
              <div className="result-stats">
                <div className="result-stat-card success">
                  <span className="stat-number">{importResult.success}</span>
                  <span className="stat-text">Tạo mới thành công</span>
                </div>
                <div className="result-stat-card skipped">
                  <span className="stat-number">{importResult.skipped}</span>
                  <span className="stat-text">Bỏ qua (trùng/lỗi)</span>
                </div>
                <div className="result-stat-card failed">
                  <span className="stat-number">{importResult.failed}</span>
                  <span className="stat-text">Thất bại</span>
                </div>
              </div>
              
              <div className="result-info">
                <div className="info-box">
                  <span className="info-icon">🔐</span>
                  <p>Tài khoản sinh viên mới được tạo với <strong>mật khẩu mặc định: 123456</strong></p>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="error-details">
                  <h4>Chi tiết lỗi:</h4>
                  <ul>
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>
                        <strong>Dòng {err.row}</strong> ({err.name}): {err.error}
                      </li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li className="more">...và {importResult.errors.length - 5} lỗi khác</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="result-actions">
                <button className="btn-secondary" onClick={handleReset}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Import thêm file khác
                </button>
                <button className="btn-primary" onClick={handleGoBack}>
                  Quay về danh sách
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentImportPage;
