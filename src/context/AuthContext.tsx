/**
 * Onfolio — Authentication Context
 * Manages user session (Email, Google, Guest), sign-in, sign-up, and sign-out states.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authenticateWithGoogle,
  logoutFirebase,
  onAuthStateSubscription,
} from '../services/auth/firebaseAuth';

export interface User {
  email: string;
  name?: string;
  provider: 'email' | 'google' | 'guest';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signUpWithEmail: (email: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = 'onfolio_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Subscribe to real Firebase Auth state & fall back to local storage
  useEffect(() => {
    let isSubscribed = true;

    // Listen to Firebase auth state changes (persists Google account sessions)
    const unsubscribeFirebase = onAuthStateSubscription((fbUser) => {
      if (!isSubscribed) return;

      if (fbUser) {
        setUser(fbUser);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fbUser));
        } catch {
          // ignore
        }
        setIsLoading(false);
      } else {
        // If not authenticated via Firebase, check if an email or guest session is saved
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.provider !== 'google') {
              setUser(parsed);
            }
          }
        } catch {
          // ignore
        }
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribeFirebase();
    };
  }, []);

  const saveUserSession = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Storage unavailable
    }
  };

  const signInWithEmail = async (email: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      provider: 'email',
    };
    saveUserSession(newUser);
    setIsLoading(false);
  };

  const signUpWithEmail = async (email: string, name?: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      provider: 'email',
    };
    saveUserSession(newUser);
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const googleUser = await authenticateWithGoogle();
      saveUserSession(googleUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    const newUser: User = {
      email: 'guest@onfolio.network',
      name: 'Public Guest',
      provider: 'guest',
    };
    saveUserSession(newUser);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await logoutFirebase();
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
