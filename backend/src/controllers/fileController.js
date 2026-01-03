/**
 * File Controller - Presentation Layer
 * Xử lý HTTP requests cho file upload/download/preview
 * Chỉ nhận request, gọi service, trả response
 * KHÔNG chứa business logic
 */
const fileService = require('../services/fileService');
const { catchAsync } = require('../utils/appError');

class FileController {
  
  /**
   * POST /api/files/upload
   * Upload một file lên Firebase Storage
   */
  uploadFile = catchAsync(async (req, res) => {
    const folder = req.body.folder || 'uploads';
    const result = await fileService.uploadFile(req.file, folder);
    res.status(201).json(result);
  });

  /**
   * GET /api/files/preview/:folder/:filename
   * Lấy URL preview của file
   */
  getPreviewUrl = catchAsync(async (req, res) => {
    const { folder, filename } = req.params;
    const storedName = `${folder}/${filename}`;
    const result = await fileService.getPreviewUrl(storedName);
    res.status(200).json(result);
  });

  /**
   * DELETE /api/files/:folder/:filename
   * Xóa file từ Firebase Storage
   */
  deleteFile = catchAsync(async (req, res) => {
    const { folder, filename } = req.params;
    const storedName = `${folder}/${filename}`;
    const result = await fileService.deleteFile(storedName);
    res.status(200).json(result);
  });
}

module.exports = new FileController();
