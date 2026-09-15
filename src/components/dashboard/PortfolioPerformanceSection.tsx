/**
 * Onfolio — Portfolio Performance Section
 *
 * Answers Question 3: "How is it performing?"
 *
 * CRITICAL AUDIT MANDATE:
 * "Calculate, where reliable data exists:
 *  - gain/loss where cost basis can be reliably determined
 *  Do not invent cost basis.
 *  If reliable historical acquisition data is unavailable, clearly label performance as unavailable or estimated."
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Portfolio, UserPreferences } from '../../types';
import { Badge } from '../ui/Badge';

interface PortfolioPerformanceSectionProps {
  portfolio: Portfolio;
  preferences: UserPreferences;
}

export const PortfolioPerformanceSection: React.FC<PortfolioPerformanceSectionProps> = ({
  portfolio,
  preferences,
}) => {
  const isMasked = preferences.privacyMode === 'masked_balances';
  const perf = portfolio.performance;
  const isPositive = perf.performance24hPercent >= 0;

  const formattedDollarChange = isMasked
    ? '••••'
    : `${isPositive ? '+' : '-'}$${Math.abs(perf.performance24hUsd).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const formattedPercentChange = `${isPositive ? '+' : ''}${perf.performance24hPercent.toFixed(2)}%`;

  return (
    <div
      id="portfolio-performance-section"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0EBE4]">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
            Performance &amp; Market Movements
          </span>
          <Badge variant="neutral" size="sm">
            24h Delta
          </Badge>
          {perf.costBasisStatus === 'unavailable' ? (
            <Badge variant="warning" size="sm">
              Cost Basis Unavailable
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Settlement Cost Basis
            </Badge>
          )}
        </div>

        {/* Top 24h Mover Badge */}
        {perf.topGainerTicker && perf.topGainerPercent !== undefined && (
          <div className="flex items-center space-x-1.5 text-xs text-[#4A5361] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E3DC]">
            <Sparkles className="w-3.5 h-3.5 text-[#D26E46]" />
            <span>Top 24h Mover:</span>
            <span className="font-bold text-[#191F28] font-mono">{perf.topGainerTicker}</span>
            <span
              className={`font-semibold font-mono ${
                perf.topGainerPercent >= 0 ? 'text-[#2A7954]' : 'text-[#C13B2E]'
              }`}
            >
              {perf.topGainerPercent >= 0 ? '+' : ''}
              {perf.topGainerPercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: 24h Change Figures */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isPositive ? 'bg-[#EEF7F2] text-[#2A7954]' : 'bg-[#FDF2F1] text-[#C13B2E]'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-7 h-7" />
            ) : (
              <TrendingDown className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="flex items-baseline space-x-2.5">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                  isPositive ? 'text-[#2A7954]' : 'text-[#C13B2E]'
                }`}
              >
                {formattedPercentChange}
              </span>
              <span className="text-base sm:text-lg font-semibold text-[#4A5361] font-mono">
                ({formattedDollarChange})
              </span>
            </div>
            <span className="text-xs text-[#798596] block mt-0.5">
              Net portfolio movement past 24 hours
            </span>
          </div>
        </div>

        {/* Right: Explicit Audit & Cost Basis Transparency Box */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DC] p-4 text-xs text-[#4A5361] leading-relaxed flex items-start space-x-3">
          <div className="p-1 rounded-lg bg-[#E8E3DC]/60 text-[#798596] shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#191F28] block mb-1">
              {perf.costBasisStatus === 'determined'
                ? 'Primary Settlement Cost Basis Verified'
                : 'Why Cost Basis is Labeled Unavailable'}
            </span>
            <p className="text-[11px] text-[#798596] leading-normal">
              {perf.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
