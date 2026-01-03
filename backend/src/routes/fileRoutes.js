/**
 * File Routes
 * Base path: /api/files
 * 
 * Sử dụng Firebase Storage để lưu trữ file
 * File được upload sẽ có public URL từ Firebase
 */
const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config - lưu vào memory buffer (không lưu local, upload lên Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ==================== PUBLIC ROUTES ====================

// GET /api/files/preview/:folder/:filename - Lấy URL preview của file (public)
// Ví dụ: GET /api/files/preview/certificate-requests/abc123.pdf
router.get('/preview/:folder/:filename', fileController.getPreviewUrl);

// ==================== PROTECTED ROUTES ====================
router.use(protect);

// POST /api/files/upload - Upload file lên Firebase (Staff/Admin only)
router.post('/upload', 
  restrictTo('ADMIN', 'STAFF'),
  upload.single('file'), 
  fileController.uploadFile
);

// DELETE /api/files/:folder/:filename - Xóa file từ Firebase (Staff/Admin only)
// Ví dụ: DELETE /api/files/certificate-requests/abc123.pdf
router.delete('/:folder/:filename', 
  restrictTo('ADMIN', 'STAFF'),
  fileController.deleteFile
);

module.exports = router;
