import React, { useEffect, useRef } from 'react';

interface UserCursorProps {
  position: number;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  userInitials: string;
  userColor: string;
}

const UserCursor: React.FC<UserCursorProps> = ({ 
  position, 
  textareaRef, 
  userInitials, 
  userColor 
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current && cursorRef.current) {
      const textarea = textareaRef.current;
      const { offsetLeft, offsetTop } = getCursorPosition(textarea, position);
      
      cursorRef.current.style.left = `${offsetLeft}px`;
      cursorRef.current.style.top = `${offsetTop}px`;
    }
  }, [position, textareaRef]);

  const getCursorPosition = (textarea: HTMLTextAreaElement, pos: number): { offsetLeft: number; offsetTop: number } => {
    const div = document.createElement('div');
    const style = window.getComputedStyle(textarea);
    
    div.style.position = 'absolute';
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.fontFamily = style.fontFamily;
    div.style.fontSize = style.fontSize;
    div.style.letterSpacing = style.letterSpacing;
    div.style.lineHeight = style.lineHeight;
    div.style.padding = style.padding;
    div.style.border = style.border;
    div.style.boxSizing = 'border-box';
    div.style.width = `${textarea.offsetWidth}px`;
    
    const textContent = textarea.value.substring(0, pos);
    div.textContent = textContent;
    
    document.body.appendChild(div);
    
    const span = document.createElement('span');
    span.textContent = textarea.value.substring(pos) || ' ';
    div.appendChild(span);
    
    const { offsetLeft, offsetTop } = span;
    document.body.removeChild(div);
    
    return { offsetLeft, offsetTop };
  };

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      {/* Cursor line */}
      <div
        style={{
          width: '2px',
          height: '1.2em',
          backgroundColor: userColor,
          animation: 'blink 1s infinite'
        }}
      />
      
      {/* User avatar with initials - FIXED: Only show initials once */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '0',
          backgroundColor: userColor,
          color: '#ffffff',
          borderRadius: '12px 12px 12px 0',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}
      >
        {userInitials}
      </div>
    </div>
  );
};

export default UserCursor;
