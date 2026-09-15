/**
 * Onfolio — Verification System Types
 *
 * Exposes rigorous, evidence-based verification states and holding proof models.
 *
 * Rules:
 * 1. Do not show "verified" simply because data exists.
 * 2. Verification means the system has successfully connected the claim to a reliable blockchain source.
 * 3. Never imply that Onfolio guarantees ownership beyond what underlying blockchain evidence demonstrates.
 * 4. Verification is strictly read-only (no private key or signature required).
 */

export type VerificationState =
  | 'verified'          // Connected to live Solana blockchain source; mint and balance confirmed
  | 'unable_to_verify'  // Cannot establish authoritative link (e.g. sandbox mock, unknown source)
  | 'data_unavailable'  // Network error, RPC timeout, or ledger balance query failed
  | 'stale_verification'// Evidence was recorded earlier but exceeds freshness threshold (>24h)
  | 'unsupported_asset'; // Token exists in account but is unregistered or ineligible for passport

export interface RelevantTransactionEvidence {
  signature: string;
  shortSignature: string;
  slot: number;
  blockTime: number;
  dateString: string;
  type: string;
  amount: number;
  status: 'confirmed' | 'finalized';
  explorerUrl: string;
  memo?: string;
}

export interface HoldingVerificationEvidence {
  /** Verification state code */
  state: VerificationState;
  /** Human-readable state badge label */
  stateLabel: string;
  /** Detailed reason explaining the state */
  stateDescription: string;
  /** Read-only verification guarantee */
  isReadOnly: boolean;

  /** 1. Asset Details */
  asset: {
    ticker: string;
    companyName: string;
    tokenSymbol: string;
    tokenName: string;
    issuer: string;
    custodian: string;
    regulatoryFramework: string;
    collateralization: string;
    isin?: string;
    sector: string;
    prospectusUrl?: string;
  };

  /** 2. Wallet Details */
  wallet: {
    /** Full Solana base58 public address */
    fullAddress: string;
    /** Truncated address for normal UI to avoid exposing excessive wallet info */
    maskedAddress: string;
    /** Public block explorer url for the wallet */
    explorerUrl: string;
    /** Method of wallet ingestion (scanned public address vs connected) */
    entryMethod: string;
  };

  /** 3. Token Details */
  token: {
    /** Cryptographic Solana SPL / Token-2022 Mint address */
    mint: string;
    shortMint: string;
    /** Specific Associated Token Account (ATA) on Solana */
    tokenAccountAddress: string;
    shortTokenAccount: string;
    /** Token standard */
    standard: 'Solana Token-2022' | 'Classic SPL Token';
    decimals: number;
    rawBalance: string;
    verifiedAmount: number;
    indicativeValueUsd: number;
    pricePerShareUsd: number;
  };

  /** 4. Verification Time */
  verificationTime: {
    timestampIso: string;
    formattedTime: string;
    relativeTime: string;
    blockSlot?: number;
    isFresh: boolean;
    freshnessStatus: string;
  };

  /** 5. Evidence & Provenance */
  evidence: {
    /** Solana network queried */
    network: string;
    /** Exact balance source description */
    balanceSource: string;
    /** Whether query was executed against live Solana Mainnet RPC */
    isLiveOnchain: boolean;
    /** Cryptographic SHA-256 digest of this verified claim */
    dataHash: string;
    /** Relevant transaction or historical onchain settlement activity */
    relevantTransaction?: RelevantTransactionEvidence;
    /** Public explorer references */
    explorerReferences: {
      solscanUrl: string;
      tokenAccountSolscanUrl: string;
      solanaFmUrl: string;
      explorerSolanaUrl: string;
    };
    /** Legal non-custodial disclaimer */
    auditDisclaimer: string;
  };
}
