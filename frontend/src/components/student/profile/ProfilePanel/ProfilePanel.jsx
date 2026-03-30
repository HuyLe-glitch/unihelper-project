import React, { useState, useEffect } from 'react';
import './ProfilePanel.css';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import studentService from '../../../../services/student';
import { apiClient } from '../../../../services/api';

/**
 * ProfilePanel - Trang thông tin cá nhân sinh viên
 * Hiển thị full page với responsive theo DASHBOARD_RESPONSIVE_SOLUTION.md
 * 
 * Các trường từ Student Model:
 * - fullName, dateOfBirth, phone, citizenId, address
 * - major (populated với faculty)
 * - isDormResident, roomId (populated)
 * - user.email
 */
const ProfilePanel = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        setError('Không thể tải thông tin cá nhân');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Mật khẩu hiện tại không đúng');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-container">
        <div className="profile-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadProfile} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-page-container">
      {/* Header Section */}
      <div className="profile-header-section">
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {profileData?.fullName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{profileData?.fullName || 'Sinh viên'}</h1>
            <p className="profile-role">Sinh viên</p>
            <p className="profile-email">{profileData?.user?.email || user?.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content-grid">
        {/* Personal Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon">👤</span>
            <h2>Thông tin cá nhân</h2>
          </div>
          <div className="profile-card-body">
            <div className="info-row">
              <span className="info-label">Họ và tên</span>
              <span className="info-value">{profileData?.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ngày sinh</span>
              <span className="info-value">{formatDate(profileData?.dateOfBirth)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Số điện thoại</span>
              <span className="info-value">{profileData?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">CCCD/CMND</span>
              <span className="info-value">{profileData?.citizenId || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Địa chỉ</span>
              <span className="info-value">{profileData?.address || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Academic Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon">🎓</span>
            <h2>Thông tin học vấn</h2>
          </div>
          <div className="profile-card-body">
            <div className="info-row">
              <span className="info-label">Khoa</span>
              <span className="info-value">
                {profileData?.major?.faculty?.name || profileData?.faculty || 'Chưa cập nhật'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Ngành</span>
              <span className="info-value">
                {profileData?.major?.name || profileData?.majorName || 'Chưa cập nhật'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Email sinh viên</span>
              <span className="info-value">{profileData?.user?.email || user?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Dormitory Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon">🏠</span>
            <h2>Thông tin ký túc xá</h2>
          </div>
          <div className="profile-card-body">
            <div className="info-row">
              <span className="info-label">Trạng thái KTX</span>
              <span className={`info-value status-badge ${profileData?.isDormResident ? 'active' : 'inactive'}`}>
                {profileData?.isDormResident ? '✅ Đang ở KTX' : '❌ Không ở KTX'}
              </span>
            </div>
            {profileData?.isDormResident && profileData?.roomId && (
              <>
                <div className="info-row">
                  <span className="info-label">Phòng</span>
                  <span className="info-value">
                    {profileData?.roomId?.name || 'Chưa được phân phòng'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sức chứa</span>
                  <span className="info-value">
                    {profileData?.roomId?.occupied || 0}/{profileData?.roomId?.capacity || 0} người
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Trạng thái phòng</span>
                  <span className={`info-value status-badge ${profileData?.roomId?.status === 'AVAILABLE' ? 'active' : 'inactive'}`}>
                    {profileData?.roomId?.status === 'AVAILABLE' ? 'Còn chỗ' : 
                     profileData?.roomId?.status === 'FULL' ? 'Đầy' : 'Bảo trì'}
                  </span>
                </div>
              </>
            )}
            {profileData?.isDormResident && !profileData?.roomId && (
              <div className="info-row">
                <span className="info-label">Phòng</span>
                <span className="info-value">Chưa được phân phòng</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="card-icon">🔐</span>
            <h2>Bảo mật tài khoản</h2>
          </div>
          <div className="profile-card-body">
            {!showChangePassword ? (
              <div className="security-actions">
                <p className="security-note">
                  Để bảo mật tài khoản, bạn nên đổi mật khẩu định kỳ.
                </p>
                <button 
                  className="change-password-btn"
                  onClick={() => setShowChangePassword(true)}
                >
                  <span className="btn-icon">🔑</span>
                  Đổi mật khẩu
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPasswordChange} className="change-password-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                
                {passwordError && (
                  <div className="password-error">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="password-success">{passwordSuccess}</div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="profile-logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfilePanel;