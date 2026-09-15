/**
 * Onfolio — Real Solana JSON-RPC 2.0 Data Provider
 *
 * Direct, lightweight JSON-RPC 2.0 client for Solana mainnet/custom clusters.
 *
 * Implements ISolanaDataProvider with:
 * - Querying SPL Token and Token-2022 programs
 * - Token balance resolution and metadata attachment
 * - Account info & native SOL balance extraction
 * - Transaction activity trace retrieval
 * - Mint address resolution
 * - Resilience: in-memory caching, rate-limit backoff, timeout handling, and partial data recovery.
 */

import { Transaction } from '../../types';
import { onchainCache } from './cache';
import { SolanaIndexerProvider } from './indexerProvider';
import { TokenMetadataResolver } from './metadataResolver';
import {
  ISolanaDataProvider,
  MintInfo,
  ProviderHealth,
  RawAccountInfo,
  RawTokenAccount,
  TokenMetadata,
} from './types';

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class SolanaRpcDataProvider implements ISolanaDataProvider {
  readonly name = 'Solana Mainnet-Beta RPC';
  readonly isMock = false;
  private endpoint: string;
  private indexerProvider: SolanaIndexerProvider;

  constructor(endpoint?: string) {
    this.endpoint =
      endpoint ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_ENDPOINT) ||
      'https://api.mainnet-beta.solana.com';

    this.indexerProvider = new SolanaIndexerProvider();
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getIndexerProvider(): SolanaIndexerProvider {
    return this.indexerProvider;
  }

  /**
   * Executes a low-level JSON-RPC call with retry, timeout, and proxy routing
   */
  async callRpc<T>(method: string, params: unknown[], retries = 1): Promise<T> {
    const isPublicSolanaRpc =
      !this.endpoint ||
      this.endpoint === 'https://api.mainnet-beta.solana.com' ||
      this.endpoint === '/api/solana-rpc';

    const targetUrl = isPublicSolanaRpc ? '/api/solana-rpc' : this.endpoint;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.endpoint && !isPublicSolanaRpc && !this.endpoint.startsWith('http://localhost')) {
      requestHeaders['x-solana-endpoint'] = this.endpoint;
    }

    let attempt = 0;
    while (attempt <= retries) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now() + attempt,
            method,
            params,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 429) {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            attempt++;
            continue;
          }
          throw new Error(
            'Solana RPC rate limit reached (HTTP 429). Switch to Sandbox mode or configure a custom RPC key in settings.'
          );
        }

        if (response.status === 403) {
          throw new Error(
            'Solana RPC node restricted browser access (HTTP 403). Using Sandbox Dev Adapter or configure a private RPC endpoint (Helius, QuickNode, Triton) in Settings.'
          );
        }

        if (!response.ok) {
          throw new Error(`Solana RPC HTTP error: ${response.status} ${response.statusText}`);
        }

        const json: JsonRpcResponse<T> = await response.json();
        if (json.error) {
          // Handle rate limit error codes from Solana nodes (e.g. -32005)
          if (json.error.code === -32005 && attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            attempt++;
            continue;
          }
          throw new Error(`Solana RPC error [${json.error.code}]: ${json.error.message}`);
        }

        return json.result as T;
      } catch (err: unknown) {
        clearTimeout(timeout);
        if (attempt < retries && !(err instanceof Error && err.name === 'AbortError')) {
          attempt++;
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            throw new Error('Solana RPC request timed out. Please check network connectivity or try another RPC endpoint.');
          }
          throw err;
        }
        throw new Error('Unknown Solana RPC error occurred');
      }
    }

    throw new Error('Solana RPC request failed after retries');
  }

  /**
   * Fetch all SPL Token and Token-2022 accounts owned by the given address
   */
  async fetchTokenAccounts(address: string): Promise<RawTokenAccount[]> {
    const cleanAddress = address.trim();
    const cacheKey = `token_accounts:${cleanAddress}`;
    const cached = onchainCache.get<RawTokenAccount[]>(cacheKey);
    if (cached) return cached;

    // 1. Try enriched indexer first if configured
    if (this.indexerProvider.isEnabled) {
      try {
        const indexed = await this.indexerProvider.fetchTokenAccounts(cleanAddress);
        if (indexed && indexed.length > 0) {
          onchainCache.set(cacheKey, indexed, 30_000);
          return indexed;
        }
      } catch {
        // Fall back to standard RPC below
      }
    }

    const accounts: RawTokenAccount[] = [];

    // Query standard SPL Token accounts
    try {
      const splAccounts = await this.queryProgramAccounts(cleanAddress, SPL_TOKEN_PROGRAM_ID, false);
      accounts.push(...splAccounts);
    } catch (e) {
      console.warn('Could not query SPL token program accounts:', e);
    }

    // Query Token-2022 accounts
    try {
      const token2022Accounts = await this.queryProgramAccounts(cleanAddress, TOKEN_2022_PROGRAM_ID, true);
      accounts.push(...token2022Accounts);
    } catch (e) {
      console.warn('Could not query Token-2022 program accounts:', e);
    }

    // Attach metadata for discovered tokens
    const enrichedAccounts: RawTokenAccount[] = await Promise.all(
      accounts.map(async (acc) => {
        const metadata = await this.fetchTokenMetadata(acc.mint);
        return {
          ...acc,
          tokenName: metadata?.name || acc.tokenName,
          tokenSymbol: metadata?.symbol || acc.tokenSymbol,
          metadata: metadata || undefined,
        };
      })
    );

    onchainCache.set(cacheKey, enrichedAccounts, 30_000);
    return enrichedAccounts;
  }

  /**
   * Internal helper to query token accounts via getTokenAccountsByOwner
   */
  private async queryProgramAccounts(
    ownerAddress: string,
    programId: string,
    isToken2022: boolean
  ): Promise<RawTokenAccount[]> {
    interface ParsedTokenAccountItem {
      pubkey: string;
      account: {
        data: {
          parsed?: {
            info?: {
              mint: string;
              owner: string;
              tokenAmount?: {
                amount: string;
                decimals: number;
                uiAmount: number | null;
              };
              extensions?: unknown[];
            };
          };
        };
      };
    }

    interface ParsedTokenResponse {
      value: ParsedTokenAccountItem[];
    }

    const res = await this.callRpc<ParsedTokenResponse>('getTokenAccountsByOwner', [
      ownerAddress,
      { programId },
      { encoding: 'jsonParsed', commitment: 'confirmed' },
    ]);

    if (!res || !Array.isArray(res.value)) {
      return [];
    }

    const validAccounts: RawTokenAccount[] = [];

    for (const item of res.value) {
      const info = item.account?.data?.parsed?.info;
      if (!info || !info.mint || !info.tokenAmount) continue;

      const decimals = typeof info.tokenAmount.decimals === 'number' ? info.tokenAmount.decimals : 6;
      let uiAmount = typeof info.tokenAmount.uiAmount === 'number' ? info.tokenAmount.uiAmount : 0;

      if (uiAmount <= 0 && info.tokenAmount.amount) {
        try {
          uiAmount = Number(BigInt(info.tokenAmount.amount)) / Math.pow(10, decimals);
        } catch {
          uiAmount = 0;
        }
      }

      // Filter out zero-balance accounts
      if (uiAmount <= 0) continue;

      validAccounts.push({
        pubkey: item.pubkey,
        mint: info.mint,
        owner: info.owner || ownerAddress,
        amount: info.tokenAmount.amount || '0',
        decimals,
        uiAmount,
        programId,
        isToken2022,
      });
    }

    return validAccounts;
  }

  /**
   * Fetch token balances map for quick lookups (mint -> uiAmount)
   */
  async fetchTokenBalances(address: string): Promise<Map<string, number>> {
    const accounts = await this.fetchTokenAccounts(address);
    const balanceMap = new Map<string, number>();

    for (const acc of accounts) {
      const existing = balanceMap.get(acc.mint) || 0;
      balanceMap.set(acc.mint, existing + acc.uiAmount);
    }

    return balanceMap;
  }

  /**
   * Fetch token metadata for a mint address
   */
  async fetchTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    const cleanMint = mint.trim();
    return await TokenMetadataResolver.resolve(
      cleanMint,
      undefined,
      (method, params) => this.callRpc(method, params)
    );
  }

  /**
   * Fetch raw Solana account information
   */
  async fetchAccountInfo(address: string): Promise<RawAccountInfo | null> {
    const cleanAddress = address.trim();
    const cacheKey = `account_info:${cleanAddress}`;
    const cached = onchainCache.get<RawAccountInfo>(cacheKey);
    if (cached) return cached;

    interface AccountInfoResult {
      value: {
        lamports: number;
        owner: string;
        executable: boolean;
        rentEpoch?: number;
        data?: unknown;
      } | null;
    }

    try {
      const res = await this.callRpc<AccountInfoResult>('getAccountInfo', [
        cleanAddress,
        { encoding: 'jsonParsed', commitment: 'confirmed' },
      ]);

      if (!res || !res.value) return null;

      const account: RawAccountInfo = {
        pubkey: cleanAddress,
        lamports: res.value.lamports,
        owner: res.value.owner,
        executable: res.value.executable,
        rentEpoch: res.value.rentEpoch,
        data: res.value.data,
      };

      onchainCache.set(cacheKey, account, 30_000);
      return account;
    } catch {
      return null;
    }
  }

  /**
   * Fetch native SOL balance in SOL units
   */
  async fetchSolBalance(address: string): Promise<number> {
    const cleanAddress = address.trim();
    const cacheKey = `sol_balance:${cleanAddress}`;
    const cached = onchainCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    interface BalanceResult {
      value: number;
    }

    const res = await this.callRpc<BalanceResult>('getBalance', [
      cleanAddress,
      { commitment: 'confirmed' },
    ]);

    const lamports = res?.value ?? 0;
    const sol = lamports / 1e9;
    onchainCache.set(cacheKey, sol, 20_000);
    return sol;
  }

  /**
   * Fetch recent transaction history for an address
   */
  async fetchRecentTransactions(address: string, limit = 5): Promise<Transaction[]> {
    const cleanAddress = address.trim();
    const cacheKey = `txs:${cleanAddress}:${limit}`;
    const cached = onchainCache.get<Transaction[]>(cacheKey);
    if (cached) return cached;

    interface SignatureInfo {
      signature: string;
      slot: number;
      err: unknown | null;
      memo: string | null;
      blockTime: number | null;
      confirmationStatus?: string;
    }

    try {
      const signatures = await this.callRpc<SignatureInfo[]>('getSignaturesForAddress', [
        cleanAddress,
        { limit },
      ]);

      if (!Array.isArray(signatures)) return [];

      const txs: Transaction[] = signatures.map((sig) => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime || Math.floor(Date.now() / 1000),
        type: 'settlement',
        mint: '',
        symbol: 'SOL',
        amount: 0,
        status: sig.confirmationStatus === 'finalized' ? 'finalized' : 'confirmed',
      }));

      onchainCache.set(cacheKey, txs, 60_000);
      return txs;
    } catch {
      return [];
    }
  }

  /**
   * Resolves SPL or Token-2022 mint details
   */
  async resolveMint(mint: string): Promise<MintInfo | null> {
    const cleanMint = mint.trim();
    const cacheKey = `mint:${cleanMint}`;
    const cached = onchainCache.get<MintInfo>(cacheKey);
    if (cached) return cached;

    try {
      const res = await this.callRpc<{ value: { data?: unknown } | null }>('getAccountInfo', [
        cleanMint,
        { encoding: 'jsonParsed', commitment: 'confirmed' },
      ]);

      if (!res?.value?.data) return null;

      const parsed = TokenMetadataResolver.parseMintInfo(cleanMint, res.value.data);
      if (parsed) {
        onchainCache.set(cacheKey, parsed, 600_000);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Get current Solana ledger slot
   */
  async getCurrentSlot(): Promise<number> {
    const cacheKey = 'slot:current';
    const cached = onchainCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    const slot = await this.callRpc<number>('getSlot', [{ commitment: 'confirmed' }]);
    onchainCache.set(cacheKey, slot, 5_000);
    return slot;
  }

  /**
   * Check connectivity to the underlying Solana endpoint
   */
  async healthCheck(): Promise<ProviderHealth> {
    const start = performance.now();
    try {
      const slot = await this.getCurrentSlot();
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: true,
        latencyMs,
        currentSlot: slot,
        endpoint: this.endpoint,
        providerName: this.name,
        message: `Solana RPC Healthy (Slot #${slot.toLocaleString()})`,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : 'Solana RPC unreachable';
      return {
        ok: false,
        latencyMs,
        endpoint: this.endpoint,
        providerName: this.name,
        message: msg,
      };
    }
  }
}
