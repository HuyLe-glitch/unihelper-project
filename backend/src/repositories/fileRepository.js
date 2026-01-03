/**
 * File Repository - Data Access Layer
 * Xử lý tất cả các thao tác với Firebase Storage
 * KHÔNG chứa business logic - chỉ CRUD operations
 */
const { bucket, firebaseInitialized } = require('../config/firebase');
const crypto = require('crypto');

// Helper function để tạo unique ID (thay thế uuid)
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Allowed MIME types và extensions
const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

class FileRepository {
  
  /**
   * Upload file lên Firebase Storage
   * @param {Buffer} fileBuffer - Buffer của file
   * @param {String} originalName - Tên file gốc
   * @param {String} mimeType - MIME type của file
   * @param {Number} fileSize - Kích thước file
   * @param {String} folder - Thư mục trên Firebase (vd: 'certificate-requests')
   * @returns {Object} - { fileName, storedName, fileUrl, fileType, fileSize }
   */
  async uploadToFirebase(fileBuffer, originalName, mimeType, fileSize, folder = 'uploads') {
    if (!firebaseInitialized || !bucket) {
      throw new Error('Firebase Storage chưa được khởi tạo');
    }

    // Generate unique filename
    const extension = ALLOWED_TYPES[mimeType] || 'file';
    const storedName = `${folder}/${generateUniqueId()}.${extension}`;
    
    // Upload to Firebase
    const fileRef = bucket.file(storedName);
    
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    // Make file publicly accessible
    await fileRef.makePublic();
    
    // Get public URL
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${storedName}`;
    
    return {
      fileName: originalName,
      storedName: storedName,
      fileUrl: fileUrl,
      fileType: mimeType,
      fileSize: fileSize
    };
  }

  /**
   * Xóa file từ Firebase Storage
   * @param {String} storedName - Tên file trên Firebase (path)
   * @returns {Boolean}
   */
  async deleteFromFirebase(storedName) {
    if (!firebaseInitialized || !bucket) {
      return false;
    }

    if (!storedName) return false;
    
    try {
      const fileRef = bucket.file(storedName);
      const [exists] = await fileRef.exists();
      
      if (exists) {
        await fileRef.delete();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error.message);
      return false;
    }
  }

  /**
   * Kiểm tra file có tồn tại không
   * @param {String} storedName - Tên file trên Firebase
   * @returns {Boolean}
   */
  async fileExists(storedName) {
    if (!firebaseInitialized || !bucket) {
      return false;
    }

    try {
      const fileRef = bucket.file(storedName);
      const [exists] = await fileRef.exists();
      return exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy public URL của file
   * @param {String} storedName - Tên file trên Firebase
   * @returns {String}
   */
  getPublicUrl(storedName) {
    if (!bucket || !storedName) return null;
    return `https://storage.googleapis.com/${bucket.name}/${storedName}`;
  }

  /**
   * Kiểm tra MIME type có được phép không
   * @param {String} mimeType 
   * @returns {Boolean}
   */
  isAllowedType(mimeType) {
    return Object.keys(ALLOWED_TYPES).includes(mimeType);
  }

  /**
   * Lấy extension từ MIME type
   * @param {String} mimeType 
   * @returns {String}
   */
  getExtension(mimeType) {
    return ALLOWED_TYPES[mimeType] || 'file';
  }
}

module.exports = new FileRepository();
