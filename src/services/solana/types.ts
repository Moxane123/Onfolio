/**
 * Onfolio — Solana Data Layer Abstraction
 * Defines the contract that any Solana RPC or indexer provider must implement.
 */

import { Transaction } from '../../types';

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
}

export interface SolanaAccountData {
  address: string;
  lamports: number;
  solBalance: number;
  tokenAccounts: RawTokenAccount[];
  slot: number;
  recentTransactions: Transaction[];
  fetchedAt: string;
  isMockData: boolean;
  dataSource: string;
}

export interface ISolanaDataProvider {
  readonly name: string;
  readonly isMock: boolean;
  
  /** Fetch all SPL & Token-2022 token accounts for a Solana address */
  fetchTokenAccounts(address: string): Promise<RawTokenAccount[]>;
  
  /** Fetch native SOL balance in SOL units */
  fetchSolBalance(address: string): Promise<number>;
  
  /** Fetch recent transaction signatures & metadata for the address */
  fetchRecentTransactions(address: string, limit?: number): Promise<Transaction[]>;
  
  /** Get current Solana ledger slot */
  getCurrentSlot(): Promise<number>;
  
  /** Check connectivity to the underlying endpoint */
  healthCheck(): Promise<{ ok: boolean; latencyMs: number; message?: string }>;
}
