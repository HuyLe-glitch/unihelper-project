import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import './Layout.css';

const Layout = ({ userRole = 'student', children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Use overlay mode for tablet and mobile (up to 1024px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect mobile/tablet/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      // Auto close mobile menu when resizing to desktop
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Close mobile menu when clicking backdrop
  const handleBackdropClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`layout ${userRole}-layout`}>
      {/* Mobile backdrop */}
      {isMobile && (
        <div 
          className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={handleBackdropClick}
        />
      )}
      
      <Sidebar 
        userRole={userRole} 
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        className={isMobile && isMobileMenuOpen ? 'mobile-open' : ''}
      />
      <Header 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarCollapsed={isMobile ? true : isSidebarCollapsed}
      />
      <div className={`main-content ${isMobile ? 'mobile' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
