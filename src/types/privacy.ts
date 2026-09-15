/**
 * Onfolio — Privacy, Selective Disclosure & Sharing Types
 *
 * Core Principle: "Proof without unnecessary exposure."
 *
 * The user owns their passport visibility.
 * Three Access Tiers:
 * - PRIVATE: Only the user can view the full passport.
 * - PUBLIC: Anyone with the public link can view permitted items.
 * - SHARED VIEW: Granular, limited presentation shared with specific parties (e.g. lenders, employers, auditors).
 *
 * Controls use clear human language:
 * - "Show my portfolio value"
 * - "Show my holdings" (or select specific holdings to disclose)
 * - "Hide my wallet address"
 * - "Show my investment history"
 * - "Show my performance"
 * - "Show my milestones"
 */

import { Passport, Portfolio, VerificationRecord } from './index';
import { HoldingVerificationEvidence } from './verification';

export type PassportAccessScope = 'private' | 'public' | 'shared_view';

export interface PrivacyControlsConfig {
  /** "Show my portfolio value" */
  showPortfolioValue: boolean;
  /** "Show my holdings" */
  showHoldings: boolean;
  /** Specific mints allowed to be visible if showHoldings is true (empty array = all holdings allowed) */
  selectedHoldingsMints: string[];
  /** "Hide my wallet address" */
  hideWalletAddress: boolean;
  /** "Show my performance" (24h change, unrealized gain/loss disclosures) */
  showPerformance: boolean;
  /** "Show my milestones" (tier achievements, accredited scale badges) */
  showMilestones: boolean;
  /** "Show my investment history" (acquisition dates, transaction counts) */
  showInvestmentHistory: boolean;
  /** "Show transaction history" (onchain settlements, signature list) */
  showTransactionHistory: boolean;
}

export interface SharedPassportProfile {
  /** Unique shareable public ID, e.g. onf-pass-8x9p-a71f */
  publicId: string;
  /** Owner's wallet address (or synthetic masked reference) */
  ownerWalletAddress: string;
  /** Access level intended */
  accessScope: PassportAccessScope;
  /** User-configured visibility settings */
  controls: PrivacyControlsConfig;
  /** When this share profile was created */
  createdAt: string;
  /** Optional expiry time in ISO format (e.g. 7 days, 30 days, or never) */
  expiresAt?: string;
  /** Optional custom title or audience tag (e.g., "Verification for AngelList Syndicate", "Proof of Assets") */
  audienceNote?: string;
  /** The sanitized passport payload adhering strictly to the privacy controls */
  sanitizedPassport: SanitizedPassportPayload;
  /** Verification evidence that proves claims without exposing private info */
  sanitizedEvidence: SanitizedEvidencePayload;
}

export interface SanitizedPassportPayload {
  passportId: string;
  publicId: string;
  profileIdentifier: string;
  tier: string;
  tierTitle: string;
  onchainScore: number;
  issuanceDate: string;
  validUntil: string;
  checksum: string;
  isVerifiedOnchain: boolean;
  verificationDataSource: string;

  /** Value is only disclosed if showPortfolioValue is true; otherwise undefined or masked */
  portfolioValueUsd?: number;
  isPortfolioValueDisclosed: boolean;

  /** Wallet address is fully masked or hidden if hideWalletAddress is true */
  isWalletAddressHidden: boolean;
  displayedWalletAddress: string;
  explorerUrl?: string;
  /** Multi-wallet aggregation count (e.g. 3 verified wallets) */
  walletCount?: number;
  isMultiWallet?: boolean;

  /** Holdings are filtered to user's selection and stripped of balances if showPortfolioValue is false */
  isHoldingsDisclosed: boolean;
  holdingsCount: number;
  disclosedHoldings: Array<{
    mint: string;
    ticker: string;
    companyName: string;
    issuerName: string;
    amount?: number;
    valueUsd?: number;
    allocationPercentage?: number;
    isToken2022: boolean;
    verificationStatus: string;
    collateralization: string;
    sector: string;
  }>;

  /** Performance details if enabled */
  isPerformanceDisclosed: boolean;
  performance?: {
    performance24hPercent: number;
    performance24hUsd?: number;
    topGainerTicker?: string;
    topGainerPercent?: number;
    disclaimer: string;
  };

  /** Milestones if enabled */
  isMilestonesDisclosed: boolean;
  milestones?: Array<{
    id: string;
    title: string;
    category: string;
    achieved: boolean;
    achievedAt?: string;
    description: string;
  }>;

  /** Investment history & tenure if enabled */
  isInvestmentHistoryDisclosed: boolean;
  investmentHistory?: Array<{
    ticker: string;
    companyName: string;
    firstAcquiredDate?: string;
    estimatedHoldingDays: number;
    activityStatus: string;
  }>;

  /** Recent transaction signatures if enabled */
  isTransactionHistoryDisclosed: boolean;
  transactionCount: number;
  recentTransactions?: Array<{
    signature: string;
    shortSignature: string;
    timestamp: string;
    type: string;
    status: string;
  }>;
}

export interface SanitizedEvidencePayload {
  sha256Hash: string;
  solanaBlockSlot?: number;
  verifiedAt: string;
  verificationMethod: string;
  isLiveOnchain: boolean;
  verifiedHoldingsCount: number;
  underlyingSecuritiesCount: number;
  depositoryJurisdictions: string[];
}
