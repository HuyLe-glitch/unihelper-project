const certificateService = require('../services/certificateService');
const { validationResult } = require('express-validator');

/**
 * Certificate Controller - Thin Controller
 * Chỉ nhận request, gọi service và trả response
 * KHÔNG chứa business logic
 */
const certificateController = {
  // ==========================================
  // CERTIFICATE TYPE OPERATIONS
  // ==========================================

  /**
   * GET /api/certificates/types
   * Lấy tất cả loại chứng nhận
   */
  getAllTypes: async (req, res, next) => {
    try {
      const result = await certificateService.getAllTypes();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/types/:id
   * Lấy loại chứng nhận theo ID
   */
  getTypeById: async (req, res, next) => {
    try {
      const result = await certificateService.getTypeById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/certificates/types
   * Tạo loại chứng nhận mới
   */
  createType: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await certificateService.createType(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/certificates/types/:id
   * Cập nhật loại chứng nhận
   */
  updateType: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await certificateService.updateType(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/certificates/types/:id
   * Xóa loại chứng nhận
   */
  deleteType: async (req, res, next) => {
    try {
      const result = await certificateService.deleteType(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // CERTIFICATE OPERATIONS
  // ==========================================

  /**
   * GET /api/certificates
   * Lấy tất cả chứng nhận
   */
  getAllCertificates: async (req, res, next) => {
    try {
      const filters = {};
      if (req.query.certificateType) {
        filters.certificateType = req.query.certificateType;
      }
      const result = await certificateService.getAllCertificates(filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/:id
   * Lấy chứng nhận theo ID
   */
  getCertificateById: async (req, res, next) => {
    try {
      const result = await certificateService.getCertificateById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/by-type/:typeId
   * Lấy chứng nhận theo loại
   */
  getCertificatesByType: async (req, res, next) => {
    try {
      const result = await certificateService.getCertificatesByType(req.params.typeId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/certificates
   * Tạo chứng nhận mới
   */
  createCertificate: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await certificateService.createCertificate(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/certificates/batch
   * Tạo nhiều chứng nhận cùng lúc
   */
  createCertificatesBatch: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { typeId, certificates } = req.body;
      const result = await certificateService.createCertificatesBatch(typeId, certificates);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/certificates/:id
   * Cập nhật chứng nhận
   */
  updateCertificate: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const result = await certificateService.updateCertificate(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/certificates/:id
   * Xóa chứng nhận
   */
  deleteCertificate: async (req, res, next) => {
    try {
      const result = await certificateService.deleteCertificate(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/certificates/stats
   * Lấy thống kê
   */
  getStats: async (req, res, next) => {
    try {
      const result = await certificateService.getStats();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = certificateController;
