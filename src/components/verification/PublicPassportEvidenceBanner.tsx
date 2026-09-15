/**
 * Onfolio — Public Passport Evidence Banner
 *
 * Mandate:
 * "PUBLIC PASSPORT:
 *  A viewer should be able to understand which information is verified.
 *  Never imply that Onfolio guarantees ownership beyond what the underlying blockchain evidence actually demonstrates."
 */

import React from 'react';
import { ShieldCheck, Info, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Passport, Portfolio } from '../../types';

interface PublicPassportEvidenceBannerProps {
  passport: Passport;
  portfolio: Portfolio;
  onInspectEvidence?: () => void;
}

export const PublicPassportEvidenceBanner: React.FC<PublicPassportEvidenceBannerProps> = ({
  passport,
  portfolio,
  onInspectEvidence,
}) => {
  const isMock = portfolio.isMockData;

  return (
    <div
      id="public-passport-evidence-banner"
      className="bg-white rounded-3xl border border-[#E8E3DC] p-5 sm:p-6 shadow-2xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-2xl border ${
              isMock
                ? 'bg-[#FAF0EB] text-[#D26E46] border-[#F1D8CB]'
                : 'bg-[#EBF5F0] text-[#2A7954] border-[#B7DFCE]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#798596] font-bold">
                PUBLIC VERIFICATION TRANSPARENCY
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                  isMock
                    ? 'bg-[#FAF0EB] text-[#D26E46] border-[#F1D8CB]'
                    : 'bg-[#EBF5F0] text-[#2A7954] border-[#B7DFCE]'
                }`}
              >
                {isMock ? 'DEMO SANDBOX PROFILE' : 'VERIFIED ON SOLANA'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#191F28] mt-0.5">
              What evidence supports this passport?
            </h3>
          </div>
        </div>

        {onInspectEvidence && (
          <button
            onClick={onInspectEvidence}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#191F28] hover:bg-[#2A3542] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Inspect All Evidence</span>
            <ExternalLink className="w-3 h-3 text-[#D26E46]" />
          </button>
        )}
      </div>

      {/* Differentiating Verified Claims vs Limits of Blockchain Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#2A7954] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Cryptographically Verified</span>
          </div>
          <p className="text-[#4A5361] text-[11px] leading-relaxed">
            All <strong>{passport.holdingCount} equity holdings</strong> are confirmed by direct public SPL Token account ledger queries matching the registered Solana mints.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#4A5361] font-bold">
            <Info className="w-3.5 h-3.5 text-[#D26E46] shrink-0" />
            <span>Read-Only Ingestion</span>
          </div>
          <p className="text-[#4A5361] text-[11px] leading-relaxed">
            Verification is completed without private key access or transaction approval. Only non-sensitive public blockchain state is exposed.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#798596] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B87002] shrink-0" />
            <span>Evidence Boundary</span>
          </div>
          <p className="text-[#798596] text-[11px] leading-relaxed">
            Onfolio proves token possession on Solana; it does not guarantee off-chain beneficial ownership or depository legal solvency beyond ledger and issuer filings.
          </p>
        </div>
      </div>
    </div>
  );
};
