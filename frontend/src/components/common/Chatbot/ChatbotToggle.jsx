import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatbotToggle.css';

/**
 * ChatbotToggle - Floating button để mở/đóng chatbot
 * Features:
 * - Draggable: Có thể kéo thả đến vị trí mong muốn
 * - Snap to edges: Tự động dính vào cạnh gần nhất (left hoặc right)
 * - Remember position: Lưu vị trí vào localStorage (lưu edge + offset để responsive)
 * - Idle opacity: Giảm opacity khi không tương tác
 * 
 * POSITION STRATEGY:
 * - Lưu: { edge: 'left'|'right', offsetY: number (từ bottom) }
 * - Khi render: Tính toán position dựa trên viewport hiện tại
 * - Khi resize/zoom: Tự động adjust để button luôn trong viewport
 */
const BUTTON_SIZE = 60;
const PADDING = 24;
const DEFAULT_OFFSET_Y = 24; // Khoảng cách từ bottom

const ChatbotToggle = ({ isOpen, onClick, unreadCount = 0 }) => {
  // State lưu edge position (responsive với mọi viewport size)
  const [edgePosition, setEdgePosition] = useState({ edge: 'right', offsetY: DEFAULT_OFFSET_Y });
  // State để lưu viewport size và force re-render khi resize/zoom
  const [viewport, setViewport] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1920, 
    height: typeof window !== 'undefined' ? window.innerHeight : 1080 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const idleTimerRef = useRef(null);

  // Listen to resize/zoom events và update viewport state
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    // Also listen to zoom changes (some browsers trigger this)
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Tính toán position thực tế từ edgePosition và viewport
  const calculatePosition = useCallback(() => {
    const { edge, offsetY } = edgePosition;
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;
    
    // X position dựa trên edge
    const x = edge === 'left' 
      ? PADDING 
      : Math.max(PADDING, viewportWidth - BUTTON_SIZE - PADDING);
    
    // Y position từ bottom, đảm bảo trong viewport
    const maxY = Math.max(PADDING, viewportHeight - BUTTON_SIZE - PADDING);
    const y = Math.max(PADDING, Math.min(maxY, viewportHeight - BUTTON_SIZE - offsetY));
    
    return { x, y };
  }, [edgePosition, viewport]);

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatbot-edge-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.edge && typeof parsed.offsetY === 'number') {
          setEdgePosition({
            edge: parsed.edge === 'left' ? 'left' : 'right',
            offsetY: Math.max(PADDING, parsed.offsetY)
          });
        }
      } catch (e) {
        // Use default
      }
    }
    // Clear old format localStorage
    localStorage.removeItem('chatbot-position');
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatbot-edge-position', JSON.stringify(edgePosition));
  }, [edgePosition]);

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
    newX = Math.max(PADDING, Math.min(window.innerWidth - BUTTON_SIZE - PADDING, newX));
    newY = Math.max(PADDING, Math.min(window.innerHeight - BUTTON_SIZE - PADDING, newY));

    // Update position in real-time for smooth dragging
    if (buttonRef.current) {
      buttonRef.current.style.left = `${newX}px`;
      buttonRef.current.style.top = `${newY}px`;
    }
  };

  // Handle drag end with snap to edges
  const handleMouseUp = (e) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Get current position from style
    const currentX = parseFloat(buttonRef.current?.style.left) || calculatePosition().x;
    const currentY = parseFloat(buttonRef.current?.style.top) || calculatePosition().y;

    // Check if it was a click (not a drag)
    const deltaX = Math.abs(e.clientX - dragRef.current.startX);
    const deltaY = Math.abs(e.clientY - dragRef.current.startY);
    
    if (deltaX < 5 && deltaY < 5) {
      onClick();
      return;
    }

    // Snap to nearest edge (left or right)
    const centerX = currentX + BUTTON_SIZE / 2;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const distLeft = centerX;
    const distRight = viewportWidth - centerX;
    
    // Determine edge
    const edge = distLeft < distRight ? 'left' : 'right';
    
    // Calculate offsetY from bottom
    const offsetY = Math.max(PADDING, viewportHeight - currentY - BUTTON_SIZE);

    setEdgePosition({ edge, offsetY });
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

    newX = Math.max(PADDING, Math.min(window.innerWidth - BUTTON_SIZE - PADDING, newX));
    newY = Math.max(PADDING, Math.min(window.innerHeight - BUTTON_SIZE - PADDING, newY));

    if (buttonRef.current) {
      buttonRef.current.style.left = `${newX}px`;
      buttonRef.current.style.top = `${newY}px`;
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);

    const currentX = parseFloat(buttonRef.current?.style.left) || calculatePosition().x;
    const currentY = parseFloat(buttonRef.current?.style.top) || calculatePosition().y;

    // Check if it was a tap
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - dragRef.current.startX);
    const deltaY = Math.abs(touch.clientY - dragRef.current.startY);
    
    if (deltaX < 10 && deltaY < 10) {
      onClick();
      return;
    }

    // Snap to edge
    const centerX = currentX + BUTTON_SIZE / 2;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const edge = centerX < viewportWidth / 2 ? 'left' : 'right';
    const offsetY = Math.max(PADDING, viewportHeight - currentY - BUTTON_SIZE);

    setEdgePosition({ edge, offsetY });
  };

  if (isOpen) return null;

  // Tính position thực tế
  const { x, y } = calculatePosition();

  return (
    <button
      ref={buttonRef}
      className={`chatbot-toggle ${isDragging ? 'dragging' : ''} ${isIdle && !isHovered ? 'idle' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`
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

