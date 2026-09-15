/**
 * Onfolio — Global Application Header
 * Implements the Onfolio brand identity, global navigation tabs,
 * privacy disclosure toggle, provider state, and user session controls.
 */

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Radio,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  FileCheck2,
  Layers,
  Sparkles,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OnfolioLogo } from '../brand/OnfolioLogo';
import { Badge } from '../ui/Badge';
import { formatAbbreviatedAddress } from '../../services/wallet/walletService';

export interface HeaderProps {
  activeTab?: 'dashboard' | 'passport' | 'holdings' | 'audit';
  onTabChange?: (tab: 'dashboard' | 'passport' | 'holdings' | 'audit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { user, signOut, signInWithGoogle } = useAuth();
  const {
    preferences,
    setPrivacyMode,
    setSettingsModalOpen,
    setVerificationModalOpen,
    setConnectWalletModalOpen,
    setRegistryModalOpen,
    wallet,
    portfolio,
    isScanning,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isMock = portfolio?.isMockData ?? preferences.useDevAdapter;

  const handleTabClick = (tab: 'dashboard' | 'passport' | 'holdings' | 'audit') => {
    if (tab === 'audit') {
      setVerificationModalOpen(true);
    } else if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header
      id="onfolio-header"
      className="border-b border-[#E8E3DC] bg-white sticky top-0 z-30 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            onClick={() => onTabChange && onTabChange('passport')}
            className="flex items-center text-left cursor-pointer focus-visible:outline-hidden"
          >
            <OnfolioLogo size="md" layout="horizontal" />
          </button>

          {/* Global Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              id="nav-dashboard-tab"
              onClick={() => handleTabClick('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#FAF0EB] text-[#D26E46]'
                  : 'text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB]'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-passport-tab"
              onClick={() => handleTabClick('passport')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'passport'
                  ? 'bg-[#FAF0EB] text-[#D26E46]'
                  : 'text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB]'
              }`}
            >
              Passport
            </button>
            <button
              id="nav-holdings-tab"
              onClick={() => handleTabClick('holdings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'holdings'
                  ? 'bg-[#FAF0EB] text-[#D26E46]'
                  : 'text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB]'
              }`}
            >
              Holdings
            </button>
            <button
              id="nav-audit-tab"
              onClick={() => handleTabClick('audit')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB] transition-all cursor-pointer flex items-center space-x-1"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#D26E46]" />
              <span>Verification Audit</span>
            </button>
            <button
              id="nav-registry-tab"
              onClick={() => setRegistryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB] transition-all cursor-pointer flex items-center space-x-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#D26E46]" />
              <span>Asset Registry</span>
            </button>
          </nav>
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wallet Header Indicator */}
          {wallet.address ? (
            <button
              id="header-wallet-status-pill"
              onClick={() => {
                const el = document.getElementById('wallet-discovery-system');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setConnectWalletModalOpen(true);
                }
              }}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                wallet.entryMethod === 'connected'
                  ? 'bg-[#E8F5EE] text-[#1B603D] border-[#C2E4D2] hover:bg-[#D5EEDF]'
                  : 'bg-[#EEF2F6] text-[#334155] border-[#CBD5E1] hover:bg-[#E2E8F0]'
              }`}
              title={
                wallet.entryMethod === 'connected'
                  ? `Connected: ${wallet.address}`
                  : `Scanned: ${wallet.address}`
              }
            >
              {wallet.entryMethod === 'connected' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7954] animate-pulse"></span>
              ) : (
                <Eye className="w-3 h-3 text-[#64748B]" />
              )}
              <span className="font-mono font-semibold">
                {formatAbbreviatedAddress(wallet.address, 3, 3)}
              </span>
            </button>
          ) : (
            <button
              id="header-connect-wallet-nav-btn"
              onClick={() => setConnectWalletModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#191F28] hover:bg-[#2C3440] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <WalletIcon className="w-3 h-3 text-[#D26E46]" />
              <span>Connect</span>
            </button>
          )}

          {/* Data Source Status Pill */}
          <button
            id="data-source-indicator-btn"
            onClick={() => setSettingsModalOpen(true)}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isMock
                ? 'bg-[#FEF8E7] text-[#B87002] border-[#FCE6B5] hover:bg-[#FDF3D5]'
                : 'bg-[#EEF7F2] text-[#2A7954] border-[#C8E5D7] hover:bg-[#E1F2E8]'
            }`}
            title="Solana RPC connection status. Click to configure."
          >
            <Radio className={`w-3 h-3 ${isScanning ? 'animate-pulse text-[#D26E46]' : ''}`} />
            <span className="hidden sm:inline">
              {isMock ? 'Sandbox' : 'Solana RPC'}
            </span>
          </button>

          {/* Privacy Toggle (Public vs Masked) */}
          <div className="flex items-center bg-[#F4F0EB] rounded-lg p-0.5 border border-[#E8E3DC]">
            <button
              id="privacy-mode-public-btn"
              onClick={() => setPrivacyMode('public')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                preferences.privacyMode === 'public'
                  ? 'bg-white text-[#191F28] shadow-2xs font-semibold'
                  : 'text-[#798596] hover:text-[#191F28]'
              }`}
              title="Show exact asset values and balances"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Public</span>
            </button>
            <button
              id="privacy-mode-masked-btn"
              onClick={() => setPrivacyMode('masked_balances')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                preferences.privacyMode === 'masked_balances'
                  ? 'bg-white text-[#D26E46] shadow-2xs font-semibold'
                  : 'text-[#798596] hover:text-[#191F28]'
              }`}
              title="Mask exact dollar amounts while proving passport status"
            >
              <EyeOff className="w-3 h-3" />
              <span className="hidden sm:inline">Masked</span>
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={() => setSettingsModalOpen(true)}
            className="p-2 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
            title="Configure Solana RPC"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Account & Sign Out */}
          {user && (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-lg border border-[#E8E3DC] hover:border-[#D5CFC5] bg-white transition-all cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-[#E8E3DC]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#FAF0EB] text-[#D26E46] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-medium text-[#191F28] max-w-[110px] truncate">
                  {user.name || user.email}
                </span>
                <ChevronDown className="w-3 h-3 text-[#798596]" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E8E3DC] rounded-xl shadow-lg p-2 z-40"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#F0ECE5] mb-1">
                    <p className="text-[11px] text-[#798596] uppercase font-mono">
                      {user.provider === 'google' ? 'Google Account' : user.provider === 'guest' ? 'Guest Explorer' : 'Signed In'}
                    </p>
                    <p className="text-xs font-semibold text-[#191F28] truncate">{user.email}</p>
                    {user.provider === 'google' && (
                      <div className="flex items-center space-x-1.5 mt-1.5 text-[11px] text-[#1967D2] font-medium">
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Authenticated with Google</span>
                      </div>
                    )}
                  </div>

                  {user.provider === 'guest' && (
                    <button
                      id="guest-upgrade-google-btn"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        try {
                          await signInWithGoogle();
                        } catch (err) {
                          console.error('Sign in with Google error:', err);
                        }
                      }}
                      className="w-full mb-1 text-left px-3 py-2 text-xs text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg font-medium flex items-center space-x-2 border border-[#CBD5E1] transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  )}

                  <button
                    id="header-signout-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#C13B2E] hover:bg-[#FDF2F1] rounded-lg font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
