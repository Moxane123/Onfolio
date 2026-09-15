/**
 * Onfolio — Real Solana JSON-RPC 2.0 Data Provider
 * Connects directly to Solana RPC nodes without bundling heavyweight node polyfills.
 * Queries SPL Token and Token-2022 program accounts via standard JSON-RPC.
 */

import { Transaction } from '../../types';
import { ISolanaDataProvider, RawTokenAccount } from './types';

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

  constructor(endpoint?: string) {
    this.endpoint =
      endpoint ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_ENDPOINT) ||
      'https://api.mainnet-beta.solana.com';
  }

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  private async callRpc<T>(method: string, params: unknown[]): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    // If using the default public Solana RPC or in browser environment,
    // route through our backend proxy /api/solana-rpc to avoid browser Origin 403 blocks.
    const isPublicSolanaRpc =
      !this.endpoint ||
      this.endpoint === 'https://api.mainnet-beta.solana.com' ||
      this.endpoint === '/api/solana-rpc';

    const targetUrl = isPublicSolanaRpc ? '/api/solana-rpc' : this.endpoint;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // If custom RPC endpoint provided, inform the proxy via header if routing via /api/solana-rpc
    if (this.endpoint && !isPublicSolanaRpc && !this.endpoint.startsWith('http://localhost')) {
      // Direct call or proxy header
      requestHeaders['x-solana-endpoint'] = this.endpoint;
    }

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 429) {
        throw new Error(
          'Solana public RPC rate limit reached (HTTP 429). Switch to Sandbox mode or configure a custom RPC key in settings.'
        );
      }

      if (response.status === 403) {
        throw new Error(
          'Solana public RPC node restricted browser access (HTTP 403). Using Sandbox Dev Adapter or configure a private RPC endpoint (Helius, QuickNode, Triton) in Settings.'
        );
      }

      if (!response.ok) {
        throw new Error(`Solana RPC HTTP error: ${response.status} ${response.statusText}`);
      }

      const json: JsonRpcResponse<T> = await response.json();
      if (json.error) {
        throw new Error(`Solana RPC error [${json.error.code}]: ${json.error.message}`);
      }

      return json.result as T;
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Solana RPC request timed out. Please check your internet connection or try another RPC.');
        }
        throw err;
      }
      throw new Error('Unknown Solana RPC error occurred');
    }
  }

  async fetchTokenAccounts(address: string): Promise<RawTokenAccount[]> {
    const accounts: RawTokenAccount[] = [];

    // Query standard SPL Token accounts
    try {
      const splAccounts = await this.queryProgramAccounts(address, SPL_TOKEN_PROGRAM_ID, false);
      accounts.push(...splAccounts);
    } catch (e) {
      console.warn('Could not query SPL token program accounts:', e);
    }

    // Query Token-2022 accounts
    try {
      const token2022Accounts = await this.queryProgramAccounts(address, TOKEN_2022_PROGRAM_ID, true);
      accounts.push(...token2022Accounts);
    } catch (e) {
      console.warn('Could not query Token-2022 program accounts:', e);
    }

    return accounts;
  }

  private async queryProgramAccounts(
    ownerAddress: string,
    programId: string,
    isToken2022: boolean
  ): Promise<RawTokenAccount[]> {
    interface ParsedTokenAccountInfo {
      pubkey: string;
      account: {
        data: {
          parsed: {
            info: {
              mint: string;
              owner: string;
              tokenAmount: {
                amount: string;
                decimals: number;
                uiAmount: number | null;
              };
            };
          };
        };
      };
    }

    interface ParsedTokenResponse {
      value: ParsedTokenAccountInfo[];
    }

    const res = await this.callRpc<ParsedTokenResponse>('getTokenAccountsByOwner', [
      ownerAddress,
      { programId },
      { encoding: 'jsonParsed', commitment: 'confirmed' },
    ]);

    if (!res || !Array.isArray(res.value)) {
      return [];
    }

    return res.value
      .map((item) => {
        const info = item.account?.data?.parsed?.info;
        if (!info || !info.tokenAmount) return null;

        const uiAmount = info.tokenAmount.uiAmount ?? 0;
        // Filter out zero-balance accounts
        if (uiAmount <= 0) return null;

        return {
          pubkey: item.pubkey,
          mint: info.mint,
          owner: info.owner || ownerAddress,
          amount: info.tokenAmount.amount,
          decimals: info.tokenAmount.decimals,
          uiAmount,
          programId,
          isToken2022,
        };
      })
      .filter((item): item is RawTokenAccount => item !== null);
  }

  async fetchSolBalance(address: string): Promise<number> {
    interface BalanceResult {
      value: number;
    }
    const res = await this.callRpc<BalanceResult>('getBalance', [
      address,
      { commitment: 'confirmed' },
    ]);
    const lamports = res?.value ?? 0;
    return lamports / 1e9;
  }

  async fetchRecentTransactions(address: string, limit = 5): Promise<Transaction[]> {
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
        address,
        { limit },
      ]);

      if (!Array.isArray(signatures)) return [];

      return signatures.map((sig) => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime || Math.floor(Date.now() / 1000),
        type: 'settlement',
        mint: '',
        symbol: 'SOL',
        amount: 0,
        status: sig.confirmationStatus === 'finalized' ? 'finalized' : 'confirmed',
      }));
    } catch {
      return [];
    }
  }

  async getCurrentSlot(): Promise<number> {
    return await this.callRpc<number>('getSlot', [{ commitment: 'confirmed' }]);
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; message?: string }> {
    const start = performance.now();
    try {
      const slot = await this.getCurrentSlot();
      const latencyMs = Math.round(performance.now() - start);
      return { ok: true, latencyMs, message: `Solana RPC Healthy (Slot #${slot.toLocaleString()})` };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : 'Solana RPC unreachable';
      return { ok: false, latencyMs, message: msg };
    }
  }
}
