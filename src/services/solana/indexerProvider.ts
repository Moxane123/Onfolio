/**
 * Onfolio — Solana Indexing Provider Abstraction & Implementation
 *
 * Provides enriched onchain indexing capabilities (e.g. DAS API, parsed token transfers,
 * transaction indexing) beyond raw RPC constraints.
 *
 * Follows the directive:
 * "Use Solana RPC and/or a reputable indexing provider where appropriate.
 * Do not pretend raw RPC alone is sufficient for every historical analytics requirement.
 * Keep the architecture flexible enough to add an indexing provider."
 */

import { Transaction } from '../../types';
import { RawTokenAccount, TokenMetadata } from './types';
import { onchainCache } from './cache';

export interface IIndexingProvider {
  readonly name: string;
  readonly isEnabled: boolean;
  fetchTokenAccounts(address: string): Promise<RawTokenAccount[] | null>;
  fetchAssetMetadata(mint: string): Promise<TokenMetadata | null>;
  fetchEnhancedTransactions(address: string, limit?: number): Promise<Transaction[] | null>;
}

export class SolanaIndexerProvider implements IIndexingProvider {
  readonly name: string;
  private endpoint: string | null;

  constructor(customEndpoint?: string) {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SOLANA_INDEXER_URL as string | undefined)
      : undefined;

    this.endpoint = customEndpoint || envUrl || null;
    this.name = this.endpoint ? 'Solana Enriched Indexer' : 'No Indexer Configured';
  }

  get isEnabled(): boolean {
    return Boolean(this.endpoint && this.endpoint.trim().length > 0);
  }

  setEndpoint(endpoint: string | null): void {
    this.endpoint = endpoint;
  }

  getEndpoint(): string | null {
    return this.endpoint;
  }

  /**
   * Fetches token accounts via standard Digital Asset Standard (DAS) getAssetsByOwner
   * or enriched token indexing API.
   */
  async fetchTokenAccounts(address: string): Promise<RawTokenAccount[] | null> {
    if (!this.isEnabled || !this.endpoint) return null;

    const cacheKey = `indexer:tokens:${address}`;
    const cached = onchainCache.get<RawTokenAccount[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'indexer-assets',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: address,
            page: 1,
            limit: 100,
            displayOptions: { showFungible: true },
          },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const items = data?.result?.items;
      if (!Array.isArray(items)) return null;

      const results: RawTokenAccount[] = [];

      for (const item of items) {
        if (!item.id) continue;
        const mint = item.id;
        const tokenInfo = item.token_info || {};
        const content = item.content || {};
        const metadata = content.metadata || {};

        const decimals = typeof tokenInfo.decimals === 'number' ? tokenInfo.decimals : 6;
        const rawBalance = typeof tokenInfo.balance === 'number'
          ? tokenInfo.balance.toString()
          : (typeof tokenInfo.balance === 'string' ? tokenInfo.balance : '0');
        const uiAmount = typeof tokenInfo.balance === 'number'
          ? tokenInfo.balance / Math.pow(10, decimals)
          : (parseFloat(rawBalance) / Math.pow(10, decimals) || 0);

        const isToken2022 = item.interface === 'Token2022' || item.interface === 'FungibleToken2022';

        results.push({
          pubkey: item.token_info?.associated_token_address || mint,
          mint,
          owner: address,
          amount: rawBalance,
          decimals,
          uiAmount,
          programId: isToken2022
            ? 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
            : 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          isToken2022,
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          metadata: {
            mint,
            name: metadata.name || `Token ${mint.slice(0, 4)}`,
            symbol: metadata.symbol || 'SPL',
            decimals,
            logoUri: content.links?.image,
            uri: content.json_uri,
            isToken2022,
            metadataSource: 'indexer',
          },
        });
      }

      onchainCache.set(cacheKey, results, 30_000);
      return results;
    } catch {
      // Graceful fallback to standard RPC
      return null;
    }
  }

  /**
   * Fetches metadata for an asset via DAS getAsset
   */
  async fetchAssetMetadata(mint: string): Promise<TokenMetadata | null> {
    if (!this.isEnabled || !this.endpoint) return null;

    const cacheKey = `indexer:meta:${mint}`;
    const cached = onchainCache.get<TokenMetadata>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'indexer-get-asset',
          method: 'getAsset',
          params: { id: mint },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const item = data?.result;
      if (!item) return null;

      const content = item.content || {};
      const metadata = content.metadata || {};
      const tokenInfo = item.token_info || {};

      const result: TokenMetadata = {
        mint,
        name: metadata.name || `Token ${mint.slice(0, 4)}`,
        symbol: metadata.symbol || 'TOKEN',
        decimals: tokenInfo.decimals || 6,
        logoUri: content.links?.image,
        uri: content.json_uri,
        isToken2022: item.interface === 'Token2022' || item.interface === 'FungibleToken2022',
        metadataSource: 'indexer',
      };

      onchainCache.set(cacheKey, result, 600_000);
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Fetches enhanced parsed transactions
   */
  async fetchEnhancedTransactions(address: string, limit = 15): Promise<Transaction[] | null> {
    if (!this.isEnabled || !this.endpoint) return null;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'indexer-txs',
          method: 'getSignaturesForAddress',
          params: [address, { limit }],
        }),
      });

      if (!response.ok) return null;
      return null; // Signals RPC fallback for parsed transactions
    } catch {
      return null;
    }
  }
}
