/**
 * Onfolio — Portfolio Insights & Milestones Section
 *
 * Part of Dashboard Hierarchy: "Portfolio insights"
 *
 * Highlights:
 * - Portfolio milestones & capital stewardship achievements
 * - Custodial backing & regulatory compliance
 * - Holding history summary
 * - Unverified/Impostor token isolation audit note
 */

import React from 'react';
import {
  Award,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Building,
  AlertTriangle,
  Clock,
  FileText,
} from 'lucide-react';
import { Portfolio } from '../../types';
import { Badge } from '../ui/Badge';

interface PortfolioInsightsSectionProps {
  portfolio: Portfolio;
}

export const PortfolioInsightsSection: React.FC<PortfolioInsightsSectionProps> = ({
  portfolio,
}) => {
  const milestones = portfolio.milestones || [];
  const unknownTokens = portfolio.unknownTokens || [];
  const holdingHistory = portfolio.holdingHistory || [];

  return (
    <div id="portfolio-insights-section" className="space-y-6">
      {/* 2-Column Grid: Milestones + Custodial Security Backing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Portfolio Milestones */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-2 pb-5 border-b border-[#F0EBE4]">
            <Award className="w-4 h-4 text-[#D26E46]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Portfolio Milestones
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                  m.achieved
                    ? 'bg-[#FAF8F5] border-[#E8E3DC]'
                    : 'bg-white border-[#F0EBE4] opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {m.achieved ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2A7954]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#CBD5E1]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#191F28]">{m.title}</span>
                    {m.achieved && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EEF7F2] text-[#2A7954] shrink-0">
                        {m.achievedAt || 'Verified'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#798596] mt-1 leading-relaxed">
                    {m.description}
                  </p>
                  {m.evidence && (
                    <span className="text-[10px] font-mono text-[#D26E46] block mt-1">
                      {m.evidence}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Custody & Backing Verification */}
        <div className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-5 border-b border-[#F0EBE4]">
              <ShieldCheck className="w-4 h-4 text-[#2A7954]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
                Custody &amp; Regulatory Guarantee
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs text-[#4A5361] leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#EEF7F2]/50 border border-[#C8E5D7]/60">
                <div className="flex items-center space-x-2 text-[#2A7954] font-semibold mb-1">
                  <Building className="w-4 h-4" />
                  <span>100% 1:1 Underlying Depository Share Backing</span>
                </div>
                <p className="text-[11px] text-[#2A7954]/90 leading-normal">
                  All verified tokenized holdings in this portfolio represent direct beneficial or contractual entitlement to traditional common stock deposited at qualified broker-dealers and custodians (Apex Clearing, Interactive Brokers, Maerki Baumann &amp; Co.).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DC]">
                <span className="font-semibold text-[#191F28] block mb-1">
                  Holding History &amp; Tenure
                </span>
                {holdingHistory.length > 0 ? (
                  <div className="space-y-2 mt-2 font-mono text-[11px] text-[#798596]">
                    {holdingHistory.slice(0, 3).map((h) => (
                      <div key={h.mint} className="flex justify-between items-center">
                        <span className="text-[#191F28] font-semibold">{h.ticker}:</span>
                        <span>Acquired {h.firstAcquiredDate} (~{h.estimatedHoldingDays}d tenure)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#798596]">
                    Tenure tracked from earliest onchain settlement timestamp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Unverified Tokens Warning Note (if any exist) */}
          {unknownTokens.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-[#FFFDF7] border border-[#FCE6B5] text-xs text-[#784700]">
              <div className="flex items-center space-x-2 font-semibold mb-1">
                <AlertTriangle className="w-4 h-4 text-[#B87002]" />
                <span>
                  {unknownTokens.length} Unverified Non-Equity {unknownTokens.length === 1 ? 'Token' : 'Tokens'} Quarantined
                </span>
              </div>
              <p className="text-[11px] text-[#784700] leading-normal">
                Tokens with unverified mints (including potential ticker spoof impostors) remain visible in your raw account inspect drawer, but are strictly excluded from equity valuations and passport calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
