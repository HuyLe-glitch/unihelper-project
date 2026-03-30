import React, { useState, useRef, useEffect } from 'react';
import './SDCustomDropdown.css';

/**
 * Custom Dropdown cho Staff Dashboard - Filter Status
 */
const SDCustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn...',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected option label
  const getSelectedLabel = () => {
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  // Handle option select
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`sd-custom-dropdown ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={dropdownRef}
    >
      <div 
        className="sd-dropdown-header"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="sd-dropdown-value">{getSelectedLabel()}</span>
        <span className={`sd-dropdown-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      
      {isOpen && (
        <div className="sd-dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`sd-dropdown-item ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.icon && <span className="sd-item-icon">{option.icon}</span>}
              <span className="sd-item-label">{option.label}</span>
              {value === option.value && (
                <span className="sd-item-check">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SDCustomDropdown;
