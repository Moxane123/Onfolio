import React, { useState, useEffect } from 'react';
import {
  Search,
  Wallet as WalletIcon,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEV_SAMPLE_WALLETS } from '../../services/solana/devAdapter';
import {
  classifySolanaAddress,
  formatAbbreviatedAddress,
} from '../../services/wallet/walletService';
import { Button } from '../ui/Button';
import { WalletDisplay } from './WalletDisplay';
import { ScannerStateFeedback } from './ScannerStateFeedback';
import { ConnectWalletModal } from './ConnectWalletModal';
import { MultiWalletManager } from './MultiWalletManager';

export const WalletScanner: React.FC = () => {
  const {
    wallet,
    discoveredWallets,
    scannerState,
    isScanning,
    scanError,
    scanAddress,
    setConnectWalletModalOpen,
    setSettingsModalOpen,
    loadSampleProfile,
    portfolio,
    passport,
  } = useApp();

  const [inputAddress, setInputAddress] = useState(wallet.address || '');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isMultiWalletOpen, setIsMultiWalletOpen] = useState(false);

  useEffect(() => {
    if (wallet.address) {
      setInputAddress(wallet.address);
    }
  }, [wallet.address]);

  const handleSubmitScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationWarning(null);

    const clean = inputAddress.trim();
    if (!clean) {
      setValidationWarning('Please enter a public Solana wallet address.');
      return;
    }

    const classification = classifySolanaAddress(clean);
    if (!classification.isValid) {
      setValidationWarning(
        classification.errorReason ||
          'Invalid Solana address format. Must be a 32-44 character Base58 string.'
      );
      return;
    }

    if (classification.isSystemProgram) {
      setValidationWarning(
        classification.errorReason ||
          'This address is a Solana system program ID, not a user equity wallet.'
      );
      return;
    }

    // Trigger address scan in read-only mode with entryMethod 'scanned'
    await scanAddress(clean, 'Manual Address Scan', false, 'scanned', 'Public Ledger Scan');
  };

  const handleClear = () => {
    setInputAddress('');
    setValidationWarning(null);
  };

  const handleOpenConnect = () => {
    setConnectWalletModalOpen(true);
  };

  return (
    <>
      <div
        id="wallet-discovery-system"
        className="bg-white border border-[#E8E3DC] rounded-3xl p-6 sm:p-7 shadow-xs mb-10 text-[#191F28]"
      >
        {/* Header with Subtitle and Active Wallet Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE5]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                ONFOLIO DISCOVERY
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#798596] border border-[#E8E3DC] font-mono">
                Read-Only Engine
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#191F28] tracking-tight mt-0.5">
              Wallet Resolution & Equity Ingestion
            </h2>
            <p className="text-xs text-[#798596] mt-0.5">
              Two equally valid entry methods: connect an active Solana wallet or paste any public address.
            </p>
          </div>

          {/* Active Wallet Display / Multi-wallet Drawer trigger */}
          <div className="flex flex-wrap items-center gap-2">
            {wallet.address ? (
              <WalletDisplay onOpenMultiWallet={() => setIsMultiWalletOpen(true)} />
            ) : (
              <Button
                id="header-connect-wallet-btn"
                type="button"
                variant="dark"
                size="md"
                onClick={handleOpenConnect}
                disabled={isScanning}
                leftIcon={<WalletIcon className="w-4 h-4 text-[#D26E46]" />}
              >
                Connect Wallet
              </Button>
            )}

            {discoveredWallets.length > 0 && !wallet.address && (
              <Button
                id="open-discovered-wallets-btn"
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsMultiWalletOpen(true)}
                leftIcon={<Layers className="w-4 h-4 text-[#798596]" />}
              >
                {discoveredWallets.length} Wallets
              </Button>
            )}
          </div>
        </div>

        {/* Dual Entry Method Choice Banner */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Method A: Connect Wallet */}
          <div
            id="entry-method-connect-card"
            className="p-4 rounded-2xl border border-[#E8E3DC] bg-[#FAF8F5] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#798596] uppercase tracking-wider">
                  Method A • Browser Extension
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#1B603D] font-medium border border-[#C2E4D2]">
                  Read-Only Public Key
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#191F28]">Connect Solana Wallet</h3>
              <p className="text-xs text-[#798596] mt-1 leading-relaxed">
                Connect your Phantom, Solflare, or Backpack extension. Onfolio will only request your public address to discover assets.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EDE8E1] flex items-center justify-between">
              <span className="text-[11px] text-[#798596] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2A7954]" />
                Zero signatures required
              </span>
              <Button
                id="trigger-connect-wallet-modal-btn"
                type="button"
                variant="dark"
                size="sm"
                onClick={handleOpenConnect}
                disabled={isScanning}
                leftIcon={<WalletIcon className="w-3.5 h-3.5 text-[#D26E46]" />}
              >
                {wallet.connected ? 'Switch Wallet' : 'Connect Wallet'}
              </Button>
            </div>
          </div>

          {/* Method B: Scan Wallet Address */}
          <div
            id="entry-method-scan-card"
            className="p-4 rounded-2xl border border-[#E8E3DC] bg-[#FAF8F5] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#798596] uppercase tracking-wider">
                  Method B • Direct Public Lookup
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2F6] text-[#334155] font-medium border border-[#CBD5E1]">
                  No Extension Needed
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#191F28]">Scan Public Address</h3>
              <p className="text-xs text-[#798596] mt-1 leading-relaxed">
                You can scan any public wallet without connecting it. Paste any Solana address below to query onchain equity assets directly.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EDE8E1] flex items-center justify-between">
              <span className="text-[11px] text-[#798596]">
                Non-custodial ledger observation
              </span>
              <span className="text-[11px] font-semibold text-[#D26E46]">
                Enter Address Below ↓
              </span>
            </div>
          </div>
        </div>

        {/* Manual Address Input Form */}
        <form onSubmit={handleSubmitScan} className="mt-5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#798596]">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="solana-address-input"
                type="text"
                value={inputAddress}
                onChange={(e) => {
                  setInputAddress(e.target.value);
                  if (validationWarning) setValidationWarning(null);
                }}
                placeholder="Paste public Solana wallet address (e.g. 7xKXtg... or 9xQeW...)"
                disabled={isScanning}
                className="w-full pl-10 pr-10 py-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl text-xs sm:text-sm font-mono text-[#191F28] placeholder:text-[#A5AFBD] focus:outline-hidden focus:ring-2 focus:ring-[#D26E46] focus:bg-white transition-all"
              />
              {inputAddress && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A5AFBD] hover:text-[#191F28] cursor-pointer"
                  title="Clear address input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              id="scan-address-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isScanning}
              isLoading={isScanning}
              rightIcon={!isScanning && <ArrowRight className="w-4 h-4" />}
            >
              {isScanning ? 'Querying Solana Ledger...' : 'Scan Public Address'}
            </Button>
          </div>
        </form>

        {/* Reusable State Machine Feedback */}
        <ScannerStateFeedback
          state={validationWarning ? 'invalid address' : scannerState}
          errorMessage={validationWarning || scanError}
          solBalance={portfolio?.solBalance || 0}
          holdingCount={portfolio?.holdings.length || 0}
          verifiedValueUsd={passport?.verifiedEquityValueUsd || 0}
          onRetry={() => {
            if (inputAddress) {
              scanAddress(inputAddress, 'Retry Scan', false);
            }
          }}
          onLoadSample={() => {
            loadSampleProfile(DEV_SAMPLE_WALLETS[0].address);
          }}
          onOpenSettings={() => {
            setSettingsModalOpen(true);
          }}
        />

        {/* Development Sample Profiles */}
        <div className="mt-5 pt-4 border-t border-[#F0ECE5] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#798596] uppercase tracking-wider mr-1">
            Demo Wallets:
          </span>
          {DEV_SAMPLE_WALLETS.map((sample) => (
            <button
              key={sample.address}
              id={`sample-profile-${sample.name.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => {
                setInputAddress(sample.address);
                loadSampleProfile(sample.address);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                wallet.address === sample.address
                  ? 'bg-[#191F28] text-white border-[#191F28] font-semibold shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#4A5361] border-[#E8E3DC] hover:bg-[#F4F0EB] hover:text-[#191F28]'
              }`}
            >
              {sample.name} ({formatAbbreviatedAddress(sample.address, 3, 4)})
            </button>
          ))}
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal />

      {/* Multi-Wallet Registry Drawer */}
      <MultiWalletManager
        isOpen={isMultiWalletOpen}
        onClose={() => setIsMultiWalletOpen(false)}
        onOpenScanNew={() => {
          setInputAddress('');
          const inputEl = document.getElementById('solana-address-input');
          if (inputEl) inputEl.focus();
        }}
        onOpenConnectNew={() => {
          setConnectWalletModalOpen(true);
        }}
      />
    </>
  );
};
