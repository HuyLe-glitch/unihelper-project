import React, { useState, useRef, useEffect } from 'react';
import './ChatbotToggle.css';

/**
 * ChatbotToggle - Floating button để mở/đóng chatbot
 * Features:
 * - Draggable: Có thể kéo thả đến vị trí mong muốn
 * - Snap to edges: Tự động dính vào cạnh gần nhất
 * - Remember position: Lưu vị trí vào localStorage
 * - Idle opacity: Giảm opacity khi không tương tác
 */
const ChatbotToggle = ({ isOpen, onClick, unreadCount = 0 }) => {
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const idleTimerRef = useRef(null);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatbot-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        // Use default position
        setDefaultPosition();
      }
    } else {
      setDefaultPosition();
    }
  }, []);

  // Set default position (bottom-right)
  const setDefaultPosition = () => {
    const padding = 24;
    setPosition({
      x: window.innerWidth - 60 - padding,
      y: window.innerHeight - 60 - padding
    });
  };

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== null && position.y !== null) {
      localStorage.setItem('chatbot-position', JSON.stringify(position));
    }
  }, [position]);

  // Idle timer - set idle after 5 seconds of no interaction
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        if (!isOpen && !isDragging) {
          setIsIdle(true);
        }
      }, 5000);
    };

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isOpen, isDragging, isHovered]);

  // Handle drag start
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = buttonRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle drag move
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    let newX = dragRef.current.initialX + deltaX;
    let newY = dragRef.current.initialY + deltaY;

    // Keep within viewport
    const buttonSize = 60;
    const padding = 8;
    newX = Math.max(padding, Math.min(window.innerWidth - buttonSize - padding, newX));
    newY = Math.max(padding, Math.min(window.innerHeight - buttonSize - padding, newY));

    setPosition({ x: newX, y: newY });
  };

  // Handle drag end with snap to edges
  const handleMouseUp = (e) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Check if it was a click (not a drag)
    const deltaX = Math.abs(e.clientX - dragRef.current.startX);
    const deltaY = Math.abs(e.clientY - dragRef.current.startY);
    
    if (deltaX < 5 && deltaY < 5) {
      onClick();
      return;
    }

    // Snap to nearest edge
    const buttonSize = 60;
    const padding = 24;
    const centerX = position.x + buttonSize / 2;
    const centerY = position.y + buttonSize / 2;
    
    // Determine which edge is closest
    const distLeft = centerX;
    const distRight = window.innerWidth - centerX;
    const distTop = centerY;
    const distBottom = window.innerHeight - centerY;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let snappedX = position.x;
    let snappedY = position.y;

    if (minDist === distLeft) {
      snappedX = padding;
    } else if (minDist === distRight) {
      snappedX = window.innerWidth - buttonSize - padding;
    }

    // Keep Y position but constrain
    snappedY = Math.max(padding, Math.min(window.innerHeight - buttonSize - padding, position.y));

    setPosition({ x: snappedX, y: snappedY });
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    
    const rect = buttonRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: rect.left,
      initialY: rect.top
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;

    let newX = dragRef.current.initialX + deltaX;
    let newY = dragRef.current.initialY + deltaY;

    const buttonSize = 60;
    const padding = 8;
    newX = Math.max(padding, Math.min(window.innerWidth - buttonSize - padding, newX));
    newY = Math.max(padding, Math.min(window.innerHeight - buttonSize - padding, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);

    // Check if it was a tap
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - dragRef.current.startX);
    const deltaY = Math.abs(touch.clientY - dragRef.current.startY);
    
    if (deltaX < 10 && deltaY < 10) {
      onClick();
      return;
    }

    // Snap to edge (same logic as mouse)
    const buttonSize = 60;
    const padding = 24;
    const centerX = position.x + buttonSize / 2;

    const distLeft = centerX;
    const distRight = window.innerWidth - centerX;

    let snappedX = position.x;
    if (distLeft < distRight) {
      snappedX = padding;
    } else {
      snappedX = window.innerWidth - buttonSize - padding;
    }

    setPosition({ x: snappedX, y: position.y });
  };

  if (isOpen) return null;

  return (
    <button
      ref={buttonRef}
      className={`chatbot-toggle ${isDragging ? 'dragging' : ''} ${isIdle && !isHovered ? 'idle' : ''}`}
      style={{
        left: position.x !== null ? `${position.x}px` : 'auto',
        top: position.y !== null ? `${position.y}px` : 'auto',
        right: position.x === null ? '24px' : 'auto',
        bottom: position.y === null ? '24px' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Mở chatbot UniHelper"
      title="Chat với UniHelper"
    >
      <div className="chatbot-toggle-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      {unreadCount > 0 && (
        <span className="chatbot-toggle-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
      <div className="chatbot-toggle-pulse" />
    </button>
  );
};

export default ChatbotToggle;

