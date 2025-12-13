import React, { useState, useEffect } from 'react';
import './RequestManagement.css';

// Mock data cho demo giao diện
const mockRequests = [
  {
    _id: 'REQ001',
    studentId: '520H0001',
    student: {
      name: 'Nguyễn Văn An',
      class: '520H01',
      faculty: 'Công nghệ Thông tin',
      email: 'an.nguyen@student.tdtu.edu.vn',
      phone: '0123456789'
    },
    certificateType: { name: 'Chứng nhận CTSV' },
    certificateName: { 
      name: 'Xác nhận tạm hoãn nghĩa vụ quân sự',
      notes: 'Sinh viên cần nộp đầy đủ hồ sơ theo quy định. Thời gian xử lý 3-5 ngày làm việc.'
    },
    semester: 'HK1 2024-2025',
    status: 'ĐANG XỬ LÝ',
    createdAt: '2024-10-12T08:30:00Z',
    attachments: [
      { url: '#', originalName: 'ho_so_sv.pdf' },
      { url: '#', originalName: 'bang_diem.pdf' }
    ]
  },
  {
    _id: 'REQ002',
    studentId: '520H0002',
    student: {
      name: 'Trần Thị Bình',
      class: '520H02',
      faculty: 'Kinh tế',
      email: 'binh.tran@student.tdtu.edu.vn',
      phone: '0987654321'
    },
    certificateType: { name: 'Chứng nhận CTSV' },
    certificateName: { 
      name: 'Giấy xác nhận sinh viên',
      notes: 'Giấy xác nhận được cấp trong ngày nếu hồ sơ đầy đủ.'
    },
    semester: 'HK1 2024-2025',
    status: 'HỢP LỆ',
    createdAt: '2024-10-11T14:20:00Z',
    attachments: [
      { url: '#', originalName: 'don_xin_giay.pdf' }
    ]
  },
  {
    _id: 'REQ003',
    studentId: '520H0003',
    student: {
      name: 'Lê Hoàng Nam',
      class: '520H03',
      faculty: 'Kỹ thuật',
      email: 'nam.le@student.tdtu.edu.vn',
      phone: '0369258147'
    },
    certificateType: { name: 'Chứng nhận CTSV' },
    certificateName: { 
      name: 'Xác nhận kết quả học tập',
      notes: 'Cần kiểm tra điểm trung bình tích lũy trước khi cấp chứng nhận.'
    },
    semester: 'HK1 2024-2025',
    status: 'KHÔNG HỢP LỆ',
    createdAt: '2024-10-10T16:45:00Z',
    attachments: []
  },
  {
    _id: 'REQ004',
    studentId: '520H0004',
    student: {
      name: 'Phạm Minh Châu',
      class: '520H01',
      faculty: 'Công nghệ Thông tin',
      email: 'chau.pham@student.tdtu.edu.vn',
      phone: '0147258369'
    },
    certificateType: { name: 'Chứng nhận CTSV' },
    certificateName: { 
      name: 'Giấy chứng nhận tốt nghiệp',
      notes: 'Sinh viên cần hoàn thành đầy đủ chương trình học và nộp khóa luận.'
    },
    semester: 'HK1 2024-2025',
    status: 'ĐANG XỬ LÝ',
    createdAt: '2024-10-08T10:15:00Z',
    attachments: [
      { url: '#', originalName: 'khoa_luan.pdf' },
      { url: '#', originalName: 'bang_diem_tot_nghiep.pdf' }
    ]
  }
];

const RequestManagement = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNote, setActionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch chi tiết yêu cầu khi chọn (mock)
  const handleSelectRequest = (requestId) => {
    const request = requests.find(req => req._id === requestId);
    setSelectedRequest(request);
    setActionNote(''); // Reset ghi chú
  };

  // Xử lý phê duyệt/từ chối (mock)
  const handleProcessRequest = (action) => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newStatus = action === 'approve' ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ';
      
      // Update status in mock data
      const updatedRequests = requests.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: newStatus }
          : req
      );
      
      setRequests(updatedRequests);
      setSelectedRequest({ ...selectedRequest, status: newStatus });
      setActionNote('');
      setIsProcessing(false);
      
      // Show success message
      alert(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu thành công!`);
    }, 1500);
  };

  // Lọc danh sách yêu cầu
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.certificateName?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status) => {
    const statusMap = {
      'ĐANG XỬ LÝ': 'Chờ xử lý',
      'HỢP LỆ': 'Đã duyệt',
      'KHÔNG HỢP LỆ': 'Đã từ chối',
      'pending': 'Chờ xử lý',
      'approved': 'Đã duyệt',
      'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'ĐANG XỬ LÝ' || status === 'pending') return 'status-pending';
    if (status === 'HỢP LỆ' || status === 'approved') return 'status-approved';
    if (status === 'KHÔNG HỢP LỀ' || status === 'rejected') return 'status-rejected';
    return '';
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="request-management">
      {/* CỘT 1: DANH SÁCH YÊU CẦU */}
      <div className="request-list-column">
        <div className="list-header">
          <h2>Yêu cầu chứng nhận CTSV</h2>
          
          {/* Bộ lọc và Tìm kiếm */}
          <div className="filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm theo tên SV hoặc mã yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="status-filter">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ĐANG XỬ LÝ">Chờ xử lý</option>
                <option value="HỢP LỆ">Đã duyệt</option>
                <option value="KHÔNG HỢP LỆ">Đã từ chối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách yêu cầu */}
        <div className="request-list">
          {filteredRequests.length === 0 ? (
            <div className="no-requests">Không có yêu cầu nào</div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`request-item ${selectedRequest?._id === request._id ? 'selected' : ''}`}
                onClick={() => handleSelectRequest(request._id)}
              >
                <div className="request-student">
                  <div className="student-name">{request.student?.name || 'N/A'}</div>
                  <div className="student-id">MSSV: {request.studentId || 'N/A'}</div>
                </div>
                
                <div className="request-info">
                  <div className="certificate-name">
                    {request.certificateName?.name || 'N/A'}
                  </div>
                  <div className="request-meta">
                    <span className={`status ${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    <span className="request-date">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CỘT 2: CHI TIẾT YÊU CẦU */}
      <div className="request-detail-column">
        {!selectedRequest ? (
          <div className="no-selection">
            <div className="no-selection-content">
              <h3>Chọn một yêu cầu để xem chi tiết</h3>
              <p>Nhấp vào yêu cầu bên trái để hiển thị thông tin đầy đủ</p>
            </div>
          </div>
        ) : (
          <div className="request-detail">
            {/* THẺ 1: THÔNG TIN SINH VIÊN */}
            <div className="detail-card student-card">
              <div className="card-header">
                <h3>Thông tin Sinh viên</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <label>Họ và tên:</label>
                  <span>{selectedRequest.student?.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>MSSV:</label>
                  <span>{selectedRequest.studentId || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Lớp:</label>
                  <span>{selectedRequest.student?.class || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Khoa:</label>
                  <span>{selectedRequest.student?.faculty || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedRequest.student?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Điện thoại:</label>
                  <span>{selectedRequest.student?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* THẺ 2: THÔNG TIN YÊU CẦU */}
            <div className="detail-card request-card">
              <div className="card-header">
                <h3>Thông tin Yêu cầu</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <label>Mã yêu cầu:</label>
                  <span>{selectedRequest._id}</span>
                </div>
                <div className="info-row">
                  <label>Loại chứng nhận:</label>
                  <span>{selectedRequest.certificateType?.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Tên chứng nhận:</label>
                  <span>{selectedRequest.certificateName?.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Học kỳ:</label>
                  <span>{selectedRequest.semester || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Ngày yêu cầu:</label>
                  <span>{formatDate(selectedRequest.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={`status ${getStatusClass(selectedRequest.status)}`}>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* THẺ 3: FILE ĐÍNH KÈM & LƯU Ý */}
            <div className="detail-card files-card">
              <div className="card-header">
                <h3>File đính kèm & Lưu ý</h3>
              </div>
              <div className="card-content">
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 ? (
                  <div className="attachments">
                    <label>File đính kèm:</label>
                    {selectedRequest.attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          📎 {file.originalName || `File ${index + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-attachments">Không có file đính kèm</div>
                )}
                
                {selectedRequest.certificateName?.notes && (
                  <div className="system-notes">
                    <label>Lưu ý hệ thống:</label>
                    <div className="notes-content">
                      {selectedRequest.certificateName.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* THẺ 4: KHU VỰC XỬ LÝ */}
            <div className="detail-card action-card">
              <div className="card-header">
                <h3>Xử lý Yêu cầu</h3>
              </div>
              <div className="card-content">
                <div className="action-note">
                  <label>Ghi chú/Phản hồi:</label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Nhập lý do từ chối hoặc ghi chú thêm..."
                    rows="4"
                    className="note-textarea"
                  />
                </div>
                
                <div className="action-buttons">
                  <button
                    onClick={() => handleProcessRequest('approve')}
                    disabled={isProcessing || selectedRequest.status === 'HỢP LỆ'}
                    className="btn-approve"
                  >
                    {isProcessing ? 'Đang xử lý...' : '✓ Phê duyệt'}
                  </button>
                  
                  <button
                    onClick={() => handleProcessRequest('reject')}
                    disabled={isProcessing || selectedRequest.status === 'KHÔNG HỢP LỆ'}
                    className="btn-reject"
                  >
                    {isProcessing ? 'Đang xử lý...' : '✗ Từ chối'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestManagement;