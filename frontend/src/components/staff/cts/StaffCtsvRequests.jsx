import React, { useState, useMemo } from 'react';
import { authService } from '../../../services';
import StaffDormitoryRequests from '../dormitory/StaffDormitoryRequests';
import { SemesterFilter, SEMESTERS } from '../../common';
import './StaffCtsvRequests.css';
import '../staffPages.css';

// Mock data với đầy đủ thông tin
const MOCK_REQUESTS = [
  {
    id: '01146969',
    student: {
      name: 'Nguyễn Văn An',
      studentId: '2051063001',
      email: 'nvanan@student.tdtu.edu.vn',
      phone: '0912345678',
      faculty: 'Công nghệ thông tin',
      major: 'Kỹ thuật phần mềm'
    },
    certificateType: 'Nghĩa vụ quân sự',
    certificateName: 'Tạm hoãn nghĩa vụ quân sự',
    semester: 'HK1 - 2025',
    requestDate: '16/8/2025',
    status: 'HỢP LỆ',
    responseTime: '4:45 CH\n19-08-2025',
    notes: 'Sinh viên vui lòng đến P. CTHSSV (A0003) nhận bản chính giấy chứng nhận sinh viên. Thời gian từ ngày 19/8/2025 - 04/9/2025. Nếu SV không nhận hồ sơ theo thời gian nêu trên vui lòng liên hệ trực tiếp Phòng để nhận.',
    attachedFile: '01146969.pdf',
    processingHistory: [
      { date: '19/8/2025 16:45', action: 'Đã duyệt yêu cầu', staff: 'Lê Thị Nhàn' },
      { date: '17/8/2025 09:00', action: 'Đang xem xét hồ sơ', staff: 'Lê Thị Nhàn' },
      { date: '16/8/2025 14:30', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: '01125588',
    student: {
      name: 'Trần Thị Bình',
      studentId: '2051063002',
      email: 'ttbinh@student.tdtu.edu.vn',
      phone: '0923456789',
      faculty: 'Quản trị kinh doanh',
      major: 'Marketing'
    },
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận sinh viên đang học',
    semester: 'HK2 - 2024',
    requestDate: '10/12/2024',
    status: 'ĐANG XỬ LÝ',
    responseTime: null,
    notes: 'Yêu cầu đang được xử lý bởi Phòng CTSV.',
    attachedFile: null,
    processingHistory: [
      { date: '10/12/2024 10:15', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: '01136977',
    student: {
      name: 'Lê Hoàng Nam',
      studentId: '2051063003',
      email: 'lhnam@student.tdtu.edu.vn',
      phone: '0934567890',
      faculty: 'Điện - Điện tử',
      major: 'Kỹ thuật điện tử'
    },
    certificateType: 'Bổ sung hồ sơ cá nhân',
    certificateName: 'Bổ sung hồ sơ cá nhân',
    semester: 'HK1 - 2024',
    requestDate: '30/8/2024',
    status: 'HỢP LỆ',
    responseTime: '2:38 CH\n05-09-2024',
    notes: 'Sinh viên vui lòng đến P. CTHSSV (A0003) nhận bản chính giấy chứng nhận sinh viên. Thời gian từ ngày 05/9/2024 – 19/9/2024. Nếu SV không nhận hồ sơ theo thời gian nêu trên vui lòng liên hệ trực tiếp Phòng.',
    attachedFile: '01136977.pdf',
    processingHistory: [
      { date: '05/9/2024 14:38', action: 'Đã duyệt yêu cầu', staff: 'Đỗ Minh Thu' },
      { date: '02/9/2024 08:30', action: 'Đang xem xét hồ sơ', staff: 'Đỗ Minh Thu' },
      { date: '30/8/2024 11:20', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: '01098765',
    student: {
      name: 'Phạm Minh Châu',
      studentId: '2051063004',
      email: 'pmchau@student.tdtu.edu.vn',
      phone: '0945678901',
      faculty: 'Luật',
      major: 'Luật kinh tế'
    },
    certificateType: 'Bảng điểm',
    certificateName: 'Bảng điểm tích lũy',
    semester: 'HK1 - 2024',
    requestDate: '20/7/2024',
    status: 'KHÔNG HỢP LỆ',
    responseTime: '10:30 SA\n25-07-2024',
    notes: 'Yêu cầu không hợp lệ do sinh viên chưa hoàn thành học phí học kỳ 1.',
    attachedFile: null,
    processingHistory: [
      { date: '25/7/2024 10:30', action: 'Từ chối yêu cầu', staff: 'Trần Văn Hùng' },
      { date: '22/7/2024 14:00', action: 'Đang xem xét hồ sơ', staff: 'Trần Văn Hùng' },
      { date: '20/7/2024 09:45', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: '01156789',
    student: {
      name: 'Võ Thị Hương',
      studentId: '2051063005',
      email: 'vthuong@student.tdtu.edu.vn',
      phone: '0956789012',
      faculty: 'Ngoại ngữ',
      major: 'Ngôn ngữ Anh'
    },
    certificateType: 'Thẻ sinh viên',
    certificateName: 'Cấp lại thẻ sinh viên',
    semester: 'HK2 - 2024',
    requestDate: '15/12/2024',
    status: 'ĐANG XỬ LÝ',
    responseTime: null,
    notes: 'Yêu cầu đang chờ xử lý.',
    attachedFile: null,
    processingHistory: [
      { date: '15/12/2024 08:00', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: '01167890',
    student: {
      name: 'Hoàng Đức Trí',
      studentId: '2051063006',
      email: 'hdtri@student.tdtu.edu.vn',
      phone: '0967890123',
      faculty: 'Khoa học ứng dụng',
      major: 'Toán ứng dụng'
    },
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận vay vốn ngân hàng',
    semester: 'HK2 - 2024',
    requestDate: '14/12/2024',
    status: 'ĐANG XỬ LÝ',
    responseTime: null,
    notes: 'Đang chờ xác minh thông tin.',
    attachedFile: null,
    processingHistory: [
      { date: '14/12/2024 16:30', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  }
];

const STATUS_CONFIG = {
  'ĐANG XỬ LÝ': { className: 'processing', icon: '⏳', color: '#f59e0b' },
  'HỢP LỆ': { className: 'approved', icon: '✓', color: '#22c55e' },
  'KHÔNG HỢP LỆ': { className: 'rejected', icon: '✕', color: '#ef4444' }
};

const StaffCtsvRequests = () => {
  // Check staff type - if KTX, render dormitory requests instead
  const staffType = authService.getStaffType();
  const isKTX = staffType === 'KTX';
  
  // If KTX staff, render dormitory component
  if (isKTX) {
    return <StaffDormitoryRequests />;
  }
  
  // Otherwise, render CTSV requests
  const [requests] = useState(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateSort, setDateSort] = useState('newest');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [editableNote, setEditableNote] = useState('');
  const [editableFile, setEditableFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Get selected semester info for filtering
  const selectedSemester = useMemo(() => 
    SEMESTERS.find(s => s.id === semesterFilter),
    [semesterFilter]
  );

  // Statistics
  const stats = useMemo(() => ({
    total: requests.length,
    processing: requests.filter(r => r.status === 'ĐANG XỬ LÝ').length,
    approved: requests.filter(r => r.status === 'HỢP LỆ').length,
    rejected: requests.filter(r => r.status === 'KHÔNG HỢP LỆ').length
  }), [requests]);

  // Get unique certificate types
  const certificateTypes = useMemo(() => 
    [...new Set(requests.map(r => r.certificateType))],
    [requests]
  );

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.id.toLowerCase().includes(term) ||
        r.student.name.toLowerCase().includes(term) ||
        r.student.studentId.toLowerCase().includes(term) ||
        r.student.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(r => r.certificateType === typeFilter);
    }

    // Semester filter
    if (semesterFilter !== 'all' && selectedSemester) {
      result = result.filter(r => {
        const requestDate = new Date(r.requestDate.split('/').reverse().join('-'));
        const startDate = new Date(selectedSemester.startDate);
        const endDate = new Date(selectedSemester.endDate);
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(r => {
        const requestDate = r.requestDate.split('/').reverse().join('-');
        return requestDate === dateFilter;
      });
    }

    // Date sort
    result.sort((a, b) => {
      const dateA = new Date(a.requestDate.split('/').reverse().join('-'));
      const dateB = new Date(b.requestDate.split('/').reverse().join('-'));
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [requests, searchTerm, statusFilter, typeFilter, semesterFilter, selectedSemester, dateFilter, dateSort]);

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setEditableNote(request.notes || '');
    setEditableFile(request.attachedFile || null);
    setIsEditing(false);
  };

  const handleProcess = (action) => {
    setProcessAction(action);
    setShowProcessModal(true);
  };

  const handleSubmitProcess = () => {
    // Here you would call API to process the request
    console.log('Processing:', selectedRequest?.id, processAction, processNote);
    setShowProcessModal(false);
    setProcessNote('');
    setProcessAction('');
  };

  const handleSave = () => {
    // Here you would call API to save the editable note and file
    console.log('Saving:', selectedRequest?.id, editableNote, editableFile);
    // Update the request with new note and file
    if (selectedRequest) {
      selectedRequest.notes = editableNote;
      selectedRequest.attachedFile = editableFile;
    }
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditableFile(file.name);
    }
  };

  return (
    <div className="ctsv-management">
      {/* Header */}
      <header className="ctsv-header">
        <div className="ctsv-header__info">
          <h1>Quản lý yêu cầu CTSV</h1>
          <p>Xử lý và theo dõi các yêu cầu chứng nhận từ sinh viên</p>
        </div>
        <div className="ctsv-header__actions">
          <button className="btn-export">
            <span className="btn-icon">📊</span>
            Xuất báo cáo
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="ctsv-stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📋</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.total}</span>
            <span className="stat-card__label">Tổng yêu cầu</span>
          </div>
        </div>
        <div className="stat-card stat-card--processing" onClick={() => setStatusFilter(statusFilter === 'ĐANG XỬ LÝ' ? 'all' : 'ĐANG XỬ LÝ')}>
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.processing}</span>
            <span className="stat-card__label">Đang xử lý</span>
          </div>
          {stats.processing > 0 && <span className="stat-card__badge pulse">Cần xử lý</span>}
        </div>
        <div className="stat-card stat-card--approved" onClick={() => setStatusFilter(statusFilter === 'HỢP LỆ' ? 'all' : 'HỢP LỆ')}>
          <div className="stat-card__icon">✓</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.approved}</span>
            <span className="stat-card__label">Hợp lệ</span>
          </div>
        </div>
        <div className="stat-card stat-card--rejected" onClick={() => setStatusFilter(statusFilter === 'KHÔNG HỢP LỆ' ? 'all' : 'KHÔNG HỢP LỆ')}>
          <div className="stat-card__icon">✕</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.rejected}</span>
            <span className="stat-card__label">Không hợp lệ</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="ctsv-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã, tên SV, MSSV hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ĐANG XỬ LÝ">Đang xử lý</option>
            <option value="HỢP LỆ">Hợp lệ</option>
            <option value="KHÔNG HỢP LỆ">Không hợp lệ</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả loại chứng nhận</option>
            {certificateTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {/* Semester Filter Component */}
          <SemesterFilter
            value={semesterFilter}
            onChange={setSemesterFilter}
            dateValue={dateFilter}
            onDateChange={setDateFilter}
            showInfoBar={false}
          />
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
          </select>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="ctsv-main">
        {/* Left Panel - Request List */}
        <div className="ctsv-list-panel">
          <div className="panel-header">
            <span className="panel-title">Danh sách yêu cầu</span>
            <span className="panel-count">{filteredRequests.length} yêu cầu</span>
          </div>
          <div className="request-list">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Không tìm thấy yêu cầu nào</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div
                  key={request.id}
                  className={`request-card ${selectedRequest?.id === request.id ? 'active' : ''} ${request.status === 'ĐANG XỬ LÝ' ? 'pending' : ''}`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="request-card__header">
                    <span className="request-code">#{request.id}</span>
                    <span className={`status-badge ${STATUS_CONFIG[request.status].className}`}>
                      {STATUS_CONFIG[request.status].icon} {request.status}
                    </span>
                  </div>
                  <div className="request-card__body">
                    <div className="student-brief">
                      <span className="student-avatar">
                        {request.student.name.charAt(request.student.name.lastIndexOf(' ') + 1)}
                      </span>
                      <div className="student-info">
                        <span className="student-name">{request.student.name}</span>
                        <span className="student-id">{request.student.email}</span>
                      </div>
                    </div>
                    <div className="request-meta">
                      <span className="cert-type">{request.certificateType}</span>
                      <span className="request-date">📅 {request.requestDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className={`ctsv-detail-panel ${selectedRequest ? 'has-content' : ''}`}>
          {selectedRequest ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>Chi tiết yêu cầu #{selectedRequest.id}</h2>
                  <span className={`status-badge large ${STATUS_CONFIG[selectedRequest.status].className}`}>
                    {STATUS_CONFIG[selectedRequest.status].icon} {selectedRequest.status}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setSelectedRequest(null)}>×</button>
              </div>

              <div className="detail-content">
                {/* Student Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Thông tin sinh viên
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ và tên</label>
                      <span>{selectedRequest.student.name}</span>
                    </div>
                    <div className="info-item">
                      <label>MSSV</label>
                      <span className="code">{selectedRequest.student.studentId}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <a href={`mailto:${selectedRequest.student.email}`}>{selectedRequest.student.email}</a>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại</label>
                      <a href={`tel:${selectedRequest.student.phone}`}>{selectedRequest.student.phone}</a>
                    </div>
                    <div className="info-item">
                      <label>Khoa</label>
                      <span>{selectedRequest.student.faculty}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngành</label>
                      <span>{selectedRequest.student.major}</span>
                    </div>
                  </div>
                </section>

                {/* Request Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">📝</span>
                    Thông tin yêu cầu
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Loại chứng nhận</label>
                      <span className="highlight">{selectedRequest.certificateType}</span>
                    </div>
                    <div className="info-item">
                      <label>Tên chứng nhận</label>
                      <span>{selectedRequest.certificateName}</span>
                    </div>
                    <div className="info-item">
                      <label>Học kỳ</label>
                      <span>{selectedRequest.semester}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày yêu cầu</label>
                      <span>{selectedRequest.requestDate}</span>
                    </div>
                    {selectedRequest.responseTime && (
                      <div className="info-item">
                        <label>Phản hồi lúc</label>
                        <span style={{whiteSpace: 'pre-line'}}>{selectedRequest.responseTime}</span>
                      </div>
                    )}
                    <div className="info-item full-width">
                      <label>File đính kèm</label>
                      {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditing ? (
                        <div className="file-upload-box" style={{marginTop: '8px'}}>
                          <input 
                            type="file" 
                            id="file-upload-edit" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            hidden 
                          />
                          <label htmlFor="file-upload-edit" className="file-upload-label" style={{padding: '16px'}}>
                            <span className="upload-icon">📁</span>
                            <span>{editableFile || 'Click để chọn file'}</span>
                          </label>
                        </div>
                      ) : editableFile ? (
                        <a href="#" className="file-link">
                          <span className="file-icon">📄</span>
                          {editableFile}
                        </a>
                      ) : (
                        <span style={{color: 'var(--ctsv-text-muted)', fontStyle: 'italic'}}>Chưa có file đính kèm</span>
                      )}
                    </div>
                  </div>
                </section>

                {/* Notes Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">💬</span>
                    Ghi chú / Lưu ý
                  </h3>
                  {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditing ? (
                    <textarea
                      className="notes-editable"
                      rows="4"
                      value={editableNote}
                      onChange={(e) => setEditableNote(e.target.value)}
                      placeholder="Nhập ghi chú..."
                    />
                  ) : (
                    <div className="notes-box">
                      {editableNote || 'Không có ghi chú'}
                    </div>
                  )}
                </section>

                {/* Processing History */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">📜</span>
                    Lịch sử xử lý
                  </h3>
                  <div className="history-timeline">
                    {selectedRequest.processingHistory.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="timeline-action">{item.action}</span>
                          <div className="timeline-meta">
                            <span className="timeline-staff">{item.staff}</span>
                            <span className="timeline-date">{item.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'ĐANG XỬ LÝ' && (
                <div className="detail-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-action btn-approve" onClick={handleSave}>
                        <span>💾</span> Lưu thay đổi
                      </button>
                      <button className="btn-action btn-cancel" onClick={() => {
                        setEditableNote(selectedRequest.notes || '');
                        setEditableFile(selectedRequest.attachedFile || null);
                        setIsEditing(false);
                      }}>
                        <span>✕</span> Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-action btn-approve" onClick={() => handleProcess('approve')}>
                        <span>✓</span> Duyệt yêu cầu
                      </button>
                      <button className="btn-action btn-reject" onClick={() => handleProcess('reject')}>
                        <span>✕</span> Từ chối
                      </button>
                      <button className="btn-action btn-request-info" onClick={() => setIsEditing(true)}>
                        <span>✏️</span> Chỉnh sửa
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="detail-empty">
              <div className="empty-illustration">
                <span>📋</span>
              </div>
              <h3>Chọn một yêu cầu để xem chi tiết</h3>
              <p>Click vào yêu cầu bên trái để xem thông tin đầy đủ và xử lý</p>
            </div>
          )}
        </div>
      </div>

      {/* Process Modal */}
      {showProcessModal && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {processAction === 'approve' && '✓ Duyệt yêu cầu'}
                {processAction === 'reject' && '✕ Từ chối yêu cầu'}
                {processAction === 'request-info' && '📋 Yêu cầu bổ sung thông tin'}
              </h3>
              <button className="btn-close" onClick={() => setShowProcessModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mã yêu cầu</label>
                <input type="text" value={`#${selectedRequest?.id}`} readOnly />
              </div>
              <div className="form-group">
                <label>Sinh viên</label>
                <input type="text" value={`${selectedRequest?.student.name} - ${selectedRequest?.student.studentId}`} readOnly />
              </div>
              <div className="form-group">
                <label>
                  {processAction === 'approve' && 'Ghi chú phản hồi'}
                  {processAction === 'reject' && 'Lý do từ chối *'}
                  {processAction === 'request-info' && 'Thông tin cần bổ sung *'}
                </label>
                <textarea
                  rows="4"
                  placeholder={
                    processAction === 'approve' 
                      ? 'Nhập ghi chú cho sinh viên (không bắt buộc)...'
                      : 'Nhập nội dung...'
                  }
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                />
              </div>
              {processAction === 'approve' && (
                <div className="form-group">
                  <label>Tải lên file phản hồi (PDF)</label>
                  <div className="file-upload-box">
                    <input type="file" id="file-upload" accept=".pdf" hidden />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <span className="upload-icon">📁</span>
                      <span>Click để chọn file hoặc kéo thả vào đây</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowProcessModal(false)}>Hủy</button>
              <button 
                className={`btn-submit ${processAction === 'approve' ? 'approve' : processAction === 'reject' ? 'reject' : 'info'}`}
                onClick={handleSubmitProcess}
              >
                {processAction === 'approve' && 'Xác nhận duyệt'}
                {processAction === 'reject' && 'Xác nhận từ chối'}
                {processAction === 'request-info' && 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCtsvRequests;
