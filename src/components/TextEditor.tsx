import React, { useState, useEffect } from 'react';
import useDocumentSync from '../hooks/useDocumentSync';
import UserCursor from './UserCursor';
import { useAuth } from '../contexts/AuthContext';

interface TextEditorProps {
  onLogout?: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ onLogout }) => {
  const {
    content,
    remoteCursors,
    textareaRef,
    handleContentChange,
    handleCursorChange,
    setLoggingOut
  } = useDocumentSync('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showStats, setShowStats] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showUserList, setShowUserList] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
        setShowMobileActions(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 12));
  const toggleStats = () => {
    setShowStats(!showStats);
    setIsMobileMenuOpen(false);
    setShowMobileActions(false);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const lineCount = content.split('\n').length;

  // Copy to clipboard function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setIsMobileMenuOpen(false);
      setShowMobileActions(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  // Save to local file function
  const handleSave = () => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collab-document-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsMobileMenuOpen(false);
      setShowMobileActions(false);
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save file');
    }
  };

  // Share function
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Collaborative Document',
          text: content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
      setIsMobileMenuOpen(false);
      setShowMobileActions(false);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleLogout = async () => {
    if (setLoggingOut) setLoggingOut();
    await signOut();
    if (onLogout) onLogout();
  };

  const theme = {
    bg: isDarkMode ? '#0a0a0a' : '#f0f2f5',
    text: isDarkMode ? '#e0e0e0' : '#1e1e2f',
    editorBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    border: isDarkMode ? '#333333' : '#e4e6eb',
    headerBg: isDarkMode ? '#141414' : '#ffffff',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    statsBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    cardBg: isDarkMode ? '#252525' : '#f8fafc',
    dropdownBg: isDarkMode ? '#252525' : '#ffffff',
    mobileMenuBg: isDarkMode ? '#1a1a1a' : '#ffffff'
  };

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  // Get list of active users - ONLY OTHER USERS, NOT CURRENT USER
  const otherUsers = remoteCursors ? Object.values(remoteCursors).map(cursor => ({
    id: cursor.userId,
    name: cursor.userName,
    initials: cursor.userInitials,
    color: cursor.userColor,
    lastUpdate: cursor.lastUpdate
  })) : [];

  // For dropdown - include all users including current
  const allUsers = [...otherUsers];
  if (user) {
    allUsers.push({
      id: user.uid,
      name: user.displayName || 'You',
      initials: user.displayName ? 
        (user.displayName.split(' ').length >= 2 ? 
          `${user.displayName.split(' ')[0][0]}${user.displayName.split(' ')[1][0]}`.toUpperCase() : 
          user.displayName.substring(0, 2).toUpperCase()) : 
        'You',
      color: '#8b5cf6',
      lastUpdate: Date.now()
    });
  }

  // Get user initials for display
  const getUserInitials = (): string => {
    if (!user?.displayName) return 'U';
    const names = user.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.displayName.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bg, color: theme.text }}>
      {/* Header with User Info */}
      <div style={{ ...styles.header, backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>✎</span>
            <h2 style={styles.title}>CollabEdit</h2>
          </div>
          
          {/* Single Avatar */}
          <div style={styles.userMenu}>
            <div 
              style={{ ...styles.userAvatar, backgroundColor: theme.accent }}
              onClick={() => setShowUserList(!showUserList)}
            >
              {getUserInitials()}
            </div>

            {/* User Dropdown */}
            {showUserList && (
              <div style={{ ...styles.userDropdown, backgroundColor: theme.dropdownBg, borderColor: theme.border }}>
                <div style={styles.userDropdownHeader}>
                  <span style={styles.userDropdownTitle}>Active Users</span>
                  <span style={styles.userDropdownCount}>{allUsers.length}</span>
                </div>
                {allUsers.map(activeUser => (
                  <div key={activeUser.id} style={styles.userDropdownItem}>
                    <div style={{ ...styles.userDropdownAvatar, backgroundColor: activeUser.color }}>
                      {activeUser.initials}
                    </div>
                    <span style={styles.userDropdownName}>
                      {activeUser.name}
                      {activeUser.id === user?.uid && ' (You)'}
                    </span>
                  </div>
                ))}
                <div style={styles.userDropdownDivider} />
                <button onClick={handleLogout} style={styles.logoutButton}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ ...styles.mainContent, padding: isMobile ? '12px' : isTablet ? '16px' : '24px' }}>
        <div style={styles.editorWrapper}>
          <div style={{ 
            ...styles.editorContainer, 
            backgroundColor: theme.editorBg, 
            borderColor: theme.border,
            minHeight: isMobile ? '350px' : isTablet ? '400px' : '500px'
          }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleCursorChange}
              onClick={handleCursorChange}
              onKeyUp={handleCursorChange}
              style={{ 
                ...styles.textarea, 
                fontSize: `${isMobile ? fontSize - 2 : fontSize}px`,
                color: theme.text,
                backgroundColor: theme.editorBg,
                padding: isMobile ? '12px' : '20px',
                minHeight: isMobile ? '350px' : isTablet ? '400px' : '500px'
              }}
              placeholder="Start typing your collaborative document..."
            />
            
            {/* Render ONLY OTHER USERS' cursors - NOT current user */}
            {otherUsers.map(otherUser => {
              // Find the cursor data for this user
              const cursorEntry = Object.entries(remoteCursors || {}).find(
                ([_, cursor]) => cursor.userId === otherUser.id
              );
              
              if (!cursorEntry) return null;
              const [userId, cursorData] = cursorEntry;
              
              return (
                <UserCursor
                  key={userId}
                  position={cursorData.position}
                  textareaRef={textareaRef}
                  userInitials={cursorData.userInitials}
                  userColor={cursorData.userColor}
                />
              );
            })}
          </div>

          {/* Statistics Panel */}
          {showStats && (
            <div style={{ ...styles.statsPanel, backgroundColor: theme.statsBg, borderColor: theme.border }}>
              <div style={styles.statsHeader}>
                <span style={styles.statsTitle}>Document Statistics</span>
                <div style={styles.statsBadge}>
                  <span style={styles.statsBadgeDot}></span>
                  <span style={styles.statsBadgeText}>live</span>
                </div>
              </div>
              
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, backgroundColor: theme.cardBg }}>
                  <span style={styles.statIcon}>📝</span>
                  <div style={styles.statInfo}>
                    <span style={styles.statLabel}>Characters</span>
                    <span style={styles.statValue}>{charCount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ ...styles.statCard, backgroundColor: theme.cardBg }}>
                  <span style={styles.statIcon}>📚</span>
                  <div style={styles.statInfo}>
                    <span style={styles.statLabel}>Words</span>
                    <span style={styles.statValue}>{wordCount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ ...styles.statCard, backgroundColor: theme.cardBg }}>
                  <span style={styles.statIcon}>📏</span>
                  <div style={styles.statInfo}>
                    <span style={styles.statLabel}>Lines</span>
                    <span style={styles.statValue}>{lineCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar Footer - Responsive with collapsible actions for mobile */}
      <div style={{ ...styles.footer, backgroundColor: theme.headerBg, borderTop: `1px solid ${theme.border}` }}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <span style={styles.footerIcon}>✨</span>
            <span style={{ ...styles.footerText, fontSize: isMobile ? '11px' : '13px' }}>
              {allUsers.length} active
            </span>
          </div>
          
          {/* Mobile View - Collapsible Actions */}
          {isMobile ? (
            <div style={styles.mobileFooterRight}>
              <button 
                onClick={() => setShowMobileActions(!showMobileActions)} 
                style={{ ...styles.mobileMenuButton, color: theme.text, borderColor: theme.border }}
              >
                <span style={styles.mobileMenuIcon}>⚡</span>
                <span style={styles.mobileMenuLabel}>Actions</span>
              </button>
              
              {showMobileActions && (
                <div style={{ ...styles.mobileActionsPanel, backgroundColor: theme.dropdownBg, borderColor: theme.border }}>
                  <button onClick={toggleStats} style={styles.mobileActionItem} title="Statistics">
                    <span style={styles.mobileActionIcon}>📊</span>
                    <span style={styles.mobileActionText}>Statistics</span>
                    {showStats && <span style={styles.mobileActionBadge}>●</span>}
                  </button>
                  
                  <button onClick={handleCopy} style={styles.mobileActionItem} title="Copy">
                    <span style={styles.mobileActionIcon}>{copySuccess ? '✅' : '📋'}</span>
                    <span style={styles.mobileActionText}>Copy</span>
                    {copySuccess && <span style={styles.mobileActionBadge}>✓</span>}
                  </button>
                  
                  <button onClick={handleSave} style={styles.mobileActionItem} title="Save">
                    <span style={styles.mobileActionIcon}>{saveSuccess ? '✅' : '💾'}</span>
                    <span style={styles.mobileActionText}>Save</span>
                    {saveSuccess && <span style={styles.mobileActionBadge}>✓</span>}
                  </button>
                  
                  <button onClick={handleShare} style={styles.mobileActionItem} title="Share">
                    <span style={styles.mobileActionIcon}>🔗</span>
                    <span style={styles.mobileActionText}>Share</span>
                  </button>
                  
                  <button onClick={toggleTheme} style={styles.mobileActionItem} title="Theme">
                    <span style={styles.mobileActionIcon}>{isDarkMode ? '🌙' : '☀️'}</span>
                    <span style={styles.mobileActionText}>{isDarkMode ? 'Dark' : 'Light'}</span>
                  </button>
                  
                  <div style={styles.mobileFontControls}>
                    <button onClick={decreaseFont} style={{ ...styles.mobileFontButton, borderColor: theme.border }}>A−</button>
                    <span style={styles.mobileFontValue}>{fontSize}px</span>
                    <button onClick={increaseFont} style={{ ...styles.mobileFontButton, borderColor: theme.border }}>A+</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop View - All Actions Visible */
            <div style={styles.footerRight}>
              <button onClick={toggleStats} style={styles.footerButton} title="Statistics">
                <span style={styles.footerButtonIcon}>📊</span>
              </button>
              <button onClick={handleCopy} style={styles.footerButton} title="Copy">
                <span style={styles.footerButtonIcon}>{copySuccess ? '✅' : '📋'}</span>
              </button>
              <button onClick={handleSave} style={styles.footerButton} title="Save">
                <span style={styles.footerButtonIcon}>{saveSuccess ? '✅' : '💾'}</span>
              </button>
              <button onClick={handleShare} style={styles.footerButton} title="Share">
                <span style={styles.footerButtonIcon}>🔗</span>
              </button>
              <button onClick={toggleTheme} style={styles.footerButton} title="Theme">
                <span style={styles.footerButtonIcon}>{isDarkMode ? '🌙' : '☀️'}</span>
              </button>
              <div style={styles.fontSizeControls}>
                <button onClick={decreaseFont} style={styles.fontSizeButton} title="Decrease font size">−</button>
                <span style={styles.fontSizeValue}>{fontSize}</span>
                <button onClick={increaseFont} style={styles.fontSizeButton} title="Increase font size">+</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    padding: '12px 24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1000
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoIcon: {
    fontSize: '24px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '-0.5px'
  },
  userMenu: {
    position: 'relative'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    border: '2px solid #ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  userDropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '240px',
    border: '1px solid',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    zIndex: 1000
  },
  userDropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    marginBottom: '4px'
  },
  userDropdownTitle: {
    fontSize: '13px',
    fontWeight: 600
  },
  userDropdownCount: {
    fontSize: '12px',
    opacity: 0.7
  },
  userDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  userDropdownAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 600
  },
  userDropdownName: {
    fontSize: '13px',
    flex: 1
  },
  userDropdownDivider: {
    height: '1px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    margin: '8px 0'
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff6b6b',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  mainContent: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  editorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  editorContainer: {
    position: 'relative',
    border: '1px solid',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  textarea: {
    width: '100%',
    height: '100%',
    lineHeight: '1.7',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    boxSizing: 'border-box'
  },
  statsPanel: {
    border: '1px solid',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  statsTitle: {
    fontSize: '16px',
    fontWeight: 600
  },
  statsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '20px'
  },
  statsBadgeDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  statsBadgeText: {
    fontSize: '11px',
    color: '#10b981'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  statCard: {
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statIcon: {
    fontSize: '20px'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '11px',
    opacity: 0.7,
    marginBottom: '2px'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 700
  },
  footer: {
    padding: '8px 16px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(10px)'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  footerButton: {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '8px',
    background: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  footerButtonIcon: {
    fontSize: '16px'
  },
  fontSizeControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: '4px'
  },
  fontSizeButton: {
    width: '28px',
    height: '28px',
    border: '1px solid',
    borderRadius: '6px',
    background: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  fontSizeValue: {
    minWidth: '30px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 600
  },
  footerIcon: {
    fontSize: '14px',
    opacity: 0.7
  },
  footerText: {
    opacity: 0.8
  },
  // Mobile-specific styles
  mobileFooterRight: {
    position: 'relative'
  },
  mobileMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: '20px',
    background: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease'
  },
  mobileMenuIcon: {
    fontSize: '14px'
  },
  mobileMenuLabel: {
    fontSize: '12px'
  },
  mobileActionsPanel: {
    position: 'absolute',
    bottom: '45px',
    right: '0',
    width: '200px',
    border: '1px solid',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
    zIndex: 1000,
    animation: 'slideUp 0.2s ease'
  },
  mobileActionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  mobileActionIcon: {
    fontSize: '18px',
    minWidth: '24px'
  },
  mobileActionText: {
    flex: 1,
    textAlign: 'left'
  },
  mobileActionBadge: {
    fontSize: '12px',
    color: '#10b981'
  },
  mobileFontControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    gap: '8px'
  },
  mobileFontButton: {
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: '6px',
    background: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  },
  mobileFontValue: {
    fontSize: '13px',
    fontWeight: 600,
    minWidth: '40px',
    textAlign: 'center'
  }
};

// Add global animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  textarea::placeholder {
    color: #999;
    opacity: 0.5;
    font-style: italic;
  }
  
  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  @media (max-width: 768px) {
    textarea {
      font-size: 14px;
    }
  }
`;
document.head.appendChild(style);

export default TextEditor;
