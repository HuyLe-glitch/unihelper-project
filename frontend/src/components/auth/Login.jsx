// frontend/src/pages/Login.jsx 
import {useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
//import {loginWithEmailPassword} from '../services/auth';        // No longer exists
import {useAuthContext} from '../../contexts/AuthContext';
import LoginRoleSelector from './LoginRoleSelector';
//import RequireAuth from '../../routes/RequireAuth';
import './Login.css';

export default function Login(){
    const { login } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();
    //const [loginMode, setLoginMode] = useState('role-selection'); // 'role-selection' or 'login'
    useEffect(() => {
        // Try to get role from localStorage
        const role = localStorage.getItem('selectedRole');
        if (role) setSelectedRole(role);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
          // pass what your auth service expects; include role if needed
          await login({ email, password, role: selectedRole });
          // optionally redirect here by role
          if (selectedRole === 'admin') navigate('/admin/dashboard');
          else if (selectedRole === 'staff') navigate('/staff/dashboard');
          else navigate('/student/dashboard');
        } catch (err) {
          setError(err.message || 'Login failed');
        } finally {
          setSubmitting(false);
        }
    }

    // Selection handlers
    /*const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setLoginMode('login');
    };*/

    const handleBackToRoleSelection = () => {
        setSelectedRole(null);
        localStorage.removeItem('selectedRole');
        navigate('/choose-role'); // or navigate('/') as the root

    };

    // Get role display name and placeholder
    const getRoleInfo = () => {
        switch(selectedRole) {
            case 'admin':
                return { title: 'Admin Login', placeholder: 'admin@tdtu.edu.vn' };
            case 'staff':
                return { title: 'Staff Login', placeholder: 'staff@tdtu.edu.vn' };
            case 'student':
            default:
                return { title: 'Student Login', placeholder: 'student@tdtu.edu.vn' };
        }
    };

    const roleInfo = getRoleInfo();

    return (
        <div className="login-container">
            {/* Add the role selection*/}
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
                        <span>Email</span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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