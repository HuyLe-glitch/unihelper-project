/**
 * File Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến file upload/download
 * Chỉ gọi Repository, KHÔNG truy cập database trực tiếp
 */
const fileRepository = require('../repositories/fileRepository');
const { AppError } = require('../utils/appError');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Decode tên file từ Latin-1 sang UTF-8
 * Multer encode tên file tiếng Việt theo Latin-1, cần convert lại
 */
const decodeFileName = (filename) => {
  try {
    // Thử decode từ Latin-1 sang UTF-8
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch {
    // Nếu lỗi, trả về tên gốc
    return filename;
  }
};

class FileService {
  
  /**
   * Upload file lên Firebase Storage
   * @param {Object} file - Multer file object (with buffer)
   * @param {String} folder - Thư mục lưu trữ
   * @returns {Object} - { success, message, data }
   */
  async uploadFile(file, folder = 'uploads') {
    // Validation
    if (!file) {
      throw new AppError('Vui lòng chọn file để upload', 400);
    }

    // Kiểm tra MIME type
    if (!fileRepository.isAllowedType(file.mimetype)) {
      throw new AppError('Loại file không được hỗ trợ. Chỉ chấp nhận PDF, DOC, DOCX, JPG, PNG, GIF', 400);
    }

    // Kiểm tra kích thước
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(`Kích thước file vượt quá giới hạn ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
    }

    // Decode tên file tiếng Việt
    const decodedFileName = decodeFileName(file.originalname);

    // Upload to Firebase
    const result = await fileRepository.uploadToFirebase(
      file.buffer,
      decodedFileName,
      file.mimetype,
      file.size,
      folder
    );

    return {
      success: true,
      message: 'Upload file thành công',
      data: result
    };
  }

  /**
   * Lấy URL preview của file
   * @param {String} storedName - Tên file trên Firebase
   * @returns {Object} - { success, data: { url } }
   */
  async getPreviewUrl(storedName) {
    if (!storedName) {
      throw new AppError('Tên file là bắt buộc', 400);
    }

    // Kiểm tra file tồn tại
    const exists = await fileRepository.fileExists(storedName);
    if (!exists) {
      throw new AppError('File không tồn tại', 404);
    }

    const url = fileRepository.getPublicUrl(storedName);
    
    return {
      success: true,
      data: { url }
    };
  }

  /**
   * Xóa file từ Firebase Storage
   * @param {String} storedName - Tên file trên Firebase
   * @returns {Object} - { success, message }
   */
  async deleteFile(storedName) {
    if (!storedName) {
      throw new AppError('Tên file là bắt buộc', 400);
    }

    const deleted = await fileRepository.deleteFromFirebase(storedName);
    
    return {
      success: true,
      message: deleted ? 'Xóa file thành công' : 'File không tồn tại hoặc đã bị xóa'
    };
  }
}

module.exports = new FileService();
