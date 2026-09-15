/**
 * Onfolio — Primary Portfolio Dashboard
 *
 * Answers the 5 Core Questions:
 * 1. What do I own?
 * 2. What is it worth?
 * 3. How is it performing?
 * 4. What is my portfolio made of?
 * 5. What happened recently?
 *
 * Clean hierarchy:
 * Portfolio value
 * ↓
 * Performance
 * ↓
 * Holdings
 * ↓
 * Allocation
 * ↓
 * Recent activity
 * ↓
 * Portfolio insights
 *
 * Design Mandates:
 * - Avoid turning into a Bloomberg terminal
 * - Clearly state whether values are live / delayed / estimated
 * - Strong loading and stale-data states
 * - Mobile responsive
 * - No trading buttons
 */

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { Portfolio, UserPreferences } from '../../types';
import { StaleDataBanner } from './StaleDataBanner';
import { PortfolioValueCard } from './PortfolioValueCard';
import { PortfolioPerformanceSection } from './PortfolioPerformanceSection';
import { DashboardHoldingsList } from './DashboardHoldingsList';
import { PortfolioAllocationSection } from './PortfolioAllocationSection';
import { RecentActivityFeed } from './RecentActivityFeed';
import { PortfolioInsightsSection } from './PortfolioInsightsSection';
import { AssetDetailModal } from '../portfolio/AssetDetailModal';

interface PortfolioDashboardProps {
  portfolio: Portfolio | null;
  isLoading: boolean;
  preferences: UserPreferences;
  onTogglePrivacy: () => void;
  onRefresh: () => void;
  onSwitchToPassport?: () => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolio,
  isLoading,
  preferences,
  onTogglePrivacy,
  onRefresh,
  onSwitchToPassport,
}) => {
  const [selectedAssetMint, setSelectedAssetMint] = useState<string | null>(null);

  // Strong Loading State
  if (isLoading || !portfolio) {
    return (
      <div id="portfolio-dashboard-loading-skeleton" className="space-y-6 animate-pulse">
        {/* Value Card Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#F0EBE4] rounded w-32" />
            <div className="h-6 bg-[#F0EBE4] rounded-full w-24" />
          </div>
          <div className="h-12 bg-[#F0EBE4] rounded w-64" />
          <div className="h-4 bg-[#F0EBE4] rounded w-96 max-w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F0EBE4]">
            <div className="h-10 bg-[#F0EBE4] rounded-xl" />
            <div className="h-10 bg-[#F0EBE4] rounded-xl" />
            <div className="h-10 bg-[#F0EBE4] rounded-xl" />
          </div>
        </div>

        {/* Performance Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-6 space-y-4">
          <div className="h-4 bg-[#F0EBE4] rounded w-48" />
          <div className="h-8 bg-[#F0EBE4] rounded w-40" />
        </div>

        {/* Holdings Skeleton */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-6 space-y-4">
          <div className="h-5 bg-[#F0EBE4] rounded w-40" />
          <div className="space-y-3">
            <div className="h-16 bg-[#FAF8F5] rounded-2xl" />
            <div className="h-16 bg-[#FAF8F5] rounded-2xl" />
            <div className="h-16 bg-[#FAF8F5] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="primary-portfolio-dashboard" className="space-y-6">
      {/* Identity Passport Direct Transition Banner */}
      {onSwitchToPassport && (
        <div className="p-4 rounded-2xl bg-[#191F28] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#2A3542] shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#222935] text-[#D26E46] border border-[#343F4F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
                  CENTRAL PRODUCT • INVESTMENT IDENTITY
                </span>
                <span className="w-1 h-1 rounded-full bg-[#4ADE80]" />
                <span className="text-[10px] font-mono text-[#4ADE80]">
                  {portfolio.isMockData ? 'SANDBOX VERIFIED' : 'ONCHAIN VERIFIED'}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                {portfolio.walletAddress
                  ? `onfolio.id/@${portfolio.walletAddress.slice(0, 4).toLowerCase()}${portfolio.walletAddress.slice(-4).toLowerCase()}`
                  : 'Onfolio Investment Passport'}
              </div>
            </div>
          </div>
          <button
            id="dashboard-top-switch-to-passport-btn"
            onClick={onSwitchToPassport}
            className="px-3.5 py-1.5 rounded-xl bg-[#2A3542] hover:bg-[#3B4856] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer self-start sm:self-auto border border-[#3B4856]"
          >
            <span>View Investment Passport</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D26E46]" />
          </button>
        </div>
      )}

      {/* 0. Stale Data Notice (if applicable) */}
      <StaleDataBanner
        freshness={portfolio.pricingFreshness}
        onRefresh={onRefresh}
        isRefreshing={isLoading}
      />

      {/* 1. Portfolio Value: What is it worth? */}
      <PortfolioValueCard
        portfolio={portfolio}
        preferences={preferences}
        onTogglePrivacy={onTogglePrivacy}
        onRefresh={onRefresh}
        isRefreshing={isLoading}
      />

      {/* 2. Performance: How is it performing? */}
      <PortfolioPerformanceSection
        portfolio={portfolio}
        preferences={preferences}
      />

      {/* 3. Holdings: What do I own? */}
      <DashboardHoldingsList
        portfolio={portfolio}
        preferences={preferences}
        onSelectAsset={(mint) => setSelectedAssetMint(mint)}
      />

      {/* 4. Allocation: What is my portfolio made of? */}
      <PortfolioAllocationSection
        portfolio={portfolio}
        preferences={preferences}
      />

      {/* 5. Recent Activity: What happened recently? */}
      <RecentActivityFeed portfolio={portfolio} />

      {/* 6. Portfolio Insights: Custodial Guarantee & Milestones */}
      <PortfolioInsightsSection portfolio={portfolio} />

      {/* Deeper Information Inspector Modal */}
      {selectedAssetMint && (
        <AssetDetailModal
          mint={selectedAssetMint}
          onClose={() => setSelectedAssetMint(null)}
        />
      )}
    </div>
  );
};
