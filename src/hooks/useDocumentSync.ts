import { useState, useEffect, useRef, useMemo } from 'react';
import { documentRef, onValue, set, off } from '../firebase';
import debounce from 'lodash/debounce';
import { useAuth } from '../contexts/AuthContext';

interface CursorData {
  position: number;
  selection: { start: number; end: number };
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  lastUpdate: number;
}

interface DocumentData {
  content: string;
  cursorPosition?: number;
  selection?: { start: number; end: number };
  cursors?: { [key: string]: CursorData };
  timestamp?: number;
}

const useDocumentSync = (initialContent = '') => {
  const [content, setContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [remoteCursors, setRemoteCursors] = useState<{ [key: string]: CursorData }>({});
  const isRemoteUpdate = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  
  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Generate user color based on userId
  const getUserColor = (userId: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get user initials
  const getUserInitials = (userName: string): string => {
    if (!userName) return '?';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  // Load initial data from Firebase
  useEffect(() => {
    isMounted.current = true;
    
    if (!documentRef) {
      console.warn('Firebase not initialized');
      return;
    }

    const unsubscribe = onValue(documentRef, (snapshot) => {
      if (!isMounted.current) return;
      
      const data = snapshot.val() as DocumentData;
      if (data) {
        // Update content only if it's different and from remote
        if (data.content !== undefined && data.content !== content) {
          isRemoteUpdate.current = true;
          setContent(data.content);
        }
        
        // Update remote cursors (filter out own cursor)
        if (data.cursors && user) {
          const othersCursors: { [key: string]: CursorData } = {};
          Object.entries(data.cursors).forEach(([key, cursorData]) => {
            if (key !== user.uid && cursorData) {
              othersCursors[key] = cursorData;
            }
          });
          
          // Only update if different to prevent loops
          if (JSON.stringify(remoteCursors) !== JSON.stringify(othersCursors)) {
            setRemoteCursors(othersCursors);
          }
        }
        
        // Only restore cursor position for remote updates
        if (isRemoteUpdate.current && textareaRef.current && data.cursorPosition !== undefined) {
          const savedCursorPos = data.cursorPosition;
          setTimeout(() => {
            if (textareaRef.current && isMounted.current) {
              textareaRef.current.selectionStart = savedCursorPos;
              textareaRef.current.selectionEnd = savedCursorPos;
            }
          }, 0);
        }
        
        // Reset remote update flag
        isRemoteUpdate.current = false;
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user

  // FIXED: Clean up cursor on unmount - ONLY when user is logging out, not on refresh
  useEffect(() => {
    // This effect now only runs when user changes (login/logout)
    return () => {
      // Only remove cursor if user is logging out (not on page refresh)
      if (user && documentRef && !isMounted.current) {
        // Use a flag to check if this is a page refresh
        const isPageRefresh = performance.navigation.type === 1;
        
        if (!isPageRefresh) {
          // Only remove cursor on explicit logout, not on page refresh
          const updatedCursors = { ...remoteCursors };
          delete updatedCursors[user.uid];
          
          set(documentRef, {
            content,
            cursors: updatedCursors
          }).catch(err => console.error('Error cleaning up cursor:', err));
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not on remoteCursors or content

  // Create debounced function with useMemo
  const debouncedUpdate = useMemo(
    () => debounce((newContent: string, cursorPos: number, sel: { start: number; end: number }) => {
      if (!user || !documentRef || !isMounted.current) return;
      
      const cursorData: CursorData = {
        position: cursorPos,
        selection: sel,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userInitials: getUserInitials(user.displayName || 'Anonymous'),
        userColor: getUserColor(user.uid),
        lastUpdate: Date.now()
      };

      set(documentRef, {
        content: newContent,
        cursorPosition: cursorPos,
        selection: sel,
        cursors: {
          ...remoteCursors,
          [user.uid]: cursorData
        },
        timestamp: Date.now()
      });
    }, 100),
    [user, remoteCursors] // Keep remoteCursors here for cursor updates
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    const sel = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd
    };

    setContent(newContent);
    setCursorPosition(cursorPos);
    setSelection(sel);

    // Only send update if this is not a remote update
    if (!isRemoteUpdate.current && user) {
      debouncedUpdate(newContent, cursorPos, sel);
    }
  };

  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const cursorPos = target.selectionStart;
    const sel = {
      start: target.selectionStart,
      end: target.selectionEnd
    };
    
    setCursorPosition(cursorPos);
    setSelection(sel);
    
    // Only send cursor update if this is not a remote update
    if (!isRemoteUpdate.current && user) {
      debouncedUpdate(content, cursorPos, sel);
    }
  };

  return {
    content,
    setContent,
    cursorPosition,
    selection,
    remoteCursors,
    textareaRef,
    handleContentChange,
    handleCursorChange
  };
};

export default useDocumentSync;