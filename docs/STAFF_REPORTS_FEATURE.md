# Tài Liệu Chức Năng Báo Cáo Thống Kê (Staff Reports)

## 1. Tổng Quan

Chức năng **Báo Cáo Thống Kê** cho phép nhân viên CTSV và KTX xem các thống kê về hoạt động quản lý trong từng học kỳ. Hệ thống cung cấp các biểu đồ trực quan và các chỉ số KPI để đánh giá hiệu quả công việc.

### 1.1. Phân Quyền Truy Cập

| Vai trò | Module | Mô tả |
|---------|--------|-------|
| `staff_ctsv` | CTSV | Xem báo cáo giấy chứng nhận |
| `staff_ktx` | KTX | Xem báo cáo ký túc xá |

### 1.2. Đường Dẫn Truy Cập

- **CTSV**: `/staff/ctsv/reports`
- **KTX**: `/staff/ktx/reports`

---

## 2. Giao Diện Người Dùng

### 2.1. Cấu Trúc Trang

```
┌─────────────────────────────────────────────────────────────┐
│  TIÊU ĐỀ: Báo Cáo Thống Kê                                  │
├─────────────────────────────────────────────────────────────┤
│  BỘ LỌC                                                     │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Học kỳ: [▼]  │ Xem theo: [▼]│ [Tháng/Tuần/Ngày]: [▼]   │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  KPI CARDS (4 thẻ)                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Tổng số │ │Đang chờ │ │Đã duyệt │ │ Từ chối │           │
│  │   120   │ │   25    │ │   85    │ │   10    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  BIỂU ĐỒ XU HƯỚNG (Line Chart)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    📈                                   ││
│  │     ──●──●──●──●──●──●──●──                             ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  BIỂU ĐỒ PHÂN BỐ (2 Pie Charts)                             │
│  ┌──────────────────────┐ ┌──────────────────────┐         │
│  │ Theo Loại/Danh mục   │ │    Theo Trạng thái   │         │
│  │      🥧              │ │         🥧           │         │
│  └──────────────────────┘ └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Hệ Thống Bộ Lọc

### 3.1. Bộ Lọc Học Kỳ

**Mô tả**: Cho phép chọn học kỳ để xem báo cáo.

| Thuộc tính | Giá trị |
|------------|---------|
| Loại | Dropdown |
| Dữ liệu | Lấy từ API `/api/reports/semesters` |
| Mặc định | Học kỳ hiện tại (dựa theo ngày hiện tại) |

**Cấu trúc dữ liệu học kỳ**:
```json
{
  "_id": "semester_id",
  "name": "Học kỳ 1 - 2025-2026",
  "startDate": "2025-09-01",
  "endDate": "2026-01-31"
}
```

### 3.2. Bộ Lọc "Xem Theo" (View Mode)

**Mô tả**: Xác định mức độ chi tiết của dữ liệu hiển thị.

| Giá trị | Mô tả | Bộ lọc phụ |
|---------|-------|------------|
| `all` | Toàn bộ học kỳ | Không có |
| `month` | Theo tháng | Dropdown chọn tháng |
| `week` | Theo tuần | Dropdown chọn tuần |
| `custom` | Tùy chỉnh | Date picker (từ ngày - đến ngày) |

### 3.3. Bộ Lọc Phụ Động (Dynamic Sub-filters)

#### 3.3.1. Khi chọn "Theo tháng"

- Hiển thị dropdown danh sách các tháng trong học kỳ
- Ví dụ: `Tháng 9/2025`, `Tháng 10/2025`, ...
- Tự động tính toán từ `startDate` và `endDate` của học kỳ

#### 3.3.2. Khi chọn "Theo tuần"

- Hiển thị dropdown danh sách các tuần trong học kỳ
- Format: `Tuần 1 (01/09 - 07/09)`
- Tự động đánh số tuần từ ngày bắt đầu học kỳ

#### 3.3.3. Khi chọn "Tùy chỉnh"

- Hiển thị 2 input date picker
- `Từ ngày`: Giới hạn trong phạm vi học kỳ
- `Đến ngày`: Giới hạn trong phạm vi học kỳ

---

## 4. Thành Phần KPI Cards

### 4.1. Module CTSV (Giấy Chứng Nhận)

| Card | Mô tả | Icon | Màu |
|------|-------|------|-----|
| Tổng yêu cầu | Tổng số yêu cầu trong kỳ | 📋 | Xanh dương |
| Đang chờ | Số yêu cầu chờ duyệt | ⏳ | Vàng |
| Đã duyệt | Số yêu cầu đã hoàn thành | ✅ | Xanh lá |
| Từ chối | Số yêu cầu bị từ chối | ❌ | Đỏ |

### 4.2. Module KTX (Ký Túc Xá)

| Card | Mô tả | Icon | Màu |
|------|-------|------|-----|
| Tổng yêu cầu | Tổng số yêu cầu đăng ký | 🏠 | Xanh dương |
| Đang chờ | Số yêu cầu chờ xét duyệt | ⏳ | Vàng |
| Đã duyệt | Số yêu cầu được chấp nhận | ✅ | Xanh lá |
| Từ chối | Số yêu cầu bị từ chối | ❌ | Đỏ |

---

## 5. Biểu Đồ Xu Hướng (Trend Chart)

### 5.1. Mô Tả

Biểu đồ đường (Line Chart) hiển thị xu hướng số lượng yêu cầu theo thời gian.

### 5.2. Độ Chi Tiết (Granularity)

| View Mode | Granularity | Trục X |
|-----------|-------------|--------|
| Toàn bộ HK | Theo tháng | Tháng 9, Tháng 10, ... |
| Theo tháng | Theo ngày | 01, 02, 03, ... |
| Theo tuần | Theo ngày | T2, T3, T4, ... |
| Tùy chỉnh | Tự động* | Phụ thuộc khoảng thời gian |

*Tùy chỉnh tự động:
- ≤ 7 ngày → Theo ngày
- ≤ 31 ngày → Theo ngày  
- > 31 ngày → Theo tuần

### 5.3. Dữ Liệu Hiển Thị

- **Trục X**: Thời gian (theo granularity)
- **Trục Y**: Số lượng yêu cầu
- **Đường**: Tổng số yêu cầu mới

---

## 6. Biểu Đồ Phân Bố (Distribution Charts)

### 6.1. Biểu Đồ Theo Loại/Danh Mục

#### Module CTSV
- Phân bố theo **Loại giấy chứng nhận**
- Ví dụ: Xác nhận sinh viên, Bảng điểm, Giấy giới thiệu, ...

#### Module KTX
- Phân bố theo **Danh mục thiết bị** (nếu có)
- Hoặc theo **Loại phòng**

### 6.2. Biểu Đồ Theo Trạng Thái

Hiển thị tỷ lệ các trạng thái:
- Đang chờ (Pending)
- Đang xử lý (Processing) 
- Đã duyệt (Approved)
- Từ chối (Rejected)
- Đã hủy (Cancelled)

---

## 7. Luồng Xử Lý Dữ Liệu

### 7.1. Sơ Đồ Luồng

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  MongoDB    │
│  (React)    │◀────│  (Express)  │◀────│  (Atlas)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ├── reportController.js
       │                   ├── reportService.js
       │                   └── reportRepository.js
       │
       ├── StaffReports.jsx
       └── reports.js (service)
```

### 7.2. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reports/semesters` | Lấy danh sách học kỳ |
| GET | `/api/reports/ctsv` | Lấy báo cáo CTSV |
| GET | `/api/reports/ktx` | Lấy báo cáo KTX |

### 7.3. Query Parameters

```
GET /api/reports/ctsv?semesterId=xxx&startDate=2025-09-01&endDate=2025-09-30&granularity=day
```

| Parameter | Bắt buộc | Mô tả |
|-----------|----------|-------|
| `semesterId` | Có | ID của học kỳ |
| `startDate` | Không | Ngày bắt đầu (ISO format) |
| `endDate` | Không | Ngày kết thúc (ISO format) |
| `granularity` | Không | `day`, `week`, `month` |

### 7.4. Response Format

```json
{
  "success": true,
  "data": {
    "kpiData": {
      "total": 120,
      "pending": 25,
      "approved": 85,
      "rejected": 10
    },
    "trendData": [
      { "label": "01/09", "value": 15 },
      { "label": "02/09", "value": 22 },
      ...
    ],
    "distributionByType": [
      { "name": "Xác nhận SV", "value": 45 },
      { "name": "Bảng điểm", "value": 30 },
      ...
    ],
    "distributionByStatus": [
      { "name": "Đang chờ", "value": 25 },
      { "name": "Đã duyệt", "value": 85 },
      ...
    ]
  }
}
```

---

## 8. Xử Lý Trạng Thái

### 8.1. Loading State

- Hiển thị skeleton loading cho KPI cards
- Hiển thị spinner cho biểu đồ
- Disable các bộ lọc khi đang tải

### 8.2. Error State

- Hiển thị thông báo lỗi với nút "Thử lại"
- Log chi tiết lỗi vào console

### 8.3. Empty State

- Hiển thị thông báo "Không có dữ liệu"
- Gợi ý thay đổi bộ lọc

---

## 9. Responsive Design

### 9.1. Breakpoints

| Breakpoint | Thiết bị | Thay đổi |
|------------|----------|----------|
| > 1200px | Desktop | Layout đầy đủ |
| 900-1200px | Tablet | Bộ lọc thu gọn |
| < 900px | Mobile | Bộ lọc xếp dọc |

### 9.2. Mobile Adjustments

- Bộ lọc xếp theo chiều dọc
- KPI cards 2 cột thay vì 4 cột
- Biểu đồ chiếm 100% width
- Pie charts xếp dọc

---

## 10. Công Thức Tính Toán

### 10.1. Tính Danh Sách Tháng Trong Học Kỳ

```javascript
function generateMonthsInSemester(startDate, endDate) {
  const months = [];
  let current = new Date(startDate);
  current.setDate(1); // Đầu tháng
  
  while (current <= endDate) {
    months.push({
      value: `${current.getFullYear()}-${current.getMonth() + 1}`,
      label: `Tháng ${current.getMonth() + 1}/${current.getFullYear()}`
    });
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}
```

### 10.2. Tính Danh Sách Tuần Trong Học Kỳ

```javascript
function generateWeeksInSemester(startDate, endDate) {
  const weeks = [];
  let weekStart = new Date(startDate);
  let weekNum = 1;
  
  while (weekStart <= endDate) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      value: weekNum,
      label: `Tuần ${weekNum} (${format(weekStart)} - ${format(weekEnd)})`
    });
    
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }
  
  return weeks;
}
```

### 10.3. Xác Định Granularity Tự Động

```javascript
function getChartGranularity(viewMode, dateRange) {
  if (viewMode === 'all') return 'month';
  if (viewMode === 'month') return 'day';
  if (viewMode === 'week') return 'day';
  if (viewMode === 'custom') {
    const days = daysBetween(dateRange.start, dateRange.end);
    if (days <= 31) return 'day';
    return 'week';
  }
}
```

---

## 11. Cấu Trúc File

```
frontend/src/
├── components/staff/reports/
│   ├── StaffReports.jsx      # Component chính
│   └── StaffReports.css      # Styles
│
├── services/
│   └── reports.js            # API service + utilities
│
backend/src/
├── controllers/
│   └── reportController.js   # HTTP handlers
│
├── services/
│   └── reportService.js      # Business logic
│
├── repositories/
│   └── reportRepository.js   # Database queries
│
└── routes/
    └── reportRoutes.js       # Route definitions
```

---

## 12. Các Lưu Ý Quan Trọng

### 12.1. Performance

- Sử dụng aggregation pipeline cho truy vấn MongoDB
- Cache danh sách học kỳ (hiếm khi thay đổi)
- Lazy loading cho biểu đồ

### 12.2. Security

- Kiểm tra quyền truy cập theo role
- Validate semesterId trước khi query
- Sanitize date parameters

### 12.3. UX

- Tự động chọn học kỳ hiện tại
- Tự động chọn tháng/tuần hiện tại
- Hiển thị loading state rõ ràng
- Thông báo lỗi user-friendly

---

## 13. Tài Liệu Liên Quan

- [STAFF_REPORTS_FILTER_DESIGN.md](./STAFF_REPORTS_FILTER_DESIGN.md) - Thiết kế chi tiết bộ lọc
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Tài liệu API tổng quan
- [CTSV_MODULE_DOCUMENTATION.md](./CTSV_MODULE_DOCUMENTATION.md) - Tài liệu module CTSV
- [KTX_MODULE_DOCUMENTATION.md](./KTX_MODULE_DOCUMENTATION.md) - Tài liệu module KTX
