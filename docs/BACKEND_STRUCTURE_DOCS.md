# Backend Structure Documentation

## Tổng quan về cấu trúc Backend

Dự án Backend được tổ chức theo mô hình **MVC (Model-View-Controller)** với kiến trúc **3-layer** (Controller - Service - Repository) để đảm bảo tính modular, maintainable và scalable.

---

## 📂 Cấu trúc thư mục chính

```
BackEnd/
├── src/
│   ├── index.js                    # Entry point của ứng dụng
│   ├── app/
│   │   ├── controllers/            # Xử lý HTTP requests và responses
│   │   ├── services/               # Business logic layer
│   │   ├── repository/             # Data access layer
│   │   ├── model/                  # Database schemas (Mongoose models)
│   │   ├── middlewares/            # Middleware functions
│   │   ├── validators/             # Request validation
│   │   ├── auth/                   # Authentication logic
│   │   └── patterns/               # Design patterns implementation
│   ├── config/
│   │   ├── db/                     # Database configuration
│   │   └── multer/                 # File upload configuration
│   ├── routes/                     # API routes definition
│   └── upload/                     # Uploaded files storage
├── package.json                    # Dependencies và scripts
├── nodemon.json                    # Nodemon configuration
├── Dockerfile                      # Docker container setup
└── README.md                       # Project documentation
```

---

## 📁 Chi tiết từng thư mục

### 1. **Controllers** (`src/app/controllers/`)

**Chức năng:** Xử lý HTTP requests, validate input, gọi services và trả về responses cho client.

**Trách nhiệm:**
- Nhận và xử lý HTTP requests
- Validate dữ liệu đầu vào
- Gọi các services để xử lý business logic
- Format và trả về responses

**Ví dụ thực tế - `CartController.js`:**
```javascript
const cartService = require('../services/CartService');

class CartController {
    // [GET] /cart - Xem giỏ hàng của user
    async getCart(req, res) {
        try {
            const userId = req.userData._id; // Lấy user ID từ token
            const cartItems = await cartService.getCartByUserId(userId);
            
            if (!cartItems || cartItems.length === 0) {
                return res.status(404).json({
                    status: false,
                    msg: 'No items found in the cart'
                });
            }
            
            res.status(200).json({
                status: true,
                cartItems
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                msg: 'Error fetching cart items'
            });
        }
    }

    // [PUT] /cart/update/:product_variant_id - Cập nhật số lượng sản phẩm
    async updateCart(req, res) {
        try {
            const userId = req.userData._id;
            const { quantity } = req.body;
            const { product_variant_id } = req.params;
            
            const updatedCart = await cartService.updateCart(userId, product_variant_id, quantity);
            
            res.status(200).json({
                status: true,
                msg: 'Cart updated successfully',
                updatedCart
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                msg: 'Error updating cart'
            });
        }
    }
}

module.exports = new CartController();
```

---

### 2. **Services** (`src/app/services/`)

**Chức năng:** Chứa business logic của ứng dụng, xử lý các quy tắc nghiệp vụ và gọi repository để thao tác với database.

**Trách nhiệm:**
- Xử lý business logic
- Validate business rules
- Gọi repository để thao tác dữ liệu
- Xử lý các logic phức tạp

**Ví dụ thực tế - `CartService.js`:**
```javascript
const cartRepository = require('../repository/CartRepository');

class CartService {
    // Logic lấy giỏ hàng theo user ID
    async getCartByUserId(userId) {
        try {
            // Validate userId
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            return await cartRepository.getCartByUserId(userId);
        } catch (error) {
            throw new Error('Error fetching cart items');
        }
    }

    // Logic cập nhật giỏ hàng với business rules
    async updateCart(userId, product_variant_id, quantity) {
        try {
            // Validate inputs
            if (!userId || !product_variant_id || !quantity) {
                throw new Error('Missing required parameters');
            }
            
            // Business rule: quantity phải > 0
            if (quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }
            
            // Business rule: quantity không được vượt quá 10
            if (quantity > 10) {
                throw new Error('Maximum quantity is 10 per item');
            }
            
            return await cartRepository.updateCart(userId, product_variant_id, quantity);
        } catch (error) {
            throw new Error('Error updating cart');
        }
    }
}

module.exports = new CartService();
```

---

### 3. **Repository** (`src/app/repository/`)

**Chức năng:** Data Access Layer - Thao tác trực tiếp với database thông qua Mongoose models.

**Trách nhiệm:**
- Thực hiện các operations với database
- Encapsulate database queries
- Handle database errors
- Provide data to services

**Ví dụ thực tế - `CartRepository.js`:**
```javascript
const Cart = require('../model/Cart');

class CartRepository {
    // Lấy giỏ hàng theo user ID
    async getCartByUserId(userId) {
        try {
            return await Cart.find({ user_id: userId })
                .populate('product_variant_id') // Populate thông tin product variant
                .populate('user_id')            // Populate thông tin user
                .exec();
        } catch (error) {
            throw new Error('Database error: Unable to fetch cart items');
        }
    }

    // Cập nhật hoặc tạo mới item trong cart
    async updateCart(userId, product_variant_id, quantity) {
        try {
            // Tìm item có sẵn trong cart
            const cartItem = await Cart.findOne({ 
                user_id: userId, 
                product_variant_id 
            });
            
            if (cartItem) {
                // Nếu có rồi thì update quantity
                cartItem.quantity = quantity;
                return await cartItem.save();
            } else {
                // Nếu chưa có thì tạo mới
                const newCartItem = new Cart({ 
                    user_id: userId, 
                    product_variant_id, 
                    quantity 
                });
                return await newCartItem.save();
            }
        } catch (error) {
            throw new Error('Database error: Unable to update cart');
        }
    }

    // Xóa item khỏi cart
    async deleteCartItem(userId, product_variant_id) {
        try {
            return await Cart.findOneAndDelete({ 
                user_id: userId, 
                product_variant_id 
            });
        } catch (error) {
            throw new Error('Database error: Unable to delete cart item');
        }
    }
}

module.exports = new CartRepository();
```

---

### 4. **Models** (`src/app/model/`)

**Chức năng:** Định nghĩa cấu trúc dữ liệu và schema cho MongoDB thông qua Mongoose.

**Trách nhiệm:**
- Định nghĩa schema structure
- Set validation rules
- Define relationships between collections
- Provide model methods

**Ví dụ thực tế - `Cart.js`:**
```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const User = require('./User');

const Cart = new Schema({
    // Reference đến ProductVariant collection
    product_variant_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'ProductVariant', 
        required: true 
    },
    
    // Reference đến User collection
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Số lượng sản phẩm (default = 1, minimum = 1)
    quantity: { 
        type: Number, 
        default: 1,
        min: 1,
        max: 10
    },
    
    // Timestamps tự động
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware để tự động update updatedAt
Cart.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Export model với collection name 'cart'
module.exports = mongoose.model('Cart', Cart, 'cart');
```

**Ví dụ Model phức tạp - `Order.js`:**
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    coupon_id: { 
        type: Schema.Types.ObjectId, 
        ref: "Coupon", 
        default: null 
    },
    address_id: { 
        type: Schema.Types.ObjectId, 
        ref: "Address", 
        default: null 
    },
    status: {
        type: String, 
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    tax: { type: Number, default: 10 },
    shippingFee: { type: Number, default: 6 },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', Order, 'order');
```

---

### 5. **Middlewares** (`src/app/middlewares/`)

**Chức năng:** Xử lý các tác vụ trước khi request đến controller (authentication, validation, logging, etc.).

**Trách nhiệm:**
- Authentication & Authorization
- Request validation
- Logging
- Error handling
- Data preprocessing

**Ví dụ thực tế - `CartMiddleware.js`:**
```javascript
const { validationResult } = require("express-validator");

class CartMiddleware {
    // Middleware cho GET /cart
    index = async (req, res, next) => {
        console.log(`[${new Date().toISOString()}] GET /cart - User: ${req.userData?._id}`);
        next();
    }

    // Middleware validation cho PUT /cart/update/:product_variant_id
    validateUpdateCart = async (req, res, next) => {
        const result = validationResult(req);
        const { quantity } = req.body;
        const { product_variant_id } = req.params;
        let error = '';

        // Check validation errors từ express-validator
        if (!result.isEmpty()) {
            error = result.array()[0].msg;
            return res.status(400).json({
                status: false,
                msg: error
            });
        }

        // Custom validation
        if (!product_variant_id || !quantity) {
            return res.status(400).json({
                status: false,
                msg: 'Product variant ID and quantity are required'
            });
        }

        // Validate quantity
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                status: false,
                msg: 'Quantity must be a positive number'
            });
        }

        if (quantity > 10) {
            return res.status(400).json({
                status: false,
                msg: 'Maximum quantity is 10 per item'
            });
        }

        next();
    }
}

module.exports = new CartMiddleware();
```

**Ví dụ Authentication Middleware - `checkLogin.js`:**
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            status: false,
            msg: 'Please login first'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
            return res.status(401).json({
                status: false,
                msg: 'Token is invalid!'
            });
        }
        
        // Attach user data to request object
        req.userData = data;
        console.log(`User ${data._id} authenticated successfully`);
        next();
    });
}
```

---

### 6. **Routes** (`src/routes/`)

**Chức năng:** Định nghĩa các API endpoints và kết nối với controllers tương ứng.

**Trách nhiệm:**
- Define API routes
- Connect routes to controllers
- Apply middlewares to routes
- Group related routes

**Ví dụ thực tế - `cart.js`:**
```javascript
const express = require('express');
const router = express.Router();

// Import controllers và middlewares
const cartController = require('../app/controllers/CartController');
const checkLogin = require('../app/auth/checkLogin');
const cartMiddleware = require('../app/middlewares/CartMiddleware');
const cartValidator = require('../app/validators/CartValidator');

// [GET] /cart - Xem giỏ hàng (cần đăng nhập)
router.get('/', 
    checkLogin,                    // Middleware: Check authentication
    cartMiddleware.index,          // Middleware: Logging
    cartController.getCart         // Controller: Handle business logic
);

// [PUT] /cart/update/:product_variant_id - Cập nhật số lượng
router.put('/update/:product_variant_id', 
    checkLogin,                           // Middleware: Authentication
    cartValidator.updateCartValidator,    // Middleware: Input validation
    cartMiddleware.validateUpdateCart,    // Middleware: Custom validation
    cartController.updateCart             // Controller: Handle update
);

// [DELETE] /cart/delete/:product_variant_id - Xóa sản phẩm khỏi giỏ hàng
router.delete('/delete/:product_variant_id', 
    checkLogin,                              // Middleware: Authentication
    cartMiddleware.validateDeleteCartItem,   // Middleware: Validation
    cartController.deleteCartItem            // Controller: Handle deletion
);

module.exports = router;
```

**Ví dụ Main Routes - `index.js`:**
```javascript
// Import tất cả route modules
const siteRouter = require('./site');
const logRouter = require('./log');
const userRouter = require('./user');
const addressRouter = require('./address');
const productRouter = require('./product');
const orderRouter = require('./order');
const cartRouter = require('./cart');
const couponRouter = require('./coupon');
const accountRouter = require('./account');

// Function để setup tất cả routes
function route(app) {
    app.use('/', siteRouter);                    // Routes cho trang chủ
    app.use('/log', logRouter);                  // Routes cho logging
    app.use('/user', userRouter);                // Routes cho user management
    app.use('/address', addressRouter);          // Routes cho địa chỉ
    app.use('/product', productRouter);          // Routes cho sản phẩm
    app.use('/order', orderRouter);              // Routes cho đơn hàng
    app.use('/cart', cartRouter);                // Routes cho giỏ hàng
    app.use('/coupon', couponRouter);            // Routes cho mã giảm giá
    app.use('/account', accountRouter);          // Routes cho tài khoản
}

module.exports = route;
```

---

### 7. **Validators** (`src/app/validators/`)

**Chức năng:** Validate dữ liệu đầu vào sử dụng express-validator.

**Trách nhiệm:**
- Input data validation
- Custom validation rules
- Error message formatting
- Data sanitization

**Ví dụ thực tế - `CartValidator.js`:**
```javascript
const { body, param } = require('express-validator');

class CartValidator {
    // Validator cho update cart
    updateCartValidator = [
        // Validate product_variant_id trong params
        param('product_variant_id')
            .notEmpty()
            .withMessage('Product variant ID is required')
            .isMongoId()
            .withMessage('Invalid product variant ID format'),
            
        // Validate quantity trong body
        body('quantity')
            .notEmpty()
            .withMessage('Quantity is required')
            .isInt({ min: 1, max: 10 })
            .withMessage('Quantity must be an integer between 1 and 10')
            .toInt(), // Convert to integer
            
        // Custom validation - check if quantity is reasonable
        body('quantity').custom((value, { req }) => {
            if (value > 10) {
                throw new Error('Maximum 10 items per product variant');
            }
            return true;
        })
    ];

    // Validator cho add to cart
    addToCartValidator = [
        body('product_variant_id')
            .notEmpty()
            .withMessage('Product variant ID is required')
            .isMongoId()
            .withMessage('Invalid product variant ID'),
            
        body('quantity')
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage('Quantity must be between 1 and 10')
            .toInt()
    ];
}

module.exports = new CartValidator();
```

---

### 8. **Config** (`src/config/`)

**Chức năng:** Chứa các file cấu hình cho database, file upload, environment variables.

**Ví dụ Database Config - `db/index.js`:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

**Ví dụ Multer Config - `multer/multer.js`:**
```javascript
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/upload/') // Thư mục lưu file
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: timestamp + original name
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// File filter - chỉ accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

module.exports = upload;
```

---

## 🔄 Luồng xử lý Request trong hệ thống

### Ví dụ cụ thể: API Update Cart

```
1. CLIENT REQUEST
   PUT /cart/update/64f123abc456789012345678
   Headers: { Cookie: "token=jwt_token_here" }
   Body: { quantity: 3 }

2. MIDDLEWARE CHAIN
   ├── checkLogin.js           → Verify JWT token, set req.userData
   ├── cartValidator           → Validate product_variant_id & quantity  
   └── cartMiddleware          → Custom validation & logging

3. CONTROLLER (CartController.js)
   ├── Extract data from req.params & req.body
   ├── Call cartService.updateCart()
   └── Return formatted response

4. SERVICE (CartService.js)
   ├── Apply business rules validation
   ├── Call cartRepository.updateCart()
   └── Return processed data

5. REPOSITORY (CartRepository.js)
   ├── Execute MongoDB query via Mongoose
   ├── Handle database errors
   └── Return raw data

6. RESPONSE TO CLIENT
   {
     "status": true,
     "msg": "Cart updated successfully",
     "updatedCart": { ... }
   }
```

---

## 🎯 Best Practices được áp dụng

### 1. **Separation of Concerns**
- **Controller**: Chỉ xử lý HTTP layer
- **Service**: Chứa business logic
- **Repository**: Chỉ thao tác database

### 2. **Error Handling**
```javascript
// Consistent error response format
{
  "status": false,
  "msg": "Error message here"
}

// Success response format  
{
  "status": true,
  "data": {...},
  "msg": "Success message"
}
```

### 3. **Validation Layers**
- **Express-validator**: Input format validation
- **Mongoose**: Schema validation
- **Custom middleware**: Business rule validation

### 4. **Security**
- JWT authentication
- Input sanitization
- File upload restrictions
- Rate limiting (có thể thêm)

---

## 📋 Tóm tắt luồng phát triển

1. **Tạo Model** → Định nghĩa schema
2. **Tạo Repository** → Database operations
3. **Tạo Service** → Business logic
4. **Tạo Controller** → HTTP handling
5. **Tạo Validator** → Input validation
6. **Tạo Middleware** → Request preprocessing
7. **Tạo Routes** → Connect everything together

Cấu trúc này đảm bảo:
- ✅ **Maintainable**: Dễ bảo trì
- ✅ **Scalable**: Dễ mở rộng  
- ✅ **Testable**: Dễ viết test
- ✅ **Reusable**: Tái sử dụng được
- ✅ **Clean Code**: Code sạch, dễ đọc