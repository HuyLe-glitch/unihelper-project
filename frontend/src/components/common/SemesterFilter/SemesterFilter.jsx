import React, { useState, useMemo } from 'react';
import './SemesterFilter.css';

// Danh sách học kỳ với thời gian
const SEMESTERS = [
  { 
    id: 'HK1-2025', 
    name: 'HK1 - 2024-2025', 
    startDate: '2024-09-02', 
    endDate: '2025-01-15',
    label: 'Học kỳ 1 (2024-2025)'
  },
  { 
    id: 'HK2-2024', 
    name: 'HK2 - 2023-2024', 
    startDate: '2024-02-19', 
    endDate: '2024-06-30',
    label: 'Học kỳ 2 (2023-2024)'
  },
  { 
    id: 'HK1-2024', 
    name: 'HK1 - 2023-2024', 
    startDate: '2023-09-04', 
    endDate: '2024-01-15',
    label: 'Học kỳ 1 (2023-2024)'
  },
  { 
    id: 'HK3-2024', 
    name: 'HK Hè - 2024', 
    startDate: '2024-07-01', 
    endDate: '2024-08-31',
    label: 'Học kỳ Hè (2024)'
  }
];

/**
 * SemesterFilter Component
 * 
 * Component bộ lọc học kỳ có thể tái sử dụng cho cả Staff CTSV và Staff KTX
 * 
 * @param {Object} props
 * @param {string} props.value - Giá trị học kỳ hiện tại ('all' hoặc semester id)
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
  // Get selected semester info
  const selectedSemester = useMemo(() => 
    SEMESTERS.find(s => s.id === value),
    [value]
  );

  // Format date for display (DD/MM/YYYY)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Handle semester change - reset date filter when semester changes
  const handleSemesterChange = (newValue) => {
    onChange(newValue);
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

  return (
    <div className={`semester-filter ${variant} ${className}`}>
      {/* Semester Dropdown */}
      <div className="semester-filter__select-wrapper">
        <select
          value={value}
          onChange={(e) => handleSemesterChange(e.target.value)}
          className="semester-filter__select"
        >
          <option value="all">📅 Tất cả học kỳ</option>
          {SEMESTERS.map(sem => (
            <option key={sem.id} value={sem.id}>{sem.name}</option>
          ))}
        </select>
        {selectedSemester && (
          <div className="semester-filter__tooltip">
            <span className="semester-filter__date-range">
              📅 {formatDateDisplay(selectedSemester.startDate)} → {formatDateDisplay(selectedSemester.endDate)}
            </span>
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

      {/* Semester Info Bar */}
      {showInfoBar && selectedSemester && (
        <div className="semester-filter__info-bar">
          <div className="semester-filter__info-content">
            <span className="semester-filter__icon">📚</span>
            <span className="semester-filter__label">{selectedSemester.label}</span>
            <span className="semester-filter__divider">|</span>
            <span className="semester-filter__dates">
              <span className="semester-filter__date-label">Từ:</span> {formatDateDisplay(selectedSemester.startDate)}
              <span className="semester-filter__arrow">→</span>
              <span className="semester-filter__date-label">Đến:</span> {formatDateDisplay(selectedSemester.endDate)}
            </span>
          </div>
          <button 
            className="semester-filter__clear-semester-btn"
            onClick={handleClearSemester}
            title="Xóa bộ lọc học kỳ"
            type="button"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

// Export danh sách học kỳ để các component khác có thể sử dụng cho filtering
export { SEMESTERS };
export default SemesterFilter;

