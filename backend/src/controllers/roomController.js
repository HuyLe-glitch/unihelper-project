const { validationResult } = require('express-validator');
const roomService = require('../services/roomService');

/**
 * Room Controller - Thin Controller
 * Chỉ làm nhiệm vụ: Hứng request -> Gọi service -> Trả response
 * Không chứa business logic
 */

// Helper function để xử lý validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  return null;
};

/**
 * GET /api/rooms
 * Lấy tất cả phòng
 */
exports.getAllRooms = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await roomService.getAllRooms(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/stats
 * Lấy thống kê phòng
 */
exports.getRoomStats = async (req, res, next) => {
  try {
    const result = await roomService.getRoomStats();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/available
 * Lấy phòng còn trống
 */
exports.getAvailableRooms = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const result = await roomService.getAvailableRooms(categoryId || null);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/:id
 * Lấy phòng theo ID
 */
exports.getRoomById = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await roomService.getRoomById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rooms
 * Tạo phòng mới
 */
exports.createRoom = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await roomService.createRoom(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/rooms/:id
 * Cập nhật phòng
 */
exports.updateRoom = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await roomService.updateRoom(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rooms/:id
 * Xóa phòng
 */
exports.deleteRoom = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await roomService.deleteRoom(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
