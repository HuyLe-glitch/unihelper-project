import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { semesterService } from '../../../services/semester';
import SemesterModal from './SemesterModal';
import './SemesterManagement.css';

const SemesterManagement = () => {
  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null });
  
  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load semesters từ API
  const loadSemesters = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await semesterService.getAllSemesters();
      if (response.success) {
        setSemesters(response.data);
      }
    } catch (error) {
      console.error('Lỗi load semesters:', error);
      showToast('Không thể tải danh sách học kỳ', 'error');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSemesters(true); // Lần đầu load mới show loading
  }, [loadSemesters]);

  // Get current active semester
  const currentSemester = useMemo(() => {
    return semesters.find(s => s.isActive);
  }, [semesters]);

  // Filter and search
  const filteredSemesters = useMemo(() => {
    return semesters.filter(semester =>
      semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semester.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (semester.templateId?.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [semesters, searchTerm]);

  // Pagination
  const paginatedSemesters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSemesters.slice(startIndex, startIndex + pageSize);
  }, [filteredSemesters, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSemesters.length / pageSize);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Handlers
  const handleAddSemester = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditSemester = (semester) => {
    setEditingItem(semester);
    setShowModal(true);
  };

  const handleDeleteClick = (semester) => {
    if (semester.isActive) {
      showToast('Không thể xóa học kỳ đang hoạt động!', 'error');
      return;
    }
    setDeleteConfirm({ show: true, item: semester });
  };

  const handleConfirmDelete = async () => {
    const semester = deleteConfirm.item;
    try {
      const response = await semesterService.deleteSemester(semester._id);
      if (response.success) {
        showToast('Đã xóa học kỳ thành công');
        loadSemesters();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể xóa học kỳ';
      showToast(message, 'error');
    } finally {
      setDeleteConfirm({ show: false, item: null });
    }
  };

  // Học kỳ được tự động kích hoạt bởi Backend dựa trên ngày hiện tại
  // Không cần nút kích hoạt thủ công

  const handleModalSuccess = (data, action) => {
    if (action === 'create') {
      showToast('Tạo học kỳ thành công!');
    } else {
      showToast('Cập nhật học kỳ thành công!');
    }
    loadSemesters();
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Reset page khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="semester-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="semester-management">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Quản lý Học kỳ</h1>
          <button className="add-btn" onClick={handleAddSemester}>
            <span className="btn-icon">+</span>
            Thêm học kỳ mới
          </button>
        </div>
      </div>

      {/* CURRENT SEMESTER CARD */}
      {currentSemester && (
        <div className="current-semester-card">
          <div className="current-label">HỌC KỲ ĐANG DIỄN RA</div>
          <h2 className="current-name">{currentSemester.name}</h2>
          <div className="current-details">
            <div className="current-time">
              <span className="time-icon">📅</span>
              <span className="time-text">
                {formatDate(currentSemester.startDate)} - {formatDate(currentSemester.endDate)}
              </span>
            </div>
            <div className="current-badge active-badge">
              <span className="badge-dot"></span>
              Đang hoạt động
            </div>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="table-section">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm học kỳ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="semester-table">
            <thead>
              <tr>
                <th className="th-left">Tên học kỳ</th>
                <th className="th-center">Loại</th>
                <th className="th-center">Năm học</th>
                <th className="th-left">Thời gian</th>
                <th className="th-center">Trạng thái</th>
                <th className="th-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSemesters.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">📭</span>
                      <p>Không tìm thấy học kỳ nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSemesters.map((semester) => (
                  <tr key={semester._id}>
                    <td className="td-left">
                      <strong className="semester-name">{semester.name}</strong>
                    </td>
                    <td className="td-center">
                      <span className="semester-type-badge">
                        {semester.templateId?.code || '-'}
                      </span>
                    </td>
                    <td className="td-center">{semester.academicYear}</td>
                    <td className="td-left">
                      {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                    </td>
                    <td className="td-center">
                      {semester.isActive ? (
                        <span className="status-badge active">
                          <span className="badge-dot"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="status-badge inactive">Đã đóng</span>
                      )}
                    </td>
                    <td className="td-right">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditSemester(semester)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(semester)}
                          title="Xóa"
                          disabled={semester.isActive}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {paginatedSemesters.length} / {filteredSemesters.length} học kỳ
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`page-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="page-ellipsis">...</span>;
                }
                return null;
              })}
              <button
                className="page-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Semester Modal */}
      <SemesterModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        editingItem={editingItem}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-overlay" onClick={() => setDeleteConfirm({ show: false, item: null })}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">⚠️</span>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="delete-dialog-content">
              <p>
                Bạn có chắc chắn muốn xóa học kỳ{' '}
                <strong>"{deleteConfirm.item?.name}"</strong>?
              </p>
              <p className="delete-warning-text">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="delete-dialog-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteConfirm({ show: false, item: null })}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Xóa
              </button>
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

export default SemesterManagement;
