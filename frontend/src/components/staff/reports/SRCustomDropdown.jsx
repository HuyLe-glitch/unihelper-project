import React, { useState, useRef, useEffect } from 'react';
import './SRCustomDropdown.css';

/**
 * Custom Dropdown cho Staff Reports - Filter với responsive design
 * Prefix: sr- (Staff Reports) để tránh conflict CSS
 */
const SRCustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn...',
  disabled = false,
  className = '',
  icon = null
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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Get selected option label
  const getSelectedLabel = () => {
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  // Get selected option icon
  const getSelectedIcon = () => {
    const selected = options.find(opt => opt.value === value);
    return selected?.icon || icon;
  };

  // Handle option select
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'ArrowDown' && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      handleSelect(options[nextIndex].value);
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      handleSelect(options[prevIndex].value);
    }
  };

  return (
    <div 
      className={`sr-custom-dropdown ${className} ${disabled ? 'sr-disabled' : ''} ${isOpen ? 'sr-open' : ''}`}
      ref={dropdownRef}
    >
      <div 
        className="sr-dropdown-header"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        {getSelectedIcon() && (
          <span className="sr-dropdown-icon">{getSelectedIcon()}</span>
        )}
        <span className="sr-dropdown-value">{getSelectedLabel()}</span>
        <span className={`sr-dropdown-arrow ${isOpen ? 'sr-arrow-open' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M2.5 4.5L6 8L9.5 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      
      {isOpen && (
        <div className="sr-dropdown-menu" role="listbox">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`sr-dropdown-item ${value === option.value ? 'sr-item-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
              tabIndex={0}
            >
              {option.icon && <span className="sr-item-icon">{option.icon}</span>}
              <span className="sr-item-label">{option.label}</span>
              {value === option.value && (
                <span className="sr-item-check">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M2.5 7.5L5.5 10.5L11.5 4.5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SRCustomDropdown;
