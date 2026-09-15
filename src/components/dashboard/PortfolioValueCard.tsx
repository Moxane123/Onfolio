/**
 * Onfolio — Portfolio Value Card
 *
 * Answers Question 2: "What is it worth?"
 *
 * MANDATE:
 * - Prominent portfolio value display
 * - Clearly state whether values are: live / delayed / estimated
 * - Never imply real-time pricing when data is not real-time
 * - Strong loading and stale-data states
 * - No trading buttons
 */

import React from 'react';
import {
  Clock,
  Radio,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Coins,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Portfolio, UserPreferences } from '../../types';
import { Badge } from '../ui/Badge';

interface PortfolioValueCardProps {
  portfolio: Portfolio;
  preferences: UserPreferences;
  onTogglePrivacy: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const PortfolioValueCard: React.FC<PortfolioValueCardProps> = ({
  portfolio,
  preferences,
  onTogglePrivacy,
  onRefresh,
  isRefreshing = false,
}) => {
  const isMasked = preferences.privacyMode === 'masked_balances';
  const freshness = portfolio.pricingFreshness;

  const formattedEquityValue = isMasked
    ? '••••••••'
    : `$${portfolio.totalValueUsd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const formattedNetWorth = isMasked
    ? '••••••••'
    : `$${portfolio.totalNetWorthUsd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const formattedSol = isMasked
    ? '••••'
    : `${portfolio.solBalance.toFixed(3)} SOL ($${portfolio.solBalanceUsd.toFixed(2)})`;

  // Determine freshness badge style
  const getFreshnessBadge = () => {
    switch (freshness.status) {
      case 'live':
        return (
          <Badge
            variant="success"
            size="md"
            icon={<Radio className="w-3 h-3 animate-pulse text-[#2A7954]" />}
          >
            Live Market Feed
          </Badge>
        );
      case 'estimated':
        return (
          <Badge
            variant="brand"
            size="md"
            icon={<Sparkles className="w-3 h-3 text-[#D26E46]" />}
          >
            Indicative Valuation
          </Badge>
        );
      case 'delayed':
      default:
        return (
          <Badge
            variant="neutral"
            size="md"
            icon={<Clock className="w-3 h-3 text-[#798596]" />}
          >
            Delayed (15m Composite)
          </Badge>
        );
    }
  };

  const updatedTime = new Date(portfolio.updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="portfolio-value-primary-card"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-8 shadow-xs relative overflow-hidden transition-all"
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FAF0EB]/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Portfolio Valuation
            </span>
            {getFreshnessBadge()}
          </div>
          <p className="text-xs text-[#798596] mt-1 font-mono">
            Source: {freshness.provider}
          </p>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            id="btn-toggle-privacy-mask"
            onClick={onTogglePrivacy}
            className="p-2 rounded-xl text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] transition-colors cursor-pointer border border-[#E8E3DC]/60"
            title={isMasked ? 'Reveal balances' : 'Mask balances'}
            aria-label="Toggle balance privacy"
          >
            {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            id="btn-refresh-portfolio-value"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A5361] hover:text-[#191F28] hover:bg-[#F4F0EB] transition-colors cursor-pointer border border-[#E8E3DC]/60 disabled:opacity-50"
            title="Refresh valuation snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">
              {isRefreshing ? 'Scanning...' : `Updated ${updatedTime}`}
            </span>
          </button>
        </div>
      </div>

      {/* Big Value Number */}
      <div className="mt-6 sm:mt-8 relative z-10">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#191F28] font-sans">
            {formattedEquityValue}
          </span>
          <span className="text-sm sm:text-base font-medium text-[#798596]">USD</span>
        </div>
        <p className="text-xs text-[#798596] mt-2 max-w-2xl leading-relaxed">
          {freshness.pricingDisclaimer}
        </p>
      </div>

      {/* Summary Secondary Stats Grid */}
      <div className="mt-8 pt-6 border-t border-[#F0EBE4] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {/* Tokenized Shares */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] text-[#D26E46] flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#798596] block uppercase">
              Tokenized Equities
            </span>
            <span className="text-sm font-semibold text-[#191F28]">
              {isMasked ? '••••' : `${portfolio.totalSharesCount.toLocaleString()} Shares`}
            </span>
            <span className="text-[11px] text-[#798596] ml-1">
              ({portfolio.totalAssetsCount} {portfolio.totalAssetsCount === 1 ? 'asset' : 'assets'})
            </span>
          </div>
        </div>

        {/* Onchain Gas / SOL Reserve */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4F0EB] text-[#4A5361] flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#798596] block uppercase">
              Gas Reserve (SOL)
            </span>
            <span className="text-sm font-semibold text-[#191F28]">{formattedSol}</span>
          </div>
        </div>

        {/* Total Net Worth */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEF7F2] text-[#2A7954] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#798596] block uppercase">
              Combined Net Worth
            </span>
            <span className="text-sm font-semibold text-[#191F28]">
              {formattedNetWorth}
            </span>
            <span className="text-[11px] text-[#2A7954] ml-1 font-mono">100% Non-custodial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
