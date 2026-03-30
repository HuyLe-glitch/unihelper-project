import React, { useState, useMemo, useEffect, useCallback } from 'react';
import certificateService from '../../../services/certificate';
import TypeFormModal from './TypeFormModal';
import CertificateFormModal from './CertificateFormModal';
import CMCustomDropdown from './CMCustomDropdown';
import './CertificateManagement.css';

const CertificateManagement = () => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' = loại chứng nhận, 'certificates' = chứng nhận
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [types, setTypes] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [preSelectedTypeId, setPreSelectedTypeId] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, 
    item: null, 
    type: null,
    error: null,
    isDeleting: false 
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  /**
   * Show toast notification
   */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  /**
   * Fetch all data từ API
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [typesRes, certificatesRes] = await Promise.all([
        certificateService.getAllTypes(),
        certificateService.getAllCertificates()
      ]);

      setTypes(typesRes.data || []);
      setCertificates(certificatesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // TYPE HANDLERS
  // ==========================================

  const handleAddType = () => {
    setEditingType(null);
    setShowTypeModal(true);
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setShowTypeModal(true);
  };

  const handleTypeSubmit = async (data) => {
    try {
      if (editingType) {
        // Update
        const result = await certificateService.updateType(editingType._id, data);
        setTypes(prev => prev.map(t => t._id === editingType._id ? result.data : t));
        showToast('Cập nhật loại chứng nhận thành công');
      } else {
        // Create
        const result = await certificateService.createType(data);
        setTypes(prev => [...prev, result.data]);
        showToast('Thêm loại chứng nhận thành công');
      }
    } catch (error) {
      // Re-throw để modal hiển thị lỗi inline
      const apiError = error.response?.data || error;
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        field: apiError.field
      };
    }
  };

  const handleDeleteTypeClick = async (type) => {
    try {
      // Gọi API kiểm tra trước khi hiện dialog
      const result = await certificateService.checkCanDeleteType(type._id);
      
      if (result.canDelete) {
        // Có thể xóa - hiện confirmation dialog
        const certificateCount = certificates.filter(c => c.certificateType?._id === type._id).length;
        setDeleteConfirm({ 
          show: true, 
          item: type, 
          type: 'type',
          certificateCount,
          error: null,
          isDeleting: false
        });
      } else {
        // Không thể xóa - hiện error dialog
        setDeleteConfirm({ 
          show: true, 
          item: type, 
          type: 'type',
          error: result.data.message,
          relatedRequestsCount: result.data.relatedRequestsCount,
          isDeleting: false
        });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể kiểm tra trạng thái xóa', 'error');
    }
  };

  const handleConfirmDeleteType = async () => {
    const type = deleteConfirm.item;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await certificateService.deleteType(type._id);
      setTypes(prev => prev.filter(t => t._id !== type._id));
      setCertificates(prev => prev.filter(c => c.certificateType?._id !== type._id));
      showToast(`Đã xóa loại chứng nhận "${type.name}"`);
      setDeleteConfirm({ show: false, item: null, type: null, error: null, isDeleting: false });
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa loại chứng nhận', 'error');
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // ==========================================
  // CERTIFICATE HANDLERS
  // ==========================================

  const handleAddCertificate = (typeId = null) => {
    setEditingCertificate(null);
    setPreSelectedTypeId(typeId);
    setShowCertificateModal(true);
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    setPreSelectedTypeId(null);
    setShowCertificateModal(true);
  };

  const handleCertificateSubmit = async (data) => {
    try {
      if (editingCertificate) {
        // Update
        const result = await certificateService.updateCertificate(editingCertificate._id, data);
        setCertificates(prev => prev.map(c => c._id === editingCertificate._id ? result.data : c));
        showToast('Cập nhật chứng nhận thành công');
      } else {
        // Create single
        const result = await certificateService.createCertificate(data);
        setCertificates(prev => [...prev, result.data]);
        showToast('Thêm chứng nhận thành công');
      }
    } catch (error) {
      const apiError = error.response?.data || error;
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        field: apiError.field
      };
    }
  };

  const handleBatchCertificateSubmit = async (typeId, certificatesData) => {
    try {
      const result = await certificateService.createCertificatesBatch(typeId, certificatesData);
      // Thêm certificates mới vào state
      setCertificates(prev => [...prev, ...(result.data || [])]);
      showToast(result.message || `Đã thêm ${result.count} chứng nhận`);
    } catch (error) {
      const apiError = error.response?.data || error;
      // Re-throw với format cho batch errors
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        errors: apiError.errors || []
      };
    }
  };

  const handleDeleteCertificateClick = async (certificate) => {
    try {
      // Gọi API kiểm tra trước khi hiện dialog
      const result = await certificateService.checkCanDeleteCertificate(certificate._id);
      
      if (result.canDelete) {
        // Có thể xóa - hiện confirmation dialog
        setDeleteConfirm({ 
          show: true, 
          item: certificate, 
          type: 'certificate',
          error: null,
          isDeleting: false
        });
      } else {
        // Không thể xóa - hiện error dialog
        setDeleteConfirm({ 
          show: true, 
          item: certificate, 
          type: 'certificate',
          error: result.data.message,
          relatedRequestsCount: result.data.relatedRequestsCount,
          isDeleting: false
        });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể kiểm tra trạng thái xóa', 'error');
    }
  };

  const handleConfirmDeleteCertificate = async () => {
    const certificate = deleteConfirm.item;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await certificateService.deleteCertificate(certificate._id);
      setCertificates(prev => prev.filter(c => c._id !== certificate._id));
      showToast(`Đã xóa chứng nhận "${certificate.name}"`);
      setDeleteConfirm({ show: false, item: null, type: null, error: null, isDeleting: false });
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa chứng nhận', 'error');
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, item: null, type: null, error: null, isDeleting: false });
  };

  const handleViewCertificates = (type) => {
    setActiveTab('certificates');
    setFilterType(type._id);
  };

  // ==========================================
  // FILTERING & STATISTICS
  // ==========================================

  const filteredTypes = useMemo(() => {
    return types.filter(type => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [types, searchTerm]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || cert.certificateType?._id === filterType;
      return matchesSearch && matchesType;
    });
  }, [certificates, searchTerm, filterType]);

  const typeStats = useMemo(() => ({
    total: types.length,
    totalCertificates: certificates.length
  }), [types, certificates]);

  const certificateStats = useMemo(() => ({
    total: filteredCertificates.length
  }), [filteredCertificates]);

  // Count certificates per type
  const getCertificateCountForType = (typeId) => {
    return certificates.filter(c => c.certificateType?._id === typeId).length;
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="certificate-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="certificate-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Loại chứng nhận & Chứng nhận</h1>
            <p className="page-subtitle">Quản lý loại chứng nhận và danh sách chứng nhận CTSV</p>
          </div>
          <div className="header-actions">
            {activeTab === 'types' ? (
              <button className="btn btn-primary" onClick={handleAddType}>
                <span className="btn-icon">+</span>
                Thêm loại mới
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleAddCertificate()}>
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
            <span className="tab-icon">📜</span>
            <span className="tab-text">Danh sách chứng nhận</span>
            <span className="tab-badge">{certificates.length}</span>
          </button>
        </div>
      </div>

      {/* Statistics - Only for certificates tab */}
      {activeTab === 'certificates' && (
        <div className="stats-grid">
          <div className="stat-card stat-teal">
            <div className="stat-icon">📜</div>
            <div className="stat-content">
              <h3>Tổng chứng nhận</h3>
              <div className="stat-value">{certificateStats.total}</div>
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
            <CMCustomDropdown
              options={[
                { value: 'all', label: 'Tất cả loại' },
                ...types.map(type => ({
                  value: type._id,
                  label: type.name
                }))
              ]}
              value={filterType}
              onChange={(value) => setFilterType(value)}
              placeholder="Chọn loại chứng nhận"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'types' ? (
        <div className="content-section">
          {filteredTypes.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>{searchTerm ? 'Không tìm thấy loại chứng nhận nào' : 'Chưa có loại chứng nhận nào'}</p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={handleAddType}>
                  Thêm loại chứng nhận đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="items-grid">
              {filteredTypes.map((type) => (
                <div key={type._id} className="item-card">
                  {/* Nút thêm nhanh - Góc trên bên trái */}
                  <button
                    className="btn-quick-add"
                    onClick={() => handleAddCertificate(type._id)}
                    title="Thêm chứng nhận vào loại"
                  >
                    ➕
                  </button>
                  <h4 className="item-title">{type.name}</h4>
                  <p className="item-description">{type.description || 'Không có mô tả'}</p>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-label">Chứng nhận:</span>
                      <span className="stat-value">{getCertificateCountForType(type._id)}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewCertificates(type)}
                      title="Xem danh sách chứng nhận"
                    >
                      📜 Xem chứng nhận
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditType(type)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteTypeClick(type)}
                      title="Xóa loại chứng nhận"
                    >
                      🗑️
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
              <p>{searchTerm || filterType !== 'all' ? 'Không tìm thấy chứng nhận nào' : 'Chưa có chứng nhận nào'}</p>
              {!searchTerm && filterType === 'all' && types.length > 0 && (
                <button className="btn btn-primary" onClick={() => handleAddCertificate()}>
                  Thêm chứng nhận đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="items-grid">
              {filteredCertificates.map((certificate) => (
                <div key={certificate._id} className="item-card">
                  <h4 className="item-title">{certificate.name}</h4>
                  <div className="type-tag">
                    {certificate.certificateType?.name || 'Không có loại'}
                  </div>
                  <p className="item-description">{certificate.description || 'Không có mô tả'}</p>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditCertificate(certificate)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteCertificateClick(certificate)}
                      title="Xóa chứng nhận"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Type Modal */}
      <TypeFormModal
        isOpen={showTypeModal}
        onClose={() => {
          setShowTypeModal(false);
          setEditingType(null);
        }}
        onSubmit={handleTypeSubmit}
        editingType={editingType}
      />

      {/* Certificate Modal */}
      <CertificateFormModal
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false);
          setEditingCertificate(null);
          setPreSelectedTypeId(null);
        }}
        onSubmit={handleCertificateSubmit}
        onBatchSubmit={handleBatchCertificateSubmit}
        editingCertificate={editingCertificate}
        types={types}
        preSelectedTypeId={preSelectedTypeId}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-overlay" onClick={handleCancelDelete}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">{deleteConfirm.error ? '🚫' : '⚠️'}</span>
              <h3>{deleteConfirm.error ? 'Không thể xóa' : 'Xác nhận xóa'}</h3>
            </div>
            <div className="delete-dialog-content">
              {deleteConfirm.error ? (
                // Error dialog - không thể xóa
                <div className="delete-error-content">
                  <p className="delete-error-message">{deleteConfirm.error}</p>
                  <p className="delete-error-hint">
                    Vui lòng xử lý các yêu cầu liên quan trước khi xóa {deleteConfirm.type === 'type' ? 'loại chứng nhận' : 'chứng nhận'} này.
                  </p>
                </div>
              ) : (
                // Confirmation dialog - có thể xóa
                <>
                  {deleteConfirm.type === 'type' ? (
                    <>
                      <p>
                        Bạn có chắc chắn muốn xóa loại chứng nhận{' '}
                        <strong>"{deleteConfirm.item?.name}"</strong>?
                      </p>
                      {deleteConfirm.certificateCount > 0 && (
                        <p className="delete-warning-text">
                          ⚠️ Sẽ xóa luôn {deleteConfirm.certificateCount} chứng nhận trong loại này!
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      Bạn có chắc chắn muốn xóa chứng nhận{' '}
                      <strong>"{deleteConfirm.item?.name}"</strong>?
                    </p>
                  )}
                  <p className="delete-warning-text">
                    Hành động này không thể hoàn tác.
                  </p>
                </>
              )}
            </div>
            <div className="delete-dialog-actions">
              {deleteConfirm.error ? (
                // Error dialog - chỉ có nút Đã hiểu
                <button
                  className="btn btn-primary"
                  onClick={handleCancelDelete}
                >
                  Đã hiểu
                </button>
              ) : (
                // Confirmation dialog - có nút Hủy và Xóa
                <>
                  <button
                    className="btn btn-outline"
                    onClick={handleCancelDelete}
                    disabled={deleteConfirm.isDeleting}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={deleteConfirm.type === 'type' ? handleConfirmDeleteType : handleConfirmDeleteCertificate}
                    disabled={deleteConfirm.isDeleting}
                  >
                    {deleteConfirm.isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
