/**
 * Onfolio — Onchain Investment Passport for Tokenized Equities on Solana
 * Core Type Definitions & Interfaces
 */

import { PrivacyControlsConfig } from './privacy';

export type WalletEntryMethod = 'connected' | 'scanned';

export type ScannerState =
  | 'idle'
  | 'validating'
  | 'scanning'
  | 'success'
  | 'invalid address'
  | 'network error'
  | 'unsupported address'
  | 'no supported assets'
  | 'partial data';

export type WalletSourceType = 'solana_connected' | 'solana_address' | 'brokerage_future' | 'evm_future';
export type SupportedChain = 'solana' | 'ethereum_future' | 'brokerage_future';

export interface DiscoveredWallet {
  /** Unique account identity */
  id: string;
  /** Public base58 encoded Solana address */
  address: string;
  /** How this wallet was ingested: connected via extension vs scanned read-only */
  entryMethod: WalletEntryMethod;
  /** Name of the connector or ingestion method (e.g. 'Phantom', 'Solflare', 'Backpack', 'Public Ledger Scan') */
  connectorName: string;
  /** Custom user or default label (e.g., 'Primary', 'Trading', 'Cold Storage') */
  label: string;
  /** ISO timestamp of discovery */
  addedAt: string;
  /** Whether this is currently the primary identity in the multi-wallet passport */
  isPrimary: boolean;
  /** Source classification for future multi-ledger/brokerage compatibility */
  sourceType?: WalletSourceType;
  /** Chain classification */
  chain?: SupportedChain;
  /** Summary of recognized holdings if available */
  portfolioSummary?: {
    verifiedValueUsd: number;
    holdingCount: number;
    tier: string;
  };
}

export interface Wallet {
  /** Public base58 encoded Solana address */
  address: string;
  /** Whether the wallet is actively connected via browser extension */
  connected: boolean;
  /** Explicit entry method distinction */
  entryMethod: WalletEntryMethod;
  /** Name of detected or connected provider ('Phantom' | 'Solflare' | 'Backpack' | 'Public Ledger Scan') */
  connectorName: string;
  /** Human-friendly label (e.g., 'Phantom (Main)', 'Scanned Address') */
  label?: string;
  /** True if this is purely a read-only scanned address (no wallet extension connected) */
  isReadOnlyScan: boolean;
  /** Available installed providers detected in window */
  detectedProviders: Array<{
    id: string;
    name: string;
    icon?: string;
    isInstalled: boolean;
  }>;
}

export type AssetType = 'equity' | 'etf' | 'bond' | 'index' | 'commodity' | 'crypto';

export interface Asset {
  /** Solana SPL Token Mint Address (Base58) */
  mint: string;
  /** Display name of the asset */
  name: string;
  /** Token ticker symbol (e.g., 'dAAPL', 'bTSLA') */
  symbol: string;
  /** Token decimal precision */
  decimals: number;
  /** Token logo or icon URL */
  logoUrl?: string;
  /** Category of financial asset */
  type: AssetType;
}

export type CollateralModel =
  | '1:1 Backed Shares'
  | 'Direct Beneficial Ownership'
  | 'Depository Trust Company (DTC) Custody'
  | 'Synthetic Over-Collateralized';

export type AssetVerificationStatus =
  | 'verified'
  | 'supported'
  | 'unknown'
  | 'unsupported'
  | 'stale metadata';

export interface PriceSourceInfo {
  provider: string;
  feedId?: string;
  indicativePriceUsd: number;
  lastUpdated: string;
  quoteCurrency: 'USD';
  latencySeconds?: number;
  confidenceScore?: number;
}

export interface ExplorerReference {
  solscanUrl: string;
  solanaFmUrl: string;
  explorerSolanaUrl: string;
}

export interface ConsolidatedUnderlyingHolding {
  underlying: {
    ticker: string;
    companyName: string;
    sector: string;
    isin: string;
    primaryExchange: string;
    description: string;
    marketPriceUsd: number;
    change24h: number;
    priceSource: PriceSourceInfo;
    lastUpdated: string;
    tokenizedRepresentations: string[];
  };
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
    walletAddress?: string;
    walletLabel?: string;
  }>;
  issuers: string[];
}

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

export interface TokenizedEquity extends Asset {
  /** Underlying stock market ticker (e.g., 'AAPL', 'NVDA', 'TSLA', 'SPY', 'MSFT') */
  underlyingTicker: string;
  /** Full corporate name of the underlying company */
  companyName: string;
  /** Primary equity issuer onchain (e.g., 'Dinari', 'Backed Finance', 'xStocks', 'Ondo', 'Securitize') */
  issuer: string;
  /** Governing regulatory framework & legal jurisdiction */
  regulatoryFramework: string;
  /** Custodian institution holding the underlying traditional shares */
  custodian: string;
  /** Legal backing & collateralization structure */
  collateralization: CollateralModel;
  /** Direct link to public prospectus or legal disclosure document */
  prospectusUrl?: string;
  /** International Securities Identification Number (ISIN) if assigned */
  isin?: string;
  /** Sector classification */
  sector: string;
  /** Current indicative market price per share in USD */
  marketPriceUsd: number;
  /** 24h percentage change */
  change24h: number;
  /** Whether this token uses the Solana Token-2022 standard or classic SPL Token */
  isToken2022?: boolean;
}

export type PricingFreshnessStatus = 'live' | 'delayed' | 'estimated';

export interface PricingFreshness {
  /** Pricing status indicator */
  status: PricingFreshnessStatus;
  /** Label describing pricing mode, e.g. "Market-Hours Delayed (15m)" */
  label: string;
  /** Delay in minutes */
  delayMinutes: number;
  /** Pricing source attribution, e.g. "Onfolio Financial Engine / SEC Filings Feed" */
  provider: string;
  /** Timestamp when price was quoted */
  lastUpdated: string;
  /** Whether current data is considered stale */
  isStale: boolean;
  /** Warning message if data is stale */
  staleMessage?: string;
  /** Disclaimer clarifying non-realtime nature */
  pricingDisclaimer: string;
}

export type CostBasisStatus = 'determined' | 'estimated_24h' | 'unavailable';

export interface HoldingPerformance {
  /** 24h market price dollar change */
  change24hUsd: number;
  /** 24h market percentage change */
  change24hPercent: number;
  /** Reliably determined historical acquisition cost basis, if onchain transfer data exists */
  costBasisUsd?: number;
  /** Cost basis per share if determinable */
  costBasisPerShare?: number;
  /** Unrealized gain/loss in USD if cost basis is determinable */
  unrealizedGainLossUsd?: number;
  /** Unrealized gain/loss percentage if cost basis is determinable */
  unrealizedGainLossPercent?: number;
  /** Status of cost basis calculation */
  costBasisStatus: CostBasisStatus;
  /** Clear human-readable performance label */
  performanceLabel: string;
  /** Explanatory note respecting audit rule: never invent cost basis */
  performanceDisclaimer: string;
}

export interface PortfolioPerformance {
  /** Net portfolio change over 24h in USD */
  performance24hUsd: number;
  /** Net portfolio change over 24h in percentage */
  performance24hPercent: number;
  /** Cost basis status for the aggregate portfolio */
  costBasisStatus: CostBasisStatus;
  /** Total cost basis in USD if determinable */
  totalCostBasisUsd?: number;
  /** Unrealized net gain/loss if determinable */
  unrealizedGainLossUsd?: number;
  /** Unrealized net gain/loss percentage if determinable */
  unrealizedGainLossPercent?: number;
  /** Ticker of top 24h gainer */
  topGainerTicker?: string;
  /** Top gainer percentage */
  topGainerPercent?: number;
  /** Performance note explaining 24h calculation vs historical acquisition */
  disclaimer: string;
}

export interface PortfolioMilestone {
  id: string;
  title: string;
  category: 'tier' | 'diversification' | 'holding' | 'compliance';
  achieved: boolean;
  achievedAt?: string;
  description: string;
  evidence?: string;
}

export interface HoldingHistoryItem {
  mint: string;
  ticker: string;
  companyName: string;
  firstAcquiredDate?: string;
  estimatedHoldingDays: number;
  transactionCount: number;
  activityStatus: 'active_holding' | 'recent_settlement';
}

export interface PortfolioSectorAllocation {
  sector: string;
  valueUsd: number;
  percentage: number;
  assetCount: number;
}

export interface Holding {
  /** Tokenized equity asset specification */
  asset: TokenizedEquity;
  /** Raw balance as returned from Solana RPC */
  rawBalance: string;
  /** Normalized token balance accounting for decimals */
  amount: number;
  /** Current aggregate USD valuation of this holding */
  valueUsd: number;
  /** Percentage of the total tokenized equity portfolio (0 - 100) */
  allocationPercentage: number;
  /** Calculated performance metrics (24h delta, cost basis where reliable) */
  performance?: HoldingPerformance;
  /** Date/time when first tokens were acquired in this account */
  firstAcquiredAt?: string;
  /** Specific associated token account address (ATA) on Solana */
  tokenAccountAddress: string;
  /** Token standard indicator */
  isToken2022: boolean;
  /** Wallet address where this holding resides */
  walletAddress?: string;
  /** User-defined wallet label where this holding resides (e.g. 'Primary', 'Trading', 'Cold Storage') */
  walletLabel?: string;
}

export interface Transaction {
  /** Solana transaction signature (Base58) */
  signature: string;
  /** Solana ledger slot height */
  slot: number;
  /** Unix timestamp in seconds */
  blockTime: number;
  /** Transaction category */
  type: 'mint' | 'transfer_in' | 'transfer_out' | 'settlement';
  /** SPL Token mint involved */
  mint: string;
  /** Asset symbol */
  symbol: string;
  /** Token quantity moved */
  amount: number;
  /** Approximate USD value at transaction time or current valuation */
  valueUsd?: number;
  /** Transaction confirmation tier */
  status: 'confirmed' | 'finalized';
  /** Counterparty Solana address if applicable */
  counterparty?: string;
}

export interface IssuerConcentration {
  issuerName: string;
  valueUsd: number;
  percentage: number;
  assetCount: number;
}

export interface Portfolio {
  /** Primary scanned or connected wallet address */
  walletAddress: string;
  /** Total count of verified wallets contributing to this portfolio */
  walletCount?: number;
  /** Summary of contributing wallets across this unified portfolio */
  contributingWallets?: Array<{
    id: string;
    address: string;
    label: string;
    entryMethod: WalletEntryMethod;
    connectorName: string;
    isPrimary: boolean;
    holdingCount: number;
    valueUsd: number;
  }>;
  /** Verified tokenized equity holdings found */
  holdings: Holding[];
  /** Consolidated holdings grouped by underlying security */
  consolidatedHoldings: ConsolidatedUnderlyingHolding[];
  /** Unknown / unrecognized / unsupported tokens found in wallet (visible, never falsely classified) */
  unknownTokens: UnknownTokenHolding[];
  /** Total calculated USD value of verified tokenized equities */
  totalValueUsd: number;
  /** Total quantity of shares held across all verified equities */
  totalSharesCount: number;
  /** Count of distinct verified tokenized equity assets */
  totalAssetsCount: number;
  /** Non-equity SPL tokens found in wallet (not counted toward passport) */
  unrecognizedTokensCount: number;
  /** Native SOL balance in lamports normalized */
  solBalance: number;
  /** SOL balance converted to USD */
  solBalanceUsd: number;
  /** Combined portfolio worth (Verified Equities + SOL Reserve) */
  totalNetWorthUsd: number;
  /** Aggregate portfolio performance (24h market delta, cost basis disclosures) */
  performance: PortfolioPerformance;
  /** Pricing freshness information (live vs delayed vs estimated) */
  pricingFreshness: PricingFreshness;
  /** Breakdown by economic sector */
  sectorAllocation: PortfolioSectorAllocation[];
  /** Portfolio milestone achievements */
  milestones: PortfolioMilestone[];
  /** Holding history timeline & acquisition cadence */
  holdingHistory: HoldingHistoryItem[];
  /** Normalized recent transaction activity */
  recentTransactions: Transaction[];
  /** Diversification index (0 - 100 based on Herfindahl-Hirschman index across assets & issuers) */
  diversificationIndex: number;
  /** Breakdown by equity token issuer */
  issuersBreakdown: Record<string, IssuerConcentration>;
  /** Highest single equity allocation ticker */
  topAllocationTicker: string;
  /** Timestamp of last calculation / scan */
  updatedAt: string;
  /** Explicit flag: true if produced by dev adapter sandbox, false if live Solana RPC */
  isMockData: boolean;
  /** Source attribution string */
  dataSource: string;
}

export type PassportTier =
  | 'Sovereign'           // $250k+ or exceptional institutional diversification
  | 'Institutional Prime' // $50k - $250k
  | 'Accredited Tier'     // $10k - $50k
  | 'Verified Holder'     // $1k - $10k
  | 'Pioneer'             // < $1k active tokenized equity holder
  | 'Observer';           // Scanned address with 0 tokenized equities

export interface Passport {
  /** Unique deterministic credential ID: ONF-SOL-[shortAddress]-[checksum] */
  passportId: string;
  /** Onfolio human-readable Profile Handle, e.g. @allocator-8x9p */
  profileHandle: string;
  /** Complete Onfolio Profile Identifier, e.g. onfolio.id/@allocator-8x9p */
  profileIdentifier: string;
  /** Solana wallet address owner of the passport */
  walletAddress: string;
  /** Passport tier achieved based on verified onchain holdings */
  tier: PassportTier;
  /** Human-readable title corresponding to tier (e.g. 'Sovereign Onchain Allocator') */
  title: string;
  /** Onchain Score (0 - 100) derived from verified equity depth, issuer diversity, and balance consistency */
  onchainScore: number;
  /** ISO Date string of passport generation */
  issuanceDate: string;
  /** Recommended validity re-check date */
  validUntil: string;
  /** Number of verified wallets contributing to this passport */
  walletCount?: number;
  /** Summary of contributing wallets (kept private / for owner inspection) */
  contributingWalletsSummary?: Array<{
    id: string;
    label: string;
    shortAddress: string;
    holdingCount: number;
    valueUsd: number;
  }>;
  /** Number of distinct tokenized equities verified */
  holdingCount: number;
  /** Total number of supported tokenized securities in the Onfolio registry */
  supportedAssetsTotal: number;
  /** Total verified tokenized equity balance in USD */
  verifiedEquityValueUsd: number;
  /** List of verified issuers represented in portfolio */
  primaryIssuers: string[];
  /** Underlying stock tickers represented (e.g. ['AAPL', 'NVDA', 'SPY']) */
  underlyingEquities: string[];
  /** Applicable regulatory jurisdictions verified across holdings */
  jurisdictionCompliance: string[];
  /** Passport operational status */
  status: 'ACTIVE' | 'PENDING_SCAN' | 'EMPTY_PORTFOLIO';
  /** Deterministic 8-char security checksum */
  checksum: string;
  /** Explicit flag: true ONLY if verified against live Solana Mainnet RPC */
  isVerifiedOnchain: boolean;
  /** Configured verification data source label */
  verificationDataSource: string;
  /** Earliest discovered tokenized equity position onchain */
  firstDiscoveredAsset?: {
    ticker: string;
    companyName: string;
    date?: string;
    mint: string;
  };
  /** Longest-held supported tokenized asset in wallet */
  longestHeldAsset?: {
    ticker: string;
    companyName: string;
    daysHeld: number;
    acquiredDate?: string;
    mint: string;
  };
  /** Significant capital milestone achieved (e.g. $10k+ Accredited Scale) */
  portfolioValueMilestone?: {
    label: string;
    achievedValueUsd: number;
    date?: string;
  };
  /** Clear partition for self-reported or unverified parameters (e.g., custom user nicknames, unindexed claims) */
  selfReportedData: Array<{
    label: string;
    value: string;
    reason: string;
  }>;
  /** Cryptographic proof summary for immediate inspection */
  evidenceSummary: {
    solanaSlot?: number;
    sha256Hash: string;
    verifiedHoldingsCount: number;
    transferAgentJurisdictions: string[];
    tokenStandards: string[];
    custodyModel: string;
  };
}

export interface VerificationRecord {
  /** Unique verification record identifier */
  recordId: string;
  /** Target Passport ID */
  passportId: string;
  /** Verified Solana wallet address */
  walletAddress: string;
  /** Timestamp of verification */
  verifiedAt: string;
  /** Cryptographic SHA-256 digest of normalized portfolio state */
  dataHash: string;
  /** Solana ledger slot at time of scan */
  solanaBlockSlot?: number;
  /** Provider used ('Solana Mainnet-Beta RPC' or 'Onfolio Sandbox Adapter') */
  providerName: string;
  /** Verification method code */
  verificationMethod: 'SOLANA_MAINNET_RPC' | 'RPC_SNAPSHOT_PROOF' | 'DEV_SANDBOX_ADAPTER';
  /** Whether the underlying data was retrieved from live blockchain */
  isVerifiableOnchain: boolean;
  /** W3C-compatible credential claims preview */
  credentialSummary: {
    issuer: string;
    subject: string;
    verifiedEquityValueUsd: number;
    tier: string;
    tokenCount: number;
  };
}

export type PrivacyMode = 'public' | 'masked_balances' | 'anonymous_pass';

export interface UserPreferences {
  /** Privacy masking preference */
  privacyMode: PrivacyMode;
  /** Granular selective disclosure controls */
  privacyControls?: PrivacyControlsConfig;
  /** Preferred display fiat / currency */
  selectedCurrency: 'USD' | 'EUR' | 'SOL';
  /** Custom RPC endpoint URL override */
  rpcEndpoint: string;
  /** Force dev adapter mode for offline / testnet experimentation */
  useDevAdapter: boolean;
  /** Enable export and share link generation */
  allowSharing: boolean;
}
