import {useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuthContext} from '../../contexts/AuthContext';
import LoginRoleSelector from './LoginRoleSelector';
import './Login.css';

export default function Login(){
    const { login } = useAuthContext();
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('selectedRole');
        if (role) setSelectedRole(role);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
          const credentials = { password, role: selectedRole };
          
          if (selectedRole === 'student') {
            credentials.studentId = studentId;
          } else {
            credentials.email = email;
          }
          
          const result = await login(credentials);
          
          // Use the normalized role from auth service
          const userRole = result.user.role; // Already lowercase from auth.js
          
          if (userRole === 'admin') navigate('/admin/dashboard');
          else if (userRole === 'staff') navigate('/staff/dashboard');
          else navigate('/student/dashboard');
        } catch (err) {
          setError(err.message || 'Login failed');
        } finally {
          setSubmitting(false);
        }
    }

    const handleBackToRoleSelection = () => {
        setSelectedRole(null);
        localStorage.removeItem('selectedRole');
        navigate('/choose-role');
    };

    const getRoleInfo = () => {
        switch(selectedRole) {
            case 'admin':
                return { title: 'Admin Login', placeholder: 'admin@tdtu.edu.vn', inputType: 'email', label: 'Email' };
            case 'staff':
                return { title: 'Staff Login', placeholder: 'staff@tdtu.edu.vn', inputType: 'email', label: 'Email' };
            case 'student':
            default:
                return { title: 'Student Login', placeholder: 'Enter your Student ID', inputType: 'text', label: 'Student ID' };
        }
    };

    const roleInfo = getRoleInfo();

    return (
        <div className="login-container">
            {!selectedRole ? (
                <div className="role-select-wrapper">
                    <LoginRoleSelector />
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-header">
                <button
                    type="button"
                    className="back-to-role"
                    onClick={handleBackToRoleSelection}
                    aria-label="Back to role selection"
                >
                    ←
                </button>
                <h2 className="login-title">
                    {roleInfo.title}
                </h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                <div className="form-fields">
                    <label className="form-label">
                        <span>{roleInfo.label}</span>
                        <input
                            type={roleInfo.inputType}
                            required
                            value={selectedRole === 'student' ? studentId : email}
                            onChange={e => selectedRole === 'student' ? setStudentId(e.target.value) : setEmail(e.target.value)}
                            placeholder={roleInfo.placeholder}
                            className="form-input"
                        />
                    </label>
                    <label className="form-label">
                        <span>Password</span>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="form-input"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="submit-button"
                    >
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
}
