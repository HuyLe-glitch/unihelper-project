/**
 * Chatbot Constants
 * Chứa các hằng số, quick replies, intent mapping
 */

// Quick Replies mặc định cho main menu
const MAIN_MENU_QUICK_REPLIES = [
  { id: 'ktx', icon: '🔧', label: 'Báo sự cố', action: 'ktx_info' },
  { id: 'giayto', icon: '📄', label: 'Giấy tờ', action: 'document_info' },
  { id: 'trangthai', icon: '📋', label: 'Trạng thái', action: 'check_status' },
  { id: 'faq', icon: '❓', label: 'Hỏi đáp', action: 'faq' },
  { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' }
];

/**
 * Map từ Dialogflow intent name sang internal intent
 */
const INTENT_MAPPING = {
  // Default intents
  'Default Welcome Intent': 'greeting',
  'Default Fallback Intent': 'unknown',
  
  // FAQ intents
  'faq.gio_lam_viec': 'gio_lam_viec',
  'faq.lien_he': 'lien_he',
  
  // CTSV intents
  'ctsv.thong_tin': 'document_info',
  'ctsv.kiem_tra': 'check_document_status',
  'ctsv.tu_van': 'document_advice',
  'ctsv.tao_yeu_cau': 'create_document_request',
  'ctsv.tao_yeu_cau.chon_loai': 'select_certificate_type',
  'ctsv.tao_yeu_cau.chon_ten': 'select_certificate_name',
  'ctsv.tao_yeu_cau.xac_nhan': 'confirm_request',
  'ctsv.tao_yeu_cau.huy': 'cancel_request',
  'ctsv.tao_tu_tu_van': 'create_from_advice',
  
  // KTX intents
  'ktx.thong_tin': 'ktx_info',
  'ktx.kiem_tra': 'check_ktx_status',
  'ktx.bao_su_co': 'ktx_report',
  'ktx.bao_su_co.chon_danh_muc': 'select_equipment_category',
  'ktx.bao_su_co.chon_thiet_bi': 'select_equipment',
  'ktx.bao_su_co.mo_ta': 'describe_issue',
  'ktx.bao_su_co.xac_nhan': 'confirm_ktx_request',
  'ktx.bao_su_co.huy': 'cancel_ktx_request',
  
  // General intents
  'kiem_tra.chung': 'check_status'
};

/**
 * Icon mapping cho loại chứng nhận
 */
const CERTIFICATE_TYPE_ICONS = {
  'xác nhận sinh viên': '📋',
  'bảng điểm': '📊',
  'nghĩa vụ quân sự': '🎖️',
  'giấy chứng nhận tốt nghiệp': '🎓',
  'chứng nhận khác': '📄'
};

/**
 * Status emoji mapping
 */
const STATUS_EMOJI = {
  'pending': '⏳',
  'đang chờ': '⏳',
  'processing': '🔄',
  'đang xử lý': '🔄',
  'approved': '✅',
  'hợp lệ': '✅',
  'rejected': '❌',
  'không hợp lệ': '❌',
  'completed': '✅',
  'hoàn thành': '✅',
  'cancelled': '🚫',
  'đã hủy': '🚫'
};

/**
 * Helper: Lấy emoji cho trạng thái
 */
const getStatusEmoji = (status) => {
  if (!status) return '📋';
  const lowerStatus = status.toLowerCase();
  return STATUS_EMOJI[lowerStatus] || '📋';
};

/**
 * Helper: Lấy icon cho loại chứng nhận
 */
const getCertificateTypeIcon = (typeName) => {
  if (!typeName) return '📄';
  const lowerName = typeName.toLowerCase();
  for (const [key, icon] of Object.entries(CERTIFICATE_TYPE_ICONS)) {
    if (lowerName.includes(key)) return icon;
  }
  return '📄';
};

module.exports = {
  MAIN_MENU_QUICK_REPLIES,
  INTENT_MAPPING,
  CERTIFICATE_TYPE_ICONS,
  STATUS_EMOJI,
  getStatusEmoji,
  getCertificateTypeIcon
};
