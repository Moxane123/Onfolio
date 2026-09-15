/**
 * Onfolio — The Investment Passport Card
 *
 * THE PASSPORT IS THE PRODUCT.
 * Designed with serious modern financial infrastructure aesthetics:
 * - Sovereign tactile passport credential card
 * - Onfolio terracotta emblem & watermark
 * - Deterministic Passport Credential ID
 * - Tier classification & Onchain Equity Score
 * - Verified underlying equities and regulated transfer agents
 * - Cryptographic state seal
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Lock,
  Sparkles,
  FileCheck,
  Building,
  Copy,
  Check,
  Eye,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatMaskedAddress,
  formatMaskedCurrency,
} from '../../services/privacy/privacyManager';
import {
  copyToClipboard,
  getSolanaExplorerUrl,
} from '../../services/wallet/walletService';
import { OnfolioLogoMark } from '../brand/OnfolioLogo';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VerificationBadge } from '../verification/VerificationBadge';
import { determineHoldingVerificationState } from '../../services/verification/evidenceEngine';

export const PassportCard: React.FC = () => {
  const {
    passport,
    portfolio,
    wallet,
    verificationRecord,
    preferences,
    setVerificationModalOpen,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!passport || !portfolio) {
    return null;
  }

  const isConnected = wallet.entryMethod === 'connected';
  const isMasked = preferences.privacyMode !== 'public';
  const displayValue = formatMaskedCurrency(
    passport.verifiedEquityValueUsd,
    preferences.privacyMode
  );
  const displayAddress = formatMaskedAddress(
    passport.walletAddress,
    preferences.privacyMode
  );
  const explorerUrl = getSolanaExplorerUrl(passport.walletAddress);

  const handleCopy = async () => {
    const ok = await copyToClipboard(passport.walletAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Harmonized tier styling using restrained financial palette
  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Sovereign':
        return 'bg-[#D26E46] text-white border-[#BF5D35]';
      case 'Institutional Prime':
        return 'bg-[#2A3542] text-white border-[#3B4856]';
      case 'Accredited Tier':
        return 'bg-[#3E4D5E] text-white border-[#506275]';
      case 'Verified Holder':
        return 'bg-[#566577] text-white border-[#68788C]';
      default:
        return 'bg-[#2E3540] text-[#A5AFBD] border-[#3B4350]';
    }
  };

  return (
    <div id="investment-passport-container" className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
            STEP 2 • PRIMARY CREDENTIAL
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191F28] mt-0.5">
            Onchain Investment Passport
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <VerificationBadge
            state={
              determineHoldingVerificationState({
                isMockData: portfolio.isMockData,
                updatedAt: portfolio.updatedAt,
                isPricingStale: portfolio.pricingFreshness?.isStale,
              }).state
            }
            size="md"
            interactive={true}
            onClick={() => setVerificationModalOpen(true)}
          />
          <Button
            id="audit-verify-passport-btn"
            variant="secondary"
            size="sm"
            onClick={() => setVerificationModalOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-[#D26E46]" />}
          >
            Audit Proof
          </Button>
        </div>
      </div>

      {/* The Passport Physical-Style Digital Credential Card */}
      <div
        id="passport-physical-card"
        className="relative overflow-hidden rounded-3xl bg-[#191F28] text-white p-6 sm:p-9 shadow-xl border border-[#2A3542]"
      >
        {/* Onfolio Emblem Watermark in the background */}
        <div className="absolute right-[-20px] bottom-[-30px] opacity-[0.04] pointer-events-none">
          <OnfolioLogoMark size={360} color="#FFFFFF" />
        </div>

        {/* Subtle Guilloche / Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px, 64px 64px',
          }}
        />

        {/* Passport Header Strip */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A3542]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#222935] border border-[#343F4F] flex items-center justify-center p-2 shadow-inner">
              <OnfolioLogoMark size={32} color="#D26E46" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-widest text-[#A5AFBD] uppercase">
                  ONFOLIO PROTOCOL
                </span>
                <span className="w-1 h-1 rounded-full bg-[#D26E46]" />
                <span className="text-[10px] font-mono text-[#D26E46] font-semibold">
                  TOKENIZED EQUITIES
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                INVESTMENT PASSPORT
              </h3>
            </div>
          </div>

          {/* Credential ID and Status */}
          <div className="sm:text-right">
            <div className="text-[10px] font-mono text-[#798596]">CREDENTIAL IDENTIFIER</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-[#E8926F] tracking-wider mt-0.5">
              {passport.passportId}
            </div>
            <div className="text-[10px] text-[#798596] font-mono mt-0.5">
              CHECKSUM: {passport.checksum}
            </div>
          </div>
        </div>

        {/* Passport Main Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-7">
          {/* Left Column: Holder Identity, Tier, Valuation */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity & Tier */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                    SOLANA HOLDER ADDRESS
                  </span>
                  {/* Distinct Entry Method Badge */}
                  {isConnected ? (
                    <span
                      id="passport-badge-wallet-connected"
                      className="inline-flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full bg-[#1A3828] text-[#4ADE80] border border-[#22543D] font-mono"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
                      <span>Wallet connected</span>
                    </span>
                  ) : (
                    <span
                      id="passport-badge-address-scanned"
                      className="inline-flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full bg-[#202938] text-[#93C5FD] border border-[#334155] font-mono"
                    >
                      <Eye className="w-2.5 h-2.5 text-[#60A5FA]" />
                      <span>Address scanned</span>
                    </span>
                  )}
                </div>

                <div className="text-base sm:text-lg font-mono font-bold text-white tracking-tight mt-0.5 flex items-center space-x-2">
                  <span>{displayAddress}</span>

                  {/* Copy Affordance */}
                  <button
                    id="passport-copy-address-btn"
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-[#798596] hover:text-white transition-colors cursor-pointer"
                    title={copied ? 'Copied!' : 'Copy full address'}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Explorer Link Affordance */}
                  <a
                    id="passport-explorer-link"
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#798596] hover:text-[#E8926F] transition-colors cursor-pointer"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {isMasked && (
                    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-[#2A3542] text-[#E8926F] border border-[#3B4856]">
                      <Lock className="w-2.5 h-2.5 mr-1" />
                      Masked
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Tier Pill */}
              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block sm:text-right">
                  ALLOCATOR TIER
                </span>
                <div
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-1 ${getTierBadgeStyle(
                    passport.tier
                  )}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{passport.tier}</span>
                </div>
              </div>
            </div>

            {/* Valuation & Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-[#222935] border border-[#2E3846]">
              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                  VERIFIED EQUITY VALUE
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 font-mono">
                  {displayValue}
                </div>
                <div className="text-xs text-[#A5AFBD] mt-1">
                  Across {passport.holdingCount} verified tokenized security
                  {passport.holdingCount === 1 ? '' : 'ies'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                  INVESTOR CLASSIFICATION
                </span>
                <div className="text-sm sm:text-base font-bold text-white mt-1">
                  {passport.title}
                </div>
                <div className="text-xs text-[#2A7954] mt-1 flex items-center space-x-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified 1:1 Backed Shares</span>
                </div>
              </div>
            </div>

            {/* Recognized Equities Chips */}
            <div>
              <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block mb-2.5">
                VERIFIED UNDERLYING EQUITIES
              </span>
              <div className="flex flex-wrap gap-2">
                {passport.underlyingEquities.length > 0 ? (
                  passport.underlyingEquities.map((ticker) => {
                    const holding = portfolio.holdings.find(
                      (h) => h.asset.underlyingTicker === ticker
                    );
                    return (
                      <div
                        key={ticker}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#222935] border border-[#2E3846] text-xs text-white"
                      >
                        <span className="font-bold text-[#E8926F] font-mono">{ticker}</span>
                        <span className="text-[11px] text-[#A5AFBD]">
                          {holding?.asset.issuer.replace(' Inc.', '').replace(' AG', '')}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-[#798596] italic">
                    No tokenized equity holdings registered in this address
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Score & Cryptographic Seal */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-[#2A3542] lg:pl-8">
            {/* Onchain Score Meter */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#222935] border border-[#2E3846]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                  ONCHAIN EQUITY SCORE
                </span>
                <Sparkles className="w-4 h-4 text-[#D26E46]" />
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-4xl font-extrabold font-mono text-white">
                  {passport.onchainScore}
                </span>
                <span className="text-xs text-[#798596] font-mono">/ 100</span>
              </div>
              {/* Progress bar in Onfolio Terracotta */}
              <div className="w-full bg-[#191F28] h-2.5 rounded-full mt-3 overflow-hidden p-0.5 border border-[#2E3846]">
                <div
                  className="bg-gradient-to-r from-[#D26E46] to-[#E8926F] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(passport.onchainScore, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-[#A5AFBD] mt-2.5 leading-relaxed">
                Evaluates collateral audit status, qualified custodian backing, and portfolio
                diversity.
              </div>
            </div>

            {/* Legal Frameworks & Jurisdictions */}
            <div>
              <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block mb-2">
                REGULATORY JURISDICTIONS
              </span>
              <ul className="space-y-1.5 text-xs text-[#D1D7E0]">
                {passport.jurisdictionCompliance.map((juri) => (
                  <li key={juri} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D26E46] shrink-0" />
                    <span className="font-mono text-[11px]">{juri}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Proof Trigger Footer */}
            <div className="pt-4 border-t border-[#2A3542] flex items-center justify-between text-[11px] font-mono text-[#798596]">
              <div className="truncate max-w-[200px]">
                SHA: {verificationRecord?.dataHash.slice(0, 16)}...
              </div>
              <button
                id="passport-open-verification-btn"
                onClick={() => setVerificationModalOpen(true)}
                className="text-[#E8926F] hover:text-white font-medium flex items-center space-x-1 shrink-0 ml-2 transition-colors cursor-pointer"
              >
                <span>View Full Spec</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
