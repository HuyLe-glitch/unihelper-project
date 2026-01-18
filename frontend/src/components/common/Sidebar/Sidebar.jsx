import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getMenuConfig } from '../../../constants';
import { authService } from '../../../services';
import './Sidebar.css';

const Sidebar = ({ userRole = 'student', isCollapsed = false, className = '' }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  // Get staff type for staff users
  const staffType = userRole === 'staff' ? authService.getStaffType() : null;
  
  // Get isDormResident for student users
  const isDormResident = useMemo(() => {
    if (userRole !== 'student') return false;
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Check từ profile.isDormResident hoặc trực tiếp từ user
        return user?.profile?.isDormResident || user?.isDormResident || false;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return false;
  }, [userRole]);
  
  // Get appropriate menu based on role, staff type, and dormitory status
  const menuItems = getMenuConfig(userRole, staffType, isDormResident);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.type !== 'expandable' || !item.children) return;
      const shouldExpand = item.children.some((child) => location.pathname.startsWith(child.path));
      if (shouldExpand) {
        setExpandedItems((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname, menuItems]);

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const isActiveItem = (item) => {
    if (item.type === 'single') {
      return item.path ? location.pathname.startsWith(item.path) : false;
    }
    return item.children?.some((child) => location.pathname.startsWith(child.path));
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">🎓</div>
          <span className="app-name">UniHelper</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const expanded = expandedItems[item.id];
          const isActive = isActiveItem(item);

          return (
            <div key={item.id} className="menu-item-container">
              {item.type === 'single' ? (
                <NavLink
                  to={item.path}
                  className={({ isActive: linkActive }) =>
                    `menu-item ${linkActive || isActive ? 'active' : ''}`
                  }
                  end
                >
                  <div className="menu-item-content">
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </div>
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={`menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="menu-item-content">
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </div>
                  <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▸</span>
                </button>
              )}

              {item.type === 'expandable' && expanded && (
                <div className="submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      className={({ isActive: linkActive }) =>
                        `submenu-item ${linkActive ? 'active' : ''}`
                      }
                      end
                    >
                      <span className="submenu-label">{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
