/**
 * Onfolio — Reusable Verification Status Badge
 *
 * Displays the 5 authoritative verification states:
 * - Verified ("Verified on Solana")
 * - Unable to verify
 * - Data unavailable
 * - Stale verification
 * - Unsupported asset
 *
 * Does not show "verified" simply because data exists.
 */

import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { VerificationState } from '../../types/verification';

interface VerificationBadgeProps {
  state: VerificationState;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
  showIconOnlyOnMobile?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  state,
  size = 'md',
  interactive = false,
  onClick,
  showIconOnlyOnMobile = false,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'verified':
        return {
          label: 'Verified on Solana',
          shortLabel: 'Verified',
          icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bgStyle: 'bg-[#EBF5F0] text-[#2A7954] border-[#B7DFCE]',
          dotColor: 'bg-[#2A7954]',
        };
      case 'unable_to_verify':
        return {
          label: 'Unable to verify',
          shortLabel: 'Unverified',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bgStyle: 'bg-[#FAF0EB] text-[#D26E46] border-[#F1D8CB]',
          dotColor: 'bg-[#D26E46]',
        };
      case 'data_unavailable':
        return {
          label: 'Data unavailable',
          shortLabel: 'Unavailable',
          icon: <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bgStyle: 'bg-[#F4F0EB] text-[#798596] border-[#E8E3DC]',
          dotColor: 'bg-[#798596]',
        };
      case 'stale_verification':
        return {
          label: 'Stale verification',
          shortLabel: 'Stale',
          icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bgStyle: 'bg-[#FEF8E7] text-[#B87002] border-[#FCE6B5]',
          dotColor: 'bg-[#B87002]',
        };
      case 'unsupported_asset':
        return {
          label: 'Unsupported asset',
          shortLabel: 'Unsupported',
          icon: <Ban className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          bgStyle: 'bg-[#FEECEC] text-[#C13B2E] border-[#F9C3BE]',
          dotColor: 'bg-[#C13B2E]',
        };
      default:
        return {
          label: 'Unable to verify',
          shortLabel: 'Unverified',
          icon: <HelpCircle className="w-3 h-3" />,
          bgStyle: 'bg-[#F4F0EB] text-[#798596] border-[#E8E3DC]',
          dotColor: 'bg-[#798596]',
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs sm:text-sm gap-2 font-bold'
      : 'px-2.5 py-1 text-xs gap-1.5';

  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={`inline-flex items-center font-medium font-sans rounded-full border transition-all ${config.bgStyle} ${sizeClasses} ${
        interactive
          ? 'cursor-pointer hover:brightness-95 active:scale-98 shadow-2xs'
          : ''
      } ${className}`}
      title={interactive ? `Click to inspect evidence: ${config.label}` : config.label}
    >
      <span className="shrink-0">{config.icon}</span>
      <span className={showIconOnlyOnMobile ? 'hidden sm:inline whitespace-nowrap' : 'whitespace-nowrap'}>
        {config.label}
      </span>
      {showIconOnlyOnMobile && (
        <span className="inline sm:hidden whitespace-nowrap">{config.shortLabel}</span>
      )}
      {interactive && (
        <span className="opacity-60 text-[10px] ml-0.5 hidden sm:inline">Inspect →</span>
      )}
    </Component>
  );
};
