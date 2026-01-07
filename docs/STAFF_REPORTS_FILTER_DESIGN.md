# THIẾT KẾ BỘ LỌC TRANG BÁO CÁO STAFF

## 1. Tổng quan

Trang Báo cáo (Staff Reports) cung cấp các thống kê về yêu cầu CTSV và KTX. Để xem dữ liệu theo các tiêu chí khác nhau, cần có hệ thống bộ lọc linh hoạt và hợp lý.

---

## 2. Các bộ lọc được thiết kế

### 2.1. Bộ lọc Học kỳ (Semester Filter)

**Mục đích**: Cho phép xem báo cáo theo từng học kỳ cụ thể.

**Dữ liệu**:
- Lấy danh sách học kỳ từ API `/api/semesters`
- Mỗi học kỳ có: `_id`, `name`, `startDate`, `endDate`

**Hiển thị**:
```
HỌC KỲ: [HK1 (2025-2026) ▼]
```

**Danh sách options** (ví dụ):
- HK1 (2024-2025): 01/09/2024 - 31/01/2025
- HK2 (2024-2025): 01/02/2025 - 30/06/2025
- HK1 (2025-2026): 01/09/2025 - 31/01/2026 ← **Mặc định chọn học kỳ hiện tại**
- HK2 (2025-2026): 01/02/2026 - 30/06/2026

**Logic**:
- Khi component mount → Fetch danh sách học kỳ
- Tự động chọn học kỳ hiện tại (dựa vào ngày hiện tại nằm trong khoảng nào)
- Khi thay đổi học kỳ → Cập nhật các filter con (Tháng, Tuần) và fetch lại dữ liệu báo cáo

---

### 2.2. Bộ lọc Thời gian trong Học kỳ (Time Range Filter)

**Mục đích**: Cho phép xem chi tiết hơn trong một học kỳ đã chọn.

**Loại xem**:

| Loại | Mô tả |
|------|-------|
| Toàn bộ HK | Xem tổng hợp toàn bộ học kỳ |
| Theo tháng | Chọn một tháng cụ thể trong học kỳ |
| Theo tuần | Chọn một tuần cụ thể trong học kỳ |
| Tùy chỉnh | Chọn khoảng ngày bất kỳ trong học kỳ |

**Giao diện**:
```
XEM THEO: (•) Toàn bộ HK
          ( ) Theo tháng  → [Tháng 9/2025 ▼]
          ( ) Theo tuần   → [Tuần 1 (01/09 - 07/09) ▼]
          ( ) Tùy chỉnh   → [📅 Từ ngày] - [📅 Đến ngày]
```

#### 2.2.1. Toàn bộ Học kỳ
- **Không cần chọn thêm gì**
- Filter: `startDate` và `endDate` của học kỳ

#### 2.2.2. Theo Tháng
**Logic generate danh sách tháng**:
```javascript
// Ví dụ: HK1 (2025-2026): 01/09/2025 - 31/01/2026
// → Danh sách tháng:
[
  { value: '2025-09', label: 'Tháng 9/2025', startDate: '2025-09-01', endDate: '2025-09-30' },
  { value: '2025-10', label: 'Tháng 10/2025', startDate: '2025-10-01', endDate: '2025-10-31' },
  { value: '2025-11', label: 'Tháng 11/2025', startDate: '2025-11-01', endDate: '2025-11-30' },
  { value: '2025-12', label: 'Tháng 12/2025', startDate: '2025-12-01', endDate: '2025-12-31' },
  { value: '2026-01', label: 'Tháng 1/2026', startDate: '2026-01-01', endDate: '2026-01-31' }
]
```

**Mặc định**: 
- Nếu là học kỳ hiện tại → Chọn tháng hiện tại
- Nếu là học kỳ cũ → Chọn tháng cuối cùng của học kỳ

#### 2.2.3. Theo Tuần
**Logic generate danh sách tuần**:
```javascript
// Ví dụ: HK1 (2025-2026): 01/09/2025 - 31/01/2026
// Số ngày = 153 ngày → 22 tuần (7 ngày/tuần, tuần cuối có thể < 7 ngày)

// Thuật toán:
function generateWeeks(startDate, endDate) {
  const weeks = [];
  let currentStart = new Date(startDate);
  let weekNumber = 1;
  
  while (currentStart <= endDate) {
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6); // +6 ngày = 7 ngày
    
    // Nếu vượt quá endDate, lấy endDate
    if (currentEnd > endDate) {
      currentEnd = new Date(endDate);
    }
    
    weeks.push({
      value: weekNumber,
      label: `Tuần ${weekNumber} (${formatDate(currentStart)} - ${formatDate(currentEnd)})`,
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString()
    });
    
    // Chuyển sang tuần tiếp theo
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    weekNumber++;
  }
  
  return weeks;
}

// Kết quả:
[
  { value: 1, label: 'Tuần 1 (01/09 - 07/09)', startDate: '...', endDate: '...' },
  { value: 2, label: 'Tuần 2 (08/09 - 14/09)', startDate: '...', endDate: '...' },
  { value: 3, label: 'Tuần 3 (15/09 - 21/09)', startDate: '...', endDate: '...' },
  // ... 
  { value: 22, label: 'Tuần 22 (26/01 - 31/01)', startDate: '...', endDate: '...' }
]
```

**Mặc định**:
- Nếu là học kỳ hiện tại → Tìm tuần chứa ngày hiện tại
- Nếu là học kỳ cũ → Chọn tuần cuối cùng

#### 2.2.4. Tùy chỉnh
**Giao diện**: 2 DatePicker (Từ ngày, Đến ngày)

**Validation**:
- Từ ngày phải >= startDate của học kỳ
- Đến ngày phải <= endDate của học kỳ
- Từ ngày phải <= Đến ngày

**DatePicker bị giới hạn**: 
- `minDate` = startDate của học kỳ
- `maxDate` = endDate của học kỳ

---

### 2.3. Bộ lọc Loại yêu cầu (Request Type Filter)

**Mục đích**: Lọc theo loại yêu cầu CTSV hoặc KTX.

**Hiển thị**:
```
LOẠI YÊU CẦU: [Tất cả ▼]
```

**Options**:
| Value | Label |
|-------|-------|
| `all` | Tất cả |
| `CTSV` | Công tác sinh viên |
| `KTX` | Ký túc xá |

**Logic**:
- Khi chọn "Tất cả" → Không thêm filter loại vào API query
- Khi chọn "CTSV" → Filter chỉ lấy yêu cầu CTSV
- Khi chọn "KTX" → Filter chỉ lấy yêu cầu KTX

---

## 3. Giao diện tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  HỌC KỲ          XEM THEO                                    LOẠI YÊU CẦU  │
│  ┌─────────────┐ ┌────────────────────────────────────────┐  ┌───────────┐  │
│  │ HK1 (25-26) │ │ ○ Toàn bộ HK                           │  │ Tất cả  ▼ │  │
│  │     ▼       │ │ ● Theo tháng  [Tháng 1/2026      ▼]    │  └───────────┘  │
│  └─────────────┘ │ ○ Theo tuần   [Tuần 18 (01/01-07/01)▼] │                 │
│                  │ ○ Tùy chỉnh   [📅 01/01] - [📅 07/01]  │                 │
│                  └────────────────────────────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Luồng hoạt động

### 4.1. Khi component mount
```
1. Fetch danh sách học kỳ từ API
2. Xác định học kỳ hiện tại (ngày hiện tại nằm trong học kỳ nào)
3. Set học kỳ mặc định = học kỳ hiện tại
4. Generate danh sách tháng và tuần cho học kỳ đó
5. Set loại xem mặc định = "Toàn bộ HK"
6. Fetch dữ liệu báo cáo với filter mặc định
```

### 4.2. Khi thay đổi Học kỳ
```
1. Cập nhật state selectedSemester
2. Re-generate danh sách tháng và tuần mới
3. Reset loại xem về "Toàn bộ HK"
4. Fetch lại dữ liệu báo cáo
```

### 4.3. Khi thay đổi Loại xem
```
1. Cập nhật state viewType
2. Nếu chọn "Theo tháng" → Set tháng mặc định (tháng hiện tại hoặc tháng cuối)
3. Nếu chọn "Theo tuần" → Set tuần mặc định (tuần hiện tại hoặc tuần cuối)
4. Nếu chọn "Tùy chỉnh" → Hiển thị DatePicker với giá trị mặc định
5. Fetch lại dữ liệu báo cáo
```

### 4.4. Khi thay đổi Tháng/Tuần/Ngày tùy chỉnh
```
1. Cập nhật state tương ứng
2. Fetch lại dữ liệu báo cáo với filter mới
```

### 4.5. Khi thay đổi Loại yêu cầu
```
1. Cập nhật state requestType
2. Fetch lại dữ liệu báo cáo với filter mới
```

---

## 5. API Query Parameters

Khi gọi API lấy dữ liệu báo cáo, gửi các parameters:

```javascript
{
  semesterId: '...', // ID học kỳ (optional, có thể dùng startDate/endDate thay thế)
  startDate: '2025-09-01', // Ngày bắt đầu lọc
  endDate: '2026-01-31',   // Ngày kết thúc lọc
  requestType: 'all' | 'CTSV' | 'KTX' // Loại yêu cầu
}
```

**Ví dụ các trường hợp**:

| Trường hợp | startDate | endDate | requestType |
|------------|-----------|---------|-------------|
| Toàn bộ HK1 (25-26), Tất cả | 2025-09-01 | 2026-01-31 | all |
| Tháng 12/2025, CTSV | 2025-12-01 | 2025-12-31 | CTSV |
| Tuần 15, KTX | 2025-12-08 | 2025-12-14 | KTX |
| Tùy chỉnh, Tất cả | 2025-11-15 | 2025-12-15 | all |

---

## 6. State Management

```javascript
const [filters, setFilters] = useState({
  // Học kỳ
  semester: null, // { _id, name, startDate, endDate }
  semesters: [],  // Danh sách học kỳ từ API
  
  // Loại xem
  viewType: 'all', // 'all' | 'month' | 'week' | 'custom'
  
  // Tháng (khi viewType = 'month')
  selectedMonth: null, // { value: '2025-12', label: '...', startDate, endDate }
  availableMonths: [], // Danh sách tháng trong học kỳ
  
  // Tuần (khi viewType = 'week')
  selectedWeek: null, // { value: 15, label: '...', startDate, endDate }
  availableWeeks: [], // Danh sách tuần trong học kỳ
  
  // Tùy chỉnh (khi viewType = 'custom')
  customStartDate: null,
  customEndDate: null,
  
  // Loại yêu cầu
  requestType: 'all' // 'all' | 'CTSV' | 'KTX'
});
```

---

## 7. Utility Functions

### 7.1. Generate Months
```javascript
function generateMonthsInSemester(startDate, endDate) {
  // Trả về mảng các tháng trong khoảng [startDate, endDate]
}
```

### 7.2. Generate Weeks
```javascript
function generateWeeksInSemester(startDate, endDate) {
  // Trả về mảng các tuần trong khoảng [startDate, endDate]
  // Mỗi tuần có label hiển thị ngày cụ thể
}
```

### 7.3. Get Current Semester
```javascript
function getCurrentSemester(semesters) {
  // Tìm học kỳ chứa ngày hiện tại
  const today = new Date();
  return semesters.find(sem => 
    today >= new Date(sem.startDate) && today <= new Date(sem.endDate)
  );
}
```

### 7.4. Get Date Range From Filters
```javascript
function getDateRangeFromFilters(filters) {
  // Trả về { startDate, endDate } dựa trên filters hiện tại
  switch (filters.viewType) {
    case 'all':
      return { startDate: filters.semester.startDate, endDate: filters.semester.endDate };
    case 'month':
      return { startDate: filters.selectedMonth.startDate, endDate: filters.selectedMonth.endDate };
    case 'week':
      return { startDate: filters.selectedWeek.startDate, endDate: filters.selectedWeek.endDate };
    case 'custom':
      return { startDate: filters.customStartDate, endDate: filters.customEndDate };
  }
}
```

---

## 8. Responsive Design

### Desktop (>= 1024px)
- Tất cả filter trên 1 hàng
- Radio buttons hiển thị dạng inline

### Tablet (768px - 1023px)
- Học kỳ và Loại yêu cầu trên hàng 1
- Xem theo trên hàng 2

### Mobile (< 768px)
- Mỗi filter trên 1 hàng riêng
- Radio buttons hiển thị dạng stack (vertical)

---

## 9. Biểu đồ Xu hướng - Số điểm dữ liệu

### 9.1. Quy tắc chia điểm theo loại xem

| Loại xem | Số điểm | Đơn vị | Label trục X |
|----------|---------|--------|--------------|
| **Theo tuần** | 7 điểm | Ngày | Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, CN |
| **Theo tháng** | 4-5 điểm | Tuần | Tuần 1, Tuần 2, Tuần 3, Tuần 4, (Tuần 5) |
| **Toàn bộ HK** | 5-6 điểm | Tháng | T9, T10, T11, T12, T1 (ví dụ HK1) |
| **Tùy chỉnh** | Động | Động | Phụ thuộc độ dài khoảng thời gian |

### 9.2. Logic cho Tùy chỉnh

```javascript
function getChartGranularity(startDate, endDate) {
  const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    // Khoảng <= 7 ngày → Chia theo NGÀY (tối đa 7 điểm)
    return 'day';
  } else if (diffDays <= 35) {
    // Khoảng 8-35 ngày → Chia theo TUẦN (4-5 điểm)
    return 'week';
  } else {
    // Khoảng > 35 ngày → Chia theo THÁNG (2-6 điểm)
    return 'month';
  }
}
```

### 9.3. Ví dụ hiển thị

**Theo tuần (Tuần 1: 01/09 - 07/09):**
```
Thứ 2 (01/09) | Thứ 3 (02/09) | Thứ 4 (03/09) | Thứ 5 (04/09) | Thứ 6 (05/09) | Thứ 7 (06/09) | CN (07/09)
     45       |      52       |      38       |      61       |      49       |      55       |     42
```

**Theo tháng (Tháng 10/2025):**
```
Tuần 1 (01-07/10) | Tuần 2 (08-14/10) | Tuần 3 (15-21/10) | Tuần 4 (22-28/10) | Tuần 5 (29-31/10)
       120        |        145        |        132        |        158        |        48
```

**Toàn bộ HK (HK1 2025-2026):**
```
Tháng 9 | Tháng 10 | Tháng 11 | Tháng 12 | Tháng 1
  450   |   520    |   480    |   390    |   410
```

---

## 10. Biểu đồ Phân bổ - Thiết kế theo Module

### 10.1. Vấn đề với thiết kế cũ

Phân bổ "CTSV / KTX / Khác" **không hợp lý** vì:
- Staff CTSV chỉ quản lý yêu cầu CTSV → Không có KTX trong dữ liệu
- Staff KTX chỉ quản lý yêu cầu KTX → Không có CTSV trong dữ liệu
- Biểu đồ này sẽ luôn hiển thị 100% cho 1 loại duy nhất

### 10.2. Thiết kế mới: Phân bổ theo Loại chứng nhận/yêu cầu cụ thể

#### Đối với Staff CTSV:

**Tiêu đề**: "Phân bổ theo Loại chứng nhận"

**Dữ liệu từ**: Collection `CertificateRequest` → Group by `certificateType`

**Ví dụ hiển thị**:
```
┌─────────────────────────────────────────────────────────────┐
│              Phân bổ theo Loại chứng nhận                   │
│                                                             │
│   [DONUT CHART]                                             │
│                                                             │
│   🔵 Xác nhận sinh viên        234 yêu cầu   (45%)          │
│   🟢 Xác nhận kết quả học tập  128 yêu cầu   (25%)          │
│   🟡 Giấy giới thiệu            92 yêu cầu   (18%)          │
│   🟠 Xác nhận vay vốn           41 yêu cầu   (8%)           │
│   🔴 Khác                       20 yêu cầu   (4%)           │
│                                                             │
│   Tổng: 515 yêu cầu                                         │
└─────────────────────────────────────────────────────────────┘
```

#### Đối với Staff KTX:

**Tiêu đề**: "Phân bổ theo Loại yêu cầu KTX"

**Dữ liệu từ**: Collection `DormitoryRequest` → Group by `requestType`

**Ví dụ hiển thị**:
```
┌─────────────────────────────────────────────────────────────┐
│              Phân bổ theo Loại yêu cầu KTX                  │
│                                                             │
│   [DONUT CHART]                                             │
│                                                             │
│   🔵 Đăng ký KTX mới           180 yêu cầu   (55%)          │
│   🟢 Gia hạn hợp đồng           82 yêu cầu   (25%)          │
│   🟡 Hủy hợp đồng               39 yêu cầu   (12%)          │
│   🟠 Đổi phòng                  26 yêu cầu   (8%)           │
│                                                             │
│   Tổng: 327 yêu cầu                                         │
└─────────────────────────────────────────────────────────────┘
```

### 10.3. Legend Format

Mỗi item trong legend hiển thị:
```
[Màu] Tên loại chứng nhận/yêu cầu    Số lượng yêu cầu   (Phần trăm%)
```

### 10.4. API Response Format

```javascript
// CTSV - Phân bổ theo loại chứng nhận
{
  distribution: [
    { type: 'Xác nhận sinh viên', count: 234, percentage: 45 },
    { type: 'Xác nhận kết quả học tập', count: 128, percentage: 25 },
    { type: 'Giấy giới thiệu', count: 92, percentage: 18 },
    { type: 'Xác nhận vay vốn', count: 41, percentage: 8 },
    { type: 'Khác', count: 20, percentage: 4 }
  ],
  total: 515
}

// KTX - Phân bổ theo loại yêu cầu
{
  distribution: [
    { type: 'Đăng ký KTX mới', count: 180, percentage: 55 },
    { type: 'Gia hạn hợp đồng', count: 82, percentage: 25 },
    { type: 'Hủy hợp đồng', count: 39, percentage: 12 },
    { type: 'Đổi phòng', count: 26, percentage: 8 }
  ],
  total: 327
}
```

### 10.5. Biểu đồ Phân bổ theo Trạng thái (Giữ nguyên)

Biểu đồ thứ 2 "Phân bổ theo Trạng thái" **giữ nguyên** vì nó có ý nghĩa cho cả 2 module:

```
┌─────────────────────────────────────────────────────────────┐
│              Phân bổ theo Trạng thái                        │
│                                                             │
│   [DONUT CHART]                                             │
│                                                             │
│   🟢 Đã duyệt       412 yêu cầu   (80%)                     │
│   🔴 Bị từ chối      62 yêu cầu   (12%)                     │
│   🟡 Đang chờ        41 yêu cầu   (8%)                      │
│                                                             │
│   Tổng: 515 yêu cầu                                         │
└─────────────────────────────────────────────────────────────┘
```

### 10.6. Màu sắc cho Donut Chart

**Palette màu cho phân bổ loại (tối đa 8 màu):**
```javascript
const CHART_COLORS = [
  '#4F46E5', // Indigo (chính)
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6B7280'  // Gray (cho "Khác")
];
```

**Palette màu cho trạng thái:**
```javascript
const STATUS_COLORS = {
  'Đã duyệt': '#10B981',   // Green
  'Bị từ chối': '#EF4444', // Red
  'Đang chờ': '#F59E0B'    // Amber/Yellow
};
```

---

## 11. Checklist Implementation

### Filters
- [ ] Fetch danh sách học kỳ từ API
- [ ] Component SemesterSelect
- [ ] Component ViewTypeSelector (radio buttons)
- [ ] Component MonthSelect
- [ ] Component WeekSelect  
- [ ] Component CustomDateRange (2 DatePicker)
- [ ] Utility function: generateMonthsInSemester
- [ ] Utility function: generateWeeksInSemester
- [ ] Utility function: getCurrentSemester
- [ ] Utility function: getDateRangeFromFilters
- [ ] State management với useReducer hoặc useState
- [ ] API integration: Gọi lại API khi filter thay đổi

### Biểu đồ Xu hướng
- [ ] Utility function: getChartGranularity (xác định chia theo ngày/tuần/tháng)
- [ ] Utility function: generateChartLabels (tạo labels cho trục X)
- [ ] Utility function: aggregateDataByGranularity (group dữ liệu theo đơn vị thời gian)
- [ ] LineChart với Recharts (đã cài đặt)
- [ ] Responsive chart container

### Biểu đồ Phân bổ
- [ ] Donut Chart: Phân bổ theo Loại chứng nhận (CTSV) / Loại yêu cầu KTX
- [ ] Donut Chart: Phân bổ theo Trạng thái (giữ nguyên)
- [ ] Legend với số lượng và phần trăm
- [ ] Tooltip khi hover
- [ ] Dynamic title dựa trên module (CTSV/KTX)

### UI/UX
- [ ] Responsive CSS cho filters và charts
- [ ] Loading state khi đang fetch
- [ ] Error handling
- [ ] Empty state khi không có dữ liệu
