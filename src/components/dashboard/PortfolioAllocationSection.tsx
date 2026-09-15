/**
 * Onfolio — Portfolio Allocation & Structure Section
 *
 * Answers Question 4: "What is my portfolio made of?"
 *
 * MANDATE:
 * - Clear allocation breakdown
 * - Asset weights
 * - Avoid turning into a Bloomberg terminal: clean, calm, editorial design
 */

import React, { useState } from 'react';
import { PieChart, Layers, ShieldCheck, Building, BarChart3 } from 'lucide-react';
import { IssuerConcentration, Portfolio, UserPreferences } from '../../types';
import { Badge } from '../ui/Badge';

interface PortfolioAllocationSectionProps {
  portfolio: Portfolio;
  preferences: UserPreferences;
}

export const PortfolioAllocationSection: React.FC<PortfolioAllocationSectionProps> = ({
  portfolio,
  preferences,
}) => {
  const [tab, setTab] = useState<'security' | 'issuer' | 'sector'>('security');
  const isMasked = preferences.privacyMode === 'masked_balances';

  const issuerList: IssuerConcentration[] = Object.values(portfolio.issuersBreakdown || {});

  // Get diversification score interpretation
  const getDiversificationInterpretation = (score: number) => {
    if (score >= 75) {
      return {
        label: 'High Institutional Diversity',
        color: 'text-[#2A7954]',
        bg: 'bg-[#EEF7F2]',
        description: 'Well-distributed across multiple uncorrelated securities and independent regulated issuers.',
      };
    } else if (score >= 45) {
      return {
        label: 'Balanced Allocation',
        color: 'text-[#D26E46]',
        bg: 'bg-[#FAF0EB]',
        description: 'Healthy core holdings with moderate single-security conviction.',
      };
    } else {
      return {
        label: 'Concentrated Conviction',
        color: 'text-[#B87002]',
        bg: 'bg-[#FEF8E7]',
        description: 'Single-asset concentration exceeds 50%. Sensitive to individual security volatility.',
      };
    }
  };

  const diversity = getDiversificationInterpretation(portfolio.diversificationIndex);

  return (
    <div
      id="portfolio-allocation-section"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE4]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Portfolio Composition
            </span>
            <Badge variant="neutral" size="sm">
              HHI Index: {portfolio.diversificationIndex}/100
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#191F28] mt-1 font-sans">
            Asset Weights &amp; Structural Distribution
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3DC] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTab('security')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              tab === 'security'
                ? 'bg-white text-[#191F28] shadow-xs'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            By Security
          </button>
          <button
            onClick={() => setTab('issuer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              tab === 'issuer'
                ? 'bg-white text-[#191F28] shadow-xs'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            By Issuer
          </button>
          <button
            onClick={() => setTab('sector')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              tab === 'sector'
                ? 'bg-white text-[#191F28] shadow-xs'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            By Sector
          </button>
        </div>
      </div>

      {/* Main Allocation Content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Weight Distribution Visual Bars */}
        <div className="lg:col-span-2 space-y-4">
          {tab === 'security' && (
            <div className="space-y-3.5">
              {portfolio.consolidatedHoldings.map((ch) => (
                <div key={ch.underlying.ticker} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#191F28] font-mono">
                        {ch.underlying.ticker}
                      </span>
                      <span className="text-[#798596] truncate max-w-[180px] sm:max-w-xs">
                        {ch.underlying.companyName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-[#798596]">
                        {isMasked
                          ? '••••'
                          : `$${ch.totalValueUsd.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}`}
                      </span>
                      <span className="font-semibold text-[#191F28] w-12 text-right">
                        {ch.allocationPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E3DC]/40">
                    <div
                      className="h-full bg-[#D26E46] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(ch.allocationPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'issuer' && (
            <div className="space-y-4">
              {issuerList.map((issuer) => (
                <div key={issuer.issuerName} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2A7954]" />
                      <span className="font-semibold text-[#191F28]">
                        {issuer.issuerName}
                      </span>
                      <span className="text-[11px] text-[#798596] font-mono">
                        ({issuer.assetCount} {issuer.assetCount === 1 ? 'representation' : 'representations'})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-[#798596]">
                        {isMasked
                          ? '••••'
                          : `$${issuer.valueUsd.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}`}
                      </span>
                      <span className="font-semibold text-[#191F28] w-12 text-right">
                        {issuer.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E3DC]/40">
                    <div
                      className="h-full bg-[#2A7954] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(issuer.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'sector' && (
            <div className="space-y-4">
              {portfolio.sectorAllocation.map((sector) => (
                <div key={sector.sector} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-[#4A5361]" />
                      <span className="font-semibold text-[#191F28]">{sector.sector}</span>
                      <span className="text-[11px] text-[#798596] font-mono">
                        ({sector.assetCount} {sector.assetCount === 1 ? 'asset' : 'assets'})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-[#798596]">
                        {isMasked
                          ? '••••'
                          : `$${sector.valueUsd.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}`}
                      </span>
                      <span className="font-semibold text-[#191F28] w-12 text-right">
                        {sector.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E3DC]/40">
                    <div
                      className="h-full bg-[#4A5361] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(sector.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Diversification Index & Qualitative Insight Card */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DC] p-5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Diversification Metric
            </span>
          </div>

          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-[#191F28]">
              {portfolio.diversificationIndex}
            </span>
            <span className="text-xs text-[#798596] font-mono">/ 100</span>
          </div>

          <div className="mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${diversity.bg} ${diversity.color}`}>
              {diversity.label}
            </span>
            <p className="text-xs text-[#4A5361] mt-2.5 leading-relaxed">
              {diversity.description}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E8E3DC] space-y-2 text-[11px] text-[#798596]">
            <div className="flex justify-between">
              <span>Top Single Asset:</span>
              <span className="font-semibold text-[#191F28] font-mono">
                {portfolio.topAllocationTicker}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Regulated Issuers:</span>
              <span className="font-semibold text-[#191F28] font-mono">
                {Object.keys(portfolio.issuersBreakdown).length} Entities
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
