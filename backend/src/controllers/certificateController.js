const certificateService = require('../services/certificateService');
const { catchAsync } = require('../utils/appError');

/**
 * Certificate Controller - Presentation Layer
 * Xử lý HTTP requests/responses cho Certificate Management
 */
class CertificateController {
  // =============== CERTIFICATE TYPES ===============

  // Lấy danh sách certificate types
  getCertificateTypes = catchAsync(async (req, res) => {
    const { search } = req.query;
    const filters = search ? { name: { $regex: search, $options: 'i' } } : {};

    const result = await certificateService.getCertificateTypes(filters);

    res.status(200).json(result);
  });

  // Tạo certificate type mới
  createCertificateType = catchAsync(async (req, res) => {
    const result = await certificateService.createCertificateType(req.body);

    res.status(201).json(result);
  });

  // Cập nhật certificate type
  updateCertificateType = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.updateCertificateType(id, req.body);

    res.status(200).json(result);
  });

  // Xóa certificate type
  deleteCertificateType = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.deleteCertificateType(id);

    res.status(200).json(result);
  });

  // =============== CERTIFICATE TEMPLATES ===============

  // Lấy danh sách certificate templates
  getCertificateTemplates = catchAsync(async (req, res) => {
    const { certificateType, isActive } = req.query;
    const filters = {};

    if (certificateType) filters.certificateType = certificateType;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const result = await certificateService.getCertificateTemplates(filters);

    res.status(200).json(result);
  });

  // Lấy template theo ID
  getCertificateTemplateById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.getCertificateTemplateById(id);

    res.status(200).json(result);
  });

  // Tạo certificate template mới
  createCertificateTemplate = catchAsync(async (req, res) => {
    const result = await certificateService.createCertificateTemplate(req.body);

    res.status(201).json(result);
  });

  // Cập nhật certificate template
  updateCertificateTemplate = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.updateCertificateTemplate(id, req.body);

    res.status(200).json(result);
  });

  // Xóa certificate template
  deleteCertificateTemplate = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.deleteCertificateTemplate(id);

    res.status(200).json(result);
  });

  // Lấy templates theo type
  getTemplatesByType = catchAsync(async (req, res) => {
    const { typeId } = req.params;

    const result = await certificateService.getTemplatesByType(typeId);

    res.status(200).json(result);
  });

  // Lấy active templates theo type
  getActiveTemplatesByType = catchAsync(async (req, res) => {
    const { typeId } = req.params;

    const result = await certificateService.getActiveTemplatesByType(typeId);

    res.status(200).json(result);
  });

  // Toggle trạng thái template
  toggleTemplateStatus = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await certificateService.toggleTemplateStatus(id);

    res.status(200).json(result);
  });
}

module.exports = new CertificateController();
