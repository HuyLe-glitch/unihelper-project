import React, { useState } from 'react';
import './Dormitory.css';

const Dormitory = () => {
  const [requestItems, setRequestItems] = useState([
    { id: 1, category: '', description: '' }
  ]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState({});

  const categories = [
    'Thiết bị điện',
    'Thiết bị nước', 
    'Giàn phơi đồ',
    'Nội thất',
    'Cửa',
    'Gạch',
    'Thiết bị khác'
  ];

  const handleCategoryChange = (itemId, category) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, category } : item
      )
    );
    setShowCategoryDropdown({ ...showCategoryDropdown, [itemId]: false });
  };

  const handleDescriptionChange = (itemId, description) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, description } : item
      )
    );
  };

  const addNewItem = () => {
    const newId = Math.max(...requestItems.map(item => item.id)) + 1;
    setRequestItems([...requestItems, { id: newId, category: '', description: '' }]);
  };

  const removeItem = (itemId) => {
    if (requestItems.length > 1) {
      setRequestItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const toggleCategoryDropdown = (itemId) => {
    setShowCategoryDropdown({
      ...showCategoryDropdown,
      [itemId]: !showCategoryDropdown[itemId]
    });
  };

  const handleSubmit = () => {
    // Validate that all items have both category and description
    const invalidItems = requestItems.filter(item => !item.category.trim() || !item.description.trim());
    
    if (invalidItems.length > 0) {
      alert('Vui lòng nhập đầy đủ danh mục và mô tả cho tất cả các yêu cầu');
      return;
    }
    
    const validItems = requestItems.filter(item => item.category && item.description);
    if (validItems.length === 0) {
      alert('Vui lòng nhập ít nhất một yêu cầu hợp lệ');
      return;
    }
    
    console.log('Submitting request:', validItems);
    // Here you would typically send the data to your API
    alert('Yêu cầu đã được gửi thành công!');
  };

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn đóng? Dữ liệu chưa lưu sẽ bị mất.')) {
      // Reset form or navigate back
      setRequestItems([{ id: 1, category: '', description: '' }]);
    }
  };

  return (
    <div className="dormitory-container">
      <div className="dormitory-card">
        <div className="dormitory-header">
          <h1 className="dormitory-title">Yêu cầu xử lý sự cố ký túc xá</h1>
        </div>

        <div className="dormitory-form">
          {requestItems.map((item, index) => (
            <div key={item.id} className="request-item">
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <div className="dropdown-container">
                  <input
                    type="text"
                    className="dropdown-input"
                    placeholder="Tên danh mục"
                    value={item.category}
                    readOnly
                    onClick={() => toggleCategoryDropdown(item.id)}
                    required
                  />
                  <span className="dropdown-icon">▼</span>
                  {showCategoryDropdown[item.id] && (
                    <div className="dropdown-menu">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="dropdown-item"
                          onClick={() => handleCategoryChange(item.id, category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-textarea"
                  placeholder="Mô tả chi tiết về sự cố..."
                  value={item.description}
                  onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <button
                className="delete-btn"
                onClick={() => removeItem(item.id)}
                disabled={requestItems.length === 1}
              >
                <span className="btn-icon">×</span>
                Xóa
              </button>
            </div>
          ))}

          <button className="add-btn" onClick={addNewItem}>
            <span className="btn-icon">+</span>
            Thêm
          </button>
        </div>

        <div className="dormitory-footer">
          <button className="submit-btn" onClick={handleSubmit}>
            <span className="btn-icon">📄</span>
            Gửi yêu cầu
          </button>
          <button className="close-btn" onClick={handleClose}>
            <span className="btn-icon">×</span>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dormitory;