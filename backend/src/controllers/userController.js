const userService = require('../services/userService');
const { catchAsync } = require('../utils/appError');

/**
 * User Controller - Presentation Layer
 * Xử lý HTTP requests/responses cho User Management
 */
class UserController {
  // Lấy danh sách users
  getUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, role } = req.query;
    const filters = role ? { role } : {};

    const result = await userService.getUsers(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.status(200).json(result);
  });

  // Lấy user theo ID
  getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await userService.getUserById(id);

    res.status(200).json(result);
  });

  // Cập nhật thông tin user
  updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await userService.updateUser(id, req.body);

    res.status(200).json(result);
  });

  // Cập nhật profile của user hiện tại
  updateMyProfile = catchAsync(async (req, res) => {
    const result = await userService.updateProfile(req.userData.id, req.body);

    res.status(200).json(result);
  });

  // Cập nhật profile của user khác (admin)
  updateUserProfile = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await userService.updateProfile(id, req.body);

    res.status(200).json(result);
  });

  // Tạo profile cho user (admin)
  createUserProfile = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await userService.createProfile(id, req.body);

    res.status(201).json(result);
  });

  // Xóa user (admin)
  deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await userService.deleteUser(id);

    res.status(200).json(result);
  });

  // Thay đổi role của user (admin)
  changeUserRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const result = await userService.changeUserRole(id, role);

    res.status(200).json(result);
  });

  // Tìm kiếm users
  searchUsers = catchAsync(async (req, res) => {
    const { q: searchTerm, page = 1, limit = 10 } = req.query;

    const result = await userService.searchUsers(
      searchTerm,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  });
}

module.exports = new UserController();
