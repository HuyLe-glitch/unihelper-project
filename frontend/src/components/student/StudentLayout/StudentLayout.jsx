import React, { useState } from 'react';
import Sidebar from '../../common/Sidebar';
import { Dashboard } from '../dashboard';
import { StudentAffairs } from '../student-affairs';
import './StudentLayout.css';

const StudentLayout = () => {
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
      case 'dormitory': // Theo menu config mới
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
            <p>Lịch sử yêu cầu sinh viên</p>
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
    <div className="layout student-layout">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        userRole="student"
      />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentLayout;