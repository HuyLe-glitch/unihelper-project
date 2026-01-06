# MODULE CÔNG TÁC SINH VIÊN (CTSV)

## 1. Tổng quan Module

Module Công tác Sinh viên (CTSV) là một trong hai module chính của hệ thống UniHelper, cho phép sinh viên tạo và theo dõi các yêu cầu giấy tờ, chứng nhận liên quan đến công tác sinh viên. Module này kết nối sinh viên với nhân viên phòng Công tác Sinh viên thông qua một quy trình xử lý yêu cầu được số hóa hoàn toàn.

### 1.1. Mục tiêu của Module
- Số hóa quy trình xin cấp giấy tờ, chứng nhận cho sinh viên
- Giảm thiểu thời gian chờ đợi và thủ tục giấy tờ thủ công
- Cung cấp khả năng theo dõi trạng thái yêu cầu theo thời gian thực
- Tự động hóa việc thông báo cho sinh viên qua nhiều kênh (In-app, Email)

### 1.2. Các loại giấy tờ được hỗ trợ
- Xác nhận sinh viên
- Bổ sung hồ sơ cá nhân
- Bổ sung hồ sơ chế độ chính sách
- Xác nhận tình trạng sinh viên
- Xác nhận hoàn tất chương trình đào tạo
- Xác nhận đang trong thời gian bảo vệ tốt nghiệp
- Và các loại giấy tờ khác theo quy định

---

## 2. Các bên tham gia (Actors)

### 2.1. Sinh viên (Student)
- Tạo yêu cầu giấy tờ CTSV
- Theo dõi trạng thái yêu cầu
- Nhận thông báo về kết quả xử lý
- Tải file đính kèm (nếu có) sau khi yêu cầu được duyệt

### 2.2. Nhân viên CTSV (Staff CTSV)
- Xem danh sách tất cả yêu cầu từ sinh viên
- Xử lý yêu cầu (duyệt/từ chối)
- Ghi chú phản hồi cho sinh viên
- Đính kèm file phản hồi (nếu cần)

---

## 3. Luồng hoạt động chi tiết

### 3.1. Luồng tạo yêu cầu CTSV

#### Bước 1: Sinh viên khởi tạo yêu cầu
Sinh viên có thể tạo yêu cầu CTSV thông qua **2 cách**:

**Cách 1: Qua giao diện form truyền thống**
- Sinh viên truy cập trang "Lịch sử yêu cầu CTSV" trên Dashboard
- Nhấn nút "Tạo yêu cầu mới"
- Chọn loại chứng nhận (ví dụ: "Xác nhận sinh viên")
- Chọn tên chứng nhận cụ thể (ví dụ: "Xác nhận sinh viên đang theo học")
- Chọn học kỳ áp dụng
- Nhấn "Gửi yêu cầu"

**Cách 2: Qua Chatbot AI (Dialogflow)**
- Sinh viên mở cửa sổ chatbot trên giao diện
- Nhập tin nhắn như: "Tôi muốn xin xác nhận sinh viên"
- Chatbot sẽ hỏi các thông tin cần thiết:
  + Loại giấy tờ muốn xin
  + Học kỳ áp dụng
- Sau khi thu thập đủ thông tin, chatbot tự động tạo yêu cầu

#### Bước 2: Hệ thống xử lý và lưu trữ
Khi yêu cầu được gửi, hệ thống thực hiện các bước sau:

1. **Tạo mã yêu cầu**: Hệ thống tự động sinh mã yêu cầu duy nhất theo format `CTSV1`, `CTSV2`, ... để dễ dàng tra cứu và theo dõi.

2. **Lưu trữ vào cơ sở dữ liệu**: Yêu cầu được lưu với trạng thái ban đầu là "ĐANG XỬ LÝ" cùng các thông tin:
   - Mã yêu cầu
   - Thông tin sinh viên
   - Loại chứng nhận
   - Tên chứng nhận
   - Học kỳ
   - Ngày tạo yêu cầu

3. **Gửi thông báo cho sinh viên**: Hệ thống thực hiện **song song** 2 việc:
   - **Thông báo In-app**: Tạo một notification trong hệ thống, hiển thị trên biểu tượng chuông ở header. Sinh viên có thể nhấn vào để xem chi tiết.
   - **Gửi Email**: Gửi email thông báo đến địa chỉ email của sinh viên với nội dung xác nhận yêu cầu đã được tiếp nhận.

4. **Thông báo realtime cho Staff**: Sử dụng Socket.IO để gửi thông báo tức thì đến tất cả nhân viên CTSV đang online, giúp họ biết có yêu cầu mới cần xử lý.

#### Bước 3: Nhân viên CTSV xử lý yêu cầu
Nhân viên CTSV đăng nhập và thấy danh sách yêu cầu:

1. **Xem danh sách yêu cầu**: Hiển thị tất cả yêu cầu từ sinh viên, có thể lọc theo trạng thái (Đang xử lý / Hợp lệ / Không hợp lệ).

2. **Xem chi tiết yêu cầu**: Nhấn vào yêu cầu để xem:
   - Thông tin sinh viên (họ tên, email, SĐT, khoa, ngành)
   - Thông tin yêu cầu (loại, tên chứng nhận, học kỳ, ngày yêu cầu)
   - Lịch sử xử lý

3. **Xử lý yêu cầu**: Nhân viên có thể:
   - Thêm ghi chú phản hồi cho sinh viên
   - Đính kèm file (ví dụ: file PDF giấy xác nhận đã ký)
   - Chọn trạng thái: "HỢP LỆ" hoặc "KHÔNG HỢP LỆ"

#### Bước 4: Thông báo kết quả cho sinh viên
Khi nhân viên duyệt hoặc từ chối yêu cầu, hệ thống thực hiện:

1. **Cập nhật trạng thái**: Lưu trạng thái mới vào database cùng với:
   - Thời điểm xử lý
   - Nhân viên xử lý
   - Ghi chú (nếu có)
   - File đính kèm (nếu có)

2. **Gửi thông báo cho sinh viên** (song song):
   - **Thông báo In-app**: 
     + Nếu HỢP LỆ: "Yêu cầu CTSV28 đã được duyệt"
     + Nếu KHÔNG HỢP LỆ: "Yêu cầu CTSV28 bị từ chối"
   - **Gửi Email**:
     + Email thông báo kết quả xử lý
     + Nếu có file đính kèm, hướng dẫn sinh viên vào hệ thống để tải

3. **Cập nhật realtime**: Socket.IO gửi event để cập nhật giao diện sinh viên ngay lập tức (nếu đang online).

---

## 4. Hệ thống thông báo

### 4.1. Thông báo In-app (Notification)

#### 4.1.1. Tổng quan
Thông báo In-app là hệ thống thông báo nội bộ trong ứng dụng, cho phép sinh viên nhận được thông tin về trạng thái yêu cầu ngay trên giao diện web mà không cần kiểm tra email. Hệ thống này được thiết kế để đảm bảo sinh viên luôn được cập nhật thông tin mới nhất về yêu cầu của mình.

#### 4.1.2. Công nghệ sử dụng
- **Backend**: 
  + MongoDB để lưu trữ thông báo với schema riêng (StudentNotification)
  + Socket.IO để gửi thông báo realtime đến client
  + Express.js để xử lý API RESTful
- **Frontend**:
  + React component NotificationDropdown
  + Socket.IO Client để nhận thông báo realtime
  + CSS với hiệu ứng animation cho badge

#### 4.1.3. Cấu trúc dữ liệu thông báo
Mỗi thông báo được lưu trong database với các trường sau:
| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| userId | ObjectId | ID người nhận (sinh viên) |
| type | String | Loại thông báo (CTSV_REQUEST_CREATED, CTSV_REQUEST_APPROVED, CTSV_REQUEST_REJECTED) |
| title | String | Tiêu đề thông báo |
| message | String | Nội dung chi tiết |
| data | Object | Dữ liệu bổ sung (requestCode, requestId, certificateType,...) |
| isRead | Boolean | Trạng thái đã đọc (mặc định: false) |
| createdAt | Date | Thời điểm tạo thông báo |

#### 4.1.4. Giao diện hiển thị
**Biểu tượng chuông (Bell Icon):**
- Nằm ở góc phải header, cạnh avatar người dùng
- Hiển thị badge số đỏ khi có thông báo chưa đọc
- Badge hiển thị số lượng thông báo chưa đọc (tối đa hiển thị "99+")
- Có hiệu ứng pulse animation để thu hút sự chú ý

**Dropdown danh sách thông báo:**
- Mở ra khi nhấn vào biểu tượng chuông
- Hiển thị danh sách thông báo mới nhất (sắp xếp theo thời gian, mới nhất lên đầu)
- Mỗi thông báo hiển thị:
  + Icon theo loại (📝 tạo mới, ✅ duyệt, ❌ từ chối)
  + Badge loại (CTSV hoặc KTX) với màu khác nhau
  + Thời gian tương đối ("Vừa xong", "5 phút trước", "2 ngày trước")
  + Tiêu đề và nội dung rút gọn
  + Chấm xanh nhỏ đánh dấu thông báo chưa đọc

**Dialog chi tiết thông báo:**
- Mở ra khi nhấn vào một thông báo cụ thể
- Hiển thị đầy đủ thông tin:
  + Mã yêu cầu
  + Loại chứng nhận
  + Tên chứng nhận
  + Trạng thái hiện tại (với badge màu tương ứng)
  + Học kỳ
  + Thời gian tạo yêu cầu

#### 4.1.5. Trạng thái đã đọc / Chưa đọc
- **Chưa đọc (isRead = false)**:
  + Background màu xanh nhạt để nổi bật
  + Có chấm xanh nhỏ ở góc phải
  + Được đếm vào badge số trên biểu tượng chuông
  
- **Đã đọc (isRead = true)**:
  + Background trắng bình thường
  + Không có chấm xanh
  + Không được đếm vào badge số

- **Đánh dấu đã đọc**: Tự động đánh dấu khi sinh viên nhấn vào thông báo để xem chi tiết

- **Đánh dấu tất cả đã đọc**: Nút "Đánh dấu tất cả đã đọc" ở header dropdown để đánh dấu hàng loạt

#### 4.1.6. Cập nhật Realtime
Khi có thông báo mới:
1. Backend emit event `STUDENT_NOTIFICATION_CREATED` qua Socket.IO
2. Frontend nhận event và tự động:
   + Tăng số đếm badge
   + Nếu dropdown đang mở → thêm thông báo mới vào đầu danh sách
   + Không cần refresh trang

**Các loại thông báo CTSV:**
| Sự kiện | Type | Tiêu đề thông báo | Nội dung |
|---------|------|-------------------|----------|
| Tạo yêu cầu | CTSV_REQUEST_CREATED | Yêu cầu CTSV đã được tiếp nhận | Yêu cầu {mã yêu cầu} về {tên chứng nhận} đã được tiếp nhận |
| Duyệt yêu cầu | CTSV_REQUEST_APPROVED | Yêu cầu CTSV đã được duyệt | Yêu cầu {mã yêu cầu} về {tên chứng nhận} đã được duyệt |
| Từ chối yêu cầu | CTSV_REQUEST_REJECTED | Yêu cầu CTSV bị từ chối | Yêu cầu {mã yêu cầu} về {tên chứng nhận} không được chấp nhận |

### 4.2. Thông báo Email

#### 4.2.1. Tổng quan
Hệ thống gửi email tự động đến địa chỉ email của sinh viên khi có sự kiện quan trọng xảy ra. Email đóng vai trò là kênh thông báo bổ sung, đảm bảo sinh viên nhận được thông tin ngay cả khi không đăng nhập vào hệ thống.

#### 4.2.2. Công nghệ sử dụng
- **Thư viện**: Nodemailer (phiên bản 6.x) - thư viện phổ biến nhất để gửi email trong Node.js
- **Dịch vụ SMTP**: Gmail SMTP Server
- **Xác thực**: App Password (Mật khẩu ứng dụng) - phương thức bảo mật được Google khuyến nghị thay vì dùng mật khẩu trực tiếp
- **Cấu hình**:
  + Host: smtp.gmail.com
  + Port: 587 (TLS)
  + Secure: false (dùng STARTTLS)

#### 4.2.3. Cấu hình môi trường
Thông tin cấu hình được lưu trong biến môi trường (không hardcode):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 4.2.4. Kiến trúc Email Service
Email Service được tổ chức thành module riêng biệt (`emailService.js`) với các chức năng:
- `sendCtsvRequestCreated(email, data)`: Gửi email khi tạo yêu cầu CTSV mới
- `sendCtsvRequestApproved(email, data)`: Gửi email khi yêu cầu được duyệt
- `sendCtsvRequestRejected(email, data)`: Gửi email khi yêu cầu bị từ chối

#### 4.2.5. Xử lý bất đồng bộ
Việc gửi email được thực hiện **bất đồng bộ** để không làm chậm phản hồi API:
- Sử dụng `Promise.all` để gửi In-app notification và Email song song
- Không chờ (`await`) kết quả gửi email trước khi trả response cho client
- Nếu gửi email thất bại, không ảnh hưởng đến việc tạo yêu cầu

#### 4.2.6. Template Email
**Email khi tạo yêu cầu:**
```
Tiêu đề: [UniHelper] Yêu cầu CTSV28 đã được tiếp nhận

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu của bạn đã được tiếp nhận với thông tin:
- Mã yêu cầu: CTSV28
- Loại chứng nhận: Xác nhận sinh viên
- Học kỳ: HK1 (2025-2026)

Chúng tôi sẽ xử lý và thông báo kết quả sớm nhất.

Trân trọng,
Hệ thống UniHelper
```

**Email khi duyệt yêu cầu:**
```
Tiêu đề: [UniHelper] Yêu cầu CTSV28 đã được duyệt

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu của bạn đã được DUYỆT:
- Mã yêu cầu: CTSV28
- Loại chứng nhận: Xác nhận sinh viên

Vui lòng đăng nhập hệ thống để xem chi tiết và tải file đính kèm (nếu có).

Trân trọng,
Hệ thống UniHelper
```

**Email khi từ chối yêu cầu:**
```
Tiêu đề: [UniHelper] Yêu cầu CTSV28 không được chấp nhận

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu của bạn KHÔNG được chấp nhận:
- Mã yêu cầu: CTSV28
- Lý do: [Ghi chú từ nhân viên]

Vui lòng liên hệ phòng CTSV để biết thêm chi tiết.

Trân trọng,
Hệ thống UniHelper
```

---

## 5. Trạng thái yêu cầu

| Trạng thái | Mô tả | Màu hiển thị |
|------------|-------|--------------|
| ĐANG XỬ LÝ | Yêu cầu mới được tạo, chờ nhân viên xử lý | Vàng |
| HỢP LỆ | Yêu cầu đã được duyệt | Xanh lá |
| KHÔNG HỢP LỆ | Yêu cầu bị từ chối | Đỏ |

---

## 6. Tích hợp Chatbot AI - Tạo yêu cầu bằng trí tuệ nhân tạo

### 6.1. Ý tưởng và hướng tiếp cận

#### 6.1.1. Vấn đề cần giải quyết
Trong quy trình truyền thống, sinh viên phải:
- Tìm đúng form yêu cầu trong hệ thống
- Điền nhiều trường thông tin thủ công
- Chọn đúng loại chứng nhận từ danh sách dài
- Hiểu rõ các thuật ngữ hành chính

**Giải pháp**: Sử dụng Chatbot AI để cho phép sinh viên tạo yêu cầu bằng **ngôn ngữ tự nhiên** - giống như đang nhắn tin với một người bạn.

#### 6.1.2. Hướng tiếp cận
Hệ thống áp dụng phương pháp **Conversational UI** (Giao diện hội thoại):
- Sinh viên chỉ cần mô tả nhu cầu bằng lời nói thông thường
- Chatbot sẽ hiểu ý định và thu thập thông tin còn thiếu
- Tự động mapping với loại chứng nhận phù hợp trong hệ thống
- Tạo yêu cầu mà không cần sinh viên điền form

#### 6.1.3. Lợi ích
- **Đơn giản hóa trải nghiệm**: Sinh viên không cần biết cấu trúc hệ thống
- **Tiết kiệm thời gian**: Tạo yêu cầu chỉ trong vài câu chat
- **Hỗ trợ đa dạng cách diễn đạt**: "Xin xác nhận SV", "cần giấy xác nhận sinh viên", "làm xác nhận đang học" đều được hiểu là cùng một loại yêu cầu
- **Giảm lỗi**: Chatbot hướng dẫn từng bước, tránh điền sai thông tin

### 6.2. Công nghệ sử dụng

#### 6.2.1. Dialogflow ES (Google Cloud)
- **Nền tảng**: Dialogflow ES (Essentials) - dịch vụ xử lý ngôn ngữ tự nhiên (NLP) của Google
- **Khả năng**: Nhận diện ý định (Intent) và trích xuất thực thể (Entity) từ câu nói tự nhiên
- **Ngôn ngữ**: Hỗ trợ tiếng Việt với khả năng training thêm

#### 6.2.2. Intent Detection (Nhận diện ý định)
Dialogflow được training để nhận diện các ý định liên quan đến CTSV:
| Intent | Trigger Phrases (Câu kích hoạt) | Mô tả |
|--------|--------------------------------|-------|
| `ctsv.request.start` | "xin giấy xác nhận", "làm chứng nhận sinh viên", "cần xác nhận SV" | Bắt đầu quy trình tạo yêu cầu CTSV |
| `ctsv.select.type` | "xác nhận sinh viên", "bổ sung hồ sơ", "xác nhận hoàn tất" | Chọn loại chứng nhận |
| `ctsv.select.semester` | "học kỳ 1", "HK2 năm 2025", "kỳ này" | Chọn học kỳ |
| `ctsv.confirm` | "đồng ý", "xác nhận", "ok" | Xác nhận tạo yêu cầu |

#### 6.2.3. Entity Synonyms (Từ đồng nghĩa)
Để nhận diện nhiều cách diễn đạt khác nhau, hệ thống sử dụng Entity với synonyms:

**Ví dụ Entity "certificate_type":**
| Giá trị chuẩn | Synonyms (Từ đồng nghĩa) |
|---------------|-------------------------|
| Xác nhận sinh viên | xác nhận SV, giấy xác nhận sinh viên, XNSV, xác nhận đang học |
| Bổ sung hồ sơ cá nhân | bổ sung hồ sơ, cập nhật hồ sơ, thêm hồ sơ |
| Xác nhận hoàn tất chương trình | xác nhận tốt nghiệp, hoàn thành chương trình, xác nhận ra trường |

#### 6.2.4. Context Management (Quản lý ngữ cảnh)
Chatbot sử dụng context để nhớ thông tin trong cuộc hội thoại:
- `ctsv-flow`: Context chính cho luồng CTSV
- Lưu trữ: certificateType, certificateName, semester đã chọn
- Timeout: 5 phút không hoạt động sẽ reset

### 6.3. Luồng hoạt động chi tiết

#### 6.3.1. Sơ đồ luồng xử lý
```
[Sinh viên nhập tin nhắn]
         ↓
[Gửi đến Dialogflow API]
         ↓
[Dialogflow phân tích → Intent + Entities]
         ↓
[Backend nhận response từ Dialogflow]
         ↓
[ctsvHandler.js xử lý logic]
         ↓
    ┌────┴────┐
    ↓         ↓
[Đủ thông tin?]
    ↓         ↓
   YES        NO
    ↓         ↓
[Tạo yêu cầu] [Hỏi thêm thông tin]
    ↓              ↓
[Lưu DB]     [Trả lời sinh viên]
    ↓
[Emit Socket.IO event]
    ↓
[Cập nhật UI realtime]
```

#### 6.3.2. Chi tiết từng bước

**Bước 1: Sinh viên bắt đầu cuộc hội thoại**
- Sinh viên nhấn vào icon chatbot ở góc màn hình
- Cửa sổ chat mở ra với lời chào từ bot
- Sinh viên nhập: "Tôi muốn xin xác nhận sinh viên"

**Bước 2: Xử lý ngôn ngữ tự nhiên**
- Tin nhắn được gửi đến Dialogflow qua API
- Dialogflow phân tích và trả về:
  ```json
  {
    "intent": "ctsv.request.start",
    "parameters": {
      "certificate_type": "Xác nhận sinh viên"
    },
    "fulfillmentText": "Bạn muốn xin loại xác nhận nào?"
  }
  ```

**Bước 3: Thu thập thông tin còn thiếu**
- Backend kiểm tra context: đã có certificate_type chưa? semester chưa?
- Nếu thiếu thông tin → Bot hỏi tiếp
- Bot: "Bạn cần xác nhận cho học kỳ nào?"
- Sinh viên: "Học kỳ 1 năm 2025-2026"

**Bước 4: Xác nhận và tạo yêu cầu**
- Khi đủ thông tin, bot tổng hợp và hỏi xác nhận:
  ```
  Bạn muốn tạo yêu cầu với thông tin sau:
  - Loại: Xác nhận sinh viên đang theo học
  - Học kỳ: HK1 (2025-2026)
  
  Bạn có đồng ý không? (Có/Không)
  ```
- Sinh viên: "Có" hoặc "Đồng ý"

**Bước 5: Lưu vào database và thông báo**
- Backend gọi `certificateRequestRepository.createRequest()` để lưu yêu cầu
- Tự động sinh mã yêu cầu (CTSV29, CTSV30,...)
- Gửi thông báo In-app và Email cho sinh viên
- Bot phản hồi:
  ```
  ✅ Đã tạo yêu cầu thành công!
  Mã yêu cầu: CTSV29
  Loại: Xác nhận sinh viên đang theo học
  Học kỳ: HK1 (2025-2026)
  
  Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
  ```

### 6.4. Cập nhật realtime vào danh sách yêu cầu

#### 6.4.1. Vấn đề
Khi sinh viên tạo yêu cầu qua chatbot, trang "Lịch sử yêu cầu CTSV" đang mở cần được cập nhật ngay lập tức mà không cần refresh.

#### 6.4.2. Giải pháp: Socket.IO Event
Sau khi tạo yêu cầu thành công qua chatbot:

1. **Backend emit event**:
   ```javascript
   io.emit('CERTIFICATE_REQUEST_CREATED', {
     request: {
       _id: newRequest._id,
       requestCode: 'CTSV29',
       certificateType: { name: 'Xác nhận sinh viên' },
       certificateName: { name: 'Xác nhận đang theo học' },
       semester: 'HK1 (2025-2026)',
       status: 'ĐANG XỬ LÝ',
       student: { fullName: 'Nguyễn Văn A', ... }
     }
   });
   ```

2. **Frontend lắng nghe event**:
   - Component `HistoryAffair.jsx` (trang lịch sử của sinh viên) subscribe event
   - Component `StaffCtsvRequests.jsx` (trang quản lý của staff) subscribe event

3. **Cập nhật UI ngay lập tức**:
   - Thêm yêu cầu mới vào đầu danh sách (không cần gọi API lại)
   - Hiển thị badge "Mới" hoặc highlight để nổi bật
   - Cập nhật số lượng yêu cầu

#### 6.4.3. Lợi ích
- **Trải nghiệm liền mạch**: Sinh viên tạo xong qua chatbot → chuyển sang trang lịch sử → thấy ngay yêu cầu vừa tạo
- **Đồng bộ đa thiết bị**: Nếu sinh viên mở cùng lúc trên 2 tab → cả 2 đều cập nhật
- **Staff được thông báo ngay**: Nhân viên CTSV đang xem danh sách sẽ thấy yêu cầu mới xuất hiện tức thì

### 6.5. Xử lý các trường hợp đặc biệt

#### 6.5.1. Sinh viên nhập sai hoặc không rõ ràng
```
Sinh viên: "tôi cần giấy tờ"
Bot: Bạn cần loại giấy tờ nào? Ví dụ:
     - Xác nhận sinh viên
     - Bổ sung hồ sơ
     - Xác nhận hoàn tất chương trình
```

#### 6.5.2. Sinh viên muốn hủy giữa chừng
```
Sinh viên: "thôi không cần nữa"
Bot: Đã hủy yêu cầu. Bạn có thể bắt đầu lại bất cứ lúc nào.
```

#### 6.5.3. Lỗi hệ thống
```
Bot: Xin lỗi, có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại sau hoặc sử dụng form tạo yêu cầu truyền thống.
```

### 6.6. Luồng hội thoại mẫu hoàn chỉnh

```
Bot: Xin chào! Tôi là trợ lý ảo UniHelper. Tôi có thể giúp bạn:
     - Tạo yêu cầu giấy tờ CTSV
     - Đăng ký/sửa chữa KTX
     - Tra cứu thông tin
     
     Bạn cần hỗ trợ gì?

Sinh viên: Tôi muốn xin xác nhận sinh viên

Bot: Bạn muốn xin loại xác nhận nào?
     1. Xác nhận đang theo học
     2. Xác nhận tình trạng sinh viên
     3. Xác nhận hoàn tất chương trình
     4. Xác nhận đang bảo vệ tốt nghiệp

Sinh viên: Xác nhận đang theo học

Bot: Bạn cần xác nhận cho học kỳ nào?

Sinh viên: Học kỳ 1 năm 2025-2026

Bot: Xác nhận tạo yêu cầu với thông tin:
     📋 Loại: Xác nhận sinh viên
     📄 Tên: Xác nhận đang theo học
     📅 Học kỳ: HK1 (2025-2026)
     
     Bạn có đồng ý tạo yêu cầu này không?

Sinh viên: Đồng ý

Bot: ✅ Đã tạo yêu cầu thành công!
     
     📋 Mã yêu cầu: CTSV29
     📄 Loại: Xác nhận sinh viên đang theo học
     📅 Học kỳ: HK1 (2025-2026)
     ⏳ Trạng thái: Đang xử lý
     
     📬 Bạn sẽ nhận được thông báo qua email và trong hệ thống khi yêu cầu được xử lý.
     
     Bạn cần hỗ trợ gì thêm không?
```

---

## 7. Kiến trúc kỹ thuật

### 7.1. Backend (Node.js + Express)
```
├── controllers/
│   └── certificateRequestController.js  # Xử lý HTTP request
├── services/
│   ├── certificateRequestService.js     # Business logic
│   ├── studentNotificationService.js    # Thông báo In-app
│   └── emailService.js                  # Gửi email
├── repositories/
│   └── certificateRequestRepository.js  # Truy vấn database
└── models/
    ├── CertificateRequest.js            # Schema yêu cầu
    ├── CertificateType.js               # Loại chứng nhận
    └── StudentNotification.js           # Thông báo
```

### 7.2. Frontend (React + Vite)
```
├── components/
│   ├── student/
│   │   └── history-affair/              # Lịch sử yêu cầu CTSV
│   ├── staff/
│   │   └── cts/                         # Quản lý yêu cầu CTSV
│   └── common/
│       └── NotificationDropdown/        # Dropdown thông báo
└── services/
    ├── certificateRequest.js            # API calls
    ├── studentNotification.js           # API thông báo
    └── socket.js                        # Socket.IO client
```

---

## 8. Tổng kết

Module CTSV cung cấp một giải pháp toàn diện cho việc quản lý yêu cầu giấy tờ của sinh viên với các điểm nổi bật:

1. **Đa kênh tương tác**: Sinh viên có thể tạo yêu cầu qua form hoặc chatbot AI
2. **Thông báo đa kênh**: Kết hợp In-app notification và Email để đảm bảo sinh viên không bỏ lỡ thông tin
3. **Realtime updates**: Sử dụng Socket.IO để cập nhật trạng thái tức thì
4. **Theo dõi lịch sử**: Lưu trữ đầy đủ lịch sử xử lý, cho phép audit và tra cứu
5. **File đính kèm**: Hỗ trợ upload/download file thông qua Firebase Storage
