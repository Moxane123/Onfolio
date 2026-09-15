/**
 * Onfolio — Application Footer
 * Restrained financial disclaimers and regulatory compliance information.
 */

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { OnfolioLogoMark } from '../brand/OnfolioLogo';

export const Footer: React.FC = () => {
  return (
    <footer id="onfolio-footer" className="mt-20 border-t border-[#E8E3DC] bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#798596] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <OnfolioLogoMark size={22} color="#D26E46" />
            <span className="font-bold text-[#191F28]">Onfolio Protocol</span>
            <span className="text-[#E8E3DC]">|</span>
            <span>Onchain Investment Passport for Tokenized Equities</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="inline-flex items-center text-[#2A7954] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Non-Custodial
            </span>
            <span className="inline-flex items-center text-[#4A5361]">
              Read-Only Ledger Indexing
            </span>
            <span className="inline-flex items-center text-[#4A5361]">
              W3C VC Format
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0ECE5] text-[11px] leading-relaxed text-[#798596]">
          <p>
            <strong className="text-[#4A5361]">Regulatory &amp; Security Notice:</strong> Onfolio is an
            independent verification protocol and public ledger indexer. Onfolio is not a broker,
            dealer, custodian, DEX, investment adviser, or exchange. Onfolio does not execute trades,
            facilitate asset transfers, custody user balances, or request transaction signatures. All
            passports, tiers, and verification records are computed deterministically from public
            Solana ledger state. Tokenized equities listed are issued by independent regulated
            entities (such as Dinari Inc. and Backed Finance AG) under their respective regulatory
            frameworks.
          </p>
        </div>
      </div>
    </footer>
  );
};
