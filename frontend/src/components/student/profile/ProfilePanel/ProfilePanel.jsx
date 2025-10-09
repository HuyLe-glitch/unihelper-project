import React from 'react';
import './ProfilePanel.css';

const ProfilePanel = () => {
  return (
    <div className="profile-sidebar">
      <div className="profile-panel">
        <h3>My Profile</h3>
        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">A</div>
            <button className="edit-profile-btn">Chỉnh sửa</button>
          </div>
          
          <div className="profile-info">
            <div className="info-group">
              <label>Họ và tên</label>
              <span>Alysia Nguyen</span>
            </div>
            
            <div className="info-group">
              <label>Ngày sinh</label>
              <span>15/03/2002</span>
            </div>
            
            <div className="info-group">
              <label>MSSV</label>
              <span>2051063001</span>
            </div>
            
            <div className="info-group">
              <label>Lớp</label>
              <span>CNTT02-K20</span>
            </div>
            
            <div className="info-group">
              <label>Khóa</label>
              <span>K20 (2020-2024)</span>
            </div>
            
            <div className="info-group">
              <label>Email</label>
              <span>alysia.nguyen@student.tdtu.edu.vn</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="logout-btn" onClick={() => console.log('Đăng xuất')}>
              <span className="logout-icon">🚪</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;