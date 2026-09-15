/**
 * Onfolio — Asset Detail & Intelligence Modal
 *
 * Displays rich structured registry data for any tokenized equity:
 * - Underlying security & company information
 * - Cryptographic Solana mint & Token standard (SPL vs Token-2022)
 * - Regulated issuer, legal framework, and custodian bank
 * - Price source feed & oracle attribution
 * - Explorer references (Solscan, SolanaFM, Solana Explorer)
 * - Verification status & audit evidence
 */

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  DollarSign,
  Layers,
  Copy,
  Check,
  FileText,
  Clock,
  Activity,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { assetRegistry } from '../../services/assetRegistry/registry';
import { TokenizedAssetRecord, UnderlyingSecurity } from '../../services/assetRegistry/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../verification/VerificationBadge';
import { VerificationInspectorModal } from '../verification/VerificationInspectorModal';
import {
  buildHoldingVerificationEvidence,
  determineHoldingVerificationState,
} from '../../services/verification/evidenceEngine';
import { HoldingVerificationEvidence } from '../../types/verification';

interface AssetDetailModalProps {
  mint: string;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ mint, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [inspectEvidence, setInspectEvidence] = useState<HoldingVerificationEvidence | null>(null);

  const { portfolio, wallet, preferences } = useApp();

  const asset: TokenizedAssetRecord | undefined = assetRegistry.getByMint(mint);
  const underlying: UnderlyingSecurity | undefined = asset
    ? assetRegistry.getUnderlyingByTicker(asset.underlyingTicker)
    : undefined;

  const userHolding = portfolio?.holdings.find(
    (h) => h.asset.mint.toLowerCase() === mint.toLowerCase()
  );

  const verificationState = determineHoldingVerificationState({
    isMockData: portfolio?.isMockData ?? false,
    updatedAt: portfolio?.updatedAt ?? new Date().toISOString(),
    isPricingStale: portfolio?.pricingFreshness?.isStale,
  });

  const handleCopyMint = () => {
    if (!asset) return;
    navigator.clipboard.writeText(asset.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!asset) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#191F28]">Unregistered Token</h3>
          <p className="text-xs text-[#798596] mt-1 font-mono break-all">{mint}</p>
          <p className="text-xs text-[#798596] mt-3">
            This token is not registered in the Onfolio Asset Registry.
          </p>
          <div className="mt-5">
            <Button variant="secondary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: TokenizedAssetRecord['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
            Verified Cryptographic Mint
          </Badge>
        );
      case 'supported':
        return (
          <Badge variant="neutral" size="sm">
            Supported Asset
          </Badge>
        );
      case 'stale metadata':
        return (
          <Badge variant="warning" size="sm">
            Stale Metadata
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="asset-detail-modal-card"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center font-mono font-bold text-sm text-[#D26E46] shrink-0">
              {asset.underlyingTicker}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-[#191F28] leading-tight">
                  {asset.companyName}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#F4F0EB] text-[#4E5968]">
                  {asset.underlyingTicker}
                </span>
              </div>
              <p className="text-xs text-[#798596] mt-0.5">
                {asset.name} • Issued by {asset.issuer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F0EB] hover:bg-[#EAE5DF] flex items-center justify-center text-[#798596] hover:text-[#191F28] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Status & Valuation Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2]">
            <div>
              <div className="text-[11px] font-mono text-[#798596] uppercase">Verification</div>
              <div className="mt-1">
                <VerificationBadge
                  state={userHolding ? verificationState.state : 'unsupported'}
                  size="sm"
                  interactive={Boolean(userHolding)}
                  onClick={() => {
                    if (userHolding && portfolio) {
                      setInspectEvidence(
                        buildHoldingVerificationEvidence(
                          userHolding,
                          portfolio,
                          wallet.address,
                          preferences
                        )
                      );
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#798596] uppercase">Indicative Price</div>
              <div className="mt-1 text-sm font-mono font-bold text-[#191F28]">
                ${asset.priceSource.indicativePriceUsd.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#798596] uppercase">Asset Standard</div>
              <div className="mt-1 text-xs font-mono font-semibold text-[#191F28]">
                {asset.isToken2022 ? 'Solana Token-2022' : 'Classic SPL Token'}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#798596] uppercase">Decimals</div>
              <div className="mt-1 text-xs font-mono font-semibold text-[#191F28]">
                {asset.decimals} Decimals
              </div>
            </div>
          </div>

          {/* Underlying Security Details */}
          {underlying && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-[#D26E46]" />
                <span>Underlying Traditional Security</span>
              </div>
              <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 text-xs space-y-2">
                <p className="text-[#4E5968] leading-relaxed">{underlying.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#F0ECE5]">
                  <div>
                    <span className="text-[11px] text-[#798596] block">ISIN</span>
                    <span className="font-mono text-[#191F28] font-medium">{underlying.isin}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#798596] block">Primary Exchange</span>
                    <span className="font-mono text-[#191F28] font-medium">
                      {underlying.primaryExchange}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#798596] block">Sector</span>
                    <span className="text-[#191F28] font-medium">{underlying.sector}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regulated Issuer & Legal Backing */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2A7954]" />
              <span>Regulated Issuer &amp; Legal Structure</span>
            </div>
            <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#191F28] text-sm">{asset.issuer.legalEntity}</div>
                  <div className="text-[11px] text-[#798596]">{asset.issuer.jurisdiction}</div>
                </div>
                <Badge variant="outline" size="sm">
                  {asset.collateralization}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0ECE5]">
                <div>
                  <span className="text-[11px] text-[#798596] block">Regulatory Framework</span>
                  <span className="font-medium text-[#191F28]">{asset.regulatoryFramework}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#798596] block">Custodian Institution</span>
                  <span className="font-medium text-[#191F28]">{asset.custodian}</span>
                </div>
              </div>

              {asset.prospectusUrl && (
                <div className="pt-2 border-t border-[#F0ECE5]">
                  <a
                    href={asset.prospectusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-medium text-[#D26E46] hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    View Official Offering Prospectus / Regulatory Filing
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Solana Mint Identification */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#D26E46]" />
              <span>Solana Cryptographic Mint Address</span>
            </div>
            <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE2]">
                <span className="font-mono text-xs text-[#191F28] break-all">{asset.mint}</span>
                <button
                  onClick={handleCopyMint}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#F4F0EB] text-[#798596] hover:text-[#191F28] transition-colors shrink-0 ml-2"
                  title="Copy Mint Address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#2A7954]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={asset.explorerReference.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DC] text-[11px] font-mono text-[#4E5968] hover:text-[#D26E46] transition-colors"
                >
                  Solscan
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </a>
                <a
                  href={asset.explorerReference.solanaFmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DC] text-[11px] font-mono text-[#4E5968] hover:text-[#D26E46] transition-colors"
                >
                  SolanaFM
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </a>
                <a
                  href={asset.explorerReference.explorerSolanaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DC] text-[11px] font-mono text-[#4E5968] hover:text-[#D26E46] transition-colors"
                >
                  Solana Explorer
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Price Source & Attribution */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#191F28] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-[#D26E46]" />
              <span>Price Source &amp; Oracle Attribution</span>
            </div>
            <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] text-[#798596] block">Provider</span>
                  <span className="font-medium text-[#191F28]">{asset.priceSource.provider}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#798596] block">Quote Currency</span>
                  <span className="font-mono text-[#191F28] font-medium">
                    {asset.priceSource.quoteCurrency}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#798596] block">Confidence Score</span>
                  <span className="font-mono text-[#2A7954] font-medium">
                    {asset.priceSource.confidenceScore
                      ? `${(asset.priceSource.confidenceScore * 100).toFixed(0)}%`
                      : 'High (Institutional)'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#798596] block">Feed Latency</span>
                  <span className="font-mono text-[#191F28] font-medium">
                    {asset.priceSource.latencySeconds}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Timestamp Notice */}
          <div className="flex items-center justify-between text-[11px] text-[#798596] pt-2 border-t border-[#F0ECE5] font-mono">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#798596]" />
              Registry Record Updated: {new Date(asset.lastUpdated).toLocaleDateString()}
            </span>
            <span className="text-[#2A7954] font-medium">Authoritative Onfolio Catalog</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE5] flex items-center justify-between gap-3">
          {userHolding && portfolio ? (
            <button
              onClick={() => {
                setInspectEvidence(
                  buildHoldingVerificationEvidence(
                    userHolding,
                    portfolio,
                    wallet.address,
                    preferences
                  )
                );
              }}
              className="px-4 py-2 rounded-xl bg-[#191F28] hover:bg-[#2A3542] text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#D26E46]" />
              <span>Inspect Holding Evidence</span>
            </button>
          ) : (
            <div className="text-xs text-[#798596] font-mono">
              Not currently held in this connected wallet
            </div>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>

      {/* Holding Evidence Inspector Sub-Modal */}
      <VerificationInspectorModal
        evidence={inspectEvidence}
        isOpen={Boolean(inspectEvidence)}
        onClose={() => setInspectEvidence(null)}
      />
    </div>
  );
};
