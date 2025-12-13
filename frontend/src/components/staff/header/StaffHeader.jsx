import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaFilter, FaUser, FaBell, FaSignOutAlt, FaKey, FaBars } from 'react-icons/fa';
import './StaffHeader.css';

const StaffHeader = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    'Tất cả',
    'Yêu cầu CTSV', 
    'Yêu cầu KTX',
    'Sinh viên',
    'Phòng ban'
  ];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'Category:', selectedCategory);
    // Implement search logic here
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  const handleChangePassword = () => {
    // Implement change password logic here
    console.log('Change password...');
  };

  return (
    <div className="staff-header">
      {/* Header Sidebar - Brand Area */}
      <div className={`staff-header__sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-logo">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">UniHelper</span>
        </div>
      </div>
      
      {/* Header Content - Search + User */}
      <div className="staff-header__content">
        <div className="staff-header__left-content">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
          >
            <FaBars />
          </button>
        </div>
        
        <div className="staff-header__search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm yêu cầu, sinh viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="category-filter">
              <FaFilter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <button onClick={handleSearch} className="search-button">
              Tra cứu
            </button>
          </div>
        </div>

        <div className="staff-header__user-section">
          <div className="user-profile" ref={dropdownRef}>
            <div 
              className="user-avatar"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaUser className="user-icon" />
              <span className="notification-badge-user">3</span>
            </div>
            
            {isDropdownOpen && (
              <div 
                className="user-dropdown" 
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  zIndex: 99999,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  width: '280px',
                  maxHeight: '400px',
                  overflow: 'visible', // FIXED: Allow content to show
                  border: '1px solid #ddd'
                }}
              >
                <div className="dropdown-header-simple">
                  <div className="user-name-dropdown">Nguyễn Văn Staff</div>
                </div>
                
                <div className="dropdown-menu">
                  <button className="dropdown-item notifications-header">
                    <FaBell className="item-icon" />
                    <span>Thông báo</span>
                    <span className="notification-count">3</span>
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={handleChangePassword}>
                    <FaKey className="item-icon" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="item-icon" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;