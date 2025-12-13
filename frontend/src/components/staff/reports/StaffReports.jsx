import React, { useState, useEffect } from 'react';
import './StaffReports.css';

// Mock data cho demo
const mockData = {
  kpi: {
    totalRequests: 1248,
    processed: 1156,
    pending: 92
  },
  trendData: [
    { date: '2024-11-01', new: 45, approved: 38, rejected: 5 },
    { date: '2024-11-02', new: 52, approved: 41, rejected: 7 },
    { date: '2024-11-03', new: 38, approved: 45, rejected: 3 },
    { date: '2024-11-04', new: 61, approved: 52, rejected: 8 },
    { date: '2024-11-05', new: 49, approved: 47, rejected: 6 },
    { date: '2024-11-06', new: 55, approved: 49, rejected: 4 },
    { date: '2024-11-07', new: 43, approved: 51, rejected: 5 },
  ],
  requestTypeDistribution: [
    { type: 'Yêu cầu CTSV', count: 748, percentage: 60 },
    { type: 'Yêu cầu KTX', count: 374, percentage: 30 },
    { type: 'Yêu cầu khác', count: 126, percentage: 10 }
  ],
  statusDistribution: [
    { status: 'Đã duyệt', count: 923, percentage: 80 },
    { status: 'Bị từ chối', count: 233, percentage: 20 }
  ],
  topStaff: [
    { name: 'Nguyễn Văn An', processed: 156, department: 'CTSV' },
    { name: 'Trần Thị Bình', processed: 142, department: 'KTX' },
    { name: 'Lê Hoàng Nam', processed: 128, department: 'CTSV' },
    { name: 'Phạm Minh Châu', processed: 115, department: 'KTX' },
    { name: 'Võ Thị Dung', processed: 98, department: 'CTSV' }
  ],
  staffDetails: [
    { 
      name: 'Nguyễn Văn An', 
      position: 'Chuyên viên CTSV', 
      totalProcessed: 156, 
      pending: 8
    },
    { 
      name: 'Trần Thị Bình', 
      position: 'Chuyên viên KTX', 
      totalProcessed: 142, 
      pending: 12
    },
    { 
      name: 'Lê Hoàng Nam', 
      position: 'Chuyên viên CTSV', 
      totalProcessed: 128, 
      pending: 6
    },
    { 
      name: 'Phạm Minh Châu', 
      position: 'Chuyên viên KTX', 
      totalProcessed: 115, 
      pending: 15
    },
    { 
      name: 'Võ Thị Dung', 
      position: 'Trưởng phòng CTSV', 
      totalProcessed: 98, 
      pending: 4
    }
  ]
};

const StaffReports = () => {
  const [filters, setFilters] = useState({
    timeRange: 'month',
    customDate: { start: '', end: '' },
    staff: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return mockData.staffDetails;
    
    return [...mockData.staffDetails].sort((a, b) => {
      if (sortConfig.key === 'totalProcessed' || sortConfig.key === 'pending') {
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      }
      
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });
  };

  return (
    <div className="staff-reports">
      {/* HEADER */}
      <div className="reports-header">
        <h1>Báo cáo Hiệu suất Xử lý Yêu cầu</h1>
        <p>Tổng quan tình hình xử lý yêu cầu và hiệu suất làm việc</p>
      </div>

      {/* BỘ LỌC CHÍNH */}
      <div className="global-filters">
        <div className="filters-row">
          {/* Chọn thời gian nhanh */}
          <div className="filter-group">
            <label>Thời gian</label>
            <div className="segmented-control">
              <button 
                className={filters.timeRange === 'week' ? 'active' : ''}
                onClick={() => handleFilterChange('timeRange', 'week')}
              >
                Tuần này
              </button>
              <button 
                className={filters.timeRange === 'month' ? 'active' : ''}
                onClick={() => handleFilterChange('timeRange', 'month')}
              >
                Tháng này
              </button>
              <button 
                className={filters.timeRange === 'year' ? 'active' : ''}
                onClick={() => handleFilterChange('timeRange', 'year')}
              >
                Năm nay
              </button>
            </div>
          </div>

          {/* Chọn khoảng thời gian tùy chỉnh */}
          <div className="filter-group">
            <label>Tùy chỉnh</label>
            <div className="date-range">
              <input 
                type="date" 
                value={filters.customDate.start}
                onChange={(e) => handleFilterChange('customDate', 
                  { ...filters.customDate, start: e.target.value })}
              />
              <span>-</span>
              <input 
                type="date" 
                value={filters.customDate.end}
                onChange={(e) => handleFilterChange('customDate', 
                  { ...filters.customDate, end: e.target.value })}
              />
            </div>
          </div>

          {/* Lọc theo nhân viên */}
          <div className="filter-group">
            <label>Nhân viên</label>
            <select 
              value={filters.staff}
              onChange={(e) => handleFilterChange('staff', e.target.value)}
            >
              <option value="all">Tất cả nhân viên</option>
              <option value="nguyen-van-an">Nguyễn Văn An</option>
              <option value="tran-thi-binh">Trần Thị Bình</option>
              <option value="le-hoang-nam">Lê Hoàng Nam</option>
            </select>
          </div>
        </div>
      </div>

      {/* HÀNG 1: KPI CARDS */}
      <div className="kpi-section">
        <div className="kpi-cards">
          <div className="kpi-card total">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <div className="kpi-number">{mockData.kpi.totalRequests.toLocaleString()}</div>
              <div className="kpi-label">Tổng Yêu cầu</div>
              <div className="kpi-change">+12% so với tháng trước</div>
            </div>
          </div>

          <div className="kpi-card processed">
            <div className="kpi-icon">✅</div>
            <div className="kpi-content">
              <div className="kpi-number">{mockData.kpi.processed.toLocaleString()}</div>
              <div className="kpi-label">Đã Xử lý</div>
              <div className="kpi-change">+8% so với tháng trước</div>
            </div>
          </div>

          <div className="kpi-card pending">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-content">
              <div className="kpi-number">{mockData.kpi.pending}</div>
              <div className="kpi-label">Đang chờ</div>
              <div className="kpi-change">-15% so với tháng trước</div>
            </div>
          </div>


        </div>
      </div>

      {/* HÀNG 2: BIỂU ĐỒ XU HƯỚNG */}
      <div className="trend-section">
        <div className="section-header">
          <h2>Xu hướng Xử lý Yêu cầu</h2>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color new"></div>
              <span>Yêu cầu Mới</span>
            </div>
            <div className="legend-item">
              <div className="legend-color approved"></div>
              <span>Đã duyệt</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rejected"></div>
              <span>Bị từ chối</span>
            </div>
          </div>
        </div>
        
        <div className="trend-chart">
          <div className="chart-placeholder">
            <div className="chart-mock">
              {/* Mock line chart visualization */}
              <svg viewBox="0 0 800 300" className="trend-svg">
                <defs>
                  <linearGradient id="newGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="approvedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <g className="grid-lines">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line key={i} x1="50" y1={50 + i * 40} x2="750" y2={50 + i * 40} stroke="#e5e7eb" strokeWidth="1"/>
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <line key={i} x1={50 + i * 100} y1="50" x2={50 + i * 100} y2="250" stroke="#e5e7eb" strokeWidth="1"/>
                  ))}
                </g>

                {/* Trend lines */}
                <polyline 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3"
                  points="50,150 150,130 250,170 350,110 450,140 550,120 650,160"
                />
                <polyline 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3"
                  points="50,180 150,160 250,140 350,130 450,150 550,140 650,130"
                />
                <polyline 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="3"
                  points="50,220 150,210 250,230 350,200 450,215 550,225 650,210"
                />

                {/* Data points */}
                {[50, 150, 250, 350, 450, 550, 650].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy={150 + Math.sin(i) * 20} r="4" fill="#3b82f6"/>
                    <circle cx={x} cy={160 + Math.cos(i) * 15} r="4" fill="#10b981"/>
                    <circle cx={x} cy={215 + Math.sin(i + 1) * 10} r="4" fill="#ef4444"/>
                  </g>
                ))}

                {/* Labels */}
                <g className="axis-labels">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                    <text key={i} x={50 + i * 100} y="275" textAnchor="middle" className="chart-label">{day}</text>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* HÀNG 3: BIỂU ĐỒ PHÂN BỔ */}
      <div className="breakdown-section">
        <div className="breakdown-charts">
          {/* Phân bổ theo loại yêu cầu */}
          <div className="chart-container">
            <h3>Phân bổ theo Loại yêu cầu</h3>
            <div className="donut-chart">
              <div className="donut-mock">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray="226 377" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#10b981" strokeWidth="20" 
                          strokeDasharray="113 490" strokeDashoffset="-226" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#f59e0b" strokeWidth="20" 
                          strokeDasharray="38 565" strokeDashoffset="-339" transform="rotate(-90 100 100)"/>
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" className="donut-center">60%</text>
                </svg>
              </div>
              <div className="chart-legend-vertical">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
                  <span>CTSV (60%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
                  <span>KTX (30%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                  <span>Khác (10%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phân bổ theo trạng thái */}
          <div className="chart-container">
            <h3>Phân bổ theo Trạng thái</h3>
            <div className="donut-chart">
              <div className="donut-mock">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#10b981" strokeWidth="20" 
                          strokeDasharray="301 377" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#ef4444" strokeWidth="20" 
                          strokeDasharray="75 603" strokeDashoffset="-301" transform="rotate(-90 100 100)"/>
                  <text x="100" y="100" textAnchor="middle" dy="0.3em" className="donut-center">80%</text>
                </svg>
              </div>
              <div className="chart-legend-vertical">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
                  <span>Đã duyệt (80%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
                  <span>Bị từ chối (20%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Staff */}
          <div className="chart-container">
            <h3>Nhân viên Xử lý Nhiều nhất</h3>
            <div className="bar-chart">
              {mockData.topStaff.map((staff, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-label">
                    <span className="staff-name">{staff.name}</span>
                    <span className="staff-count">{staff.processed}</span>
                  </div>
                  <div className="bar-background">
                    <div 
                      className="bar-fill" 
                      style={{width: `${(staff.processed / mockData.topStaff[0].processed) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HÀNG 4: BẢNG DỮ LIỆU CHI TIẾT */}
      <div className="data-table-section">
        <div className="section-header">
          <h2>Hiệu suất Chi tiết theo Nhân viên</h2>
        </div>
        
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Tên nhân viên 
                  {sortConfig.key === 'name' && (
                    <span className={`sort-icon ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('position')} className="sortable">
                  Chức vụ
                  {sortConfig.key === 'position' && (
                    <span className={`sort-icon ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('totalProcessed')} className="sortable">
                  Tổng đã xử lý
                  {sortConfig.key === 'totalProcessed' && (
                    <span className={`sort-icon ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('pending')} className="sortable">
                  Đang chờ
                  {sortConfig.key === 'pending' && (
                    <span className={`sort-icon ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>

              </tr>
            </thead>
            <tbody>
              {getSortedData().map((staff, index) => (
                <tr key={index}>
                  <td>
                    <div className="staff-cell">
                      <div className="staff-avatar">{staff.name.charAt(0)}</div>
                      <span>{staff.name}</span>
                    </div>
                  </td>
                  <td>{staff.position}</td>
                  <td>
                    <span className="number-highlight">{staff.totalProcessed}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${staff.pending > 10 ? 'high' : 'normal'}`}>
                      {staff.pending}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;