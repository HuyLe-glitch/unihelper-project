/**
 * Upload Middleware - Xử lý file upload với multer
 * Hỗ trợ upload file PDF, images
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/appError');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize filename
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

// File filter - chỉ cho phép PDF, images và Word documents
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Word documents
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Chỉ hỗ trợ file PDF, Word (DOC, DOCX) hoặc hình ảnh (JPG, PNG, GIF, WEBP)', 400), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Export middleware functions
module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadMultiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  upload
};
