# 📚 HƯỚNG DẪN XÂY DỰNG API - UNIHELPER PROJECT

> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 18/12/2024  
> **Mục đích:** Tài liệu hướng dẫn chi tiết cho việc xây dựng luồng API tương tác giữa Backend và Frontend

---

## 📋 MỤC LỤC

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu Trúc Backend](#2-cấu-trúc-backend)
3. [Cấu Trúc Frontend](#3-cấu-trúc-frontend)
4. [Quy Trình Xây Dựng API Mới](#4-quy-trình-xây-dựng-api-mới)
5. [Chi Tiết Từng Layer](#5-chi-tiết-từng-layer)
6. [Quy Ước Đặt Tên](#6-quy-ước-đặt-tên)
7. [Xử Lý Lỗi](#7-xử-lý-lỗi)
8. [Bảo Mật & Authentication](#8-bảo-mật--authentication)
9. [Ví Dụ Thực Tế](#9-ví-dụ-thực-tế)
10. [Checklist Khi Xây Dựng API](#10-checklist-khi-xây-dựng-api)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1 Kiến Trúc Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Components  │  │   Contexts   │  │   Services (API)     │   │
│  │  (UI Layer)  │◄─┤  (State)     │◄─┤   (HTTP Calls)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP Requests (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express.js)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ROUTES LAYER                          │   │
│  │  • Định nghĩa endpoints                                  │   │
│  │  • Áp dụng middlewares (auth, validation)                │   │
│  │  • Mapping URL → Controller methods                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  MIDDLEWARE LAYER                        │   │
│  │  • Authentication (protect)                              │   │
│  │  • Authorization (restrictTo)                            │   │
│  │  • Validation (express-validator)                        │   │
│  │  • Error Handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CONTROLLER LAYER                        │   │
│  │  • Nhận HTTP Request                                     │   │
│  │  • Extract data từ req.body, req.params, req.query       │   │
│  │  • Gọi Service                                           │   │
│  │  • Trả về HTTP Response                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SERVICE LAYER                          │   │
│  │  • Xử lý Business Logic                                  │   │
│  │  • Validation nghiệp vụ                                  │   │
│  │  • Gọi Repository                                        │   │
│  │  • Transform data                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 REPOSITORY LAYER                         │   │
│  │  • Tương tác trực tiếp với Database                      │   │
│  │  • CRUD operations                                       │   │
│  │  • Query building                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
│                                ▼                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   MODEL LAYER                            │   │
│  │  • Mongoose Schema definitions                           │   │
│  │  • Data validation (schema level)                        │   │
│  │  • Virtual fields, methods                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │    MongoDB Database    │
                    └────────────────────────┘
```

### 1.2 Luồng Dữ Liệu (Data Flow)

```
REQUEST FLOW:
Frontend → API Service → Backend Route → Middleware → Controller → Service → Repository → Model → DB

RESPONSE FLOW:
DB → Model → Repository → Service → Controller → Response → Frontend
```

---

## 2. CẤU TRÚC BACKEND

### 2.1 Tổ Chức Thư Mục

```
backend/src/
├── app.js                    # Express app configuration
├── server.js                 # Server entry point
│
├── config/                   # Cấu hình ứng dụng
│   ├── db.js                 # MongoDB connection
│   └── jwt.js                # JWT configuration
│
├── constants/                # Hằng số dùng chung
│   └── modelConstants.js     # Enum values, status codes
│
├── controllers/              # 📌 PRESENTATION LAYER
│   ├── authController.js
│   ├── certificateController.js
│   ├── studentController.js
│   └── ...
│
├── middleware/               # 📌 CROSS-CUTTING CONCERNS
│   ├── authMiddleware.js     # protect, restrictTo
│   ├── errorHandler.js       # Global error handling
│   └── staffMiddleware.js    # Staff-specific checks
│
├── models/                   # 📌 DATA LAYER (Mongoose Schemas)
│   ├── User.js
│   ├── Student.js
│   ├── CertificateRequest.js
│   └── ...
│
├── repositories/             # 📌 DATA ACCESS LAYER
│   ├── userRepository.js
│   ├── studentRepository.js
│   ├── certificateRepository.js
│   └── ...
│
├── routes/                   # 📌 ROUTING LAYER
│   ├── authRoutes.js
│   ├── certificateRoutes.js
│   ├── studentRoutes.js
│   └── ...
│
├── services/                 # 📌 BUSINESS LOGIC LAYER
│   ├── authService.js
│   ├── certificateService.js
│   ├── studentService.js
│   └── ...
│
├── utils/                    # Utilities & Helpers
│   └── appError.js           # Custom error class
│
└── validators/               # 📌 INPUT VALIDATION
    ├── certificateValidation.js
    ├── studentValidation.js
    └── userValidation.js
```

### 2.2 Nguyên Tắc Mỗi Layer

| Layer | Trách Nhiệm | KHÔNG được làm |
|-------|-------------|----------------|
| **Routes** | Định nghĩa endpoints, áp dụng middlewares | Chứa business logic |
| **Middleware** | Auth, validation, error handling | Truy cập DB trực tiếp |
| **Controller** | Nhận request, gọi service, trả response | Chứa business logic, query DB |
| **Service** | Xử lý business logic, validation nghiệp vụ | Query DB trực tiếp |
| **Repository** | CRUD operations, query building | Chứa business logic |
| **Model** | Schema definition, data validation | Chứa business logic phức tạp |
| **Validators** | Validate input data (format, type) | Validate business rules |

---

## 3. CẤU TRÚC FRONTEND

### 3.1 Tổ Chức Thư Mục

```
frontend/src/
├── App.jsx                   # Main App component
├── main.jsx                  # Entry point
│
├── assets/                   # Static assets (images, fonts)
│
├── components/               # 📌 UI COMPONENTS
│   ├── admin/                # Admin-specific components
│   │   ├── faculty-major-management/
│   │   ├── user-management/
│   │   └── ...
│   ├── student/              # Student-specific components
│   ├── staff/                # Staff-specific components
│   └── common/               # Shared components
│
├── constants/                # Hằng số frontend
│
├── contexts/                 # 📌 STATE MANAGEMENT
│   └── AuthContext.jsx       # Authentication state
│
├── hooks/                    # 📌 CUSTOM HOOKS
│   └── useAuth.js
│
├── layouts/                  # 📌 LAYOUT COMPONENTS
│   ├── AdminLayout.jsx
│   ├── StudentLayout.jsx
│   └── ...
│
├── routes/                   # 📌 ROUTING CONFIGURATION
│
├── services/                 # 📌 API SERVICES
│   ├── api.js                # Axios instance & interceptors
│   ├── admin.js              # Admin API calls
│   ├── student.js            # Student API calls
│   ├── staff.js              # Staff API calls
│   └── auth.js               # Authentication API calls
│
└── utils/                    # Utilities & Helpers
```

### 3.2 Nguyên Tắc Frontend

| Layer | Trách Nhiệm |
|-------|-------------|
| **Services** | Gọi API, xử lý response, error handling |
| **Contexts** | Quản lý global state |
| **Hooks** | Reusable logic, side effects |
| **Components** | UI rendering, local state |
| **Layouts** | Page structure, navigation |

---

## 4. QUY TRÌNH XÂY DỰNG API MỚI

### 4.1 Thứ Tự Thực Hiện (Backend)

```
1️⃣ MODEL        → Định nghĩa schema nếu cần entity mới
2️⃣ REPOSITORY   → Tạo các methods truy cập DB
3️⃣ SERVICE      → Viết business logic
4️⃣ CONTROLLER   → Xử lý HTTP request/response
5️⃣ VALIDATION   → Tạo rules validate input
6️⃣ ROUTES       → Định nghĩa endpoints, áp dụng middlewares
7️⃣ APP.JS       → Mount routes vào app
```

### 4.2 Thứ Tự Thực Hiện (Frontend)

```
1️⃣ SERVICE      → Thêm API call methods
2️⃣ HOOKS        → Tạo custom hooks nếu cần
3️⃣ COMPONENTS   → Tạo/cập nhật UI components
4️⃣ ROUTES       → Thêm route nếu là page mới
```

### 4.3 Flowchart Chi Tiết

```
┌─────────────────────────────────────────────────────────────────┐
│                    XÂY DỰNG API MỚI                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: XÁC ĐỊNH YÊU CẦU                                        │
│ • API endpoint cần tạo là gì?                                   │
│ • HTTP method nào? (GET/POST/PATCH/DELETE)                      │
│ • Ai có quyền truy cập? (ADMIN/STAFF/STUDENT)                   │
│ • Input data và Output data như thế nào?                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: TẠO/CẬP NHẬT MODEL (nếu cần)                            │
│ 📁 backend/src/models/NewEntity.js                              │
│ • Định nghĩa Mongoose Schema                                    │
│ • Thêm validations (required, enum, etc.)                       │
│ • Thêm virtual fields nếu cần                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: TẠO REPOSITORY                                          │
│ 📁 backend/src/repositories/newEntityRepository.js              │
│ • Viết các methods CRUD cơ bản                                  │
│ • findById, findAll, create, update, delete                     │
│ • Các query phức tạp nếu cần                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 4: TẠO SERVICE                                             │
│ 📁 backend/src/services/newEntityService.js                     │
│ • Import repository                                             │
│ • Viết business logic                                           │
│ • Validation nghiệp vụ                                          │
│ • Throw AppError nếu có lỗi                                     │
│ • Return { success, message, data }                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 5: TẠO CONTROLLER                                          │
│ 📁 backend/src/controllers/newEntityController.js               │
│ • Import service                                                │
│ • Wrap với catchAsync                                           │
│ • Extract data từ req                                           │
│ • Gọi service method                                            │
│ • Return res.status().json()                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 6: TẠO VALIDATION                                          │
│ 📁 backend/src/validators/newEntityValidation.js                │
│ • Sử dụng express-validator                                     │
│ • Validate body, params, query                                  │
│ • Export validation rules                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 7: TẠO ROUTES                                              │
│ 📁 backend/src/routes/newEntityRoutes.js                        │
│ • Import controller, validation, middleware                     │
│ • Định nghĩa endpoints                                          │
│ • Áp dụng protect, restrictTo                                   │
│ • Áp dụng validation middleware                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 8: MOUNT ROUTES                                            │
│ 📁 backend/src/app.js                                           │
│ • Import routes                                                 │
│ • app.use('/api/new-entity', newEntityRoutes)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 9: TẠO FRONTEND SERVICE                                    │
│ 📁 frontend/src/services/newEntity.js                           │
│ • Import apiClient                                              │
│ • Tạo các methods gọi API                                       │
│ • Export service object                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 10: TẠO COMPONENT                                          │
│ 📁 frontend/src/components/...                                  │
│ • Import service                                                │
│ • Gọi API trong useEffect hoặc event handlers                   │
│ • Xử lý loading, error states                                   │
│ • Render UI                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. CHI TIẾT TỪNG LAYER

### 5.1 MODEL (Mongoose Schema)

📁 **Vị trí:** `backend/src/models/`

```javascript
// Ví dụ: models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // 1. Định nghĩa fields với validation
  studentId: {
    type: String,
    required: [true, 'Mã sinh viên là bắt buộc'],
    unique: true,
    trim: true
  },
  
  // 2. Reference đến model khác
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 3. Enum values
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true  // Tự động thêm createdAt, updatedAt
});

// 4. Virtual fields
studentSchema.virtual('fullInfo').get(function() {
  return `${this.studentId} - ${this.user.name}`;
});

// 5. Pre/Post hooks nếu cần
studentSchema.pre('save', function(next) {
  // Logic trước khi save
  next();
});

module.exports = mongoose.model('Student', studentSchema);
```

**Nguyên tắc:**
- ✅ Định nghĩa schema với validation cơ bản
- ✅ Sử dụng reference cho quan hệ
- ✅ Thêm indexes cho performance
- ❌ KHÔNG chứa business logic phức tạp

---

### 5.2 REPOSITORY (Data Access Layer)

📁 **Vị trí:** `backend/src/repositories/`

```javascript
// Ví dụ: repositories/studentRepository.js
const Student = require('../models/Student');

/**
 * Student Repository - Data Access Layer
 * Xử lý tất cả các thao tác database liên quan đến Student
 */
class StudentRepository {
  
  // CREATE
  async create(studentData) {
    const student = new Student(studentData);
    return await student.save();
  }

  // READ - Single
  async findById(id) {
    return await Student.findById(id)
      .populate('user', 'name email')
      .populate('faculty', 'name')
      .populate('major', 'name');
  }

  // READ - Multiple with filters
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const query = Student.find(filters)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const [students, total] = await Promise.all([
      query,
      Student.countDocuments(filters)
    ]);

    return { students, total, page, limit };
  }

  // UPDATE
  async update(id, updateData) {
    return await Student.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });
  }

  // DELETE
  async delete(id) {
    return await Student.findByIdAndDelete(id);
  }

  // Custom queries
  async findByStudentId(studentId) {
    return await Student.findOne({ studentId });
  }

  async existsByStudentId(studentId, excludeId = null) {
    const query = { studentId };
    if (excludeId) query._id = { $ne: excludeId };
    return await Student.exists(query);
  }
}

module.exports = new StudentRepository();
```

**Nguyên tắc:**
- ✅ Chỉ chứa logic truy vấn DB
- ✅ Sử dụng async/await
- ✅ Populate references khi cần
- ✅ Hỗ trợ pagination, sorting
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG throw AppError (để Service xử lý)

---

### 5.3 SERVICE (Business Logic Layer)

📁 **Vị trí:** `backend/src/services/`

```javascript
// Ví dụ: services/studentService.js
const studentRepository = require('../repositories/studentRepository');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/appError');

/**
 * Student Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến Student
 */
class StudentService {

  // Lấy danh sách students với phân trang
  async getStudents(filters = {}, options = {}) {
    const result = await studentRepository.findAll(filters, options);

    return {
      success: true,
      message: 'Lấy danh sách sinh viên thành công',
      data: result.students,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  // Lấy thông tin chi tiết student
  async getStudentById(studentId) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError('Không tìm thấy sinh viên', 404);
    }

    return {
      success: true,
      message: 'Lấy thông tin sinh viên thành công',
      data: student
    };
  }

  // Tạo student mới
  async createStudent(studentData) {
    const { studentId, userId, facultyId, majorId } = studentData;

    // 1. Validation nghiệp vụ
    const existingStudent = await studentRepository.existsByStudentId(studentId);
    if (existingStudent) {
      throw new AppError('Mã sinh viên đã tồn tại', 400);
    }

    // 2. Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // 3. Kiểm tra user đã là student chưa
    if (user.role === 'STUDENT') {
      throw new AppError('User này đã là sinh viên', 400);
    }

    // 4. Tạo student
    const newStudent = await studentRepository.create({
      studentId,
      user: userId,
      faculty: facultyId,
      major: majorId
    });

    // 5. Cập nhật role cho user
    await userRepository.update(userId, { role: 'STUDENT' });

    return {
      success: true,
      message: 'Tạo sinh viên thành công',
      data: newStudent
    };
  }

  // Cập nhật student
  async updateStudent(id, updateData) {
    // 1. Kiểm tra student tồn tại
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new AppError('Không tìm thấy sinh viên', 404);
    }

    // 2. Kiểm tra mã sinh viên mới (nếu có)
    if (updateData.studentId && updateData.studentId !== student.studentId) {
      const exists = await studentRepository.existsByStudentId(updateData.studentId, id);
      if (exists) {
        throw new AppError('Mã sinh viên đã tồn tại', 400);
      }
    }

    // 3. Cập nhật
    const updatedStudent = await studentRepository.update(id, updateData);

    return {
      success: true,
      message: 'Cập nhật sinh viên thành công',
      data: updatedStudent
    };
  }

  // Xóa student
  async deleteStudent(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new AppError('Không tìm thấy sinh viên', 404);
    }

    await studentRepository.delete(id);

    return {
      success: true,
      message: 'Xóa sinh viên thành công'
    };
  }
}

module.exports = new StudentService();
```

**Nguyên tắc:**
- ✅ Xử lý tất cả business logic
- ✅ Validation nghiệp vụ (kiểm tra tồn tại, quyền, etc.)
- ✅ Gọi repository để truy cập DB
- ✅ Throw AppError với message và status code rõ ràng
- ✅ Return format thống nhất: `{ success, message, data, pagination? }`
- ❌ KHÔNG truy cập req, res
- ❌ KHÔNG query DB trực tiếp

---

### 5.4 CONTROLLER (Presentation Layer)

📁 **Vị trí:** `backend/src/controllers/`

```javascript
// Ví dụ: controllers/studentController.js
const studentService = require('../services/studentService');
const { catchAsync } = require('../utils/appError');

/**
 * Student Controller - Presentation Layer
 * Xử lý HTTP requests/responses cho Student Management
 */
class StudentController {

  // GET /api/students
  getStudents = catchAsync(async (req, res) => {
    // 1. Extract query parameters
    const { page, limit, search, faculty, status } = req.query;
    
    // 2. Build filters
    const filters = {};
    if (search) filters.studentId = { $regex: search, $options: 'i' };
    if (faculty) filters.faculty = faculty;
    if (status) filters.status = status;

    // 3. Build options
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    // 4. Call service
    const result = await studentService.getStudents(filters, options);

    // 5. Return response
    res.status(200).json(result);
  });

  // GET /api/students/:id
  getStudentById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await studentService.getStudentById(id);

    res.status(200).json(result);
  });

  // POST /api/students
  createStudent = catchAsync(async (req, res) => {
    const result = await studentService.createStudent(req.body);

    res.status(201).json(result);
  });

  // PATCH /api/students/:id
  updateStudent = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await studentService.updateStudent(id, req.body);

    res.status(200).json(result);
  });

  // DELETE /api/students/:id
  deleteStudent = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await studentService.deleteStudent(id);

    res.status(200).json(result);
  });
}

module.exports = new StudentController();
```

**Nguyên tắc:**
- ✅ Sử dụng `catchAsync` để wrap async functions
- ✅ Extract data từ `req.body`, `req.params`, `req.query`
- ✅ Gọi service methods
- ✅ Return response với status code phù hợp
- ✅ Giữ controller "thin" - không chứa logic
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG query DB

---

### 5.5 VALIDATION (Input Validation)

📁 **Vị trí:** `backend/src/validators/`

```javascript
// Ví dụ: validators/studentValidation.js
const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

/**
 * Middleware xử lý kết quả validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

/**
 * Validation rules cho Student
 */
const studentValidation = {
  // Validation cho tạo student
  createStudent: [
    body('studentId')
      .notEmpty()
      .withMessage('Mã sinh viên là bắt buộc')
      .isLength({ min: 5, max: 20 })
      .withMessage('Mã sinh viên phải từ 5-20 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã sinh viên chỉ chứa chữ hoa và số')
      .trim(),
    
    body('userId')
      .notEmpty()
      .withMessage('User ID là bắt buộc')
      .isMongoId()
      .withMessage('User ID không hợp lệ'),
    
    body('facultyId')
      .notEmpty()
      .withMessage('Khoa là bắt buộc')
      .isMongoId()
      .withMessage('Faculty ID không hợp lệ'),
    
    body('majorId')
      .notEmpty()
      .withMessage('Ngành là bắt buộc')
      .isMongoId()
      .withMessage('Major ID không hợp lệ'),
    
    handleValidationErrors
  ],

  // Validation cho cập nhật student
  updateStudent: [
    body('studentId')
      .optional()
      .isLength({ min: 5, max: 20 })
      .withMessage('Mã sinh viên phải từ 5-20 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã sinh viên chỉ chứa chữ hoa và số')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'GRADUATED'])
      .withMessage('Status không hợp lệ'),
    
    handleValidationErrors
  ]
};

/**
 * Validation cho query parameters
 */
const studentQueryValidation = {
  getStudents: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phải từ 1-100'),
    
    query('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'GRADUATED'])
      .withMessage('Status không hợp lệ'),
    
    handleValidationErrors
  ]
};

/**
 * Validation cho ID params
 */
const idValidation = {
  validateObjectId: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    handleValidationErrors
  ]
};

module.exports = {
  studentValidation,
  studentQueryValidation,
  idValidation
};
```

**Nguyên tắc:**
- ✅ Validate format, type, length của input
- ✅ Sanitize input (trim, escape)
- ✅ Sử dụng express-validator
- ✅ Message tiếng Việt rõ ràng
- ❌ KHÔNG validate business rules (để Service xử lý)

---

### 5.6 ROUTES (Routing Layer)

📁 **Vị trí:** `backend/src/routes/`

```javascript
// Ví dụ: routes/studentRoutes.js
const express = require('express');
const studentController = require('../controllers/studentController');
const { studentValidation, studentQueryValidation, idValidation } = require('../validators/studentValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Student Routes
 * Base path: /api/students
 */

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

// =============== PUBLIC ROUTES (Authenticated) ===============

// GET /api/students - Lấy danh sách students
router.get('/', 
  studentQueryValidation.getStudents, 
  studentController.getStudents
);

// GET /api/students/:id - Lấy chi tiết student
router.get('/:id', 
  idValidation.validateObjectId, 
  studentController.getStudentById
);

// =============== ADMIN/STAFF ROUTES ===============

// POST /api/students - Tạo student mới
router.post('/', 
  restrictTo('ADMIN', 'STAFF'),
  studentValidation.createStudent, 
  studentController.createStudent
);

// PATCH /api/students/:id - Cập nhật student
router.patch('/:id', 
  restrictTo('ADMIN', 'STAFF'),
  idValidation.validateObjectId,
  studentValidation.updateStudent, 
  studentController.updateStudent
);

// DELETE /api/students/:id - Xóa student (Admin only)
router.delete('/:id', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId, 
  studentController.deleteStudent
);

module.exports = router;
```

**Nguyên tắc:**
- ✅ Định nghĩa HTTP method + path
- ✅ Áp dụng middlewares theo thứ tự: auth → validation → controller
- ✅ Comment rõ ràng mô tả endpoint
- ✅ Group routes theo permission level
- ❌ KHÔNG chứa logic

---

### 5.7 MIDDLEWARE (Cross-cutting Concerns)

📁 **Vị trí:** `backend/src/middleware/`

#### Authentication Middleware

```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { AppError, catchAsync } = require('../utils/appError');

/**
 * Middleware xác thực token
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Lấy token từ header
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Vui lòng đăng nhập để truy cập', 401);
  }

  // 2. Xác thực token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Kiểm tra user còn tồn tại
  const user = await userRepository.findById(decoded.id);
  if (!user) {
    throw new AppError('User không tồn tại', 401);
  }

  // 4. Lưu thông tin user vào request
  req.userData = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  req.user = user;
  
  next();
});

/**
 * Middleware phân quyền
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.userData) {
      throw new AppError('Vui lòng đăng nhập trước', 401);
    }

    if (!roles.includes(req.userData.role)) {
      throw new AppError('Bạn không có quyền thực hiện hành động này', 403);
    }

    next();
  };
};
```

---

## 6. QUY ƯỚC ĐẶT TÊN

### 6.1 Backend

| Thành phần | Quy ước | Ví dụ |
|------------|---------|-------|
| **Files** | camelCase | `studentController.js`, `userService.js` |
| **Classes** | PascalCase | `StudentController`, `UserService` |
| **Methods** | camelCase, verb first | `getStudents`, `createUser`, `deleteById` |
| **Variables** | camelCase | `studentData`, `isActive` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_LIMIT`, `DEFAULT_PAGE_SIZE` |
| **Routes** | kebab-case, plural nouns | `/api/students`, `/api/certificate-requests` |

### 6.2 Frontend

| Thành phần | Quy ước | Ví dụ |
|------------|---------|-------|
| **Components** | PascalCase | `StudentList.jsx`, `UserForm.jsx` |
| **Folders** | kebab-case | `user-management/`, `faculty-major/` |
| **Services** | camelCase | `studentService`, `adminService` |
| **Hooks** | camelCase, prefix `use` | `useAuth`, `useStudents` |
| **Contexts** | PascalCase, suffix `Context` | `AuthContext`, `ThemeContext` |

### 6.3 API Endpoints

```
GET    /api/resources          # Lấy danh sách
GET    /api/resources/:id      # Lấy chi tiết
POST   /api/resources          # Tạo mới
PATCH  /api/resources/:id      # Cập nhật một phần
PUT    /api/resources/:id      # Cập nhật toàn bộ
DELETE /api/resources/:id      # Xóa
```

---

## 7. XỬ LÝ LỖI

### 7.1 Backend Error Handling

```javascript
// utils/appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
```

### 7.2 HTTP Status Codes

| Code | Ý nghĩa | Khi nào dùng |
|------|---------|--------------|
| 200 | OK | GET, PATCH, DELETE thành công |
| 201 | Created | POST tạo resource thành công |
| 400 | Bad Request | Validation lỗi, input không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Dữ liệu trùng lặp |
| 500 | Internal Error | Lỗi server không xác định |

### 7.3 Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "pagination": {  // Nếu có
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Error Response
{
  "status": "fail",  // hoặc "error"
  "message": "Mô tả lỗi chi tiết"
}
```

### 7.4 Frontend Error Handling

```javascript
// services/api.js
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network Error');
    } else if (error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response.status >= 500) {
      console.error('Server Error');
    }
    return Promise.reject(error);
  }
);
```

---

## 8. BẢO MẬT & AUTHENTICATION

### 8.1 JWT Authentication Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client     │         │   Backend    │         │   Database   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. POST /api/auth/login                        │
       │  { email, password }   │                        │
       │───────────────────────>│                        │
       │                        │  2. Verify credentials │
       │                        │───────────────────────>│
       │                        │<───────────────────────│
       │                        │                        │
       │  3. Return JWT token   │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │  4. Store token        │                        │
       │  (localStorage)        │                        │
       │                        │                        │
       │  5. GET /api/resource  │                        │
       │  Authorization: Bearer │                        │
       │───────────────────────>│                        │
       │                        │  6. Verify token       │
       │                        │  (protect middleware)  │
       │                        │                        │
       │  7. Return data        │                        │
       │<───────────────────────│                        │
```

### 8.2 Role-Based Access Control

```javascript
// Middleware sử dụng
router.use(protect);                    // Tất cả routes cần đăng nhập
router.get('/', controller.getAll);     // Ai đăng nhập cũng xem được
router.post('/', restrictTo('ADMIN', 'STAFF'), controller.create);  // Chỉ ADMIN, STAFF
router.delete('/:id', restrictTo('ADMIN'), controller.delete);      // Chỉ ADMIN
```

### 8.3 Roles trong hệ thống

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| ADMIN | Quản trị viên | Toàn quyền |
| STAFF | Nhân viên | Xử lý yêu cầu, quản lý sinh viên |
| STUDENT | Sinh viên | Tạo yêu cầu, xem thông tin cá nhân |

---

## 9. VÍ DỤ THỰC TẾ

### 9.1 Xây Dựng API Quản Lý Khoa (Faculty)

#### Bước 1: Model

```javascript
// models/Faculty.js
const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
```

#### Bước 2: Repository

```javascript
// repositories/facultyRepository.js
const Faculty = require('../models/Faculty');

class FacultyRepository {
  async findAll(filters = {}) {
    return await Faculty.find(filters).sort({ name: 1 });
  }
  
  async findById(id) {
    return await Faculty.findById(id);
  }
  
  async create(data) {
    return await Faculty.create(data);
  }
  
  async update(id, data) {
    return await Faculty.findByIdAndUpdate(id, data, { new: true });
  }
  
  async delete(id) {
    return await Faculty.findByIdAndDelete(id);
  }
  
  async existsByCode(code, excludeId = null) {
    const query = { code };
    if (excludeId) query._id = { $ne: excludeId };
    return await Faculty.exists(query);
  }
}

module.exports = new FacultyRepository();
```

#### Bước 3: Service

```javascript
// services/facultyService.js
const facultyRepository = require('../repositories/facultyRepository');
const { AppError } = require('../utils/appError');

class FacultyService {
  async getFaculties(filters = {}) {
    const faculties = await facultyRepository.findAll(filters);
    return { success: true, message: 'Lấy danh sách khoa thành công', data: faculties };
  }

  async createFaculty(data) {
    const exists = await facultyRepository.existsByCode(data.code);
    if (exists) throw new AppError('Mã khoa đã tồn tại', 400);
    
    const faculty = await facultyRepository.create(data);
    return { success: true, message: 'Tạo khoa thành công', data: faculty };
  }

  // ... other methods
}

module.exports = new FacultyService();
```

#### Bước 4: Controller

```javascript
// controllers/facultyController.js
const facultyService = require('../services/facultyService');
const { catchAsync } = require('../utils/appError');

class FacultyController {
  getFaculties = catchAsync(async (req, res) => {
    const result = await facultyService.getFaculties(req.query);
    res.status(200).json(result);
  });

  createFaculty = catchAsync(async (req, res) => {
    const result = await facultyService.createFaculty(req.body);
    res.status(201).json(result);
  });
}

module.exports = new FacultyController();
```

#### Bước 5: Validation

```javascript
// validators/facultyValidation.js
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./common');

const facultyValidation = {
  createFaculty: [
    body('name').notEmpty().withMessage('Tên khoa là bắt buộc'),
    body('code').notEmpty().isLength({ min: 2, max: 10 }).withMessage('Mã khoa 2-10 ký tự'),
    handleValidationErrors
  ]
};

module.exports = { facultyValidation };
```

#### Bước 6: Routes

```javascript
// routes/facultyRoutes.js
const express = require('express');
const controller = require('../controllers/facultyController');
const { facultyValidation } = require('../validators/facultyValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', controller.getFaculties);
router.post('/', restrictTo('ADMIN'), facultyValidation.createFaculty, controller.createFaculty);

module.exports = router;
```

#### Bước 7: Mount trong app.js

```javascript
// app.js
const facultyRoutes = require('./routes/facultyRoutes');
app.use('/api/faculties', facultyRoutes);
```

#### Bước 8: Frontend Service

```javascript
// frontend/src/services/faculty.js
import { apiClient } from './api';

export const facultyService = {
  getFaculties: async (filters = {}) => {
    const response = await apiClient.get('/faculties', { params: filters });
    return response.data;
  },
  
  createFaculty: async (data) => {
    const response = await apiClient.post('/faculties', data);
    return response.data;
  }
};
```

---

## 10. CHECKLIST KHI XÂY DỰNG API

### 10.1 Backend Checklist

```
□ MODEL
  □ Định nghĩa schema với validation
  □ Thêm timestamps
  □ Thêm indexes cho performance
  □ Export model

□ REPOSITORY
  □ Import model
  □ Viết CRUD methods
  □ Viết custom queries
  □ Export instance

□ SERVICE
  □ Import repository
  □ Import AppError
  □ Viết business logic
  □ Validate nghiệp vụ
  □ Throw AppError với status code đúng
  □ Return format { success, message, data }
  □ Export instance

□ CONTROLLER
  □ Import service
  □ Import catchAsync
  □ Wrap methods với catchAsync
  □ Extract data từ req
  □ Gọi service
  □ Return response với status code đúng
  □ Export instance

□ VALIDATION
  □ Import express-validator
  □ Viết validation rules
  □ Include handleValidationErrors
  □ Export validation object

□ ROUTES
  □ Import controller, validation, middleware
  □ Áp dụng protect cho routes cần auth
  □ Áp dụng restrictTo cho routes cần phân quyền
  □ Áp dụng validation trước controller
  □ Export router

□ APP.JS
  □ Import routes
  □ Mount routes với path đúng
```

### 10.2 Frontend Checklist

```
□ SERVICE
  □ Import apiClient
  □ Viết API call methods
  □ Return response.data
  □ Export service object

□ COMPONENT
  □ Import service
  □ Handle loading state
  □ Handle error state
  □ Call API trong useEffect hoặc handlers
  □ Display data
```

---

## 📌 LƯU Ý QUAN TRỌNG

1. **Separation of Concerns**: Mỗi layer chỉ làm một việc
2. **Single Responsibility**: Mỗi function/method chỉ làm một việc
3. **DRY (Don't Repeat Yourself)**: Tái sử dụng code
4. **Error First**: Luôn xử lý error trước happy path
5. **Consistent Response**: Format response thống nhất
6. **Meaningful Names**: Đặt tên có ý nghĩa
7. **Comments**: Comment khi cần thiết
8. **Testing**: Test API với Postman/Thunder Client trước khi integrate

---

> **Tác giả:** UniHelper Development Team  
> **Ngày tạo:** 18/12/2024
