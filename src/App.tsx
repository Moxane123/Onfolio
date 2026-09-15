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

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SecurityPrinciplesBanner } from './components/security/SecurityPrinciplesBanner';
import { WalletScanner } from './components/wallet/WalletScanner';
import { PortfolioDashboard } from './components/dashboard/PortfolioDashboard';
import { InvestmentPassportView } from './components/passport/InvestmentPassportView';
import { PortfolioBreakdown } from './components/portfolio/PortfolioBreakdown';
import { VerificationDrawer } from './components/passport/VerificationDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { AssetRegistryModal } from './components/registry/AssetRegistryModal';
import { AuthLanding } from './components/auth/AuthLanding';
import { PublicPassportScreen } from './components/passport/PublicPassportScreen';
import { getSharedPassportById, createSharedPassportProfile, DEFAULT_PRIVACY_CONTROLS } from './services/privacy/sharingEngine';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LayoutDashboard, ShieldCheck, Layers, FileCheck2, ArrowRight } from 'lucide-react';

const OnfolioMainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    isRegistryModalOpen,
    setRegistryModalOpen,
    setVerificationModalOpen,
    portfolio,
    passport,
    isScanning,
    preferences,
    setPrivacyMode,
    scanAddress,
    wallet,
  } = useApp();

  // Public shared passport route detection: /passport/<public-id> or ?passport=<public-id>
  const [publicSharedId, setPublicSharedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    const match = pathname.match(/\/passport\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('passport');
  });

  // Read initial view from URL search query (e.g. ?view=passport or ?view=dashboard)
  const [activeTab, setActiveTab] = useState<'passport' | 'dashboard' | 'holdings' | 'audit'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'dashboard') return 'dashboard';
      if (v === 'holdings') return 'holdings';
      if (v === 'audit') return 'audit';
    }
    // Default to the flagship central product: the Onfolio Passport
    return 'passport';
  });

  // Handle browser popstate navigation for /passport/<id>
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/passport\/([^/]+)/);
      if (match && match[1]) {
        setPublicSharedId(match[1]);
      } else {
        const params = new URLSearchParams(window.location.search);
        setPublicSharedId(params.get('passport'));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync active view to URL for shareability without full reload when not on a public route
  useEffect(() => {
    if (typeof window !== 'undefined' && !publicSharedId && portfolio?.walletAddress) {
      const params = new URLSearchParams(window.location.search);
      params.set('address', portfolio.walletAddress);
      params.set('view', activeTab);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab, portfolio?.walletAddress, publicSharedId]);

  // Navigate to public shared page
  const handleOpenSharedPage = (publicId: string) => {
    setPublicSharedId(publicId);
    if (typeof window !== 'undefined') {
      const newUrl = `/passport/${publicId}`;
      window.history.pushState({}, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Exit public passport view back to dashboard
  const handleExitSharedPage = () => {
    setPublicSharedId(null);
    if (typeof window !== 'undefined') {
      const newUrl = window.location.pathname.startsWith('/passport/') ? '/' : window.location.pathname;
      window.history.pushState({}, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If viewing a public passport page (/passport/<public-id>), render the standalone public view
  if (publicSharedId) {
    // Look up persisted profile or synthesize from active session if current user is owner
    let sharedProfile = getSharedPassportById(publicSharedId);

    if (!sharedProfile && passport && portfolio) {
      // Fallback: If viewing their newly shared ID, generate the profile dynamically
      sharedProfile = createSharedPassportProfile(
        passport,
        portfolio,
        'public',
        DEFAULT_PRIVACY_CONTROLS
      );
    }

    if (sharedProfile) {
      const isOwner = wallet?.address?.toLowerCase() === sharedProfile.ownerWalletAddress?.toLowerCase();
      return (
        <PublicPassportScreen
          sharedProfile={sharedProfile}
          onBackToApp={handleExitSharedPage}
          isOwner={isOwner}
        />
      );
    }

    // If ID not found
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF0EB] text-[#D26E46] flex items-center justify-center font-bold text-lg">
          404
        </div>
        <h2 className="text-lg font-bold text-[#191F28]">Public Passport Not Found</h2>
        <p className="text-xs text-[#798596] max-w-sm">
          The requested public passport identifier (<code className="font-mono">{publicSharedId}</code>) may have expired, been revoked by its owner, or the link is incorrect.
        </p>
        <button
          onClick={handleExitSharedPage}
          className="px-4 py-2 bg-[#191F28] hover:bg-[#2A3542] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Return to Onfolio App
        </button>
      </div>
    );
  }

  // While Firebase or storage checks for an existing session, display clean loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3">
        <div className="w-7 h-7 border-2 border-[#D26E46] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-[#798596] tracking-wide">Restoring session...</p>
      </div>
    );
  }

  // Display clean initial landing screen if not signed in
  if (!isAuthenticated) {
    return <AuthLanding />;
  }

  const handleTabChange = (tab: 'dashboard' | 'passport' | 'holdings' | 'audit') => {
    if (tab === 'audit') {
      setVerificationModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    if (wallet.address) {
      const isMock = portfolio?.isMockData ?? preferences.useDevAdapter;
      scanAddress(
        wallet.address,
        wallet.label,
        isMock,
        wallet.entryMethod,
        wallet.connectorName
      );
    }
  };

  const handleTogglePrivacy = () => {
    const nextMode = preferences.privacyMode === 'masked_balances' ? 'public' : 'masked_balances';
    setPrivacyMode(nextMode);
  };

  return (
    <div
      id="onfolio-app-canvas"
      className="min-h-screen bg-[#FAF8F5] text-[#191F28] flex flex-col font-sans antialiased selection:bg-[#FAF0EB] selection:text-[#D26E46]"
    >
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Core Non-Custodial Security Notice */}
        <SecurityPrinciplesBanner />

        {/* Address Input & Wallet Discovery */}
        <WalletScanner />

        {/* Primary Product Switcher: Seamless movement between Passport & Dashboard */}
        {portfolio && (
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E8E3DC]">
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-[#E8E3DC] shadow-2xs">
              {/* Flagship: Investment Passport */}
              <button
                id="btn-tab-view-passport"
                onClick={() => handleTabChange('passport')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'passport'
                    ? 'bg-[#191F28] text-white shadow-xs'
                    : 'text-[#4A5361] hover:text-[#191F28] hover:bg-[#FAF8F5]'
                }`}
              >
                <ShieldCheck
                  className={`w-4 h-4 ${
                    activeTab === 'passport' ? 'text-[#D26E46]' : 'text-[#798596]'
                  }`}
                />
                <span>Investment Passport</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                    activeTab === 'passport'
                      ? 'bg-[#2A3542] text-[#E8926F]'
                      : 'bg-[#F4F0EB] text-[#798596]'
                  }`}
                >
                  IDENTITY
                </span>
              </button>

              {/* Operational: Portfolio Dashboard */}
              <button
                id="btn-tab-view-dashboard"
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#191F28] text-white shadow-xs'
                    : 'text-[#4A5361] hover:text-[#191F28] hover:bg-[#FAF8F5]'
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 ${
                    activeTab === 'dashboard' ? 'text-[#D26E46]' : 'text-[#798596]'
                  }`}
                />
                <span>Portfolio Dashboard</span>
              </button>

              {/* Deep Ledger Holdings */}
              <button
                id="btn-tab-view-holdings"
                onClick={() => handleTabChange('holdings')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'holdings'
                    ? 'bg-[#191F28] text-white shadow-xs'
                    : 'text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Holdings Breakdown</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#798596] font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7954]" />
                <span>{portfolio.totalAssetsCount} Verified Equities</span>
              </span>
              <span>•</span>
              <span className="text-[#4A5361]">{portfolio.pricingFreshness.status.toUpperCase()} PRICING</span>
            </div>
          </div>
        )}

        {/* View Rendering */}
        {activeTab === 'passport' ? (
          /* THE FLAGSHIP PRODUCT: THE ONFOLIO INVESTMENT PASSPORT */
          passport && portfolio ? (
            <InvestmentPassportView
              passport={passport}
              portfolio={portfolio}
              preferences={preferences}
              onTogglePrivacy={handleTogglePrivacy}
              onOpenAudit={() => setVerificationModalOpen(true)}
              onSwitchToDashboard={() => handleTabChange('dashboard')}
              onOpenRegistryModal={() => setRegistryModalOpen(true)}
              onViewSharedPage={handleOpenSharedPage}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E3DC]">
              <div className="w-8 h-8 border-2 border-[#D26E46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-[#798596]">Generating sovereign investment identity...</p>
            </div>
          )
        ) : activeTab === 'dashboard' ? (
          /* THE OPERATIONAL PORTFOLIO DASHBOARD */
          <PortfolioDashboard
            portfolio={portfolio}
            isLoading={isScanning}
            preferences={preferences}
            onTogglePrivacy={handleTogglePrivacy}
            onRefresh={handleRefresh}
            onSwitchToPassport={() => handleTabChange('passport')}
          />
        ) : (
          /* THE DEEP ASSET BREAKDOWN */
          <div className="space-y-8">
            <PortfolioBreakdown />
          </div>
        )}

        {/* Drawers & Modals */}
        <VerificationDrawer />
        <SettingsModal />
        <AssetRegistryModal
          isOpen={isRegistryModalOpen}
          onClose={() => setRegistryModalOpen(false)}
        />
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
