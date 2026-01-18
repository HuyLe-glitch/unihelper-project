import React, { useState, useRef, useEffect } from 'react';
import './CTSVCustomDropdown.css';

const CTSVCustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Chọn...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

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

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`ctsv-custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`ctsv-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="ctsv-dropdown-label">{displayLabel}</span>
        <span className="ctsv-dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10z"/>
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="ctsv-dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`ctsv-dropdown-item ${value === option.value ? 'selected' : ''}`}
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

export default CTSVCustomDropdown;
