import React, { useState, useRef, useEffect } from 'react';
import './SMCustomDropdown.css';

/**
 * SMCustomDropdown - Custom Dropdown cho StudentManagement
 * Prefix: sm-cd (Student Management Custom Dropdown) để tránh conflict CSS
 * 
 * @param {Array} options - Mảng options [{value, label}]
 * @param {string} value - Giá trị đang được chọn
 * @param {function} onChange - Callback khi chọn option
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Có disabled không
 * @param {string} label - Label cho dropdown (optional)
 */
const SMCustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = '-- Chọn --',
  disabled = false,
  label = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tìm option đang được chọn
  const selectedOption = options.find(opt => opt.value === value);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi nhấn Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="sm-cd-container">
      {label && <label className="sm-cd-label">{label}</label>}
      <div 
        className={`sm-cd-wrapper ${disabled ? 'sm-cd-disabled' : ''}`} 
        ref={dropdownRef}
      >
        <button
          type="button"
          className={`sm-cd-trigger ${isOpen ? 'sm-cd-open' : ''}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className={`sm-cd-value ${!selectedOption ? 'sm-cd-placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`sm-cd-arrow ${isOpen ? 'sm-cd-arrow-up' : ''}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="sm-cd-menu">
            {options.map((option) => (
              <div
                key={option.value}
                className={`sm-cd-option ${option.value === value ? 'sm-cd-option-selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
            {options.length === 0 && (
              <div className="sm-cd-option sm-cd-no-options">
                Không có tùy chọn
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SMCustomDropdown;
