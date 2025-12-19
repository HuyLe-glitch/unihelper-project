import React, { useState, useMemo } from 'react';
import './StaffDormitoryRequests.css';
import '../staffPages.css';

// Mock data cho yêu cầu sửa chữa thiết bị KTX
const MOCK_REQUESTS = [
  {
    id: 'KTX001',
    student: {
      name: 'Nguyễn Văn An',
      studentId: '2051063001',
      email: 'nvanan@student.tdtu.edu.vn',
      phone: '0912345678'
    },
    room: 'A101',
    building: 'Tòa A',
    category: 'Điện nước',
    deviceName: 'Bóng đèn',
    description: 'Bóng đèn trong phòng bị hỏng, không sáng. Yêu cầu thay thế bóng đèn mới.',
    requestDate: '15/12/2024',
    status: 'ĐANG XỬ LÝ',
    priority: 'CAO',
    responseTime: null,
    notes: null,
    attachedImages: ['ktx001_1.jpg', 'ktx001_2.jpg'],
    processingHistory: [
      { date: '15/12/2024 14:30', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: 'KTX002',
    student: {
      name: 'Trần Thị Bình',
      studentId: '2051063002',
      email: 'ttbinh@student.tdtu.edu.vn',
      phone: '0923456789'
    },
    room: 'B205',
    building: 'Tòa B',
    category: 'Vệ sinh',
    deviceName: 'Vòi nước',
    description: 'Vòi nước trong nhà vệ sinh bị rò rỉ nước liên tục, cần sửa chữa gấp.',
    requestDate: '14/12/2024',
    status: 'ĐÃ XỬ LÝ',
    priority: 'TRUNG BÌNH',
    responseTime: '9:30 SA\n15-12-2024',
    notes: 'Đã thay thế vòi nước mới và kiểm tra hệ thống. Sinh viên vui lòng kiểm tra và báo lại nếu còn vấn đề.',
    attachedImages: ['ktx002_1.jpg'],
    processingHistory: [
      { date: '15/12/2024 09:30', action: 'Đã hoàn thành sửa chữa', staff: 'Phạm Văn Công' },
      { date: '14/12/2024 16:00', action: 'Đang tiến hành sửa chữa', staff: 'Phạm Văn Công' },
      { date: '14/12/2024 10:15', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: 'KTX003',
    student: {
      name: 'Lê Hoàng Nam',
      studentId: '2051063003',
      email: 'lhnam@student.tdtu.edu.vn',
      phone: '0934567890'
    },
    room: 'C312',
    building: 'Tòa C',
    category: 'Nội thất',
    deviceName: 'Tủ quần áo',
    description: 'Cánh tủ quần áo bị gãy bản lề, không đóng mở được.',
    requestDate: '13/12/2024',
    status: 'ĐÃ XỬ LÝ',
    priority: 'THẤP',
    responseTime: '2:45 CH\n14-12-2024',
    notes: 'Đã thay thế bản lề mới cho tủ quần áo. Hoàn thành.',
    attachedImages: ['ktx003_1.jpg'],
    processingHistory: [
      { date: '14/12/2024 14:45', action: 'Đã hoàn thành sửa chữa', staff: 'Trần Văn Dũng' },
      { date: '13/12/2024 15:20', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: 'KTX004',
    student: {
      name: 'Phạm Minh Châu',
      studentId: '2051063004',
      email: 'pmchau@student.tdtu.edu.vn',
      phone: '0945678901'
    },
    room: 'A203',
    building: 'Tòa A',
    category: 'Điện nước',
    deviceName: 'Máy lạnh',
    description: 'Máy lạnh không hoạt động, không lạnh. Phòng rất nóng, cần kiểm tra sớm.',
    requestDate: '15/12/2024',
    status: 'ĐANG XỬ LÝ',
    priority: 'CAO',
    responseTime: null,
    notes: 'Đang chờ kỹ thuật viên kiểm tra.',
    attachedImages: null,
    processingHistory: [
      { date: '15/12/2024 16:00', action: 'Đã phân công kỹ thuật viên', staff: 'Phạm Văn Công' },
      { date: '15/12/2024 11:20', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: 'KTX005',
    student: {
      name: 'Võ Thị Hương',
      studentId: '2051063005',
      email: 'vthuong@student.tdtu.edu.vn',
      phone: '0956789012'
    },
    room: 'B108',
    building: 'Tòa B',
    category: 'An ninh',
    deviceName: 'Khóa cửa',
    description: 'Khóa cửa phòng bị kẹt, không mở được từ trong. Cần hỗ trợ khẩn cấp.',
    requestDate: '15/12/2024',
    status: 'TỪ CHỐI',
    priority: 'CAO',
    responseTime: '5:00 CH\n15-12-2024',
    notes: 'Yêu cầu không hợp lệ. Khóa cửa đã được kiểm tra trước đó và hoạt động bình thường. Sinh viên vui lòng liên hệ trực tiếp để được hướng dẫn sử dụng.',
    attachedImages: null,
    processingHistory: [
      { date: '15/12/2024 17:00', action: 'Từ chối yêu cầu', staff: 'Trần Văn Dũng' },
      { date: '15/12/2024 13:45', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  },
  {
    id: 'KTX006',
    student: {
      name: 'Hoàng Đức Trí',
      studentId: '2051063006',
      email: 'hdtri@student.tdtu.edu.vn',
      phone: '0967890123'
    },
    room: 'C401',
    building: 'Tòa C',
    category: 'Vệ sinh',
    deviceName: 'Bồn cầu',
    description: 'Bồn cầu bị tắc nghẽn, không xả được nước.',
    requestDate: '14/12/2024',
    status: 'ĐANG XỬ LÝ',
    priority: 'CAO',
    responseTime: null,
    notes: 'Đã liên hệ công ty vệ sinh để xử lý.',
    attachedImages: null,
    processingHistory: [
      { date: '14/12/2024 17:30', action: 'Đang xử lý', staff: 'Phạm Văn Công' },
      { date: '14/12/2024 14:20', action: 'Tiếp nhận yêu cầu', staff: 'Hệ thống' }
    ]
  }
];

const STATUS_CONFIG = {
  'ĐANG XỬ LÝ': { className: 'processing', icon: '⏳', color: '#f59e0b' },
  'ĐÃ XỬ LÝ': { className: 'completed', icon: '✓', color: '#22c55e' },
  'TỪ CHỐI': { className: 'rejected', icon: '✕', color: '#ef4444' }
};

const PRIORITY_CONFIG = {
  'CAO': { className: 'high', icon: '🔴', label: 'Khẩn cấp' },
  'TRUNG BÌNH': { className: 'medium', icon: '🟡', label: 'Trung bình' },
  'THẤP': { className: 'low', icon: '🟢', label: 'Thấp' }
};

const StaffDormitoryRequests = () => {
  const [requests] = useState(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateSort, setDateSort] = useState('newest');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [editableNote, setEditableNote] = useState('');
  const [editableImages, setEditableImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Statistics
  const stats = useMemo(() => ({
    total: requests.length,
    processing: requests.filter(r => r.status === 'ĐANG XỬ LÝ').length,
    completed: requests.filter(r => r.status === 'ĐÃ XỬ LÝ').length,
    rejected: requests.filter(r => r.status === 'TỪ CHỐI').length
  }), [requests]);

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(requests.map(r => r.category))],
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
        r.student.email.toLowerCase().includes(term) ||
        r.room.toLowerCase().includes(term) ||
        r.deviceName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(r => r.category === categoryFilter);
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
  }, [requests, searchTerm, statusFilter, categoryFilter, dateFilter, dateSort]);

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setEditableNote(request.notes || '');
    setEditableImages(request.attachedImages || []);
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
    // Here you would call API to save the editable note and images
    console.log('Saving:', selectedRequest?.id, editableNote, editableImages);
    if (selectedRequest) {
      selectedRequest.notes = editableNote;
      selectedRequest.attachedImages = editableImages;
    }
    setIsEditing(false);
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => file.name);
    setEditableImages([...editableImages, ...newImages]);
  };

  return (
    <div className="dormitory-management">
      {/* Header */}
      <header className="dormitory-header">
        <div className="dormitory-header__info">
          <h1>Quản lý yêu cầu sửa chữa KTX</h1>
          <p>Xử lý và theo dõi các yêu cầu sửa chữa thiết bị từ sinh viên</p>
        </div>
        <div className="dormitory-header__actions">
          <button className="btn-export">
            <span className="btn-icon">📊</span>
            Xuất báo cáo
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="dormitory-stats">
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
        <div className="stat-card stat-card--completed" onClick={() => setStatusFilter(statusFilter === 'ĐÃ XỬ LÝ' ? 'all' : 'ĐÃ XỬ LÝ')}>
          <div className="stat-card__icon">✓</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.completed}</span>
            <span className="stat-card__label">Đã xử lý</span>
          </div>
        </div>
        <div className="stat-card stat-card--rejected" onClick={() => setStatusFilter(statusFilter === 'TỪ CHỐI' ? 'all' : 'TỪ CHỐI')}>
          <div className="stat-card__icon">✕</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.rejected}</span>
            <span className="stat-card__label">Từ chối</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="dormitory-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã, tên SV, phòng, thiết bị..."
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
            <option value="ĐÃ XỬ LÝ">Đã xử lý</option>
            <option value="TỪ CHỐI">Từ chối</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select date-input"
            placeholder="Chọn ngày"
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
      <div className="dormitory-main">
        {/* Left Panel - Request List */}
        <div className="dormitory-list-panel">
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
                      <div className="meta-row">
                        <span className="room-badge">🏠 {request.room}</span>
                        <span className={`priority-badge ${PRIORITY_CONFIG[request.priority].className}`}>
                          {PRIORITY_CONFIG[request.priority].icon}
                        </span>
                      </div>
                      <div className="meta-row">
                        <span className="device-name">🔧 {request.deviceName}</span>
                        <span className="request-date">📅 {request.requestDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className={`dormitory-detail-panel ${selectedRequest ? 'has-content' : ''}`}>
          {selectedRequest ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>Chi tiết yêu cầu #{selectedRequest.id}</h2>
                  <span className={`status-badge large ${STATUS_CONFIG[selectedRequest.status].className}`}>
                    {STATUS_CONFIG[selectedRequest.status].icon} {selectedRequest.status}
                  </span>
                  <span className={`priority-badge large ${PRIORITY_CONFIG[selectedRequest.priority].className}`}>
                    {PRIORITY_CONFIG[selectedRequest.priority].icon} {PRIORITY_CONFIG[selectedRequest.priority].label}
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
                      <label>Phòng</label>
                      <span className="highlight">{selectedRequest.room}</span>
                    </div>
                    <div className="info-item">
                      <label>Tòa nhà</label>
                      <span>{selectedRequest.building}</span>
                    </div>
                  </div>
                </section>

                {/* Request Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">🔧</span>
                    Thông tin yêu cầu sửa chữa
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Danh mục</label>
                      <span className="highlight">{selectedRequest.category}</span>
                    </div>
                    <div className="info-item">
                      <label>Tên thiết bị</label>
                      <span>{selectedRequest.deviceName}</span>
                    </div>
                    <div className="info-item">
                      <label>Mức độ ưu tiên</label>
                      <span className={`priority-badge ${PRIORITY_CONFIG[selectedRequest.priority].className}`}>
                        {PRIORITY_CONFIG[selectedRequest.priority].icon} {PRIORITY_CONFIG[selectedRequest.priority].label}
                      </span>
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
                      <label>Mô tả chi tiết</label>
                      <div className="description-box">
                        {selectedRequest.description}
                      </div>
                    </div>
                    <div className="info-item full-width">
                      <label>Hình ảnh đính kèm</label>
                      {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditing ? (
                        <div className="image-upload-box" style={{marginTop: '8px'}}>
                          <input 
                            type="file" 
                            id="image-upload-edit" 
                            accept="image/*" 
                            multiple
                            onChange={handleImageAdd}
                            hidden 
                          />
                          <label htmlFor="image-upload-edit" className="image-upload-label">
                            <span className="upload-icon">🖼️</span>
                            <span>Click để chọn hình ảnh</span>
                          </label>
                          {editableImages && editableImages.length > 0 && (
                            <div className="image-list">
                              {editableImages.map((img, idx) => (
                                <span key={idx} className="image-tag">{img}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : editableImages && editableImages.length > 0 ? (
                        <div className="image-list">
                          {editableImages.map((img, idx) => (
                            <a href="#" key={idx} className="image-link">
                              <span className="file-icon">🖼️</span>
                              {img}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{color: 'var(--dormitory-text-muted)', fontStyle: 'italic'}}>Chưa có hình ảnh đính kèm</span>
                      )}
                    </div>
                  </div>
                </section>

                {/* Notes Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">💬</span>
                    Ghi chú xử lý
                  </h3>
                  {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditing ? (
                    <textarea
                      className="notes-editable"
                      rows="4"
                      value={editableNote}
                      onChange={(e) => setEditableNote(e.target.value)}
                      placeholder="Nhập ghi chú xử lý..."
                    />
                  ) : (
                    <div className="notes-box">
                      {editableNote || 'Chưa có ghi chú xử lý'}
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
                        setEditableImages(selectedRequest.attachedImages || []);
                        setIsEditing(false);
                      }}>
                        <span>✕</span> Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-action btn-approve" onClick={() => handleProcess('complete')}>
                        <span>✓</span> Hoàn thành
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
                <span>🔧</span>
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
                {processAction === 'complete' && '✓ Hoàn thành yêu cầu'}
                {processAction === 'reject' && '✕ Từ chối yêu cầu'}
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
                <input type="text" value={`${selectedRequest?.student.name} - ${selectedRequest?.room}`} readOnly />
              </div>
              <div className="form-group">
                <label>Thiết bị</label>
                <input type="text" value={selectedRequest?.deviceName} readOnly />
              </div>
              <div className="form-group">
                <label>
                  {processAction === 'complete' && 'Ghi chú hoàn thành'}
                  {processAction === 'reject' && 'Lý do từ chối *'}
                </label>
                <textarea
                  rows="4"
                  placeholder={
                    processAction === 'complete' 
                      ? 'Nhập ghi chú hoàn thành (không bắt buộc)...'
                      : 'Nhập lý do từ chối...'
                  }
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowProcessModal(false)}>Hủy</button>
              <button 
                className={`btn-submit ${processAction === 'complete' ? 'approve' : 'reject'}`}
                onClick={handleSubmitProcess}
              >
                {processAction === 'complete' && 'Xác nhận hoàn thành'}
                {processAction === 'reject' && 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDormitoryRequests;
