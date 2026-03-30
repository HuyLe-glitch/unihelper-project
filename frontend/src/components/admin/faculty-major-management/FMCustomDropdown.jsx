import React, { useState, useRef, useEffect } from 'react';
import './FMCustomDropdown.css';

/**
 * FMCustomDropdown - Custom Dropdown cho Faculty Major Management
 * Prefix: fm-cd (Faculty Major Custom Dropdown)
 */
const FMCustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Chọn...', 
  disabled = false,
  label = ''
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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`fm-cd-wrapper ${disabled ? 'fm-cd-disabled' : ''}`} ref={dropdownRef}>
      {label && <label className="fm-cd-label">{label}</label>}
      <div 
        className={`fm-cd-trigger ${isOpen ? 'fm-cd-open' : ''} ${disabled ? 'fm-cd-trigger-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="fm-cd-value" title={displayText}>
          {displayText}
        </span>
        <span className={`fm-cd-arrow ${isOpen ? 'fm-cd-arrow-up' : ''}`}>▼</span>
      </div>
      
      {isOpen && !disabled && (
        <div className="fm-cd-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`fm-cd-option ${value === option.value ? 'fm-cd-option-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              title={option.label}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FMCustomDropdown;
