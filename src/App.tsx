/**
 * Onfolio — Onchain Investment Passport for Tokenized Equities on Solana
 *
 * Core Flow:
 * LANDING (Auth) → USER → WALLET ADDRESS → SOLANA DATA → ASSET RECOGNITION → PORTFOLIO → PASSPORT → VERIFICATION
 *
 * Visual System:
 * Modern financial technology aesthetics with terracotta brand mark, warm porcelain canvas,
 * and high-contrast typography.
 */

import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SecurityPrinciplesBanner } from './components/security/SecurityPrinciplesBanner';
import { WalletScanner } from './components/wallet/WalletScanner';
import { PassportCard } from './components/passport/PassportCard';
import { PortfolioBreakdown } from './components/portfolio/PortfolioBreakdown';
import { VerificationDrawer } from './components/passport/VerificationDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthLanding } from './components/auth/AuthLanding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

const OnfolioMainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'passport' | 'holdings' | 'audit'>('passport');

  // Display clean initial landing screen if not signed in
  if (!isAuthenticated && !isLoading) {
    return <AuthLanding />;
  }

  const handleTabChange = (tab: 'passport' | 'holdings' | 'audit') => {
    setActiveTab(tab);
    if (tab === 'holdings') {
      const el = document.getElementById('portfolio-breakdown-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'passport') {
      const el = document.getElementById('investment-passport-container') || document.getElementById('wallet-scanner-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="onfolio-app-canvas"
      className="min-h-screen bg-[#FAF8F5] text-[#191F28] flex flex-col font-sans antialiased selection:bg-[#FAF0EB] selection:text-[#D26E46]"
    >
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Core Non-Custodial Security Notice */}
        <SecurityPrinciplesBanner />

        {/* Address Input & Wallet Discovery */}
        <WalletScanner />

        {/* The Passport is the Product */}
        <PassportCard />

        {/* Portfolio Breakdown (Supporting Evidence for Passport) */}
        <PortfolioBreakdown />

        {/* Drawers & Modals */}
        <VerificationDrawer />
        <SettingsModal />
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <OnfolioMainContent />
      </AppProvider>
    </AuthProvider>
  );
}
