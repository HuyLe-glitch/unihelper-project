# 🚀 HƯỚNG DẪN CÀI ĐẶT DIALOGFLOW ES CHO UNIHELPER CHATBOT

## 📋 Mục lục
1. [Tạo Dialogflow Agent](#1-tạo-dialogflow-agent)
2. [Tạo Entities](#2-tạo-entities)
3. [Tạo Intents](#3-tạo-intents)
4. [Cấu hình Service Account](#4-cấu-hình-service-account)
5. [Kết nối Backend](#5-kết-nối-backend)

---

## 1. Tạo Dialogflow Agent

### Bước 1.1: Truy cập Dialogflow Console
1. Vào [Dialogflow ES Console](https://dialogflow.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google

### Bước 1.2: Tạo Agent mới
1. Click **Create Agent**
2. Điền thông tin:
   - **Agent name**: `UniHelper-Chatbot`
   - **Default language**: `Vietnamese - vi`
   - **Default time zone**: `(GMT+7:00) Asia/Ho_Chi_Minh`
   - **Google Project**: Chọn project có sẵn hoặc tạo mới
3. Click **CREATE**

> 📝 **Lưu ý**: Ghi nhớ **Project ID** (ví dụ: `unihelper-lkxr`) để cấu hình backend sau.

---

## 2. Tạo Entities

Entities là các đối tượng dữ liệu mà Dialogflow sẽ trích xuất từ câu hỏi của người dùng.

### 2.1. Entity: `certificate_type` (Loại chứng nhận)

1. Vào **Entities** → Click **"+"** hoặc **Create Entity**
2. Đặt tên: `certificate_type`
3. Tick ✅ **Define synonyms**
4. Thêm các entries:

| Reference Value | Synonyms |
|-----------------|----------|
| Xác nhận sinh viên | xác nhận sinh viên, xác nhận sv, giấy xác nhận |
| Bảng điểm | bảng điểm, điểm, bảng điểm học kỳ |
| Nghĩa vụ quân sự | nghĩa vụ quân sự, quân sự, nvqs, hoãn quân sự |
| Thẻ sinh viên | thẻ sinh viên, thẻ sv, làm thẻ |
| Bổ sung hồ sơ chế độ chính sách | chế độ chính sách, chính sách, hồ sơ chính sách |
| Bổ sung hồ sơ cá nhân | hồ sơ cá nhân, bổ sung hồ sơ |

5. Click **SAVE**

### 2.2. Entity: `certificate_name` (Tên chứng nhận cụ thể)

1. Tạo entity mới: `certificate_name`
2. Tick ✅ **Define synonyms**
3. Thêm các entries:

| Reference Value | Synonyms |
|-----------------|----------|
| Bổ sung hồ sơ cá nhân | bổ sung hồ sơ cá nhân |
| Tạm hoãn nghĩa vụ quân sự | tạm hoãn nghĩa vụ quân sự, hoãn nghĩa vụ |
| Mẫu số 41 dành cho con thương binh, bệnh binh, người hưởng chính sách như thương binh | mẫu số 41 |
| Đăng ký thẻ tạm | đăng ký thẻ tạm, thẻ tạm |
| Xác nhận sinh viên | xác nhận sinh viên |

4. Click **SAVE**

### 2.3. Entity: `purpose` (Mục đích sử dụng)

1. Tạo entity mới: `purpose`
2. Tick ✅ **Define synonyms**
3. Thêm các entries:

| Reference Value | Synonyms |
|-----------------|----------|
| giam_tru_gia_canh | giảm trừ gia cảnh, giảm thuế, thuế tncn, người phụ thuộc, kê khai thuế |
| nghia_vu_quan_su | nghĩa vụ quân sự, quân sự, nhập ngũ, hoãn nghĩa vụ, đi bộ đội |
| che_do_chinh_sach | chế độ chính sách, hộ nghèo, cận nghèo, vùng khó khăn, dân tộc thiểu số |
| the_sinh_vien | thẻ sinh viên, làm thẻ, cấp thẻ, mất thẻ, thẻ sv |
| xin_viec | xin việc, xin việc làm, thực tập, tuyển dụng |
| xin_visa | xin visa, du học, đi nước ngoài, xuất cảnh |
| hoc_bong | học bổng, xin học bổng, đăng ký học bổng |

4. Click **SAVE**

### 2.4. Entity: `equipment_category` (Loại thiết bị - KTX)

| Reference Value | Synonyms |
|-----------------|----------|
| điện | điện, hệ thống điện |
| nước | nước, hệ thống nước |
| điều hòa | điều hòa, máy lạnh |
| quạt | quạt, quạt trần, quạt điện |

### 2.5. Entity: `equipment_item` (Tên thiết bị cụ thể)

| Reference Value | Synonyms |
|-----------------|----------|
| đèn | đèn, bóng đèn, đèn phòng |
| ổ cắm | ổ cắm, ổ điện |
| vòi nước | vòi nước, vòi rửa |
| bồn rửa | bồn rửa, lavabo |

---

## 3. Tạo Intents

### 3.1. Intent: `ctsv.kiem_tra` (Kiểm tra trạng thái yêu cầu CTSV)

1. Vào **Intents** → Click **"+"**
2. Đặt tên: `ctsv.kiem_tra`

#### Training Phrases:
```
Tình trạng xin @certificate_type:certificate_type
Kiểm tra yêu cầu @certificate_name:certificate_name
Kiểm tra yêu cầu @certificate_type:certificate_type
trạng thái yêu cầu nghĩa vụ quân sự của tôi
kiểm tra giấy xác nhận sinh viên
yêu cầu ctsv duyệt chưa
giấy xác nhận của tôi đến đâu rồi
trạng thái giấy tờ
kiểm tra yêu cầu ctsv
```

> ⚠️ **Quan trọng**: Khi gõ training phrase có entity, text sẽ tự động highlight. Click vào phần highlight để gán đúng entity.

#### Action and Parameters:

| REQUIRED | PARAMETER NAME | ENTITY | VALUE |
|----------|----------------|--------|-------|
| ☐ | certificate_type | @certificate_type | $certificate_type |
| ☐ | certificate_name | @certificate_name | $certificate_name |

#### Responses:
```
Đang kiểm tra trạng thái yêu cầu của bạn...
```

3. Click **SAVE**

### 3.2. Intent: `ctsv.tu_van` (Tư vấn giấy tờ)

1. Tạo intent: `ctsv.tu_van`

#### Training Phrases:
```
tôi cần giấy để @purpose:purpose
tôi muốn làm giấy @purpose:purpose
cần giấy tờ cho @purpose:purpose
tư vấn giấy tờ
tôi cần giấy gì để giảm trừ gia cảnh
làm giấy nghĩa vụ quân sự
cần giấy xin việc
giấy tờ du học
```

#### Action and Parameters:

| REQUIRED | PARAMETER NAME | ENTITY | VALUE |
|----------|----------------|--------|-------|
| ☐ | purpose | @purpose | $purpose |

#### Responses:
```
Để tôi tư vấn giấy tờ phù hợp cho bạn...
```

3. Click **SAVE**

### 3.3. Intent: `ktx.kiem_tra` (Kiểm tra báo cáo sự cố)

1. Tạo intent: `ktx.kiem_tra`

#### Training Phrases:
```
kiểm tra báo cáo sự cố @equipment_category:equipment_category
trạng thái sửa chữa @equipment_item:equipment_item
báo cáo sự cố của tôi đến đâu
kiểm tra yêu cầu sửa điện
tình trạng báo cáo ktx
```

#### Action and Parameters:

| REQUIRED | PARAMETER NAME | ENTITY | VALUE |
|----------|----------------|--------|-------|
| ☐ | equipment_category | @equipment_category | $equipment_category |
| ☐ | equipment_item | @equipment_item | $equipment_item |

### 3.4. Intent: `kiem_tra.chung` (Kiểm tra chung)

1. Tạo intent: `kiem_tra.chung`

#### Training Phrases (CHỈ những câu rất chung):
```
kiểm tra trạng thái
xem yêu cầu của tôi
trạng thái
tình trạng yêu cầu
```

> ⚠️ **Lưu ý**: KHÔNG thêm các câu cụ thể về CTSV hoặc KTX vào đây để tránh conflict.

#### Responses:
```
📋 KIỂM TRA TRẠNG THÁI YÊU CẦU

Bạn muốn kiểm tra loại yêu cầu nào?

1️⃣ Yêu cầu CTSV (giấy tờ, chứng nhận)
2️⃣ Báo cáo sự cố KTX (thiết bị)
```

### 3.5. Các Intent FAQ

#### `faq.gio_lam_viec`:
```
Training: giờ làm việc, mấy giờ mở cửa, thời gian làm việc
Response: 🕐 GIỜ LÀM VIỆC
- Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00
- Thứ 7: 7:30 - 11:30
- Chủ nhật: Nghỉ
```

#### `faq.lien_he`:
```
Training: liên hệ, số điện thoại, email, địa chỉ
Response: 📞 THÔNG TIN LIÊN HỆ
- Hotline: 028 1234 5678
- Email: ctsv@university.edu.vn
- Địa chỉ: Phòng A123, Tòa nhà ABC
```

---

## 4. Cấu hình Service Account

### Bước 4.1: Tạo Service Account
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của Dialogflow Agent
3. Vào **IAM & Admin** → **Service Accounts**
4. Click **CREATE SERVICE ACCOUNT**
5. Điền:
   - Name: `dialogflow-client`
   - ID: `dialogflow-client`
6. Click **CREATE AND CONTINUE**

### Bước 4.2: Gán quyền
1. Chọn role: **Dialogflow API Client**
2. Click **CONTINUE** → **DONE**

### Bước 4.3: Tạo Key
1. Click vào service account vừa tạo
2. Vào tab **KEYS**
3. Click **ADD KEY** → **Create new key**
4. Chọn **JSON** → **CREATE**
5. File JSON sẽ tự động download

### Bước 4.4: Đặt file key vào project
1. Đổi tên file thành: `dialogflow-service-account.json`
2. Copy vào: `backend/src/config/dialogflow-service-account.json`

---

## 5. Kết nối Backend

### Bước 5.1: Cài đặt package
```bash
cd backend
npm install @google-cloud/dialogflow
```

### Bước 5.2: Cấu hình biến môi trường
Thêm vào file `.env`:
```env
DIALOGFLOW_PROJECT_ID=unihelper-lkxr
```

### Bước 5.3: Kiểm tra kết nối
```bash
npm run dev
```

Khi khởi động, console sẽ hiển thị:
```
✅ Dialogflow client initialized with service account file
```

---

## ⚠️ Lưu ý quan trọng

### Sau mỗi lần thay đổi trong Dialogflow Console:
1. Click **SAVE** (góc trên phải)
2. Đợi nút **TRAIN** xuất hiện
3. Click **TRAIN** và đợi hoàn tất

### Tránh conflict giữa các Intent:
- Intent cụ thể (như `ctsv.kiem_tra`) nên có training phrases cụ thể
- Intent chung (như `kiem_tra.chung`) chỉ nên có những câu rất chung
- Nếu 2 intent có training phrases giống nhau → Dialogflow sẽ chọn sai

### Best Practices:
- Mỗi intent nên có ít nhất 5-10 training phrases
- Sử dụng cả câu tổng quát (với @entity) và câu cụ thể
- Test kỹ trong Dialogflow Console trước khi test trên app

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log backend: `console.log` sẽ hiển thị intent và parameters
2. Test trong Dialogflow Console: Sử dụng panel **Try it now** bên phải
3. Kiểm tra Training status: Đảm bảo agent đã được TRAIN
