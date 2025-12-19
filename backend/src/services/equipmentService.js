const equipmentRepository = require('../repositories/equipmentRepository');

/**
 * Helper function để tạo operational error với field
 */
const createError = (message, statusCode, field = null, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 500 ? 'error' : 'fail';
  error.isOperational = true;
  if (field) {
    error.field = field;
  }
  Object.assign(error, extra);
  return error;
};

/**
 * Equipment Service - Business Logic Layer
 * Xử lý toàn bộ logic nghiệp vụ
 */
const equipmentService = {
  // ==========================================
  // CATEGORY OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả danh mục
   */
  getAllCategories: async (filters = {}) => {
    const categories = await equipmentRepository.getAllCategories(filters);
    return {
      success: true,
      count: categories.length,
      data: categories
    };
  },

  /**
   * Lấy danh mục theo ID
   */
  getCategoryById: async (categoryId) => {
    const category = await equipmentRepository.getCategoryById(categoryId);
    if (!category) {
      throw createError('Không tìm thấy danh mục', 404);
    }
    return { success: true, data: category };
  },

  /**
   * Tạo danh mục mới - BUSINESS LOGIC: Check trùng tên
   */
  createCategory: async (categoryData) => {
    const { name } = categoryData;

    // BUSINESS LOGIC: Check trùng tên danh mục (unique trong toàn hệ thống)
    const existingCategory = await equipmentRepository.checkCategoryNameExists(name);
    if (existingCategory) {
      throw createError(
        `Tên danh mục "${name}" đã tồn tại trong hệ thống`,
        409,
        'name'
      );
    }

    const newCategory = await equipmentRepository.createCategory({
      name: name.trim(),
      description: categoryData.description?.trim() || ''
    });

    // Populate itemCount
    const populatedCategory = await equipmentRepository.getCategoryById(newCategory._id);

    return {
      success: true,
      message: 'Tạo danh mục thành công',
      data: populatedCategory
    };
  },

  /**
   * Cập nhật danh mục - BUSINESS LOGIC: Check trùng tên (trừ chính nó)
   */
  updateCategory: async (categoryId, updateData) => {
    // Kiểm tra danh mục tồn tại
    const existingCategory = await equipmentRepository.getCategoryById(categoryId);
    if (!existingCategory) {
      throw createError('Không tìm thấy danh mục', 404);
    }

    // BUSINESS LOGIC: Check trùng tên nếu có update tên
    if (updateData.name && updateData.name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicateCategory = await equipmentRepository.checkCategoryNameExists(updateData.name, categoryId);
      if (duplicateCategory) {
        throw createError(
          `Tên danh mục "${updateData.name}" đã tồn tại trong hệ thống`,
          409,
          'name'
        );
      }
    }

    const updatedCategory = await equipmentRepository.updateCategory(categoryId, {
      name: updateData.name?.trim(),
      description: updateData.description?.trim()
    });

    return {
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: updatedCategory
    };
  },

  /**
   * Xóa danh mục - BUSINESS LOGIC: Xóa kèm tất cả thiết bị trong đó
   */
  deleteCategory: async (categoryId) => {
    const category = await equipmentRepository.getCategoryById(categoryId);
    if (!category) {
      throw createError('Không tìm thấy danh mục', 404);
    }

    // Đếm số thiết bị sẽ bị xóa
    const itemCount = await equipmentRepository.countItemsByCategory(categoryId);

    // Xóa tất cả thiết bị trong danh mục
    await equipmentRepository.deleteItemsByCategory(categoryId);

    // Xóa danh mục
    await equipmentRepository.deleteCategory(categoryId);

    return {
      success: true,
      message: `Đã xóa danh mục "${category.name}" và ${itemCount} thiết bị liên quan`
    };
  },

  // ==========================================
  // ITEM OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả thiết bị
   */
  getAllItems: async (filters = {}) => {
    const items = await equipmentRepository.getAllItems(filters);
    return {
      success: true,
      count: items.length,
      data: items
    };
  },

  /**
   * Lấy thiết bị theo ID
   */
  getItemById: async (itemId) => {
    const item = await equipmentRepository.getItemById(itemId);
    if (!item) {
      throw createError('Không tìm thấy thiết bị', 404);
    }
    return { success: true, data: item };
  },

  /**
   * Lấy thiết bị theo danh mục
   */
  getItemsByCategory: async (categoryId) => {
    // Kiểm tra danh mục tồn tại
    const category = await equipmentRepository.getCategoryById(categoryId);
    if (!category) {
      throw createError('Không tìm thấy danh mục', 404);
    }

    const items = await equipmentRepository.getItemsByCategory(categoryId);
    return {
      success: true,
      count: items.length,
      data: items
    };
  },

  /**
   * Tạo thiết bị đơn lẻ - BUSINESS LOGIC: Check trùng tên
   */
  createItem: async (itemData) => {
    const { name, category } = itemData;

    // Kiểm tra danh mục tồn tại
    const categoryExists = await equipmentRepository.getCategoryById(category);
    if (!categoryExists) {
      throw createError('Không tìm thấy danh mục', 404, 'category');
    }

    // BUSINESS LOGIC: Check trùng tên thiết bị (unique trong toàn hệ thống)
    const existingItem = await equipmentRepository.checkItemNameExists(name);
    if (existingItem) {
      throw createError(
        `Tên thiết bị "${name}" đã tồn tại trong danh mục "${existingItem.category.name}"`,
        409,
        'name'
      );
    }

    const newItem = await equipmentRepository.createItem({
      name: name.trim(),
      category,
      description: itemData.description?.trim() || ''
    });

    const populatedItem = await equipmentRepository.getItemById(newItem._id);

    return {
      success: true,
      message: 'Tạo thiết bị thành công',
      data: populatedItem
    };
  },

  /**
   * BATCH CREATE ITEMS - Thêm nhiều thiết bị cùng lúc
   * Business Logic:
   * 1. Validate danh mục tồn tại
   * 2. Kiểm tra trùng lặp tên giữa các entries
   * 3. Kiểm tra trùng lặp tên với DB (toàn hệ thống)
   * 4. Nếu có BẤT KỲ lỗi nào → KHÔNG thêm gì cả (atomic)
   */
  createItemsBatch: async (categoryId, itemsData) => {
    // 1. Validate danh mục tồn tại
    const category = await equipmentRepository.getCategoryById(categoryId);
    if (!category) {
      throw createError('Không tìm thấy danh mục', 404);
    }

    const errors = [];

    // 2. Kiểm tra trùng lặp giữa các entries (local)
    const nameMap = {}; // { nameLower: index }

    itemsData.forEach((entry, index) => {
      const nameLower = entry.name.trim().toLowerCase();

      // Check tên trùng với entries trước
      if (nameMap[nameLower] !== undefined) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${entry.name}" trùng với thiết bị #${nameMap[nameLower] + 1}`
        });
      } else {
        nameMap[nameLower] = index;
      }
    });

    // Nếu có lỗi trùng local → dừng ngay
    if (errors.length > 0) {
      const error = createError('Có lỗi trùng lặp giữa các thiết bị', 400);
      error.errors = errors;
      throw error;
    }

    // 3. Kiểm tra trùng lặp với DB (toàn hệ thống)
    const names = itemsData.map(e => e.name.trim());
    const existingItems = await equipmentRepository.checkItemNamesExist(names);

    existingItems.forEach(existing => {
      const index = names.findIndex(n => n.toLowerCase() === existing.name.toLowerCase());
      if (index !== -1) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${existing.name}" đã tồn tại trong danh mục "${existing.category.name}"`
        });
      }
    });

    // Nếu có lỗi trùng với DB → dừng ngay
    if (errors.length > 0) {
      const error = createError('Có thiết bị đã tồn tại trong hệ thống', 409);
      error.errors = errors;
      throw error;
    }

    // 4. Tất cả hợp lệ → Tạo tất cả items
    const itemsToCreate = itemsData.map(entry => ({
      name: entry.name.trim(),
      category: categoryId,
      description: entry.description?.trim() || ''
    }));

    const createdItems = await equipmentRepository.createManyItems(itemsToCreate);

    // Populate category info
    const populatedItems = await equipmentRepository.getAllItems({ category: categoryId });
    const newItems = populatedItems.filter(item => 
      createdItems.some(c => c._id.toString() === item._id.toString())
    );

    return {
      success: true,
      message: `Đã thêm ${createdItems.length} thiết bị thành công`,
      count: createdItems.length,
      data: newItems
    };
  },

  /**
   * Cập nhật thiết bị - BUSINESS LOGIC: Check trùng tên (trừ chính nó)
   */
  updateItem: async (itemId, updateData) => {
    // Kiểm tra thiết bị tồn tại
    const existingItem = await equipmentRepository.getItemById(itemId);
    if (!existingItem) {
      throw createError('Không tìm thấy thiết bị', 404);
    }

    // BUSINESS LOGIC: Check trùng tên nếu có update tên
    if (updateData.name && updateData.name.trim().toLowerCase() !== existingItem.name.toLowerCase()) {
      const duplicateItem = await equipmentRepository.checkItemNameExists(updateData.name, itemId);
      if (duplicateItem) {
        throw createError(
          `Tên thiết bị "${updateData.name}" đã tồn tại trong danh mục "${duplicateItem.category.name}"`,
          409,
          'name'
        );
      }
    }

    // Nếu thay đổi danh mục, kiểm tra danh mục mới tồn tại
    if (updateData.category && updateData.category !== existingItem.category._id.toString()) {
      const categoryExists = await equipmentRepository.getCategoryById(updateData.category);
      if (!categoryExists) {
        throw createError('Không tìm thấy danh mục', 404, 'category');
      }
    }

    const updatedItem = await equipmentRepository.updateItem(itemId, {
      name: updateData.name?.trim(),
      category: updateData.category,
      description: updateData.description?.trim()
    });

    return {
      success: true,
      message: 'Cập nhật thiết bị thành công',
      data: updatedItem
    };
  },

  /**
   * Xóa thiết bị
   */
  deleteItem: async (itemId) => {
    const item = await equipmentRepository.getItemById(itemId);
    if (!item) {
      throw createError('Không tìm thấy thiết bị', 404);
    }

    await equipmentRepository.deleteItem(itemId);

    return {
      success: true,
      message: `Đã xóa thiết bị "${item.name}"`
    };
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const stats = await equipmentRepository.getStats();
    return {
      success: true,
      data: stats
    };
  }
};

module.exports = equipmentService;
