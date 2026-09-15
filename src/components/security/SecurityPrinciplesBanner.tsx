/**
 * Onfolio — Security Principles Banner
 * Transparent, non-custodial fintech principles presented clearly without fear-mongering or jargon.
 */

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, Lock } from 'lucide-react';

export const SecurityPrinciplesBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      id="security-principles-card"
      className="bg-[#FAF0EB] border border-[#F1D8CB] rounded-2xl p-4 sm:p-5 mb-8 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 bg-white rounded-xl text-[#D26E46] border border-[#F1D8CB] shadow-2xs mt-0.5 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-[#191F28] tracking-tight">
                Non-Custodial &amp; Read-Only Architecture
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#D26E46] border border-[#F1D8CB] font-semibold">
                Zero Signatures Required
              </span>
            </div>
            <p className="text-xs text-[#4A5361] mt-1 leading-relaxed">
              Onfolio only reads public Solana ledger data. Connecting a wallet merely resolves your
              public address. We never ask for private keys, seed phrases, or transaction signatures.
            </p>
          </div>
        </div>

        <button
          id="toggle-security-principles-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-[#D26E46] hover:text-[#BF5D35] flex items-center space-x-1 pl-2 shrink-0 py-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Hide' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#F1D8CB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[#4A5361]">
          <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-xl border border-[#F1D8CB]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2A7954] mt-0.5 shrink-0" />
            <span>
              <strong className="text-[#191F28] block font-semibold">Zero Fund Custody</strong>
              Onfolio never holds, routes, or handles funds.
            </span>
          </div>
          <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-xl border border-[#F1D8CB]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2A7954] mt-0.5 shrink-0" />
            <span>
              <strong className="text-[#191F28] block font-semibold">No Private Keys</strong>
              Seed phrases are never requested or stored.
            </span>
          </div>
          <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-xl border border-[#F1D8CB]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2A7954] mt-0.5 shrink-0" />
            <span>
              <strong className="text-[#191F28] block font-semibold">Public Data Only</strong>
              Addresses are public blockchain identifiers.
            </span>
          </div>
          <div className="flex items-start space-x-2 bg-white/70 p-2.5 rounded-xl border border-[#F1D8CB]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2A7954] mt-0.5 shrink-0" />
            <span>
              <strong className="text-[#191F28] block font-semibold">No Approvals</strong>
              No token approvals or permissions are triggered.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
