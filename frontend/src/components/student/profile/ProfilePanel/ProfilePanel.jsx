import React, { useState, useEffect } from 'react';
import './ProfilePanel.css';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';

const ProfilePanel = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from context or localStorage
    const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.profile) {
      setProfileData(userData.profile);
    }
    setLoading(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/choose-role');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="profile-sidebar">
      <div className="profile-panel">
        <h3>My Profile</h3>
        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profileData?.fullName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <button className="edit-profile-btn">Chỉnh sửa</button>
          </div>
          
          <div className="profile-info">
            <div className="info-group">
              <label>Họ và tên</label>
              <span>{profileData?.fullName || 'N/A'}</span>
            </div>
            
            <div className="info-group">
              <label>Ngày sinh</label>
              <span>15/03/2002</span>
            </div>
            
            <div className="info-group">
              <label>MSSV</label>
              <span>{profileData?.studentId || 'N/A'}</span>
            </div>
            
            <div className="info-group">
              <label>Ngành</label>
              <span>{profileData?.major || 'N/A'}</span>
            </div>
            
            <div className="info-group">
              <label>Khoa</label>
              <span>{profileData?.faculty || 'N/A'}</span>
            </div>
            
            <div className="info-group">
              <label>Năm học</label>
              <span>{profileData?.academicYear || 'N/A'}</span>
            </div>

            <div className="info-group">
              <label>Email</label>
              <span>{profileData?.user?.email || 'N/A'}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {/*<button className="logout-btn" onClick={() => console.log('Đăng xuất')}> */}
              <button
              className="logout-btn"
              onClick= {handleLogout}>
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