import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../../services/student';
import { facultyService } from '../../../services/faculty';
import { majorService } from '../../../services/major';
import socketService from '../../../services/socket';
import StudentFormModal from './StudentFormModal';
import RoomTransferDialog from '../../common/RoomTransferDialog';
import ExportCSVButton from '../../common/ExportCSVButton';
import SMCustomDropdown from './SMCustomDropdown';
import './StudentManagement.css';

/**
 * StudentManagement - Quản lý sinh viên
 * Gọi API thật, không dùng mock data
 */
const StudentManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'dormitory'

  // Data states
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterMajor, setFilterMajor] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDormStatus, setFilterDormStatus] = useState('all'); // 'all', 'yes', 'no'

  // Custom dropdown state for room filter
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation - Enhanced with preview data
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, 
    student: null, 
    preview: null, 
    isLoading: false,
    isDeleting: false 
  });

  // Bulk delete confirmation
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ 
    show: false, 
    preview: null,
    isLoading: false 
  });
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Room transfer dialog
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Multiple selection
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [studentsRes, facultiesRes, majorsRes, roomsRes] = await Promise.all([
        studentService.getAll({ limit: 1000 }),
        facultyService.getAllFaculties(),
        majorService.getAllMajors(),
        studentService.getAvailableRooms()
      ]);

      setStudents(studentsRes.data || []);
      setFaculties(facultiesRes.data || []);
      setMajors(majorsRes.data || []);
      setAvailableRooms(roomsRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Không thể tải dữ liệu', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // SOCKET.IO REALTIME - Cập nhật khi xóa sinh viên
  // ==========================================
  useEffect(() => {
    // Kết nối socket
    socketService.connect();

    // Lắng nghe sự kiện cập nhật phòng KTX (khi xóa sinh viên)
    socketService.onStudentRoomUpdated((data) => {
      console.log('📡 [Socket] Student room updated:', data);
      // Refresh lại dữ liệu sinh viên để cập nhật số thành viên trong phòng
      fetchData();
    });

    // Cleanup khi unmount
    return () => {
      socketService.off('STUDENT_ROOM_UPDATED');
    };
  }, [fetchData]);

  // Reload available rooms when needed
  const refreshAvailableRooms = async () => {
    try {
      const roomsRes = await studentService.getAvailableRooms();
      setAvailableRooms(roomsRes.data || []);
    } catch (error) {
      console.error('Error refreshing rooms:', error);
    }
  };



  // Filter majors based on selected faculty
  const filteredMajorsByFaculty = useMemo(() => {
    if (filterFaculty === 'all') return majors;
    return majors.filter(major => {
      const majorFacultyId = major.faculty?._id || major.faculty;
      return majorFacultyId === filterFaculty;
    });
  }, [majors, filterFaculty]);

  // Filter students
  const filteredStudents = useMemo(() => {
    let dataSource = students;
    
    // Filter by dormitory if on dormitory tab
    if (activeTab === 'dormitory') {
      dataSource = students.filter(s => s.isDormResident);
    }

    return dataSource.filter(student => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.user?.email?.toLowerCase().includes(searchLower);

      // Filters cho tab "Tất cả sinh viên": Khoa + Chuyên ngành + Tình trạng KTX
      const studentFacultyId = student.major?.faculty?._id || student.major?.faculty;
      const matchesFaculty = activeTab === 'dormitory' || filterFaculty === 'all' || studentFacultyId === filterFaculty;
      const matchesMajor = activeTab === 'dormitory' || filterMajor === 'all' || student.major?._id === filterMajor;
      
      // Filter tình trạng ở KTX (chỉ áp dụng cho tab "Tất cả sinh viên")
      let matchesDormStatus = true;
      if (activeTab === 'students' && filterDormStatus !== 'all') {
        matchesDormStatus = filterDormStatus === 'yes' ? student.isDormResident : !student.isDormResident;
      }
      
      // Filter cho tab "Sinh viên ở KTX": chỉ có Phòng
      const matchesRoom = activeTab !== 'dormitory' || filterRoom === 'all' || 
                          (student.roomId?._id || student.roomId) === filterRoom;

      return matchesSearch && matchesFaculty && matchesMajor && matchesDormStatus && matchesRoom;
    });
  }, [students, activeTab, searchTerm, filterFaculty, filterMajor, filterDormStatus, filterRoom]);

  // Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  // Get unique rooms from dormitory students - Sắp xếp theo tên phòng
  const dormitoryRooms = useMemo(() => {
    const rooms = students
      .filter(s => s.isDormResident && s.roomId)
      .map(s => s.roomId)
      .filter((room, index, self) => 
        room && self.findIndex(r => (r._id || r) === (room._id || room)) === index
      )
      .sort((a, b) => {
        const nameA = (a.name || '').toString();
        const nameB = (b.name || '').toString();
        return nameA.localeCompare(nameB, 'vi', { numeric: true });
      });
    return rooms;
  }, [students]);

  // Filtered rooms based on search
  const filteredRooms = useMemo(() => {
    if (!roomSearchTerm.trim()) return dormitoryRooms;
    return dormitoryRooms.filter(room => 
      (room.name || room).toLowerCase().includes(roomSearchTerm.toLowerCase())
    );
  }, [dormitoryRooms, roomSearchTerm]);

  // Statistics - Thay đổi theo bộ lọc
  const stats = useMemo(() => {
    // Dựa vào tab hiện tại và bộ lọc
    if (activeTab === 'students') {
      // Tab "Tất cả sinh viên" - thống kê theo bộ lọc Khoa/Chuyên ngành
      return {
        total: filteredStudents.length,
        dormitory: filteredStudents.filter(s => s.isDormResident).length,
        roomCount: 0 // Không dùng ở tab này
      };
    } else {
      // Tab "Sinh viên ở KTX" - thống kê theo bộ lọc Phòng
      // Đếm số phòng unique từ danh sách sinh viên đang hiển thị
      const uniqueRooms = new Set(
        filteredStudents
          .filter(s => s.roomId)
          .map(s => s.roomId._id || s.roomId)
      );
      return {
        total: filteredStudents.length,
        dormitory: filteredStudents.length, // Tất cả đều ở KTX trong tab này
        roomCount: uniqueRooms.size // Số phòng có sinh viên
      };
    }
  }, [filteredStudents, activeTab]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleAddStudent = async () => {
    setEditingStudent(null);
    await refreshAvailableRooms();
    setShowFormModal(true);
  };

  const handleEditStudent = async (student) => {
    setEditingStudent(student);
    await refreshAvailableRooms();
    setShowFormModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Update
        const result = await studentService.update(editingStudent._id, formData);
        setStudents(prev => prev.map(s => 
          s._id === editingStudent._id ? result.data : s
        ));
        showToast('Cập nhật sinh viên thành công');
      } else {
        // Create
        const result = await studentService.create(formData);
        setStudents(prev => [...prev, result.data]);
        showToast('Thêm sinh viên thành công');
      }
      setShowFormModal(false);
    } catch (error) {
      // Re-throw để form hiển thị lỗi
      const apiError = error.response?.data || error;
      throw {
        message: apiError.message || 'Có lỗi xảy ra',
        field: apiError.field,
        errors: apiError.errors
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced delete handler - Fetch preview data first
  const handleDeleteClick = async (student) => {
    setDeleteConfirm({ 
      show: true, 
      student, 
      preview: null, 
      isLoading: true,
      isDeleting: false 
    });

    try {
      const result = await studentService.getDeletePreview(student._id);
      setDeleteConfirm(prev => ({
        ...prev,
        preview: result.data,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching delete preview:', error);
      // Vẫn cho phép xóa nếu không lấy được preview
      setDeleteConfirm(prev => ({
        ...prev,
        preview: {
          student: {
            _id: student._id,
            fullName: student.fullName,
            email: student.user?.email,
            isDormResident: student.isDormResident,
            roomName: student.roomId?.name || null
          },
          relatedData: {
            certificateRequests: 0,
            dormitoryRequests: 0
          }
        },
        isLoading: false
      }));
    }
  };

  // Xóa hoàn toàn sinh viên (bao gồm tất cả yêu cầu)
  const handleConfirmDeleteCompletely = async () => {
    const student = deleteConfirm.student;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const result = await studentService.delete(student._id);
      setStudents(prev => prev.filter(s => s._id !== student._id));
      
      // Build success message với thông tin chi tiết
      let message = `Đã xóa sinh viên "${student.fullName}"`;
      if (result.data?.deletedCertificateRequests > 0 || result.data?.deletedDormitoryRequests > 0) {
        const parts = [];
        if (result.data.deletedCertificateRequests > 0) {
          parts.push(`${result.data.deletedCertificateRequests} yêu cầu CTSV`);
        }
        if (result.data.deletedDormitoryRequests > 0) {
          parts.push(`${result.data.deletedDormitoryRequests} yêu cầu KTX`);
        }
        message += ` và ${parts.join(', ')}`;
      }
      showToast(message);
      await refreshAvailableRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa sinh viên', 'error');
    } finally {
      setDeleteConfirm({ show: false, student: null, preview: null, isLoading: false, isDeleting: false });
    }
  };

  // Chỉ xóa khỏi KTX (giữ lại sinh viên)
  const handleConfirmRemoveFromDormitory = async () => {
    const student = deleteConfirm.student;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const result = await studentService.removeFromDormitory(student._id);
      
      // Cập nhật state: sinh viên vẫn còn nhưng không ở KTX nữa
      setStudents(prev => prev.map(s => 
        s._id === student._id 
          ? { ...s, isDormResident: false, roomId: null }
          : s
      ));
      
      let message = result.message || `Đã xóa "${student.fullName}" khỏi KTX`;
      if (result.data?.deletedDormitoryRequests > 0) {
        message += ` và ${result.data.deletedDormitoryRequests} yêu cầu KTX`;
      }
      showToast(message);
      await refreshAvailableRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa sinh viên khỏi KTX', 'error');
    } finally {
      setDeleteConfirm({ show: false, student: null, preview: null, isLoading: false, isDeleting: false });
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    if (!deleteConfirm.isDeleting) {
      setDeleteConfirm({ show: false, student: null, preview: null, isLoading: false, isDeleting: false });
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'faculty') {
      setFilterFaculty(value);
      setFilterMajor('all');
    } else if (filterType === 'major') {
      setFilterMajor(value);
    } else if (filterType === 'room') {
      setFilterRoom(value);
    }
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedStudents.map(student => student._id);
      setSelectedStudentIds(allIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Bulk delete handlers
  const handleBulkDeleteClick = async () => {
    if (selectedStudentIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 sinh viên để xóa', 'error');
      return;
    }
    
    // Set loading state and show dialog
    setBulkDeleteConfirm({ show: true, preview: null, isLoading: true });
    
    try {
      // Get preview data
      const result = await studentService.getBulkDeletePreview(selectedStudentIds);
      setBulkDeleteConfirm({ show: true, preview: result.data, isLoading: false });
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tải thông tin xem trước', 'error');
      setBulkDeleteConfirm({ show: false, preview: null, isLoading: false });
    }
  };

  const handleConfirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const result = await studentService.bulkDelete(selectedStudentIds);
      
      // Remove deleted students from state
      setStudents(prev => prev.filter(s => !selectedStudentIds.includes(s._id)));
      
      // Clear selection
      setSelectedStudentIds([]);
      
      // Show success message
      showToast(result.message || `Đã xóa ${selectedStudentIds.length} sinh viên thành công`);
      
      // Refresh available rooms
      await refreshAvailableRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa sinh viên', 'error');
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteConfirm({ show: false, preview: null, isLoading: false });
    }
  };

  // Xóa hàng loạt khỏi KTX (giữ lại sinh viên)
  const handleConfirmBulkRemoveFromDormitory = async () => {
    setIsBulkDeleting(true);
    try {
      // Chỉ gửi IDs của sinh viên đang ở KTX
      const dormResidentIds = students
        .filter(s => selectedStudentIds.includes(s._id) && s.isDormResident)
        .map(s => s._id);

      if (dormResidentIds.length === 0) {
        showToast('Không có sinh viên nào đang ở KTX để xóa', 'error');
        return;
      }

      const result = await studentService.bulkRemoveFromDormitory(dormResidentIds);
      
      // Update students in state
      setStudents(prev => prev.map(s => 
        dormResidentIds.includes(s._id) 
          ? { ...s, isDormResident: false, roomId: null } 
          : s
      ));
      
      // Clear selection
      setSelectedStudentIds([]);
      
      // Show success message
      showToast(result.message || `Đã xóa ${dormResidentIds.length} sinh viên khỏi KTX`);
      
      // Refresh available rooms
      await refreshAvailableRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa sinh viên khỏi KTX', 'error');
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteConfirm({ show: false, preview: null, isLoading: false });
    }
  };

  // Room transfer handlers
  const handleTransferClick = () => {
    if (selectedStudentIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 sinh viên để chuyển phòng', 'error');
      return;
    }
    setShowTransferDialog(true);
  };

  const handleTransferSuccess = async (result) => {
    showToast(result.message || 'Chuyển phòng thành công');
    
    // Clear selection
    setSelectedStudentIds([]);
    
    // Refresh data
    await fetchData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="student-management-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sinh viên...</p>
      </div>
    );
  }

  return (
    <div className="student-management">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý sinh viên</h1>
            <p className="page-subtitle">Quản lý thông tin sinh viên trong hệ thống</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary btn-import-csv" 
              onClick={() => navigate('/admin/students/import')}
            >
              <span className="btn-icon">📥</span>
              Import CSV
            </button>
            <button className="btn btn-primary" onClick={handleAddStudent}>
              <span className="btn-icon">+</span>
              Thêm sinh viên
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setFilterRoom('all');
              setCurrentPage(1);
            }}
          >
            <span className="tab-icon">👨‍🎓</span>
            <span className="tab-text">Tất cả sinh viên</span>
            <span className="tab-badge">{stats.total}</span>
          </button>
          <button
            className={`tab ${activeTab === 'dormitory' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dormitory');
              setCurrentPage(1);
            }}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-text">Sinh viên ở KTX</span>
            <span className="tab-badge">{stats.dormitory}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>{activeTab === 'dormitory' ? 'Sinh viên ở KTX' : 'Tổng sinh viên'}</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">{activeTab === 'dormitory' ? '🚪' : '🏠'}</div>
          <div className="stat-content">
            <h3>{activeTab === 'dormitory' ? 'Số phòng' : 'Ở KTX'}</h3>
            <div className="stat-value">{activeTab === 'dormitory' ? stats.roomCount : stats.dormitory}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tab "Tất cả sinh viên" - Bộ lọc Khoa + Chuyên ngành */}
        {activeTab === 'students' && (
          <div className="filters-grid">
            <SMCustomDropdown
              options={[
                { value: 'all', label: 'Tất cả khoa' },
                ...faculties.map(faculty => ({
                  value: faculty._id,
                  label: faculty.name
                }))
              ]}
              value={filterFaculty}
              onChange={(value) => handleFilterChange('faculty', value)}
              placeholder="Chọn khoa"
            />

            {/* Chuyên ngành - Disabled khi chưa chọn Khoa cụ thể */}
            <SMCustomDropdown
              options={[
                { value: 'all', label: 'Tất cả chuyên ngành' },
                ...filteredMajorsByFaculty.map(major => ({
                  value: major._id,
                  label: major.name
                }))
              ]}
              value={filterMajor}
              onChange={(value) => handleFilterChange('major', value)}
              placeholder="Chọn chuyên ngành"
              disabled={filterFaculty === 'all'}
            />

            {/* Bộ lọc Ở KTX */}
            <SMCustomDropdown
              options={[
                { value: 'all', label: 'Tất cả (KTX)' },
                { value: 'yes', label: 'Có ở KTX' },
                { value: 'no', label: 'Không ở KTX' }
              ]}
              value={filterDormStatus}
              onChange={(value) => {
                setFilterDormStatus(value);
                setCurrentPage(1);
              }}
              placeholder="Chọn trạng thái KTX"
            />

            {/* Nút Export CSV - Tất cả sinh viên */}
            <ExportCSVButton 
              exportFunction={studentService.exportCSV}
              filename="DS_SinhVien.csv"
              title="Xuất danh sách sinh viên ra file CSV"
              filters={{
                faculty: filterFaculty !== 'all' ? filterFaculty : undefined,
                major: filterMajor !== 'all' ? filterMajor : undefined,
                isDormResident: filterDormStatus === 'yes' ? true : filterDormStatus === 'no' ? false : undefined
              }} 
              variant="icon-only"
            />
          </div>
        )}

        {/* Tab "Sinh viên ở KTX" - Custom Dropdown Phòng với giới hạn chiều cao */}
        {activeTab === 'dormitory' && (
          <div className="filters-grid">
            <div className="custom-dropdown">
              <div 
                className="custom-dropdown-trigger"
                onClick={() => {
                  setIsRoomDropdownOpen(!isRoomDropdownOpen);
                  if (!isRoomDropdownOpen) setRoomSearchTerm('');
                }}
              >
                <span className="dropdown-value">
                  {filterRoom === 'all' 
                    ? 'Tất cả phòng' 
                    : dormitoryRooms.find(r => (r._id || r) === filterRoom)?.name || filterRoom
                  }
                </span>
                <span className={`dropdown-arrow ${isRoomDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
              {isRoomDropdownOpen && (
                <>
                  <div 
                    className="dropdown-backdrop" 
                    onClick={() => setIsRoomDropdownOpen(false)}
                  />
                  <div className="custom-dropdown-menu">
                    {/* Search Input */}
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Tìm phòng..."
                        value={roomSearchTerm}
                        onChange={(e) => setRoomSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    {/* Dropdown Items */}
                    <div className="dropdown-items-list">
                      {!roomSearchTerm && (
                        <div 
                          className={`dropdown-item ${filterRoom === 'all' ? 'active' : ''}`}
                          onClick={() => {
                            handleFilterChange('room', 'all');
                            setIsRoomDropdownOpen(false);
                          }}
                        >
                          Tất cả phòng
                        </div>
                      )}
                      {filteredRooms.length === 0 ? (
                        <div className="dropdown-item dropdown-no-result">
                          Không tìm thấy phòng
                        </div>
                      ) : (
                        filteredRooms.map(room => (
                          <div 
                            key={room._id || room}
                            className={`dropdown-item ${(room._id || room) === filterRoom ? 'active' : ''}`}
                            onClick={() => {
                              handleFilterChange('room', room._id || room);
                              setIsRoomDropdownOpen(false);
                            }}
                          >
                            {room.name || room}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Nút Export CSV - Sinh viên KTX */}
            <ExportCSVButton 
              exportFunction={studentService.exportCSV}
              filename="DS_SinhVien_KTX.csv"
              title="Xuất danh sách sinh viên KTX ra file CSV"
              filters={{ 
                isDormResident: true,
                roomId: filterRoom !== 'all' ? filterRoom : undefined
              }}
              variant="icon-only"
            />
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="table-section">
        {/* Bulk Action Bar - Hiện khi có checkbox được chọn */}
        {selectedStudentIds.length > 0 && (
          <div className="bulk-action-bar">
            <div className="bulk-action-content">
              <div className="bulk-action-info">
                <span className="selected-count">{selectedStudentIds.length}</span>
                <span className="selected-text">đã chọn</span>
              </div>
              <button 
                className="bulk-transfer-btn"
                onClick={handleTransferClick}
                title="Chuyển phòng các sinh viên đã chọn"
              >
                🏠
              </button>
              <button 
                className="bulk-delete-btn"
                onClick={handleBulkDeleteClick}
                title="Xóa các sinh viên đã chọn"
              >
                🗑️
              </button>
              <button 
                className="bulk-clear-btn"
                onClick={() => setSelectedStudentIds([])}
                title="Bỏ chọn tất cả"
              >
                ✕ Bỏ chọn
              </button>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          {paginatedStudents.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>{searchTerm ? 'Không tìm thấy sinh viên nào' : 'Chưa có sinh viên nào'}</p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={handleAddStudent}>
                  Thêm sinh viên đầu tiên
                </button>
              )}
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th className="th-center" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedStudentIds.length === paginatedStudents.length && paginatedStudents.length > 0}
                    />
                  </th>
                  <th style={{ width: '16%' }}>Họ và tên</th>
                  <th style={{ width: '11%' }}>Số điện thoại</th>
                  <th style={{ width: '16%' }}>Email</th>
                  <th style={{ width: '12%' }}>Khoa</th>
                  <th style={{ width: '12%' }}>Chuyên ngành</th>
                  {activeTab === 'students' && <th className="th-center" style={{ width: '8%' }}>Ở KTX</th>}
                  {activeTab === 'dormitory' && <th style={{ width: '10%' }}>Phòng</th>}
                  <th className="th-center" style={{ width: '10%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="td-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student._id)}
                        onChange={() => handleSelectStudent(student._id)}
                      />
                    </td>
                    <td>{student.fullName}</td>
                    <td>{student.phone || 'N/A'}</td>
                    <td className="email-cell">{student.user?.email}</td>
                    <td>{student.major?.faculty?.name || 'N/A'}</td>
                    <td>{student.major?.name || 'N/A'}</td>
                    {activeTab === 'students' && (
                      <td className="td-center">
                        <span className={`dorm-status-badge ${student.isDormResident ? 'status-yes' : 'status-no'}`}>
                          {student.isDormResident ? 'Có' : 'Không'}
                        </span>
                      </td>
                    )}
                    {activeTab === 'dormitory' && (
                      <td>
                        <span className="room-badge">
                          {student.roomId?.name || 'N/A'}
                        </span>
                      </td>
                    )}
                    <td className="td-center">
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetail(student)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditStudent(student)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteClick(student)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredStudents.length)} / {filteredStudents.length}
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Trước
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau →
            </button>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="page-size-select"
          >
            <option value="10">10 / trang</option>
            <option value="25">25 / trang</option>
            <option value="50">50 / trang</option>
          </select>
        </div>
      )}

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        editingStudent={editingStudent}
        faculties={faculties}
        majors={majors}
        availableRooms={availableRooms}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal form-modal detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="modal-header">
              <h2>Thông tin sinh viên</h2>
            </div>

            {/* Content - Scrollable */}
            <div className="modal-content">
              {/* Section: Thông tin cá nhân */}
              <div className="form-section">
                <h3 className="section-title">Thông tin cá nhân</h3>
                
                <div className="detail-item">
                  <label>Họ và tên</label>
                  <div className="detail-value">{selectedStudent.fullName}</div>
                </div>
                
                <div className="detail-item">
                  <label>Email</label>
                  <div className="detail-value">{selectedStudent.user?.email}</div>
                </div>
                
                <div className="detail-item">
                  <label>Số điện thoại</label>
                  <div className="detail-value">{selectedStudent.phone || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="detail-item">
                  <label>Ngày sinh</label>
                  <div className="detail-value">
                    {selectedStudent.dateOfBirth 
                      ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </div>
                </div>
                
                <div className="detail-item">
                  <label>CCCD</label>
                  <div className="detail-value">{selectedStudent.citizenId || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="detail-item">
                  <label>Địa chỉ</label>
                  <div className="detail-value">{selectedStudent.address || 'Chưa cập nhật'}</div>
                </div>
              </div>

              {/* Section: Thông tin học tập */}
              <div className="form-section">
                <h3 className="section-title">Thông tin học tập</h3>
                
                <div className="detail-item">
                  <label>Khoa</label>
                  <div className="detail-value">{selectedStudent.major?.faculty?.name || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="detail-item">
                  <label>Chuyên ngành</label>
                  <div className="detail-value">{selectedStudent.major?.name || 'Chưa cập nhật'}</div>
                </div>
              </div>

              {/* Section: Ký túc xá */}
              <div className="form-section">
                <h3 className="section-title">Ký túc xá</h3>
                
                <div className="detail-item">
                  <label>Ở KTX</label>
                  <div className="detail-value">
                    <span className={`status-badge ${selectedStudent.isDormResident ? 'active' : 'inactive'}`}>
                      {selectedStudent.isDormResident ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
                
                {selectedStudent.isDormResident && (
                  <div className="detail-item">
                    <label>Phòng</label>
                    <div className="detail-value">{selectedStudent.roomId?.name || 'Chưa phân phòng'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowDetailModal(false);
                handleEditStudent(selectedStudent);
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={handleCloseDeleteDialog}>
          <div className="delete-dialog delete-dialog-enhanced" onClick={(e) => e.stopPropagation()}>
            {/* Loading state */}
            {deleteConfirm.isLoading ? (
              <div className="delete-dialog-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="delete-dialog-header">
                  <span className="delete-icon">⚠️</span>
                  <h3>
                    {deleteConfirm.preview?.student?.isDormResident 
                      ? 'Xóa sinh viên ở KTX' 
                      : 'Xác nhận xóa sinh viên'}
                  </h3>
                </div>

                {/* Content */}
                <div className="delete-dialog-content">
                  {/* Student Info */}
                  <div className="delete-student-info">
                    <p className="student-name">
                      <strong>{deleteConfirm.preview?.student?.fullName}</strong>
                    </p>
                    <p className="student-email">{deleteConfirm.preview?.student?.email}</p>
                    {deleteConfirm.preview?.student?.isDormResident && (
                      <p className="student-room">
                        🏠 Phòng: <strong>{deleteConfirm.preview?.student?.roomName || 'N/A'}</strong>
                      </p>
                    )}
                  </div>

                  {/* Options for Dormitory Students */}
                  {deleteConfirm.preview?.student?.isDormResident ? (
                    <div className="delete-options">
                      {/* Option 1: Remove from Dormitory Only */}
                      <div className="delete-option">
                        <div className="option-header">
                          <span className="option-icon">🏠</span>
                          <span className="option-title">Chỉ xóa khỏi Ký túc xá</span>
                        </div>
                        <div className="option-description">
                          <ul>
                            <li>✓ Xóa {deleteConfirm.preview?.relatedData?.dormitoryRequests || 0} yêu cầu KTX</li>
                            <li>✓ Cập nhật phòng (giảm 1 người)</li>
                            <li>✓ <strong>Giữ lại</strong> thông tin sinh viên</li>
                            <li>✓ <strong>Giữ lại</strong> {deleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-warning btn-option"
                          onClick={handleConfirmRemoveFromDormitory}
                          disabled={deleteConfirm.isDeleting}
                        >
                          {deleteConfirm.isDeleting ? 'Đang xử lý...' : 'Xóa khỏi KTX'}
                        </button>
                      </div>

                      {/* Option 2: Delete Completely */}
                      <div className="delete-option delete-option-danger">
                        <div className="option-header">
                          <span className="option-icon">🗑️</span>
                          <span className="option-title">Xóa hoàn toàn khỏi hệ thống</span>
                        </div>
                        <div className="option-description">
                          <ul>
                            <li>✗ Xóa {deleteConfirm.preview?.relatedData?.dormitoryRequests || 0} yêu cầu KTX</li>
                            <li>✗ Xóa {deleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                            <li>✗ Xóa tài khoản đăng nhập</li>
                            <li>✗ Xóa hoàn toàn sinh viên</li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-danger btn-option"
                          onClick={handleConfirmDeleteCompletely}
                          disabled={deleteConfirm.isDeleting}
                        >
                          {deleteConfirm.isDeleting ? 'Đang xử lý...' : 'Xóa hoàn toàn'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Non-dormitory student - Simple delete */
                    <div className="delete-warning-box">
                      <p className="delete-warning">
                        ⚠️ Hành động này sẽ:
                      </p>
                      <ul>
                        <li>Xóa {deleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                        <li>Xóa tài khoản đăng nhập</li>
                        <li>Xóa hoàn toàn thông tin sinh viên</li>
                      </ul>
                      <p className="delete-warning-note">
                        <strong>Không thể hoàn tác!</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="delete-dialog-footer">
                  <button
                    className="btn btn-outline"
                    onClick={handleCloseDeleteDialog}
                    disabled={deleteConfirm.isDeleting}
                  >
                    Hủy
                  </button>
                  {/* Non-dormitory student: Show delete button */}
                  {!deleteConfirm.preview?.student?.isDormResident && (
                    <button
                      className="btn btn-danger"
                      onClick={handleConfirmDeleteCompletely}
                      disabled={deleteConfirm.isDeleting}
                    >
                      {deleteConfirm.isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteConfirm.show && (
        <div className="modal-overlay" onClick={() => !isBulkDeleting && !bulkDeleteConfirm.isLoading && setBulkDeleteConfirm({ show: false, preview: null, isLoading: false })}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">⚠️</span>
              <h3>Xác nhận xóa hàng loạt</h3>
            </div>
            <div className="delete-dialog-content">
              {bulkDeleteConfirm.isLoading ? (
                <div className="loading-preview">
                  <div className="spinner"></div>
                  <p>Đang tải thông tin...</p>
                </div>
              ) : (
                <>
                  <p>
                    Bạn đã chọn <strong>{bulkDeleteConfirm.preview?.studentCount || selectedStudentIds.length}</strong> sinh viên.
                    {bulkDeleteConfirm.preview?.dormResidentCount > 0 && (
                      <span> (trong đó có <strong>{bulkDeleteConfirm.preview?.dormResidentCount}</strong> sinh viên đang ở KTX)</span>
                    )}
                  </p>

                  {/* Hiển thị 2 tùy chọn khi có sinh viên ở KTX */}
                  {bulkDeleteConfirm.preview?.dormResidentCount > 0 ? (
                    <div className="delete-options">
                      {/* Option 1: Chỉ xóa khỏi KTX */}
                      <div className="delete-option">
                        <div className="option-header">
                          <span className="option-icon">🏠</span>
                          <span className="option-title">Chỉ xóa khỏi Ký túc xá</span>
                        </div>
                        <div className="option-description">
                          <ul>
                            <li>✓ Xóa {bulkDeleteConfirm.preview?.relatedData?.dormitoryRequests || 0} yêu cầu KTX</li>
                            <li>✓ Cập nhật phòng (giảm {bulkDeleteConfirm.preview?.dormResidentCount} người)</li>
                            <li>✓ <strong>Giữ lại</strong> thông tin {bulkDeleteConfirm.preview?.dormResidentCount} sinh viên</li>
                            <li>✓ <strong>Giữ lại</strong> {bulkDeleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-warning btn-option"
                          onClick={handleConfirmBulkRemoveFromDormitory}
                          disabled={isBulkDeleting}
                        >
                          {isBulkDeleting ? 'Đang xử lý...' : `Xóa ${bulkDeleteConfirm.preview?.dormResidentCount} SV khỏi KTX`}
                        </button>
                      </div>

                      {/* Option 2: Xóa hoàn toàn */}
                      <div className="delete-option delete-option-danger">
                        <div className="option-header">
                          <span className="option-icon">🗑️</span>
                          <span className="option-title">Xóa hoàn toàn khỏi hệ thống</span>
                        </div>
                        <div className="option-description">
                          <ul>
                            <li>✗ Xóa {bulkDeleteConfirm.preview?.relatedData?.dormitoryRequests || 0} yêu cầu KTX</li>
                            <li>✗ Xóa {bulkDeleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                            <li>✗ Xóa tài khoản đăng nhập</li>
                            <li>✗ Xóa hoàn toàn {bulkDeleteConfirm.preview?.studentCount || selectedStudentIds.length} sinh viên</li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-danger btn-option"
                          onClick={handleConfirmBulkDelete}
                          disabled={isBulkDeleting}
                        >
                          {isBulkDeleting ? 'Đang xóa...' : `Xóa hoàn toàn ${bulkDeleteConfirm.preview?.studentCount || selectedStudentIds.length} SV`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Không có sinh viên ở KTX - Chỉ hiển thị xóa hoàn toàn */
                    <div className="delete-warning-box">
                      <p className="delete-warning">
                        ⚠️ Hành động này sẽ:
                      </p>
                      <ul>
                        <li>Xóa {bulkDeleteConfirm.preview?.relatedData?.certificateRequests || 0} yêu cầu CTSV</li>
                        <li>Xóa tài khoản đăng nhập của các sinh viên</li>
                        <li>Xóa hoàn toàn thông tin {bulkDeleteConfirm.preview?.studentCount || selectedStudentIds.length} sinh viên</li>
                      </ul>
                      <p className="delete-warning-note">
                        <strong>Không thể hoàn tác!</strong>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="delete-dialog-footer">
              <button
                className="btn btn-outline"
                onClick={() => setBulkDeleteConfirm({ show: false, preview: null, isLoading: false })}
                disabled={isBulkDeleting || bulkDeleteConfirm.isLoading}
              >
                Hủy
              </button>
              {/* Chỉ hiển thị nút xác nhận xóa khi không có sinh viên ở KTX */}
              {!bulkDeleteConfirm.preview?.dormResidentCount && (
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmBulkDelete}
                  disabled={isBulkDeleting || bulkDeleteConfirm.isLoading}
                >
                  {isBulkDeleting ? 'Đang xóa...' : `Xóa ${bulkDeleteConfirm.preview?.studentCount || selectedStudentIds.length} sinh viên`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Transfer Dialog */}
      <RoomTransferDialog
        isOpen={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        studentIds={selectedStudentIds}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};

export default StudentManagement;
