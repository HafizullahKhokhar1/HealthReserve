import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (role: UserRole) => Promise<void>;
  signUpWithEmailAuth: (fullName: string, email: string, password: string, role: UserRole) => Promise<void>;
  signInWithEmailAuth: (email: string, password: string, role: UserRole) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithPhone: (firebaseUser: FirebaseUser, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Load cached user from localStorage to enable faster initial render
 * while auth completes in the background
 */
function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem('healthreserve_user_cache');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to load cached user:', error);
  }
  return null;
}

/**
 * Cache user to localStorage for faster subsequent loads
 */
function cacheUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem('healthreserve_user_cache', JSON.stringify(user));
    } else {
      localStorage.removeItem('healthreserve_user_cache');
    }
  } catch (error) {
    console.warn('Failed to cache user:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // If we have a cached user, we can render immediately (non-blocking)
    // but we still need to validate it's still valid
    setIsValidating(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { uid: firebaseUser.uid, ...userDoc.data() } as User;
            setUser(userData);
            cacheUser(userData);
          } else {
            setUser(null);
            cacheUser(null);
          }
        } catch (error) {
          console.error('Failed to load user doc:', error);
          // Keep cached user if Firestore fails
        }
      } else {
        setUser(null);
        cacheUser(null);
      }
      setLoading(false);
      setIsValidating(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUser = async (firebaseUser: FirebaseUser, role: UserRole) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: Omit<User, 'uid'> = {
        name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
        email: firebaseUser.email || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
      const userData = { uid: firebaseUser.uid, ...newUser } as User;
      setUser(userData);
      cacheUser(userData);
    } else {
      const userData = { uid: firebaseUser.uid, ...userDoc.data() } as User;
      setUser(userData);
      cacheUser(userData);
    }
  };

  const signIn = async (role: UserRole) => {
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return;
      await syncUser(firebaseUser, role);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmailAuth = async (fullName: string, email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document with additional info
      const userRef = doc(db, 'users', firebaseUser.uid);
      const newUser: Omit<User, 'uid'> = {
        name: fullName,
        email: email,
        phoneNumber: '',
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
      
      const userData = { uid: firebaseUser.uid, ...newUser } as User;
      setUser(userData);
      cacheUser(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithEmailAuth = async (email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await syncUser(firebaseUser, role);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signInWithPhone = async (firebaseUser: FirebaseUser, role: UserRole) => {
    try {
      await syncUser(firebaseUser, role);
    } catch (error) {
      console.error('Phone Sign in error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    cacheUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUpWithEmailAuth, signInWithEmailAuth, sendPasswordReset, signInWithPhone, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
