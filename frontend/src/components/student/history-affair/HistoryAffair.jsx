import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoryAffair.css';

const HistoryAffair = () => {
  const navigate = useNavigate();
  
  // Dữ liệu mẫu
  const [affairsHistory] = useState([
    {
      id: '01146969',
      certificateType: 'Nghĩa vụ quân sự',
      certificateName: 'Tạm hoãn nghĩa vụ quân sự',
      semester: 'HK1 - 2025',
      requestDate: '2025-08-16',
      status: 'valid',
      responseTime: '4:45 CH\n19-08-2025',
      notes: 'Sinh viên vui lòng đến P. CTHSSV (A0003) nhận bản chính giấy chứng nhận sinh viên. Thời gian từ ngày 19/8/2025 - 04/9/2025. Nếu SV không nhận hồ sơ theo thời gian nêu trên vui lòng liên hệ trực tiếp Phòng để nêu rõ lý do.',
      file: '01146969.pdf',
    },
    {
      id: '01136977',
      certificateType: 'Bổ sung hồ sơ cá nhân',
      certificateName: 'Bổ sung hồ sơ cá nhân',
      semester: 'HK1 - 2024',
      requestDate: '2024-08-30',
      status: 'valid',
      responseTime: '2:38 CH\n05-09-2024',
      notes: 'Sinh viên vui lòng đến P. CTHSSV (A0003) nhận bản chính giấy chứng nhận sinh viên. Thời gian từ ngày 05/9/2024 – 19/9/2024. Nếu SV không nhận hồ sơ theo thời gian nêu trên vui lòng liên hệ trực tiếp Phòng CHSSV để nêu rõ lý do.',
      file: '01136977.pdf',
    },
    {
      id: '01125588',
      certificateType: 'Xác nhận sinh viên',
      certificateName: 'Xác nhận sinh viên đang học',
      semester: 'HK2 - 2024',
      requestDate: '2024-12-10',
      status: 'processing',
      responseTime: '-',
      notes: 'Yêu cầu đang được xử lý bởi Phòng CTSV.',
      file: '',
    },
    {
      id: '01098765',
      certificateType: 'Bảng điểm',
      certificateName: 'Bảng điểm tích lũy',
      semester: 'HK1 - 2024',
      requestDate: '2024-07-20',
      status: 'invalid',
      responseTime: '10:30 SA\n25-07-2024',
      notes: 'Yêu cầu không hợp lệ do sinh viên chưa hoàn thành học phí học kỳ 1.',
      file: '',
    },
  ]);

  // States cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const handleCreateRequest = () => {
    navigate('/student/student-affairs/');
  };

  // Hàm lấy label và class cho status
  const getStatusInfo = (status) => {
    const statusMap = {
      valid: { label: 'Hợp lệ', class: 'status-valid', icon: '✓' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      invalid: { label: 'Không hợp lệ', class: 'status-invalid', icon: '✕' },
    };
    return statusMap[status] || statusMap.processing;
  };

  // Tính toán thống kê
  const statistics = useMemo(() => {
    return {
      total: affairsHistory.length,
      valid: affairsHistory.filter(item => item.status === 'valid').length,
      processing: affairsHistory.filter(item => item.status === 'processing').length,
      invalid: affairsHistory.filter(item => item.status === 'invalid').length,
    };
  }, [affairsHistory]);

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = [...affairsHistory];

    // Filter theo search term
    if (searchTerm) {
      result = result.filter(item =>
        item.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo semester
    if (semesterFilter !== 'all') {
      result = result.filter(item => item.semester === semesterFilter);
    }

    // Filter theo status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort theo thời gian
    result.sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [affairsHistory, searchTerm, semesterFilter, statusFilter, sortOrder]);

  // Lấy danh sách semester unique
  const semesters = useMemo(() => {
    return [...new Set(affairsHistory.map(item => item.semester))];
  }, [affairsHistory]);

  return (
    <div className="history-affair-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📋 Lịch sử Công tác sinh viên</h1>
          <button className="create-btn" onClick={handleCreateRequest}>
            <span className="btn-icon">+</span>
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card stat-valid">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.valid}</div>
            <div className="stat-label">Hợp lệ</div>
          </div>
        </div>
        <div className="stat-card stat-processing">
          <div className="stat-icon">⟳</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-card stat-invalid">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.invalid}</div>
            <div className="stat-label">Không hợp lệ</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-wrapper">
          {/* Search */}
          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="🔍 Tìm theo mã, loại yêu cầu, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Semester Filter */}
          <div className="filter-group">
            <label className="filter-label">📅 Học kỳ</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả học kỳ</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">📌 Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="valid">Hợp lệ</option>
              <option value="processing">Đang xử lý</option>
              <option value="invalid">Không hợp lệ</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-group">
            <label className="filter-label">⏰ Sắp xếp</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section - FULL WIDTH */}
      <div className="table-section">
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Loại chứng nhận</th>
                <th>Tên chứng nhận</th>
                <th>Học kỳ xét</th>
                <th>Ngày yêu cầu</th>
                <th>Trạng thái</th>
                <th>Phản hồi lúc</th>
                <th>Lưu ý</th>
                <th>File đính kèm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="cell-id">
                        <strong>{item.id}</strong>
                      </td>
                      <td className="cell-type">{item.certificateType}</td>
                      <td className="cell-name">{item.certificateName}</td>
                      <td className="cell-semester">{item.semester}</td>
                      <td className="cell-date">
                        {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="cell-status">
                        <span className={`status-badge ${statusInfo.class}`}>
                          <span className="status-icon">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="cell-response">
                        {item.responseTime.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i === 0 && <br />}
                          </React.Fragment>
                        ))}
                      </td>
                      <td className="cell-notes">
                        <div className="notes-content">{item.notes}</div>
                      </td>
                      <td className="cell-file">
                        {item.file ? (
                          <a href="#" className="file-link">
                            <span className="file-icon">📥</span>
                            <span className="file-name">{item.file}</span>
                          </a>
                        ) : (
                          <span className="no-file">-</span>
                        )}
                      </td>
                      <td className="cell-action">
                        {item.status === 'valid' && (
                          <button className="action-btn action-confirm">
                            ✓ Xác nhận
                          </button>
                        )}
                        {item.status === 'processing' && (
                          <button className="action-btn action-view">
                            👁 Xem
                          </button>
                        )}
                        {item.status === 'invalid' && (
                          <button className="action-btn action-resubmit">
                            🔄 Gửi lại
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">📭</span>
                      <p>Không tìm thấy yêu cầu nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryAffair;
