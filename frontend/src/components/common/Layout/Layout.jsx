import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import './Layout.css';

const Layout = ({ userRole = 'student', children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`layout ${userRole}-layout`}>
      <Sidebar userRole={userRole} isCollapsed={isSidebarCollapsed} />
      <Header 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
