/**
 * CSV Exporter Utility
 * 
 * Tiện ích chuyển đổi dữ liệu JSON sang CSV
 * Sử dụng cho tính năng export báo cáo
 */

const { Parser } = require('json2csv');

/**
 * Format ngày theo định dạng Việt Nam (DD/MM/YYYY HH:mm)
 * @param {Date|string} date - Ngày cần format
 * @returns {string} - Ngày đã format
 */
const formatDateVN = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  // Chuyển sang timezone Việt Nam (UTC+7)
  const vnDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
  
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const year = vnDate.getUTCFullYear();
  const hours = String(vnDate.getUTCHours()).padStart(2, '0');
  const minutes = String(vnDate.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format ngày chỉ ngày tháng năm (DD/MM/YYYY)
 * @param {Date|string} date - Ngày cần format
 * @returns {string} - Ngày đã format
 */
const formatDateOnlyVN = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const vnDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
  
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const year = vnDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Tạo tên file CSV với timestamp
 * @param {string} prefix - Tiền tố tên file (VD: 'DS_SuCo_KTX')
 * @returns {string} - Tên file đầy đủ
 */
const generateCSVFilename = (prefix) => {
  const now = new Date();
  const vnDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const year = vnDate.getUTCFullYear();
  
  return `${prefix}_${day}-${month}-${year}.csv`;
};

/**
 * Chuyển đổi dữ liệu JSON sang CSV string
 * @param {Array} data - Mảng dữ liệu JSON
 * @param {Array} fields - Cấu hình các cột [{label, value}]
 * @returns {string} - CSV string
 */
const jsonToCSV = (data, fields) => {
  try {
    const parser = new Parser({ 
      fields, 
      withBOM: true, // Thêm BOM để Excel nhận diện UTF-8
      delimiter: ','
    });
    return parser.parse(data);
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    throw error;
  }
};

/**
 * Cấu hình fields cho export DormitoryRequest
 */
const dormitoryRequestCSVFields = [
  { label: 'Mã yêu cầu', value: 'requestCode' },
  { label: 'MSSV', value: 'studentId' },
  { label: 'Họ tên sinh viên', value: 'studentName' },
  { label: 'Email', value: 'studentEmail' },
  { label: 'Số điện thoại', value: 'studentPhone' },
  { label: 'Phòng', value: 'roomName' },
  { label: 'Danh mục thiết bị', value: 'categoryName' },
  { label: 'Thiết bị cụ thể', value: 'itemName' },
  { label: 'Mô tả sự cố', value: 'description' },
  { label: 'Trạng thái', value: 'status' },
  { label: 'Học kỳ', value: 'semester' },
  { label: 'Ngày gửi yêu cầu', value: 'requestDate' },
  { label: 'Ngày xác nhận', value: 'confirmDate' },
  { label: 'Ngày tạo', value: 'createdAt' },
  { label: 'Ngày cập nhật', value: 'updatedAt' }
];

/**
 * Cấu hình fields cho export CertificateRequest
 */
const certificateRequestCSVFields = [
  { label: 'Mã yêu cầu', value: 'requestCode' },
  { label: 'MSSV', value: 'studentId' },
  { label: 'Họ tên sinh viên', value: 'studentName' },
  { label: 'Email', value: 'studentEmail' },
  { label: 'Số điện thoại', value: 'studentPhone' },
  { label: 'Khoa', value: 'facultyName' },
  { label: 'Ngành', value: 'majorName' },
  { label: 'Loại giấy chứng nhận', value: 'certificateType' },
  { label: 'Tên chứng nhận', value: 'certificateName' },
  { label: 'Ghi chú', value: 'note' },
  { label: 'Trạng thái', value: 'status' },
  { label: 'Ngày gửi yêu cầu', value: 'requestDate' },
  { label: 'Ngày xử lý', value: 'processedDate' },
  { label: 'Ngày tạo', value: 'createdAt' },
  { label: 'Ngày cập nhật', value: 'updatedAt' }
];

/**
 * Map trạng thái DormitoryRequest sang tiếng Việt
 */
const mapDormitoryStatus = (status) => {
  const statusMap = {
    'Pending': 'Chờ tiếp nhận',
    'Under Review': 'Đang xử lý',
    'Approved': 'Đã hoàn thành'
  };
  return statusMap[status] || status;
};

/**
 * Map trạng thái CertificateRequest sang tiếng Việt
 */
const mapCertificateStatus = (status) => {
  const statusMap = {
    'ĐANG XỬ LÝ': 'Đang xử lý',
    'HỢP LỆ': 'Đã duyệt',
    'KHÔNG HỢP LỆ': 'Từ chối'
  };
  return statusMap[status] || status;
};

/**
 * Cấu hình fields cho export Student (Tất cả sinh viên - không có phòng)
 */
const studentCSVFields = [
  { label: 'MSSV', value: 'studentId' },
  { label: 'Họ và tên', value: 'fullName' },
  { label: 'Email', value: 'email' },
  { label: 'Số điện thoại', value: 'phone' },
  { label: 'CCCD/CMND', value: 'citizenId' },
  { label: 'Ngày sinh', value: 'dateOfBirth' },
  { label: 'Địa chỉ', value: 'address' },
  { label: 'Khoa', value: 'facultyName' },
  { label: 'Chuyên ngành', value: 'majorName' },
  { label: 'Ở KTX', value: 'isDormResident' },
  { label: 'Ngày tạo', value: 'createdAt' }
];

/**
 * Cấu hình fields cho export Student KTX (có cột Phòng)
 */
const studentDormCSVFields = [
  { label: 'MSSV', value: 'studentId' },
  { label: 'Họ và tên', value: 'fullName' },
  { label: 'Email', value: 'email' },
  { label: 'Số điện thoại', value: 'phone' },
  { label: 'CCCD/CMND', value: 'citizenId' },
  { label: 'Ngày sinh', value: 'dateOfBirth' },
  { label: 'Địa chỉ', value: 'address' },
  { label: 'Khoa', value: 'facultyName' },
  { label: 'Chuyên ngành', value: 'majorName' },
  { label: 'Phòng KTX', value: 'roomName' },
  { label: 'Ngày tạo', value: 'createdAt' }
];

module.exports = {
  formatDateVN,
  formatDateOnlyVN,
  generateCSVFilename,
  jsonToCSV,
  dormitoryRequestCSVFields,
  certificateRequestCSVFields,
  studentCSVFields,
  studentDormCSVFields,
  mapDormitoryStatus,
  mapCertificateStatus
};
