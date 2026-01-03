import { useState, useEffect, useCallback } from 'react';
import './FilePreview.css';

/**
 * FilePreview Component - Hiển thị preview cho file PDF, images, và Office files
 * - Office files (Word, Excel, PowerPoint): Sử dụng Microsoft Office Viewer
 * - PDF: Sử dụng Google Docs Viewer hoặc iframe trực tiếp
 * - Images: Hiển thị trực tiếp với img tag
 */
const FilePreview = ({ fileUrl, fileName, fileType, onClose, isOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [viewerType, setViewerType] = useState('direct'); // 'direct', 'microsoft', 'google'

  // Detect file type from extension
  const getFileType = useCallback(() => {
    if (fileType) return fileType;
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['txt', 'csv', 'json'].includes(ext)) return 'text';
    return 'unknown';
  }, [fileType, fileName]);

  const type = getFileType();

  // Check if file type can use Microsoft Office Viewer
  const isOfficeFile = ['word', 'excel', 'powerpoint'].includes(type);

  // Handle ESC key to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Build Microsoft Office Viewer URL
  const getMicrosoftViewerUrl = (url) => {
    const encodedUrl = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  // Build Google Docs Viewer URL (for PDF fallback)
  const getGoogleViewerUrl = (url) => {
    const encodedUrl = encodeURIComponent(url);
    return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  };

  // Load file based on type
  useEffect(() => {
    if (!isOpen || !fileUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadFile = async () => {
      try {
        // For Office files, use Microsoft Viewer directly (no fetch needed)
        if (isOfficeFile) {
          if (isMounted) {
            setViewerType('microsoft');
            setIsLoading(false);
          }
          return;
        }

        // For PDF, try direct iframe first, fallback to Google Viewer
        if (type === 'pdf') {
          // Try to fetch to verify file exists
          try {
            const response = await fetch(fileUrl, { method: 'HEAD' });
            if (response.ok) {
              if (isMounted) {
                setViewerType('direct');
                setIsLoading(false);
              }
              return;
            }
          } catch {
            // If HEAD fails, try Google Viewer
            if (isMounted) {
              setViewerType('google');
              setIsLoading(false);
            }
            return;
          }
        }

        // For images and other files, fetch and create blob URL
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          throw new Error(`File không tồn tại hoặc không thể truy cập (${response.status})`);
        }

        const contentType = response.headers.get('content-type');
        
        // Check if response is actual file (not HTML error page)
        if (contentType && contentType.includes('text/html') && type !== 'text') {
          throw new Error('File không tồn tại trên server');
        }

        const blob = await response.blob();
        
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setViewerType('direct');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading file:', err);
        if (isMounted) {
          setError(err.message || 'Không thể tải file. Vui lòng thử lại sau.');
          setIsLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, fileUrl, isOfficeFile, type]);

  // Cleanup blob URL when component unmount or modal close
  useEffect(() => {
    if (!isOpen && blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  }, [isOpen, blobUrl]);

  // Handle ESC key and body scroll
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = blobUrl || fileUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(blobUrl || fileUrl, '_blank');
  };

  // Switch to Google Viewer if Microsoft fails
  const handleViewerError = () => {
    if (viewerType === 'microsoft') {
      setViewerType('google');
    } else if (viewerType === 'direct' && type === 'pdf') {
      setViewerType('google');
    }
  };

  const getFileIcon = () => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📽️';
      case 'text': return '📃';
      default: return '📁';
    }
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="preview-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleDownload} className="btn-download">
              📥 Thử tải xuống
            </button>
            <button onClick={handleOpenInNewTab} className="btn-new-tab">
              🔗 Mở tab mới
            </button>
          </div>
        </div>
      );
    }

    // Render based on file type and viewer type
    switch (type) {
      case 'word':
      case 'excel':
      case 'powerpoint':
        return (
          <iframe
            src={viewerType === 'google' ? getGoogleViewerUrl(fileUrl) : getMicrosoftViewerUrl(fileUrl)}
            title={fileName}
            className="office-preview"
            onError={handleViewerError}
            frameBorder="0"
            allowFullScreen
          />
        );

      case 'pdf':
        if (viewerType === 'google') {
          return (
            <iframe
              src={getGoogleViewerUrl(fileUrl)}
              title={fileName}
              className="pdf-preview"
              frameBorder="0"
            />
          );
        }
        return (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            title={fileName}
            className="pdf-preview"
            onError={handleViewerError}
          />
        );

      case 'image':
        return (
          <div className="image-container">
            <img 
              src={blobUrl || fileUrl} 
              alt={fileName} 
              className="image-preview" 
            />
          </div>
        );

      case 'text':
        return (
          <iframe
            src={blobUrl || fileUrl}
            title={fileName}
            className="text-preview"
          />
        );

      default:
        return (
          <div className="preview-unsupported">
            <span className="file-icon-large">{getFileIcon()}</span>
            <p>Không hỗ trợ preview trực tiếp cho loại file này</p>
            <p className="sub-text">Vui lòng tải xuống để xem file</p>
            <div className="error-actions">
              <button onClick={handleDownload} className="btn-download">
                📥 Tải xuống
              </button>
              <button onClick={handleOpenInNewTab} className="btn-new-tab">
                🔗 Mở tab mới
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="file-preview-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">
            <span className="file-type-icon">{getFileIcon()}</span>
            <span className="file-name-text" title={fileName}>{fileName}</span>
            {isOfficeFile && viewerType === 'microsoft' && (
              <span className="viewer-badge">Microsoft Viewer</span>
            )}
            {viewerType === 'google' && (
              <span className="viewer-badge google">Google Viewer</span>
            )}
          </div>
          <div className="preview-actions">
            <button 
              className="action-btn" 
              onClick={handleOpenInNewTab} 
              title="Mở trong tab mới"
            >
              🔗
            </button>
            <button 
              className="action-btn" 
              onClick={handleDownload} 
              title="Tải xuống"
            >
              📥
            </button>
            <button 
              className="action-btn close-btn" 
              onClick={onClose} 
              title="Đóng (ESC)"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="preview-content">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
