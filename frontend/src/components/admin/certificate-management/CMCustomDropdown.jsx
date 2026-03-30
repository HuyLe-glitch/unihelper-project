import React, { useState, useRef, useEffect } from 'react';
import './CMCustomDropdown.css';

const CMCustomDropdown = ({ 
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
      className={`cm-cd-container ${disabled ? 'cm-cd-disabled' : ''}`} 
      ref={dropdownRef}
    >
      <div 
        className={`cm-cd-trigger ${isOpen ? 'cm-cd-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="cm-cd-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`cm-cd-arrow ${isOpen ? 'cm-cd-arrow-up' : ''}`}>
          ▼
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div className="cm-cd-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`cm-cd-option ${value === option.value ? 'cm-cd-selected' : ''}`}
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

export default CMCustomDropdown;
