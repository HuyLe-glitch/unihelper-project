/**
 * Email Configuration
 * Cấu hình nodemailer transporter cho Gmail SMTP
 * Sử dụng App Password để xác thực
 */
const nodemailer = require('nodemailer');

// Tạo transporter với Gmail SMTP
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

// Hàm gửi email cơ bản
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"UniHelper" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || ''
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Verify transporter connection
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};

module.exports = {
  createTransporter,
  sendEmail,
  verifyConnection
};
