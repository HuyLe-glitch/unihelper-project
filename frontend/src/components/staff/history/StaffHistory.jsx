import React from 'react';
import './StaffHistory.css';
import '../staffPages.css';
import { STAFF_HISTORY } from '../mockData';

const StaffHistory = () => (
  <div className="staff-page">
    <header className="staff-page__header">
      <h1>Lịch sử xử lý</h1>
      <p>Thống kê nhanh các hoạt động xử lý yêu cầu gần đây của phòng CTSV.</p>
    </header>

    <div className="staff-page__content history-timeline">
      {STAFF_HISTORY.map((item) => (
        <div key={item.id} className="history-item">
          <div className="history-item__meta">
            <p className="history-item__title">
              {item.id} • {item.type}
            </p>
            <p className="history-item__subtitle">{item.action}</p>
            <span className="history-item__subtitle">Nhân viên: {item.staff}</span>
          </div>
          <span className="history-item__time">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StaffHistory;
