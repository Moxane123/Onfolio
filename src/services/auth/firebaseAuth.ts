/**
 * Onfolio — Official Google Sign-In & Firebase Auth Service
 *
 * Implements Google's official OAuth authentication flow via Firebase Auth.
 * Features:
 * - Official Google account-selection/sign-in popup with prompt='select_account'
 * - Automatic session recovery and persistence across reloads
 * - Comprehensive handling of popup-blocking, cancellation, and network errors
 * - Zero hardcoding or manual credential prompts
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';
import { User } from '../../context/AuthContext';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('openid');

// Force account chooser so user can select their specific account
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Ensure local persistence
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth persistence setup notice:', err);
  });
} catch (e) {
  console.warn('Set persistence failed:', e);
}

/**
 * Maps a Firebase User object to an Onfolio user representation
 */
export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    email: fbUser.email || 'investor@onfolio.network',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Onfolio Investor',
    provider: 'google',
    avatarUrl: fbUser.photoURL || undefined,
  };
}

/**
 * Triggers official Google OAuth sign-in popup flow
 */
export async function authenticateWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  } catch (err: unknown) {
    const authErr = err as AuthError;
    console.error('Google OAuth sign-in error:', authErr.code, authErr.message);

    if (authErr.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in was cancelled before completion. Please try again.');
    } else if (authErr.code === 'auth/popup-blocked') {
      throw new Error(
        'The Google account sign-in popup was blocked by your browser. Please enable popups for this site and try again.'
      );
    } else if (authErr.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in request was cancelled. Another popup may already be open.');
    } else if (authErr.code === 'auth/network-request-failed') {
      throw new Error('Network error: Unable to connect to Google authentication servers. Check your internet connection.');
    } else if (authErr.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google authentication.');
    }

    throw new Error(authErr.message || 'Failed to authenticate with Google. Please try again.');
  }
}

/**
 * Signs out from Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Error during Firebase signOut:', err);
  }
}

/**
 * Subscribes to Firebase Auth state changes
 */
export function onAuthStateSubscription(
  callback: (user: User | null, rawFirebaseUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback(mapFirebaseUser(fbUser), fbUser);
    } else {
      callback(null, null);
    }
  });
}
