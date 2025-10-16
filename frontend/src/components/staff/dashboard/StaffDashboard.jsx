import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './StaffDashboard.css';
import { CTSV_REQUESTS, TTX_REQUESTS } from '../mockData';

const STATUS_LABELS = {
  processing: 'Đang xử lý',
  approved: 'Đã duyệt',
  'needs-update': 'Cần bổ sung',
  'pending-confirmation': 'Chờ xác nhận',
  assigned: 'Đã xếp phòng',
  rejected: 'Từ chối',
};

const StaffDashboard = () => {
  const stats = useMemo(() => {
    const ctsvProcessing = CTSV_REQUESTS.filter((item) => item.status === 'processing').length;
    const ttxProcessing = TTX_REQUESTS.filter((item) => item.status === 'processing').length;
    const totalToday = CTSV_REQUESTS.concat(TTX_REQUESTS).filter(
      (item) => item.submittedAt === '2024-10-12',
    ).length;

    return {
      totalCtsv: CTSV_REQUESTS.length,
      totalTtx: TTX_REQUESTS.length,
      ctsvProcessing,
      ttxProcessing,
      totalToday,
    };
  }, []);

  const quickLinks = [
    {
      title: 'Yêu cầu CTSV',
      description: 'Tra cứu, duyệt chứng nhận',
      to: '/staff/cts-requests',
      icon: '📑',
    },
    {
      title: 'Yêu cầu KTX',
      description: 'Quản lý ký túc xá',
      to: '/staff/ktx-requests',
      icon: '🏠',
    },
    {
      title: 'Lịch sử xử lý',
      description: 'Theo dõi hoạt động gần đây',
      to: '/staff/history',
      icon: '🕓',
    },
    {
      title: 'Phòng ban',
      description: 'Thông tin liên hệ nội bộ',
      to: '/staff/department',
      icon: '🏢',
    },
  ];

  const recentItems = useMemo(
    () =>
      CTSV_REQUESTS.slice(0, 3).map((item) => ({
        ...item,
        type: 'CTS',
      })),
    [],
  );

  return (
    <div className="staff-dashboard">
      <section className="search-wrapper">
        <form className="search-inline">
          <div className="search-control icon">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm yêu cầu, sinh viên..." />
          </div>
          <div className="search-control select">
            <label htmlFor="search-type" className="sr-only">
              Loại tra cứu
            </label>
            <select id="search-type" defaultValue="all">
              <option value="all">Tất cả</option>
              <option value="cts">Yêu cầu CTSV</option>
              <option value="ktx">Yêu cầu KTX</option>
              <option value="history">Lịch sử xử lý</option>
            </select>
          </div>
          <button type="button" className="btn primary">
            Tra cứu
          </button>
        </form>
      </section>

      <section className="stats-and-recent">
        <div className="stats-row">
          <div className="stats-cards-row">
            <div className="stat-card highlight">
              <div className="stat-icon">📑</div>
              <div className="stat-details">
                <p className="stat-label">Yêu cầu CTSV</p>
                <p className="stat-number">{stats.totalCtsv}</p>
                <span className="stat-meta">{stats.ctsvProcessing} đang xử lý</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-details">
                <p className="stat-label">Yêu cầu KTX</p>
                <p className="stat-number">{stats.totalTtx}</p>
                <span className="stat-meta">{stats.ttxProcessing} đang xử lý</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-details">
                <p className="stat-label">Phát sinh trong ngày</p>
                <p className="stat-number">{stats.totalToday}</p>
                <span className="stat-meta">Ngày 12/10/2024</span>
              </div>
            </div>
          </div>
        </div>

        <article className="panel stats-row__panel">
          <div className="panel__heading">
            <h2>Yêu cầu CTSV gần đây</h2>
            <Link to="/staff/cts-requests" className="panel__link">
              Xem tất cả
            </Link>
          </div>
          <ul className="item-list">
            {recentItems.map((item) => (
              <li key={item.id} className="item-list__item">
                <div>
                  <p className="item-list__title">{item.student}</p>
                  <p className="item-list__meta">
                    {item.id} • {STATUS_LABELS[item.status] || item.status}
                  </p>
                </div>
                <div className="item-list__status">
                  <span className="item-list__date">{item.submittedAt}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel panel--links">
        <h2>Tác vụ nhanh</h2>
        <div className="quick-links">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.to} className="quick-link-card">
              <div className="quick-link-icon">{link.icon}</div>
              <div className="quick-link-content">
                <p className="quick-link-title">{link.title}</p>
                <p className="quick-link-description">{link.description}</p>
              </div>
              <span className="quick-link-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;
