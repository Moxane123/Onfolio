/**
 * Onfolio — Share Passport Modal
 *
 * Allows users to share their sovereign investment identity via a public URL,
 * with options to mask monetary values or present full cryptographic verification.
 */

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Link,
  FileText,
} from 'lucide-react';
import { Passport, Portfolio, UserPreferences } from '../../types';
import { formatMaskedCurrency, formatMaskedAddress } from '../../services/privacy/privacyManager';
import { Button } from '../ui/Button';

interface SharePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: Passport;
  portfolio: Portfolio;
  preferences: UserPreferences;
  onTogglePrivacy: () => void;
}

export const SharePassportModal: React.FC<SharePassportModalProps> = ({
  isOpen,
  onClose,
  passport,
  portfolio,
  preferences,
  onTogglePrivacy,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  // Build the public URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://onfolio.app';
  const publicShareUrl = `${baseUrl}?address=${encodeURIComponent(passport.walletAddress)}&view=passport`;

  const isMasked = preferences.privacyMode === 'masked_balances';
  const displayVal = formatMaskedCurrency(passport.verifiedEquityValueUsd, preferences.privacyMode);
  const displayAddr = formatMaskedAddress(passport.walletAddress, preferences.privacyMode);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicShareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = publicShareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySnippet = async () => {
    const snippet = `Onfolio Verified Investment Passport\nID: ${passport.passportId}\nIdentifier: ${passport.profileIdentifier}\nTier: ${passport.tier} (${passport.title})\nVerified Equities: ${passport.holdingCount} assets (${passport.underlyingEquities.join(', ')})\nVerification Status: ${passport.isVerifiedOnchain ? 'Onchain Verified (Solana Mainnet)' : 'Sandbox Verified'}\nVerify: ${publicShareUrl}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const ta = document.createElement('textarea');
        ta.value = snippet;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="share-passport-modal"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB] rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Share Investment Identity</h3>
              <p className="text-xs text-[#798596]">Public credential verification link</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Passport Identity Card Preview */}
          <div className="rounded-2xl bg-[#191F28] text-white p-5 border border-[#2A3542] shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                  ONFOLIO VERIFIED PASSPORT
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {passport.profileIdentifier}
                </div>
                <div className="text-xs font-mono text-[#A5AFBD] mt-1">
                  {displayAddr}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#798596] uppercase">TIER</span>
                <div className="text-xs font-bold text-[#E8926F]">{passport.tier}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2A3542]">
              <div>
                <div className="text-[10px] font-mono text-[#798596] uppercase">CAPITAL VALUE</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{displayVal}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#798596] uppercase">VERIFIED STATUS</div>
                <div className="text-xs font-semibold text-[#4ADE80] flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{passport.isVerifiedOnchain ? 'Onchain Verified' : 'Sandbox Profile'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Switcher */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DC]">
            <div className="flex items-center space-x-2.5">
              {isMasked ? (
                <EyeOff className="w-4 h-4 text-[#D26E46]" />
              ) : (
                <Eye className="w-4 h-4 text-[#798596]" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#191F28]">
                  {isMasked ? 'Mask Monetary Values' : 'Full Financial Transparency'}
                </div>
                <div className="text-[11px] text-[#798596]">
                  {isMasked
                    ? 'Balances masked (•••••••) while preserving verified tier and asset proofs'
                    : 'Shows verified USD portfolio valuations publicly'}
                </div>
              </div>
            </div>
            <button
              id="share-toggle-privacy-btn"
              type="button"
              onClick={onTogglePrivacy}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isMasked
                  ? 'bg-[#FAF0EB] text-[#D26E46] border-[#F1D8CB]'
                  : 'bg-white text-[#4A5361] border-[#E8E3DC] hover:border-[#D26E46]'
              }`}
            >
              {isMasked ? 'Masked' : 'Public'}
            </button>
          </div>

          {/* Public Link Copy Field */}
          <div>
            <label className="text-[11px] font-mono text-[#798596] uppercase tracking-wider block mb-1.5">
              PUBLIC VERIFICATION URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl px-3.5 py-2 text-xs font-mono text-[#191F28] truncate select-all">
                {publicShareUrl}
              </div>
              <Button
                id="copy-share-url-btn"
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Alternative: Copy Structured Text Claim */}
          <div className="pt-2 flex justify-between items-center text-xs text-[#798596]">
            <span>Need to verify in a document or chat?</span>
            <button
              id="copy-text-snippet-btn"
              onClick={handleCopySnippet}
              className="text-[#D26E46] hover:text-[#BF5D35] font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{copiedSnippet ? 'Copied Summary' : 'Copy Text Credential'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#F0ECE5] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
