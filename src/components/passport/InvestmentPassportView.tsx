/**
 * Onfolio — Investment Passport (Primary Identity Layer)
 *
 * THE PASSPORT IS THE CENTRAL PRODUCT OF ONFOLIO.
 * Designed as a sovereign digital investment identity credential, not another operational dashboard.
 *
 * Content architecture:
 * 1. Onfolio Profile Identifier & Credential ID
 * 2. Sovereign Credential Card with Verified Tier, Valuation, and Onchain Score
 * 3. Strict Visual Distinction: VERIFIED ONCHAIN DATA vs SELF-REPORTED / UNVERIFIED DATA
 * 4. Verified Holdings presented as official equity share certificates
 * 5. Portfolio Performance (respecting cost basis honesty)
 * 6. Ecosystem Coverage (number of supported assets held out of registry)
 * 7. Portfolio History & Onchain Tenure
 * 8. Important Milestones (data-supported only: first equity, value milestone, first verified position, longest held)
 * 9. Wallet & Source Provenance (Solana RPC, cluster, block slot, token programs)
 * 10. Direct link to inspect supporting cryptographic evidence
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Share2,
  FileCheck2,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  Calendar,
  Compass,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { Passport, Portfolio, UserPreferences } from '../../types';
import { formatMaskedAddress, formatMaskedCurrency } from '../../services/privacy/privacyManager';
import { copyToClipboard, getSolanaExplorerUrl } from '../../services/wallet/walletService';
import { OnfolioLogoMark } from '../brand/OnfolioLogo';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SharePassportModal } from './SharePassportModal';

interface InvestmentPassportViewProps {
  passport: Passport;
  portfolio: Portfolio;
  preferences: UserPreferences;
  onTogglePrivacy: () => void;
  onOpenAudit: () => void;
  onSwitchToDashboard: () => void;
  onOpenRegistryModal: () => void;
}

export const InvestmentPassportView: React.FC<InvestmentPassportViewProps> = ({
  passport,
  portfolio,
  preferences,
  onTogglePrivacy,
  onOpenAudit,
  onSwitchToDashboard,
  onOpenRegistryModal,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const isMasked = preferences.privacyMode === 'masked_balances';
  const displayVal = formatMaskedCurrency(passport.verifiedEquityValueUsd, preferences.privacyMode);
  const displayAddress = formatMaskedAddress(passport.walletAddress, preferences.privacyMode);
  const explorerUrl = getSolanaExplorerUrl(passport.walletAddress);

  const handleCopyId = async () => {
    const ok = await copyToClipboard(passport.profileIdentifier);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyAddress = async () => {
    const ok = await copyToClipboard(passport.walletAddress);
    if (ok) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

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
    <div id="investment-passport-primary-view" className="space-y-10">
      {/* 1. Identity Bar & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E3DC]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
              PRIMARY DIGITAL IDENTITY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A7954]" />
            <span className="text-[11px] font-mono text-[#2A7954] font-semibold">
              {passport.isVerifiedOnchain ? 'ONCHAIN VERIFIED' : 'SANDBOX PROFILE'}
            </span>
          </div>
          <div className="flex items-center space-x-2.5 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191F28] font-mono">
              {passport.profileIdentifier}
            </h1>
            <button
              id="passport-copy-id-btn"
              onClick={handleCopyId}
              className="p-1.5 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
              title="Copy Profile Identifier"
            >
              {copiedId ? <Check className="w-4 h-4 text-[#2A7954]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-[#798596] mt-0.5">
            Sovereign digital investment credential for verified Solana tokenized equity holdings.
          </p>
        </div>

        {/* Global Identity Controls */}
        <div className="flex items-center space-x-2 flex-wrap">
          <Button
            id="passport-share-btn"
            variant="secondary"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            leftIcon={<Share2 className="w-4 h-4 text-[#D26E46]" />}
          >
            Share Passport
          </Button>

          <Button
            id="passport-inspect-proof-btn"
            variant="secondary"
            size="sm"
            onClick={onOpenAudit}
            leftIcon={<ShieldCheck className="w-4 h-4 text-[#2A7954]" />}
          >
            Inspect Evidence
          </Button>

          <button
            id="passport-privacy-toggle-btn"
            onClick={onTogglePrivacy}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isMasked
                ? 'bg-[#FAF0EB] text-[#D26E46] border-[#F1D8CB]'
                : 'bg-white text-[#4A5361] border-[#E8E3DC] hover:border-[#D26E46]'
            }`}
            title={isMasked ? 'Reveal Financial Balances' : 'Mask Financial Balances'}
          >
            {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMasked ? 'Masked' : 'Public'}</span>
          </button>
        </div>
      </div>

      {/* 2. The Sovereign Investment Passport Credential Card */}
      <div
        id="passport-physical-card"
        className="relative overflow-hidden rounded-3xl bg-[#191F28] text-white p-6 sm:p-9 shadow-xl border border-[#2A3542]"
      >
        {/* Onfolio Emblem Watermark */}
        <div className="absolute right-[-20px] bottom-[-30px] opacity-[0.04] pointer-events-none">
          <OnfolioLogoMark size={360} color="#FFFFFF" />
        </div>

        {/* Guilloche Grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px, 64px 64px',
          }}
        />

        {/* Card Header */}
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
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                INVESTMENT PASSPORT
              </h2>
            </div>
          </div>

          {/* Credential Status & Verified Stamp */}
          <div className="sm:text-right">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1A3828] text-[#4ADE80] border border-[#22543D] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
              <span>{passport.isVerifiedOnchain ? 'Onchain Verified' : 'Sandbox Verification'}</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-[#E8926F] tracking-wider">
              {passport.passportId}
            </div>
            <div className="text-[10px] text-[#798596] font-mono">
              CHECKSUM: {passport.checksum}
            </div>
          </div>
        </div>

        {/* Card Main Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-7">
          {/* Left Column: Holder Identity & Valuation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block">
                  SOLANA HOLDER ADDRESS
                </span>
                <div className="text-base sm:text-lg font-mono font-bold text-white tracking-tight mt-0.5 flex items-center space-x-2">
                  <span>{displayAddress}</span>
                  <button
                    id="passport-card-copy-address-btn"
                    type="button"
                    onClick={handleCopyAddress}
                    className="p-1 text-[#798596] hover:text-white transition-colors cursor-pointer"
                    title={copiedAddress ? 'Copied' : 'Copy address'}
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    id="passport-card-explorer-btn"
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#798596] hover:text-[#E8926F] transition-colors cursor-pointer"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block sm:text-right">
                  INVESTOR CLASSIFICATION
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

            {/* Valuation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#222935] border border-[#2E3846]">
              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                  VERIFIED EQUITY VALUE
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 font-mono">
                  {displayVal}
                </div>
                <div className="text-xs text-[#A5AFBD] mt-1">
                  Across {passport.holdingCount} verified tokenized stock{passport.holdingCount === 1 ? '' : 's'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider">
                  CUSTODY BACKING STATUS
                </span>
                <div className="text-sm font-bold text-white mt-1">
                  100% Beneficial Depository Shares
                </div>
                <div className="text-xs text-[#4ADE80] mt-1 flex items-center space-x-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DTC / Swiss Intermediated Depository</span>
                </div>
              </div>
            </div>

            {/* Underlying Stock Badges */}
            <div>
              <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block mb-2.5">
                VERIFIED UNDERLYING EQUITIES & BENCHMARKS
              </span>
              <div className="flex flex-wrap gap-2">
                {passport.underlyingEquities.map((ticker) => {
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
                        {holding?.asset.companyName.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Score & Provenance */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-[#2A3542] lg:pl-8">
            {/* Onchain Score Meter */}
            <div className="p-5 rounded-2xl bg-[#222935] border border-[#2E3846]">
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
              <div className="w-full bg-[#191F28] h-2.5 rounded-full mt-3 overflow-hidden p-0.5 border border-[#2E3846]">
                <div
                  className="bg-gradient-to-r from-[#D26E46] to-[#E8926F] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(passport.onchainScore, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-[#A5AFBD] mt-2.5 leading-relaxed">
                Evaluates SEC Form TA-1 transfer agent registration, 1:1 DTC share backing, and token standard compliance.
              </div>
            </div>

            {/* Regulatory Jurisdictions */}
            <div>
              <span className="text-[10px] font-mono text-[#798596] uppercase tracking-wider block mb-2">
                REGULATORY REGISTRATIONS
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

            {/* Cryptographic Proof Footer */}
            <div className="pt-4 border-t border-[#2A3542] flex items-center justify-between text-[11px] font-mono text-[#798596]">
              <div className="truncate max-w-[200px]">
                HASH: {passport.evidenceSummary.sha256Hash.slice(0, 16)}...
              </div>
              <button
                id="passport-card-view-proof-btn"
                onClick={onOpenAudit}
                className="text-[#E8926F] hover:text-white font-medium flex items-center space-x-1 shrink-0 ml-2 transition-colors cursor-pointer"
              >
                <span>Audit Proof</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL SECTION: VERIFIED ONCHAIN DATA vs SELF-REPORTED / UNVERIFIED DATA */}
      <div id="passport-verification-distinction-section" className="space-y-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
            DATA INTEGRITY PARTITION
          </span>
          <h3 className="text-lg font-bold text-[#191F28] mt-0.5">
            Verified Onchain Ledger vs. Self-Reported Parameters
          </h3>
          <p className="text-xs text-[#798596]">
            Onfolio strictly segregates verified cryptographic proofs from unverified claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* VERIFIED ONCHAIN DATA */}
          <div className="p-5 rounded-2xl bg-white border border-[#2A7954]/40 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2A7954]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#EBF5F0] text-[#2A7954]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#2A7954] font-mono uppercase tracking-wide">
                  VERIFIED ONCHAIN DATA
                </span>
              </div>
              <Badge variant="verified">100% Onchain</Badge>
            </div>

            <ul className="mt-4 space-y-2.5 text-xs text-[#191F28]">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
                <span>
                  <strong>Solana Token Account Balances:</strong> Directly queried from Solana Mainnet-Beta RPC ledger.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
                <span>
                  <strong>Mint Verification:</strong> Cryptographically matched against the authoritative Onfolio Asset Registry.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
                <span>
                  <strong>Transfer Agent Backing:</strong> Certified by regulated issuers (Dinari SEC TA-1, Backed Swiss DLT Art. 973c).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
                <span>
                  <strong>Depository Custody:</strong> 1:1 share custody in DTC / registered qualified broker-dealers.
                </span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-[#E8E3DC] text-[11px] text-[#2A7954] font-medium flex items-center justify-between">
              <span>Included in Passport Score & Verified Equity Capital</span>
              <button
                onClick={onOpenAudit}
                className="text-[#D26E46] hover:underline font-semibold cursor-pointer"
              >
                Inspect Proofs
              </button>
            </div>
          </div>

          {/* SELF-REPORTED / UNVERIFIED DATA */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#D1D7E0] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#F4F0EB] text-[#798596]">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#798596] font-mono uppercase tracking-wide">
                  SELF-REPORTED / UNVERIFIED DATA
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8E3DC] text-[#4A5361]">
                Excluded
              </span>
            </div>

            <ul className="mt-4 space-y-2.5 text-xs text-[#798596]">
              {passport.selfReportedData.map((item) => (
                <li key={item.label} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A5AFBD] shrink-0 mt-1.5" />
                  <div>
                    <span className="font-semibold text-[#4A5361]">{item.label}:</span>{' '}
                    <span>{item.value}</span>
                    <div className="text-[11px] text-[#A5AFBD] italic">{item.reason}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-[#E8E3DC] text-[11px] text-[#798596] italic">
              Onfolio never grants passport scores, tier status, or equity credit to self-reported or unverified items.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Verified Holdings as Official Share Certificates */}
      <div id="passport-verified-holdings-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
              PORTFOLIO PROOF
            </span>
            <h3 className="text-lg font-bold text-[#191F28] mt-0.5">
              Verified Stock Certificates ({passport.holdingCount})
            </h3>
          </div>
          <button
            onClick={onOpenRegistryModal}
            className="text-xs text-[#D26E46] hover:text-[#BF5D35] font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>View All {passport.supportedAssetsTotal} Supported Securities</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.holdings.map((h) => {
            const hVal = formatMaskedCurrency(h.valueUsd, preferences.privacyMode);
            const holdingExplUrl = getSolanaExplorerUrl(h.tokenAccountAddress);
            return (
              <div
                key={h.asset.mint}
                className="p-5 rounded-2xl bg-white border border-[#E8E3DC] shadow-xs hover:border-[#D26E46] transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#D26E46] font-mono font-bold flex items-center justify-center border border-[#F1D8CB]">
                      {h.asset.underlyingTicker}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#191F28]">{h.asset.companyName}</div>
                      <div className="text-xs text-[#798596]">
                        {h.asset.issuer} • {h.isToken2022 ? 'Token-2022' : 'SPL Token'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#191F28]">{hVal}</div>
                    <div className="text-xs font-mono text-[#798596]">
                      {h.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} Shares
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0ECE5] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-[#2A7954] font-medium">
                    <BadgeCheck className="w-4 h-4" />
                    <span>{h.asset.collateralization}</span>
                  </div>
                  <a
                    href={holdingExplUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#798596] hover:text-[#191F28] flex items-center space-x-1 font-mono text-[11px]"
                  >
                    <span>Inspect Account</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Performance & Honest Cost Basis */}
      <div id="passport-performance-section" className="p-6 rounded-2xl bg-white border border-[#E8E3DC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE5]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
              PERFORMANCE DISCLOSURE
            </span>
            <h3 className="text-base font-bold text-[#191F28] mt-0.5">
              Portfolio Performance & Pricing Transparency
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#798596] uppercase">24H MARKET CHANGE</span>
              <div
                className={`text-sm font-bold font-mono flex items-center justify-end space-x-1 ${
                  portfolio.performance.performance24hPercent >= 0 ? 'text-[#2A7954]' : 'text-[#C93B2B]'
                }`}
              >
                <span>
                  {portfolio.performance.performance24hPercent >= 0 ? '+' : ''}
                  {portfolio.performance.performance24hPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#798596]">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DC]">
            <div className="font-semibold text-[#191F28] mb-1">Pricing Integrity Principle</div>
            <p className="leading-relaxed">
              Market valuations use verified consolidated tape prices. Valuations are categorised as{' '}
              <strong>{portfolio.pricingFreshness.status.toUpperCase()}</strong> with data sourced from{' '}
              {portfolio.pricingFreshness.sourceLabel}.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DC]">
            <div className="font-semibold text-[#191F28] mb-1">Cost Basis Audit Rule</div>
            <p className="leading-relaxed">
              Onfolio never invents cost basis. When historical acquisition prices are absent from onchain settlement memos, cost basis is explicitly flagged as <em>Unavailable onchain</em>.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Important Milestones (Data-Supported Only) */}
      <div id="passport-milestones-section" className="space-y-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
            HISTORICAL PROOFS
          </span>
          <h3 className="text-lg font-bold text-[#191F28] mt-0.5">
            Verified Portfolio Milestones ({portfolio.milestones.length})
          </h3>
          <p className="text-xs text-[#798596]">
            Achievements strictly derived from verified onchain token accounts and ledger timestamps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.milestones.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white border border-[#E8E3DC] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#D26E46] uppercase font-bold">
                    {m.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5F0] text-[#2A7954] font-semibold">
                    {m.achievedAt || 'Verified'}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#191F28]">{m.title}</div>
                <p className="text-xs text-[#798596] mt-1 leading-relaxed">{m.description}</p>
              </div>
              {m.evidence && (
                <div className="mt-3 pt-2.5 border-t border-[#F0ECE5] text-[11px] font-mono text-[#4A5361] truncate">
                  Proof: {m.evidence}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Ecosystem Breadth & Holding History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Registry Coverage */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E3DC] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                ECOSYSTEM BREADTH
              </span>
              <Database className="w-4 h-4 text-[#798596]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-[#191F28] mt-2">
              {passport.holdingCount} of {passport.supportedAssetsTotal} Supported Securities
            </div>
            <p className="text-xs text-[#798596] mt-1">
              Holds {((passport.holdingCount / passport.supportedAssetsTotal) * 100).toFixed(0)}% of the verified tokenized US equity universe on Solana.
            </p>

            <div className="w-full bg-[#F4F0EB] h-2.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-[#D26E46] h-full rounded-full transition-all"
                style={{ width: `${(passport.holdingCount / passport.supportedAssetsTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#F0ECE5] flex items-center justify-between text-xs">
            <span className="text-[#798596]">Direct Depository Backing</span>
            <button
              onClick={onOpenRegistryModal}
              className="text-[#D26E46] hover:underline font-semibold cursor-pointer"
            >
              Browse Registry
            </button>
          </div>
        </div>

        {/* Longest-Held Asset & Tenure */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E3DC] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                HOLDING TENURE
              </span>
              <Clock className="w-4 h-4 text-[#798596]" />
            </div>

            {passport.longestHeldAsset ? (
              <div className="mt-2">
                <div className="text-xs text-[#798596]">LONGEST-HELD POSITION</div>
                <div className="text-lg font-bold text-[#191F28] font-mono mt-0.5">
                  {passport.longestHeldAsset.companyName} ({passport.longestHeldAsset.ticker})
                </div>
                <div className="text-sm font-semibold text-[#2A7954] mt-1">
                  ~{passport.longestHeldAsset.daysHeld} Days Onchain Tenure
                </div>
                <div className="text-xs text-[#798596] mt-0.5">
                  Acquired: {passport.longestHeldAsset.acquiredDate || 'Historical Settlement'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#798596] italic mt-2">
                No active onchain tenure recorded.
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[#F0ECE5] text-[11px] font-mono text-[#798596] flex items-center justify-between">
            <span>Settlement Slot: #{passport.evidenceSummary.solanaSlot}</span>
            <span className="text-[#2A7954] font-semibold">Active Depository Holding</span>
          </div>
        </div>
      </div>

      {/* 8. Wallet & Source Information */}
      <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DC] text-xs text-[#798596] space-y-2">
        <div className="font-semibold text-[#191F28] text-sm">Wallet & Cryptographic Source Information</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#A5AFBD]">SOLANA CLUSTER</div>
            <div className="font-mono text-[#191F28] font-medium mt-0.5">Mainnet-Beta (Genesis 5eykt4...)</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#A5AFBD]">DATA PROVIDER</div>
            <div className="font-mono text-[#191F28] font-medium mt-0.5">{passport.verificationDataSource}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#A5AFBD]">TOKEN STANDARDS</div>
            <div className="font-mono text-[#191F28] font-medium mt-0.5">SPL Token & Token-2022</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#A5AFBD]">LEDGER CHECKSUM</div>
            <div className="font-mono text-[#191F28] font-medium mt-0.5">{passport.checksum}</div>
          </div>
        </div>
      </div>

      {/* 9. Bridge to Operational Dashboard */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF8F5] to-[#F4F0EB] border border-[#E8E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-[#191F28]">Need deep operational analytics?</h4>
          <p className="text-xs text-[#798596] mt-0.5">
            Switch to the Portfolio Dashboard for sector allocations, issuer breakdowns, and granular asset intelligence.
          </p>
        </div>
        <Button
          id="passport-switch-dashboard-bottom-btn"
          variant="primary"
          onClick={onSwitchToDashboard}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Portfolio Dashboard
        </Button>
      </div>

      {/* Share Modal */}
      <SharePassportModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        passport={passport}
        portfolio={portfolio}
        preferences={preferences}
        onTogglePrivacy={onTogglePrivacy}
      />
    </div>
  );
};
