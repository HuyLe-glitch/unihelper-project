import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './FacultyMajorManagement.css';
import FacultyFormModal from './FacultyFormModal';
import MajorFormModal from './MajorFormModal';
import { facultyService } from '../../../services/faculty';
import { majorService } from '../../../services/major';

/**
 * FacultyMajorManagement - Quản lý Khoa và Chuyên ngành
 */
const FacultyMajorManagement = () => {
  const [activeTab, setActiveTab] = useState('faculties');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');

  // Modals
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', item: null });

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch faculties from API
  const fetchFaculties = useCallback(async () => {
    try {
      const response = await facultyService.getAllFaculties();
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      showToast('Không thể tải danh sách khoa', 'error');
    }
  }, [showToast]);

  // Fetch majors from API
  const fetchMajors = useCallback(async () => {
    try {
      const response = await majorService.getAllMajors();
      if (response.success) {
        setMajors(response.data);
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
      showToast('Không thể tải danh sách chuyên ngành', 'error');
    }
  }, [showToast]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFaculties(), fetchMajors()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchFaculties, fetchMajors]);

  // Filter faculties
  const filteredFaculties = useMemo(() => {
    return faculties.filter(faculty => {
      const matchesSearch =
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [faculties, searchTerm]);

  // Filter majors
  const filteredMajors = useMemo(() => {
    return majors.filter(major => {
      const matchesSearch =
        major.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        major.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFaculty = filterFaculty === 'all' || major.faculty?._id === filterFaculty;
      return matchesSearch && matchesFaculty;
    });
  }, [majors, searchTerm, filterFaculty]);

  // Statistics
  const facultyStats = useMemo(() => ({
    total: faculties.length,
    totalMajors: faculties.reduce((sum, f) => sum + (f.majorCount || 0), 0)
  }), [faculties]);

  const majorStats = useMemo(() => ({
    total: majors.length
  }), [majors]);

  // ============ FACULTY HANDLERS ============

  const handleAddFaculty = () => {
    setEditingItem(null);
    setShowFacultyModal(true);
  };

  const handleEditFaculty = (faculty) => {
    setEditingItem(faculty);
    setShowFacultyModal(true);
  };

  const handleSubmitFaculty = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const response = await facultyService.updateFaculty(editingItem._id, formData);
        if (response.success) {
          showToast('Cập nhật khoa thành công!', 'success');
          setShowFacultyModal(false);
          await fetchFaculties();
          await fetchMajors();
        }
      } else {
        const response = await facultyService.createFaculty(formData);
        if (response.success) {
          showToast('Thêm khoa mới thành công!', 'success');
          setShowFacultyModal(false);
          await fetchFaculties();
        }
      }
    } catch (error) {
      console.error('Error submitting faculty:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa Faculty
  const handleDeleteFaculty = (faculty) => {
    setDeleteConfirm({
      show: true,
      type: 'faculty',
      item: faculty
    });
  };

  const confirmDeleteFaculty = async () => {
    const faculty = deleteConfirm.item;
    try {
      const response = await facultyService.deleteFaculty(faculty._id);
      if (response.success) {
        showToast(`Đã xóa khoa "${faculty.name}" thành công!`, 'success');
        await fetchFaculties();
        await fetchMajors();
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      showToast(error.response?.data?.message || 'Không thể xóa khoa', 'error');
    } finally {
      setDeleteConfirm({ show: false, type: '', item: null });
    }
  };

  // ============ MAJOR HANDLERS ============

  const handleAddMajor = () => {
    setEditingItem(null);
    setShowMajorModal(true);
  };

  const handleEditMajor = (major) => {
    setEditingItem(major);
    setShowMajorModal(true);
  };

  const handleSubmitMajor = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Chế độ Edit - gọi API update
        const response = await majorService.updateMajor(editingItem._id, formData);
        if (response.success) {
          showToast('Cập nhật chuyên ngành thành công!', 'success');
          setShowMajorModal(false);
          await fetchMajors();
        }
      } else if (formData.isBatch) {
        // Chế độ Batch Add - gọi API batch (logic xử lý ở Backend)
        const response = await majorService.createBatchMajors(formData.faculty, formData.majors);
        if (response.success) {
          showToast(`Đã thêm ${response.count} chuyên ngành thành công!`, 'success');
          setShowMajorModal(false);
          await fetchMajors();
          await fetchFaculties();
        }
      } else {
        // Chế độ Add đơn lẻ (fallback)
        const response = await majorService.createMajor(formData);
        if (response.success) {
          showToast('Thêm chuyên ngành thành công!', 'success');
          setShowMajorModal(false);
          await fetchMajors();
          await fetchFaculties();
        }
      }
    } catch (error) {
      console.error('Error submitting major:', error);
      throw error; // Ném lỗi để Modal xử lý hiển thị
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa Major
  const handleDeleteMajor = (major) => {
    setDeleteConfirm({
      show: true,
      type: 'major',
      item: major
    });
  };

  const confirmDeleteMajor = async () => {
    const major = deleteConfirm.item;
    try {
      const response = await majorService.deleteMajor(major._id);
      if (response.success) {
        showToast(`Đã xóa chuyên ngành "${major.name}" thành công!`, 'success');
        await fetchMajors();
        await fetchFaculties();
      }
    } catch (error) {
      console.error('Error deleting major:', error);
      showToast(error.response?.data?.message || 'Không thể xóa chuyên ngành', 'error');
    } finally {
      setDeleteConfirm({ show: false, type: '', item: null });
    }
  };

  // Hủy delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, type: '', item: null });
  };

  // Xác nhận delete
  const confirmDelete = () => {
    if (deleteConfirm.type === 'faculty') {
      confirmDeleteFaculty();
    } else if (deleteConfirm.type === 'major') {
      confirmDeleteMajor();
    }
  };

  const handleViewMajors = (faculty) => {
    setActiveTab('majors');
    setFilterFaculty(faculty._id);
  };

  if (isLoading) {
    return (
      <div className="faculty-major-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="faculty-major-management">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Khoa & Chuyên ngành</h1>
            <p className="page-subtitle">Quản lý thông tin các khoa và chuyên ngành đào tạo</p>
          </div>
          <div className="header-actions">
            {activeTab === 'faculties' ? (
              <button className="btn btn-primary" onClick={handleAddFaculty}>
                <span className="btn-icon">+</span>
                Thêm khoa mới
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddMajor}>
                <span className="btn-icon">+</span>
                Thêm chuyên ngành mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'faculties' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('faculties');
              setFilterFaculty('all');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">🏛️</span>
            <span className="tab-text">Danh sách Khoa</span>
            <span className="tab-badge">{facultyStats.total}</span>
          </button>
          <button
            className={`tab ${activeTab === 'majors' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('majors');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">📚</span>
            <span className="tab-text">Chuyên ngành</span>
            <span className="tab-badge">{majorStats.total}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {activeTab === 'faculties' ? (
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-icon">🏛️</div>
            <div className="stat-content">
              <h3>Tổng số khoa</h3>
              <div className="stat-value">{facultyStats.total}</div>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Tổng chuyên ngành</h3>
              <div className="stat-value">{facultyStats.totalMajors}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card stat-teal">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Tổng chuyên ngành</h3>
              <div className="stat-value">{majorStats.total}</div>
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
            placeholder={activeTab === 'faculties' ? 'Tìm kiếm khoa...' : 'Tìm kiếm chuyên ngành...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {activeTab === 'majors' && (
          <div className="filters-grid">
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả khoa</option>
              {faculties.map(faculty => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'faculties' ? (
        <div className="content-section">
          {filteredFaculties.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không tìm thấy khoa nào</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredFaculties.map((faculty) => (
                <div key={faculty._id} className="item-card">
                  <div className="item-header">
                    <div className="item-code">{faculty.code}</div>
                  </div>
                  <h4 className="item-title">{faculty.name}</h4>
                  <p className="item-description">{faculty.description || 'Chưa có mô tả'}</p>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-label">Chuyên ngành:</span>
                      <span className="stat-value">{faculty.majorCount || 0}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewMajors(faculty)}
                      title="Xem chuyên ngành"
                    >
                      📚 Xem CN
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditFaculty(faculty)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteFaculty(faculty)}
                      title="Xóa khoa"
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
          {filteredMajors.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không tìm thấy chuyên ngành nào</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredMajors.map((major) => (
                <div key={major._id} className="item-card">
                  <div className="item-header">
                    <div className="item-code">{major.code}</div>
                  </div>
                  <h4 className="item-title">{major.name}</h4>
                  <div className="faculty-tag">
                    <span className="faculty-tag-icon">🏛️</span>
                    {major.faculty?.name || 'Không xác định'}
                  </div>
                  <p className="item-description">{major.description || 'Chưa có mô tả'}</p>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditMajor(major)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteMajor(major)}
                      title="Xóa chuyên ngành"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Faculty Form Modal */}
      <FacultyFormModal
        isOpen={showFacultyModal}
        onClose={() => setShowFacultyModal(false)}
        onSubmit={handleSubmitFaculty}
        editingFaculty={editingItem}
        isLoading={isSubmitting}
      />

      {/* Major Form Modal */}
      <MajorFormModal
        isOpen={showMajorModal}
        onClose={() => setShowMajorModal(false)}
        onSubmit={handleSubmitMajor}
        editingMajor={editingItem}
        faculties={faculties}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-overlay" onClick={cancelDelete}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">⚠️</span>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="delete-dialog-content">
              <p>
                Bạn có chắc chắn muốn xóa{' '}
                <strong>
                  {deleteConfirm.type === 'faculty' ? 'khoa' : 'chuyên ngành'}{' '}
                  "{deleteConfirm.item?.name}"
                </strong>
                ?
              </p>
              {deleteConfirm.type === 'faculty' && deleteConfirm.item?.majorCount > 0 && (
                <p className="delete-warning">
                  ⚠️ Khoa này có <strong>{deleteConfirm.item.majorCount}</strong> chuyên ngành. 
                  Tất cả chuyên ngành cũng sẽ bị xóa!
                </p>
              )}
            </div>
            <div className="delete-dialog-actions">
              <button className="btn btn-outline" onClick={cancelDelete}>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMajorManagement;

