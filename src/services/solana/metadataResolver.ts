/**
 * Onfolio — Token Metadata & Mint Resolver
 *
 * Resolves token metadata across Solana Token Program standards:
 * - Token-2022 extensions (inline metadata / metadata pointer)
 * - Known verified registry entries (authoritative reference)
 * - Application-safe fallback metadata preserving source mint address
 */

import { MintInfo, TokenMetadata } from './types';
import { onchainCache } from './cache';
import { MINT_MAP } from '../assetRegistry/catalog';

export class TokenMetadataResolver {
  /**
   * Resolves token metadata for a given mint address.
   * Safe against missing metadata, malformed onchain data, and network timeouts.
   */
  static async resolve(
    mintAddress: string,
    rawAccountParsedData?: unknown,
    rpcCall?: (method: string, params: unknown[]) => Promise<unknown>
  ): Promise<TokenMetadata> {
    const normalizedMint = mintAddress.trim();
    const cacheKey = `metadata:${normalizedMint}`;

    const cached = onchainCache.get<TokenMetadata>(cacheKey);
    if (cached) return cached;

    // 1. Check authoritative Onfolio Asset Registry catalog
    const registered = MINT_MAP.get(normalizedMint.toLowerCase());
    if (registered) {
      const metadata: TokenMetadata = {
        mint: normalizedMint,
        name: registered.name,
        symbol: registered.symbol,
        decimals: registered.decimals,
        logoUri: registered.logoUrl,
        uri: registered.prospectusUrl,
        isToken2022: Boolean(registered.isToken2022),
        metadataSource: 'onchain-mint',
      };
      onchainCache.set(cacheKey, metadata, 600_000); // 10 minutes cache
      return metadata;
    }

    // 2. Check for Token-2022 inline extensions in parsed account data
    if (rawAccountParsedData && typeof rawAccountParsedData === 'object') {
      const parsedObj = rawAccountParsedData as Record<string, unknown>;
      const parsedInfo = (parsedObj.info || parsedObj) as Record<string, unknown>;
      const extensions = (parsedInfo.extensions || []) as Array<Record<string, unknown>>;

      for (const ext of extensions) {
        if (ext.extension === 'tokenMetadata' && ext.state) {
          const state = ext.state as Record<string, unknown>;
          const name = typeof state.name === 'string' ? state.name.replace(/\0/g, '').trim() : '';
          const symbol = typeof state.symbol === 'string' ? state.symbol.replace(/\0/g, '').trim() : '';
          const uri = typeof state.uri === 'string' ? state.uri.replace(/\0/g, '').trim() : '';
          const decimals = typeof parsedInfo.decimals === 'number' ? parsedInfo.decimals : 6;

          if (name || symbol) {
            const metadata: TokenMetadata = {
              mint: normalizedMint,
              name: name || `Token ${normalizedMint.slice(0, 6)}`,
              symbol: symbol || 'TOKEN',
              decimals,
              uri,
              isToken2022: true,
              hasExtensions: true,
              metadataSource: 'token-2022',
            };
            onchainCache.set(cacheKey, metadata, 600_000);
            return metadata;
          }
        }
      }
    }

    // 3. If RPC call is provided, attempt to fetch mint account details
    if (rpcCall) {
      try {
        const result = (await rpcCall('getAccountInfo', [
          normalizedMint,
          { encoding: 'jsonParsed', commitment: 'confirmed' },
        ])) as { value?: { data?: { parsed?: { info?: Record<string, unknown> } } } } | null;

        const info = result?.value?.data?.parsed?.info;
        if (info) {
          const decimals = typeof info.decimals === 'number' ? info.decimals : 0;
          const fallback: TokenMetadata = {
            mint: normalizedMint,
            name: `Token ${normalizedMint.slice(0, 4)}...${normalizedMint.slice(-4)}`,
            symbol: `SPL-${normalizedMint.slice(0, 4)}`,
            decimals,
            isToken2022: false,
            metadataSource: 'fallback',
          };
          onchainCache.set(cacheKey, fallback, 300_000);
          return fallback;
        }
      } catch {
        // Fall through to deterministic fallback
      }
    }

    // 4. Deterministic safe fallback — ALWAYS preserves source mint address!
    const fallback: TokenMetadata = {
      mint: normalizedMint,
      name: `Token ${normalizedMint.slice(0, 4)}...${normalizedMint.slice(-4)}`,
      symbol: `SPL-${normalizedMint.slice(0, 4)}`,
      decimals: 6,
      isToken2022: false,
      metadataSource: 'fallback',
    };

    onchainCache.set(cacheKey, fallback, 180_000); // 3 minutes
    return fallback;
  }

  /**
   * Parses mint info (decimals, supply, authority) from jsonParsed account data
   */
  static parseMintInfo(mintAddress: string, data: unknown): MintInfo | null {
    if (!data || typeof data !== 'object') return null;

    try {
      const obj = data as Record<string, unknown>;
      const parsed = (obj.parsed || obj) as Record<string, unknown>;
      const info = (parsed.info || parsed) as Record<string, unknown>;

      if (typeof info.decimals !== 'number') return null;

      return {
        mint: mintAddress,
        decimals: info.decimals,
        supply: typeof info.supply === 'string' ? info.supply : undefined,
        mintAuthority: typeof info.mintAuthority === 'string' ? info.mintAuthority : null,
        freezeAuthority: typeof info.freezeAuthority === 'string' ? info.freezeAuthority : null,
        isToken2022: Boolean(obj.program === 'spl-token-2022'),
      };
    } catch {
      return null;
    }
  }
}
