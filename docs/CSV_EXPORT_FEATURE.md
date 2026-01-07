# Chức năng Xuất File CSV

## Tổng quan

Hệ thống UniHelper cung cấp chức năng xuất dữ liệu ra file CSV cho nhiều module khác nhau. File CSV xuất ra hỗ trợ UTF-8 với BOM để hiển thị đúng tiếng Việt trên Microsoft Excel.

---

## 1. Staff CTSV - Xuất Yêu Cầu Chứng Nhận

### 1.1. Vị trí nút Export
- Nằm trong **header** của trang "Quản lý yêu cầu CTSV"
- Cạnh tiêu đề "Quản lý yêu cầu chứng nhận"

### 1.2. Các cột dữ liệu xuất ra

| STT | Tên cột | Mô tả |
|-----|---------|-------|
| 1 | Mã yêu cầu | Mã định danh yêu cầu (VD: CERT-001) |
| 2 | MSSV | Mã số sinh viên |
| 3 | Họ tên sinh viên | Tên đầy đủ |
| 4 | Email | Email sinh viên |
| 5 | Số điện thoại | SĐT liên hệ |
| 6 | Khoa | Khoa của sinh viên |
| 7 | Ngành | Chuyên ngành |
| 8 | Loại giấy chứng nhận | Loại chứng nhận yêu cầu |
| 9 | Tên chứng nhận | Tên cụ thể của chứng nhận |
| 10 | Ghi chú | Ghi chú từ sinh viên |
| 11 | Trạng thái | Đang xử lý / Đã duyệt / Từ chối |
| 12 | Ngày gửi yêu cầu | Ngày sinh viên gửi |
| 13 | Ngày xử lý | Ngày staff xử lý |
| 14 | Ngày tạo | Timestamp tạo record |
| 15 | Ngày cập nhật | Timestamp cập nhật cuối |

### 1.3. Bộ lọc hỗ trợ

| Bộ lọc | Mô tả |
|--------|-------|
| Trạng thái | Tất cả / Đang xử lý / Đã duyệt / Từ chối |
| Học kỳ | Chọn học kỳ cụ thể |
| Ngày | Lọc theo khoảng thời gian |

### 1.4. API Endpoint
```
GET /api/certificate-requests/export-csv
Query params: status, semester, startDate, endDate
```

### 1.5. Tên file xuất ra
- Format: `DS_YeuCau_CTSV_DD-MM-YYYY.csv`
- Ví dụ: `DS_YeuCau_CTSV_07-01-2026.csv`

---

## 2. Staff KTX - Xuất Yêu Cầu Sửa Chữa

### 2.1. Vị trí nút Export
- Nằm trong **header** của trang "Quản lý yêu cầu sửa chữa KTX"
- Cạnh tiêu đề, căn sang góc phải

### 2.2. Các cột dữ liệu xuất ra

| STT | Tên cột | Mô tả |
|-----|---------|-------|
| 1 | Mã yêu cầu | Mã định danh (VD: KTX-001) |
| 2 | MSSV | Mã số sinh viên |
| 3 | Họ tên sinh viên | Tên đầy đủ |
| 4 | Email | Email sinh viên |
| 5 | Số điện thoại | SĐT liên hệ |
| 6 | Phòng | Số phòng KTX (VD: H01, H02) |
| 7 | Danh mục thiết bị | Loại thiết bị (Điện, Nước...) |
| 8 | Thiết bị cụ thể | Tên thiết bị hỏng |
| 9 | Mô tả sự cố | Chi tiết sự cố |
| 10 | Trạng thái | Chờ tiếp nhận / Đang xử lý / Đã hoàn thành |
| 11 | Học kỳ | Học kỳ gửi yêu cầu |
| 12 | Ngày gửi yêu cầu | Ngày sinh viên gửi |
| 13 | Ngày xác nhận | Ngày staff xác nhận |
| 14 | Ngày tạo | Timestamp tạo record |
| 15 | Ngày cập nhật | Timestamp cập nhật cuối |

### 2.3. Bộ lọc hỗ trợ

| Bộ lọc | Mô tả |
|--------|-------|
| Trạng thái | Tất cả / Chờ tiếp nhận / Đang xử lý / Đã hoàn thành |
| Học kỳ | Chọn học kỳ cụ thể |
| Phòng | Lọc theo phòng KTX |
| Ngày | Lọc theo khoảng thời gian |

### 2.4. API Endpoint
```
GET /api/dormitory/requests/export-csv
Query params: status, semester, roomId, startDate
```

### 2.5. Tên file xuất ra
- Format: `DS_SuCo_KTX_DD-MM-YYYY.csv`
- Ví dụ: `DS_SuCo_KTX_07-01-2026.csv`

---

## 3. Admin - Xuất Danh Sách Sinh Viên (Tab "Tất cả sinh viên")

### 3.1. Vị trí nút Export
- Nằm **sau bộ lọc "Tất cả (KTX)"** trong vùng filter
- Hiển thị dạng icon-only với tooltip

### 3.2. Các cột dữ liệu xuất ra

| STT | Tên cột | Mô tả |
|-----|---------|-------|
| 1 | MSSV | Mã số sinh viên |
| 2 | Họ và tên | Tên đầy đủ |
| 3 | Email | Email sinh viên |
| 4 | Số điện thoại | SĐT liên hệ |
| 5 | CCCD/CMND | Số căn cước |
| 6 | Ngày sinh | Ngày tháng năm sinh |
| 7 | Địa chỉ | Địa chỉ thường trú |
| 8 | Khoa | Khoa của sinh viên |
| 9 | Chuyên ngành | Ngành học |
| 10 | Ở KTX | Có / Không |
| 11 | Ngày tạo | Timestamp tạo tài khoản |

> **Lưu ý:** Tab này **KHÔNG** có cột "Phòng KTX" vì bao gồm cả sinh viên không ở KTX.

### 3.3. Bộ lọc hỗ trợ

| Bộ lọc | Mô tả |
|--------|-------|
| Khoa | Lọc theo khoa (VD: Khoa CNTT) |
| Chuyên ngành | Lọc theo ngành học |
| Tình trạng KTX | Tất cả / Có ở KTX / Không ở KTX |

### 3.4. API Endpoint
```
GET /api/students/export-csv
Query params: faculty, major, isDormResident (không truyền hoặc truyền 'all')
```

### 3.5. Tên file xuất ra
- Format: `DS_SinhVien_DD-MM-YYYY.csv`
- Ví dụ: `DS_SinhVien_07-01-2026.csv`

---

## 4. Admin - Xuất Danh Sách Sinh Viên KTX (Tab "Sinh viên ở KTX")

### 4.1. Vị trí nút Export
- Nằm **sau bộ lọc "Tất cả phòng"** trong vùng filter
- Hiển thị dạng icon-only với tooltip

### 4.2. Các cột dữ liệu xuất ra

| STT | Tên cột | Mô tả |
|-----|---------|-------|
| 1 | MSSV | Mã số sinh viên |
| 2 | Họ và tên | Tên đầy đủ |
| 3 | Email | Email sinh viên |
| 4 | Số điện thoại | SĐT liên hệ |
| 5 | CCCD/CMND | Số căn cước |
| 6 | Ngày sinh | Ngày tháng năm sinh |
| 7 | Địa chỉ | Địa chỉ thường trú |
| 8 | Khoa | Khoa của sinh viên |
| 9 | Chuyên ngành | Ngành học |
| 10 | Ở KTX | Luôn là "Có" |
| 11 | **Phòng KTX** | Số phòng (VD: H01, H02) |
| 12 | Ngày tạo | Timestamp tạo tài khoản |

> **Lưu ý:** Tab này **CÓ** thêm cột "Phòng KTX" vì chỉ chứa sinh viên đang ở KTX.

### 4.3. Bộ lọc hỗ trợ

| Bộ lọc | Mô tả |
|--------|-------|
| Phòng | Tất cả phòng / Phòng cụ thể (H01, H02...) |

### 4.4. API Endpoint
```
GET /api/students/export-csv
Query params: isDormResident=true, roomId (optional)
```

### 4.5. Tên file xuất ra
- Format: `DS_SinhVien_KTX_DD-MM-YYYY.csv`
- Ví dụ: `DS_SinhVien_KTX_07-01-2026.csv`

---

## Kiến trúc kỹ thuật

### Flow hoạt động

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Routes    │────▶│ Controller  │────▶│   Service   │
│ (Button +   │     │  (API URL)  │     │ (Map data   │     │ (Query DB)  │
│  Filters)   │     │             │     │  to CSV)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ csvExporter │
                                        │  (Utility)  │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  CSV File   │
                                        │  (Download) │
                                        └─────────────┘
```

### Các file liên quan

**Backend:**
- `backend/src/utils/csvExporter.js` - Utility chuyển đổi JSON → CSV
- `backend/src/controllers/dormitoryController.js` - Handler export KTX
- `backend/src/controllers/certificateRequestController.js` - Handler export CTSV
- `backend/src/controllers/studentController.js` - Handler export sinh viên
- `backend/src/routes/dormitoryRoutes.js` - Route `/export-csv` cho KTX
- `backend/src/routes/certificateRequestRoutes.js` - Route `/export-csv` cho CTSV
- `backend/src/routes/studentRoutes.js` - Route `/export-csv` cho sinh viên

**Frontend:**
- `frontend/src/components/common/ExportCSVButton/` - Component nút export
- `frontend/src/services/dormitoryRequest.js` - Service gọi API export KTX
- `frontend/src/services/certificateRequest.js` - Service gọi API export CTSV
- `frontend/src/services/student.js` - Service gọi API export sinh viên

### csvExporter Utility

File `csvExporter.js` cung cấp các hàm tiện ích:

```javascript
// Các hàm chính
formatDateVN(date)           // Format: DD/MM/YYYY HH:mm
formatDateOnlyVN(date)       // Format: DD/MM/YYYY
generateCSVFilename(prefix)  // Tạo tên file với timestamp
jsonToCSV(data, fields)      // Chuyển JSON array → CSV string

// Cấu hình fields cho từng loại
dormitoryRequestCSVFields    // Fields cho yêu cầu KTX
certificateRequestCSVFields  // Fields cho yêu cầu CTSV
studentCSVFields             // Fields cho sinh viên (không có phòng)
studentDormCSVFields         // Fields cho sinh viên KTX (có phòng)

// Map trạng thái
mapDormitoryStatus(status)   // Pending → Chờ tiếp nhận
mapCertificateStatus(status) // ĐANG XỬ LÝ → Đang xử lý
```

---

## Xử lý UTF-8 và Excel

File CSV xuất ra sử dụng **BOM (Byte Order Mark)** để Microsoft Excel nhận diện đúng encoding UTF-8:

```javascript
const parser = new Parser({ 
  fields, 
  withBOM: true,  // Thêm BOM cho Excel
  delimiter: ','
});
```

Điều này đảm bảo tiếng Việt hiển thị đúng khi mở file CSV bằng Excel.

---

## Ví dụ sử dụng ExportCSVButton

```jsx
import ExportCSVButton from '../../common/ExportCSVButton';
import studentService from '../../../services/student';

// Trong component
<ExportCSVButton 
  exportFunction={studentService.exportCSV}
  filename="DS_SinhVien.csv"
  title="Xuất danh sách sinh viên"
  filters={{
    faculty: filterFaculty,
    major: filterMajor,
    isDormResident: filterDormStatus
  }}
  variant="icon-only"
/>
```

### Props của ExportCSVButton

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| exportFunction | Function | required | Hàm gọi API (trả về Blob) |
| filename | string | 'export.csv' | Tên file mặc định |
| label | string | 'Xuất CSV' | Text hiển thị trên nút |
| title | string | '' | Tooltip khi hover |
| variant | string | 'default' | 'default' / 'icon-only' / 'outline' / 'small' |
| filters | object | {} | Object chứa các filter truyền cho API |
| disabled | boolean | false | Disable nút |
| className | string | '' | Class CSS bổ sung |
