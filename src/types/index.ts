/**
 * Onfolio — Onchain Investment Passport for Tokenized Equities on Solana
 * Core Type Definitions & Interfaces
 */

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

export interface DiscoveredWallet {
  /** Unique account identity */
  id: string;
  /** Public base58 encoded Solana address */
  address: string;
  /** How this wallet was ingested: connected via extension vs scanned read-only */
  entryMethod: WalletEntryMethod;
  /** Name of the connector or ingestion method (e.g. 'Phantom', 'Solflare', 'Backpack', 'Public Ledger Scan') */
  connectorName: string;
  /** Custom user or default label */
  label: string;
  /** ISO timestamp of discovery */
  addedAt: string;
  /** Whether this is currently active in the primary view */
  isPrimary: boolean;
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
  /** Date/time when first tokens were acquired in this account */
  firstAcquiredAt?: string;
  /** Specific associated token account address (ATA) on Solana */
  tokenAccountAddress: string;
  /** Token standard indicator */
  isToken2022: boolean;
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
  /** Scanned or connected wallet address */
  walletAddress: string;
  /** Verified tokenized equity holdings found */
  holdings: Holding[];
  /** Total calculated USD value of verified tokenized equities */
  totalValueUsd: number;
  /** Count of distinct verified tokenized equity assets */
  totalAssetsCount: number;
  /** Non-equity SPL tokens found in wallet (not counted toward passport) */
  unrecognizedTokensCount: number;
  /** Native SOL balance in lamports normalized */
  solBalance: number;
  /** SOL balance converted to USD */
  solBalanceUsd: number;
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
  /** Number of distinct tokenized equities verified */
  holdingCount: number;
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
  /** Preferred display fiat / currency */
  selectedCurrency: 'USD' | 'EUR' | 'SOL';
  /** Custom RPC endpoint URL override */
  rpcEndpoint: string;
  /** Force dev adapter mode for offline / testnet experimentation */
  useDevAdapter: boolean;
  /** Enable export and share link generation */
  allowSharing: boolean;
}
