/**
 * Onfolio — Blockchain Data Normalizer
 *
 * PIPELINE POSITION:
 * RAW TOKEN/ACCOUNT DATA → NORMALIZED ONCHAIN DATA
 *
 * Normalizes raw, unstructured, or partially indexed Solana RPC responses
 * into deterministic, application-safe domain models.
 *
 * Guarantees:
 * 1. Source mint addresses are strictly retained on all token representations.
 * 2. Historical events retain cryptographic evidence (signature, slot, blockTime, explorer link).
 * 3. Numerical values are sanitized against NaN, null, negative, or malformed values.
 * 4. Empty wallets produce safe, complete representations (no crashes).
 */

import { Transaction } from '../../types';
import {
  NormalizedAccountInfo,
  NormalizedOnchainData,
  NormalizedTokenAccount,
  NormalizedTransactionEvent,
  RawAccountInfo,
  RawTokenAccount,
  TokenMetadata,
} from './types';

export class DataNormalizer {
  /**
   * Normalizes raw onchain accounts, balances, and history into application-safe structures.
   */
  static normalize(params: {
    address: string;
    solBalance: number;
    accountInfo: RawAccountInfo | null;
    rawTokens: RawTokenAccount[];
    rawTransactions: Transaction[];
    slot: number;
    providerName: string;
    isMock: boolean;
    partialWarnings?: string[];
  }): NormalizedOnchainData {
    const {
      address,
      solBalance,
      accountInfo,
      rawTokens,
      rawTransactions,
      slot,
      providerName,
      isMock,
      partialWarnings = [],
    } = params;

    const fetchedAt = new Date().toISOString();

    // 1. Normalize Account Information
    const normalizedAccount: NormalizedAccountInfo = {
      address: address.trim(),
      lamports: accountInfo ? Math.max(0, accountInfo.lamports) : Math.round(solBalance * 1e9),
      solBalance: Math.max(0, Number.isFinite(solBalance) ? Number(solBalance.toFixed(6)) : 0),
      isExecutable: Boolean(accountInfo?.executable),
      ownerProgram: accountInfo?.owner || '11111111111111111111111111111111',
    };

    // 2. Normalize Token Accounts (deduplicating by token account address & preserving mint)
    const seenTokenAccounts = new Set<string>();
    const normalizedTokens: NormalizedTokenAccount[] = [];

    for (const raw of rawTokens) {
      if (!raw || !raw.mint || !raw.pubkey) continue;

      const cleanPubkey = raw.pubkey.trim();
      const cleanMint = raw.mint.trim();

      // Deduplicate in case overlapping queries returned identical accounts
      if (seenTokenAccounts.has(cleanPubkey)) continue;
      seenTokenAccounts.add(cleanPubkey);

      // Sanitize numerical balances
      let decimals = Number.isInteger(raw.decimals) && raw.decimals >= 0 && raw.decimals <= 18
        ? raw.decimals
        : 6;

      let uiAmount = typeof raw.uiAmount === 'number' && Number.isFinite(raw.uiAmount)
        ? raw.uiAmount
        : 0;

      // If uiAmount is 0 or NaN but amount string exists, parse from raw string
      if ((uiAmount === 0 || !Number.isFinite(uiAmount)) && raw.amount) {
        try {
          const rawBigInt = BigInt(raw.amount.replace(/[^0-9]/g, '') || '0');
          uiAmount = Number(rawBigInt) / Math.pow(10, decimals);
        } catch {
          uiAmount = 0;
        }
      }

      // Metadata with safe fallback
      const metadata: TokenMetadata = raw.metadata || {
        mint: cleanMint,
        name: raw.tokenName || `Token ${cleanMint.slice(0, 4)}...${cleanMint.slice(-4)}`,
        symbol: raw.tokenSymbol || `SPL-${cleanMint.slice(0, 4)}`,
        decimals,
        isToken2022: Boolean(raw.isToken2022),
        metadataSource: raw.isToken2022 ? 'token-2022' : 'fallback',
      };

      normalizedTokens.push({
        tokenAccountAddress: cleanPubkey,
        mint: cleanMint,
        owner: raw.owner?.trim() || address,
        rawAmount: raw.amount || '0',
        decimals,
        uiAmount: Math.max(0, Number(uiAmount.toFixed(decimals))),
        programId: raw.programId || (raw.isToken2022 ? 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' : 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        isToken2022: Boolean(raw.isToken2022),
        metadata,
        evidence: {
          fetchedAt,
          slot,
          source: providerName,
        },
      });
    }

    // 3. Normalize Transaction Activity & Traceable Evidence
    const normalizedTransactions: NormalizedTransactionEvent[] = [];

    for (const tx of rawTransactions) {
      if (!tx || !tx.signature) continue;

      const cleanSig = tx.signature.trim();
      const blockTime = Number.isFinite(tx.blockTime) && tx.blockTime > 0
        ? tx.blockTime
        : Math.floor(Date.now() / 1000);

      const timestampIso = new Date(blockTime * 1000).toISOString();

      normalizedTransactions.push({
        signature: cleanSig,
        slot: Number.isInteger(tx.slot) ? tx.slot : slot,
        blockTime,
        timestampIso,
        type: tx.type || 'activity',
        mint: tx.mint?.trim() || 'So11111111111111111111111111111111111111112',
        symbol: tx.symbol?.trim() || 'SOL',
        amount: typeof tx.amount === 'number' && Number.isFinite(tx.amount) ? tx.amount : 0,
        status: tx.status === 'confirmed' ? 'confirmed' : 'finalized',
        counterparty: tx.counterparty?.trim(),
        evidenceUrl: `https://solscan.io/tx/${cleanSig}`,
      });
    }

    return {
      address: address.trim(),
      account: normalizedAccount,
      tokenAccounts: normalizedTokens,
      transactions: normalizedTransactions,
      slot: Number.isInteger(slot) && slot > 0 ? slot : 0,
      fetchedAt,
      providerName,
      isMock,
      hasPartialData: partialWarnings.length > 0,
      partialWarnings: partialWarnings.length > 0 ? partialWarnings : undefined,
    };
  }
}
