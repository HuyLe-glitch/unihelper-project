import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MENU_CONFIGS } from '../../../constants';
import './StaffSidebar.css';

const StaffSidebar = ({ userRole = 'staff', isCollapsed = false }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = MENU_CONFIGS[userRole] || MENU_CONFIGS.staff;

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
    <div className={`staff-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="staff-sidebar-nav">
        {menuItems.map((item) => {
          const expanded = expandedItems[item.id];
          const isActive = isActiveItem(item);

          return (
            <div key={item.id} className="staff-menu-item-container">
              {item.type === 'single' ? (
                <NavLink
                  to={item.path}
                  className={({ isActive: linkActive }) =>
                    `staff-menu-item ${linkActive || isActive ? 'active' : ''}`
                  }
                  end
                >
                  <div className="staff-menu-item-content">
                    <span className="staff-menu-icon">{item.icon}</span>
                    <span className="staff-menu-label staff-menu-item-text">{item.label}</span>
                  </div>
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={`staff-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="staff-menu-item-content">
                    <span className="staff-menu-icon">{item.icon}</span>
                    <span className="staff-menu-label staff-menu-item-text">{item.label}</span>
                  </div>
                  <span className={`staff-expand-arrow ${expanded ? 'expanded' : ''}`}>▸</span>
                </button>
              )}

              {item.type === 'expandable' && expanded && (
                <div className="staff-submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      className={({ isActive: linkActive }) =>
                        `staff-submenu-item ${linkActive ? 'active' : ''}`
                      }
                      end
                    >
                      <span className="staff-submenu-label staff-menu-item-text">{child.label}</span>
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

export default StaffSidebar;