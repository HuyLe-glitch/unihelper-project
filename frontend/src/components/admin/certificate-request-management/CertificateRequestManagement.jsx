import React, { useState, useMemo, useEffect } from 'react';
import './CertificateRequestManagement.css';

const CertificateRequestManagement = () => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' or 'certificates'
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // For certificate filtering

  // Modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load mock data
  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setCertificateTypes([
        {
          _id: '1',
          name: 'Chứng nhận sinh viên',
          description: 'Xác nhận tình trạng sinh viên đang học tập tại trường',
          certificateCount: 4,
          requestCount: 120
        },
        {
          _id: '2',
          name: 'Chứng nhận tốt nghiệp',
          description: 'Xác nhận sinh viên đã hoàn thành chương trình đào tạo',
          certificateCount: 2,
          requestCount: 85
        },
        {
          _id: '3',
          name: 'Bảng điểm',
          description: 'Bảng kết quả học tập các học kỳ',
          certificateCount: 3,
          requestCount: 200
        }
      ]);

      setCertificates([
        {
          _id: '1',
          name: 'Giấy xác nhận sinh viên (Tiếng Việt)',
          type: { _id: '1', name: 'Chứng nhận sinh viên' },
          description: 'Giấy xác nhận sinh viên đang theo học bằng tiếng Việt',
          requestCount: 60
        },
        {
          _id: '2',
          name: 'Giấy xác nhận sinh viên (Tiếng Anh)',
          type: { _id: '1', name: 'Chứng nhận sinh viên' },
          description: 'Giấy xác nhận sinh viên đang theo học bằng tiếng Anh',
          requestCount: 40
        },
        {
          _id: '3',
          name: 'Giấy xác nhận sinh viên (Có điểm)',
          type: { _id: '1', name: 'Chứng nhận sinh viên' },
          description: 'Giấy xác nhận sinh viên kèm theo bảng điểm',
          requestCount: 15
        },
        {
          _id: '4',
          name: 'Giấy xác nhận sinh viên (Thực tập)',
          type: { _id: '1', name: 'Chứng nhận sinh viên' },
          description: 'Giấy xác nhận để thực tập tại doanh nghiệp',
          requestCount: 5
        },
        {
          _id: '5',
          name: 'Bằng tốt nghiệp (Chính thức)',
          type: { _id: '2', name: 'Chứng nhận tốt nghiệp' },
          description: 'Bằng tốt nghiệp chính thức',
          requestCount: 50
        },
        {
          _id: '6',
          name: 'Giấy chứng nhận tốt nghiệp tạm thời',
          type: { _id: '2', name: 'Chứng nhận tốt nghiệp' },
          description: 'Giấy chứng nhận tạm thời trước khi có bằng chính thức',
          requestCount: 35
        },
        {
          _id: '7',
          name: 'Bảng điểm tổng kết (Tiếng Việt)',
          type: { _id: '3', name: 'Bảng điểm' },
          description: 'Bảng điểm tổng kết toàn khóa bằng tiếng Việt',
          requestCount: 100
        },
        {
          _id: '8',
          name: 'Bảng điểm tổng kết (Tiếng Anh)',
          type: { _id: '3', name: 'Bảng điểm' },
          description: 'Bảng điểm tổng kết toàn khóa bằng tiếng Anh',
          requestCount: 80
        },
        {
          _id: '9',
          name: 'Bảng điểm học kỳ',
          type: { _id: '3', name: 'Bảng điểm' },
          description: 'Bảng điểm của một học kỳ cụ thể',
          requestCount: 20
        }
      ]);

      setIsLoading(false);
    }, 500);
  }, []);

  // Filter types
  const filteredTypes = useMemo(() => {
    return certificateTypes.filter(type => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [certificateTypes, searchTerm]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || cert.type._id === filterType;
      return matchesSearch && matchesType;
    });
  }, [certificates, searchTerm, filterType]);

  // Statistics
  const typeStats = useMemo(() => ({
    total: certificateTypes.length,
    totalCertificates: certificateTypes.reduce((sum, t) => sum + t.certificateCount, 0)
  }), [certificateTypes]);

  const certificateStats = useMemo(() => ({
    total: certificates.length,
    totalRequests: certificates.reduce((sum, c) => sum + c.requestCount, 0)
  }), [certificates]);

  // Handlers
  const handleAddType = () => {
    setEditingItem(null);
    setShowTypeModal(true);
  };

  const handleEditType = (type) => {
    setEditingItem(type);
    setShowTypeModal(true);
  };

  const handleAddCertificate = () => {
    setEditingItem(null);
    setShowCertificateModal(true);
  };

  const handleEditCertificate = (certificate) => {
    setEditingItem(certificate);
    setShowCertificateModal(true);
  };

  const handleViewCertificates = (type) => {
    setActiveTab('certificates');
    setFilterType(type._id);
  };

  if (isLoading) {
    return (
      <div className="certificate-request-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="certificate-request-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Yêu cầu CTSV</h1>
            <p className="page-subtitle">Quản lý loại chứng nhận và danh sách chứng nhận</p>
          </div>
          <div className="header-actions">
            {activeTab === 'types' ? (
              <button className="btn btn-primary" onClick={handleAddType}>
                <span className="btn-icon">+</span>
                Thêm loại mới
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddCertificate}>
                <span className="btn-icon">+</span>
                Thêm chứng nhận mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('types');
              setFilterType('all');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">Loại chứng nhận</span>
            <span className="tab-badge">{typeStats.total}</span>
          </button>
          <button
            className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('certificates');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">📄</span>
            <span className="tab-text">Danh sách chứng nhận</span>
            <span className="tab-badge">{certificateStats.total}</span>
          </button>
        </div>
      </div>

      {/* Statistics - Only for certificates tab */}
      {activeTab === 'certificates' && (
        <div className="stats-grid">
          <div className="stat-card stat-teal">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Tổng chứng nhận</h3>
              <div className="stat-value">{certificateStats.total}</div>
            </div>
          </div>
          <div className="stat-card stat-orange">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <h3>Tổng yêu cầu</h3>
              <div className="stat-value">{certificateStats.totalRequests}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="search-and-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={activeTab === 'types' ? 'Tìm kiếm loại chứng nhận...' : 'Tìm kiếm chứng nhận...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {activeTab === 'certificates' && (
          <div className="filters-grid">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả loại</option>
              {certificateTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'types' ? (
        <div className="content-section">
          {filteredTypes.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không tìm thấy loại chứng nhận nào</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredTypes.map((type) => (
                <div key={type._id} className="item-card">
                  <h4 className="item-title">{type.name}</h4>
                  <p className="item-description">{type.description}</p>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-label">Chứng nhận:</span>
                      <span className="stat-value">{type.certificateCount}</span>
                    </div>
                    <div className="item-stat">
                      <span className="stat-label">Yêu cầu:</span>
                      <span className="stat-value">{type.requestCount}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewCertificates(type)}
                      title="Xem danh sách chứng nhận"
                    >
                      📄 Xem chứng nhận
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditType(type)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          {filteredCertificates.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không tìm thấy chứng nhận nào</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredCertificates.map((certificate) => (
                <div key={certificate._id} className="item-card">
                  <h4 className="item-title">{certificate.name}</h4>
                  <div className="type-tag">
                    <span className="type-tag-icon">📋</span>
                    {certificate.type.name}
                  </div>
                  <p className="item-description">{certificate.description}</p>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-label">Yêu cầu:</span>
                      <span className="stat-value">{certificate.requestCount}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditCertificate(certificate)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals (placeholder) */}
      {showTypeModal && (
        <div className="modal-overlay" onClick={() => setShowTypeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Chỉnh sửa loại chứng nhận' : 'Thêm loại mới'}</h2>
              <button className="close-btn" onClick={() => setShowTypeModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Form thêm/chỉnh sửa loại chứng nhận sẽ được hiển thị ở đây.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTypeModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary">
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCertificateModal && (
        <div className="modal-overlay" onClick={() => setShowCertificateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Chỉnh sửa chứng nhận' : 'Thêm chứng nhận mới'}</h2>
              <button className="close-btn" onClick={() => setShowCertificateModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Form thêm/chỉnh sửa chứng nhận sẽ được hiển thị ở đây.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowCertificateModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary">
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequestManagement;
