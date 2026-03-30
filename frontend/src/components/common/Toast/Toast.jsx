import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import './Toast.css';

// Toast Context
const ToastContext = createContext(null);

// Toast types
const TOAST_TYPES = {
  success: { icon: '✓', className: 'toast-success' },
  error: { icon: '✕', className: 'toast-error' },
  warning: { icon: '⚠', className: 'toast-warning' },
  info: { icon: 'ℹ', className: 'toast-info' }
};

// Toast Item Component
const ToastItem = ({ id, type, message, onClose }) => {
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`toast-item ${config.className}`}>
      <span className="toast-icon">{config.icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
