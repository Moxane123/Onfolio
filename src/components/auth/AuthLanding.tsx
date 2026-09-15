/**
 * Onfolio — Landing Page & Authentication Gate
 *
 * SPECIFICATION:
 * - The very first page you see is the Onfolio logo and the text "Onfolio".
 * - "Sign in with your email", and under it is "Sign in with Google".
 * - "Then if you want to sign up too, it's different. You get sign in or sign up."
 * - Once authenticated, seamlessly transitions to the wallet scanning & passport experience.
 */

import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OnfolioLogo } from '../brand/OnfolioLogo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AuthLanding: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(cleanEmail);
      } else {
        await signUpWithEmail(cleanEmail, name);
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed. Please try again.';
      setError(msg);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div
      id="onfolio-landing-page"
      className="min-h-screen bg-[#FAF8F5] text-[#191F28] flex flex-col justify-between items-center px-4 py-8 sm:py-16 selection:bg-[#FAF0EB] selection:text-[#D26E46]"
    >
      {/* Top subtle bar */}
      <div className="w-full max-w-md flex justify-end">
        <button
          onClick={signInAsGuest}
          className="text-xs font-medium text-[#798596] hover:text-[#191F28] transition-colors py-1 px-2.5 rounded-md hover:bg-[#F4F0EB]"
        >
          Explore as Guest &rarr;
        </button>
      </div>

      {/* Main Brand & Auth Container */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Brand Logo & Wordmark (Matching User Brand Kit) */}
        <div className="mb-8 flex flex-col items-center text-center">
          <OnfolioLogo size="xl" layout="vertical" className="mb-2" />
          <p className="text-xs sm:text-sm text-[#798596] mt-2 font-medium tracking-wide">
            Onchain Investment Passport for Tokenized Equities
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white border border-[#E8E3DC] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#191F28] tracking-tight">
              {mode === 'signin' ? 'Sign in with your email' : 'Create your Onfolio account'}
            </h2>
            <p className="text-xs text-[#798596] mt-1">
              {mode === 'signin'
                ? 'Access your verifiable onchain portfolio and passport'
                : 'Start tracking your verified onchain equity credentials'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl flex items-start space-x-2.5 text-xs text-[#991B1B] animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                autoComplete="name"
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="investor@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              autoFocus
            />

            <Button
              id="auth-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              disabled={isGoogleSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Continue with Email' : 'Create Account'}
            </Button>
          </form>

          {/* Divider with 'or' */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E3DC]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#798596] uppercase tracking-wider font-mono text-[11px]">
                or
              </span>
            </div>
          </div>

          {/* Sign In / Up with Google */}
          <button
            id="google-auth-btn"
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] hover:bg-[#F8FAFC] text-[#1E293B] font-medium text-sm rounded-xl transition-all shadow-2xs hover:shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGoogleSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#D26E46] border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span>Opening Google Sign-In...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </>
            )}
          </button>

          {/* Mode Switcher */}
          <div className="mt-6 pt-5 border-t border-[#F0ECE5] text-center text-xs text-[#798596]">
            {mode === 'signin' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  id="switch-to-signup-btn"
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-semibold text-[#D26E46] hover:text-[#BF5D35] transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  id="switch-to-signin-btn"
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-semibold text-[#D26E46] hover:text-[#BF5D35] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Security & Non-Custodial Note */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-[#798596]">
          <ShieldCheck className="w-4 h-4 text-[#2A7954]" />
          <span>Non-custodial. We never request private keys or funds.</span>
        </div>
      </div>

      {/* Footer minimal info */}
      <footer className="w-full max-w-md text-center text-xs text-[#A5AFBD] mt-8">
        &copy; {new Date().getFullYear()} Onfolio Protocol. Verified onchain equity credentials.
      </footer>
    </div>
  );
};
