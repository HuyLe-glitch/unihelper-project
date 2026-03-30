import React, { useState, useRef, useEffect } from 'react';
import './SFCustomDropdown.css';

const SFCustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Chọn...',
  disabled = false,
  name,
  hasError = false
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

  // Close dropdown on Escape key
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

  const handleSelect = (optionValue) => {
    // Simulate event for compatibility with handleChange
    const event = {
      target: {
        name: name,
        value: optionValue,
        type: 'select'
      }
    };
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div 
      className={`sf-cd-container ${disabled ? 'sf-cd-disabled' : ''} ${hasError ? 'sf-cd-error' : ''}`} 
      ref={dropdownRef}
    >
      <div 
        className={`sf-cd-trigger ${isOpen ? 'sf-cd-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`sf-cd-value ${!selectedOption ? 'sf-cd-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`sf-cd-arrow ${isOpen ? 'sf-cd-arrow-up' : ''}`}>
          ▼
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div className="sf-cd-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`sf-cd-option ${value === option.value ? 'sf-cd-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="sf-cd-no-options">Không có lựa chọn</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SFCustomDropdown;
