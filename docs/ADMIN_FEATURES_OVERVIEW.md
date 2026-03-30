# 👨‍💼 Tổng quan Chức năng ADMIN - UniHelper

## 📖 Giới thiệu

Tài liệu này trình bày chi tiết các chức năng quản trị dành cho Admin trong hệ thống UniHelper. Admin có quyền quản lý toàn bộ dữ liệu hệ thống với các tính năng nâng cao giúp **tiết kiệm thời gian** và **đảm bảo tính toàn vẹn dữ liệu**.

---

## 🎯 Tổng quan Chức năng Admin

| Module | Mô tả | Highlight |
|--------|-------|-----------|
| **Quản lý Sinh viên** | CRUD sinh viên, import CSV | Import hàng loạt, xóa hàng loạt, chuyển phòng |
| **Quản lý Phòng KTX** | CRUD phòng, sức chứa | Ràng buộc xóa với sinh viên |
| **Quản lý Khoa/Ngành** | CRUD khoa, ngành | Ràng buộc cascade |
| **Quản lý Chứng nhận** | Loại & tên chứng nhận | Ràng buộc với yêu cầu |
| **Quản lý Thiết bị KTX** | Danh mục & thiết bị | Ràng buộc với báo cáo |
| **Quản lý Học kỳ** | Học kỳ, năm học | Ràng buộc với yêu cầu |
| **Báo cáo & Thống kê** | Dashboard tổng quan | Biểu đồ, xuất CSV |

---

## 📋 CHI TIẾT TỪNG CHỨC NĂNG

---

## 1. 👨‍🎓 QUẢN LÝ SINH VIÊN

### 1.1 Danh sách Sinh viên
**Vị trí:** `components/admin/student-management/StudentManagement.jsx`

| Chức năng | Mô tả |
|-----------|-------|
| Hiển thị danh sách | Bảng với phân trang |
| Tìm kiếm | Theo tên, email, MSSV |
| Lọc theo Khoa | Dropdown danh sách khoa |
| Lọc theo Ngành | Dynamic theo khoa đã chọn |
| Lọc KTX | Tất cả / Ở KTX / Không ở KTX |
| **✅ Chọn nhiều** | Checkbox để xóa/chuyển phòng hàng loạt |

---

### 1.2 📥 Import Sinh viên từ CSV (Tính năng nổi bật)
**Vị trí:** `components/admin/student-management/StudentImportPage.jsx`

#### 🔄 Quy trình 4 bước:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   STEP 1    │ => │   STEP 2    │ => │   STEP 3    │ => │   STEP 4    │
│   Setup     │    │ Validation  │    │ Processing  │    │   Report    │
│ Chọn file   │    │ Kiểm tra    │    │   Import    │    │  Kết quả    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **STEP 1: Setup**
| Tính năng | Mô tả |
|-----------|-------|
| Chọn Khoa | Dropdown danh sách khoa |
| Chọn Ngành | Dynamic theo khoa |
| Upload CSV | Drag & Drop hoặc click chọn |
| Template | Cung cấp file CSV mẫu |

#### **STEP 2: Validation (⭐ Điểm nổi bật)**

Backend thực hiện **4 lớp validation** với báo lỗi chi tiết:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    4 LỚP VALIDATION                                 │
├─────────────────────────────────────────────────────────────────────┤
│ LỚP 1: Format Validation                                            │
│   ✓ Họ tên: Không được rỗng                                        │
│   ✓ Email: Định dạng email hợp lệ                                  │
│   ✓ SĐT: 10-11 số                                                  │
│   ✓ CCCD: 12 số                                                    │
│   ✓ Ngày sinh: Định dạng dd/mm/yyyy                                │
├─────────────────────────────────────────────────────────────────────┤
│ LỚP 2: Internal Duplication (Trùng trong file)                      │
│   ✓ Email trùng với dòng X                                         │
│   ✓ SĐT trùng với dòng X                                           │
│   ✓ CCCD trùng với dòng X                                          │
├─────────────────────────────────────────────────────────────────────┤
│ LỚP 3: Database Uniqueness (Trùng với DB)                           │
│   ✓ Email đã tồn tại trong hệ thống                                │
│   ✓ SĐT đã tồn tại trong hệ thống                                  │
│   ✓ CCCD đã tồn tại trong hệ thống                                 │
├─────────────────────────────────────────────────────────────────────┤
│ LỚP 4: Dormitory Validation (KTX)                                   │
│   ✓ Phòng [X] không tồn tại                                        │
│   ✓ Phòng [X] đang bảo trì                                         │
│   ✓ Phòng [X] đã đủ người (capacity)                               │
│   ✓ Phòng [X] sẽ vượt sức chứa sau import                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Giao diện Validation:**

| Thành phần | Mô tả |
|------------|-------|
| **Thống kê tổng quan** | Số hợp lệ / Trùng lặp / Lỗi |
| **Bộ lọc trạng thái** | Tất cả / Hợp lệ / Trùng lặp / Lỗi |
| **Bảng chi tiết** | Hiển thị từng dòng với status |
| **Cột Chi tiết lỗi** | Mô tả cụ thể lỗi ở đâu |
| **Badge màu** | 🟢 Hợp lệ / 🟡 Trùng lặp / 🔴 Lỗi |

**Ví dụ báo lỗi chi tiết:**

| Dòng | Họ tên | Email | Trạng thái | Chi tiết |
|------|--------|-------|------------|----------|
| 5 | Nguyễn Văn A | a@gmail.com | 🔴 Lỗi | CCCD phải có 12 số |
| 8 | Trần Thị B | b@gmail.com | 🟡 Trùng | Email trùng với dòng 3 |
| 12 | Lê Văn C | c@gmail.com | 🟡 Trùng | SĐT đã tồn tại trong hệ thống |
| 15 | Phạm Thị D | d@gmail.com | 🔴 Lỗi | Phòng A101 đã đủ người |

#### **STEP 3: Processing**
| Tính năng | Mô tả |
|-----------|-------|
| Progress bar | Hiển thị % hoàn thành |
| Batch processing | Xử lý theo batch để tối ưu |
| Real-time message | Thông báo tiến độ |

#### **STEP 4: Report**
| Thông tin | Mô tả |
|-----------|-------|
| Tổng số dòng | Số dòng trong file CSV |
| Thành công | Số sinh viên đã import |
| Thất bại | Số dòng lỗi khi insert |
| Bỏ qua | Số dòng trùng/lỗi format |
| Chi tiết lỗi | Danh sách lỗi cụ thể |

---

### 1.3 🗑️ Xóa hàng loạt Sinh viên (Bulk Delete)
**Vị trí:** `components/admin/student-management/StudentManagement.jsx`

#### Quy trình xóa an toàn:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Chọn SV     │ => │   Preview    │ => │   Confirm    │ => │   Execute    │
│  (checkbox)  │    │ (API check)  │    │  (warning)   │    │   (delete)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Modal xác nhận xóa hiển thị:**

| Thông tin | Mô tả |
|-----------|-------|
| **Số SV được chọn** | "Bạn đã chọn **5** sinh viên" |
| **Cảnh báo KTX** | "(trong đó có **2** sinh viên đang ở KTX)" |
| **Dữ liệu liên quan** | Liệt kê sẽ xóa những gì |

**Dữ liệu liên quan được xóa kèm:**

```
📋 Xác nhận xóa 5 sinh viên
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Các dữ liệu liên quan sẽ bị XÓA VĨNH VIỄN:

   ✓ Xóa 12 yêu cầu CTSV
   ✓ Xóa 8 yêu cầu KTX  
   ✓ Xóa 25 thông báo
   ✓ Giải phóng 2 slot phòng KTX

   ⚠️ Hành động này KHÔNG THỂ hoàn tác!
```

---

### 1.4 🔄 Chuyển phòng hàng loạt (Bulk Transfer)
**Vị trí:** `components/common/RoomTransferDialog/`

#### Quy trình chuyển phòng:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Chọn SV     │ => │  Mở Dialog   │ => │ Chọn phòng   │ => │  Chuyển      │
│  (checkbox)  │    │  Transfer    │    │    mới       │    │   phòng      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Dialog chuyển phòng:**

| Tính năng | Mô tả |
|-----------|-------|
| Hiển thị SV được chọn | Danh sách tên + phòng hiện tại |
| Chọn phòng đích | Dropdown với thông tin sức chứa |
| **Kiểm tra capacity** | Cảnh báo nếu vượt sức chứa |
| **Hiển thị slot còn** | "Còn trống: 3/8 slot" |
| **Validation** | Không cho chọn phòng đang bảo trì |

---

## 2. 🏠 QUẢN LÝ PHÒNG KTX

**Vị trí:** `components/admin/room-management/`

### Chức năng CRUD:

| Chức năng | Mô tả |
|-----------|-------|
| Thêm phòng | Form với tên, tầng, sức chứa |
| Sửa phòng | Edit inline hoặc modal |
| **🔒 Xóa phòng** | Chặn xóa nếu còn sinh viên |

### Ràng buộc xóa:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Không thể xóa phòng A101                                 │
│                                                             │
│ Lý do: Phòng này đang có 4 sinh viên đang ở.               │
│                                                             │
│ 💡 Gợi ý: Vui lòng chuyển sinh viên sang phòng khác        │
│           trước khi xóa phòng này.                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 🏫 QUẢN LÝ KHOA & NGÀNH

**Vị trí:** `components/admin/faculty-major-management/`

### Chức năng:

| Đối tượng | CRUD | Ràng buộc |
|-----------|------|-----------|
| **Khoa** | ✅ | Không xóa nếu có ngành |
| **Ngành** | ✅ | Không xóa nếu có sinh viên |

### Ràng buộc xóa Khoa:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Không thể xóa khoa "Công nghệ thông tin"                 │
│                                                             │
│ Lý do: Khoa này đang có:                                   │
│   • 5 ngành học                                            │
│   • 1,234 sinh viên                                        │
│                                                             │
│ 💡 Gợi ý: Xóa hoặc chuyển các ngành trước khi xóa khoa.    │
└─────────────────────────────────────────────────────────────┘
```

### Ràng buộc xóa Ngành:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Không thể xóa ngành "Kỹ thuật phần mềm"                  │
│                                                             │
│ Lý do: Ngành này đang có 256 sinh viên.                    │
│                                                             │
│ 💡 Gợi ý: Chuyển sinh viên sang ngành khác trước khi xóa.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 📜 QUẢN LÝ CHỨNG NHẬN (CTSV)

**Vị trí:** `components/admin/certificate-management/`

### Cấu trúc 2 cấp:

```
Loại chứng nhận (CertificateType)
├── Bổ sung hồ sơ cá nhân
│   ├── Giấy bổ sung hồ sơ cá nhân
│   └── Giấy xác nhận sinh viên
├── Nghĩa vụ quân sự
│   ├── Tạm hoãn nghĩa vụ quân sự
│   └── Miễn nghĩa vụ quân sự
└── Thẻ sinh viên
    ├── Đăng ký thẻ mới
    └── Cấp lại thẻ
```

### Ràng buộc xóa:

| Đối tượng | Ràng buộc | Thông báo |
|-----------|-----------|-----------|
| **Loại chứng nhận** | Không xóa nếu có tên chứng nhận | "Có X tên chứng nhận thuộc loại này" |
| **Tên chứng nhận** | Không xóa nếu có yêu cầu | "Có X yêu cầu sử dụng chứng nhận này" |

---

## 5. 🔧 QUẢN LÝ THIẾT BỊ KTX

**Vị trí:** `components/admin/dormitory-request-management/`

### Cấu trúc 2 cấp:

```
Danh mục thiết bị (EquipmentCategory)
├── Thiết bị điện
│   ├── Máy lạnh
│   ├── Quạt trần
│   └── Đèn
├── Thiết bị nước
│   ├── Vòi sen
│   └── Lavabo
└── Nội thất
    ├── Giường
    ├── Tủ quần áo
    └── Bàn học
```

### Ràng buộc xóa:

| Đối tượng | Ràng buộc | Thông báo |
|-----------|-----------|-----------|
| **Danh mục** | Không xóa nếu có thiết bị | "Có X thiết bị thuộc danh mục này" |
| **Thiết bị** | Không xóa nếu có báo cáo | "Có X báo cáo sự cố về thiết bị này" |

---

## 6. 📅 QUẢN LÝ HỌC KỲ

**Vị trí:** `components/admin/semester-management/`

### Chức năng:

| Tính năng | Mô tả |
|-----------|-------|
| Thêm học kỳ | HK1/HK2/Hè, năm học, ngày bắt đầu/kết thúc |
| Đặt Active | Chỉ 1 HK active tại 1 thời điểm |
| **🔒 Xóa học kỳ** | Chặn nếu có yêu cầu |

### Ràng buộc xóa:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Không thể xóa học kỳ "HK1 (2025-2026)"                   │
│                                                             │
│ Lý do: Học kỳ này có dữ liệu liên quan:                    │
│   • 156 yêu cầu CTSV                                       │
│   • 89 yêu cầu KTX                                         │
│                                                             │
│ 💡 Gợi ý: Không thể xóa học kỳ đã có yêu cầu.              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 📊 BÁO CÁO & THỐNG KÊ

**Vị trí:** `components/admin/reports/`

### Dashboard Admin:

| Thống kê | Mô tả |
|----------|-------|
| Tổng sinh viên | Số lượng theo khoa/ngành |
| Sinh viên KTX | Tỷ lệ ở KTX |
| Yêu cầu CTSV | Theo trạng thái, thời gian |
| Yêu cầu KTX | Theo danh mục, trạng thái |

### Biểu đồ:

| Loại | Mô tả |
|------|-------|
| **Line Chart** | Xu hướng yêu cầu theo thời gian |
| **Bar Chart** | So sánh giữa các khoa/ngành |
| **Pie Chart** | Phân bố trạng thái |

### Xuất dữ liệu:

| Tính năng | Mô tả |
|-----------|-------|
| **Export CSV** | Xuất danh sách sinh viên |
| **Export Report** | Xuất báo cáo thống kê |

---

## 🔐 HỆ THỐNG RÀNG BUỘC DỮ LIỆU (Data Integrity)

### Tổng quan các ràng buộc:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SƠ ĐỒ RÀNG BUỘC DỮ LIỆU                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Khoa ──┬──> Ngành ──┬──> Sinh viên ──┬──> Yêu cầu CTSV            │
│         │           │                │                              │
│         │           │                ├──> Yêu cầu KTX               │
│         │           │                │                              │
│         │           │                └──> Thông báo                 │
│         │           │                                               │
│  Phòng ─┴───────────┴────────────────┘                              │
│                                                                     │
│  Loại CN ──> Tên CN ──> Yêu cầu CTSV                                │
│                                                                     │
│  Danh mục TB ──> Thiết bị ──> Yêu cầu KTX                           │
│                                                                     │
│  Học kỳ ──┬──> Yêu cầu CTSV                                         │
│           └──> Yêu cầu KTX                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Quy tắc: KHÔNG THỂ XÓA đối tượng cha nếu còn đối tượng con
```

### API Check Delete Pattern:

```javascript
// Mỗi module đều có API kiểm tra trước khi xóa:
GET /api/faculties/:id/check-delete
GET /api/majors/:id/check-delete
GET /api/rooms/:id/check-delete
GET /api/certificate-types/:id/check-delete
GET /api/certificates/:id/check-delete
GET /api/equipment-categories/:id/check-delete
GET /api/equipment/:id/check-delete
GET /api/semesters/:id/check-delete
```

### Response format:

```json
// Có thể xóa
{
  "success": true,
  "canDelete": true,
  "message": "Có thể xóa khoa này"
}

// Không thể xóa
{
  "success": true,
  "canDelete": false,
  "message": "Không thể xóa vì có 5 ngành và 1234 sinh viên",
  "details": {
    "majorCount": 5,
    "studentCount": 1234
  }
}
```

---

## ⏱️ CÁCH HỆ THỐNG GIÚP TIẾT KIỆM THỜI GIAN

### 1. Import CSV hàng loạt

| Cách truyền thống | Với UniHelper |
|-------------------|---------------|
| Nhập từng SV một | Import 100+ SV/lần |
| ~2 phút/SV | ~30 giây/100 SV |
| Dễ sai sót | Auto validation |
| Không biết lỗi ở đâu | Báo lỗi chi tiết từng dòng |

**Tiết kiệm: ~95% thời gian**

### 2. Xóa hàng loạt

| Cách truyền thống | Với UniHelper |
|-------------------|---------------|
| Xóa từng SV | Chọn nhiều + xóa 1 lần |
| Xác nhận nhiều lần | 1 lần xác nhận |
| Không biết dữ liệu liên quan | Preview đầy đủ |

**Tiết kiệm: ~80% thời gian**

### 3. Chuyển phòng hàng loạt

| Cách truyền thống | Với UniHelper |
|-------------------|---------------|
| Sửa từng SV | Chọn nhiều + chuyển 1 lần |
| Kiểm tra slot thủ công | Auto check capacity |
| 5 phút/SV | 30 giây/10 SV |

**Tiết kiệm: ~90% thời gian**

### 4. Ràng buộc dữ liệu

| Cách truyền thống | Với UniHelper |
|-------------------|---------------|
| Xóa nhầm → mất dữ liệu | Chặn xóa + cảnh báo |
| Dữ liệu orphan | Đảm bảo integrity |
| Debug khó khăn | Thông báo rõ nguyên nhân |

**Tiết kiệm: Tránh mất dữ liệu + debug time**

---

## 📝 KẾT LUẬN

Hệ thống Admin của UniHelper được thiết kế với các nguyên tắc:

1. **✅ Batch Operations** - Xử lý hàng loạt để tiết kiệm thời gian
2. **✅ Smart Validation** - Kiểm tra đa lớp với báo lỗi chi tiết
3. **✅ Data Integrity** - Ràng buộc chặt chẽ, chặn xóa cascade
4. **✅ User-Friendly** - Giao diện trực quan, thông báo rõ ràng
5. **✅ Safe Operations** - Xác nhận trước actions quan trọng

Các tính năng này giúp Admin quản lý dữ liệu hiệu quả, tiết kiệm thời gian và tránh sai sót.

---

**Ngày tạo:** 30/01/2026  
**Phiên bản:** 1.0
