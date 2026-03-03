import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TextEditor from './components/TextEditor';
import Login from './components/Login';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onClose={() => {}} />;
  }

  return <TextEditor onLogout={() => {}} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e4e6eb',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    color: '#666',
    fontSize: '14px'
  }
};

// Add global animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
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

export default App;
