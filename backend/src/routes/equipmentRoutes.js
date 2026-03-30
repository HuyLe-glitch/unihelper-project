const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const equipmentValidation = require('../validators/equipmentValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Equipment Routes
 * Base path: /api/equipment
 */

// Tất cả routes cần xác thực
router.use(protect);

// ==========================================
// CATEGORY ROUTES
// ==========================================

/**
 * @route   GET /api/equipment/categories
 * @desc    Lấy tất cả danh mục
 * @access  Admin, Staff, Student (Student cần xem để chọn khi tạo yêu cầu)
 */
router.get(
  '/categories',
  restrictTo('ADMIN', 'STAFF', 'STUDENT'),
  equipmentValidation.queryValidation,
  equipmentController.getAllCategories
);

/**
 * @route   GET /api/equipment/categories/:id
 * @desc    Lấy danh mục theo ID
 * @access  Admin, Staff, Student
 */
router.get(
  '/categories/:id',
  restrictTo('ADMIN', 'STAFF', 'STUDENT'),
  equipmentValidation.idValidation,
  equipmentController.getCategoryById
);

/**
 * @route   POST /api/equipment/categories
 * @desc    Tạo danh mục mới
 * @access  Admin only
 */
router.post(
  '/categories',
  restrictTo('ADMIN'),
  equipmentValidation.categoryValidation.create,
  equipmentController.createCategory
);

/**
 * @route   PATCH /api/equipment/categories/:id
 * @desc    Cập nhật danh mục
 * @access  Admin only
 */
router.patch(
  '/categories/:id',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentValidation.categoryValidation.update,
  equipmentController.updateCategory
);

/**
 * @route   GET /api/equipment/categories/:id/check-delete
 * @desc    Kiểm tra có thể xóa danh mục không
 * @access  Admin only
 */
router.get(
  '/categories/:id/check-delete',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentController.checkCanDeleteCategory
);

/**
 * @route   DELETE /api/equipment/categories/:id
 * @desc    Xóa danh mục (kèm tất cả thiết bị)
 * @access  Admin only
 */
router.delete(
  '/categories/:id',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentController.deleteCategory
);

/**
 * @route   GET /api/equipment/categories/:id/items
 * @desc    Lấy tất cả thiết bị trong 1 danh mục
 * @access  Admin, Staff, Student
 */
router.get(
  '/categories/:id/items',
  restrictTo('ADMIN', 'STAFF', 'STUDENT'),
  equipmentValidation.idValidation,
  equipmentController.getItemsByCategory
);

/**
 * @route   POST /api/equipment/categories/:id/items/batch
 * @desc    Thêm nhiều thiết bị vào danh mục (batch)
 * @access  Admin only
 */
router.post(
  '/categories/:id/items/batch',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentValidation.itemValidation.createBatch,
  equipmentController.createItemsBatch
);

// ==========================================
// ITEM ROUTES
// ==========================================

/**
 * @route   GET /api/equipment/items
 * @desc    Lấy tất cả thiết bị
 * @access  Admin, Staff, Student
 */
router.get(
  '/items',
  restrictTo('ADMIN', 'STAFF', 'STUDENT'),
  equipmentValidation.queryValidation,
  equipmentController.getAllItems
);

/**
 * @route   GET /api/equipment/items/:id
 * @desc    Lấy thiết bị theo ID
 * @access  Admin, Staff, Student
 */
router.get(
  '/items/:id',
  restrictTo('ADMIN', 'STAFF', 'STUDENT'),
  equipmentValidation.idValidation,
  equipmentController.getItemById
);

/**
 * @route   POST /api/equipment/items
 * @desc    Tạo thiết bị đơn lẻ
 * @access  Admin only
 */
router.post(
  '/items',
  restrictTo('ADMIN'),
  equipmentValidation.itemValidation.create,
  equipmentController.createItem
);

/**
 * @route   PATCH /api/equipment/items/:id
 * @desc    Cập nhật thiết bị
 * @access  Admin only
 */
router.patch(
  '/items/:id',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentValidation.itemValidation.update,
  equipmentController.updateItem
);

/**
 * @route   GET /api/equipment/items/:id/check-delete
 * @desc    Kiểm tra có thể xóa thiết bị không
 * @access  Admin only
 */
router.get(
  '/items/:id/check-delete',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentController.checkCanDeleteItem
);

/**
 * @route   DELETE /api/equipment/items/:id
 * @desc    Xóa thiết bị
 * @access  Admin only
 */
router.delete(
  '/items/:id',
  restrictTo('ADMIN'),
  equipmentValidation.idValidation,
  equipmentController.deleteItem
);

// ==========================================
// STATS ROUTE
// ==========================================

/**
 * @route   GET /api/equipment/stats
 * @desc    Lấy thống kê thiết bị
 * @access  Admin, Staff, Student
 */
router.get(
  '/stats',
  restrictTo('ADMIN', 'STAFF'),
  equipmentController.getStats
);

module.exports = router;
