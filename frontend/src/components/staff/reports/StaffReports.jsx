import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { 
  reportsService, 
  generateMonthsInSemester, 
  generateWeeksInSemester,
  getChartGranularity,
  findCurrentPeriod,
  findCurrentSemester
} from '../../../services/reports';
import './StaffReports.css';

// Màu cho biểu đồ
const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#6B7280'];
const STATUS_COLORS = {
  'Đã duyệt': '#10B981',
  'Bị từ chối': '#EF4444',
  'Đang chờ': '#F59E0B',
  'Đang xem xét': '#3B82F6'
};

const StaffReports = () => {
  const { user } = useAuthContext();
  
  // Xác định module dựa trên department của staff
  // Mặc định là CTSV nếu không xác định được
  const staffModule = user?.staffProfile?.department === 'KTX' ? 'KTX' : 'CTSV';

  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [viewType, setViewType] = useState('all'); // 'all' | 'month' | 'week' | 'custom'
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Report data state
  const [reportData, setReportData] = useState(null);

  // ==================== FETCH SEMESTERS ====================
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await reportsService.getAllSemesters();
        if (response.success && response.data.length > 0) {
          setSemesters(response.data);
          
          // Tìm học kỳ hiện tại hoặc lấy học kỳ đầu tiên
          const currentSem = findCurrentSemester(response.data);
          setSelectedSemester(currentSem);
        }
      } catch (err) {
        console.error('Error fetching semesters:', err);
        setError('Không thể tải danh sách học kỳ');
      }
    };

    fetchSemesters();
  }, []);

  // ==================== GENERATE MONTHS/WEEKS KHI CHỌN HỌC KỲ ====================
  useEffect(() => {
    if (selectedSemester) {
      const months = generateMonthsInSemester(selectedSemester.startDate, selectedSemester.endDate);
      const weeks = generateWeeksInSemester(selectedSemester.startDate, selectedSemester.endDate);
      
      setAvailableMonths(months);
      setAvailableWeeks(weeks);
      
      // Set default values
      const currentMonth = findCurrentPeriod(months);
      const currentWeek = findCurrentPeriod(weeks);
      
      setSelectedMonth(currentMonth);
      setSelectedWeek(currentWeek);
      
      // Reset custom dates
      setCustomStartDate(selectedSemester.startDate.split('T')[0]);
      setCustomEndDate(selectedSemester.endDate.split('T')[0]);
    }
  }, [selectedSemester]);

  // ==================== FETCH REPORT DATA ====================
  const fetchReportData = useCallback(async () => {
    if (!selectedSemester) return;

    setLoading(true);
    setError(null);

    try {
      // Xác định date range dựa trên viewType
      let startDate, endDate;
      
      switch (viewType) {
        case 'month':
          if (selectedMonth) {
            startDate = selectedMonth.startDate;
            endDate = selectedMonth.endDate;
          }
          break;
        case 'week':
          if (selectedWeek) {
            startDate = selectedWeek.startDate;
            endDate = selectedWeek.endDate;
          }
          break;
        case 'custom':
          startDate = customStartDate;
          endDate = customEndDate;
          break;
        default: // 'all'
          startDate = selectedSemester.startDate.split('T')[0];
          endDate = selectedSemester.endDate.split('T')[0];
      }

      if (!startDate || !endDate) {
        setLoading(false);
        return;
      }

      // Xác định granularity cho chart
      const granularity = getChartGranularity(startDate, endDate);

      // Gọi API tương ứng với module
      const response = staffModule === 'KTX' 
        ? await reportsService.getKTXReport({ startDate, endDate, granularity })
        : await reportsService.getCTSVReport({ startDate, endDate, granularity });

      if (response.success) {
        setReportData(response.data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, viewType, selectedMonth, selectedWeek, customStartDate, customEndDate, staffModule]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // ==================== HANDLERS ====================
  const handleSemesterChange = (e) => {
    const semId = e.target.value;
    const semester = semesters.find(s => s._id === semId);
    setSelectedSemester(semester);
    setViewType('all'); // Reset về toàn bộ HK
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
  };

  // ==================== FORMAT HELPERS ====================
  const formatChange = (value) => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  const getChangeClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  // ==================== RENDER ====================
  if (loading && !reportData) {
    return (
      <div className="staff-reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="staff-reports">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchReportData}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-reports">
      {/* HEADER */}
      <div className="reports-header">
        <h1>Báo cáo {staffModule === 'KTX' ? 'Ký túc xá' : 'Công tác sinh viên'}</h1>
        <p>Tổng quan tình hình xử lý yêu cầu và thống kê</p>
      </div>

      {/* BỘ LỌC */}
      <div className="staff-reports-filters">
        <div className="staff-reports-filters-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', flexWrap: 'nowrap' }}>
          {/* Chọn Học kỳ */}
          <div className="staff-reports-filter-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <label style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', color: '#374151' }}>Học kỳ</label>
            <select 
              value={selectedSemester?._id || ''} 
              onChange={handleSemesterChange}
              className="staff-reports-select"
            >
              {semesters.map(sem => (
                <option key={sem._id} value={sem._id}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loại xem - Dropdown */}
          <div className="staff-reports-filter-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <label style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', color: '#374151' }}>Xem theo</label>
            <select 
              value={viewType} 
              onChange={(e) => handleViewTypeChange(e.target.value)}
              className="staff-reports-select"
            >
              <option value="all">Toàn bộ học kỳ</option>
              <option value="month">Theo tháng</option>
              <option value="week">Theo tuần</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          {/* Sub-filter hiển thị ngay bên cạnh dựa trên viewType */}
          {viewType === 'month' && (
            <div className="staff-reports-filter-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <label style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', color: '#374151' }}>Chọn tháng</label>
              <select 
                value={selectedMonth?.value || ''} 
                onChange={(e) => {
                  const month = availableMonths.find(m => m.value === e.target.value);
                  setSelectedMonth(month);
                }}
                className="staff-reports-select"
              >
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewType === 'week' && (
            <div className="staff-reports-filter-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <label style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', color: '#374151' }}>Chọn tuần</label>
              <select 
                value={selectedWeek?.value || ''} 
                onChange={(e) => {
                  const week = availableWeeks.find(w => w.value === parseInt(e.target.value));
                  setSelectedWeek(week);
                }}
                className="staff-reports-select"
              >
                {availableWeeks.map(week => (
                  <option key={week.value} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewType === 'custom' && (
            <div className="staff-reports-filter-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <label style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', color: '#374151' }}>Khoảng thời gian</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="date" 
                  value={customStartDate}
                  min={selectedSemester?.startDate?.split('T')[0]}
                  max={selectedSemester?.endDate?.split('T')[0]}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
                <span>-</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  min={customStartDate || selectedSemester?.startDate?.split('T')[0]}
                  max={selectedSemester?.endDate?.split('T')[0]}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      {reportData && (
        <div className="kpi-section">
          <div className="kpi-cards">
            <div className="kpi-card total">
              <div className="kpi-icon">📊</div>
              <div className="kpi-content">
                <div className="kpi-number">{reportData.kpi.total.toLocaleString()}</div>
                <div className="kpi-label">Tổng Yêu cầu</div>
                <div className={`kpi-change ${getChangeClass(reportData.kpi.changes?.total)}`}>
                  {formatChange(reportData.kpi.changes?.total || 0)} so với kỳ trước
                </div>
              </div>
            </div>

            <div className="kpi-card completed">
              <div className="kpi-icon">✅</div>
              <div className="kpi-content">
                <div className="kpi-number">{reportData.kpi.approved.toLocaleString()}</div>
                <div className="kpi-label">Đã Hoàn thành</div>
                <div className={`kpi-change ${getChangeClass(reportData.kpi.changes?.approved)}`}>
                  {formatChange(reportData.kpi.changes?.approved || 0)} so với kỳ trước
                </div>
              </div>
            </div>

            <div className="kpi-card processing">
              <div className="kpi-icon">⏳</div>
              <div className="kpi-content">
                <div className="kpi-number">{reportData.kpi.pending?.toLocaleString() || 0}</div>
                <div className="kpi-label">Đang Xử lý</div>
              </div>
            </div>

            {staffModule === 'CTSV' && (
              <div className="kpi-card rejected">
                <div className="kpi-icon">❌</div>
                <div className="kpi-content">
                  <div className="kpi-number">{reportData.kpi.rejected?.toLocaleString() || 0}</div>
                  <div className="kpi-label">Đã Từ chối</div>
                  <div className={`kpi-change ${getChangeClass(reportData.kpi.changes?.rejected)}`}>
                    {formatChange(reportData.kpi.changes?.rejected || 0)} so với kỳ trước
                  </div>
                </div>
              </div>
            )}

            {staffModule === 'KTX' && (
              <div className="kpi-card under-review">
                <div className="kpi-icon">🔍</div>
                <div className="kpi-content">
                  <div className="kpi-number">{reportData.kpi.underReview?.toLocaleString() || 0}</div>
                  <div className="kpi-label">Đang Xem xét</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BIỂU ĐỒ XU HƯỚNG */}
      {reportData && reportData.trendData && reportData.trendData.length > 0 && (
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
                <span>{staffModule === 'KTX' ? 'Đang chờ' : 'Bị từ chối'}</span>
              </div>
            </div>
          </div>
          
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={reportData.trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  name="Yêu cầu Mới"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  name="Đã duyệt"
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={staffModule === 'KTX' ? 'pending' : 'rejected'} 
                  name={staffModule === 'KTX' ? 'Đang chờ' : 'Bị từ chối'}
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* BIỂU ĐỒ PHÂN BỔ */}
      {reportData && (
        <div className="breakdown-section">
          <div className="breakdown-charts">
            {/* Phân bổ theo loại */}
            <div className="chart-container">
              <h3>
                {staffModule === 'KTX' 
                  ? 'Phân bổ theo Danh mục thiết bị' 
                  : 'Phân bổ theo Loại chứng nhận'}
              </h3>
              <div className="donut-chart-wrapper">
                {(staffModule === 'KTX' ? reportData.categoryDistribution : reportData.typeDistribution)?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={staffModule === 'KTX' ? reportData.categoryDistribution : reportData.typeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="type"
                        >
                          {(staffModule === 'KTX' ? reportData.categoryDistribution : reportData.typeDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} yêu cầu (${props.payload.percentage}%)`,
                            props.payload.type
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend-vertical">
                      {(staffModule === 'KTX' ? reportData.categoryDistribution : reportData.typeDistribution).map((item, index) => (
                        <div key={index} className="legend-item">
                          <div 
                            className="legend-color" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <span>{item.type} ({item.percentage}%)</span>
                          <span className="legend-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-data">Không có dữ liệu</div>
                )}
              </div>
            </div>

            {/* Phân bổ theo trạng thái */}
            <div className="chart-container">
              <h3>Phân bổ theo Trạng thái</h3>
              <div className="donut-chart-wrapper">
                {reportData.statusDistribution?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reportData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="status"
                        >
                          {reportData.statusDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.status] || CHART_COLORS[index]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} yêu cầu (${props.payload.percentage}%)`,
                            props.payload.status
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend-vertical">
                      {reportData.statusDistribution.map((item, index) => (
                        <div key={index} className="legend-item">
                          <div 
                            className="legend-color" 
                            style={{ backgroundColor: STATUS_COLORS[item.status] || CHART_COLORS[index] }}
                          ></div>
                          <span>{item.status} ({item.percentage}%)</span>
                          <span className="legend-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-data">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {reportData && reportData.kpi.total === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có dữ liệu</h3>
          <p>Không có yêu cầu nào trong khoảng thời gian đã chọn</p>
        </div>
      )}
    </div>
  );
};

export default StaffReports;