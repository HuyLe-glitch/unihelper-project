# MODULE KÝ TÚC XÁ (KTX)

## 1. Tổng quan Module

Module Ký túc xá (KTX) là module thứ hai trong hệ thống UniHelper, cho phép sinh viên tạo và theo dõi các yêu cầu liên quan đến ký túc xá như đăng ký ở KTX, sửa chữa trang thiết bị, báo hỏng, và các yêu cầu khác. Module này kết nối sinh viên với nhân viên quản lý ký túc xá thông qua một quy trình xử lý yêu cầu được số hóa và tự động hóa.

### 1.1. Mục tiêu của Module
- Số hóa quy trình quản lý yêu cầu ký túc xá
- Giảm thiểu thời gian xử lý các yêu cầu sửa chữa, bảo trì
- Cung cấp khả năng theo dõi trạng thái yêu cầu theo thời gian thực
- Tự động hóa việc thông báo cho sinh viên qua nhiều kênh (In-app, Email)
- Quản lý thông tin phòng, trang thiết bị một cách hiệu quả

### 1.2. Các loại yêu cầu KTX được hỗ trợ
- **Đăng ký ở KTX**: Sinh viên đăng ký chỗ ở tại ký túc xá
- **Sửa chữa trang thiết bị**: Báo hỏng và yêu cầu sửa chữa các thiết bị trong phòng
- **Yêu cầu dịch vụ**: Các yêu cầu khác liên quan đến sinh hoạt tại KTX
- **Gia hạn hợp đồng**: Yêu cầu gia hạn thời gian ở KTX
- **Chấm dứt hợp đồng**: Yêu cầu rời khỏi KTX

---

## 2. Các bên tham gia (Actors)

### 2.1. Sinh viên (Student)
- Tạo yêu cầu KTX (đăng ký, sửa chữa, dịch vụ,...)
- Theo dõi trạng thái yêu cầu
- Nhận thông báo về kết quả xử lý
- Xem thông tin phòng và trang thiết bị (nếu đang ở KTX)

### 2.2. Nhân viên KTX (Staff KTX)
- Xem danh sách tất cả yêu cầu từ sinh viên
- Xử lý yêu cầu (xác nhận/từ chối)
- Ghi chú phản hồi cho sinh viên
- Quản lý thông tin phòng và trang thiết bị
- Cập nhật trạng thái sửa chữa

---

## 3. Luồng hoạt động chi tiết

### 3.1. Luồng tạo yêu cầu KTX

#### Bước 1: Sinh viên khởi tạo yêu cầu
Sinh viên có thể tạo yêu cầu KTX thông qua **2 cách**:

**Cách 1: Qua giao diện form truyền thống**
- Sinh viên truy cập trang "Lịch sử yêu cầu KTX" trên Dashboard
- Nhấn nút "Tạo yêu cầu mới"
- Chọn danh mục yêu cầu (ví dụ: "Sửa chữa trang thiết bị")
- Chọn thiết bị cần sửa (nếu là yêu cầu sửa chữa)
- Nhập mô tả chi tiết vấn đề
- Chọn học kỳ áp dụng
- Nhấn "Gửi yêu cầu"

**Cách 2: Qua Chatbot AI (Dialogflow)**
- Sinh viên mở cửa sổ chatbot trên giao diện
- Nhập tin nhắn như: "Tôi muốn báo hỏng điều hòa" hoặc "Đăng ký ở KTX"
- Chatbot sẽ hỏi các thông tin cần thiết:
  + Loại yêu cầu
  + Thiết bị (nếu là sửa chữa)
  + Mô tả vấn đề
  + Học kỳ áp dụng
- Sau khi thu thập đủ thông tin, chatbot tự động tạo yêu cầu

#### Bước 2: Hệ thống xử lý và lưu trữ
Khi yêu cầu được gửi, hệ thống thực hiện các bước sau:

1. **Tạo mã yêu cầu**: Hệ thống tự động sinh mã yêu cầu duy nhất theo format `KTX1`, `KTX2`, ... để dễ dàng tra cứu và theo dõi.

2. **Lưu trữ vào cơ sở dữ liệu**: Yêu cầu được lưu với trạng thái ban đầu là "CHỜ XỬ LÝ" cùng các thông tin:
   - Mã yêu cầu
   - Thông tin sinh viên
   - Danh mục yêu cầu
   - Thiết bị liên quan (nếu có)
   - Mô tả chi tiết
   - Học kỳ
   - Ngày tạo yêu cầu

3. **Gửi thông báo cho sinh viên**: Hệ thống thực hiện **song song** 2 việc:
   - **Thông báo In-app**: Tạo một notification trong hệ thống, hiển thị trên biểu tượng chuông ở header. Sinh viên có thể nhấn vào để xem chi tiết.
   - **Gửi Email**: Gửi email thông báo đến địa chỉ email của sinh viên với nội dung xác nhận yêu cầu đã được tiếp nhận.

4. **Thông báo realtime cho Staff**: Sử dụng Socket.IO để gửi thông báo tức thì đến tất cả nhân viên KTX đang online, giúp họ biết có yêu cầu mới cần xử lý.

#### Bước 3: Nhân viên KTX xử lý yêu cầu
Nhân viên KTX đăng nhập và thấy danh sách yêu cầu:

1. **Xem danh sách yêu cầu**: Hiển thị tất cả yêu cầu từ sinh viên, có thể lọc theo:
   - Trạng thái (Chờ xử lý / Đang xử lý / Đã xử lý / Từ chối)
   - Danh mục (Sửa chữa / Đăng ký / Dịch vụ,...)
   - Tòa nhà / Phòng

2. **Xem chi tiết yêu cầu**: Nhấn vào yêu cầu để xem:
   - Thông tin sinh viên (họ tên, email, SĐT, phòng đang ở)
   - Thông tin yêu cầu (danh mục, thiết bị, mô tả, học kỳ, ngày yêu cầu)
   - Lịch sử xử lý

3. **Xử lý yêu cầu**: Nhân viên có thể:
   - Thêm ghi chú phản hồi cho sinh viên
   - Cập nhật trạng thái xử lý
   - Chọn kết quả: "ĐÃ XỬ LÝ" hoặc "TỪ CHỐI"

#### Bước 4: Thông báo kết quả cho sinh viên
Khi nhân viên xử lý xong hoặc từ chối yêu cầu, hệ thống thực hiện:

1. **Cập nhật trạng thái**: Lưu trạng thái mới vào database cùng với:
   - Thời điểm xử lý
   - Nhân viên xử lý
   - Ghi chú (nếu có)

2. **Gửi thông báo cho sinh viên** (song song):
   - **Thông báo In-app**: 
     + Nếu ĐÃ XỬ LÝ: "Yêu cầu KTX15 đã được xử lý"
     + Nếu TỪ CHỐI: "Yêu cầu KTX15 bị từ chối"
   - **Gửi Email**:
     + Email thông báo kết quả xử lý
     + Nội dung ghi chú từ nhân viên

3. **Cập nhật realtime**: Socket.IO gửi event để cập nhật giao diện sinh viên ngay lập tức (nếu đang online).

---

## 4. Hệ thống thông báo

### 4.1. Thông báo In-app (Notification)

#### 4.1.1. Tổng quan
Thông báo In-app là hệ thống thông báo nội bộ trong ứng dụng, cho phép sinh viên nhận được thông tin về trạng thái yêu cầu KTX ngay trên giao diện web mà không cần kiểm tra email. Hệ thống này đảm bảo sinh viên luôn được cập nhật thông tin về sửa chữa, đăng ký KTX một cách nhanh chóng.

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
| type | String | Loại thông báo (KTX_REQUEST_CREATED, KTX_REQUEST_APPROVED, KTX_REQUEST_REJECTED) |
| title | String | Tiêu đề thông báo |
| message | String | Nội dung chi tiết |
| data | Object | Dữ liệu bổ sung (requestCode, requestId, category, equipment,...) |
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
  + Icon theo loại (🏠 tạo mới, ✅ xử lý xong, ❌ từ chối)
  + Badge loại KTX với màu xanh lá
  + Thời gian tương đối ("Vừa xong", "5 phút trước", "2 ngày trước")
  + Tiêu đề và nội dung rút gọn
  + Chấm xanh nhỏ đánh dấu thông báo chưa đọc

**Dialog chi tiết thông báo:**
- Mở ra khi nhấn vào một thông báo cụ thể
- Hiển thị đầy đủ thông tin:
  + Mã yêu cầu
  + Danh mục yêu cầu
  + Thiết bị (nếu có)
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

**Các loại thông báo KTX:**
| Sự kiện | Type | Tiêu đề thông báo | Nội dung |
|---------|------|-------------------|----------|
| Tạo yêu cầu | KTX_REQUEST_CREATED | Yêu cầu KTX đã được tiếp nhận | Yêu cầu {mã yêu cầu} về {danh mục} đã được tiếp nhận |
| Xử lý xong | KTX_REQUEST_APPROVED | Yêu cầu KTX đã được xử lý | Yêu cầu {mã yêu cầu} về {danh mục} đã được xử lý |
| Từ chối | KTX_REQUEST_REJECTED | Yêu cầu KTX bị từ chối | Yêu cầu {mã yêu cầu} về {danh mục} không được chấp nhận |

### 4.2. Thông báo Email

#### 4.2.1. Tổng quan
Hệ thống gửi email tự động đến địa chỉ email của sinh viên khi có sự kiện quan trọng về yêu cầu KTX. Email đóng vai trò là kênh thông báo bổ sung, đảm bảo sinh viên nhận được thông tin ngay cả khi không đăng nhập vào hệ thống.

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
- `sendKtxRequestCreated(email, data)`: Gửi email khi tạo yêu cầu KTX mới
- `sendKtxRequestApproved(email, data)`: Gửi email khi yêu cầu được xử lý
- `sendKtxRequestRejected(email, data)`: Gửi email khi yêu cầu bị từ chối

#### 4.2.5. Xử lý bất đồng bộ
Việc gửi email được thực hiện **bất đồng bộ** để không làm chậm phản hồi API:
- Sử dụng `Promise.all` để gửi In-app notification và Email song song
- Không chờ (`await`) kết quả gửi email trước khi trả response cho client
- Nếu gửi email thất bại, không ảnh hưởng đến việc tạo yêu cầu

#### 4.2.6. Template Email
**Email khi tạo yêu cầu:**
```
Tiêu đề: [UniHelper] Yêu cầu KTX15 đã được tiếp nhận

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu KTX của bạn đã được tiếp nhận với thông tin:
- Mã yêu cầu: KTX15
- Danh mục: Sửa chữa trang thiết bị
- Thiết bị: Điều hòa
- Học kỳ: HK1 (2025-2026)

Chúng tôi sẽ xử lý và thông báo kết quả sớm nhất.

Trân trọng,
Hệ thống UniHelper
```

**Email khi xử lý xong:**
```
Tiêu đề: [UniHelper] Yêu cầu KTX15 đã được xử lý

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu KTX của bạn đã được XỬ LÝ XONG:
- Mã yêu cầu: KTX15
- Danh mục: Sửa chữa trang thiết bị
- Ghi chú: Đã thay gas điều hòa, thiết bị hoạt động bình thường

Cảm ơn bạn đã sử dụng hệ thống!

Trân trọng,
Hệ thống UniHelper
```

**Email khi từ chối:**
```
Tiêu đề: [UniHelper] Yêu cầu KTX15 không được chấp nhận

Nội dung:
Xin chào [Tên sinh viên],

Yêu cầu KTX của bạn KHÔNG được chấp nhận:
- Mã yêu cầu: KTX15
- Lý do: [Ghi chú từ nhân viên]

Vui lòng liên hệ Ban quản lý KTX để biết thêm chi tiết.

Trân trọng,
Hệ thống UniHelper
```

---

## 5. Trạng thái yêu cầu

| Trạng thái | Mô tả | Màu hiển thị |
|------------|-------|--------------|
| CHỜ XỬ LÝ | Yêu cầu mới được tạo, chờ nhân viên tiếp nhận | Vàng |
| ĐANG XỬ LÝ | Nhân viên đang xử lý yêu cầu | Xanh dương |
| ĐÃ XỬ LÝ | Yêu cầu đã được xử lý hoàn tất | Xanh lá |
| TỪ CHỐI | Yêu cầu bị từ chối | Đỏ |

---

## 6. Tích hợp Chatbot AI - Tạo yêu cầu KTX bằng trí tuệ nhân tạo

### 6.1. Ý tưởng và hướng tiếp cận

#### 6.1.1. Vấn đề cần giải quyết
Trong quy trình truyền thống, sinh viên ở KTX khi cần báo hỏng hoặc yêu cầu dịch vụ phải:
- Tìm đúng form yêu cầu trong hệ thống
- Chọn đúng danh mục, thiết bị từ danh sách
- Mô tả vấn đề bằng văn bản
- Đôi khi không biết tên chính xác của thiết bị hoặc danh mục

**Giải pháp**: Sử dụng Chatbot AI để cho phép sinh viên tạo yêu cầu bằng **ngôn ngữ tự nhiên** - như đang nói chuyện với nhân viên quản lý.

#### 6.1.2. Hướng tiếp cận
Hệ thống áp dụng phương pháp **Conversational UI** (Giao diện hội thoại):
- Sinh viên chỉ cần mô tả vấn đề bằng lời nói thông thường: "Điều hòa phòng tôi bị hỏng"
- Chatbot sẽ hiểu ý định và thu thập thông tin còn thiếu
- Tự động mapping với danh mục và thiết bị phù hợp trong hệ thống
- Tạo yêu cầu mà không cần sinh viên điền form phức tạp

#### 6.1.3. Lợi ích
- **Đơn giản hóa trải nghiệm**: Sinh viên không cần biết cấu trúc hệ thống
- **Tiết kiệm thời gian**: Báo hỏng chỉ trong vài câu chat
- **Hỗ trợ đa dạng cách diễn đạt**: "máy lạnh hỏng", "điều hòa không lạnh", "AC broken" đều được hiểu
- **Giảm lỗi**: Chatbot hướng dẫn từng bước, đảm bảo thu thập đủ thông tin

### 6.2. Công nghệ sử dụng

#### 6.2.1. Dialogflow ES (Google Cloud)
- **Nền tảng**: Dialogflow ES (Essentials) - dịch vụ xử lý ngôn ngữ tự nhiên (NLP) của Google
- **Khả năng**: Nhận diện ý định (Intent) và trích xuất thực thể (Entity) từ câu nói tự nhiên
- **Ngôn ngữ**: Hỗ trợ tiếng Việt với khả năng training thêm

#### 6.2.2. Intent Detection (Nhận diện ý định)
Dialogflow được training để nhận diện các ý định liên quan đến KTX:
| Intent | Trigger Phrases (Câu kích hoạt) | Mô tả |
|--------|--------------------------------|-------|
| `ktx.repair.start` | "báo hỏng", "thiết bị hỏng", "cần sửa chữa" | Bắt đầu quy trình báo hỏng |
| `ktx.register` | "đăng ký KTX", "muốn ở ký túc xá", "xin chỗ ở" | Đăng ký ở KTX |
| `ktx.select.equipment` | "điều hòa", "quạt", "bình nóng lạnh" | Chọn thiết bị cần sửa |
| `ktx.describe.problem` | "không lạnh", "bị rò nước", "có tiếng kêu" | Mô tả vấn đề |
| `ktx.confirm` | "đồng ý", "xác nhận", "ok" | Xác nhận tạo yêu cầu |

#### 6.2.3. Entity Synonyms (Từ đồng nghĩa)
Để nhận diện nhiều cách diễn đạt khác nhau, hệ thống sử dụng Entity với synonyms:

**Ví dụ Entity "equipment":**
| Giá trị chuẩn | Synonyms (Từ đồng nghĩa) |
|---------------|-------------------------|
| Điều hòa | máy lạnh, AC, air conditioner, điều hoà, máy điều hòa |
| Bình nóng lạnh | máy nước nóng, bình nước nóng, water heater |
| Quạt | quạt trần, quạt đứng, quạt điện |
| Đèn | bóng đèn, đèn LED, đèn huỳnh quang |

**Ví dụ Entity "problem_type":**
| Giá trị chuẩn | Synonyms (Từ đồng nghĩa) |
|---------------|-------------------------|
| Không hoạt động | hỏng, không chạy, bị hư, không bật được |
| Rò rỉ nước | chảy nước, rỉ nước, bị dột |
| Tiếng ồn | kêu to, có tiếng kêu, ồn ào |

#### 6.2.4. Context Management (Quản lý ngữ cảnh)
Chatbot sử dụng context để nhớ thông tin trong cuộc hội thoại:
- `ktx-flow`: Context chính cho luồng KTX
- Lưu trữ: category, equipment, description, semester đã chọn
- Timeout: 5 phút không hoạt động sẽ reset

### 6.3. Luồng hoạt động chi tiết

#### 6.3.1. Sơ đồ luồng xử lý
```
[Sinh viên nhập tin nhắn: "Điều hòa phòng tôi hỏng"]
         ↓
[Gửi đến Dialogflow API]
         ↓
[Dialogflow phân tích]
  - Intent: ktx.repair.start
  - Entity: equipment = "Điều hòa"
         ↓
[Backend nhận response từ Dialogflow]
         ↓
[ktxHandler.js xử lý logic]
         ↓
[Kiểm tra: Đã có đủ thông tin chưa?]
    ↓         ↓
   YES        NO
    ↓         ↓
[Hỏi xác nhận] [Hỏi thêm: "Vấn đề cụ thể?"]
    ↓              ↓
[Sinh viên: "Có"] [Sinh viên mô tả]
    ↓              ↓
[Tạo yêu cầu, lưu DB]
    ↓
[Emit Socket.IO events]
    ↓
[Cập nhật UI realtime cho SV + Staff]
```

#### 6.3.2. Chi tiết từng bước

**Bước 1: Sinh viên bắt đầu cuộc hội thoại**
- Sinh viên nhấn vào icon chatbot ở góc màn hình
- Cửa sổ chat mở ra với lời chào từ bot
- Sinh viên nhập: "Điều hòa phòng tôi bị hỏng"

**Bước 2: Xử lý ngôn ngữ tự nhiên**
- Tin nhắn được gửi đến Dialogflow qua API
- Dialogflow phân tích và trả về:
  ```json
  {
    "intent": "ktx.repair.start",
    "parameters": {
      "equipment": "Điều hòa"
    },
    "fulfillmentText": "Bạn có thể mô tả vấn đề cụ thể không?"
  }
  ```

**Bước 3: Thu thập thông tin còn thiếu**
- Backend kiểm tra context: đã có description chưa? semester chưa?
- Nếu thiếu thông tin → Bot hỏi tiếp
- Bot: "Điều hòa bị hỏng như thế nào?"
- Sinh viên: "Điều hòa không lạnh, có tiếng kêu to"

**Bước 4: Xác nhận thông tin phòng**
- Hệ thống kiểm tra sinh viên có đang ở KTX không (isDormResident = true)
- Nếu có → Tự động lấy thông tin phòng từ profile
- Nếu không → Bot hỏi: "Bạn đang ở phòng nào?"

**Bước 5: Xác nhận và tạo yêu cầu**
- Khi đủ thông tin, bot tổng hợp và hỏi xác nhận:
  ```
  Xác nhận tạo yêu cầu sửa chữa:
  🔧 Thiết bị: Điều hòa
  🏠 Phòng: A101
  📝 Mô tả: Điều hòa không lạnh, có tiếng kêu to
  📅 Học kỳ: HK1 (2025-2026)
  
  Bạn có đồng ý không?
  ```
- Sinh viên: "Đồng ý"

**Bước 6: Lưu vào database và thông báo**
- Backend gọi `dormitoryRequestRepository.createRequest()` để lưu yêu cầu
- Tự động sinh mã yêu cầu (KTX16, KTX17,...)
- Gửi thông báo In-app và Email cho sinh viên
- Bot phản hồi:
  ```
  ✅ Đã tạo yêu cầu sửa chữa thành công!
  
  📋 Mã yêu cầu: KTX16
  🔧 Thiết bị: Điều hòa - Phòng A101
  📝 Mô tả: Điều hòa không lạnh, có tiếng kêu to
  ⏳ Trạng thái: Chờ xử lý
  
  📬 Nhân viên KTX sẽ xử lý sớm nhất có thể.
  Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
  ```

### 6.4. Cập nhật realtime vào danh sách yêu cầu

#### 6.4.1. Vấn đề
Khi sinh viên tạo yêu cầu KTX qua chatbot, các trang liên quan cần được cập nhật ngay lập tức:
- Trang "Lịch sử yêu cầu KTX" của sinh viên
- Trang "Quản lý yêu cầu KTX" của nhân viên

#### 6.4.2. Giải pháp: Socket.IO Event
Sau khi tạo yêu cầu thành công qua chatbot:

1. **Backend emit event**:
   ```javascript
   io.emit('DORMITORY_REQUEST_CREATED', {
     request: {
       _id: newRequest._id,
       requestCode: 'KTX16',
       category: { name: 'Sửa chữa trang thiết bị' },
       equipment: { name: 'Điều hòa' },
       description: 'Điều hòa không lạnh, có tiếng kêu to',
       semester: 'HK1 (2025-2026)',
       status: 'CHỜ XỬ LÝ',
       student: { fullName: 'Nguyễn Văn A', room: 'A101', ... }
     },
     studentId: '...',
     message: 'Có yêu cầu KTX mới'
   });
   ```

2. **Frontend lắng nghe event**:
   - Component `HistoryDormitory.jsx` (trang lịch sử của sinh viên) subscribe event
   - Component `StaffDormitoryRequests.jsx` (trang quản lý của staff) subscribe event

3. **Cập nhật UI ngay lập tức**:
   - Thêm yêu cầu mới vào đầu danh sách (không cần gọi API lại)
   - Hiển thị badge "Mới" hoặc highlight để nổi bật
   - Cập nhật số lượng yêu cầu và badge thông báo

#### 6.4.3. Lợi ích
- **Trải nghiệm liền mạch**: Sinh viên tạo xong qua chatbot → chuyển sang trang lịch sử → thấy ngay yêu cầu vừa tạo
- **Đồng bộ đa thiết bị**: Nếu sinh viên mở cùng lúc trên 2 tab → cả 2 đều cập nhật
- **Staff được thông báo ngay**: Nhân viên KTX đang xem danh sách sẽ thấy yêu cầu mới xuất hiện tức thì, có thể xử lý ngay

### 6.5. Xử lý các trường hợp đặc biệt

#### 6.5.1. Sinh viên không ở KTX
```
Sinh viên: Tôi muốn báo hỏng điều hòa
Bot: Xin lỗi, bạn chưa đăng ký ở Ký túc xá nên không thể tạo yêu cầu sửa chữa.
     Bạn có muốn đăng ký ở KTX không?
```

#### 6.5.2. Sinh viên nhập không rõ ràng
```
Sinh viên: Cái gì đó bị hỏng
Bot: Bạn có thể cho tôi biết cụ thể thiết bị nào bị hỏng không?
     Ví dụ: điều hòa, quạt, bình nóng lạnh, đèn,...
```

#### 6.5.3. Sinh viên muốn hủy giữa chừng
```
Sinh viên: Thôi không cần nữa
Bot: Đã hủy yêu cầu. Bạn có thể bắt đầu lại bất cứ lúc nào.
```

#### 6.5.4. Lỗi hệ thống
```
Bot: Xin lỗi, có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại sau hoặc sử dụng form tạo yêu cầu truyền thống.
```

### 6.6. Luồng hội thoại mẫu hoàn chỉnh

#### Ví dụ 1: Báo hỏng thiết bị

```
Bot: Xin chào! Tôi là trợ lý ảo UniHelper. Tôi có thể giúp bạn:
     - Tạo yêu cầu giấy tờ CTSV
     - Báo hỏng thiết bị KTX
     - Đăng ký ở KTX
     
     Bạn cần hỗ trợ gì?

Sinh viên: Điều hòa phòng tôi bị hỏng

Bot: Tôi sẽ giúp bạn tạo yêu cầu sửa chữa điều hòa.
     Điều hòa bị hỏng như thế nào? Vui lòng mô tả chi tiết.

Sinh viên: Điều hòa không lạnh, bật lên có tiếng kêu rất to

Bot: Tôi đã ghi nhận. Bạn ở phòng A101 đúng không?

Sinh viên: Đúng rồi

Bot: Xác nhận tạo yêu cầu sửa chữa:
     🔧 Thiết bị: Điều hòa
     🏠 Phòng: A101
     📝 Mô tả: Điều hòa không lạnh, bật lên có tiếng kêu rất to
     📅 Học kỳ: HK1 (2025-2026)
     
     Bạn có đồng ý không? (Có/Không)

Sinh viên: Có

Bot: ✅ Đã tạo yêu cầu sửa chữa thành công!
     
     📋 Mã yêu cầu: KTX16
     🔧 Thiết bị: Điều hòa - Phòng A101
     📝 Mô tả: Điều hòa không lạnh, bật lên có tiếng kêu rất to
     ⏳ Trạng thái: Chờ xử lý
     
     📬 Nhân viên KTX sẽ xử lý sớm nhất có thể.
     Bạn sẽ nhận được email và thông báo khi yêu cầu được xử lý.
     
     Bạn cần hỗ trợ gì thêm không?
```

#### Ví dụ 2: Đăng ký ở KTX

```
Sinh viên: Tôi muốn đăng ký ở ký túc xá

Bot: Tôi sẽ giúp bạn đăng ký ở KTX.
     Bạn muốn đăng ký cho học kỳ nào?

Sinh viên: Học kỳ 2 năm 2025-2026

Bot: Bạn có yêu cầu gì đặc biệt về phòng không? 
     (Ví dụ: muốn ở một mình, ở chung với bạn cụ thể, tầng thấp,...)

Sinh viên: Tôi muốn ở chung phòng với bạn Trần Văn B

Bot: Xác nhận tạo yêu cầu đăng ký KTX:
     📋 Loại: Đăng ký ở KTX
     📅 Học kỳ: HK2 (2025-2026)
     📝 Yêu cầu: Muốn ở chung phòng với Trần Văn B
     
     Bạn có đồng ý không?

Sinh viên: Đồng ý

Bot: ✅ Đã tạo yêu cầu đăng ký KTX thành công!
     
     📋 Mã yêu cầu: KTX17
     📋 Loại: Đăng ký ở KTX
     📅 Học kỳ: HK2 (2025-2026)
     📝 Yêu cầu: Muốn ở chung phòng với Trần Văn B
     ⏳ Trạng thái: Chờ xử lý
     
     📬 Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
     
     Bạn cần hỗ trợ gì thêm không?
```

### 6.7. Các Intent KTX được hỗ trợ

| Intent | Mô tả | Yêu cầu thông tin |
|--------|-------|-------------------|
| `ktx.repair.start` | Báo hỏng, yêu cầu sửa chữa | equipment, description, room (nếu cần) |
| `ktx.register` | Đăng ký ở KTX | semester, special_request (optional) |
| `ktx.extend` | Gia hạn hợp đồng KTX | semester |
| `ktx.cancel` | Chấm dứt hợp đồng KTX | reason |
| `ktx.service` | Yêu cầu dịch vụ khác | description, semester |
| `ktx.info` | Hỏi thông tin về KTX | - |

---

## 7. Quản lý trang thiết bị

### 7.1. Danh sách thiết bị được quản lý
Module KTX quản lý các loại thiết bị phổ biến trong phòng ký túc xá:
- Điều hòa
- Quạt trần / Quạt đứng
- Bình nóng lạnh
- Đèn chiếu sáng
- Ổ cắm điện
- Cửa ra vào / Cửa sổ
- Bồn cầu / Lavabo
- Vòi nước
- Tủ đựng đồ
- Giường tầng

### 7.2. Luồng sửa chữa thiết bị
1. Sinh viên báo hỏng (qua form hoặc chatbot)
2. Hệ thống ghi nhận thiết bị và phòng
3. Nhân viên KTX nhận yêu cầu
4. Nhân viên kiểm tra và sửa chữa
5. Cập nhật trạng thái hoàn tất
6. Thông báo cho sinh viên

---

## 8. Kiến trúc kỹ thuật

### 8.1. Backend (Node.js + Express)
```
├── controllers/
│   └── dormitoryController.js           # Xử lý HTTP request
├── services/
│   ├── dormitoryRequestService.js       # Business logic
│   ├── studentNotificationService.js    # Thông báo In-app
│   └── emailService.js                  # Gửi email
├── repositories/
│   └── dormitoryRequestRepository.js    # Truy vấn database
└── models/
    ├── DormitoryRequest.js              # Schema yêu cầu KTX
    ├── Room.js                          # Schema phòng
    ├── Equipment.js                     # Schema thiết bị
    └── StudentNotification.js           # Thông báo
```

### 8.2. Frontend (React + Vite)
```
├── components/
│   ├── student/
│   │   └── history-dormitory/           # Lịch sử yêu cầu KTX
│   ├── staff/
│   │   └── dormitory/                   # Quản lý yêu cầu KTX
│   └── common/
│       └── NotificationDropdown/        # Dropdown thông báo
└── services/
    ├── dormitoryRequest.js              # API calls
    ├── studentNotification.js           # API thông báo
    └── socket.js                        # Socket.IO client
```

### 8.3. Database Schema (MongoDB)

**DormitoryRequest Schema:**
```javascript
{
  requestCode: String,        // Mã yêu cầu: KTX1, KTX2,...
  student: ObjectId,          // Ref -> Student
  category: ObjectId,         // Ref -> Category (Danh mục yêu cầu)
  equipment: ObjectId,        // Ref -> Equipment (Thiết bị - optional)
  description: String,        // Mô tả chi tiết
  semester: String,           // Học kỳ
  status: String,             // Trạng thái
  staffAssigned: ObjectId,    // Ref -> Staff
  notes: String,              // Ghi chú từ staff
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. So sánh với Module CTSV

| Tiêu chí | Module CTSV | Module KTX |
|----------|-------------|------------|
| Đối tượng | Tất cả sinh viên | Sinh viên ở KTX |
| Loại yêu cầu | Giấy tờ, chứng nhận | Sửa chữa, dịch vụ, đăng ký |
| Prefix mã | CTSV | KTX |
| Trạng thái | ĐANG XỬ LÝ / HỢP LỆ / KHÔNG HỢP LỆ | CHỜ XỬ LÝ / ĐANG XỬ LÝ / ĐÃ XỬ LÝ / TỪ CHỐI |
| File đính kèm | Có (giấy xác nhận) | Không |
| Liên kết thiết bị | Không | Có |
| Thông báo | In-app + Email | In-app + Email |
| Chatbot | Có | Có |

---

## 10. Tổng kết

Module KTX cung cấp một giải pháp toàn diện cho việc quản lý yêu cầu ký túc xá với các điểm nổi bật:

1. **Đa dạng loại yêu cầu**: Hỗ trợ từ đăng ký ở KTX đến sửa chữa thiết bị
2. **Đa kênh tương tác**: Sinh viên có thể tạo yêu cầu qua form hoặc chatbot AI
3. **Thông báo đa kênh**: Kết hợp In-app notification và Email để đảm bảo sinh viên không bỏ lỡ thông tin
4. **Realtime updates**: Sử dụng Socket.IO để cập nhật trạng thái tức thì
5. **Quản lý thiết bị**: Liên kết yêu cầu với thiết bị cụ thể để dễ theo dõi bảo trì
6. **Theo dõi lịch sử**: Lưu trữ đầy đủ lịch sử xử lý, cho phép audit và tra cứu
7. **Tích hợp với hệ thống phòng**: Kết nối với thông tin phòng để quản lý hiệu quả
