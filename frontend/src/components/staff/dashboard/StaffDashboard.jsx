import React, { useMemo } from 'react';
import './StaffDashboard.css';

const StaffDashboard = () => {
  // Mock data - replace with API data when backend is ready
  const certificationRequests = useMemo(
    () => [
      { id: 'CTS-2301', student: 'Nguyễn Văn An', status: 'Đang xử lý', submittedAt: '2024-10-12' },
      { id: 'CTS-2298', student: 'Trần Thị Bình', status: 'Đã duyệt', submittedAt: '2024-10-11' },
      { id: 'CTS-2295', student: 'Lê Hoàng Nam', status: 'Bổ sung hồ sơ', submittedAt: '2024-10-10' },
    ],
    [],
  );

  const dormitoryRequests = useMemo(
    () => [
      { id: 'KTX-1045', student: 'Phạm Thảo Vy', room: 'A3-204', status: 'Chờ xác nhận', submittedAt: '2024-10-12' },
      { id: 'KTX-1039', student: 'Hoàng Minh Quân', room: 'B1-108', status: 'Đã xếp phòng', submittedAt: '2024-10-09' },
      { id: 'KTX-1032', student: 'Võ Đức Huy', room: '-', status: 'Từ chối', submittedAt: '2024-10-07' },
    ],
    [],
  );

  const departmentInfo = useMemo(
    () => ({
      name: 'Phòng Công tác Sinh viên',
      advisor: 'ThS. Trần Thanh Tùng',
      email: 'ctsv@unihelper.edu.vn',
      phone: '(028) 377 550 301',
      workingHours: 'Thứ 2 - Thứ 6, 8:00 - 16:30',
      address: 'Tầng 2, Nhà Điều hành',
    }),
    [],
  );

  const historyData = useMemo(
    () => [
      { id: 'HIS-2201', type: 'CTS', action: 'Đã duyệt chứng nhận CTSV', staff: 'Lê Thị Nhàn', time: '12/10/2024 15:30' },
      { id: 'HIS-2198', type: 'KTX', action: 'Từ chối yêu cầu KTX', staff: 'Đỗ Minh Thu', time: '12/10/2024 09:45' },
      { id: 'HIS-2194', type: 'CTS', action: 'Yêu cầu bổ sung hồ sơ CTSV', staff: 'Trần Văn Hùng', time: '11/10/2024 16:20' },
      { id: 'HIS-2188', type: 'KTX', action: 'Đã xếp phòng KTX', staff: 'Phạm Nhật Anh', time: '10/10/2024 14:05' },
    ],
    [],
  );

  return (
    <div className="staff-dashboard">
      <header className="staff-dashboard__header">
        <div>
          <h1>Dashboard nhân viên</h1>
          <p>Theo dõi và xử lý yêu cầu sinh viên trong ngày</p>
        </div>
        <div className="staff-dashboard__header-actions">
          <button type="button" className="btn primary">Tạo thông báo</button>
          <button type="button" className="btn ghost">Báo cáo nhanh</button>
        </div>
      </header>

      <section className="staff-dashboard__grid">
        <article className="panel">
          <div className="panel__heading">
            <h2>Yêu cầu chứng nhận CTSV</h2>
            <span className="badge">{certificationRequests.length}</span>
          </div>
          <ul className="item-list">
            {certificationRequests.map((request) => (
              <li key={request.id} className="item-list__item">
                <div>
                  <p className="item-list__title">{request.student}</p>
                  <p className="item-list__meta">Mã yêu cầu: {request.id}</p>
                </div>
                <div className="item-list__status">
                  <span className="status-chip">{request.status}</span>
                  <span className="item-list__date">{request.submittedAt}</span>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="panel__action">Xem tất cả yêu cầu CTSV</button>
        </article>

        <article className="panel">
          <div className="panel__heading">
            <h2>Yêu cầu KTX</h2>
            <span className="badge badge--secondary">{dormitoryRequests.length}</span>
          </div>
          <ul className="item-list">
            {dormitoryRequests.map((request) => (
              <li key={request.id} className="item-list__item">
                <div>
                  <p className="item-list__title">{request.student}</p>
                  <p className="item-list__meta">Phòng đề xuất: {request.room || 'Đang cập nhật'}</p>
                </div>
                <div className="item-list__status">
                  <span className="status-chip">{request.status}</span>
                  <span className="item-list__date">{request.submittedAt}</span>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="panel__action panel__action--secondary">Xem danh sách KTX</button>
        </article>

        <article className="panel panel--info">
          <h2>Thông tin phòng ban</h2>
          <div className="department-info">
            <div className="department-info__row">
              <span>Phòng ban</span>
              <strong>{departmentInfo.name}</strong>
            </div>
            <div className="department-info__row">
              <span>Phụ trách</span>
              <strong>{departmentInfo.advisor}</strong>
            </div>
            <div className="department-info__row">
              <span>Email</span>
              <a href={`mailto:${departmentInfo.email}`}>{departmentInfo.email}</a>
            </div>
            <div className="department-info__row">
              <span>Điện thoại</span>
              <a href={`tel:${departmentInfo.phone}`}>{departmentInfo.phone}</a>
            </div>
            <div className="department-info__row">
              <span>Giờ làm việc</span>
              <strong>{departmentInfo.workingHours}</strong>
            </div>
            <div className="department-info__row">
              <span>Địa điểm</span>
              <strong>{departmentInfo.address}</strong>
            </div>
          </div>
        </article>

        <article className="panel panel--search">
          <h2>Tra cứu nhanh</h2>
          <p className="panel__description">Tìm kiếm yêu cầu, sinh viên hoặc lịch sử xử lý</p>
          <form className="quick-search">
            <div className="form-group">
              <label htmlFor="search-term">Từ khóa</label>
              <input id="search-term" type="text" placeholder="Nhập MSSV, mã yêu cầu..." />
            </div>
            <div className="form-group">
              <label htmlFor="search-type">Loại</label>
              <select id="search-type">
                <option value="all">Tất cả</option>
                <option value="cts">Yêu cầu CTSV</option>
                <option value="ktx">Yêu cầu KTX</option>
                <option value="history">Lịch sử xử lý</option>
              </select>
            </div>
            <button type="button" className="btn primary block">Tra cứu</button>
          </form>
        </article>

        <article className="panel panel--history">
          <div className="panel__heading">
            <h2>Lịch sử xử lý</h2>
            <span className="history-count">{historyData.length} hoạt động gần đây</span>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Hoạt động</th>
                <th>Nhân viên</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>
                    <span className={`history-tag history-tag--${entry.type.toLowerCase()}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td>{entry.action}</td>
                  <td>{entry.staff}</td>
                  <td>{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  );
};

export default StaffDashboard;
