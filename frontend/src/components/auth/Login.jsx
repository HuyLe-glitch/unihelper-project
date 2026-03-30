import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import './Login.css';

export default function Login() {
    const { login } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    // Hàm hiển thị lỗi mượt mà
    const displayError = (message) => {
        setError(message);
        setShowError(true);
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            setShowError(false);
            // Đợi animation kết thúc rồi xóa message
            setTimeout(() => setError(''), 300);
        }, 5000);
    };

    // Xóa lỗi khi user bắt đầu nhập lại
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (showError) {
            setShowError(false);
            setTimeout(() => setError(''), 300);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Clear previous error
        setShowError(false);
        setError('');
        setSubmitting(true);

        try {
            const credentials = { email, password };
            const result = await login(credentials);
            
            // Điều hướng dựa trên role của user (từ backend trả về)
            const userRole = result.user.role.toLowerCase();
            
            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'staff') {
                navigate('/staff/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            // Xử lý các loại lỗi khác nhau
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                // Dịch một số message phổ biến
                if (err.message.includes('Invalid credentials') || err.message.includes('incorrect')) {
                    errorMessage = 'Email hoặc mật khẩu không chính xác';
                } else if (err.message.includes('not found') || err.message.includes('User not found')) {
                    errorMessage = 'Tài khoản không tồn tại trong hệ thống';
                } else if (err.message.includes('network') || err.message.includes('Network')) {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
                } else {
                    errorMessage = err.message;
                }
            }
            
            displayError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                {/* Logo/Brand */}
                <div className="login-brand">
                    <div className="brand-icon">🎓</div>
                    <h1 className="brand-name">UniHelper</h1>
                </div>

                <div className="login-header">
                    <h2 className="login-title">Đăng nhập</h2>
                    <p className="login-subtitle">Chào mừng bạn quay trở lại</p>
                </div>

                {/* Error Message with smooth animation */}
                {showError && error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        background: '#ffebee',
                        borderRadius: '6px',
                        borderLeft: '3px solid #d32f2f',
                        color: '#d32f2f',
                        fontSize: '14px'
                    }}>
                        <span style={{ fontSize: '16px', lineHeight: '1' }}>⚠️</span>
                        <span style={{ lineHeight: '1.4' }}>{error}</span>
                    </div>
                )}

                <div className="form-fields">
                    <label className="form-label">
                        <span className="label-text">Email</span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={handleInputChange(setEmail)}
                            placeholder="Nhập email của bạn"
                            className="form-input"
                            autoComplete="email"
                        />
                    </label>

                    <label className="form-label">
                        <span className="label-text">Mật khẩu</span>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={handleInputChange(setPassword)}
                            placeholder="Nhập mật khẩu"
                            className="form-input"
                            autoComplete="current-password"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`submit-button ${submitting ? 'loading' : ''}`}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner"></span>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </div>

                <div className="login-footer">
                    <p className="footer-text">
                        Hệ thống hỗ trợ sinh viên - Trường Đại học Tôn Đức Thắng
                    </p>
                </div>
            </form>
        </div>
    );
}
