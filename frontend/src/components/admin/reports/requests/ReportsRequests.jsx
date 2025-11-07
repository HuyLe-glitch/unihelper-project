import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./ReportsRequests.css";

const ReportsRequests = () => {
  // Dropdown state
  const [selectedMonth, setSelectedMonth] = useState(3); // March default
  const [selectedYear, setSelectedYear] = useState(2024);

  // Mock dữ liệu theo tuần trong tháng
  const mockWeeklyData = useMemo(
    () => ({
      2024: {
        3: [
          { week: "Tuần 1", requests: 8 },
          { week: "Tuần 2", requests: 12 },
          { week: "Tuần 3", requests: 20 },
          { week: "Tuần 4", requests: 15 },
        ],
        4: [
          { week: "Tuần 1", requests: 10 },
          { week: "Tuần 2", requests: 18 },
          { week: "Tuần 3", requests: 25 },
          { week: "Tuần 4", requests: 20 },
        ],
      },
      2025: {
        3: [
          { week: "Tuần 1", requests: 14 },
          { week: "Tuần 2", requests: 17 },
          { week: "Tuần 3", requests: 19 },
          { week: "Tuần 4", requests: 22 },
        ],
      },
    }),
    []
  );

  // Mock dữ liệu tỉ lệ theo danh mục cho từng tháng/năm
  const mockCategoryData = useMemo(
    () => ({
      2024: {
        3: [
          { name: "Công tác sinh viên", value: 35, color: "#4f46e5" },
          { name: "Ký túc xá", value: 20, color: "#06b6d4" },
        ],
        4: [
          { name: "Công tác sinh viên", value: 45, color: "#4f46e5" },
          { name: "Ký túc xá", value: 28, color: "#06b6d4" },
        ],
      },
      2025: {
        3: [
          { name: "Công tác sinh viên", value: 42, color: "#4f46e5" },
          { name: "Ký túc xá", value: 30, color: "#06b6d4" },
        ],
      },
    }),
    []
  );

  // Mock dữ liệu tỉ lệ theo trạng thái cho từng tháng/năm
  const mockStatusData = useMemo(
    () => ({
      2024: {
        3: [
          { name: "Pending", value: 15, color: "#f59e0b" },
          { name: "Under Review", value: 12, color: "#3b82f6" },
          { name: "Approved", value: 22, color: "#10b981" },
          { name: "Rejected", value: 6, color: "#ef4444" },
        ],
        4: [
          { name: "Pending", value: 18, color: "#f59e0b" },
          { name: "Under Review", value: 15, color: "#3b82f6" },
          { name: "Approved", value: 30, color: "#10b981" },
          { name: "Rejected", value: 10, color: "#ef4444" },
        ],
      },
      2025: {
        3: [
          { name: "Pending", value: 20, color: "#f59e0b" },
          { name: "Under Review", value: 16, color: "#3b82f6" },
          { name: "Approved", value: 28, color: "#10b981" },
          { name: "Rejected", value: 8, color: "#ef4444" },
        ],
      },
    }),
    []
  );

  // Mock dữ liệu tổng thể qua các năm
  const yearlyData = [
    { year: 2022, totalRequests: 240 },
    { year: 2023, totalRequests: 315 },
    { year: 2024, totalRequests: 380 },
    { year: 2025, totalRequests: 420 },
  ];

  // Danh sách tháng để dropdown
  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const availableYears = Object.keys(mockWeeklyData).map(Number);

  const chartData = mockWeeklyData[selectedYear]?.[selectedMonth] || [];
  const categoryData = mockCategoryData[selectedYear]?.[selectedMonth] || [];
  const statusData = mockStatusData[selectedYear]?.[selectedMonth] || [];

  // Custom label cho Pie Chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "14px", fontWeight: "600" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="report-card-wrapper">
      <div className="report-card chart-card">
        <h4>
          <span className="card-icon">📊</span>
          Báo cáo số lượng yêu cầu
        </h4>

        {/* Bộ lọc tháng / năm */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          >
            {months.map((label, i) => (
              <option key={i} value={i + 1}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
          </select>
        </div>

        {/* Biểu đồ theo tuần */}
        <h4>
          <span className="card-icon">📅</span>
          Thống kê yêu cầu theo tuần ({months[selectedMonth - 1]} - {selectedYear})
        </h4>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="requests"
                name="Số lượng yêu cầu"
                fill="#4f46e5"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bảng thống kê tổng hợp */}
        <div style={{ marginTop: "40px" }}>
          <h4>
            <span className="card-icon">📈</span>
            Tổng số yêu cầu theo năm
          </h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "10px" }}>Năm</th>
                <th style={{ padding: "10px" }}>Tổng số yêu cầu</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((item) => (
                <tr
                  key={item.year}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "10px", color: "#4f46e5" }}>{item.year}</td>
                  <td style={{ padding: "10px", color: "#4f46e5" }}>{item.totalRequests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 Pie Charts bên dưới */}
      <div className="pie-charts-row">
        {/* Pie Chart 1: Tỉ lệ theo danh mục */}
        <div className="report-card chart-card">
          <h4>
            <span className="card-icon">📊</span>
            Tỉ lệ yêu cầu theo danh mục ({months[selectedMonth - 1]} - {selectedYear})
          </h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart 2: Tỉ lệ theo trạng thái */}
        <div className="report-card chart-card">
          <h4>
            <span className="card-icon">📈</span>
            Tỉ lệ yêu cầu theo trạng thái ({months[selectedMonth - 1]} - {selectedYear})
          </h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsRequests;