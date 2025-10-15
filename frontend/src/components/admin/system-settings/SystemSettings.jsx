import React, { useState } from 'react';
import './SystemSettings.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    systemName: 'UniHelper Management System',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: '10',
    sessionTimeout: '30',
    passwordPolicy: 'strong'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Cài đặt đã được lưu thành công!');
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'backup', label: 'Sao lưu', icon: '💾' },
    { id: 'system', label: 'Hệ thống', icon: '🖥️' }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>Cài đặt chung</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Tên hệ thống</label>
          <input
            type="text"
            value={settings.systemName}
            onChange={(e) => handleSettingChange('systemName', e.target.value)}
            className="setting-input"
          />
        </div>
        <div className="setting-item">
          <label>Phiên bản hệ thống</label>
          <input
            type="text"
            value={settings.systemVersion}
            readOnly
            className="setting-input"
          />
        </div>
        <div className="setting-item">
          <label>Chế độ bảo trì</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Cài đặt bảo mật</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Chính sách mật khẩu</label>
          <select
            value={settings.passwordPolicy}
            onChange={(e) => handleSettingChange('passwordPolicy', e.target.value)}
            className="setting-select"
          >
            <option value="weak">Yếu</option>
            <option value="medium">Trung bình</option>
            <option value="strong">Mạnh</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Thời gian hết hạn phiên (phút)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
            className="setting-input"
            min="5"
            max="1440"
          />
        </div>
        <div className="setting-item">
          <label>Kích thước file tối đa (MB)</label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
            className="setting-input"
            min="1"
            max="100"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Cài đặt thông báo</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Thông báo email</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label>Thông báo SMS</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="settings-section">
      <h3>Cài đặt sao lưu</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Sao lưu tự động</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label>Tần suất sao lưu</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
            className="setting-select"
          >
            <option value="hourly">Hàng giờ</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Lần sao lưu cuối</label>
          <span className="setting-value">2024-10-12 02:00:00</span>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h3>Thông tin hệ thống</h3>
      <div className="system-info">
        <div className="info-item">
          <span>Server:</span>
          <strong>Ubuntu 20.04 LTS</strong>
        </div>
        <div className="info-item">
          <span>Database:</span>
          <strong>MySQL 8.0</strong>
        </div>
        <div className="info-item">
          <span>PHP Version:</span>
          <strong>8.1.0</strong>
        </div>
        <div className="info-item">
          <span>Uptime:</span>
          <strong>15 ngày, 3 giờ</strong>
        </div>
        <div className="info-item">
          <span>Memory Usage:</span>
          <strong>2.1GB / 8GB</strong>
        </div>
        <div className="info-item">
          <span>Disk Usage:</span>
          <strong>45GB / 100GB</strong>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'backup':
        return renderBackupSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="system-settings">
      <div className="system-settings__header">
        <div>
          <h1>Cài đặt hệ thống</h1>
          <p>Quản lý cấu hình và cài đặt hệ thống</p>
        </div>
        <div className="system-settings__header-actions">
          <button type="button" className="btn secondary" onClick={() => window.location.reload()}>
            Khôi phục mặc định
          </button>
          <button type="button" className="btn primary" onClick={handleSave}>
            Lưu cài đặt
          </button>
        </div>
      </div>

      <div className="system-settings__content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;