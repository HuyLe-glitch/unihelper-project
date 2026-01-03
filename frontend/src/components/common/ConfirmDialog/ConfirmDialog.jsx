import { useEffect, useCallback } from 'react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog Component - Dialog xác nhận hành động
 * @param {boolean} isOpen - Trạng thái hiển thị dialog
 * @param {string} title - Tiêu đề dialog
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại dialog: 'confirm', 'warning', 'danger', 'success'
 * @param {string} confirmText - Text nút xác nhận
 * @param {string} cancelText - Text nút hủy
 * @param {function} onConfirm - Callback khi xác nhận
 * @param {function} onCancel - Callback khi hủy
 * @param {boolean} isLoading - Trạng thái đang xử lý
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Xác nhận',
  message,
  type = 'confirm',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  // Handle ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isLoading) {
      onCancel();
    }
  }, [onCancel, isLoading]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconClass: 'icon-danger',
          confirmClass: 'btn-danger'
        };
      case 'warning':
        return {
          icon: '⚡',
          iconClass: 'icon-warning',
          confirmClass: 'btn-warning'
        };
      case 'success':
        return {
          icon: '✓',
          iconClass: 'icon-success',
          confirmClass: 'btn-success'
        };
      default:
        return {
          icon: '❓',
          iconClass: 'icon-confirm',
          confirmClass: 'btn-primary'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="confirm-dialog-overlay" onClick={!isLoading ? onCancel : undefined}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog-icon ${config.iconClass}`}>
          {config.icon}
        </div>
        
        <h3 className="confirm-dialog-title">{title}</h3>
        
        <p className="confirm-dialog-message">{message}</p>
        
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn ${config.confirmClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Đang xử lý...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
