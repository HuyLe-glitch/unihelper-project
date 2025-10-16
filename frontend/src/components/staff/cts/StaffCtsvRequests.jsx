import React from 'react';
import './StaffCtsvRequests.css';
import '../staffPages.css';
import { CTSV_REQUESTS } from '../mockData';

const STATUS_LABEL = {
  processing: 'Đang xử lý',
  approved: 'Đã duyệt',
  'needs-update': 'Cần bổ sung',
};

const StaffCtsvRequests = () => (
  <div className="staff-page">
    <header className="staff-page__header">
      <h1>Yêu cầu chứng nhận CTSV</h1>
      <p>Theo dõi, xử lý và cập nhật các yêu cầu liên quan đến chứng nhận CTSV.</p>
    </header>

    <div className="staff-page__content staff-page__content--table">
      <table className="staff-table">
        <thead>
          <tr>
            <th>Mã yêu cầu</th>
            <th>Sinh viên</th>
            <th>Trạng thái</th>
            <th>Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          {CTSV_REQUESTS.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.student}</td>
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

export default StaffCtsvRequests;
