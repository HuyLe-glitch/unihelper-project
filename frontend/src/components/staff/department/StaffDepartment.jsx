import React from 'react';
import './StaffDepartment.css';
import '../staffPages.css';
import { STAFF_DEPARTMENT_INFO } from '../mockData';

const StaffDepartment = () => (
  <div className="staff-page">
    <header className="staff-page__header">
      <h1>Thông tin phòng ban</h1>
      <p>Thông tin liên hệ và trách nhiệm của Phòng Công tác Sinh viên.</p>
    </header>

    <div className="staff-grid">
      <section className="info-card">
        <h2>Thông tin chung</h2>
        <div className="info-list">
          <div className="info-list__item">
            <span>Phòng ban</span>
            <strong>{STAFF_DEPARTMENT_INFO.name}</strong>
          </div>
          <div className="info-list__item">
            <span>Phụ trách</span>
            <strong>{STAFF_DEPARTMENT_INFO.advisor}</strong>
          </div>
          <div className="info-list__item">
            <span>Email</span>
            <a href={`mailto:${STAFF_DEPARTMENT_INFO.email}`}>{STAFF_DEPARTMENT_INFO.email}</a>
          </div>
          <div className="info-list__item">
            <span>Điện thoại</span>
            <a href={`tel:${STAFF_DEPARTMENT_INFO.phone}`}>{STAFF_DEPARTMENT_INFO.phone}</a>
          </div>
          <div className="info-list__item">
            <span>Giờ làm việc</span>
            <strong>{STAFF_DEPARTMENT_INFO.workingHours}</strong>
          </div>
          <div className="info-list__item">
            <span>Địa điểm</span>
            <strong>{STAFF_DEPARTMENT_INFO.address}</strong>
          </div>
        </div>
      </section>

      <section className="info-card">
        <h2>Nhiệm vụ chính</h2>
        <ul className="responsibility-list">
          {STAFF_DEPARTMENT_INFO.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  </div>
);

export default StaffDepartment;
