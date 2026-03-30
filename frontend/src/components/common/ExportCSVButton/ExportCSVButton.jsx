import React, { useState } from 'react';
import './ExportCSVButton.css';

/**
 * ExportCSVButton - Nút xuất file CSV có thể tái sử dụng
 * 
 * @param {Function} exportFunction - Hàm gọi API export (trả về Blob)
 * @param {string} filename - Tên file mặc định nếu không lấy được từ header
 * @param {string} label - Nhãn hiển thị trên nút
 * @param {string} title - Tooltip khi hover
 * @param {string} className - Class CSS bổ sung
 * @param {string} variant - Biến thể: 'default' | 'icon-only' | 'outline' | 'small'
 * @param {boolean} disabled - Disable nút
 * @param {Object} filters - Các filter để truyền cho API
 */
const ExportCSVButton = ({ 
  exportFunction, 
  filename = 'export.csv',
  label = 'Xuất CSV',
  title = '',
  className = '',
  variant = 'default',
  disabled = false,
  filters = {}
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading || disabled) return;
    
    setLoading(true);
    
    try {
      // Gọi hàm export (trả về response với blob)
      const response = await exportFunction(filters);
      
      // Lấy filename từ Content-Disposition header nếu có
      let downloadFilename = filename;
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1];
        }
      }

      // Tạo blob URL và trigger download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export CSV error:', error);
      alert('Có lỗi xảy ra khi xuất file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`export-csv-btn ${variant} ${className} ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleExport}
      disabled={loading || disabled}
      title={title || label}
    >
      {loading ? (
        <>
          <span className="export-csv-spinner"></span>
          {variant !== 'icon-only' && <span>Đang xuất...</span>}
        </>
      ) : (
        <>
          <svg 
            className="export-csv-icon" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {variant !== 'icon-only' && label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};

export default ExportCSVButton;
