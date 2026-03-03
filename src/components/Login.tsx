import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    await signIn();
    if (onClose) onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>×</button>
        
        <div style={styles.iconContainer}>✎</div>
        <h2 style={styles.title}>Welcome to CollabEdit</h2>
        <p style={styles.subtitle}>Sign in to start collaborating</p>
        
        <button onClick={handleGoogleSignIn} style={styles.googleButton}>
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            style={styles.googleIcon}
          />
          <span>Continue with Google</span>
        </button>
        
        <p style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(5px)'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '400px',
    width: '90%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 20px',
    transform: 'rotate(-5deg)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#1e1e2f'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px'
  },
  googleButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    border: '2px solid #e4e6eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#1e1e2f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '20px'
  },
  googleIcon: {
    width: '20px',
    height: '20px'
  },
  disclaimer: {
    fontSize: '12px',
    color: '#999',
    marginTop: '20px'
  }
};

export default Login;