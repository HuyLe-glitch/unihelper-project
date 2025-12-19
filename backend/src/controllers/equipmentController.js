const equipmentService = require('../services/equipmentService');

/**
 * Equipment Controller - Thin Controller
 * Chỉ nhận request, gọi service và trả response
 */
const equipmentController = {
  // ==========================================
  // CATEGORY ENDPOINTS
  // ==========================================

  /**
   * GET /api/equipment/categories
   */
  getAllCategories: async (req, res, next) => {
    try {
      const filters = {
        isActive: req.query.isActive,
        search: req.query.search
      };
      const result = await equipmentService.getAllCategories(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/equipment/categories/:id
   */
  getCategoryById: async (req, res, next) => {
    try {
      const result = await equipmentService.getCategoryById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/equipment/categories
   */
  createCategory: async (req, res, next) => {
    try {
      const result = await equipmentService.createCategory(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/equipment/categories/:id
   */
  updateCategory: async (req, res, next) => {
    try {
      const result = await equipmentService.updateCategory(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/equipment/categories/:id
   */
  deleteCategory: async (req, res, next) => {
    try {
      const result = await equipmentService.deleteCategory(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // ITEM ENDPOINTS
  // ==========================================

  /**
   * GET /api/equipment/items
   */
  getAllItems: async (req, res, next) => {
    try {
      const filters = {
        category: req.query.category,
        isActive: req.query.isActive,
        search: req.query.search
      };
      const result = await equipmentService.getAllItems(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/equipment/items/:id
   */
  getItemById: async (req, res, next) => {
    try {
      const result = await equipmentService.getItemById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/equipment/categories/:id/items
   */
  getItemsByCategory: async (req, res, next) => {
    try {
      const result = await equipmentService.getItemsByCategory(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/equipment/items
   */
  createItem: async (req, res, next) => {
    try {
      const result = await equipmentService.createItem(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/equipment/categories/:id/items/batch
   */
  createItemsBatch: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const { items } = req.body;
      const result = await equipmentService.createItemsBatch(categoryId, items);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/equipment/items/:id
   */
  updateItem: async (req, res, next) => {
    try {
      const result = await equipmentService.updateItem(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/equipment/items/:id
   */
  deleteItem: async (req, res, next) => {
    try {
      const result = await equipmentService.deleteItem(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/equipment/stats
   */
  getStats: async (req, res, next) => {
    try {
      const result = await equipmentService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = equipmentController;
