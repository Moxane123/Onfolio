/**
 * Onfolio — Blockchain Data Pipeline Service
 *
 * Implements the required pipeline:
 * PUBLIC WALLET ADDRESS
 * ↓
 * SOLANA DATA PROVIDER
 * ↓
 * RAW TOKEN/ACCOUNT DATA
 * ↓
 * NORMALIZED ONCHAIN DATA
 * ↓
 * ASSET REGISTRY
 * ↓
 * PORTFOLIO ENGINE
 */

import { Portfolio } from '../../types';
import { calculatePortfolio } from '../portfolio/calculator';
import { DataNormalizer } from './normalizer';
import {
  ISolanaDataProvider,
  NormalizedOnchainData,
  RawAccountInfo,
  RawTokenAccount,
} from './types';

export interface PipelineResult {
  address: string;
  normalizedData: NormalizedOnchainData;
  portfolio: Portfolio;
  rawTokens: RawTokenAccount[];
  solBalance: number;
  slot: number;
}

export async function runOnchainPipeline(
  publicAddress: string,
  provider: ISolanaDataProvider
): Promise<PipelineResult> {
  const cleanAddress = publicAddress.trim();
  const partialWarnings: string[] = [];

  // Step 1: Query SOLANA DATA PROVIDER for RAW DATA with fault tolerance
  let solBalance = 0;
  try {
    solBalance = await provider.fetchSolBalance(cleanAddress);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    partialWarnings.push(`SOL Balance Query: ${msg}`);
  }

  let rawTokens: RawTokenAccount[] = [];
  try {
    rawTokens = await provider.fetchTokenAccounts(cleanAddress);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If token account query fails (e.g. rate limit), record warning
    partialWarnings.push(`Token Accounts Query: ${msg}`);
  }

  let accountInfo: RawAccountInfo | null = null;
  try {
    accountInfo = await provider.fetchAccountInfo(cleanAddress);
  } catch {
    // Non-critical
  }

  let recentTransactions: any[] = [];
  try {
    recentTransactions = await provider.fetchRecentTransactions(cleanAddress, 6);
  } catch {
    // Non-critical
  }

  let slot = 0;
  try {
    slot = await provider.getCurrentSlot();
  } catch {
    // Non-critical
  }

  // If all primary queries failed with no tokens and failed balance, surface provider error
  if (partialWarnings.length >= 2 && rawTokens.length === 0 && solBalance === 0) {
    throw new Error(
      `Blockchain data provider (${provider.name}) is currently unavailable: ${partialWarnings.join('; ')}`
    );
  }

  // Step 2 & 3: RAW TOKEN/ACCOUNT DATA → NORMALIZED ONCHAIN DATA
  const normalizedData = DataNormalizer.normalize({
    address: cleanAddress,
    solBalance,
    accountInfo,
    rawTokens,
    rawTransactions: recentTransactions,
    slot,
    providerName: provider.name,
    isMock: provider.isMock,
    partialWarnings,
  });

  // Step 4 & 5: NORMALIZED ONCHAIN DATA → ASSET REGISTRY → PORTFOLIO ENGINE
  const portfolio = calculatePortfolio(
    cleanAddress,
    normalizedData.tokenAccounts,
    normalizedData.account.solBalance,
    provider.isMock,
    provider.name,
    recentTransactions
  );

  return {
    address: cleanAddress,
    normalizedData,
    portfolio,
    rawTokens,
    solBalance,
    slot,
  };
}
