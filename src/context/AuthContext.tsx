/**
 * Onfolio — Authentication Context
 * Manages user session (Email, Google, Guest), sign-in, sign-up, and sign-out states.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  signOut: () => void;
}

const STORAGE_KEY = 'onfolio_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoading(false);
    }
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
    // Simulate authentication processing
    await new Promise((r) => setTimeout(r, 600));
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
    await new Promise((r) => setTimeout(r, 650));
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
    await new Promise((r) => setTimeout(r, 700));
    const newUser: User = {
      email: 'investor@onfolio.network',
      name: 'Onfolio Investor',
      provider: 'google',
    };
    saveUserSession(newUser);
    setIsLoading(false);
  };

  const signInAsGuest = () => {
    const newUser: User = {
      email: 'guest@onfolio.network',
      name: 'Public Guest',
      provider: 'guest',
    };
    saveUserSession(newUser);
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
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
