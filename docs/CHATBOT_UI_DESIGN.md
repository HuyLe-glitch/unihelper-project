# 🤖 UniHelper Chatbot - Thiết Kế Giao Diện (UI/UX Design)

## 📋 Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Các Chức Năng Chatbot](#2-các-chức-năng-chatbot)
3. [Thiết Kế Giao Diện Tổng Thể](#3-thiết-kế-giao-diện-tổng-thể)
4. [Thiết Kế Chi Tiết Từng Thành Phần](#4-thiết-kế-chi-tiết-từng-thành-phần)
5. [Thiết Kế Theo Chức Năng](#5-thiết-kế-theo-chức-năng)
6. [Responsive Design](#6-responsive-design)
7. [Trải Nghiệm Người Dùng (UX)](#7-trải-nghiệm-người-dùng-ux)
8. [Nguyên Tắc Thiết Kế](#8-nguyên-tắc-thiết-kế)
9. [Accessibility](#9-accessibility)

---

## 1. Tổng Quan

### 1.1. Mục Đích Chatbot

UniHelper Chatbot là **trợ lý ảo thông minh** được xây dựng nhằm hỗ trợ sinh viên trong việc:

- 🎯 **Tiết kiệm thời gian** - Trả lời câu hỏi ngay lập tức 24/7, không cần chờ đợi giờ hành chính
- 🎯 **Tra cứu nhanh** - Kiểm tra trạng thái yêu cầu KTX, giấy tờ mà không cần navigate qua nhiều trang
- 🎯 **Hướng dẫn trực quan** - Cung cấp hướng dẫn từng bước cho các thủ tục hành chính
- 🎯 **Giảm tải công việc** - Tự động hóa các câu hỏi thường gặp, giảm áp lực cho nhân viên CTSV
- 🎯 **Trải nghiệm hiện đại** - Giao tiếp tự nhiên như chat với người thật

### 1.2. Đối Tượng Sử Dụng

> ⚠️ **Lưu ý quan trọng:** Chatbot chỉ khả dụng cho **người dùng đã đăng nhập** vào hệ thống.

| Đối tượng | Nhu cầu chính |
|-----------|---------------|
| **Sinh viên** | Hỏi đáp thông tin, kiểm tra trạng thái yêu cầu, được hướng dẫn tạo yêu cầu mới |
| **Nhân viên** | Hỗ trợ tra cứu nhanh thông tin, quy trình |

### 1.3. Nguyên Tắc Thiết Kế Chung

- ✅ **Đơn giản, trực quan** - Sinh viên dễ dàng sử dụng ngay lần đầu
- ✅ **Phản hồi nhanh** - Trả lời tức thì, không để người dùng chờ đợi
- ✅ **Không gây cản trở** - Chatbot phải ẩn đi hoặc trong suốt khi không sử dụng
- ✅ **Linh hoạt vị trí** - Cho phép người dùng kéo thả để di chuyển vị trí chatbot
- ✅ **Nhất quán** - Phù hợp với design system tổng thể của UniHelper
- ✅ **Mobile-friendly** - Hoạt động tốt trên mọi thiết bị

---

## 2. Các Chức Năng Chatbot

### 2.1. Danh Sách Chức Năng

| # | Chức năng | Loại | Mô tả |
|---|-----------|------|-------|
| 1 | Hỏi đáp thông tin chung (FAQ) | Text Response | Trả lời các câu hỏi về giờ làm việc, liên hệ, quy định... |
| 2 | Hướng dẫn đăng ký KTX | Text Response | Hướng dẫn từng bước quy trình đăng ký ký túc xá |
| 3 | Hướng dẫn xin giấy tờ | Text Response | Hướng dẫn thủ tục xin các loại giấy tờ, chứng chỉ |
| 4 | Kiểm tra trạng thái yêu cầu KTX | Data Query | Tra cứu trạng thái các yêu cầu KTX của sinh viên |
| 5 | Kiểm tra trạng thái yêu cầu CTSV | Data Query | Tra cứu trạng thái các yêu cầu giấy tờ |
| 6 | Hỗ trợ tạo yêu cầu mới | Form/Action | Hướng dẫn và điều hướng đến trang tạo yêu cầu |

### 2.2. Phân Loại UI Cần Thiết

```
┌─────────────────────────────────────────────────────────────┐
│                    LOẠI GIAO DIỆN                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📝 Text Response          📊 Data Display        🔘 Action  │
│  ├── FAQ                   ├── Status Card        ├── Quick │
│  ├── Hướng dẫn             ├── Request Info           Reply │
│  └── Thông báo             └── List/Table         ├── Button│
│                                                   └── Form  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Thiết Kế Giao Diện Tổng Thể

### 3.1. Layout Chatbot Window

```
┌────────────────────────────────────────┐
│  ┌──────────────────────────────────┐  │
│  │         🤖 HEADER                │  │
│  │   Avatar | Title | Status | [X]  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │         📨 MESSAGES AREA         │  │
│  │                                  │  │
│  │   Bot: Welcome message           │  │
│  │                    User: Hello   │  │
│  │   Bot: Response...               │  │
│  │                                  │  │
│  │   ┌─────────────────────────┐    │  │
│  │   │   📋 QUICK REPLIES      │    │  │
│  │   │   [KTX] [Giấy tờ] [FAQ] │    │  │
│  │   └─────────────────────────┘    │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │         ⌨️ INPUT AREA            │  │
│  │   [        Message...      ][➤] │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         ↑
    Floating Button (khi đóng)
         💬
```

### 3.2. Kích Thước Chuẩn

| Thiết bị | Chiều rộng | Chiều cao |
|----------|------------|-----------|
| **Desktop** | 380px | 520px |
| **Tablet** | 380px | 480px |
| **Mobile** | 100% - 32px | 100vh - 100px |

### 3.3. Vị Trí & Hành Vi Chatbot

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    MAIN CONTENT                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                    ┌────┐  │
│                                                    │ 💬 │ ←── Có thể kéo thả
│                                                    └────┘     di chuyển vị trí
└────────────────────────────────────────────────────────────┘
                                                      ↑
                                            Vị trí mặc định:
                                            Bottom-right corner
```

### 3.4. Tính Năng Ẩn/Hiện & Kéo Thả

#### Yêu Cầu Về Hành Vi:

| Tính năng | Mô tả |
|-----------|-------|
| **Trong suốt khi không dùng** | Khi người dùng không tương tác, nút chatbot sẽ giảm độ đậm (opacity) để không gây cản trở việc xem nội dung chính |
| **Ẩn vào góc** | Có thể thu nhỏ hoặc ẩn chatbot vào một góc màn hình, chỉ hiện icon nhỏ |
| **Kéo thả (Draggable)** | Người dùng có thể kéo nút chatbot đến vị trí mong muốn (góc trái, góc phải, trên, dưới) |
| **Nhớ vị trí** | Lưu vị trí người dùng đã chọn vào localStorage để giữ nguyên khi reload trang |
| **Snap to edges** | Khi thả ra, nút chatbot sẽ tự động "dính" vào cạnh gần nhất của màn hình |

#### Trạng Thái Hiển Thị:

```
Trạng thái 1: IDLE (Không tương tác > 5 giây)
┌─────────────────────────────────┐
│                                 │
│                         ┌────┐  │
│                         │ 💬 │  │  ← Opacity: 50-70%
│                         └────┘  │    Kích thước nhỏ hơn
│                                 │
└─────────────────────────────────┘

Trạng thái 2: HOVER (Di chuột lên)
┌─────────────────────────────────┐
│                                 │
│                         ┌────┐  │
│                         │ 💬 │  │  ← Opacity: 100%
│                         └────┘  │    Hiện tooltip "Chat với UniHelper"
│                                 │
└─────────────────────────────────┘

Trạng thái 3: DRAGGING (Đang kéo)
┌─────────────────────────────────┐
│                                 │
│         ┌────┐                  │
│         │ 💬 │ ←── Có thể kéo  │
│         └────┘      đến bất kỳ │
│                     vị trí nào  │
└─────────────────────────────────┘

Trạng thái 4: OPEN (Mở cửa sổ chat)
┌─────────────────────────────────┐
│                                 │
│         ┌──────────────────┐    │
│         │   Chat Window    │    │
│         │                  │    │
│         │                  │    │
│         └──────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## 4. Thiết Kế Chi Tiết Từng Thành Phần

### 4.1. Header

```
┌────────────────────────────────────────────────────────────┐
│  ┌────┐                                              ┌───┐ │
│  │ 🤖 │  UniHelper Bot                               │ ✕ │ │
│  └────┘  🟢 Online                                   └───┘ │
│  Avatar  Title + Status                              Close │
└────────────────────────────────────────────────────────────┘

• Background: Gradient (#1890ff → #096dd9)
• Height: 64px
• Avatar: 40px, border-radius: 50%
• Title: 16px, font-weight: 600, color: white
• Status: 12px, opacity: 0.9
• Close button: 32px, color: white
```

### 4.2. Message Bubbles

#### Bot Message (Tin nhắn từ Bot)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌────┐  ┌───────────────────────────────────┐  │
│  │ 🤖 │  │  Xin chào! Mình là UniHelper Bot  │  │
│  └────┘  │  Mình có thể giúp gì cho bạn?     │  │
│          └───────────────────────────────────┘  │
│  Avatar              Message Bubble             │
│                                                 │
└─────────────────────────────────────────────────┘

• Avatar: 28px, margin-right: 8px
• Bubble: background: #ffffff, border-radius: 12px 12px 12px 4px
• Shadow: 0 1px 2px rgba(0,0,0,0.1)
• Padding: 12px 16px
• Max-width: 75%
• Font-size: 14px
• Line-height: 1.5
```

#### User Message (Tin nhắn từ User)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────┐  ┌────┐  │
│  │  Tôi muốn kiểm tra yêu cầu KTX   │  │ 👤 │  │
│  └───────────────────────────────────┘  └────┘  │
│              Message Bubble             Avatar  │
│                                                 │
└─────────────────────────────────────────────────┘

• Bubble: background: #1890ff, color: white
• Border-radius: 12px 12px 4px 12px
• Avatar: 28px, margin-left: 8px, background: #52c41a
```

### 4.3. Quick Replies (Gợi Ý Nhanh)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ 🏠 KTX  │ │ 📄 Giấy tờ  │ │ ❓ Hỏi đáp    │  │
│  └─────────┘ └─────────────┘ └───────────────┘  │
│                                                 │
│  ┌───────────────┐ ┌────────────────────────┐   │
│  │ 📋 Trạng thái │ │ 📞 Liên hệ             │   │
│  └───────────────┘ └────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘

• Container: horizontal scroll (mobile), wrap (desktop)
• Button: border: 1px solid #d9d9d9, border-radius: 16px
• Padding: 6px 12px
• Font-size: 13px
• Hover: border-color: #1890ff, color: #1890ff
• Active: background: #1890ff, color: white
```

### 4.4. Input Area

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────────────────────────────────┐ ┌───┐  │
│  │  Nhập tin nhắn...                   │ │ ➤ │  │
│  └─────────────────────────────────────┘ └───┘  │
│           Input Field                    Send   │
│                                                 │
└─────────────────────────────────────────────────┘

• Container: padding: 16px, background: white, border-top: 1px solid #e8e8e8
• Input: border-radius: 20px, padding: 8px 16px
• Placeholder: "Nhập tin nhắn...", color: #bfbfbf
• Send button: 32px, border-radius: 50%, background: #1890ff
• Disabled state: opacity: 0.5
```

### 4.5. Floating Toggle Button

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                      ┌────────┐ │
│                                      │   💬   │ │
│                                      │        │ │
│                                      └────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘

• Size: 60px x 60px
• Border-radius: 50%
• Background: #1890ff
• Icon: MessageOutlined, 24px, white
• Shadow: 0 4px 12px rgba(0,0,0,0.15)
• Hover: scale(1.05), shadow increase
• Badge (unread): top-right, 8px, red
```

---

## 5. Thiết Kế Theo Chức Năng

### 5.1. FAQ Response (Hỏi Đáp Thông Tin)

**Use case:** Hỏi giờ làm việc, liên hệ, quy định...

```
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  🕐 GIỜ LÀM VIỆC PHÒNG CTSV              │  │
│  │                                           │  │
│  │  📅 Thứ 2 - Thứ 6: 7:30 - 17:00          │  │
│  │  📅 Thứ 7: 7:30 - 11:30                  │  │
│  │  🚫 Chủ nhật: Nghỉ                       │  │
│  │                                           │  │
│  │  📍 Địa chỉ: Tòa A, Tầng 1               │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────┐ ┌───────────────┐            │
│  │ 📞 Liên hệ   │ │ 🗺️ Xem bản đồ │            │
│  └──────────────┘ └───────────────┘            │
│       Quick Action Buttons                      │
└─────────────────────────────────────────────────┘

Đặc điểm:
• Sử dụng emoji để tăng tính trực quan
• Thông tin được format rõ ràng, dễ đọc
• Quick action buttons cho hành động tiếp theo
```

### 5.2. Hướng Dẫn (Step-by-Step Guide)

**Use case:** Hướng dẫn đăng ký KTX, xin giấy tờ...

```
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  🏠 HƯỚNG DẪN ĐĂNG KÝ KTX                 │  │
│  │                                           │  │
│  │  📋 Điều kiện:                            │  │
│  │  ✅ Sinh viên đang học tại trường         │  │
│  │  ✅ Không vi phạm nội quy KTX             │  │
│  │                                           │  │
│  │  📝 Các bước:                             │  │
│  │  1️⃣ Đăng nhập UniHelper                  │  │
│  │  2️⃣ Vào "Yêu cầu KTX"                    │  │
│  │  3️⃣ Click "Tạo yêu cầu mới"              │  │
│  │  4️⃣ Điền thông tin & gửi                 │  │
│  │                                           │  │
│  │  ⏱️ Thời gian: 3-5 ngày làm việc          │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌────────────────────────────────────────┐     │
│  │  ➡️ Đăng ký KTX ngay                    │     │
│  └────────────────────────────────────────┘     │
│       Primary Action Button                     │
└─────────────────────────────────────────────────┘

Đặc điểm:
• Numbered steps (1️⃣ 2️⃣ 3️⃣) để dễ theo dõi
• Checkbox ✅ cho điều kiện
• Primary action button để navigate
```

### 5.3. Kiểm Tra Trạng Thái (Status Card)

**Use case:** Xem trạng thái yêu cầu KTX/CTSV

```
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  📋 TRẠNG THÁI YÊU CẦU KTX               │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Mã yêu cầu    │  KTX-2026-0042     │  │  │
│  │  ├─────────────────────────────────────┤  │  │
│  │  │  Ngày tạo      │  04/01/2026        │  │  │
│  │  ├─────────────────────────────────────┤  │  │
│  │  │  Học kỳ        │  HK2 2025-2026     │  │  │
│  │  ├─────────────────────────────────────┤  │  │
│  │  │  Loại phòng    │  4 người           │  │  │
│  │  ├─────────────────────────────────────┤  │  │
│  │  │  Trạng thái    │  🟡 Chờ xử lý      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ⏱️ Dự kiến xử lý: 3-5 ngày làm việc     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────┐ ┌────────────────────────┐     │
│  │ 📜 Chi tiết │ │ 🔄 Kiểm tra lại        │     │
│  └─────────────┘ └────────────────────────┘     │
└─────────────────────────────────────────────────┘

Đặc điểm:
• Card layout với border
• Table-like format cho dữ liệu
• Status badge với màu sắc (🟡🟢🔴)
• Action buttons
```

#### Status Badge Colors

| Trạng thái | Emoji | Background | Text |
|------------|-------|------------|------|
| Chờ xử lý | 🟡 | #fffbe6 | #d48806 |
| Đang xử lý | 🔵 | #e6f7ff | #1890ff |
| Đã duyệt | 🟢 | #f6ffed | #52c41a |
| Từ chối | 🔴 | #fff2f0 | #ff4d4f |
| Hoàn thành | ✅ | #f6ffed | #52c41a |
| Đã hủy | ⚫ | #fafafa | #8c8c8c |

### 5.4. Danh Sách Nhiều Yêu Cầu

**Use case:** Có nhiều yêu cầu cần hiển thị

```
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  📋 BẠN CÓ 3 YÊU CẦU KTX                  │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ 1. KTX-2026-0042                    │  │  │
│  │  │    🟡 Chờ xử lý | 04/01/2026         │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ 2. KTX-2025-0123                    │  │  │
│  │  │    ✅ Hoàn thành | 15/09/2025        │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ 3. KTX-2025-0089                    │  │  │
│  │  │    🔴 Từ chối | 01/03/2025           │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  💡 Nhập số thứ tự để xem chi tiết       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Đặc điểm:
• List format với numbering
• Compact info: mã + status + date
• Clickable items hoặc nhập số để xem chi tiết
```

### 5.5. Yêu Cầu Đăng Nhập

**Use case:** Chức năng cần xác thực

```
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  🔐 YÊU CẦU ĐĂNG NHẬP                     │  │
│  │                                           │  │
│  │  Để kiểm tra trạng thái yêu cầu,          │  │
│  │  bạn cần đăng nhập vào hệ thống.          │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │        🔑 Đăng nhập ngay            │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  📌 Hoặc tiếp tục hỏi đáp không cần      │  │
│  │     đăng nhập với các chủ đề:            │  │
│  │     • Giờ làm việc                       │  │
│  │     • Hướng dẫn đăng ký                  │  │
│  │     • Thông tin liên hệ                  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ Giờ LV     │ │ Hướng dẫn  │ │ Liên hệ    │   │
│  └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────┘

Đặc điểm:
• Thông báo rõ ràng lý do cần đăng nhập
• Nút đăng nhập nổi bật
• Gợi ý các chức năng không cần đăng nhập
```

### 5.6. Form Tạo Yêu Cầu (Conversational Form)

**Use case:** Thu thập thông tin để tạo yêu cầu

```
Bước 1: Hỏi loại phòng
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  🏠 TẠO YÊU CẦU ĐĂNG KÝ KTX              │  │
│  │                                           │  │
│  │  Bạn muốn đăng ký loại phòng nào?        │  │
│  │                                           │  │
│  │  ┌───────────┐ ┌───────────┐             │  │
│  │  │ 4 người   │ │ 6 người   │             │  │
│  │  │ 1.2tr/th  │ │ 900k/th   │             │  │
│  │  └───────────┘ └───────────┘             │  │
│  │                                           │  │
│  │  ┌───────────┐                           │  │
│  │  │ 8 người   │                           │  │
│  │  │ 700k/th   │                           │  │
│  │  └───────────┘                           │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Bước 2: Xác nhận
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  📋 XÁC NHẬN THÔNG TIN                    │  │
│  │                                           │  │
│  │  Loại phòng: 4 người                      │  │
│  │  Học kỳ: HK2 2025-2026                    │  │
│  │  Phí dự kiến: 1.200.000 VNĐ/tháng         │  │
│  │                                           │  │
│  │  Bạn có muốn gửi yêu cầu không?           │  │
│  │                                           │  │
│  │  ┌────────────────┐ ┌────────────────┐    │  │
│  │  │ ✅ Xác nhận    │ │ ❌ Hủy bỏ      │    │  │
│  │  └────────────────┘ └────────────────┘    │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Đặc điểm:
• Conversational flow - hỏi từng bước
• Selection buttons thay vì form input
• Confirmation step trước khi submit
• Cancel option
```

### 5.7. Thông Báo Kết Quả

**Use case:** Hiển thị kết quả hành động

```
Thành công:
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │         ✅ GỬI YÊU CẦU THÀNH CÔNG         │  │
│  │                                           │  │
│  │  Mã yêu cầu: KTX-2026-0043                │  │
│  │                                           │  │
│  │  Chúng tôi sẽ xử lý trong 3-5 ngày        │  │
│  │  làm việc và thông báo kết quả qua        │  │
│  │  email của bạn.                           │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │        📜 Xem chi tiết yêu cầu      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Thất bại:
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │         ❌ KHÔNG THỂ GỬI YÊU CẦU          │  │
│  │                                           │  │
│  │  Lý do: Bạn đã có yêu cầu KTX đang        │  │
│  │  chờ xử lý. Vui lòng đợi kết quả          │  │
│  │  trước khi tạo yêu cầu mới.               │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │   📋 Xem yêu cầu đang chờ           │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 6. Responsive Design

### 6.1. Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                      MAIN CONTENT                              │
│                                                                │
│                                                                │
│                                              ┌──────────────┐  │
│                                              │   Chatbot    │  │
│                                              │   Window     │  │
│                                              │   380x520    │  │
│                                              └──────────────┘  │
└────────────────────────────────────────────────────────────────┘

• Fixed position: bottom-right
• Width: 380px, Height: 520px
• Margin: 24px from edge
```

### 6.2. Tablet (768px - 1023px)

```
┌────────────────────────────────────────────────┐
│                                                │
│                                                │
│              MAIN CONTENT                      │
│                                                │
│                                                │
│                          ┌──────────────────┐  │
│                          │   Chatbot        │  │
│                          │   Window         │  │
│                          │   380x480        │  │
│                          └──────────────────┘  │
└────────────────────────────────────────────────┘

• Width: 380px, Height: 480px
• Margin: 20px from edge
```

### 6.3. Mobile (< 768px)

```
┌─────────────────────────────────┐
│                                 │
│         MAIN CONTENT            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │       Chatbot Window        │ │
│ │       (Full width)          │ │
│ │       100vw - 32px          │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘

• Width: 100% - 32px
• Height: 100vh - 100px (hoặc max 600px)
• Margin: 16px
• Quick replies: horizontal scroll
```

### 6.4. Mobile Keyboard Open

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │         Header              │ │
│ ├─────────────────────────────┤ │
│ │         Messages            │ │
│ │         (shrunk)            │ │
│ ├─────────────────────────────┤ │
│ │         Input               │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│                                 │
│         KEYBOARD               │
│                                 │
└─────────────────────────────────┘

• Viewport shrinks when keyboard opens
• Messages area auto-scrolls to bottom
• Input stays visible above keyboard
```

---

## 7. Trải Nghiệm Người Dùng (UX)

### 7.1. Onboarding Flow

```
Lần đầu mở chatbot:
┌─────────────────────────────────────────────────┐
│  🤖 UniHelper Bot                          [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  👋 Xin chào! Mình là UniHelper Bot      │  │
│  │                                           │  │
│  │  Mình có thể giúp bạn:                   │  │
│  │  1️⃣ Hỏi đáp thông tin                   │  │
│  │  2️⃣ Kiểm tra trạng thái yêu cầu         │  │
│  │  3️⃣ Hướng dẫn đăng ký KTX/giấy tờ       │  │
│  │  4️⃣ Tạo yêu cầu mới                     │  │
│  │                                           │  │
│  │  Bạn cần hỗ trợ gì?                      │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │
│  │🏠 KTX  │ │📄Giấy tờ│ │📋Tr.thái│ │❓ FAQ  │  │
│  └────────┘ └─────────┘ └─────────┘ └────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│  [        Nhập tin nhắn...              ] [➤]  │
└─────────────────────────────────────────────────┘
```

### 7.2. Typing Indicator

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  User: Kiểm tra yêu cầu KTX của tôi            │
│                                                 │
│  🤖  ┌───────────────────┐                      │
│      │  ●  ●  ●          │  ← Typing animation │
│      │  Đang nhập...     │                      │
│      └───────────────────┘                      │
│                                                 │
└─────────────────────────────────────────────────┘

• 3 dots animation
• Text "Đang nhập..."
• Duration: until response arrives
```

### 7.3. Error States

```
Network Error:
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  ⚠️ Không thể kết nối                     │  │
│  │                                           │  │
│  │  Vui lòng kiểm tra kết nối mạng          │  │
│  │  và thử lại.                              │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │         🔄 Thử lại                  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Server Error:
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  😅 Xin lỗi, có lỗi xảy ra                │  │
│  │                                           │  │
│  │  Vui lòng thử lại sau hoặc liên hệ       │  │
│  │  hotline: 028 1234 5678                   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 7.4. Empty States

```
Không có yêu cầu:
┌─────────────────────────────────────────────────┐
│  🤖                                             │
│  ┌───────────────────────────────────────────┐  │
│  │  📭 Bạn chưa có yêu cầu KTX nào          │  │
│  │                                           │  │
│  │  Bạn có muốn đăng ký KTX ngay không?     │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │    🏠 Đăng ký KTX                   │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌────────────────────────────────────┐   │  │
│  │  │  📖 Xem hướng dẫn đăng ký          │   │  │
│  │  └────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 8. Nguyên Tắc Thiết Kế

### 8.1. Định Hướng Tổng Quan

> 💡 **Lưu ý:** Phần này chỉ mô tả các nguyên tắc và định hướng thiết kế. Chi tiết về màu sắc, typography, icons cụ thể sẽ do designer quyết định dựa trên design system tổng thể của UniHelper.

#### Nguyên Tắc Về Màu Sắc:
- Sử dụng màu sắc **nhất quán** với theme chung của UniHelper
- Phân biệt rõ ràng tin nhắn của **Bot** và **User** bằng màu sắc khác nhau
- Sử dụng màu **status colors** (success, warning, error) đúng ngữ cảnh
- Đảm bảo **contrast ratio** đạt chuẩn WCAG cho accessibility

#### Nguyên Tắc Về Typography:
- Font chữ phải **dễ đọc** trên mọi kích thước màn hình
- Kích thước chữ phù hợp cho **mobile** (không quá nhỏ)
- Sử dụng **font-weight** để tạo hierarchy (tiêu đề đậm hơn nội dung)

#### Nguyên Tắc Về Icons:
- Sử dụng **icon library** thống nhất (Ant Design Icons hoặc tương đương)
- Icons phải **trực quan**, dễ hiểu ý nghĩa
- Kết hợp **emoji** để tăng tính thân thiện của chatbot

#### Nguyên Tắc Về Animations:
- Animations phải **mượt mà**, không gây khó chịu
- Thời gian animation **ngắn gọn** (200-300ms)
- Có thể **tắt animations** cho người dùng nhạy cảm (prefers-reduced-motion)

### 8.2. Yêu Cầu Về Trải Nghiệm

| Yêu cầu | Mô tả |
|---------|-------|
| **Không gây cản trở** | Chatbot không được che khuất nội dung quan trọng |
| **Dễ đóng/mở** | Một click để mở, một click để đóng |
| **Phản hồi nhanh** | Hiển thị typing indicator khi đang chờ response |
| **Ghi nhớ context** | Giữ lại lịch sử chat trong phiên làm việc |
| **Graceful errors** | Xử lý lỗi nhẹ nhàng, không crash |

---

## 9. Accessibility

### 9.1. Keyboard Navigation

```
Tab Order:
1. Toggle button (focus ring visible)
2. Close button
3. Messages area (scrollable)
4. Quick reply buttons
5. Input field
6. Send button

Shortcuts:
- Enter: Send message
- Escape: Close chat window
- Tab: Navigate between elements
```

### 9.2. Screen Reader Support

```html
<!-- Toggle Button -->
<button aria-label="Mở chatbot UniHelper">
  <MessageOutlined />
</button>

<!-- Chat Window -->
<div role="dialog" aria-labelledby="chatbot-title">
  <h2 id="chatbot-title">UniHelper Bot</h2>
  
  <!-- Messages -->
  <div role="log" aria-live="polite" aria-label="Tin nhắn">
    <div role="article" aria-label="Tin nhắn từ bot">
      ...
    </div>
  </div>
  
  <!-- Input -->
  <input 
    aria-label="Nhập tin nhắn" 
    placeholder="Nhập tin nhắn..."
  />
</div>
```

### 9.3. Các Yêu Cầu Accessibility Khác

- Đảm bảo **color contrast** đạt chuẩn WCAG 2.1 AA
- Hỗ trợ **prefers-reduced-motion** cho người dùng nhạy cảm với animation
- Có thể **điều khiển hoàn toàn bằng bàn phím**
- Hỗ trợ **screen reader** cho người khiếm thị

---

## 📝 Tổng Kết

### Các Component Cần Phát Triển

| Component | Mô tả | Priority |
|-----------|-------|----------|
| `ChatbotToggle` | Floating button | High |
| `ChatbotWindow` | Main container | High |
| `ChatbotHeader` | Title, status, close | High |
| `ChatbotMessages` | Messages area | High |
| `ChatbotMessage` | Single message bubble | High |
| `ChatbotInput` | Input field + send | High |
| `QuickReplies` | Suggestion buttons | Medium |
| `StatusCard` | Request status display | Medium |
| `TypingIndicator` | Loading animation | Medium |
| `FormWizard` | Multi-step form | Low |

### Timeline Đề Xuất

| Phase | Thời gian | Nội dung |
|-------|-----------|----------|
| 1 | 2-3 ngày | Basic UI: Toggle, Window, Messages, Input |
| 2 | 2-3 ngày | Quick Replies, Status Card, Typing |
| 3 | 3-5 ngày | Form Wizard, Responsive, Animations |
| 4 | 2-3 ngày | Testing, Accessibility, Polish |

---

**Tài liệu này dùng làm chuẩn thiết kế cho việc phát triển Chatbot UI của UniHelper.**