/**
 * Onfolio — Portfolio Breakdown & Asset Recognizer Evidence
 * Supporting verification data explaining the passport credential.
 */

import React from 'react';
import {
  PieChart,
  ShieldCheck,
  FileText,
  Building,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatMaskedCurrency,
  formatMaskedBalance,
} from '../../services/privacy/privacyManager';
import { Badge } from '../ui/Badge';

export const PortfolioBreakdown: React.FC = () => {
  const { portfolio, preferences } = useApp();

  if (!portfolio || portfolio.holdings.length === 0) {
    return null;
  }

  const isMasked = preferences.privacyMode !== 'public';
  const issuerList = Object.values(portfolio.issuersBreakdown);

  return (
    <div id="portfolio-breakdown-section" className="space-y-8">
      {/* Section Header */}
      <div>
        <span className="text-[11px] font-mono tracking-widest text-[#D26E46] uppercase font-bold">
          SUPPORTING EVIDENCE • ASSET RECOGNITION
        </span>
        <h3 className="text-xl font-bold tracking-tight text-[#191F28] mt-0.5">
          Verified Tokenized Equities &amp; Collateral Backing
        </h3>
        <p className="text-xs text-[#798596] mt-1">
          Every recognized SPL Token account is matched against regulated issuer registries and
          verified 1:1 against real-world equity shares.
        </p>
      </div>

      {/* Holdings Table */}
      <div className="bg-white border border-[#E8E3DC] rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#D26E46]" />
            <h4 className="text-sm font-bold text-[#191F28]">Recognized Equity Accounts</h4>
          </div>
          <span className="text-xs font-mono text-[#798596]">
            {portfolio.holdings.length} Positions Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0ECE5] bg-[#FAF8F5] text-[11px] font-mono text-[#798596] uppercase tracking-wider">
                <th className="py-3 px-6 font-semibold">Security / Ticker</th>
                <th className="py-3 px-6 font-semibold">Issuer &amp; Structure</th>
                <th className="py-3 px-6 font-semibold">Shares</th>
                <th className="py-3 px-6 font-semibold">Share Price</th>
                <th className="py-3 px-6 font-semibold">Valuation</th>
                <th className="py-3 px-6 font-semibold">Allocation</th>
                <th className="py-3 px-6 font-semibold text-right">Backing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE5]">
              {portfolio.holdings.map((h) => {
                const displayVal = formatMaskedCurrency(h.valueUsd, preferences.privacyMode);
                const displayShares = formatMaskedBalance(h.amount, preferences.privacyMode);

                return (
                  <tr
                    key={h.asset.mint}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group"
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

                    {/* Issuer & Structure */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#191F28]">{h.asset.issuer}</div>
                      <div className="text-[11px] text-[#798596] font-mono">
                        {h.isToken2022 ? 'Token-2022' : 'SPL Token'} • {h.asset.regulatoryFramework.split(' (')[0]}
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
                      <div className="w-24">
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

                    {/* Backing Status & Custodian */}
                    <td className="py-4 px-6 text-right">
                      <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                        1:1 Collateralized
                      </Badge>
                      <div className="text-[10px] text-[#798596] font-mono mt-1">
                        Custodian: {h.asset.custodian.split(' ')[0]}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulated Issuer Trust Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {issuerList.map((issuer) => {
          // Find representative holding for details
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
    </div>
  );
};
