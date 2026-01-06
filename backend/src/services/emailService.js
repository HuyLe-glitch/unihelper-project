/**
 * Email Service
 * Xử lý gửi email thông báo cho sinh viên
 * Tương ứng với các loại thông báo In-app
 */
const { sendEmail } = require('../config/email');

class EmailService {
  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================

  /**
   * Template email cơ bản cho UniHelper
   */
  generateBaseTemplate(content, title = 'Thông báo từ UniHelper') {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header .logo {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px;
        }
        .content h2 {
          color: #1f2937;
          margin-top: 0;
        }
        .info-box {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #6b7280;
          font-weight: 500;
        }
        .info-value {
          color: #1f2937;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .status-processing {
          background: #fef3c7;
          color: #b45309;
        }
        .status-approved {
          background: #d1fae5;
          color: #047857;
        }
        .status-rejected {
          background: #fee2e2;
          color: #dc2626;
        }
        .footer {
          background: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .footer a {
          color: #6366f1;
          text-decoration: none;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓</div>
          <h1>UniHelper</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Email này được gửi tự động từ hệ thống UniHelper.</p>
          <p>Vui lòng không trả lời email này.</p>
          <p>© 2024 UniHelper - Hệ thống hỗ trợ sinh viên</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // ==========================================
  // CTSV EMAIL NOTIFICATIONS
  // ==========================================

  /**
   * Gửi email khi sinh viên tạo yêu cầu CTSV mới
   */
  async sendCtsvRequestCreated(email, requestData) {
    const { requestCode, certificateType, certificateName, semester } = requestData;

    const content = `
      <h2>📝 Yêu cầu giấy tờ đã được ghi nhận</h2>
      <p>Chào bạn,</p>
      <p>Hệ thống đã tiếp nhận yêu cầu giấy tờ của bạn. Dưới đây là thông tin chi tiết:</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Loại giấy tờ:</span>
          <span class="info-value">${certificateType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tên giấy tờ:</span>
          <span class="info-value">${certificateName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Học kỳ:</span>
          <span class="info-value">${semester}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-processing">Đang xử lý</span>
        </div>
      </div>
      
      <p>Yêu cầu của bạn sẽ được xử lý trong thời gian sớm nhất. Bạn sẽ nhận được thông báo khi có cập nhật.</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem chi tiết trên UniHelper</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] Yêu cầu ${requestCode} đã được ghi nhận`,
      html: this.generateBaseTemplate(content, 'Yêu cầu giấy tờ mới')
    });
  }

  /**
   * Gửi email khi yêu cầu CTSV được duyệt (HỢP LỆ)
   */
  async sendCtsvRequestApproved(email, requestData) {
    const { requestCode, certificateType, certificateName } = requestData;

    const content = `
      <h2>✅ Yêu cầu giấy tờ đã được duyệt</h2>
      <p>Chào bạn,</p>
      <p>Tin vui! Yêu cầu giấy tờ của bạn đã được phê duyệt thành công.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Loại giấy tờ:</span>
          <span class="info-value">${certificateType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tên giấy tờ:</span>
          <span class="info-value">${certificateName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-approved">Hợp lệ</span>
        </div>
      </div>
      
      <p>Vui lòng đăng nhập vào hệ thống để tải file giấy tờ hoặc xem thêm chi tiết.</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem và tải giấy tờ</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] ✅ Yêu cầu ${requestCode} đã được duyệt`,
      html: this.generateBaseTemplate(content, 'Yêu cầu đã được duyệt')
    });
  }

  /**
   * Gửi email khi yêu cầu CTSV bị từ chối (KHÔNG HỢP LỆ)
   */
  async sendCtsvRequestRejected(email, requestData) {
    const { requestCode, certificateType, certificateName, reason } = requestData;

    const content = `
      <h2>❌ Yêu cầu giấy tờ không hợp lệ</h2>
      <p>Chào bạn,</p>
      <p>Rất tiếc, yêu cầu giấy tờ của bạn không được chấp thuận.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Loại giấy tờ:</span>
          <span class="info-value">${certificateType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tên giấy tờ:</span>
          <span class="info-value">${certificateName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-rejected">Không hợp lệ</span>
        </div>
        ${reason ? `
        <div class="info-row">
          <span class="info-label">Lý do:</span>
          <span class="info-value">${reason}</span>
        </div>
        ` : ''}
      </div>
      
      <p>Nếu bạn có thắc mắc, vui lòng liên hệ phòng Công tác Sinh viên để được hỗ trợ.</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem chi tiết</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] ❌ Yêu cầu ${requestCode} không được duyệt`,
      html: this.generateBaseTemplate(content, 'Yêu cầu không hợp lệ')
    });
  }

  // ==========================================
  // KTX EMAIL NOTIFICATIONS
  // ==========================================

  /**
   * Gửi email khi sinh viên tạo yêu cầu KTX mới
   */
  async sendKtxRequestCreated(email, requestData) {
    const { requestCode, category, item, description, roomName } = requestData;

    const content = `
      <h2>🏠 Yêu cầu hỗ trợ KTX đã được ghi nhận</h2>
      <p>Chào bạn,</p>
      <p>Hệ thống đã tiếp nhận yêu cầu hỗ trợ KTX của bạn. Dưới đây là thông tin chi tiết:</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phòng:</span>
          <span class="info-value">${roomName || 'Chưa xác định'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Danh mục:</span>
          <span class="info-value">${category}</span>
        </div>
        ${item ? `
        <div class="info-row">
          <span class="info-label">Thiết bị:</span>
          <span class="info-value">${item}</span>
        </div>
        ` : ''}
        ${description ? `
        <div class="info-row">
          <span class="info-label">Mô tả:</span>
          <span class="info-value">${description}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-processing">Đang chờ xử lý</span>
        </div>
      </div>
      
      <p>Yêu cầu của bạn sẽ được xử lý trong thời gian sớm nhất.</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem chi tiết trên UniHelper</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] Yêu cầu KTX ${requestCode} đã được ghi nhận`,
      html: this.generateBaseTemplate(content, 'Yêu cầu hỗ trợ KTX mới')
    });
  }

  /**
   * Gửi email khi yêu cầu KTX được xử lý (Approved)
   */
  async sendKtxRequestApproved(email, requestData) {
    const { requestCode, category, item, staffNote } = requestData;

    const content = `
      <h2>✅ Yêu cầu hỗ trợ KTX đã được xử lý</h2>
      <p>Chào bạn,</p>
      <p>Yêu cầu hỗ trợ KTX của bạn đã được xử lý thành công.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Danh mục:</span>
          <span class="info-value">${category}</span>
        </div>
        ${item ? `
        <div class="info-row">
          <span class="info-label">Thiết bị:</span>
          <span class="info-value">${item}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-approved">Đã xử lý</span>
        </div>
        ${staffNote ? `
        <div class="info-row">
          <span class="info-label">Ghi chú:</span>
          <span class="info-value">${staffNote}</span>
        </div>
        ` : ''}
      </div>
      
      <p>Cảm ơn bạn đã sử dụng dịch vụ hỗ trợ KTX của UniHelper!</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem chi tiết</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] ✅ Yêu cầu KTX ${requestCode} đã được xử lý`,
      html: this.generateBaseTemplate(content, 'Yêu cầu KTX đã xử lý')
    });
  }

  /**
   * Gửi email khi yêu cầu KTX bị từ chối
   */
  async sendKtxRequestRejected(email, requestData) {
    const { requestCode, category, item, reason } = requestData;

    const content = `
      <h2>❌ Yêu cầu hỗ trợ KTX bị từ chối</h2>
      <p>Chào bạn,</p>
      <p>Rất tiếc, yêu cầu hỗ trợ KTX của bạn không được chấp thuận.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Mã yêu cầu:</span>
          <span class="info-value">${requestCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Danh mục:</span>
          <span class="info-value">${category}</span>
        </div>
        ${item ? `
        <div class="info-row">
          <span class="info-label">Thiết bị:</span>
          <span class="info-value">${item}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-rejected">Bị từ chối</span>
        </div>
        ${reason ? `
        <div class="info-row">
          <span class="info-label">Lý do:</span>
          <span class="info-value">${reason}</span>
        </div>
        ` : ''}
      </div>
      
      <p>Nếu bạn có thắc mắc, vui lòng liên hệ quản lý KTX để được hỗ trợ.</p>
      
      <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Xem chi tiết</a>
    `;

    return await sendEmail({
      to: email,
      subject: `[UniHelper] ❌ Yêu cầu KTX ${requestCode} bị từ chối`,
      html: this.generateBaseTemplate(content, 'Yêu cầu KTX bị từ chối')
    });
  }
}

module.exports = new EmailService();
