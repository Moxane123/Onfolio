/**
 * Onfolio — Public Passport View Component
 *
 * Dedicated route/screen for viewing an intentionally shared public investment passport.
 * Route: `/passport/<public-id>` or URL search param `?passport=<public-id>`
 *
 * Core Principles:
 * - Proof without unnecessary exposure.
 * - The user owns their passport visibility.
 * - PUBLIC DATA MUST BE INTENTIONAL.
 * - Never expose private wallet information simply because a passport is public.
 * - One of the strongest visual experiences in Onfolio.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Award,
  Calendar,
  History,
  TrendingUp,
  AlertCircle,
  Share2,
  ArrowLeft,
  FileCheck2,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { SharedPassportProfile } from '../../types/privacy';
import { OnfolioLogoMark } from '../brand/OnfolioLogo';
import { VerificationBadge } from '../verification/VerificationBadge';

interface PublicPassportScreenProps {
  sharedProfile: SharedPassportProfile;
  onBackToApp?: () => void;
  isOwner?: boolean;
}

export const PublicPassportScreen: React.FC<PublicPassportScreenProps> = ({
  sharedProfile,
  onBackToApp,
  isOwner,
}) => {
  const { sanitizedPassport: p, sanitizedEvidence: ev, controls, accessScope, audienceNote } = sharedProfile;
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showEvidenceAudit, setShowEvidenceAudit] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/passport/${sharedProfile.publicId}`
    : `https://onfolio.app/passport/${sharedProfile.publicId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(sharedProfile.publicId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Sovereign':
        return 'from-[#D26E46] via-[#B85630] to-[#191F28]';
      case 'Institutional Prime':
        return 'from-[#2A3542] via-[#1E2631] to-[#11161D]';
      case 'Accredited Tier':
        return 'from-[#3E4D5E] via-[#2D3845] to-[#191F28]';
      default:
        return 'from-[#3A4452] via-[#242C37] to-[#141A21]';
    }
  };

  return (
    <div
      id="public-passport-screen"
      className="min-h-screen bg-[#FAF8F5] text-[#191F28] font-sans antialiased selection:bg-[#FAF0EB] selection:text-[#D26E46] flex flex-col"
    >
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-[#E8E3DC] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 -ml-2 text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                title="Return to your Onfolio dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">My Passport</span>
              </button>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#191F28] flex items-center justify-center text-white shadow-xs">
                <OnfolioLogoMark size={18} color="#FFFFFF" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-[#191F28]">ONFOLIO</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-md bg-[#FAF0EB] text-[#D26E46] font-bold border border-[#F1D8CB]">
                    {accessScope === 'shared_view' ? 'SHARED VIEW' : 'PUBLIC CREDENTIAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#191F28] border border-[#E8E3DC] text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2A7954]" /> : <Share2 className="w-3.5 h-3.5 text-[#D26E46]" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            {isOwner && onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3.5 py-1.5 rounded-xl bg-[#191F28] hover:bg-[#2A3542] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                Edit Visibility
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Audience Note / Purpose if specified */}
        {audienceNote && (
          <div className="bg-[#FAF0EB] border border-[#F1D8CB] rounded-2xl p-4 flex items-start space-x-3">
            <UserCheck className="w-5 h-5 text-[#D26E46] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#D26E46] uppercase tracking-wider">
                PURPOSE OF DISCLOSURE
              </div>
              <p className="text-xs font-medium text-[#191F28] mt-0.5">{audienceNote}</p>
            </div>
          </div>
        )}

        {/* 1. Flagship Physical Credential Card */}
        <div
          id="public-passport-card"
          className="relative overflow-hidden rounded-3xl bg-[#191F28] text-white p-6 sm:p-10 shadow-2xl border border-[#2A3542]"
        >
          {/* Subtle Ambient Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getTierColor(p.tier)} opacity-25 pointer-events-none`}
          />

          {/* Guilloche Security Watermark Pattern */}
          <div className="absolute right-[-30px] bottom-[-40px] opacity-[0.05] pointer-events-none">
            <OnfolioLogoMark size={400} color="#FFFFFF" />
          </div>

          <div className="relative z-10 space-y-8">
            {/* Header / Security Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3542] pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2A3542]/80 border border-[#3E4D5E] flex items-center justify-center text-[#E8926F] shadow-inner">
                  <ShieldCheck className="w-7 h-7 text-[#D26E46]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                      VERIFIED SOVEREIGN CREDENTIAL
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#798596]" />
                    <span className="text-[10px] font-mono text-[#A5AFBD]">SOLANA LEDGER</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono mt-0.5">
                    {p.profileIdentifier}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <VerificationBadge
                  state={p.isVerifiedOnchain ? 'verified' : 'unable_to_verify'}
                  size="md"
                  interactive={false}
                />
                <div className="px-3 py-1.5 rounded-xl bg-[#2A3542] border border-[#3B4856] text-right">
                  <span className="text-[9px] font-mono text-[#798596] uppercase block leading-none">
                    PASSPORT ID
                  </span>
                  <span className="text-xs font-mono font-bold text-[#E8926F] leading-tight">
                    {p.publicId}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {/* Metric 1: Verified Portfolio Value (Conditional) */}
              <div className="bg-[#242C37]/70 p-4 sm:p-5 rounded-2xl border border-[#313C4B] backdrop-blur-xs">
                <div className="text-[10px] font-mono text-[#A5AFBD] uppercase tracking-wider flex items-center justify-between">
                  <span>VERIFIED VALUE</span>
                  {!p.isPortfolioValueDisclosed && (
                    <Lock className="w-3 h-3 text-[#E8926F]" title="Masked by holder's privacy settings" />
                  )}
                </div>
                <div className="mt-2">
                  {p.isPortfolioValueDisclosed && p.portfolioValueUsd !== undefined ? (
                    <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      ${p.portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-[#E8926F] tracking-widest">
                        ••••••••
                      </div>
                      <div className="text-[10px] text-[#A5AFBD] mt-0.5">
                        Masked by user preference
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metric 2: Sovereign Tier */}
              <div className="bg-[#242C37]/70 p-4 sm:p-5 rounded-2xl border border-[#313C4B] backdrop-blur-xs">
                <div className="text-[10px] font-mono text-[#A5AFBD] uppercase tracking-wider">
                  ALLOCATION TIER
                </div>
                <div className="mt-2">
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {p.tier}
                  </div>
                  <div className="text-[10px] text-[#D26E46] font-semibold mt-0.5 truncate">
                    {p.tierTitle}
                  </div>
                </div>
              </div>

              {/* Metric 3: Verified Holdings Count */}
              <div className="bg-[#242C37]/70 p-4 sm:p-5 rounded-2xl border border-[#313C4B] backdrop-blur-xs">
                <div className="text-[10px] font-mono text-[#A5AFBD] uppercase tracking-wider">
                  DISCLOSED ASSETS
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {p.isHoldingsDisclosed ? p.holdingsCount : 'Hidden'}
                  </div>
                  <div className="text-[10px] text-[#A5AFBD] mt-0.5">
                    {p.isHoldingsDisclosed ? 'Tokenized Equities' : 'Confidential holding list'}
                  </div>
                </div>
              </div>

              {/* Metric 4: Onchain Attestation Score */}
              <div className="bg-[#242C37]/70 p-4 sm:p-5 rounded-2xl border border-[#313C4B] backdrop-blur-xs">
                <div className="text-[10px] font-mono text-[#A5AFBD] uppercase tracking-wider">
                  ONCHAIN SCORE
                </div>
                <div className="mt-2">
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#4ADE80] tracking-tight flex items-baseline space-x-1">
                    <span>{p.onchainScore}</span>
                    <span className="text-xs text-[#798596] font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-[#A5AFBD] mt-0.5">
                    Solana Ledger Attested
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Identity & Cryptographic Fingerprint Row */}
            <div className="bg-[#141A21]/90 rounded-2xl p-4 sm:p-5 border border-[#242C37] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-[10px] text-[#798596] uppercase flex items-center space-x-1.5">
                  <span>WALLET IDENTITY</span>
                  {p.isWalletAddressHidden && (
                    <span className="text-[#E8926F] font-semibold text-[9px] bg-[#2A3542] px-1.5 py-0.2 rounded">
                      ANONYMIZED
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                  <span>{p.displayedWalletAddress}</span>
                  {!p.isWalletAddressHidden && p.explorerUrl && (
                    <a
                      href={p.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#798596] hover:text-[#D26E46] transition-colors"
                      title="Inspect wallet on Solscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-[10px] text-[#798596] uppercase">ISSUED / VERIFIED</div>
                  <div className="text-white text-xs mt-0.5">
                    {new Date(p.issuanceDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="h-8 w-px bg-[#242C37] hidden sm:block" />

                <div>
                  <div className="text-[10px] text-[#798596] uppercase">DATA HASH</div>
                  <div className="text-[#A5AFBD] text-xs font-mono mt-0.5">
                    {p.checksum.slice(0, 8)}••••
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Privacy Disclosure Statement & Verification Limits Banner */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#FAF0EB] text-[#D26E46]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191F28]">
                  Verified Under Sovereign Privacy Rules
                </h3>
                <p className="text-xs text-[#798596]">
                  The holder has selectively authorized what information appears on this public credential.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEvidenceAudit(!showEvidenceAudit)}
              className="text-xs font-semibold text-[#D26E46] hover:text-[#BF5D35] flex items-center space-x-1 cursor-pointer"
            >
              <span>{showEvidenceAudit ? 'Hide Audit Proof' : 'View Ledger Proof'}</span>
            </button>
          </div>

          {/* Audit Inspector Sub-drawer */}
          {showEvidenceAudit && (
            <div className="mt-4 pt-4 border-t border-[#F0ECE5] bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] space-y-3 font-mono text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#798596] uppercase block">SHA-256 STATE FINGERPRINT</span>
                  <span className="text-[#191F28] font-bold break-all">{ev.sha256Hash}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#798596] uppercase block">VERIFICATION METHOD</span>
                  <span className="text-[#2A7954] font-bold">{ev.verificationMethod}</span>
                </div>
                {ev.solanaBlockSlot && (
                  <div>
                    <span className="text-[10px] text-[#798596] uppercase block">SOLANA BLOCK SLOT</span>
                    <span className="text-[#191F28] font-bold">{ev.solanaBlockSlot}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-[#798596] uppercase block">JURISDICTIONS</span>
                  <span className="text-[#191F28] font-bold">
                    {ev.depositoryJurisdictions.join(', ') || 'SEC / FINMA Regulated'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#798596] font-sans pt-1">
                Notice: Onfolio verifies cryptographic token possession on the Solana ledger. It does not warrant beneficial depository ownership beyond the onchain records and official issuer prospectuses.
              </p>
            </div>
          )}
        </div>

        {/* 3. Disclosed Holdings Section */}
        {p.isHoldingsDisclosed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#191F28]">Disclosed Tokenized Equities</h2>
                <p className="text-xs text-[#798596]">
                  {controls.selectedHoldingsMints.length > 0
                    ? `Showing ${p.disclosedHoldings.length} selectively revealed positions`
                    : `Showing all ${p.disclosedHoldings.length} verified onchain holdings`}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#2A7954] bg-[#EBF5F0] px-2.5 py-1 rounded-full border border-[#B7DFCE]">
                {p.disclosedHoldings.length} Securities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.disclosedHoldings.map((h) => (
                <div
                  key={h.mint}
                  className="bg-white rounded-2xl border border-[#E8E3DC] p-5 shadow-2xs hover:border-[#D26E46]/50 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base font-mono text-[#191F28]">
                          {h.ticker}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF0EB] text-[#D26E46] font-bold">
                          {h.sector}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#4A5361] mt-0.5">
                        {h.companyName}
                      </div>
                    </div>

                    <div className="text-right">
                      {p.isPortfolioValueDisclosed && h.valueUsd !== undefined ? (
                        <div>
                          <div className="text-sm font-bold font-mono text-[#191F28]">
                            ${h.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] font-mono text-[#798596]">
                            {h.amount?.toLocaleString()} shares
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-[#798596] font-mono">
                          <Lock className="w-3 h-3 text-[#E8926F]" />
                          <span>Balance Masked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F0ECE5] flex items-center justify-between text-xs text-[#798596]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A5AFBD] block">ISSUER</span>
                      <span className="font-semibold text-[#191F28]">{h.issuerName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-[#A5AFBD] block">COLLATERAL</span>
                      <span className="font-medium text-[#2A7954]">{h.collateralization}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8E3DC] p-8 text-center space-y-2">
            <Lock className="w-8 h-8 text-[#D26E46] mx-auto opacity-75" />
            <h3 className="text-sm font-bold text-[#191F28]">Holdings Kept Confidential</h3>
            <p className="text-xs text-[#798596] max-w-md mx-auto">
              The holder has elected to keep individual tokenized equity positions private on this shared view. Tier and score remain verified.
            </p>
          </div>
        )}

        {/* 4. Disclosed Milestones */}
        {p.isMilestonesDisclosed && p.milestones && p.milestones.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#191F28]">Verified Milestones</h2>
              <p className="text-xs text-[#798596]">Achieved onchain badges and scale milestones</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {p.milestones.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-4 rounded-2xl border border-[#E8E3DC] flex items-start space-x-3"
                >
                  <div className="p-2 rounded-xl bg-[#EBF5F0] text-[#2A7954] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#191F28]">{m.title}</div>
                    <div className="text-[11px] text-[#798596] mt-0.5">{m.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Disclosed Investment History */}
        {p.isInvestmentHistoryDisclosed && p.investmentHistory && p.investmentHistory.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#191F28]">Investment History &amp; Tenure</h2>
              <p className="text-xs text-[#798596]">Verified holding duration on Solana</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E3DC] divide-y divide-[#F0ECE5] overflow-hidden">
              {p.investmentHistory.map((hh) => (
                <div key={hh.ticker} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-center font-mono font-bold text-xs text-[#191F28]">
                      {hh.ticker.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-[#191F28]">{hh.companyName}</div>
                      <div className="text-[11px] text-[#798596] font-mono">
                        {hh.firstAcquiredDate ? `Held since ${hh.firstAcquiredDate}` : 'Recent Position'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-[#D26E46] text-sm">{hh.estimatedHoldingDays}</span>
                    <span className="text-[11px] text-[#798596] ml-1">days held</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Disclosed Recent Transactions */}
        {p.isTransactionHistoryDisclosed && p.recentTransactions && p.recentTransactions.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#191F28]">Recent Onchain Settlements</h2>
              <p className="text-xs text-[#798596]">Authorized transaction audit signatures</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E3DC] divide-y divide-[#F0ECE5] overflow-hidden font-mono text-xs">
              {p.recentTransactions.map((tx) => (
                <div key={tx.signature} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="w-3.5 h-3.5 text-[#D26E46]" />
                    <span className="font-bold text-[#191F28]">{tx.shortSignature}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF8F5] text-[#798596] border border-[#EFEAE2]">
                      {tx.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#2A7954] font-semibold">{tx.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Credit & Verification Guarantee */}
        <div className="text-center pt-8 pb-12 text-xs text-[#798596] space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#2A7954]" />
            <span className="font-semibold text-[#191F28]">Powered by Onfolio Protocol</span>
          </div>
          <p className="text-[11px] max-w-lg mx-auto">
            Zero-knowledge selective disclosure on Solana. Only data intentionally authorized by the sovereign account holder is visible on this public page.
          </p>
        </div>
      </main>
    </div>
  );
};
