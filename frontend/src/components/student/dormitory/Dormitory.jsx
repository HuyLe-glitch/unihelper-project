import React, { useState } from 'react';
import './Dormitory.css';
import { apiClient } from '../../../services/api'; // adjust path as needed


const Dormitory = () => {
  const [requestItems, setRequestItems] = useState([
    { id: 1, category: '', device: '', description: '' }
  ]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState({});
  const [showDeviceDropdown, setShowDeviceDropdown] = useState({});

  const categories = [
    'Thiết bị điện',
    'Thiết bị nước', 
    'Giàn phơi đồ',
    'Nội thất',
    'Cửa',
    'Gạch',
    'Thiết bị khác'
  ];

  const devicesByCategory = {
    'Thiết bị điện': ['Quạt trần', 'Quạt đứng', 'Đèn LED', 'Ổ cắm', 'Công tắc', 'Máy lạnh', 'Thiết bị điện khác'],
    'Thiết bị nước': ['Vòi nước', 'Sen tắm', 'Bồn cầu', 'Bồn rửa', 'Đường ống', 'Thiết bị nước khác'],
    'Giàn phơi đồ': ['Giàn phơi trong phòng', 'Giàn phơi ban công', 'Dây phơi'],
    'Nội thất': ['Giường', 'Tủ quần áo', 'Bàn học', 'Ghế', 'Kệ', 'Nội thất khác'],
    'Cửa': ['Cửa phòng', 'Cửa sổ', 'Khóa cửa', 'Tay nắm', 'Bản lề'],
    'Gạch': ['Gạch nền', 'Gạch tường', 'Gạch nhà vệ sinh'],
    'Thiết bị khác': ['Khác']
  };

  const handleCategoryChange = (itemId, category) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, category, device: '' } : item
      )
    );
    setShowCategoryDropdown({ ...showCategoryDropdown, [itemId]: false });
  };

  const handleDeviceChange = (itemId, device) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, device } : item
      )
    );
    setShowDeviceDropdown({ ...showDeviceDropdown, [itemId]: false });
  };

  const toggleDeviceDropdown = (itemId) => {
    setShowDeviceDropdown(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleDescriptionChange = (itemId, description) => {
    setRequestItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, description } : item
      )
    );
  };

  const addNewItem = () => {
    const newId = requestItems.length ? Math.max(...requestItems.map(item => item.id)) + 1 : 1;
    setRequestItems([...requestItems, { id: newId, category: '', device: '', description: '' }]);
  };

  const removeItem = (itemId) => {
    if (requestItems.length > 1) {
      setRequestItems(items => items.filter(item => item.id !== itemId));
      // remove dropdown state for removed item
      setShowCategoryDropdown(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  };

  const toggleCategoryDropdown = (itemId) => {
    setShowCategoryDropdown(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const resetForm = () => {
    setRequestItems([{ id: 1, category: '', device: '', description: '' }]);
    setShowCategoryDropdown({});
    setShowDeviceDropdown({});
  };

  //FE handle submit
  /*const handleSubmit = () => {
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
  }; */

  const handleSubmit = async () => {
    const invalidItems = requestItems.filter(item => 
      !item.category.trim() || !item.device.trim() || !item.description.trim()
    );
    if (invalidItems.length > 0) {
      alert('Vui lòng nhập đầy đủ danh mục, thiết bị và mô tả cho tất cả các yêu cầu');
      return;
    }
    const validItems = requestItems.filter(item => item.category && item.device && item.description);
    if (validItems.length === 0) {
      alert('Vui lòng nhập ít nhất một yêu cầu hợp lệ');
      return;
    }

    try {
      await apiClient.post('/dormitory/requests', {
        requests: validItems.map(item => ({
          category: item.category,
          deviceName: item.device,
          description: item.description
        }))
      });
      alert('Yêu cầu đã được gửi thành công!');
      resetForm();
    } catch (err) {
      console.error('Submit dormitory request failed:', err);
      alert('Gửi yêu cầu thất bại!');
    }
  };

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn đóng? Dữ liệu chưa lưu sẽ bị mất.')) {
      // Reset form or navigate back
      resetForm();
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

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📋</span>
                    Danh mục
                  </label>
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className="dropdown-input"
                      placeholder="Chọn danh mục"
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

                {item.category && (
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🔧</span>
                      Thiết bị
                    </label>
                    <div className="dropdown-container">
                      <input
                        type="text"
                        className="dropdown-input"
                        placeholder="Chọn thiết bị"
                        value={item.device}
                        readOnly
                        onClick={() => toggleDeviceDropdown(item.id)}
                        required
                      />
                      <span className="dropdown-icon">▼</span>
                      {showDeviceDropdown[item.id] && (
                        <div className="dropdown-menu">
                          {devicesByCategory[item.category]?.map((device) => (
                            <div
                              key={device}
                              className="dropdown-item"
                              onClick={() => handleDeviceChange(item.id, device)}
                            >
                              {device}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Mô tả chi tiết sự cố
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Mô tả chi tiết về sự cố và vị trí cụ thể..."
                  value={item.description}
                  onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          ))}

          <button className="add-btn" onClick={addNewItem}>
            <span className="btn-icon">+</span>
            Thêm yêu cầu mới
          </button>
        </div>

        <div className="dormitory-footer">
          <button className="close-btn" onClick={handleClose}>
            Đóng
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            <span className="btn-icon">📤</span>
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dormitory;