import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { Dashboard } from '../../dashboard';
import { StudentAffairs } from '../../student-affairs';
import './Layout.css';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'student-affairs':
        return <StudentAffairs />;
      case 'requests-dormitory':
        return (
          <div className="page-content">
            <h1>Ký túc xá</h1>
            <p>Form gửi yêu cầu về ký túc xá sẽ được phát triển ở đây</p>
          </div>
        );
      case 'courses':
        return (
          <div className="page-content">
            <h1>Courses</h1>
            <p>Danh sách môn học</p>
          </div>
        );
      case 'chat':
        return (
          <div className="page-content">
            <h1>Chat</h1>
            <p>Chatbot UniHelper sẽ được tích hợp ở đây</p>
          </div>
        );
      case 'grades':
        return (
          <div className="page-content">
            <h1>Grades</h1>
            <p>Bảng điểm sinh viên</p>
          </div>
        );
      case 'schedule':
        return (
          <div className="page-content">
            <h1>Schedule</h1>
            <p>Lịch học của sinh viên</p>
          </div>
        );
      case 'settings':
        return (
          <div className="page-content">
            <h1>Settings</h1>
            <p>Cài đặt hệ thống</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Layout;