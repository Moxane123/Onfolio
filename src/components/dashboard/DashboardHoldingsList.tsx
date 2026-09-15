/**
 * Onfolio — Dashboard Holdings List
 *
 * Answers Question 1: "What do I own?"
 *
 * MANDATE:
 * "Each asset should show:
 *  - company/security
 *  - ticker
 *  - quantity
 *  - current value
 *  - allocation
 *  - performance where available
 *  - verification status
 *  Clicking an asset opens deeper information.
 *  Avoid turning the dashboard into a Bloomberg-style terminal.
 *  The dashboard must work beautifully on mobile."
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  Search,
  Layers,
  Building,
  TrendingUp,
  TrendingDown,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ConsolidatedUnderlyingHolding, Holding, Portfolio, UserPreferences } from '../../types';
import { Badge } from '../ui/Badge';
import { VerificationBadge } from '../verification/VerificationBadge';
import { VerificationInspectorModal } from '../verification/VerificationInspectorModal';
import {
  buildHoldingVerificationEvidence,
  determineHoldingVerificationState,
} from '../../services/verification/evidenceEngine';
import { HoldingVerificationEvidence } from '../../types/verification';

interface DashboardHoldingsListProps {
  portfolio: Portfolio;
  preferences: UserPreferences;
  onSelectAsset: (mint: string) => void;
}

export const DashboardHoldingsList: React.FC<DashboardHoldingsListProps> = ({
  portfolio,
  preferences,
  onSelectAsset,
}) => {
  const [viewMode, setViewMode] = useState<'consolidated' | 'mints'>('consolidated');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectEvidence, setInspectEvidence] = useState<HoldingVerificationEvidence | null>(null);

  const isMasked = preferences.privacyMode === 'masked_balances';

  const currentVerification = determineHoldingVerificationState({
    isMockData: portfolio.isMockData,
    updatedAt: portfolio.updatedAt,
    isPricingStale: portfolio.pricingFreshness?.isStale,
  });

  // Filter consolidated holdings
  const filteredConsolidated = portfolio.consolidatedHoldings.filter((ch) => {
    const q = searchQuery.toLowerCase();
    return (
      ch.underlying.companyName.toLowerCase().includes(q) ||
      ch.underlying.ticker.toLowerCase().includes(q) ||
      ch.underlying.sector.toLowerCase().includes(q) ||
      ch.issuers.some((i) => i.toLowerCase().includes(q))
    );
  });

  // Filter granular holdings
  const filteredHoldings = portfolio.holdings.filter((h) => {
    const q = searchQuery.toLowerCase();
    return (
      h.asset.companyName.toLowerCase().includes(q) ||
      h.asset.underlyingTicker.toLowerCase().includes(q) ||
      h.asset.symbol.toLowerCase().includes(q) ||
      h.asset.issuer.toLowerCase().includes(q) ||
      h.asset.mint.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="dashboard-holdings-list-container"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE4]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Verified Holdings
            </span>
            <Badge variant="brand" size="sm">
              {portfolio.totalAssetsCount} {portfolio.totalAssetsCount === 1 ? 'Asset' : 'Assets'}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#191F28] mt-1 font-sans">
            Underlying Equity Ownership
          </h2>
          <p className="text-xs text-[#798596] mt-0.5">
            Click any asset for prospectus disclosures, custodian verification, and mint proofs.
          </p>
        </div>

        {/* View Toggle & Search */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#798596]" />
            <input
              type="text"
              placeholder="Search ticker, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl focus:outline-none focus:border-[#D26E46] text-[#191F28] placeholder-[#798596] w-full xs:w-44 transition-colors"
            />
          </div>

          {/* View Mode Toggle Button Group */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3DC] shrink-0 self-start xs:self-auto">
            <button
              onClick={() => setViewMode('consolidated')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === 'consolidated'
                  ? 'bg-white text-[#191F28] shadow-xs'
                  : 'text-[#798596] hover:text-[#191F28]'
              }`}
              title="Consolidate multiple token representations of the same company"
            >
              By Security
            </button>
            <button
              onClick={() => setViewMode('mints')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === 'mints'
                  ? 'bg-white text-[#191F28] shadow-xs'
                  : 'text-[#798596] hover:text-[#191F28]'
              }`}
              title="Inspect individual Solana token accounts & mints"
            >
              By Mint
            </button>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="mt-4 divide-y divide-[#F4F0EB]">
        {viewMode === 'consolidated' ? (
          filteredConsolidated.length > 0 ? (
            filteredConsolidated.map((item) => {
              const u = item.underlying;
              const isPositive = u.change24h >= 0;
              const primaryMint = item.representations[0]?.mint;

              return (
                <div
                  key={u.ticker}
                  onClick={() => primaryMint && onSelectAsset(primaryMint)}
                  className="py-4.5 px-3 -mx-3 rounded-2xl hover:bg-[#FAF8F5] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      primaryMint && onSelectAsset(primaryMint);
                    }
                  }}
                >
                  {/* Left: Security Info & Verification */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF0EB] text-[#D26E46] flex items-center justify-center font-bold text-sm shrink-0 border border-[#F1D8CB]/40 group-hover:scale-105 transition-transform">
                      {u.ticker.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-semibold text-sm sm:text-base text-[#191F28] truncate">
                          {u.companyName}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F4F0EB] text-[#4A5361] font-semibold">
                          {u.ticker}
                        </span>
                        <VerificationBadge
                          state={currentVerification.state}
                          size="sm"
                          interactive={true}
                          onClick={() => {
                            const targetHolding = portfolio.holdings.find(
                              (h) => h.asset.underlyingTicker === u.ticker
                            );
                            if (targetHolding) {
                              setInspectEvidence(
                                buildHoldingVerificationEvidence(
                                  targetHolding,
                                  portfolio,
                                  portfolio.walletAddress,
                                  preferences
                                )
                              );
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-[#798596] mt-1">
                        <span>{u.sector}</span>
                        <span>•</span>
                        <span>
                          {item.issuers.join(', ')} ({item.representations.length}{' '}
                          {item.representations.length === 1 ? 'token' : 'tokens'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity, Value, Allocation & Performance */}
                  <div className="flex items-center justify-between sm:justify-end space-x-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F4F0EB]">
                    {/* Allocation & Weight */}
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono text-[#798596] block uppercase tracking-wide">
                        Weight
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <div className="w-14 h-2 bg-[#F4F0EB] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#D26E46] rounded-full"
                            style={{ width: `${Math.min(item.allocationPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#191F28] font-mono">
                          {item.allocationPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Value */}
                    <div className="text-right min-w-[100px]">
                      <span className="text-sm sm:text-base font-semibold text-[#191F28] block font-mono">
                        {isMasked
                          ? '••••'
                          : `$${item.totalValueUsd.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                      </span>
                      <span className="text-xs text-[#798596] font-mono block">
                        {isMasked ? '••' : `${item.totalAmount.toLocaleString()} Shares`}
                      </span>
                    </div>

                    {/* 24h Performance */}
                    <div className="text-right min-w-[80px]">
                      <div
                        className={`inline-flex items-center space-x-1 text-xs font-semibold font-mono ${
                          isPositive ? 'text-[#2A7954]' : 'text-[#C13B2E]'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {u.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-[#798596] block">24h Delta</span>
                    </div>

                    {/* Open Inspector Arrow */}
                    <ChevronRight className="w-4 h-4 text-[#798596] group-hover:text-[#D26E46] group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#798596]">
              <Building className="w-8 h-8 mx-auto mb-2 text-[#E8E3DC]" />
              <p className="text-sm font-medium text-[#191F28]">No securities match your search</p>
              <p className="text-xs mt-1">Try clearing or altering the search term.</p>
            </div>
          )
        ) : (
          /* Mints View: Granular Token Accounts */
          filteredHoldings.length > 0 ? (
            filteredHoldings.map((holding) => {
              const a = holding.asset;
              const isPositive = a.change24h >= 0;
              const perf = holding.performance;

              return (
                <div
                  key={holding.tokenAccountAddress}
                  onClick={() => onSelectAsset(a.mint)}
                  className="py-4.5 px-3 -mx-3 rounded-2xl hover:bg-[#FAF8F5] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectAsset(a.mint);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#F4F0EB] text-[#4A5361] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E8E3DC] group-hover:scale-105 transition-transform">
                      {a.symbol.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-semibold text-sm sm:text-base text-[#191F28] truncate">
                          {a.companyName}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#FAF0EB] text-[#D26E46] font-semibold">
                          {a.symbol}
                        </span>
                        {holding.isToken2022 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#334155] border border-[#CBD5E1]">
                            Token-2022
                          </span>
                        )}
                        <VerificationBadge
                          state={currentVerification.state}
                          size="sm"
                          interactive={true}
                          onClick={() => {
                            setInspectEvidence(
                              buildHoldingVerificationEvidence(
                                holding,
                                portfolio,
                                portfolio.walletAddress,
                                preferences
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-[#798596] mt-1 font-mono truncate">
                        <span>Issuer: {a.issuer}</span>
                        <span>•</span>
                        <span className="truncate">Mint: {a.mint.slice(0, 4)}...{a.mint.slice(-4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F4F0EB]">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono text-[#798596] block uppercase tracking-wide">
                        Weight
                      </span>
                      <span className="text-xs font-semibold text-[#191F28] font-mono">
                        {holding.allocationPercentage}%
                      </span>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <span className="text-sm sm:text-base font-semibold text-[#191F28] block font-mono">
                        {isMasked
                          ? '••••'
                          : `$${holding.valueUsd.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                      </span>
                      <span className="text-xs text-[#798596] font-mono block">
                        {isMasked ? '••' : `${holding.amount.toLocaleString()} Shares`}
                      </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div
                        className={`inline-flex items-center space-x-1 text-xs font-semibold font-mono ${
                          isPositive ? 'text-[#2A7954]' : 'text-[#C13B2E]'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {a.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-[#798596] block">
                        {perf?.costBasisStatus === 'determined' ? 'All-Time' : '24h Delta'}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#798596] group-hover:text-[#D26E46] group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#798596]">
              <Layers className="w-8 h-8 mx-auto mb-2 text-[#E8E3DC]" />
              <p className="text-sm font-medium text-[#191F28]">No token accounts match your search</p>
            </div>
          )
        )}
      </div>

      {/* Holding Verification Evidence Inspector */}
      <VerificationInspectorModal
        evidence={inspectEvidence}
        isOpen={Boolean(inspectEvidence)}
        onClose={() => setInspectEvidence(null)}
      />
    </div>
  );
};
