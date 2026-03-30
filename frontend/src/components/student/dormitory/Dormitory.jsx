import React, { useState, useEffect, useCallback } from 'react';
import './Dormitory.css';
import dormitoryRequestService from '../../../services/dormitoryRequest';

/**
 * Dormitory - Trang gửi yêu cầu xử lý sự cố KTX
 * Sử dụng dữ liệu thật từ API, tuân thủ Separation of Concerns
 * 
 * Validation:
 * - Danh mục: bắt buộc
 * - Thiết bị: bắt buộc
 * - Mô tả: bắt buộc
 * - Kiểm tra trùng lặp danh mục + thiết bị trong cùng đợt gửi
 */
const Dormitory = () => {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states - từ API
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({}); // { categoryId: [items] }
  
  // Thông tin sinh viên và phòng KTX
  const [studentInfo, setStudentInfo] = useState(null);

  // Form state
  const [requestItems, setRequestItems] = useState([
    { id: 1, categoryId: '', categoryName: '', itemId: '', itemName: '', description: '' }
  ]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState({});
  const [showItemDropdown, setShowItemDropdown] = useState({});

  // Error state cho từng request item: { itemId: { field: message } }
  const [itemErrors, setItemErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch categories và thông tin sinh viên on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories và student info song song
        const [categoriesRes, myRequestsRes] = await Promise.all([
          dormitoryRequestService.getAllCategories(),
          dormitoryRequestService.getMyRequests({ limit: 1 }) // Chỉ cần studentInfo
        ]);
        
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        
        // Lấy thông tin sinh viên từ response getMyRequests
        if (myRequestsRes.success && myRequestsRes.studentInfo) {
          setStudentInfo(myRequestsRes.studentInfo);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        showToast('Không thể tải dữ liệu. Vui lòng thử lại.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [showToast]);

  // Fetch items when category changes
  const fetchItemsForCategory = async (categoryId) => {
    // Nếu đã có cache thì không fetch lại
    if (itemsByCategory[categoryId]) return;

    try {
      const res = await dormitoryRequestService.getItemsByCategory(categoryId);
      if (res.success && res.data) {
        setItemsByCategory(prev => ({
          ...prev,
          [categoryId]: res.data
        }));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Handle category change - clear error khi thay đổi
  const handleCategoryChange = async (itemId, category) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId 
          ? { ...item, categoryId: category._id, categoryName: category.name, itemId: '', itemName: '' } 
          : item
      )
    );
    setShowCategoryDropdown({ ...showCategoryDropdown, [itemId]: false });
    
    // Chỉ clear category error - KHÔNG clear item error vì user chưa chọn item
    clearItemError(itemId, 'category');
    // Clear duplicate error nếu có (vì đã thay đổi category)
    clearItemError(itemId, 'duplicate');
    
    // Fetch items for this category
    await fetchItemsForCategory(category._id);
  };

  // Handle item change - clear error khi thay đổi
  const handleItemChange = (requestId, item) => {
    setRequestItems(items =>
      items.map(req =>
        req.id === requestId 
          ? { ...req, itemId: item._id, itemName: item.name } 
          : req
      )
    );
    setShowItemDropdown({ ...showItemDropdown, [requestId]: false });
    
    // Clear item error
    clearItemError(requestId, 'item');
    // Clear duplicate error nếu có
    clearItemError(requestId, 'duplicate');
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = (itemId) => {
    setShowCategoryDropdown(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    // Close item dropdown
    setShowItemDropdown({});
  };

  // Toggle item dropdown
  const toggleItemDropdown = (itemId) => {
    setShowItemDropdown(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    // Close category dropdown
    setShowCategoryDropdown({});
  };

  // Handle description change - clear error khi thay đổi
  const handleDescriptionChange = (itemId, description) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, description } : item
      )
    );
    
    // Clear description error
    clearItemError(itemId, 'description');
  };

  // Clear error cho 1 field của 1 item
  const clearItemError = (itemId, field) => {
    setItemErrors(prev => {
      if (!prev[itemId]) return prev;
      const newErrors = { ...prev };
      if (newErrors[itemId]) {
        delete newErrors[itemId][field];
        if (Object.keys(newErrors[itemId]).length === 0) {
          delete newErrors[itemId];
        }
      }
      return newErrors;
    });
    // Clear general error khi user sửa
    setGeneralError('');
  };

  // Add new request item
  const addNewItem = () => {
    const newId = requestItems.length ? Math.max(...requestItems.map(item => item.id)) + 1 : 1;
    setRequestItems([...requestItems, { id: newId, categoryId: '', categoryName: '', itemId: '', itemName: '', description: '' }]);
  };

  // Remove request item
  const removeItem = (itemId) => {
    if (requestItems.length > 1) {
      setRequestItems(items => items.filter(item => item.id !== itemId));
      setShowCategoryDropdown(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setShowItemDropdown(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      // Clear errors cho item bị xóa
      setItemErrors(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setRequestItems([{ id: 1, categoryId: '', categoryName: '', itemId: '', itemName: '', description: '' }]);
    setShowCategoryDropdown({});
    setShowItemDropdown({});
    setItemErrors({});
    setGeneralError('');
  };

  // ============ VALIDATION ============
  const validateForm = () => {
    const newItemErrors = {};
    let hasError = false;

    // Map để kiểm tra trùng lặp: key = "categoryId_itemId", value = requestNumber
    const duplicateMap = {};

    requestItems.forEach((item, index) => {
      const itemError = {};
      const requestNumber = index + 1;

      // Validate category - bắt buộc
      if (!item.categoryId) {
        itemError.category = 'Vui lòng chọn danh mục';
        hasError = true;
      }

      // Validate item - bắt buộc
      if (!item.itemId) {
        itemError.item = 'Vui lòng chọn thiết bị';
        hasError = true;
      }

      // Validate description - bắt buộc
      if (!item.description.trim()) {
        itemError.description = 'Vui lòng nhập mô tả sự cố';
        hasError = true;
      } else if (item.description.trim().length < 10) {
        itemError.description = 'Mô tả phải có ít nhất 10 ký tự';
        hasError = true;
      }

      // Kiểm tra trùng lặp danh mục + thiết bị (chỉ khi đã chọn cả 2)
      if (item.categoryId && item.itemId) {
        const duplicateKey = `${item.categoryId}_${item.itemId}`;
        if (duplicateMap[duplicateKey] !== undefined) {
          const duplicateRequestNum = duplicateMap[duplicateKey];
          itemError.duplicate = `Trùng với yêu cầu #${duplicateRequestNum}`;
          hasError = true;
        } else {
          duplicateMap[duplicateKey] = requestNumber;
        }
      }

      if (Object.keys(itemError).length > 0) {
        newItemErrors[item.id] = itemError;
      }
    });

    setItemErrors(newItemErrors);

    if (hasError) {
      const errorCount = Object.keys(newItemErrors).length;
      setGeneralError(`Có ${errorCount} yêu cầu chứa lỗi. Vui lòng kiểm tra và sửa lại.`);
    } else {
      setGeneralError('');
    }

    return !hasError;
  };

  // Handle submit - Gọi API thông qua Service Layer
  const handleSubmit = async () => {
    // Validate form - không dùng toast, chỉ hiển thị lỗi inline
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Gửi từng request riêng lẻ
      for (const item of requestItems) {
        await dormitoryRequestService.createRequest({
          category: item.categoryId,
          item: item.itemId,
          description: item.description.trim()
        });
      }

      showToast('Yêu cầu đã được gửi thành công!', 'success');
      resetForm();

    } catch (error) {
      console.error('Error submitting request:', error);
      // Chỉ toast lỗi server, không toast lỗi nhập liệu
      const errorMessage = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="dormitory-container">
        <div className="dormitory-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dormitory-container">
      <div className="dormitory-card">
        <div className="dormitory-header">
          <h1 className="dormitory-title">Yêu cầu xử lý sự cố ký túc xá</h1>
          {studentInfo && (
            <div className="student-room-info">
              <span className="room-label">Phòng KTX:</span>
              <span className="room-value">{studentInfo.roomName || 'Chưa xếp phòng'}</span>
            </div>
          )}
        </div>

        <div className="dormitory-form">
          {requestItems.map((item, index) => (
            <div key={item.id} className={`request-item ${itemErrors[item.id] ? 'has-error' : ''}`}>
              <div className="request-item-header">
                <h3 className="request-number">Yêu cầu #{index + 1}</h3>
                {requestItems.length > 1 && (
                  <button
                    className="delete-btn-icon"
                    onClick={() => removeItem(item.id)}
                    title="Xóa yêu cầu này"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="dorm-form-grid-row">
                <div className={`dorm-form-group ${itemErrors[item.id]?.category ? 'has-error' : ''}`}>
                  <label className="dorm-form-label">
                    Danh mục <span className="dorm-required">*</span>
                  </label>
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className={`dropdown-input ${itemErrors[item.id]?.category ? 'input-error' : ''}`}
                      placeholder="Chọn danh mục"
                      value={item.categoryName}
                      readOnly
                      onClick={() => toggleCategoryDropdown(item.id)}
                    />
                    <span className="dropdown-icon">▼</span>
                    {showCategoryDropdown[item.id] && (
                      <div className="dropdown-menu">
                        {categories.length === 0 ? (
                          <div className="dropdown-item disabled">
                            Không có danh mục nào
                          </div>
                        ) : (
                          categories.map((category) => (
                            <div
                              key={category._id}
                              className="dropdown-item"
                              onClick={() => handleCategoryChange(item.id, category)}
                            >
                              {category.name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {itemErrors[item.id]?.category && (
                    <span className="dorm-error-message">{itemErrors[item.id].category}</span>
                  )}
                </div>

                {/* Thiết bị dropdown - luôn hiển thị, disabled khi chưa chọn danh mục */}
                <div className={`dorm-form-group ${itemErrors[item.id]?.item ? 'has-error' : ''}`}>
                  <label className="dorm-form-label">
                    Thiết bị <span className="dorm-required">*</span>
                  </label>
                  <div className={`dropdown-container ${!item.categoryId ? 'disabled' : ''}`}>
                    <input
                      type="text"
                      className={`dropdown-input ${!item.categoryId ? 'disabled' : ''} ${itemErrors[item.id]?.item ? 'input-error' : ''}`}
                      placeholder={item.categoryId ? "Chọn thiết bị" : "Vui lòng chọn danh mục trước"}
                      value={item.itemName}
                      readOnly
                      onClick={() => item.categoryId && toggleItemDropdown(item.id)}
                      disabled={!item.categoryId}
                    />
                    <span className="dropdown-icon">▼</span>
                    {showItemDropdown[item.id] && item.categoryId && (
                      <div className="dropdown-menu">
                        {!itemsByCategory[item.categoryId] || itemsByCategory[item.categoryId].length === 0 ? (
                          <div className="dropdown-item disabled">
                            Không có thiết bị nào trong danh mục này
                          </div>
                        ) : (
                          itemsByCategory[item.categoryId].map((equipItem) => (
                            <div
                              key={equipItem._id}
                              className="dropdown-item"
                              onClick={() => handleItemChange(item.id, equipItem)}
                            >
                              {equipItem.name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {itemErrors[item.id]?.item && (
                    <span className="dorm-error-message">{itemErrors[item.id].item}</span>
                  )}
                </div>
              </div>

              <div className={`dorm-form-group ${itemErrors[item.id]?.description ? 'has-error' : ''}`}>
                <label className="dorm-form-label">
                  Mô tả chi tiết sự cố <span className="dorm-required">*</span>
                </label>
                <textarea
                  className={`dorm-form-textarea ${itemErrors[item.id]?.description ? 'input-error' : ''}`}
                  placeholder="Mô tả chi tiết về sự cố và vị trí cụ thể..."
                  value={item.description}
                  onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                  rows={4}
                />
                {itemErrors[item.id]?.description && (
                  <span className="dorm-error-message">{itemErrors[item.id].description}</span>
                )}
              </div>
            </div>
          ))}

          <button className="add-btn" onClick={addNewItem}>
            <span className="btn-icon">+</span>
            Thêm yêu cầu mới
          </button>

          {/* Error Summary - hiển thị tổng hợp lỗi cuối form */}
          {(generalError || Object.keys(itemErrors).length > 0) && (
            <div className="dorm-error-summary">
              <div className="dorm-error-summary-header">
                <span className="dorm-error-icon">⚠️</span>
                <span className="dorm-error-title">Có lỗi cần sửa</span>
              </div>
              <div className="dorm-error-summary-content">
                {generalError && (
                  <p className="dorm-error-general">{generalError}</p>
                )}
                {Object.keys(itemErrors).length > 0 && (
                  <ul className="dorm-error-list">
                    {requestItems.map((item, index) => {
                      const errors = itemErrors[item.id];
                      if (!errors || Object.keys(errors).length === 0) return null;
                      return (
                        <li key={item.id} className="dorm-error-item">
                          <strong>Yêu cầu #{index + 1}:</strong>
                          <span>{Object.values(errors).join(', ')}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dormitory-footer">
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dormitory;