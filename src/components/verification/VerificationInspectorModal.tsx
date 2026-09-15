/**
 * Onfolio — Verification Inspector Modal
 *
 * Core Interface Mandate:
 * "Create a simple verification interface:
 *  Verified on Solana
 *  Then allow the user to inspect:
 *  - Asset
 *  - Wallet
 *  - Token
 *  - Verification time
 *  - Evidence"
 *
 * Requirements:
 * 1. Expose: wallet address, token mint, network, balance source, verification timestamp,
 *    relevant transaction/activity, blockchain explorer reference.
 * 2. Do not expose more wallet information than necessary in normal UI (masked by default, with copy & inspect).
 * 3. Verification is read-only (no signatures required).
 * 4. Never imply Onfolio guarantees ownership beyond underlying blockchain evidence.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  Wallet,
  Coins,
  Clock,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Activity,
  CheckCircle2,
  HelpCircle,
  Clock3,
  Ban,
} from 'lucide-react';
import { HoldingVerificationEvidence, VerificationState } from '../../types/verification';
import { VerificationBadge } from './VerificationBadge';
import { Button } from '../ui/Button';

interface VerificationInspectorModalProps {
  evidence: HoldingVerificationEvidence | null;
  isOpen: boolean;
  onClose: () => void;
}

type InspectionTab = 'all' | 'asset' | 'wallet' | 'token' | 'time' | 'evidence';

export const VerificationInspectorModal: React.FC<VerificationInspectorModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<InspectionTab>('all');
  const [isWalletRevealed, setIsWalletRevealed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !evidence) return null;

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  const getStatusHeadlineColor = (state: VerificationState) => {
    switch (state) {
      case 'verified':
        return {
          bg: 'bg-[#EBF5F0]',
          border: 'border-[#B7DFCE]',
          text: 'text-[#2A7954]',
          icon: <ShieldCheck className="w-5 h-5 text-[#2A7954]" />,
        };
      case 'unable_to_verify':
        return {
          bg: 'bg-[#FAF0EB]',
          border: 'border-[#F1D8CB]',
          text: 'text-[#D26E46]',
          icon: <AlertTriangle className="w-5 h-5 text-[#D26E46]" />,
        };
      case 'data_unavailable':
        return {
          bg: 'bg-[#F4F0EB]',
          border: 'border-[#E8E3DC]',
          text: 'text-[#798596]',
          icon: <HelpCircle className="w-5 h-5 text-[#798596]" />,
        };
      case 'stale_verification':
        return {
          bg: 'bg-[#FEF8E7]',
          border: 'border-[#FCE6B5]',
          text: 'text-[#B87002]',
          icon: <Clock3 className="w-5 h-5 text-[#B87002]" />,
        };
      case 'unsupported_asset':
        return {
          bg: 'bg-[#FEECEC]',
          border: 'border-[#F9C3BE]',
          text: 'text-[#C13B2E]',
          icon: <Ban className="w-5 h-5 text-[#C13B2E]" />,
        };
      default:
        return {
          bg: 'bg-[#FAF8F5]',
          border: 'border-[#E8E3DC]',
          text: 'text-[#191F28]',
          icon: <ShieldCheck className="w-5 h-5 text-[#D26E46]" />,
        };
    }
  };

  const statusStyle = getStatusHeadlineColor(evidence.state);

  return (
    <div
      id="verification-inspector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-inspector-title"
    >
      <div
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-3xl w-full overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Simple Verification Banner: Verified on Solana */}
        <div className="px-6 py-4.5 border-b border-[#F0ECE5] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${statusStyle.bg} ${statusStyle.border}`}>
              {statusStyle.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#798596] font-bold">
                  BLOCKCHAIN EVIDENCE INSPECTION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white border border-[#E8E3DC] text-[#4A5361]">
                  Read-Only Proof
                </span>
              </div>
              <h2
                id="verification-inspector-title"
                className="text-lg sm:text-xl font-bold text-[#191F28] mt-0.5 flex items-center space-x-2"
              >
                <span>{evidence.stateLabel}</span>
                <span className="text-xs font-mono font-medium text-[#798596]">
                  • {evidence.asset.ticker}
                </span>
              </h2>
            </div>
          </div>

          <button
            id="close-verification-inspector-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F4F0EB] border border-[#E8E3DC] flex items-center justify-center text-[#798596] hover:text-[#191F28] transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State Explanation Banner */}
        <div className={`px-6 py-3 border-b text-xs flex items-center justify-between ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-current shrink-0 animate-pulse" />
            <span className="font-medium leading-relaxed">{evidence.stateDescription}</span>
          </div>
          <span className="text-[11px] font-mono shrink-0 hidden sm:inline ml-3">
            {evidence.evidence.network.split(' ')[0]}
          </span>
        </div>

        {/* 5-Category Inspection Navigation */}
        <div className="flex border-b border-[#F0ECE5] px-6 bg-white overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            Full Overview
          </button>
          <button
            onClick={() => setActiveTab('asset')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'asset'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Asset</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet</span>
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'token'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Token</span>
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'time'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Verification Time</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Evidence</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SECTION 1: ASSET */}
          {(activeTab === 'all' || activeTab === 'asset') && (
            <div id="inspector-section-asset" className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  <Building className="w-4 h-4 text-[#D26E46]" />
                  <span>1. Asset Specification &amp; Legal Structure</span>
                </div>
                <span className="text-[11px] font-mono text-[#798596]">Traditional Security Claim</span>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl p-4.5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-[#191F28]">
                        {evidence.asset.companyName}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#D26E46] border border-[#E8E3DC]">
                        {evidence.asset.ticker}
                      </span>
                    </div>
                    <p className="text-xs text-[#798596] mt-0.5">
                      {evidence.asset.tokenName} ({evidence.asset.tokenSymbol}) • Sector: {evidence.asset.sector}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Underlying ISIN
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#191F28]">
                      {evidence.asset.isin || 'US-REG-DTC-MEMBER'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#EAE5DF]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Regulated Issuer
                    </span>
                    <span className="text-xs font-semibold text-[#191F28] mt-0.5 block">
                      {evidence.asset.issuer}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Depository Custodian
                    </span>
                    <span className="text-xs font-semibold text-[#191F28] mt-0.5 block">
                      {evidence.asset.custodian}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Collateralization
                    </span>
                    <span className="text-xs font-semibold text-[#2A7954] mt-0.5 block">
                      {evidence.asset.collateralization}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE5DF] flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="text-[#798596]">
                    Framework: <strong>{evidence.asset.regulatoryFramework}</strong>
                  </span>
                  {evidence.asset.prospectusUrl && (
                    <a
                      href={evidence.asset.prospectusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D26E46] hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>Public Offering Prospectus</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WALLET */}
          {(activeTab === 'all' || activeTab === 'wallet') && (
            <div id="inspector-section-wallet" className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  <Wallet className="w-4 h-4 text-[#D26E46]" />
                  <span>2. Wallet Identity &amp; Privacy Boundary</span>
                </div>
                <span className="text-[11px] font-mono text-[#2A7954] font-semibold">
                  No Signatures Required
                </span>
              </div>

              <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#798596]">
                    Public ed25519 Solana Address (Privacy-Preserving UI)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWalletRevealed(!isWalletRevealed)}
                    className="text-xs font-semibold text-[#D26E46] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    {isWalletRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Mask Address</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reveal Full Public Key</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEAE2]">
                  <span className="font-mono text-xs text-[#191F28] break-all select-all font-semibold">
                    {isWalletRevealed ? evidence.wallet.fullAddress : evidence.wallet.maskedAddress}
                  </span>
                  <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() => handleCopy(evidence.wallet.fullAddress, 'wallet')}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#191F28] border border-[#E8E3DC] transition-colors cursor-pointer"
                      title="Copy Public Address"
                    >
                      {copiedField === 'wallet' ? (
                        <Check className="w-3.5 h-3.5 text-[#2A7954]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={evidence.wallet.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#D26E46] border border-[#E8E3DC] transition-colors cursor-pointer"
                      title="View Wallet on Solscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DC] text-[11px] text-[#4A5361] space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#2A7954] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Read-Only Cryptographic Verification Guarantee</span>
                  </div>
                  <p className="text-[#798596] leading-relaxed">
                    Onfolio never requests wallet private keys, seed phrases, or transaction approval signatures to verify public holdings. Public ledgers are inspected non-invasively.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: TOKEN */}
          {(activeTab === 'all' || activeTab === 'token') && (
            <div id="inspector-section-token" className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-[#D26E46]" />
                  <span>3. Cryptographic Token Account &amp; Mint</span>
                </div>
                <span className="text-[11px] font-mono text-[#798596]">Onchain Program State</span>
              </div>

              <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4.5 space-y-4">
                {/* Balance & Valuation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFEAE2]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Verified Balance
                    </span>
                    <span className="text-base font-bold font-mono text-[#191F28] mt-0.5 block">
                      {evidence.token.verifiedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                      <span className="text-xs font-normal text-[#798596]">Shares</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Indicative Value
                    </span>
                    <span className="text-base font-bold font-mono text-[#191F28] mt-0.5 block">
                      ${evidence.token.indicativeValueUsd.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Token Standard
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#191F28] mt-1 block">
                      {evidence.token.standard}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Decimals
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#191F28] mt-1 block">
                      {evidence.token.decimals} Precision
                    </span>
                  </div>
                </div>

                {/* Token Mint Address */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#798596] mb-1">
                    <span className="font-mono uppercase font-bold">SOLANA TOKEN MINT</span>
                    <span className="text-[#2A7954] font-medium">Authoritative Registry Match</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE2]">
                    <span className="font-mono text-xs text-[#191F28] break-all select-all">
                      {evidence.token.mint}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(evidence.token.mint, 'mint')}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#191F28] border border-[#E8E3DC] transition-colors cursor-pointer"
                        title="Copy Mint Address"
                      >
                        {copiedField === 'mint' ? (
                          <Check className="w-3.5 h-3.5 text-[#2A7954]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={evidence.evidence.explorerReferences.solscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#D26E46] border border-[#E8E3DC] transition-colors cursor-pointer"
                        title="View Mint on Solscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Associated Token Account (ATA) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#798596] mb-1">
                    <span className="font-mono uppercase font-bold">ASSOCIATED TOKEN ACCOUNT (ATA)</span>
                    <span className="text-[#798596] font-mono">Owner Token Account</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE2]">
                    <span className="font-mono text-xs text-[#191F28] break-all select-all">
                      {evidence.token.tokenAccountAddress}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(evidence.token.tokenAccountAddress, 'ata')}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#191F28] border border-[#E8E3DC] transition-colors cursor-pointer"
                        title="Copy Token Account Address"
                      >
                        {copiedField === 'ata' ? (
                          <Check className="w-3.5 h-3.5 text-[#2A7954]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={evidence.evidence.explorerReferences.tokenAccountSolscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#D26E46] border border-[#E8E3DC] transition-colors cursor-pointer"
                        title="View Token Account on Solscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: VERIFICATION TIME */}
          {(activeTab === 'all' || activeTab === 'time') && (
            <div id="inspector-section-time" className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#D26E46]" />
                  <span>4. Verification Timestamp &amp; Block Slot</span>
                </div>
                <span className="text-[11px] font-mono text-[#798596]">
                  {evidence.verificationTime.relativeTime}
                </span>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl p-4.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Verification Recorded At
                    </span>
                    <span className="text-xs font-mono font-bold text-[#191F28] mt-1 block">
                      {evidence.verificationTime.formattedTime}
                    </span>
                    <span className="text-[10px] font-mono text-[#798596] block mt-0.5">
                      {evidence.verificationTime.timestampIso}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Solana Block Slot Height
                    </span>
                    <span className="text-xs font-mono font-bold text-[#191F28] mt-1 block">
                      {evidence.verificationTime.blockSlot
                        ? `#${evidence.verificationTime.blockSlot.toLocaleString()}`
                        : 'Confirmed Finalized Slot'}
                    </span>
                    <span className="text-[10px] font-mono text-[#2A7954] block mt-0.5">
                      State Commitment: Finalized
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#798596] block">
                      Data Freshness
                    </span>
                    <div className="mt-1 flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          evidence.verificationTime.isFresh ? 'bg-[#2A7954]' : 'bg-[#B87002]'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[#191F28]">
                        {evidence.verificationTime.isFresh ? 'Current Ledger State' : 'Pending Refresh'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#798596] block mt-0.5">
                      Mode: {evidence.verificationTime.freshnessStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: EVIDENCE */}
          {(activeTab === 'all' || activeTab === 'evidence') && (
            <div id="inspector-section-evidence" className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                  <FileCheck2 className="w-4 h-4 text-[#D26E46]" />
                  <span>5. Blockchain Evidence &amp; Explorer References</span>
                </div>
                <span className="text-[11px] font-mono text-[#D26E46] font-semibold">
                  Tamper-Evident Trail
                </span>
              </div>

              <div className="space-y-3">
                {/* Network & Balance Source Box */}
                <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4.5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#798596] block">
                        Network
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#191F28] mt-0.5 block">
                        {evidence.evidence.network}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#798596] block">
                        Balance Source Method
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#191F28] mt-0.5 block">
                        {evidence.evidence.balanceSource}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Hash Digest */}
                  <div className="pt-3 border-t border-[#F0ECE5]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#798596] mb-1">
                      <span>CLAIM SHA-256 DIGEST</span>
                      <span>Deterministic Audit Hash</span>
                    </div>
                    <div className="bg-[#191F28] text-[#E8926F] p-2.5 rounded-xl font-mono text-xs break-all flex items-center justify-between">
                      <span>{evidence.evidence.dataHash}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(evidence.evidence.dataHash, 'hash')}
                        className="text-[#A5AFBD] hover:text-white p-1 ml-2 transition-colors cursor-pointer shrink-0"
                        title="Copy Hash"
                      >
                        {copiedField === 'hash' ? (
                          <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Relevant Transaction / Activity */}
                <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#191F28] uppercase tracking-wider flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#D26E46]" />
                      <span>Relevant Transaction / Settlement Activity</span>
                    </span>
                    {evidence.evidence.relevantTransaction ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5F0] text-[#2A7954] font-semibold">
                        {evidence.evidence.relevantTransaction.status.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#798596]">
                        Historical Transfer
                      </span>
                    )}
                  </div>

                  {evidence.evidence.relevantTransaction ? (
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEAE2] flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-mono text-xs text-[#191F28] font-semibold">
                          Signature: {evidence.evidence.relevantTransaction.shortSignature}
                        </div>
                        <div className="text-[11px] text-[#798596] font-mono mt-0.5">
                          Slot #{evidence.evidence.relevantTransaction.slot} • Type:{' '}
                          {evidence.evidence.relevantTransaction.type} •{' '}
                          {evidence.evidence.relevantTransaction.dateString}
                        </div>
                      </div>
                      <a
                        href={evidence.evidence.relevantTransaction.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-[#D26E46] hover:underline"
                      >
                        <span>Inspect on Solscan</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EFEAE2] text-[11px] text-[#798596]">
                      Token account confirmed with settled balance on Solana ledger. Earliest transaction signature is stored in archival indexers.
                    </div>
                  )}
                </div>

                {/* Explorer Reference Links */}
                <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4.5 space-y-2">
                  <span className="text-xs font-bold text-[#191F28] uppercase tracking-wider block">
                    Authoritative Blockchain Explorer References
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={evidence.evidence.explorerReferences.solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0EB] border border-[#E8E3DC] text-xs font-mono font-medium text-[#191F28] hover:text-[#D26E46] transition-colors"
                    >
                      <span>Solscan (Mint)</span>
                      <ExternalLink className="w-3 h-3 ml-1.5 text-[#798596]" />
                    </a>
                    <a
                      href={evidence.evidence.explorerReferences.tokenAccountSolscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0EB] border border-[#E8E3DC] text-xs font-mono font-medium text-[#191F28] hover:text-[#D26E46] transition-colors"
                    >
                      <span>Solscan (Token Account)</span>
                      <ExternalLink className="w-3 h-3 ml-1.5 text-[#798596]" />
                    </a>
                    <a
                      href={evidence.evidence.explorerReferences.solanaFmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0EB] border border-[#E8E3DC] text-xs font-mono font-medium text-[#191F28] hover:text-[#D26E46] transition-colors"
                    >
                      <span>SolanaFM</span>
                      <ExternalLink className="w-3 h-3 ml-1.5 text-[#798596]" />
                    </a>
                    <a
                      href={evidence.evidence.explorerReferences.explorerSolanaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0EB] border border-[#E8E3DC] text-xs font-mono font-medium text-[#191F28] hover:text-[#D26E46] transition-colors"
                    >
                      <span>Official Solana Explorer</span>
                      <ExternalLink className="w-3 h-3 ml-1.5 text-[#798596]" />
                    </a>
                  </div>
                </div>

                {/* CRITICAL LEGAL NON-GUARANTEE DISCLAIMER */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E3DC] text-[11px] text-[#798596] leading-relaxed">
                  <strong className="text-[#191F28] block mb-0.5">Verification Integrity Notice:</strong>
                  {evidence.evidence.auditDisclaimer}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#F0ECE5] flex items-center justify-between text-xs text-[#798596]">
          <span className="flex items-center space-x-1 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2A7954]" />
            <span>Onfolio Verification Engine v1.0</span>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
