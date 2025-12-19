import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { STAFF_TYPE_LABELS } from '../../../constants';
import './Header.css';

const Header = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getRoleText = (role, staffType = null) => {
    switch(role) {
      case 'admin': return 'Quản trị viên';
      case 'staff': 
        if (staffType) {
          return `Nhân viên ${STAFF_TYPE_LABELS[staffType] || staffType}`;
        }
        return 'Nhân viên';
      case 'student': return 'Sinh viên';
      default: return 'User';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`app-header ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="header-left">
        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className={`hamburger ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      <div className="header-right">
        <div className="user-info-wrapper" ref={dropdownRef}>
          <div 
            className="user-info" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="dropdown-arrow">▾</span>
          </div>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user?.name || 'User'}</div>
                  <div className="dropdown-user-role">{getRoleText(user?.role, user?.staffType)}</div>
                  <div className="dropdown-user-email">{user?.email || ''}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => {
                setShowDropdown(false);
                navigate('/profile');
              }}>
                <span className="dropdown-icon">👤</span>
                Thông tin cá nhân
              </button>
              <button className="dropdown-item" onClick={() => {
                setShowDropdown(false);
                navigate('/settings');
              }}>
                <span className="dropdown-icon">⚙️</span>
                Cài đặt
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
