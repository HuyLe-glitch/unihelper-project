import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single'
    },
    {
      id: 'requests',
      icon: '📝',
      label: 'Gửi yêu cầu',
      type: 'expandable',
      children: [
        { id: 'student-affairs', label: 'Công tác sinh viên' },
        { id: 'dormitory', label: 'Ký túc xá' }
      ]
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single'
    },
    {
      id: 'schedule',
      icon: '📅',
      label: 'Schedule',
      type: 'single'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      type: 'single'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.type === 'expandable') {
      if (item.id === 'requests') {
        setIsRequestsExpanded(!isRequestsExpanded);
      }
    } else {
      onTabChange(item.id);
    }
  };

  const handleSubMenuClick = (parentId, childId) => {
    onTabChange(`${parentId}-${childId}`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">🎓</div>
          <span className="app-name">UniHelper</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item-container">
            <div 
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <div className="menu-item-content">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </div>
              {item.type === 'expandable' && (
                <span className={`expand-arrow ${isRequestsExpanded ? 'expanded' : ''}`}>
                  ➤
                </span>
              )}
            </div>

            {/* Submenu cho Gửi yêu cầu */}
            {item.type === 'expandable' && item.id === 'requests' && isRequestsExpanded && (
              <div className="submenu">
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    className={`submenu-item ${activeTab === `requests-${child.id}` ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('requests', child.id)}
                  >
                    <span className="submenu-label">{child.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;