/**
 * Onfolio — Recent Transaction Activity Feed
 *
 * Answers Question 5: "What happened recently?"
 *
 * MANDATE:
 * - Chronological normalized transaction activity
 * - Direct block explorer links
 * - Clear confirmation tiers
 * - Clean mobile responsive layout
 */

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  History,
  FileCheck2,
} from 'lucide-react';
import { Portfolio, Transaction } from '../../types';
import { Badge } from '../ui/Badge';

interface RecentActivityFeedProps {
  portfolio: Portfolio;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ portfolio }) => {
  const transactions: Transaction[] = portfolio.recentTransactions || [];

  const formatTime = (blockTime: number) => {
    if (!blockTime) return 'Recent Slot';
    const date = new Date(blockTime * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'settlement':
        return <ShieldCheck className="w-4 h-4 text-[#2A7954]" />;
      case 'transfer_in':
      case 'mint':
        return <ArrowDownLeft className="w-4 h-4 text-[#D26E46]" />;
      case 'transfer_out':
        return <ArrowUpRight className="w-4 h-4 text-[#798596]" />;
      default:
        return <History className="w-4 h-4 text-[#798596]" />;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'settlement':
        return 'Primary Share Settlement';
      case 'transfer_in':
        return 'Inbound Share Transfer';
      case 'mint':
        return 'Token Issuance Mint';
      case 'transfer_out':
        return 'Outbound Transfer';
      default:
        return 'Onchain Activity';
    }
  };

  return (
    <div
      id="recent-activity-section"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-6 sm:p-7 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#F0EBE4]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#798596]">
              Ledger Audit
            </span>
            <Badge variant="neutral" size="sm">
              {transactions.length} Events
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#191F28] mt-1 font-sans">
            Recent Onchain Transactions
          </h2>
          <p className="text-xs text-[#798596] mt-0.5">
            Cryptographically finalized token transfers, primary mints, and broker settlements.
          </p>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div className="mt-4 divide-y divide-[#F4F0EB]">
          {transactions.map((tx) => (
            <div
              key={tx.signature}
              className="py-4 px-2 -mx-2 rounded-2xl hover:bg-[#FAF8F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left: Type & Asset */}
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DC] flex items-center justify-center shrink-0">
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#191F28]">
                      {getTypeLabel(tx.type)}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#FAF0EB] text-[#D26E46] font-semibold">
                      {tx.symbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#798596] mt-0.5 font-mono">
                    <span>{formatTime(tx.blockTime)}</span>
                    <span>•</span>
                    <span>Slot #{tx.slot.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right: Quantity, Confirmation & Explorer */}
              <div className="flex items-center justify-between sm:justify-end space-x-5 pl-13 sm:pl-0">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-semibold text-[#191F28] block font-mono">
                    +{tx.amount} {tx.symbol}
                  </span>
                  {tx.valueUsd ? (
                    <span className="text-[11px] text-[#798596] font-mono block">
                      ${tx.valueUsd.toLocaleString()} settled
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#798596] block">Quantity verified</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="success" size="sm">
                    {tx.status}
                  </Badge>

                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1.5 rounded-lg text-[#798596] hover:text-[#D26E46] hover:bg-[#FAF0EB] transition-colors"
                    title="View transaction on Solscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-[#798596]">
          <History className="w-8 h-8 mx-auto mb-2 text-[#E8E3DC]" />
          <p className="text-sm font-medium text-[#191F28]">
            No recent transaction events in query window
          </p>
          <p className="text-xs mt-1">
            Historical transfers or settlements have not occurred within the latest slot buffer.
          </p>
        </div>
      )}
    </div>
  );
};
