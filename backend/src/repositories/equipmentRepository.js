const EquipmentCategory = require('../models/EquipmentCategory');
const EquipmentItem = require('../models/EquipmentItem');

/**
 * Equipment Repository - Tương tác với Database
 * Chỉ chứa các operation CRUD, không có business logic
 */
const equipmentRepository = {
  // ==========================================
  // CATEGORY OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả danh mục
   */
  getAllCategories: async (filters = {}) => {
    const query = {};

    return await EquipmentCategory.find(query)
      .populate('itemCount')
      .sort({ name: 1 });
  },

  /**
   * Lấy danh mục theo ID
   */
  getCategoryById: async (categoryId) => {
    return await EquipmentCategory.findById(categoryId)
      .populate('itemCount');
  },

  /**
   * Kiểm tra tên danh mục đã tồn tại
   */
  checkCategoryNameExists: async (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await EquipmentCategory.findOne(query);
  },

  /**
   * Tạo danh mục mới
   */
  createCategory: async (categoryData) => {
    const category = new EquipmentCategory(categoryData);
    return await category.save();
  },

  /**
   * Cập nhật danh mục
   */
  updateCategory: async (categoryId, updateData) => {
    return await EquipmentCategory.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    ).populate('itemCount');
  },

  /**
   * Xóa danh mục
   */
  deleteCategory: async (categoryId) => {
    return await EquipmentCategory.findByIdAndDelete(categoryId);
  },

  /**
   * Đếm số danh mục
   */
  countCategories: async () => {
    return await EquipmentCategory.countDocuments();
  },

  // ==========================================
  // ITEM OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả thiết bị
   */
  getAllItems: async (filters = {}) => {
    const query = {};
    if (filters.category) {
      query.category = filters.category;
    }

    return await EquipmentItem.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });
  },

  /**
   * Lấy thiết bị theo ID
   */
  getItemById: async (itemId) => {
    return await EquipmentItem.findById(itemId)
      .populate('category', 'name');
  },

  /**
   * Lấy thiết bị theo danh mục
   */
  getItemsByCategory: async (categoryId) => {
    return await EquipmentItem.find({ category: categoryId })
      .populate('category', 'name')
      .sort({ name: 1 });
  },

  /**
   * Kiểm tra tên thiết bị đã tồn tại (trong toàn hệ thống)
   */
  checkItemNameExists: async (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await EquipmentItem.findOne(query).populate('category', 'name');
  },

  /**
   * Kiểm tra nhiều tên thiết bị cùng lúc
   */
  checkItemNamesExist: async (names) => {
    const normalizedNames = names.map(n => new RegExp(`^${n.trim()}$`, 'i'));
    return await EquipmentItem.find({ 
      name: { $in: normalizedNames } 
    }).populate('category', 'name');
  },

  /**
   * Tạo thiết bị mới
   */
  createItem: async (itemData) => {
    const item = new EquipmentItem(itemData);
    return await item.save();
  },

  /**
   * Tạo nhiều thiết bị cùng lúc
   */
  createManyItems: async (itemsData) => {
    return await EquipmentItem.insertMany(itemsData);
  },

  /**
   * Cập nhật thiết bị
   */
  updateItem: async (itemId, updateData) => {
    return await EquipmentItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
  },

  /**
   * Xóa thiết bị
   */
  deleteItem: async (itemId) => {
    return await EquipmentItem.findByIdAndDelete(itemId);
  },

  /**
   * Xóa tất cả thiết bị theo danh mục
   */
  deleteItemsByCategory: async (categoryId) => {
    return await EquipmentItem.deleteMany({ category: categoryId });
  },

  /**
   * Đếm số thiết bị trong danh mục
   */
  countItemsByCategory: async (categoryId) => {
    return await EquipmentItem.countDocuments({ category: categoryId });
  },

  /**
   * Đếm tổng số thiết bị
   */
  countItems: async () => {
    return await EquipmentItem.countDocuments();
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const [categoryCount, itemCount, itemsByCategory] = await Promise.all([
      EquipmentCategory.countDocuments(),
      EquipmentItem.countDocuments(),
      EquipmentItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalCategories: categoryCount,
      totalItems: itemCount,
      itemsByCategory
    };
  }
};

module.exports = equipmentRepository;
