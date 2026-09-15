import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ScannerState } from '../../types';

interface ScannerStateFeedbackProps {
  state: ScannerState;
  errorMessage: string | null;
  solBalance?: number;
  holdingCount?: number;
  verifiedValueUsd?: number;
  onRetry?: () => void;
  onLoadSample?: () => void;
}

export const ScannerStateFeedback: React.FC<ScannerStateFeedbackProps> = ({
  state,
  errorMessage,
  solBalance = 0,
  holdingCount = 0,
  verifiedValueUsd = 0,
  onRetry,
  onLoadSample,
}) => {
  if (state === 'idle') {
    return (
      <div
        id="scanner-state-idle"
        className="mt-4 p-3.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#5E6877]"
      >
        <div className="flex items-center space-x-2.5">
          <Info className="w-4 h-4 text-[#D26E46] shrink-0" />
          <span>
            <strong className="text-[#191F28] font-semibold">Read-Only Scanner:</strong> You can scan any public wallet without connecting it.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-mono text-[#798596]">
          Zero signatures • Public ledger observation
        </span>
      </div>
    );
  }

  if (state === 'validating') {
    return (
      <div
        id="scanner-state-validating"
        className="mt-4 p-3.5 bg-[#F0F5FA] border border-[#C5D7E8] rounded-2xl flex items-center space-x-3 text-xs text-[#1E4D7A] animate-in fade-in"
      >
        <Loader2 className="w-4 h-4 text-[#2E75B6] animate-spin shrink-0" />
        <div>
          <span className="font-semibold block">Validating Solana Public Key</span>
          <span className="text-[11px] opacity-85">
            Verifying Base58 encoding and cryptographic address format...
          </span>
        </div>
      </div>
    );
  }

  if (state === 'scanning') {
    return (
      <div
        id="scanner-state-scanning"
        className="mt-4 p-3.5 bg-[#FFF9F3] border border-[#F6DAC3] rounded-2xl flex items-center space-x-3 text-xs text-[#8A4522] animate-in fade-in"
      >
        <RefreshCw className="w-4 h-4 text-[#D26E46] animate-spin shrink-0" />
        <div>
          <span className="font-semibold block">Querying Solana Ledger</span>
          <span className="text-[11px] opacity-85">
            Ingesting SPL Token-2022 accounts, verifying tokenized equities, and computing passport...
          </span>
        </div>
      </div>
    );
  }

  if (state === 'invalid address') {
    return (
      <div
        id="scanner-state-invalid-address"
        className="mt-4 p-4 bg-[#FDF2F1] border border-[#F7C8C4] rounded-2xl flex items-start space-x-3 text-xs text-[#8F261B] animate-in fade-in"
      >
        <AlertCircle className="w-4 h-4 text-[#C13B2E] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold block text-sm text-[#8F261B]">Invalid Solana Address</span>
          <p className="text-xs text-[#A83226]">
            {errorMessage || 'Solana addresses must be a 32–44 character string encoded in Base58 (characters 0, O, I, and l are not permitted).'}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'unsupported address') {
    return (
      <div
        id="scanner-state-unsupported-address"
        className="mt-4 p-4 bg-[#FFF8E6] border border-[#F5DC96] rounded-2xl flex items-start space-x-3 text-xs text-[#7A5400] animate-in fade-in"
      >
        <ShieldAlert className="w-4 h-4 text-[#C98A00] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold block text-sm text-[#7A5400]">Unsupported Address Type</span>
          <p className="text-xs text-[#8F6608]">
            {errorMessage || 'This address is a Solana system program or native account, not a user equity wallet.'}
          </p>
          <p className="text-[11px] text-[#A6780C] pt-1">
            Please provide a standard user Solana wallet address holding SPL tokens.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'network error') {
    return (
      <div
        id="scanner-state-network-error"
        className="mt-4 p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-2xl flex items-start justify-between gap-3 text-xs text-[#912018] animate-in fade-in"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-[#D92D20] mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block text-sm text-[#912018]">Network or Ledger Error</span>
            <p className="text-xs text-[#B42318] mt-0.5">
              {errorMessage || 'Failed to reach the Solana RPC endpoint. The public cluster may be experiencing rate limits or CORS restrictions.'}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 bg-white border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#912018] font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (state === 'no supported assets') {
    return (
      <div
        id="scanner-state-no-supported-assets"
        className="mt-4 p-4 bg-[#F8F9FA] border border-[#DEE2E6] rounded-2xl flex items-start justify-between gap-4 text-xs text-[#495057] animate-in fade-in"
      >
        <div className="flex items-start space-x-3">
          <Info className="w-4 h-4 text-[#6C757D] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold block text-sm text-[#212529]">
              No Supported Tokenized Equities Found
            </span>
            <p className="text-xs text-[#495057] leading-relaxed">
              This address is active on Solana ({solBalance.toFixed(3)} SOL), but contains 0 registered tokenized equities from verified issuers (Backed, Dinari, Ondo, xStocks). An <strong>Observer Passport</strong> has been initialized.
            </p>
          </div>
        </div>

        {onLoadSample && (
          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-1.5 bg-white border border-[#CED4DA] hover:bg-[#E9ECEF] text-[#212529] font-semibold rounded-xl shrink-0 transition-colors cursor-pointer text-xs"
          >
            Load Sample Profile
          </button>
        )}
      </div>
    );
  }

  if (state === 'partial data') {
    return (
      <div
        id="scanner-state-partial-data"
        className="mt-4 p-4 bg-[#F4F5FB] border border-[#D2D6EF] rounded-2xl flex items-start space-x-3 text-xs text-[#2A3B8F] animate-in fade-in"
      >
        <Sparkles className="w-4 h-4 text-[#4355B9] mt-0.5 shrink-0" />
        <div>
          <span className="font-bold block text-sm text-[#1E2B68]">Partial Ledger Snapshot</span>
          <p className="text-xs text-[#2A3B8F] mt-0.5">
            Holdings were recognized, but some upstream RPC endpoints were rate-limited. Verified equity value: <strong>${verifiedValueUsd.toLocaleString()}</strong> ({holdingCount} assets).
          </p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div
        id="scanner-state-success"
        className="mt-4 p-3.5 bg-[#EEF7F2] border border-[#C8E5D7] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#1B603D] animate-in fade-in"
      >
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#2A7954] shrink-0" />
          <span>
            <strong className="font-semibold text-[#14472D]">Solana Passport Generated:</strong>{' '}
            Verified ${verifiedValueUsd.toLocaleString()} across {holdingCount} tokenized equity assets.
          </span>
        </div>
      </div>
    );
  }

  return null;
};
