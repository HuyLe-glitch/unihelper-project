import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRoleSelector.css";

const LoginRoleSelector = () => {
  const navigate = useNavigate();
  
  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate('/login');
  };

  return (
    <div className="role-selector-container">
      <div className="role-selector-card">
        <h2>Choose your role</h2>
        <p>Select how you want to access the system</p>
        <div className="role-options">
          <button
            className="role-option student-option"
            onClick={() => handleRoleSelect("student")}
          >
            <div className="role-icon">🎓</div>
            <div className="role-content">
              <h3>Student Login</h3>
              <p>Access your student dashboard, requests, and academic information</p>
            </div>
          </button>

          <button
            className="role-option staff-option"
            onClick={() => handleRoleSelect("staff")}
          >
            <div className="role-icon">👥</div>
            <div className="role-content">
              <h3>Staff Login</h3>
              <p>Manage student requests, process approvals, and coordinate staff operations</p>
            </div>
          </button>

          <button
            className="role-option admin-option"
            onClick={() => handleRoleSelect("admin")}
          >
            <div className="role-icon">👨‍💼</div>
            <div className="role-content">
              <h3>Admin Login</h3>
              <p>Manage system, review requests and handle administrative tasks</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRoleSelector;