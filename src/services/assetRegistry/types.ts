/**
 * Onfolio — Asset Intelligence Layer: Type Definitions
 *
 * Core architectural model for translating raw Solana token mints into
 * verified, understandable real-world financial assets.
 *
 * HIERARCHY:
 * UNDERLYING SECURITY
 *   ↓
 * TOKENIZED REPRESENTATION
 *   ↓
 * REGULATED ISSUER
 *   ↓
 * SOLANA MINT
 */

import { AssetType, CollateralModel } from '../../types';

/**
 * Clean internal asset verification status model
 */
export type AssetVerificationStatus =
  | 'verified'        // Authoritatively verified with confirmed legal custodian & 1:1 backing
  | 'supported'       // Registered and active in Onfolio calculation & valuation engine
  | 'unknown'         // Token in wallet NOT found in Onfolio Registry (NEVER falsely classified)
  | 'unsupported'     // Registered or detected asset that is decommissioned or not eligible for passport
  | 'stale metadata'; // Registered asset whose price or legal attestation is pending refresh

/**
 * Regulated Legal Issuer Information
 */
export interface RegulatedIssuer {
  id: string;
  name: string; // e.g. 'Dinari Inc.', 'Backed Finance AG'
  legalEntity: string;
  jurisdiction: string; // e.g. 'United States (Delaware)', 'Switzerland (Zug)'
  regulatoryFramework: string; // e.g. 'US SEC Registered Transfer Agent (Form TA-1)'
  regulator: string; // e.g. 'US Securities and Exchange Commission (SEC)', 'FINMA'
  custodian: string; // e.g. 'DriveWealth LLC (SEC / FINRA / SIPC Member)'
  collateralModel: CollateralModel; // e.g. '1:1 Backed Shares'
  website: string;
}

/**
 * Cryptographic & Financial Price Source
 */
export interface PriceSourceInfo {
  provider: string; // e.g. 'Pyth Network / CTA Consolidated Feed', 'Nasdaq Official Close', 'Chainlink RWA Feed'
  feedId?: string;
  indicativePriceUsd: number;
  lastUpdated: string;
  quoteCurrency: 'USD';
  latencySeconds?: number;
  confidenceScore?: number; // e.g. 0.99
}

/**
 * Public Block Explorer References
 */
export interface ExplorerReference {
  solscanUrl: string;
  solanaFmUrl: string;
  explorerSolanaUrl: string;
}

/**
 * Underlying Security / Corporate Company Model
 * (e.g. Apple Inc. AAPL, NVIDIA Corp NVDA, Tesla Inc TSLA)
 */
export interface UnderlyingSecurity {
  ticker: string; // e.g. 'AAPL'
  companyName: string; // e.g. 'Apple Inc.'
  sector: string; // e.g. 'Consumer Technology & Software'
  isin: string; // e.g. 'US0378331005'
  cusip?: string;
  primaryExchange: string; // e.g. 'NASDAQ'
  description: string;
  marketPriceUsd: number;
  change24h: number;
  priceSource: PriceSourceInfo;
  lastUpdated: string;
  /** All verified tokenized representations mints of this security */
  tokenizedRepresentations: string[];
}

/**
 * Tokenized Representation of an Underlying Asset
 * Detailed structured record in the Onfolio Asset Registry.
 */
export interface TokenizedAssetRecord {
  /** Solana SPL / Token-2022 Mint Address */
  mint: string;
  /** Foreign key to UnderlyingSecurity */
  underlyingTicker: string;
  /** Security company name */
  companyName: string;
  /** Full token display name */
  name: string;
  /** Token market symbol */
  symbol: string;
  /** Blockchain network */
  chain: 'solana';
  /** Decimal precision */
  decimals: number;
  /** Financial asset class */
  assetType: AssetType;
  /** Issuer details */
  issuer: RegulatedIssuer;
  /** Legal backing structure */
  collateralization: CollateralModel;
  /** Qualified custodian institution */
  custodian: string;
  /** Applicable legal jurisdiction and framework */
  regulatoryFramework: string;
  /** Link to audited prospectus / transparency sheet */
  prospectusUrl?: string;
  /** International Securities Identification Number */
  isin?: string;
  /** Economic sector */
  sector: string;
  /** Indicative share price */
  marketPriceUsd: number;
  /** 24h market price change percentage */
  change24h: number;
  /** Uses Solana Token-2022 extensions */
  isToken2022: boolean;
  /** Authoritative price feed reference */
  priceSource: PriceSourceInfo;
  /** Solana explorer deep-links */
  explorerReference: ExplorerReference;
  /** Internal verification status */
  verificationStatus: AssetVerificationStatus;
  /** Timestamp when this registry record was last confirmed */
  lastUpdated: string;
  /** Audit trail / verification notes */
  verificationNotes: string;
  /** Metadata extensions */
  metadata?: {
    logoUrl?: string;
    transferAgentRegistration?: string;
    tokenStandard: string;
    auditReportUrl?: string;
  };
}

/**
 * Consolidated Underlying Holding:
 * When a user holds multiple tokenized representations of the same underlying
 * (e.g. both Dinari dAAPL and Backed bAAPL), this model consolidates them
 * for high-level portfolio analysis while preserving individual token identities.
 */
export interface ConsolidatedUnderlyingHolding {
  underlying: UnderlyingSecurity;
  totalAmount: number;
  totalValueUsd: number;
  allocationPercentage: number;
  representations: Array<{
    mint: string;
    tokenAccountAddress: string;
    symbol: string;
    name: string;
    issuerName: string;
    amount: number;
    valueUsd: number;
    isToken2022: boolean;
    verificationStatus: AssetVerificationStatus;
    prospectusUrl?: string;
    custodian: string;
  }>;
  issuers: string[];
}

/**
 * Unknown / Unrecognized Token Holding:
 * Preserves full visibility of unknown tokens in the wallet without
 * falsely classifying them as equities.
 */
export interface UnknownTokenHolding {
  mint: string;
  tokenAccountAddress: string;
  amount: number;
  rawBalance: string;
  decimals: number;
  symbol?: string;
  name?: string;
  isToken2022: boolean;
  status: 'unknown' | 'unsupported';
  isImpostorRisk: boolean;
  detectedTickerMatch?: string;
  rejectionReason: string;
}

/**
 * Asset Recognition Result from Registry
 */
export interface AssetRecognitionResult {
  status: AssetVerificationStatus;
  isRecognized: boolean;
  asset?: TokenizedAssetRecord;
  underlying?: UnderlyingSecurity;
  confidence: 'CRYPTOGRAPHIC_MINT_MATCH' | 'REJECTED_IMPOSTOR' | 'UNREGISTERED_MINT';
  reason: string;
  detectedTickerMatch?: string;
}

/**
 * High-level Asset Registry Statistics
 */
export interface RegistryStats {
  totalUnderlyingSecurities: number;
  totalTokenizedRepresentations: number;
  totalVerifiedIssuers: number;
  token2022Count: number;
  lastRegistryUpdate: string;
}
