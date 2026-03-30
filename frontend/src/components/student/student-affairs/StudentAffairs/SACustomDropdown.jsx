import React, { useState, useRef, useEffect } from 'react';
import './SACustomDropdown.css';

/**
 * SACustomDropdown - Custom Dropdown cho StudentAffairs
 * Prefix: sa-cd (Student Affairs Custom Dropdown) để tránh conflict CSS
 * 
 * @param {Array} options - Mảng options [{_id, name}]
 * @param {string} value - Giá trị đang được chọn
 * @param {function} onChange - Callback khi chọn option
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Có disabled không
 */
const SACustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = '-- Chọn --',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tìm option đang được chọn
  const selectedOption = options.find(opt => opt._id === value);

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
    onChange(option._id);
    setIsOpen(false);
  };

  return (
    <div 
      className={`sa-cd-wrapper ${disabled ? 'sa-cd-disabled' : ''}`} 
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`sa-cd-trigger ${isOpen ? 'sa-cd-open' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={`sa-cd-value ${!selectedOption ? 'sa-cd-placeholder' : ''}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className={`sa-cd-arrow ${isOpen ? 'sa-cd-arrow-up' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="sa-cd-menu">
          <div 
            className="sa-cd-option sa-cd-option-placeholder" 
            onClick={() => handleSelect({ _id: '' })}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option._id}
              className={`sa-cd-option ${option._id === value ? 'sa-cd-option-selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SACustomDropdown;
