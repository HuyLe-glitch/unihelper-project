import React, { useState, useRef, useEffect } from 'react';
import './DRCustomDropdown.css';

const DRCustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Chọn...',
  disabled = false 
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
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`dr-cd-container ${disabled ? 'dr-cd-disabled' : ''}`} 
      ref={dropdownRef}
    >
      <div 
        className={`dr-cd-trigger ${isOpen ? 'dr-cd-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="dr-cd-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`dr-cd-arrow ${isOpen ? 'dr-cd-arrow-up' : ''}`}>
          ▼
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div className="dr-cd-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dr-cd-option ${value === option.value ? 'dr-cd-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DRCustomDropdown;
