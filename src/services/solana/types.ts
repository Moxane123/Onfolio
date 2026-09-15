/**
 * Onfolio — Solana Blockchain Data Layer Abstraction
 *
 * Defines the contract that any Solana RPC or Indexing provider must implement,
 * along with application-safe normalized data structures.
 */

import { Transaction } from '../../types';

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string;
  uri?: string;
  isToken2022: boolean;
  hasExtensions?: boolean;
  metadataSource?: 'metaplex' | 'token-2022' | 'onchain-mint' | 'indexer' | 'fallback';
}

export interface RawTokenAccount {
  pubkey: string;
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  programId: string;
  isToken2022: boolean;
  tokenName?: string;
  tokenSymbol?: string;
  metadata?: TokenMetadata;
}

export interface RawAccountInfo {
  pubkey: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch?: number;
  data?: unknown;
}

export interface RawTransaction {
  signature: string;
  slot: number;
  err: unknown | null;
  memo: string | null;
  blockTime: number | null;
  confirmationStatus?: string;
}

export interface MintInfo {
  mint: string;
  decimals: number;
  supply?: string;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  isToken2022: boolean;
}

/**
 * Normalized onchain token holding retaining source mint address
 * and verified blockchain evidence.
 */
export interface NormalizedTokenAccount {
  tokenAccountAddress: string;
  mint: string;
  owner: string;
  rawAmount: string;
  decimals: number;
  uiAmount: number;
  programId: string;
  isToken2022: boolean;
  metadata: TokenMetadata;
  evidence: {
    fetchedAt: string;
    slot?: number;
    source: string;
  };
}

/**
 * Normalized onchain transaction event retaining verifiable signature
 * and block evidence.
 */
export interface NormalizedTransactionEvent {
  signature: string;
  slot: number;
  blockTime: number;
  timestampIso: string;
  type: 'mint' | 'transfer_in' | 'transfer_out' | 'settlement' | 'activity';
  mint: string;
  symbol: string;
  amount: number;
  status: 'confirmed' | 'finalized';
  counterparty?: string;
  evidenceUrl: string;
  memo?: string;
}

export interface NormalizedAccountInfo {
  address: string;
  lamports: number;
  solBalance: number;
  isExecutable: boolean;
  ownerProgram: string;
}

/**
 * Normalized onchain state produced by the Data Normalizer
 */
export interface NormalizedOnchainData {
  address: string;
  account: NormalizedAccountInfo;
  tokenAccounts: NormalizedTokenAccount[];
  transactions: NormalizedTransactionEvent[];
  slot: number;
  fetchedAt: string;
  providerName: string;
  isMock: boolean;
  hasPartialData: boolean;
  partialWarnings?: string[];
}

export interface ProviderHealth {
  ok: boolean;
  latencyMs: number;
  currentSlot?: number;
  endpoint: string;
  providerName: string;
  message?: string;
}

/**
 * Core Solana Data Provider Abstraction
 *
 * Pluggable contract supporting standard Solana JSON-RPC 2.0 nodes,
 * enhanced indexing providers (Helius, Triton, QuickNode), and isolated sandboxes.
 */
export interface ISolanaDataProvider {
  readonly name: string;
  readonly isMock: boolean;

  /** Fetch all SPL & Token-2022 token accounts for a Solana address */
  fetchTokenAccounts(address: string): Promise<RawTokenAccount[]>;

  /** Fetch quick token balances map (mint -> uiAmount) */
  fetchTokenBalances(address: string): Promise<Map<string, number>>;

  /** Fetch or resolve token metadata (Metaplex PDA or Token-2022 extension) */
  fetchTokenMetadata(mint: string): Promise<TokenMetadata | null>;

  /** Fetch raw Solana account information */
  fetchAccountInfo(address: string): Promise<RawAccountInfo | null>;

  /** Fetch native SOL balance in SOL units */
  fetchSolBalance(address: string): Promise<number>;

  /** Fetch recent transaction history for the address */
  fetchRecentTransactions(address: string, limit?: number): Promise<Transaction[]>;

  /** Resolve SPL / Token-2022 mint details (decimals, supply, authorities) */
  resolveMint(mint: string): Promise<MintInfo | null>;

  /** Get current Solana ledger slot */
  getCurrentSlot(): Promise<number>;

  /** Check connectivity to the underlying RPC / indexer endpoint */
  healthCheck(): Promise<ProviderHealth>;
}
