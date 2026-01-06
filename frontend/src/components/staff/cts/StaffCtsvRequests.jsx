import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { authService } from '../../../services';
import certificateRequestService from '../../../services/certificateRequest';
import fileService from '../../../services/file';
import socketService from '../../../services/socket';
import StaffDormitoryRequests from '../dormitory/StaffDormitoryRequests';
import { SemesterFilter, FilePreview, ConfirmDialog } from '../../common';
import ActivityLog from './ActivityLog';
import './ActivityLog.css';
import './StaffCtsvRequests.css';
import '../staffPages.css';

const STATUS_CONFIG = {
  'ĐANG XỬ LÝ': { className: 'processing', icon: '⏳', color: '#f59e0b' },
  'HỢP LỆ': { className: 'approved', icon: '✓', color: '#22c55e' },
  'KHÔNG HỢP LỆ': { className: 'rejected', icon: '✕', color: '#ef4444' }
};

const StaffCtsvRequests = () => {
  // Check staff type - if KTX, render dormitory requests instead
  const staffType = authService.getStaffType();
  const isKTX = staffType === 'KTX';
  
  // If KTX staff, render dormitory component
  if (isKTX) {
    return <StaffDormitoryRequests />;
  }
  
  // Otherwise, render CTSV requests
  // State cho dữ liệu từ API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    action: null
  });
  
  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const selectedRequestRef = useRef(null); // Ref để tránh dependency loop trong socket listener
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateSort, setDateSort] = useState('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableNote, setEditableNote] = useState('');
  const [editableFile, setEditableFile] = useState(null);
  const [editableFileInput, setEditableFileInput] = useState(null); // File input khi edit
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false); // Loading khi save file
  const [isSavingNote, setIsSavingNote] = useState(false); // Loading khi save note
  const [wantToDeleteFile, setWantToDeleteFile] = useState(false); // Đánh dấu muốn xóa file
  const [previewFile, setPreviewFile] = useState(null); // For file preview modal

  // Helper function để transform request từ API response sang format UI
  const transformRequestFromAPI = useCallback((req) => ({
    id: req.requestCode || req._id,
    _id: req._id,
    student: {
      name: req.student?.fullName || 'Không xác định',
      email: req.student?.user?.email || '',
      phone: req.student?.phone || '',
      faculty: req.student?.major?.faculty?.name || '',
      major: req.student?.major?.name || ''
    },
    certificateType: req.certificateType?.name || 'Không xác định',
    certificateName: req.certificateName?.name || 'Không xác định',
    semester: req.semester || '',
    requestDate: req.requestDate ? new Date(req.requestDate).toLocaleDateString('vi-VN') : '',
    status: req.status || 'ĐANG XỬ LÝ',
    responseTime: req.responseTime ? new Date(req.responseTime).toLocaleString('vi-VN') : null,
    notes: req.notes || '',
    staffFile: req.staffFile?.fileName ? req.staffFile : null,
    processingHistory: req.processingHistory?.map(h => ({
      action: h.status,
      staff: h.staffId?.user?.name || h.staffId?.staffType || 'Staff',
      date: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : '',
      notes: h.notes || ''
    })) || [],
    // Activity log từ database - tracking mọi hoạt động của staff
    activityLog: req.activityLog || []
  }), []);

  // Fetch requests từ API
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificateRequestService.getAllRequests();
      if (response.success && response.data) {
        // Transform data từ API sang format UI
        const transformedRequests = response.data.map(transformRequestFromAPI);
        setRequests(transformedRequests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [transformRequestFromAPI]);

  // Fetch data khi component mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Sync selectedRequest ref để dùng trong socket listener
  useEffect(() => {
    selectedRequestRef.current = selectedRequest;
  }, [selectedRequest]);

  // Socket.IO realtime updates - khi có yêu cầu mới từ sinh viên
  useEffect(() => {
    // Kết nối socket
    socketService.connect();

    // Lắng nghe sự kiện có yêu cầu CTSV mới từ sinh viên
    socketService.onCertificateRequestCreated((data) => {
      console.log('📩 New certificate request from student:', data);
      // Thêm trực tiếp vào state mà không fetch lại (tránh loading)
      if (data.request) {
        const newRequest = transformRequestFromAPI({
          _id: data.request._id,
          requestCode: data.request.requestCode,
          student: data.request.student || { user: { name: 'Sinh viên mới' }, studentId: '' },
          certificateType: data.request.certificateType,
          certificateName: data.request.certificateName,
          semester: data.request.semester,
          status: data.request.status,
          createdAt: data.request.createdAt,
          notes: data.request.notes
        });
        setRequests(prev => [newRequest, ...prev]);
      }
      // Hiển thị toast thông báo
      showToast('Có yêu cầu CTSV mới!', 'info');
    });

    // Lắng nghe sự kiện yêu cầu được cập nhật (để đồng bộ giữa các staff)
    socketService.onCertificateRequestUpdated((data) => {
      console.log('📩 Certificate request updated:', data);
      
      // Cập nhật trực tiếp trong state thay vì fetch lại toàn bộ
      // Điều này tránh "refresh" khi chính mình duyệt
      setRequests(prev => prev.map(req => {
        if (req._id === data.requestId) {
          return {
            ...req,
            status: data.status || data.request?.status || req.status,
            responseTime: data.request?.responseTime 
              ? new Date(data.request.responseTime).toLocaleString('vi-VN') 
              : req.responseTime
          };
        }
        return req;
      }));

      // Cập nhật selectedRequest nếu đang được chọn (bởi staff khác)
      const currentSelected = selectedRequestRef.current;
      if (currentSelected && data.requestId === currentSelected._id) {
        if (data.request) {
          setSelectedRequest(prev => prev ? ({
            ...prev,
            status: data.request.status || data.status,
            notes: data.request.notes || prev.notes,
            staffFile: data.request.staffFile || prev.staffFile,
            processingHistory: data.request.processingHistory?.map(h => ({
              action: h.status,
              staff: h.staffId?.user?.name || h.staffId?.staffType || 'Staff',
              date: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : '',
              notes: h.notes || ''
            })) || prev.processingHistory
          }) : null);
        }
      }
    });

    // Cleanup khi unmount
    return () => {
      socketService.off('CERTIFICATE_REQUEST_CREATED');
      socketService.off('CERTIFICATE_REQUEST_UPDATED');
    };
  }, [fetchRequests, showToast]);

  // Get selected semester info for filtering (không cần dùng SEMESTERS nữa - SemesterFilter tự fetch)
  // Filtering sẽ dựa trên semesterFilter value trực tiếp

  // Statistics
  const stats = useMemo(() => ({
    total: requests.length,
    processing: requests.filter(r => r.status === 'ĐANG XỬ LÝ').length,
    approved: requests.filter(r => r.status === 'HỢP LỆ').length,
    rejected: requests.filter(r => r.status === 'KHÔNG HỢP LỆ').length
  }), [requests]);

  // Get unique certificate types
  const certificateTypes = useMemo(() => 
    [...new Set(requests.map(r => r.certificateType))],
    [requests]
  );

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.id.toLowerCase().includes(term) ||
        r.student.name.toLowerCase().includes(term) ||
        r.student.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(r => r.certificateType === typeFilter);
    }

    // Semester filter - so sánh trực tiếp với semester name
    if (semesterFilter !== 'all') {
      result = result.filter(r => r.semester === semesterFilter);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(r => {
        const requestDate = r.requestDate.split('/').reverse().join('-');
        return requestDate === dateFilter;
      });
    }

    // Date sort
    result.sort((a, b) => {
      const dateA = new Date(a.requestDate.split('/').reverse().join('-'));
      const dateB = new Date(b.requestDate.split('/').reverse().join('-'));
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [requests, searchTerm, statusFilter, typeFilter, semesterFilter, dateFilter, dateSort]);

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setEditableNote(request.notes || '');
    setEditableFile(request.staffFile?.fileName || null);
    setIsEditingFile(false);
    setIsEditingNote(false);
  };

  // Xử lý duyệt/từ chối yêu cầu - mở dialog xác nhận
  const handleProcess = (action) => {
    if (!selectedRequest) return;
    
    // Kiểm tra nếu đang edit file mà chưa lưu
    if (isEditingFile && editableFileInput) {
      showToast('Vui lòng lưu file trước khi xử lý yêu cầu (ấn nút X để lưu)!', 'warning');
      return;
    }
    
    // Kiểm tra nếu đang edit file và muốn xóa file (chưa lưu)
    if (isEditingFile && wantToDeleteFile) {
      showToast('Bạn đang muốn xóa file nhưng chưa lưu. Vui lòng lưu thay đổi trước khi xử lý yêu cầu!', 'warning');
      return;
    }
    
    // Kiểm tra nếu đang edit ghi chú mà chưa lưu
    if (isEditingNote && editableNote !== selectedRequest.notes) {
      showToast('Vui lòng lưu ghi chú trước khi xử lý yêu cầu (ấn nút X để lưu)!', 'warning');
      return;
    }
    
    // Validation - kiểm tra thông tin ĐÃ LƯU trong database
    const hasFile = !!selectedRequest.staffFile;
    const hasNote = !!(selectedRequest.notes?.trim());
    
    if (action === 'approve') {
      // Duyệt: phải có CẢ file VÀ ghi chú đã lưu
      if (!hasFile || !hasNote) {
        let missingItems = [];
        if (!hasFile) missingItems.push('file phản hồi');
        if (!hasNote) missingItems.push('ghi chú');
        showToast(`Vui lòng thêm và LƯU ${missingItems.join(' và ')} trước khi duyệt yêu cầu!`, 'error');
        return;
      }
    } else if (action === 'reject') {
      // Từ chối: bắt buộc phải có ghi chú đã lưu (lý do từ chối)
      if (!hasNote) {
        showToast('Vui lòng nhập và LƯU lý do từ chối trong phần "Ghi chú / Lưu ý"!', 'error');
        return;
      }
    }
    
    // Mở dialog xác nhận
    setConfirmDialog({
      isOpen: true,
      title: action === 'approve' ? 'Xác nhận duyệt yêu cầu' : 'Xác nhận từ chối yêu cầu',
      message: action === 'approve' 
        ? `Bạn có chắc chắn muốn duyệt yêu cầu ${selectedRequest.id} của sinh viên ${selectedRequest.student.name}?`
        : `Bạn có chắc chắn muốn từ chối yêu cầu ${selectedRequest.id} của sinh viên ${selectedRequest.student.name}?`,
      type: action === 'approve' ? 'success' : 'danger',
      action: action
    });
  };

  // Xử lý khi xác nhận trong dialog
  const handleConfirmProcess = async () => {
    const action = confirmDialog.action;
    if (!action || !selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      const status = action === 'approve' ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ';
      const requestId = selectedRequest._id;
      
      // Gọi API cập nhật trạng thái và LẤY RESPONSE
      const response = await certificateRequestService.updateRequestStatus(requestId, {
        status,
        notes: selectedRequest.notes || '',
        staffFile: selectedRequest.staffFile || null
      });

      if (response.success && response.data) {
        // Cập nhật trực tiếp vào state thay vì fetch lại toàn bộ
        const updatedRequest = {
          ...selectedRequest,
          status: response.data.status,
          responseTime: response.data.responseTime ? new Date(response.data.responseTime).toLocaleString('vi-VN') : null,
          activityLog: response.data.activityLog || [],
          processingHistory: response.data.processingHistory?.map(h => ({
            action: h.status,
            staff: h.staffId?.user?.name || h.staffId?.staffType || 'Staff',
            date: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : '',
            notes: h.notes || ''
          })) || []
        };

        // Cập nhật trong danh sách
        setRequests(prev => prev.map(req => 
          req._id === requestId ? updatedRequest : req
        ));

        // Cập nhật selectedRequest với status mới (GIỮ panel mở)
        setSelectedRequest(updatedRequest);
      }
      
      // Đóng dialog và reset states
      setConfirmDialog({ isOpen: false, title: '', message: '', type: 'confirm', action: null });
      setEditableFileInput(null);
      
      showToast(status === 'HỢP LỆ' ? 'Duyệt yêu cầu thành công!' : 'Từ chối yêu cầu thành công!', 'success');
    } catch (err) {
      console.error('Error processing request:', err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đóng confirm dialog
  const handleCancelConfirm = () => {
    if (!isSubmitting) {
      setConfirmDialog({ isOpen: false, title: '', message: '', type: 'confirm', action: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditableFile(file.name);
      setEditableFileInput(file); // Lưu file object để upload sau
      setWantToDeleteFile(false); // Reset flag vì đang chọn file mới
    }
  };

  // Hàm lưu file lên Firebase và cập nhật vào database
  const handleSaveFile = async () => {
    if (!editableFileInput || !selectedRequest) return;
    
    try {
      setIsSavingFile(true);
      
      // 1. Upload file lên Firebase Storage
      const uploadResult = await fileService.uploadFile(editableFileInput, 'certificate-requests');
      
      if (uploadResult.success) {
        // 2. Cập nhật request với file mới và LẤY RESPONSE từ API
        const updateResponse = await certificateRequestService.updateRequestStatus(selectedRequest._id, {
          status: selectedRequest.status,
          notes: selectedRequest.notes || '',
          staffFile: uploadResult.data
        });
        
        if (updateResponse.success && updateResponse.data) {
          // 3. Transform response từ API - có đầy đủ activityLog mới
          const updatedData = {
            ...selectedRequest,
            staffFile: updateResponse.data.staffFile,
            activityLog: updateResponse.data.activityLog || []
          };
          
          // 4. Cập nhật selectedRequest với data mới từ server
          setSelectedRequest(updatedData);
          
          // 5. Cập nhật trong danh sách requests
          setRequests(prev => prev.map(req => 
            req._id === selectedRequest._id 
              ? updatedData
              : req
          ));
          
          // 6. Cập nhật editableFile để hiển thị đúng
          setEditableFile(updateResponse.data.staffFile?.fileName);
          setWantToDeleteFile(false);
        }
        
        showToast('Lưu file thành công!', 'success');
      }
    } catch (err) {
      console.error('Error saving file:', err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi lưu file', 'error');
    } finally {
      setIsSavingFile(false);
      setIsEditingFile(false);
      setEditableFileInput(null);
    }
  };

  // Hàm xóa file khỏi database
  const handleDeleteFile = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSavingFile(true);
      
      // Cập nhật request với staffFile = null và LẤY RESPONSE từ API
      const updateResponse = await certificateRequestService.updateRequestStatus(selectedRequest._id, {
        status: selectedRequest.status,
        notes: selectedRequest.notes || '',
        staffFile: null
      });
      
      if (updateResponse.success && updateResponse.data) {
        // Transform response - có đầy đủ activityLog mới
        const updatedData = {
          ...selectedRequest,
          staffFile: null,
          activityLog: updateResponse.data.activityLog || []
        };
        
        // Cập nhật selectedRequest với data mới từ server
        setSelectedRequest(updatedData);
        
        // Cập nhật trong danh sách requests
        setRequests(prev => prev.map(req => 
          req._id === selectedRequest._id 
            ? updatedData
            : req
        ));
        
        // Reset states
        setEditableFile(null);
        setWantToDeleteFile(false);
      }
      
      showToast('Đã xóa file!', 'success');
    } catch (err) {
      console.error('Error deleting file:', err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi xóa file', 'error');
    } finally {
      setIsSavingFile(false);
      setIsEditingFile(false);
      setEditableFileInput(null);
    }
  };

  // Hàm lưu ghi chú vào database
  const handleSaveNote = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSavingNote(true);
      
      // Cập nhật request với note mới và LẤY RESPONSE từ API
      const updateResponse = await certificateRequestService.updateRequestStatus(selectedRequest._id, {
        status: selectedRequest.status,
        notes: editableNote,
        staffFile: selectedRequest.staffFile || null
      });
      
      if (updateResponse.success && updateResponse.data) {
        // Transform response - có đầy đủ activityLog mới
        const updatedData = {
          ...selectedRequest,
          notes: editableNote,
          activityLog: updateResponse.data.activityLog || []
        };
        
        // Cập nhật selectedRequest với data mới từ server
        setSelectedRequest(updatedData);
        
        // Cập nhật trong danh sách requests
        setRequests(prev => prev.map(req => 
          req._id === selectedRequest._id 
            ? updatedData
            : req
        ));
      }
      
      showToast('Lưu ghi chú thành công!', 'success');
    } catch (err) {
      console.error('Error saving note:', err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi lưu ghi chú', 'error');
    } finally {
      setIsSavingNote(false);
      setIsEditingNote(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="ctsv-management">
        <div className="ctsv-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách yêu cầu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ctsv-management">
        <div className="ctsv-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchRequests}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ctsv-management">
      {/* Header */}
      <header className="ctsv-header">
        <div className="ctsv-header__info">
          <h1>Quản lý yêu cầu CTSV</h1>
          <p>Xử lý và theo dõi các yêu cầu chứng nhận từ sinh viên</p>
        </div>
        <div className="ctsv-header__actions">
          <button className="btn-export">
            <span className="btn-icon">📊</span>
            Xuất báo cáo
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="ctsv-stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📋</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.total}</span>
            <span className="stat-card__label">Tổng yêu cầu</span>
          </div>
        </div>
        <div className="stat-card stat-card--processing" onClick={() => setStatusFilter(statusFilter === 'ĐANG XỬ LÝ' ? 'all' : 'ĐANG XỬ LÝ')}>
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.processing}</span>
            <span className="stat-card__label">Đang xử lý</span>
          </div>
          {stats.processing > 0 && <span className="stat-card__badge pulse">Cần xử lý</span>}
        </div>
        <div className="stat-card stat-card--approved" onClick={() => setStatusFilter(statusFilter === 'HỢP LỆ' ? 'all' : 'HỢP LỆ')}>
          <div className="stat-card__icon">✓</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.approved}</span>
            <span className="stat-card__label">Hợp lệ</span>
          </div>
        </div>
        <div className="stat-card stat-card--rejected" onClick={() => setStatusFilter(statusFilter === 'KHÔNG HỢP LỆ' ? 'all' : 'KHÔNG HỢP LỆ')}>
          <div className="stat-card__icon">✕</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.rejected}</span>
            <span className="stat-card__label">Không hợp lệ</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="ctsv-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã yêu cầu, tên SV hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ĐANG XỬ LÝ">Đang xử lý</option>
            <option value="HỢP LỆ">Hợp lệ</option>
            <option value="KHÔNG HỢP LỆ">Không hợp lệ</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả loại chứng nhận</option>
            {certificateTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {/* Semester Filter Component */}
          <SemesterFilter
            value={semesterFilter}
            onChange={setSemesterFilter}
            dateValue={dateFilter}
            onDateChange={setDateFilter}
            showInfoBar={false}
          />
          {/* Sort Order - Toggle Icon Button */}
          <button 
            className="sort-toggle-btn"
            onClick={() => setDateSort(dateSort === 'newest' ? 'oldest' : 'newest')}
            title={dateSort === 'newest' ? 'Mới nhất trước' : 'Cũ nhất trước'}
          >
            {dateSort === 'newest' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 6h6v2H3V6zm0 12v-2h18v2H3zm0-7h12v2H3v-2z"/>
              </svg>
            )}
            <span className="sort-arrow">{dateSort === 'newest' ? '↓' : '↑'}</span>
          </button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="ctsv-main">
        {/* Left Panel - Request List */}
        <div className="ctsv-list-panel">
          <div className="panel-header">
            <span className="panel-title">Danh sách yêu cầu</span>
            <span className="panel-count">{filteredRequests.length} yêu cầu</span>
          </div>
          <div className="request-list">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Không tìm thấy yêu cầu nào</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div
                  key={request.id}
                  className={`request-card ${selectedRequest?.id === request.id ? 'active' : ''} ${request.status === 'ĐANG XỬ LÝ' ? 'pending' : ''}`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="request-card__header">
                    <span className="request-code">#{request.id}</span>
                    <span className={`status-badge ${STATUS_CONFIG[request.status].className}`}>
                      {STATUS_CONFIG[request.status].icon} {request.status}
                    </span>
                  </div>
                  <div className="request-card__body">
                    <div className="student-brief">
                      <span className="student-avatar">
                        {request.student.name.charAt(request.student.name.lastIndexOf(' ') + 1)}
                      </span>
                      <div className="student-info">
                        <span className="student-name">{request.student.name}</span>
                        <span className="student-id">{request.student.email}</span>
                      </div>
                    </div>
                    <div className="request-meta">
                      <span className="cert-type">{request.certificateType}</span>
                      <span className="request-date">📅 {request.requestDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className={`ctsv-detail-panel ${selectedRequest ? 'has-content' : ''}`}>
          {selectedRequest ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>Chi tiết yêu cầu #{selectedRequest.id}</h2>
                  <span className={`status-badge large ${STATUS_CONFIG[selectedRequest.status].className}`}>
                    {STATUS_CONFIG[selectedRequest.status].icon} {selectedRequest.status}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setSelectedRequest(null)}>×</button>
              </div>

              <div className="detail-content">
                {/* Student Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Thông tin sinh viên
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ và tên</label>
                      <span>{selectedRequest.student.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <a href={`mailto:${selectedRequest.student.email}`}>{selectedRequest.student.email}</a>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại</label>
                      <a href={`tel:${selectedRequest.student.phone}`}>{selectedRequest.student.phone}</a>
                    </div>
                    <div className="info-item">
                      <label>Khoa</label>
                      <span>{selectedRequest.student.faculty}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngành</label>
                      <span>{selectedRequest.student.major}</span>
                    </div>
                  </div>
                </section>

                {/* Request Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">📝</span>
                    Thông tin yêu cầu
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Loại chứng nhận</label>
                      <span className="highlight">{selectedRequest.certificateType}</span>
                    </div>
                    <div className="info-item">
                      <label>Tên chứng nhận</label>
                      <span>{selectedRequest.certificateName}</span>
                    </div>
                    <div className="info-item">
                      <label>Học kỳ</label>
                      <span>{selectedRequest.semester}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày yêu cầu</label>
                      <span>{selectedRequest.requestDate}</span>
                    </div>
                    {selectedRequest.responseTime && (
                      <div className="info-item">
                        <label>Phản hồi lúc</label>
                        <span style={{whiteSpace: 'pre-line'}}>{selectedRequest.responseTime}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Staff Response Section - File đính kèm từ Staff */}
                <section className="detail-section staff-response-section">
                  <h3 className="section-title">
                    <span className="section-icon">📎</span>
                    File phản hồi (từ Staff)
                    {selectedRequest.status === 'ĐANG XỬ LÝ' && !isSavingFile && (
                      <button 
                        className={`section-edit-btn ${isEditingFile ? 'close-btn' : ''}`}
                        onClick={async () => {
                          if (isEditingFile) {
                            if (editableFileInput) {
                              // Có file mới -> upload và lưu vào database
                              await handleSaveFile();
                            } else if (wantToDeleteFile && selectedRequest.staffFile) {
                              // Muốn xóa file hiện tại -> xóa khỏi database
                              await handleDeleteFile();
                            } else {
                              // Không có thay đổi, chỉ đóng edit mode
                              setIsEditingFile(false);
                              setEditableFile(null);
                              setWantToDeleteFile(false);
                            }
                          } else {
                            // Mở edit mode - load file hiện tại nếu có
                            setIsEditingFile(true);
                            setWantToDeleteFile(false);
                            if (selectedRequest.staffFile) {
                              setEditableFile(selectedRequest.staffFile.fileName);
                            } else {
                              setEditableFile(null);
                            }
                            setEditableFileInput(null);
                          }
                        }}
                        title={isEditingFile ? 'Lưu và đóng' : 'Chỉnh sửa'}
                        disabled={isSavingFile}
                      >
                        {isEditingFile ? '✕' : '✏️'}
                      </button>
                    )}
                    {isSavingFile && <span className="saving-indicator">Đang lưu...</span>}
                  </h3>
                  {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditingFile ? (
                    <div className="file-upload-box" style={{marginTop: '8px'}}>
                      <input 
                        type="file" 
                        id="file-upload-edit" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                        onChange={handleFileChange}
                        hidden 
                      />
                      {editableFile ? (
                        <div className="file-selected">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{editableFile}</span>
                          <button 
                            type="button" 
                            className="file-remove" 
                            onClick={() => {
                              setEditableFile(null);
                              setEditableFileInput(null);
                              // Đánh dấu muốn xóa file nếu đang có file từ database
                              if (selectedRequest.staffFile) {
                                setWantToDeleteFile(true);
                              }
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="file-upload-edit" className="file-upload-label" style={{padding: '16px'}}>
                          <span className="upload-icon">📁</span>
                          <span>{wantToDeleteFile ? 'File sẽ bị xóa - Click để chọn file mới' : 'Click để chọn file phản hồi'}</span>
                        </label>
                      )}
                    </div>
                  ) : selectedRequest.staffFile ? (
                    <div 
                      className="file-display clickable"
                      onClick={() => setPreviewFile({
                        url: selectedRequest.staffFile.fileUrl,
                        name: selectedRequest.staffFile.fileName
                      })}
                      title="Click để xem file"
                    >
                      <span className="file-icon">📄</span>
                      <span className="file-name">{selectedRequest.staffFile.fileName}</span>
                    </div>
                  ) : (
                    <span style={{color: 'var(--ctsv-text-muted)', fontStyle: 'italic'}}>Chưa có file phản hồi</span>
                  )}
                </section>

                {/* Notes Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">💬</span>
                    Ghi chú / Lưu ý
                    {selectedRequest.status === 'ĐANG XỬ LÝ' && !isSavingNote && (
                      <button 
                        className={`section-edit-btn ${isEditingNote ? 'close-btn' : ''}`}
                        onClick={async () => {
                          if (isEditingNote && editableNote !== selectedRequest.notes) {
                            // Có thay đổi -> lưu vào database
                            await handleSaveNote();
                          } else {
                            // Toggle edit mode
                            setIsEditingNote(!isEditingNote);
                          }
                        }}
                        title={isEditingNote ? 'Lưu và đóng' : 'Chỉnh sửa'}
                        disabled={isSavingNote}
                      >
                        {isEditingNote ? '✕' : '✏️'}
                      </button>
                    )}
                    {isSavingNote && <span className="saving-indicator">Đang lưu...</span>}
                  </h3>
                  {selectedRequest.status === 'ĐANG XỬ LÝ' && isEditingNote ? (
                    <div className="notes-edit-container">
                      <textarea
                        className="notes-editable"
                        rows="4"
                        value={editableNote}
                        onChange={(e) => setEditableNote(e.target.value)}
                        placeholder="Nhập ghi chú..."
                      />
                    </div>
                  ) : (
                    <div className={`notes-box ${!editableNote ? 'empty' : ''}`}>
                      {editableNote || 'Không có ghi chú'}
                    </div>
                  )}
                </section>

                {/* Processing History - ActivityLog Component */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">📜</span>
                    Lịch sử hoạt động
                  </h3>
                  <ActivityLog 
                    activityLog={selectedRequest.activityLog || []}
                  />
                </section>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'ĐANG XỬ LÝ' && (
                <div className="detail-actions">
                  <button className="btn-action btn-approve" onClick={() => handleProcess('approve')}>
                    <span>✓</span> Duyệt yêu cầu
                  </button>
                  <button className="btn-action btn-reject" onClick={() => handleProcess('reject')}>
                    <span>✕</span> Từ chối
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="detail-empty">
              <div className="empty-illustration">
                <span>📋</span>
              </div>
              <h3>Chọn một yêu cầu để xem chi tiết</h3>
              <p>Click vào yêu cầu bên trái để xem thông tin đầy đủ và xử lý</p>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreview
        isOpen={!!previewFile}
        fileUrl={previewFile?.url}
        fileName={previewFile?.name}
        onClose={() => setPreviewFile(null)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối'}
        cancelText="Hủy"
        onConfirm={handleConfirmProcess}
        onCancel={handleCancelConfirm}
        isLoading={isSubmitting}
      />

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default StaffCtsvRequests;
