import React from 'react';
import './StaffTtxRequests.css';
import '../staffPages.css';
import { TTX_REQUESTS } from '../mockData';

const STATUS_LABEL = {
  processing: 'Đang xử lý',
  rejected: 'Từ chối',
  assigned: 'Đã xếp phòng',
  'pending-confirmation': 'Chờ xác nhận',
};

const StaffTtxRequests = () => (
  <div className="staff-page">
    <header className="staff-page__header">
      <h1>Yêu cầu KTX</h1>
      <p>Quản lý yêu cầu ký túc xá, xếp phòng và theo dõi trạng thái xử lý.</p>
    </header>

    <div className="staff-page__content staff-page__content--table">
      <table className="staff-table">
        <thead>
          <tr>
            <th>Mã yêu cầu</th>
            <th>Sinh viên</th>
            <th>Phòng đề xuất</th>
            <th>Trạng thái</th>
            <th>Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          {TTX_REQUESTS.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.student}</td>
              <td className="ttx-room">{request.room || 'Đang cập nhật'}</td>
              <td>
                <span className={`status-pill ${request.status}`}>
                  {STATUS_LABEL[request.status] || request.status}
                </span>
              </td>
              <td>{request.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StaffTtxRequests;
