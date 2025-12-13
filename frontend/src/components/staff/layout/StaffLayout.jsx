import React from 'react';
import StaffSidebar from '../sidebar';
import './StaffLayout.css';

const StaffLayout = ({ children, isSidebarCollapsed }) => (
  <div className="staff-layout">
    <StaffSidebar 
      userRole="staff" 
      isCollapsed={isSidebarCollapsed}
    />
    <div className={`staff-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {children}
    </div>
  </div>
);

export default StaffLayout;