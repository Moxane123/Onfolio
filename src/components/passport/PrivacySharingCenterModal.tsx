/**
 * Onfolio — Privacy & Sharing Center Modal
 *
 * Mandate:
 * "Proof without unnecessary exposure.
 *  The user owns their passport visibility.
 *
 *  Create:
 *  PRIVATE: Only the user can view the full passport.
 *  PUBLIC: The user can create a public passport page.
 *  SHARED VIEW: The user can share a limited version of their passport.
 *
 *  Controls use clear human language:
 *  - 'Show my portfolio value'
 *  - 'Show my holdings' (with granular selection)
 *  - 'Hide my wallet address'
 *  - 'Show my investment history'
 *  - 'Show my performance'
 *  - 'Show my milestones'
 *
 *  Security:
 *  - Never put private credentials/keys into URLs.
 *  - When sharing, explain exactly what will be visible.
 *  - Public data must be intentional."
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Lock,
  Globe,
  Users,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sliders,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Passport, Portfolio, UserPreferences } from '../../types';
import {
  PassportAccessScope,
  PrivacyControlsConfig,
  SharedPassportProfile,
} from '../../types/privacy';
import {
  DEFAULT_PRIVACY_CONTROLS,
  createSharedPassportProfile,
  getAllSharedPassports,
  deleteSharedPassport,
  loadUserPrivacyControls,
  saveUserPrivacyControls,
} from '../../services/privacy/sharingEngine';
import { Button } from '../ui/Button';

interface PrivacySharingCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: Passport;
  portfolio: Portfolio;
  preferences: UserPreferences;
  onViewSharedPage: (publicId: string) => void;
}

export const PrivacySharingCenterModal: React.FC<PrivacySharingCenterModalProps> = ({
  isOpen,
  onClose,
  passport,
  portfolio,
  preferences,
  onViewSharedPage,
}) => {
  // Active Mode: 'private' | 'public' | 'shared_view'
  const [activeScope, setActiveScope] = useState<PassportAccessScope>('public');

  // Human-language privacy toggles
  const [controls, setControls] = useState<PrivacyControlsConfig>(() => {
    return loadUserPrivacyControls();
  });

  // Audience Note (for Shared View)
  const [audienceNote, setAudienceNote] = useState('');

  // Currently generated share link state
  const [createdProfile, setCreatedProfile] = useState<SharedPassportProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Existing shared profiles history
  const [sharedProfiles, setSharedProfiles] = useState<SharedPassportProfile[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSharedProfiles(getAllSharedPassports());
      setCreatedProfile(null);
      setCopiedLink(false);
      setCopiedSnippet(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle helper
  const handleToggle = (key: keyof PrivacyControlsConfig) => {
    const updated = { ...controls, [key]: !controls[key] };
    setControls(updated);
    saveUserPrivacyControls(updated);
  };

  // Holding selector toggle
  const handleToggleHoldingMint = (mint: string) => {
    let nextMints: string[];
    if (controls.selectedHoldingsMints.includes(mint)) {
      nextMints = controls.selectedHoldingsMints.filter((m) => m !== mint);
    } else {
      nextMints = [...controls.selectedHoldingsMints, mint];
    }
    const updated = { ...controls, selectedHoldingsMints: nextMints };
    setControls(updated);
    saveUserPrivacyControls(updated);
  };

  // Select all / Deselect all holdings
  const handleSelectAllHoldings = () => {
    const updated = { ...controls, selectedHoldingsMints: [] }; // empty = all
    setControls(updated);
    saveUserPrivacyControls(updated);
  };

  const handleGenerateShareLink = () => {
    const profile = createSharedPassportProfile(
      passport,
      portfolio,
      activeScope,
      controls,
      activeScope === 'shared_view' ? audienceNote : undefined
    );
    setCreatedProfile(profile);
    setSharedProfiles(getAllSharedPassports());
  };

  const handleDeleteProfile = (publicId: string) => {
    deleteSharedPassport(publicId);
    setSharedProfiles(getAllSharedPassports());
    if (createdProfile?.publicId === publicId) {
      setCreatedProfile(null);
    }
  };

  // Build clean public URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://onfolio.app';
  const currentShareUrl = createdProfile
    ? `${baseUrl}/passport/${createdProfile.publicId}`
    : `${baseUrl}/passport/preview`;

  const handleCopyLink = async () => {
    if (!createdProfile) return;
    try {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopySummary = async () => {
    if (!createdProfile) return;
    const p = createdProfile.sanitizedPassport;
    const text = [
      `Onfolio Verified Investment Passport [${p.tier}]`,
      `Public ID: ${p.publicId}`,
      `Profile: ${p.profileIdentifier}`,
      `Status: ${p.isVerifiedOnchain ? 'Onchain Verified (Solana)' : 'Sandbox Verified'}`,
      `Portfolio Value: ${p.isPortfolioValueDisclosed && p.portfolioValueUsd ? `$${p.portfolioValueUsd.toLocaleString()}` : 'Masked for Privacy'}`,
      `Holdings: ${p.isHoldingsDisclosed ? `${p.holdingsCount} Tokenized Equities` : 'Confidential'}`,
      `Wallet: ${p.displayedWalletAddress}`,
      `View Evidence: ${currentShareUrl}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="privacy-sharing-center-modal"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB] rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#191F28]">Privacy &amp; Sharing Center</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5F0] text-[#2A7954] font-semibold">
                  Zero-Knowledge Control
                </span>
              </div>
              <p className="text-xs text-[#798596]">Proof without unnecessary exposure</p>
            </div>
          </div>
          <button
            id="close-privacy-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Principle Callout */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-[#D26E46] mt-0.5 shrink-0" />
            <div className="text-xs text-[#4A5361] leading-relaxed">
              <span className="font-bold text-[#191F28]">You own your passport visibility. </span>
              Onfolio never exposes your full wallet address or balances unless you explicitly authorize it.
              Choose who can see your credentials and customize every field below.
            </div>
          </div>

          {/* 2. Access Scope Selector */}
          <div>
            <label className="text-[11px] font-mono text-[#798596] uppercase tracking-wider block mb-2 font-bold">
              1. SELECT PASSPORT VISIBILITY TIER
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Scope A: PRIVATE */}
              <button
                type="button"
                onClick={() => {
                  setActiveScope('private');
                  setCreatedProfile(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeScope === 'private'
                    ? 'border-[#191F28] bg-[#191F28] text-white shadow-xs'
                    : 'border-[#E8E3DC] bg-[#FAF8F5] text-[#4A5361] hover:bg-[#F4F0EB]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lock className={`w-4 h-4 ${activeScope === 'private' ? 'text-[#E8926F]' : 'text-[#798596]'}`} />
                  <span className="font-bold text-xs">PRIVATE</span>
                </div>
                <p className={`text-[11px] mt-1.5 leading-snug ${activeScope === 'private' ? 'text-[#A5AFBD]' : 'text-[#798596]'}`}>
                  Only you can view your full passport. No public route generated.
                </p>
              </button>

              {/* Scope B: PUBLIC */}
              <button
                type="button"
                onClick={() => {
                  setActiveScope('public');
                  setCreatedProfile(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeScope === 'public'
                    ? 'border-[#D26E46] bg-[#FAF0EB] text-[#191F28] ring-1 ring-[#D26E46] shadow-xs'
                    : 'border-[#E8E3DC] bg-[#FAF8F5] text-[#4A5361] hover:bg-[#F4F0EB]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className={`w-4 h-4 ${activeScope === 'public' ? 'text-[#D26E46]' : 'text-[#798596]'}`} />
                  <span className="font-bold text-xs">PUBLIC</span>
                </div>
                <p className="text-[11px] text-[#798596] mt-1.5 leading-snug">
                  Create a public passport page at <code className="font-mono text-[#D26E46]">/passport/&lt;id&gt;</code>.
                </p>
              </button>

              {/* Scope C: SHARED VIEW */}
              <button
                type="button"
                onClick={() => {
                  setActiveScope('shared_view');
                  setCreatedProfile(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeScope === 'shared_view'
                    ? 'border-[#2A7954] bg-[#EBF5F0] text-[#191F28] ring-1 ring-[#2A7954] shadow-xs'
                    : 'border-[#E8E3DC] bg-[#FAF8F5] text-[#4A5361] hover:bg-[#F4F0EB]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className={`w-4 h-4 ${activeScope === 'shared_view' ? 'text-[#2A7954]' : 'text-[#798596]'}`} />
                  <span className="font-bold text-xs">SHARED VIEW</span>
                </div>
                <p className="text-[11px] text-[#798596] mt-1.5 leading-snug">
                  Limited, audience-specific proof for lenders, syndicates, or employers.
                </p>
              </button>
            </div>
          </div>

          {/* Shared View Audience Note Input */}
          {activeScope === 'shared_view' && (
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E3DC] space-y-1.5 animate-in fade-in duration-150">
              <label className="text-[11px] font-mono text-[#798596] uppercase font-bold">
                AUDIENCE / PURPOSE OF DISCLOSURE
              </label>
              <input
                type="text"
                value={audienceNote}
                onChange={(e) => setAudienceNote(e.target.value)}
                placeholder="e.g. Proof of accredited tokenized holdings for AngelList Syndicate #419"
                className="w-full px-3 py-2 bg-white border border-[#E8E3DC] rounded-xl text-xs text-[#191F28] focus:ring-2 focus:ring-[#2A7954] focus:border-[#2A7954] focus:outline-hidden"
              />
              <p className="text-[11px] text-[#798596]">
                This note will be attached to the top of the shared passport so recipients understand its scope.
              </p>
            </div>
          )}

          {/* 3. Granular Privacy Controls (Human-Language Toggles) */}
          {activeScope !== 'private' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-[#798596] uppercase tracking-wider font-bold">
                  2. WHAT DO YOU WANT TO DISCLOSE?
                </label>
                <span className="text-[11px] text-[#D26E46] font-semibold font-mono">
                  Default: Minimal Exposure
                </span>
              </div>

              <div className="divide-y divide-[#F0ECE5] border border-[#E8E3DC] rounded-2xl overflow-hidden bg-white">
                {/* Control 1: Show my portfolio value */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Show my portfolio value
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      {controls.showPortfolioValue
                        ? 'Exact USD dollar balance is visible on the public page'
                        : 'Balance is masked (••••••••) while preserving your verified tier badge'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showPortfolioValue')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.showPortfolioValue ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.showPortfolioValue ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Control 2: Hide my wallet address */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Hide my wallet address
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      {controls.hideWalletAddress
                        ? 'Wallet address replaced with anonymous credential ID (SolPass#••••)'
                        : 'Displays full Solana base58 address with Solscan link'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('hideWalletAddress')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.hideWalletAddress ? 'bg-[#2A7954]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.hideWalletAddress ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Control 3: Show my holdings */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#191F28]">
                        Show my holdings
                      </div>
                      <div className="text-[11px] text-[#798596]">
                        {controls.showHoldings
                          ? 'Tokenized equity positions are visible on the passport'
                          : 'Specific holdings hidden; only tier, score, and verification hash shown'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('showHoldings')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        controls.showHoldings ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          controls.showHoldings ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Granular holding checkboxes if showHoldings is on */}
                  {controls.showHoldings && portfolio.holdings.length > 0 && (
                    <div className="mt-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEAE2] space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#798596]">
                        <span>SELECT SPECIFIC EQUITIES TO DISCLOSE</span>
                        <button
                          type="button"
                          onClick={handleSelectAllHoldings}
                          className="text-[#D26E46] hover:text-[#BF5D35] font-semibold cursor-pointer"
                        >
                          Disclose All ({portfolio.holdings.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {portfolio.holdings.map((h) => {
                          const isSelected =
                            controls.selectedHoldingsMints.length === 0 ||
                            controls.selectedHoldingsMints.includes(h.asset.mint);

                          return (
                            <button
                              key={h.asset.mint}
                              type="button"
                              onClick={() => handleToggleHoldingMint(h.asset.mint)}
                              className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-white border-[#D26E46] text-[#191F28] shadow-2xs font-semibold'
                                  : 'bg-[#F4F0EB] border-[#E8E3DC] text-[#798596]'
                              }`}
                            >
                              <span className="font-mono">{h.asset.underlyingTicker}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-[#D26E46]" />
                              ) : (
                                <span className="text-[10px] text-[#A5AFBD]">Hidden</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Control 4: Show my investment history */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Show my investment history
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      Discloses how long you have held each security and earliest acquisition dates
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showInvestmentHistory')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.showInvestmentHistory ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.showInvestmentHistory ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Control 5: Show my milestones */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Show my milestones
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      Shows achieved onchain tier achievements and capital scale milestones
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showMilestones')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.showMilestones ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.showMilestones ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Control 6: Show my performance */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Show my performance
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      Discloses 24-hour market price movements and top gaining assets
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showPerformance')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.showPerformance ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.showPerformance ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Control 7: Show transaction history */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191F28]">
                      Show transaction history
                    </div>
                    <div className="text-[11px] text-[#798596]">
                      Discloses recent Solana onchain transfer signatures
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showTransactionHistory')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      controls.showTransactionHistory ? 'bg-[#D26E46]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        controls.showTransactionHistory ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E3DC] text-center space-y-2">
              <Lock className="w-8 h-8 text-[#191F28] mx-auto" />
              <h4 className="text-sm font-bold text-[#191F28]">Passport Kept Completely Private</h4>
              <p className="text-xs text-[#798596] max-w-sm mx-auto">
                No public link will be active. Only you can view this passport when viewing Onfolio directly.
              </p>
            </div>
          )}

          {/* 4. Action: Generate Intentional Link */}
          {activeScope !== 'private' && (
            <div className="space-y-3 pt-2">
              {!createdProfile ? (
                <Button
                  id="generate-public-passport-btn"
                  variant="primary"
                  size="md"
                  onClick={handleGenerateShareLink}
                  className="w-full justify-center"
                  leftIcon={<Share2 className="w-4 h-4 text-white" />}
                >
                  Create {activeScope === 'shared_view' ? 'Shared View' : 'Public Passport'}
                </Button>
              ) : (
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E3DC] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#2A7954]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Passport Ready for Sharing</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#798596]">
                      ID: {createdProfile.publicId}
                    </span>
                  </div>

                  {/* Clean share URL */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white border border-[#E8E3DC] rounded-xl px-3 py-2 text-xs font-mono text-[#191F28] truncate select-all">
                      {currentShareUrl}
                    </div>
                    <Button
                      id="copy-created-share-url-btn"
                      variant="primary"
                      size="sm"
                      onClick={handleCopyLink}
                      leftIcon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiedLink ? 'Copied' : 'Copy'}
                    </Button>
                    <button
                      onClick={() => {
                        onClose();
                        onViewSharedPage(createdProfile.publicId);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#191F28] hover:bg-[#2A3542] text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                      title="Open and preview public page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  {/* Disclosure Confirmation Statement */}
                  <div className="bg-white p-3 rounded-xl border border-[#EFEAE2] text-[11px] text-[#4A5361] space-y-1">
                    <div className="font-bold text-[#191F28] flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2A7954]" />
                      <span>Exact Disclosed Fields for this Link:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[#798596] pl-1 font-mono text-[10px]">
                      <li>Portfolio Value: {controls.showPortfolioValue ? 'Visible ($)' : 'MASKED (••••)'}</li>
                      <li>Wallet Address: {controls.hideWalletAddress ? 'HIDDEN (SolPass#••••)' : 'Full Base58 Address'}</li>
                      <li>Holdings: {controls.showHoldings ? `${controls.selectedHoldingsMints.length > 0 ? controls.selectedHoldingsMints.length : 'All'} Positions Disclosed` : 'Confidential'}</li>
                      <li>Performance &amp; History: {controls.showPerformance ? 'Included' : 'Hidden'} / {controls.showInvestmentHistory ? 'Included' : 'Hidden'}</li>
                    </ul>
                  </div>

                  {/* Copy Text Summary Snippet */}
                  <div className="flex justify-between items-center text-xs pt-1 text-[#798596]">
                    <span>Sharing in a report, pitch, or chat?</span>
                    <button
                      onClick={handleCopySummary}
                      className="text-[#D26E46] hover:text-[#BF5D35] font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{copiedSnippet ? 'Copied Summary' : 'Copy Text Credential'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Existing Active Shared Passports */}
          {sharedProfiles.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <label className="text-[11px] font-mono text-[#798596] uppercase tracking-wider block font-bold">
                ACTIVE SHARED PASSPORTS ({sharedProfiles.length})
              </label>

              <div className="divide-y divide-[#F0ECE5] border border-[#E8E3DC] rounded-2xl overflow-hidden bg-white text-xs">
                {sharedProfiles.map((sp) => (
                  <div key={sp.publicId} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#191F28] truncate">
                          {sp.publicId}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            sp.accessScope === 'shared_view'
                              ? 'bg-[#EBF5F0] text-[#2A7954]'
                              : 'bg-[#FAF0EB] text-[#D26E46]'
                          }`}
                        >
                          {sp.accessScope}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#798596] truncate">
                        {sp.audienceNote ||
                          `Created on ${new Date(sp.createdAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onViewSharedPage(sp.publicId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F0EB] text-[#191F28] border border-[#E8E3DC] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(sp.publicId)}
                        className="p-1 text-[#798596] hover:text-[#DC2626] transition-colors cursor-pointer"
                        title="Revoke and delete this shared passport"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE5] flex items-center justify-between">
          <div className="text-xs text-[#798596] flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-[#2A7954]" />
            <span>Never exposes private keys or seeds</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
