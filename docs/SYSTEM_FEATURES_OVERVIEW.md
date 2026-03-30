# 📋 Tổng quan Chức năng Hệ thống UniHelper

## 📖 Giới thiệu

UniHelper là hệ thống hỗ trợ sinh viên được thiết kế với mục tiêu nâng cao trải nghiệm người dùng và hiệu quả quản lý công việc. Tài liệu này trình bày chi tiết các chức năng nổi bật của hệ thống theo từng vai trò người dùng.

---

## 🎯 Đánh giá tổng quan

### ✅ Điểm mạnh của hệ thống

| Tiêu chí | Đánh giá | Mô tả |
|----------|----------|-------|
| **Trải nghiệm người dùng (UX)** | ⭐⭐⭐⭐⭐ | Giao diện trực quan, thao tác đơn giản |
| **Thời gian thực (Realtime)** | ⭐⭐⭐⭐⭐ | Socket.IO cho cập nhật tức thì |
| **Thông báo đa kênh** | ⭐⭐⭐⭐⭐ | In-app + Email notification |
| **Hỗ trợ thông minh** | ⭐⭐⭐⭐⭐ | Chatbot tích hợp Dialogflow AI |
| **Quản lý công việc** | ⭐⭐⭐⭐⭐ | Lịch sử hoạt động, bộ lọc thông minh |
| **Bảo mật** | ⭐⭐⭐⭐ | JWT authentication, role-based access |

### 🏆 Những điểm làm hệ thống trở nên tiêu chuẩn

1. **Kiến trúc phân lớp rõ ràng** (Controller → Service → Repository → Model)
2. **Realtime communication** với Socket.IO
3. **AI-powered chatbot** với Dialogflow NLP
4. **Multi-channel notifications** (In-app + Email)
5. **File preview** tránh download không cần thiết
6. **Smart filters** với context thời gian học kỳ
7. **Activity logging** cho staff quản lý công việc

---

## 👨‍🎓 CHỨC NĂNG DÀNH CHO SINH VIÊN

### 1. 📊 Dashboard Sinh viên
**Vị trí:** `components/student/dashboard/`

| Chức năng | Mô tả |
|-----------|-------|
| Tổng quan yêu cầu CTSV | Hiển thị số lượng yêu cầu theo trạng thái |
| Tổng quan yêu cầu KTX | Thống kê sự cố KTX đang xử lý |
| Thông tin cá nhân | Hiển thị thông tin sinh viên, phòng KTX |
| Quick actions | Truy cập nhanh các chức năng chính |

---

### 2. 📝 Gửi yêu cầu CTSV (Công tác Sinh viên)
**Vị trí:** `components/student/student-affairs/`

| Chức năng | Mô tả |
|-----------|-------|
| Chọn loại chứng nhận | Dropdown phân loại (Bổ sung hồ sơ, Nghĩa vụ quân sự, Thẻ sinh viên...) |
| Chọn tên chứng nhận | Dynamic options dựa trên loại đã chọn |
| Tự động lấy học kỳ | Học kỳ hiện tại được chọn mặc định |
| Ghi chú/Lưu ý | Text area cho sinh viên ghi chú thêm |
| Realtime feedback | Cập nhật ngay khi Staff xử lý |

---

### 3. 🏠 Báo cáo sự cố KTX (Ký túc xá)
**Vị trí:** `components/student/dormitory/`

| Chức năng | Mô tả |
|-----------|-------|
| Chọn danh mục thiết bị | Thiết bị điện, nước, nội thất, giàn phơi... |
| Chọn thiết bị cụ thể | Dynamic options theo danh mục |
| Mô tả sự cố | Chi tiết vấn đề cần sửa chữa |
| Hiển thị thông tin phòng | Tự động lấy từ thông tin sinh viên |
| Xác nhận hoàn thành | Sinh viên xác nhận sau khi sửa chữa xong |

---

### 4. 📜 Lịch sử yêu cầu CTSV
**Vị trí:** `components/student/history-affair/`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách yêu cầu | Hiển thị tất cả yêu cầu đã gửi |
| Bộ lọc học kỳ | Lọc theo học kỳ cụ thể |
| Bộ lọc trạng thái | Đang xử lý / Hợp lệ / Không hợp lệ |
| Sắp xếp | Mới nhất / Cũ nhất |
| **🔍 Xem trước file phản hồi** | Preview file từ Staff mà không cần download |
| **⚡ Realtime updates** | Tự động cập nhật khi Staff duyệt/từ chối |

---

### 5. 🔧 Lịch sử yêu cầu KTX
**Vị trí:** `components/student/history-dormitory/`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách sự cố | Hiển thị các yêu cầu sửa chữa |
| Trạng thái rõ ràng | Chờ tiếp nhận → Đang xử lý → (Hoàn thành ẩn đi) |
| Xác nhận sửa chữa | Button để sinh viên xác nhận hoàn thành |
| **🔄 Realtime updates** | Cập nhật tức thì khi Staff xử lý |
| Yêu cầu cùng phòng | Hiển thị yêu cầu của tất cả bạn cùng phòng |

---

### 6. 🤖 Chatbot Hỗ trợ Thông minh
**Vị trí:** `components/common/Chatbot/`

| Chức năng | Mô tả |
|-----------|-------|
| **🧠 Dialogflow AI** | Xử lý ngôn ngữ tự nhiên tiếng Việt |
| Quick Replies | Gợi ý câu hỏi phổ biến |
| Trả lời tự động | FAQ về quy trình, thủ tục |
| **📊 Tra cứu yêu cầu** | Kiểm tra trạng thái yêu cầu qua chat |
| **📝 Tạo yêu cầu qua chat** | Gửi yêu cầu CTSV/KTX trực tiếp từ chatbot |
| Typing indicator | Hiệu ứng đang gõ tự nhiên |
| Status cards | Hiển thị thông tin dạng card đẹp mắt |

**Các tính năng nổi bật của Chatbot:**
- Hỗ trợ ngữ cảnh hội thoại (context-aware)
- Trả lời câu hỏi về quy trình, thủ tục
- Hướng dẫn sử dụng hệ thống
- Tra cứu trạng thái yêu cầu realtime
- Tạo yêu cầu mới qua giao diện chat

---

### 7. 🔔 Thông báo In-app
**Vị trí:** `components/common/NotificationDropdown/`

| Chức năng | Mô tả |
|-----------|-------|
| Bell icon với badge | Hiển thị số thông báo chưa đọc |
| Dropdown list | Danh sách thông báo mới nhất |
| Mark as read | Đánh dấu đã đọc |
| **⚡ Realtime** | Nhận thông báo tức thì khi có cập nhật |
| Click to navigate | Click vào thông báo để đi đến yêu cầu |

---

### 8. 📁 Xem trước File (File Preview)
**Vị trí:** `components/common/FilePreview/`

| Loại file | Hỗ trợ |
|-----------|--------|
| **PDF** | ✅ Xem trực tiếp trong modal |
| **Hình ảnh** | ✅ JPG, PNG, GIF, WEBP |
| **Word** | ✅ DOCX (Google Docs Viewer) |
| **Excel** | ✅ XLSX (Google Docs Viewer) |
| Download option | Vẫn có thể tải về nếu cần |

**Lợi ích:**
- Tiết kiệm thời gian
- Không cần phần mềm bên ngoài
- Xem nhanh file phản hồi từ Staff

---

## 👨‍💼 CHỨC NĂNG DÀNH CHO STAFF

### 1. 📊 Dashboard Staff
**Vị trí:** `components/staff/dashboard/`

| Chức năng | Mô tả |
|-----------|-------|
| Thống kê tổng quan | Số yêu cầu chờ xử lý, đã xử lý |
| Biểu đồ trực quan | Charts thể hiện xu hướng |
| Quick stats | Metrics quan trọng nhất |
| **⚡ Realtime updates** | Số liệu cập nhật tức thì |

---

### 2. 📋 Quản lý Yêu cầu CTSV
**Vị trí:** `components/staff/cts/`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách yêu cầu | Hiển thị tất cả yêu cầu từ sinh viên |
| Chi tiết yêu cầu | Modal hiển thị đầy đủ thông tin |
| **✅ Duyệt yêu cầu** | Approve với file phản hồi |
| **❌ Từ chối yêu cầu** | Reject với lý do |
| **📎 Upload file phản hồi** | Đính kèm giấy tờ cho sinh viên |
| **🔍 Xem trước file** | Preview file sinh viên đính kèm |
| **📧 Gửi thông báo** | Tự động gửi In-app + Email |

---

### 3. 🔧 Quản lý Yêu cầu KTX
**Vị trí:** `components/staff/ttx/`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách sự cố | Hiển thị báo cáo từ sinh viên |
| Tiếp nhận yêu cầu | Chuyển trạng thái sang "Đang xử lý" |
| Hoàn thành sửa chữa | Chờ sinh viên xác nhận |
| **📧 Gửi thông báo** | Tự động thông báo cho sinh viên |

---

### 4. 📜 Lịch sử Hoạt động (Activity Log)
**Vị trí:** `components/staff/history/`

| Chức năng | Mô tả |
|-----------|-------|
| **📝 Log tất cả actions** | Ghi lại mọi thao tác của Staff |
| Timeline view | Hiển thị theo dòng thời gian |
| **🔍 Bộ lọc** | Lọc theo ngày, loại action, đối tượng |
| Chi tiết action | Xem chi tiết từng hoạt động |
| **📊 Audit trail** | Phục vụ kiểm tra, đánh giá |

**Các loại hoạt động được ghi lại:**
- Duyệt/Từ chối yêu cầu CTSV
- Tiếp nhận/Hoàn thành yêu cầu KTX
- Upload file phản hồi
- Gửi thông báo cho sinh viên

---

### 5. 🎯 Bộ lọc Học kỳ Thông minh (Semester Filter)
**Vị trí:** `components/common/SemesterFilter/`

| Chức năng | Mô tả |
|-----------|-------|
| Dropdown học kỳ | Chọn học kỳ cần xem |
| **📅 Hiển thị thời gian** | Ngày bắt đầu - Ngày kết thúc của HK |
| **📊 Progress indicator** | Hiển thị tiến độ thời gian học kỳ |
| Visual timeline | Trực quan hóa vị trí thời gian hiện tại |
| Multi-semester support | Hỗ trợ nhiều năm học |

**Lợi ích:**
- Biết rõ đang ở giai đoạn nào của học kỳ
- Khoanh vùng thời gian chính xác
- Hỗ trợ ra quyết định tốt hơn

---

### 6. 📊 Báo cáo & Thống kê
**Vị trí:** `components/staff/reports/`

| Chức năng | Mô tả |
|-----------|-------|
| Báo cáo CTSV | Thống kê yêu cầu theo thời gian |
| Báo cáo KTX | Thống kê sự cố theo danh mục |
| **📈 Biểu đồ tương tác** | Charts với Recharts |
| **📥 Xuất CSV** | Export data để phân tích |
| Lọc theo thời gian | Ngày/Tuần/Tháng/Học kỳ |

---

### 7. 📧 Hệ thống Thông báo Đa kênh
**Backend:** `services/studentNotificationService.js`, `services/emailService.js`

| Kênh | Mô tả |
|------|-------|
| **🔔 In-app Notification** | Realtime qua Socket.IO |
| **📧 Email** | Gửi qua Nodemailer |
| **⚡ Parallel sending** | Gửi đồng thời cả 2 kênh |

**Các sự kiện trigger thông báo:**
| Sự kiện | In-app | Email |
|---------|--------|-------|
| Yêu cầu CTSV được duyệt | ✅ | ✅ |
| Yêu cầu CTSV bị từ chối | ✅ | ✅ |
| Yêu cầu KTX được tiếp nhận | ✅ | ✅ |
| Yêu cầu KTX hoàn thành | ✅ | ✅ |

---

## ⚡ TÍNH NĂNG REALTIME

### Socket.IO Events

| Event | Mô tả | Người nhận |
|-------|-------|------------|
| `CERTIFICATE_REQUEST_CREATED` | Yêu cầu CTSV mới | Staff CTSV |
| `CERTIFICATE_REQUEST_UPDATED` | Cập nhật yêu cầu CTSV | Sinh viên |
| `DORMITORY_REQUEST_CREATED` | Yêu cầu KTX mới | Staff KTX |
| `DORMITORY_REQUEST_UPDATED` | Cập nhật yêu cầu KTX | Sinh viên |
| `STUDENT_NOTIFICATION_CREATED` | Thông báo mới | Sinh viên |

**Trải nghiệm Realtime:**
- Sinh viên nhận thông báo ngay khi Staff xử lý
- Staff thấy yêu cầu mới ngay khi sinh viên gửi
- Không cần refresh trang
- Badge notification cập nhật tức thì

---

## 🔐 BẢO MẬT & PHÂN QUYỀN

| Tính năng | Mô tả |
|-----------|-------|
| JWT Authentication | Token-based authentication |
| Role-based Access | Admin / Staff CTSV / Staff KTX / Student |
| Protected Routes | Frontend route guards |
| API Authorization | Middleware kiểm tra quyền |
| Session Management | Tự động logout khi hết hạn |

---

## 📱 RESPONSIVE DESIGN

| Thiết bị | Hỗ trợ |
|----------|--------|
| Desktop | ✅ Đầy đủ tính năng |
| Tablet | ✅ Responsive layout |
| Mobile | ✅ Optimized UI |

---

## 🎨 UI/UX HIGHLIGHTS

| Tính năng | Mô tả |
|-----------|-------|
| Modern Design | Gradient colors, shadows, rounded corners |
| Consistent Styling | CSS variables, reusable components |
| Loading States | Skeleton, spinners cho UX mượt |
| Toast Notifications | Feedback trực quan cho actions |
| Confirm Dialogs | Xác nhận trước actions quan trọng |
| Empty States | Thông báo khi không có dữ liệu |
| Error Handling | Hiển thị lỗi thân thiện |

---

## 📊 KẾT LUẬN

### Hệ thống UniHelper đã đạt được các tiêu chuẩn:

1. **✅ User-Centric Design**
   - Giao diện trực quan, dễ sử dụng
   - Chatbot AI hỗ trợ 24/7
   - File preview tiết kiệm thời gian

2. **✅ Real-time Communication**
   - Socket.IO cho cập nhật tức thì
   - Thông báo đa kênh (In-app + Email)
   - Không cần refresh để thấy thay đổi

3. **✅ Smart Workflow**
   - Bộ lọc học kỳ với timeline trực quan
   - Activity log cho audit và tracking
   - Automated notifications

4. **✅ Modern Architecture**
   - Separation of concerns (Controller → Service → Repository)
   - RESTful API design
   - Component-based frontend

5. **✅ Scalability**
   - Cloud-ready (Google Cloud Run)
   - Database optimization (MongoDB indexes)
   - Caching strategies

---

## 📝 Ghi chú

Tài liệu này được tạo để tổng hợp các chức năng nổi bật của hệ thống UniHelper, phục vụ mục đích:
- Báo cáo đồ án
- Demo sản phẩm
- Hướng dẫn sử dụng

**Ngày tạo:** 30/01/2026  
**Phiên bản:** 1.0
