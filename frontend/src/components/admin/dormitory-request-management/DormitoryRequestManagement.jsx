import React, { useState, useMemo, useEffect, useCallback } from 'react';
import equipmentService from '../../../services/equipment';
import CategoryFormModal from './CategoryFormModal';
import ItemFormModal from './ItemFormModal';
import './DormitoryRequestManagement.css';

const DormitoryRequestManagement = () => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' = categories, 'requests' = items
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states - gọi API thật
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: null });

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
      
      const [categoriesRes, itemsRes] = await Promise.all([
        equipmentService.getAllCategories(),
        equipmentService.getAllItems()
      ]);

      setCategories(categoriesRes.data || []);
      setItems(itemsRes.data || []);
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
  // CATEGORY HANDLERS
  // ==========================================

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        // Update
        const result = await equipmentService.updateCategory(editingCategory._id, data);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? result.data : c));
        showToast('Cập nhật danh mục thành công');
      } else {
        // Create
        const result = await equipmentService.createCategory(data);
        setCategories(prev => [...prev, result.data]);
        showToast('Thêm danh mục thành công');
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

  const handleDeleteCategoryClick = (category) => {
    const itemCount = items.filter(i => i.category?._id === category._id).length;
    setDeleteConfirm({ 
      show: true, 
      item: category, 
      type: 'category',
      itemCount 
    });
  };

  const handleConfirmDeleteCategory = async () => {
    const category = deleteConfirm.item;
    try {
      await equipmentService.deleteCategory(category._id);
      setCategories(prev => prev.filter(c => c._id !== category._id));
      setItems(prev => prev.filter(i => i.category?._id !== category._id));
      showToast(`Đã xóa danh mục "${category.name}"`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa danh mục', 'error');
    } finally {
      setDeleteConfirm({ show: false, item: null, type: null });
    }
  };

  // ==========================================
  // ITEM HANDLERS
  // ==========================================

  const handleAddItem = (categoryId = null) => {
    setEditingItem(null);
    setPreSelectedCategoryId(categoryId);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setPreSelectedCategoryId(null);
    setShowItemModal(true);
  };

  const handleItemSubmit = async (data) => {
    try {
      if (editingItem) {
        // Update
        const result = await equipmentService.updateItem(editingItem._id, data);
        setItems(prev => prev.map(i => i._id === editingItem._id ? result.data : i));
        showToast('Cập nhật thiết bị thành công');
      } else {
        // Create single
        const result = await equipmentService.createItem(data);
        setItems(prev => [...prev, result.data]);
        showToast('Thêm thiết bị thành công');
      }
    } catch (error) {
      const apiError = error.response?.data || error;
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        field: apiError.field
      };
    }
  };

  const handleBatchItemSubmit = async (categoryId, itemsData) => {
    try {
      const result = await equipmentService.createItemsBatch(categoryId, itemsData);
      // Thêm items mới vào state
      setItems(prev => [...prev, ...(result.data || [])]);
      showToast(result.message || `Đã thêm ${result.count} thiết bị`);
    } catch (error) {
      const apiError = error.response?.data || error;
      // Re-throw với format cho batch errors
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        errors: apiError.errors || []
      };
    }
  };

  const handleDeleteItemClick = (item) => {
    setDeleteConfirm({ show: true, item, type: 'item' });
  };

  const handleConfirmDeleteItem = async () => {
    const item = deleteConfirm.item;
    try {
      await equipmentService.deleteItem(item._id);
      setItems(prev => prev.filter(i => i._id !== item._id));
      showToast(`Đã xóa thiết bị "${item.name}"`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa thiết bị', 'error');
    } finally {
      setDeleteConfirm({ show: false, item: null, type: null });
    }
  };

  const handleViewItems = (category) => {
    setActiveTab('requests');
    setFilterCategory(category._id);
  };

  // ==========================================
  // FILTERING & STATISTICS
  // ==========================================

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [categories, searchTerm]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category?._id === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  const categoryStats = useMemo(() => ({
    total: categories.length,
    totalItems: items.length
  }), [categories, items]);

  const itemStats = useMemo(() => ({
    total: filteredItems.length
  }), [filteredItems]);

  // Count items per category
  const getItemCountForCategory = (categoryId) => {
    return items.filter(i => i.category?._id === categoryId).length;
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="dormitory-request-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dormitory-request-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dormitory-request-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Danh mục & Thiết bị KTX</h1>
            <p className="page-subtitle">Quản lý danh mục và danh sách thiết bị ký túc xá</p>
          </div>
          <div className="header-actions">
            {activeTab === 'types' ? (
              <button className="btn btn-primary" onClick={handleAddCategory}>
                <span className="btn-icon">+</span>
                Thêm danh mục mới
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleAddItem()}>
                <span className="btn-icon">+</span>
                Thêm thiết bị mới
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
              setFilterCategory('all');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">🏢</span>
            <span className="tab-text">Danh mục thiết bị</span>
            <span className="tab-badge">{categoryStats.total}</span>
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('requests');
              setSearchTerm('');
            }}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-text">Danh sách thiết bị</span>
            <span className="tab-badge">{items.length}</span>
          </button>
        </div>
      </div>

      {/* Statistics - Only for items tab */}
      {activeTab === 'requests' && (
        <div className="stats-grid">
          <div className="stat-card stat-teal">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Tổng thiết bị</h3>
              <div className="stat-value">{itemStats.total}</div>
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
            placeholder={activeTab === 'types' ? 'Tìm kiếm danh mục thiết bị...' : 'Tìm kiếm thiết bị...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {activeTab === 'requests' && (
          <div className="filters-grid">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'types' ? (
        <div className="content-section">
          {filteredCategories.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>{searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}</p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={handleAddCategory}>
                  Thêm danh mục đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="items-grid">
              {filteredCategories.map((category) => (
                <div key={category._id} className="item-card">
                  {/* Nút thêm nhanh - Góc trên bên trái */}
                  <button
                    className="btn-quick-add"
                    onClick={() => handleAddItem(category._id)}
                    title="Thêm thiết bị vào danh mục"
                  >
                    ➕
                  </button>
                  <h4 className="item-title">{category.name}</h4>
                  <p className="item-description">{category.description || 'Không có mô tả'}</p>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-label">Thiết bị:</span>
                      <span className="stat-value">{getItemCountForCategory(category._id)}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewItems(category)}
                      title="Xem danh sách thiết bị"
                    >
                      📝 Xem thiết bị
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditCategory(category)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteCategoryClick(category)}
                      title="Xóa danh mục"
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
          {filteredItems.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>{searchTerm || filterCategory !== 'all' ? 'Không tìm thấy thiết bị nào' : 'Chưa có thiết bị nào'}</p>
              {!searchTerm && filterCategory === 'all' && categories.length > 0 && (
                <button className="btn btn-primary" onClick={() => handleAddItem()}>
                  Thêm thiết bị đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item._id} className="item-card">
                  <h4 className="item-title">{item.name}</h4>
                  <div className="type-tag">
                    {item.category?.name || 'Không có danh mục'}
                  </div>
                  <p className="item-description">{item.description || 'Không có mô tả'}</p>
                  <div className="item-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditItem(item)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteItemClick(item)}
                      title="Xóa thiết bị"
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

      {/* Category Modal */}
      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCategorySubmit}
        editingCategory={editingCategory}
      />

      {/* Item Modal */}
      <ItemFormModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
          setPreSelectedCategoryId(null);
        }}
        onSubmit={handleItemSubmit}
        onBatchSubmit={handleBatchItemSubmit}
        editingItem={editingItem}
        categories={categories}
        preSelectedCategoryId={preSelectedCategoryId}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-overlay" onClick={() => setDeleteConfirm({ show: false, item: null, type: null })}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">⚠️</span>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="delete-dialog-content">
              {deleteConfirm.type === 'category' ? (
                <>
                  <p>
                    Bạn có chắc chắn muốn xóa danh mục{' '}
                    <strong>"{deleteConfirm.item?.name}"</strong>?
                  </p>
                  {deleteConfirm.itemCount > 0 && (
                    <p className="delete-warning-text">
                      ⚠️ Sẽ xóa luôn {deleteConfirm.itemCount} thiết bị trong danh mục này!
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Bạn có chắc chắn muốn xóa thiết bị{' '}
                  <strong>"{deleteConfirm.item?.name}"</strong>?
                </p>
              )}
              <p className="delete-warning-text">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="delete-dialog-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirm({ show: false, item: null, type: null })}
              >
                Hủy
              </button>
              <button 
                className="btn btn-danger" 
                onClick={deleteConfirm.type === 'category' ? handleConfirmDeleteCategory : handleConfirmDeleteItem}
              >
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

export default DormitoryRequestManagement;
