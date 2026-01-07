import React, { useState, useMemo, useEffect, useRef } from 'react';
import { semesterService } from '../../../services/semester';
import './SemesterFilter.css';

/**
 * SemesterFilter Component
 * 
 * Component bộ lọc học kỳ có thể tái sử dụng cho cả Staff CTSV và Staff KTX
 * Sử dụng dữ liệu thật từ API - Custom Dropdown với Search
 * 
 * @param {Object} props
 * @param {string} props.value - Giá trị học kỳ hiện tại ('all' hoặc semester id/name)
 * @param {Function} props.onChange - Callback khi thay đổi học kỳ (value) => void
 * @param {string} props.dateValue - Giá trị ngày hiện tại (YYYY-MM-DD format)
 * @param {Function} props.onDateChange - Callback khi thay đổi ngày (value) => void
 * @param {boolean} props.showDateFilter - Có hiển thị bộ lọc ngày không (default: true)
 * @param {boolean} props.showInfoBar - Có hiển thị thanh thông tin học kỳ không (default: true)
 * @param {string} props.className - Class CSS bổ sung
 * @param {string} props.variant - Phiên bản giao diện ('default' | 'compact')
 */
const SemesterFilter = ({
  value = 'all',
  onChange,
  dateValue = '',
  onDateChange,
  showDateFilter = true,
  showInfoBar = true,
  className = '',
  variant = 'default'
}) => {
  // State cho danh sách học kỳ từ API
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Fetch danh sách học kỳ từ API khi component mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const response = await semesterService.getAllSemesters();
        if (response.success && response.data) {
          // Transform data từ API sang format cần thiết
          const transformedSemesters = response.data.map(sem => ({
            id: sem._id,
            name: sem.name, // VD: "HK1 (2025-2026)"
            startDate: sem.startDate ? sem.startDate.split('T')[0] : '',
            endDate: sem.endDate ? sem.endDate.split('T')[0] : '',
            label: sem.name,
            isActive: sem.isActive
          }));
          setSemesters(transformedSemesters);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected semester info
  const selectedSemester = useMemo(() => 
    semesters.find(s => s.id === value || s.name === value),
    [value, semesters]
  );

  // Filter semesters based on search
  const filteredSemesters = useMemo(() => {
    if (!searchTerm) return semesters;
    const term = searchTerm.toLowerCase();
    return semesters.filter(sem => 
      sem.name.toLowerCase().includes(term) ||
      sem.label.toLowerCase().includes(term)
    );
  }, [semesters, searchTerm]);

  // Get display value
  const displayValue = useMemo(() => {
    if (value === 'all') return 'Tất cả học kỳ';
    return selectedSemester?.name || value;
  }, [value, selectedSemester]);

  // Format date for display (DD/MM/YYYY)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Handle semester change - reset date filter when semester changes
  const handleSemesterChange = (newValue) => {
    onChange(newValue);
    setIsDropdownOpen(false);
    setSearchTerm('');
    if (onDateChange) {
      onDateChange(''); // Reset date filter when semester changes
    }
  };

  const handleDateChange = (e) => {
    if (onDateChange) {
      onDateChange(e.target.value);
    }
  };

  const handleClearDate = () => {
    if (onDateChange) {
      onDateChange('');
    }
  };

  const handleClearSemester = () => {
    handleSemesterChange('all');
  };

  const toggleDropdown = () => {
    if (!loading) {
      setIsDropdownOpen(!isDropdownOpen);
      if (!isDropdownOpen) setSearchTerm('');
    }
  };

  return (
    <div className={`semester-filter ${variant} ${className}`}>
      {/* Semester Custom Dropdown */}
      <div className="semester-filter__dropdown" ref={dropdownRef}>
        <div 
          className={`semester-filter__trigger ${isDropdownOpen ? 'open' : ''} ${loading ? 'disabled' : ''}`}
          onClick={toggleDropdown}
        >
          <span className="semester-filter__trigger-icon">📅</span>
          <span className="semester-filter__trigger-value">{displayValue}</span>
          <span className={`semester-filter__trigger-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </div>
        
        {isDropdownOpen && (
          <>
            <div 
              className="semester-filter__backdrop" 
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="semester-filter__menu">
              <div className="semester-filter__search">
                <input
                  type="text"
                  placeholder="Tìm học kỳ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="semester-filter__items">
                {!searchTerm && (
                  <div 
                    className={`semester-filter__item ${value === 'all' ? 'active' : ''}`}
                    onClick={() => handleSemesterChange('all')}
                  >
                    📅 Tất cả học kỳ
                  </div>
                )}
                {filteredSemesters.length === 0 ? (
                  <div className="semester-filter__item semester-filter__no-result">
                    Không tìm thấy học kỳ
                  </div>
                ) : (
                  filteredSemesters.map(sem => (
                    <div 
                      key={sem.id}
                      className={`semester-filter__item ${sem.name === value || sem.id === value ? 'active' : ''}`}
                      onClick={() => handleSemesterChange(sem.name)}
                    >
                      {sem.isActive ? `${sem.name} ✓` : sem.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Semester Info Bar - nằm ngay dưới dropdown trigger, trong cùng wrapper */}
        {showInfoBar && selectedSemester && value !== 'all' && !isDropdownOpen && (
          <div className="semester-filter__info-bar">
            <div className="semester-filter__info-content">
              <span className="semester-filter__icon">📅</span>
              <span className="semester-filter__dates">
                {formatDateDisplay(selectedSemester.startDate)} - {formatDateDisplay(selectedSemester.endDate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Date Filter */}
      {showDateFilter && (
        <div className="semester-filter__date-wrapper">
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            className="semester-filter__date-input"
            min={selectedSemester?.startDate || ''}
            max={selectedSemester?.endDate || ''}
            title={selectedSemester 
              ? `Chọn ngày trong khoảng: ${formatDateDisplay(selectedSemester.startDate)} - ${formatDateDisplay(selectedSemester.endDate)}`
              : 'Chọn ngày'
            }
          />
          {dateValue && (
            <button 
              className="semester-filter__clear-btn" 
              onClick={handleClearDate}
              title="Xóa bộ lọc ngày"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Export để các component khác có thể sử dụng
export default SemesterFilter;

