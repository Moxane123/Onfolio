/**
 * Onfolio — Portfolio Breakdown & Asset Intelligence Layer
 *
 * Translates onchain token accounts into understandable financial assets:
 * UNDERLYING SECURITY → TOKENIZED REPRESENTATION → REGULATED ISSUER → SOLANA MINT
 *
 * CRITICAL AUDIT RULE:
 * Never identify an asset solely by ticker/symbol. A token saying "AAPL" is not Apple stock.
 * Cryptographic mint verification guarantees authenticity and protects against impostor tokens.
 */

import React, { useState } from 'react';
import {
  PieChart,
  ShieldCheck,
  FileText,
  Building,
  ExternalLink,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  CheckCircle2,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatMaskedCurrency,
  formatMaskedBalance,
} from '../../services/privacy/privacyManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AssetDetailModal } from './AssetDetailModal';

export const PortfolioBreakdown: React.FC = () => {
  const { portfolio, preferences } = useApp();
  const [viewMode, setViewMode] = useState<'consolidated' | 'representations'>('consolidated');
  const [expandedTickers, setExpandedTickers] = useState<Record<string, boolean>>({});
  const [selectedMint, setSelectedMint] = useState<string | null>(null);

  if (!portfolio || (portfolio.holdings.length === 0 && portfolio.unknownTokens.length === 0)) {
    return null;
  }

  const isMasked = preferences.privacyMode !== 'public';
  const issuerList = Object.values(portfolio.issuersBreakdown);
  const consolidatedList = portfolio.consolidatedHoldings || [];
  const unknownTokens = portfolio.unknownTokens || [];

  const toggleExpand = (ticker: string) => {
    setExpandedTickers((prev) => ({
      ...prev,
      [ticker]: !prev[ticker],
    }));
  };

  return (
    <div id="portfolio-breakdown-section" className="space-y-8">
      {/* Section Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
            SUPPORTING EVIDENCE • ASSET INTELLIGENCE
          </span>
          <h3 className="text-xl font-bold tracking-tight text-[#191F28] mt-0.5">
            Verified Tokenized Equities &amp; Asset Hierarchy
          </h3>
          <p className="text-xs text-[#798596] mt-1 max-w-2xl">
            Onfolio translates onchain Solana tokens into verified financial assets. All assets are
            cryptographically matched against regulated issuer registries—never relying on ticker labels alone.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#F4F0EB] p-1 rounded-2xl border border-[#E8E3DC] self-start sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('consolidated')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'consolidated'
                ? 'bg-white text-[#191F28] shadow-2xs font-semibold'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            Consolidated by Security
          </button>
          <button
            onClick={() => setViewMode('representations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'representations'
                ? 'bg-white text-[#191F28] shadow-2xs font-semibold'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            All Token Representations ({portfolio.holdings.length})
          </button>
        </div>
      </div>

      {/* 1. CONSOLIDATED BY UNDERLYING SECURITY VIEW */}
      {viewMode === 'consolidated' && (
        <div className="bg-white border border-[#E8E3DC] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#D26E46]" />
              <h4 className="text-sm font-bold text-[#191F28]">
                Consolidated Underlying Equities ({consolidatedList.length})
              </h4>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-[#798596]">
              <span>Multiple token representations consolidated</span>
            </div>
          </div>

          <div className="divide-y divide-[#F0ECE5]">
            {consolidatedList.map((item) => {
              const ticker = item.underlying.ticker;
              const isExpanded = Boolean(expandedTickers[ticker]);
              const displayVal = formatMaskedCurrency(item.totalValueUsd, preferences.privacyMode);
              const displayShares = formatMaskedBalance(item.totalAmount, preferences.privacyMode);
              const hasMultipleReps = item.representations.length > 1;

              return (
                <div key={ticker} className="transition-colors hover:bg-[#FAF8F5]/50">
                  {/* Consolidated Summary Row */}
                  <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Security Identity */}
                    <div className="flex items-center space-x-3.5 min-w-[240px]">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center font-mono font-bold text-xs text-[#D26E46] shrink-0">
                        {ticker}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#191F28]">
                            {item.underlying.companyName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F0EB] text-[#4E5968] font-semibold">
                            {item.underlying.primaryExchange}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-[#798596] mt-0.5">
                          <span>{item.underlying.sector}</span>
                          <span>•</span>
                          <span className="font-mono">{item.underlying.isin}</span>
                        </div>
                      </div>
                    </div>

                    {/* Representations & Issuers */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.issuers.map((iss) => (
                        <Badge key={iss} variant="neutral" size="sm">
                          {iss}
                        </Badge>
                      ))}
                      {hasMultipleReps && (
                        <span className="text-[11px] font-mono text-[#D26E46] bg-[#FAF0EB] px-2 py-0.5 rounded-full font-semibold">
                          {item.representations.length} Token Mints
                        </span>
                      )}
                    </div>

                    {/* Shares & Valuation */}
                    <div className="flex items-center justify-between sm:justify-end space-x-6">
                      <div>
                        <div className="text-[10px] font-mono text-[#798596] uppercase text-right">
                          Total Shares
                        </div>
                        <div className="text-xs font-mono font-bold text-[#191F28] text-right">
                          {displayShares}
                        </div>
                      </div>

                      <div className="min-w-[100px] text-right">
                        <div className="text-[10px] font-mono text-[#798596] uppercase">
                          Valuation
                        </div>
                        <div className="text-sm font-mono font-bold text-[#191F28]">
                          {displayVal}
                        </div>
                      </div>

                      {/* Allocation Bar */}
                      <div className="w-20 hidden md:block">
                        <div className="flex justify-between text-[10px] font-mono text-[#798596] mb-1">
                          <span>{item.allocationPercentage}%</span>
                        </div>
                        <div className="w-full bg-[#F4F0EB] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D26E46] h-full rounded-full"
                            style={{ width: `${Math.min(item.allocationPercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Expansion / Inspection Toggle */}
                      <button
                        onClick={() => toggleExpand(ticker)}
                        className="p-1.5 rounded-xl hover:bg-[#F4F0EB] text-[#798596] hover:text-[#191F28] transition-colors flex items-center space-x-1 text-xs font-medium"
                      >
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Token Representations Drawer */}
                  {isExpanded && (
                    <div className="bg-[#FAF8F5] border-t border-[#F0ECE5] p-5 sm:px-6 space-y-3">
                      <div className="text-xs font-bold text-[#191F28] flex items-center space-x-2">
                        <Layers className="w-3.5 h-3.5 text-[#D26E46]" />
                        <span>Tokenized Representations on Solana for {item.underlying.companyName}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {item.representations.map((rep) => (
                          <div
                            key={rep.mint}
                            className="bg-white border border-[#E8E3DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-[#191F28]">{rep.name}</span>
                                <Badge variant="outline" size="sm">
                                  {rep.symbol}
                                </Badge>
                                <span className="text-[10px] font-mono text-[#798596]">
                                  {rep.isToken2022 ? 'Token-2022' : 'SPL Token'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-[#798596] mt-1 font-mono">
                                <span>Issuer: {rep.issuerName}</span>
                                <span>•</span>
                                <span>Custodian: {rep.custodian}</span>
                                <span>•</span>
                                <span className="truncate max-w-[180px]">
                                  Mint: {rep.mint.slice(0, 6)}...{rep.mint.slice(-6)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end space-x-4">
                              <div className="text-right">
                                <div className="text-xs font-mono font-semibold text-[#191F28]">
                                  {formatMaskedBalance(rep.amount, preferences.privacyMode)} shares
                                </div>
                                <div className="text-[11px] font-mono text-[#798596]">
                                  {formatMaskedCurrency(rep.valueUsd, preferences.privacyMode)}
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMint(rep.mint)}
                              >
                                View Asset Record
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ALL TOKEN REPRESENTATIONS TABLE VIEW */}
      {viewMode === 'representations' && (
        <div className="bg-white border border-[#E8E3DC] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#D26E46]" />
              <h4 className="text-sm font-bold text-[#191F28]">
                Authoritatively Verified Token Accounts ({portfolio.holdings.length})
              </h4>
            </div>
            <span className="text-xs font-mono text-[#798596]">Cryptographic Mint Matches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F0ECE5] bg-[#FAF8F5] text-[11px] font-mono text-[#798596] uppercase tracking-wider">
                  <th className="py-3 px-6 font-semibold">Security / Token</th>
                  <th className="py-3 px-6 font-semibold">Issuer &amp; Mint</th>
                  <th className="py-3 px-6 font-semibold">Shares</th>
                  <th className="py-3 px-6 font-semibold">Price</th>
                  <th className="py-3 px-6 font-semibold">Valuation</th>
                  <th className="py-3 px-6 font-semibold">Allocation</th>
                  <th className="py-3 px-6 font-semibold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE5]">
                {portfolio.holdings.map((h) => {
                  const displayVal = formatMaskedCurrency(h.valueUsd, preferences.privacyMode);
                  const displayShares = formatMaskedBalance(h.amount, preferences.privacyMode);

                  return (
                    <tr
                      key={h.asset.mint}
                      className="hover:bg-[#FAF8F5]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMint(h.asset.mint)}
                    >
                      {/* Security & Underlying Ticker */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center font-mono font-bold text-xs text-[#D26E46] shrink-0">
                            {h.asset.underlyingTicker}
                          </div>
                          <div>
                            <div className="font-bold text-[#191F28] group-hover:text-[#D26E46] transition-colors">
                              {h.asset.companyName}
                            </div>
                            <div className="text-[11px] font-mono text-[#798596] mt-0.5">
                              {h.asset.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Issuer & Mint */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#191F28]">{h.asset.issuer}</div>
                        <div className="text-[11px] text-[#798596] font-mono truncate max-w-[140px]">
                          {h.asset.mint.slice(0, 6)}...{h.asset.mint.slice(-4)}
                        </div>
                      </td>

                      {/* Share Balance */}
                      <td className="py-4 px-6 font-mono font-semibold text-[#191F28]">
                        {displayShares}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-mono text-[#798596]">
                        ${h.asset.marketPriceUsd.toFixed(2)}
                      </td>

                      {/* Total USD Valuation */}
                      <td className="py-4 px-6 font-mono font-bold text-[#191F28]">
                        {displayVal}
                      </td>

                      {/* Allocation Bar */}
                      <td className="py-4 px-6">
                        <div className="w-20">
                          <div className="flex justify-between text-[11px] font-mono text-[#798596] mb-1">
                            <span>{h.allocationPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-[#F4F0EB] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#D26E46] h-full rounded-full transition-all"
                              style={{ width: `${Math.min(h.allocationPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-6 text-right">
                        <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                          Verified Mint
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. UNVERIFIED / UNKNOWN TOKENS SECTION (NEVER FALSELY CLASSIFIED) */}
      {unknownTokens.length > 0 && (
        <div className="bg-white border border-[#E8E3DC] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FFFBF8]">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-[#191F28]">
                Unverified &amp; Non-Equity Tokens ({unknownTokens.length})
              </h4>
            </div>
            <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Excluded from Equity Passport
            </span>
          </div>

          <div className="p-5 border-b border-[#F0ECE5] bg-[#FAF8F5]/80 text-xs text-[#4E5968] flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#D26E46] shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-semibold text-[#191F28]">
                Strict Asset Intelligence Safeguard Enforced:
              </p>
              <p className="text-[#798596]">
                Never identify an asset solely by ticker/symbol. A token labeled &quot;AAPL&quot; or &quot;NVDA&quot;
                is not automatically Apple or NVIDIA stock. Tokens below were detected onchain but are not
                registered in the Onfolio Asset Registry. They are intentionally kept visible and unclassified
                to prevent valuation spoofing.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F0ECE5]">
            {unknownTokens.map((token) => (
              <div
                key={token.mint}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#191F28]">
                      {token.name || 'Unlabeled Token'}
                    </span>
                    {token.symbol && (
                      <Badge
                        variant={token.isImpostorRisk ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {token.symbol}
                      </Badge>
                    )}
                    {token.isImpostorRisk && (
                      <span className="inline-flex items-center text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        REJECTED IMPOSTOR RISK
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#798596] mt-1 break-all">
                    Mint: {token.mint}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">
                    {token.rejectionReason}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-[#191F28]">
                    {token.amount.toLocaleString()} tokens
                  </div>
                  <div className="text-[10px] font-mono text-[#798596]">
                    Status: <span className="font-semibold uppercase">{token.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. REGULATED ISSUER TRUST CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {issuerList.map((issuer) => {
          const sampleHolding = portfolio.holdings.find(
            (h) => h.asset.issuer === issuer.issuerName
          );

          return (
            <div
              key={issuer.issuerName}
              className="bg-white border border-[#E8E3DC] rounded-2xl p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-[#D26E46]" />
                  <h5 className="font-bold text-xs text-[#191F28]">{issuer.issuerName}</h5>
                </div>
                <span className="text-xs font-mono font-semibold text-[#D26E46]">
                  {issuer.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#798596]">
                  <span>Assets Held:</span>
                  <span className="font-mono text-[#191F28]">{issuer.assetCount} securities</span>
                </div>
                {sampleHolding && (
                  <>
                    <div className="flex justify-between text-[#798596]">
                      <span>Jurisdiction:</span>
                      <span className="font-mono text-[#191F28] truncate max-w-[170px]">
                        {sampleHolding.asset.regulatoryFramework.split(' (')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#798596]">
                      <span>Custodian:</span>
                      <span className="font-mono text-[#191F28] truncate max-w-[170px]">
                        {sampleHolding.asset.custodian}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-[#F0ECE5] flex items-center justify-between text-[11px]">
                  <span className="text-[#2A7954] font-medium flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Audit Verified
                  </span>
                  <span className="font-mono text-[#798596]">
                    {formatMaskedCurrency(issuer.valueUsd, preferences.privacyMode)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Detail Inspector Modal */}
      {selectedMint && (
        <AssetDetailModal
          mint={selectedMint}
          onClose={() => setSelectedMint(null)}
        />
      )}
    </div>
  );
};
