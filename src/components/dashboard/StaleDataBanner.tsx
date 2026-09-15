/**
 * Onfolio — Stale Data & Pricing Freshness Banner
 *
 * MANDATE:
 * "Clearly state whether values are:
 *  - live
 *  - delayed
 *  - estimated
 *  Never imply real-time pricing when the data is not real-time.
 *  Create strong loading and stale-data states."
 */

import React from 'react';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { PricingFreshness } from '../../types';

interface StaleDataBannerProps {
  freshness: PricingFreshness;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const StaleDataBanner: React.FC<StaleDataBannerProps> = ({
  freshness,
  onRefresh,
  isRefreshing = false,
}) => {
  if (!freshness.isStale) return null;

  return (
    <div
      id="stale-data-warning-banner"
      className="mb-6 bg-[#FEF8E7] border border-[#FCE6B5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#784700]"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-[#FDE9B5] text-[#B87002] shrink-0 mt-0.5 sm:mt-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs uppercase tracking-wider text-[#945C02]">
              Stale Data Notice
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#FBE0A1] text-[#784700]">
              {freshness.delayMinutes}m+ Since Refresh
            </span>
          </div>
          <p className="text-xs text-[#784700] mt-1 leading-relaxed">
            {freshness.staleMessage ||
              'Price benchmarks were fetched earlier. Financial markets may have shifted. Refresh to synchronize against the latest composite tape.'}
          </p>
        </div>
      </div>

      <button
        id="btn-refresh-stale-pricing"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="shrink-0 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#FCE6B5] text-xs font-semibold text-[#784700] hover:bg-[#FFFDF7] transition-all cursor-pointer shadow-xs disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>{isRefreshing ? 'Updating...' : 'Refresh Snapshot'}</span>
      </button>
    </div>
  );
};
