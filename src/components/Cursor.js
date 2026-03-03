import React, { useEffect, useRef } from 'react';

const Cursor = ({ position, textareaRef }) => {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && cursorRef.current) {
      const textarea = textareaRef.current;
      const { offsetLeft, offsetTop } = getCursorPosition(textarea, position);
      
      cursorRef.current.style.left = `${offsetLeft}px`;
      cursorRef.current.style.top = `${offsetTop}px`;
    }
  }, [position, textareaRef]);

  const getCursorPosition = (textarea, pos) => {
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
        width: '2px',
        height: '1.2em',
        backgroundColor: '#ff6b6b',
        pointerEvents: 'none',
        transition: 'all 0.1s ease',
        zIndex: 1000
      }}
    />
  );
};

export default Cursor;