import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, off, Database, DatabaseReference } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = (): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error(`Missing Firebase configuration fields: ${missingFields.join(', ')}. Please check your .env file.`);
    return false;
  }
  return true;
};

// Initialize variables with proper types
let app: FirebaseApp | undefined;
let database: Database | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let documentRef: DatabaseReference | undefined;

if (validateFirebaseConfig()) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Add custom parameters to fix popup issues
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    documentRef = ref(database, 'document/doc_001');
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase configuration incomplete. Using mock mode.');
}

// Auth functions
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    if (!auth || !googleProvider) {
      throw new Error('Firebase auth not initialized');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  if (!auth) {
    console.warn('Firebase auth not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Export database and ref functions with null checks
export { database, auth, documentRef, ref, onValue, set, off };
export type { User };