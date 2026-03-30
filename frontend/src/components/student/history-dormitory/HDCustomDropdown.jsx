import React, { useState, useRef, useEffect } from 'react';
import './HDCustomDropdown.css';

/**
 * HDCustomDropdown - Custom Dropdown cho HistoryDormitory
 * Prefix: hd-cd (History Dormitory Custom Dropdown) để tránh conflict CSS
 * 
 * @param {Array} options - Mảng options [{value, label}]
 * @param {string} value - Giá trị đang được chọn
 * @param {function} onChange - Callback khi chọn option
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Có disabled không
 */
const HDCustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = '-- Chọn --',
  disabled = false 
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
    <div 
      className={`hd-cd-wrapper ${disabled ? 'hd-cd-disabled' : ''}`} 
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`hd-cd-trigger ${isOpen ? 'hd-cd-open' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={`hd-cd-value ${!selectedOption ? 'hd-cd-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`hd-cd-arrow ${isOpen ? 'hd-cd-arrow-up' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="hd-cd-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`hd-cd-option ${option.value === value ? 'hd-cd-option-selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HDCustomDropdown;
