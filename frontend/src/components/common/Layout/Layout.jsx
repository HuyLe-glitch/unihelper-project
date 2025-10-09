import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import './Layout.css';

const Layout = ({ userRole = 'student', children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className={`layout ${userRole}-layout`}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        userRole={userRole}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;