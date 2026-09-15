/**
 * Onfolio — Development & Testing Data Adapter
 *
 * Isolated development adapter providing realistic tokenized equity fixtures.
 * CRITICAL SECURITY / AUDIT RULE:
 * - isMock is strictly TRUE.
 * - Never masquerades as verified live blockchain data.
 * - Allows testing passport generation, tier assignment, and selective disclosure without RPC rate limits.
 */

import { Transaction } from '../../types';
import { ISolanaDataProvider, RawTokenAccount } from './types';

export interface SampleProfile {
  address: string;
  name: string;
  description: string;
  solBalance: number;
  tokens: Array<{
    mint: string;
    tokenAccount: string;
    amount: string;
    decimals: number;
    uiAmount: number;
    isToken2022: boolean;
  }>;
  transactions: Transaction[];
}

export const DEV_SAMPLE_WALLETS: SampleProfile[] = [
  {
    address: '9xQeWv7Kx5jT34eM9QvB3N8rZ2vL8gK6yJ789P8J4k12',
    name: 'Institutional Tech Allocator',
    description: 'Diversified high-conviction tech equities across Dinari & Backed Finance',
    solBalance: 14.85,
    tokens: [
      {
        mint: 'DinariNVDA11111111111111111111111111111111111',
        tokenAccount: 'ATAnvda8934kjfwe98342jkl3249jlkds98324',
        amount: '425000000', // 425 shares
        decimals: 6,
        uiAmount: 425,
        isToken2022: true,
      },
      {
        mint: 'DinariAAPL11111111111111111111111111111111111',
        tokenAccount: 'ATAaapl20934jlkdsmfoiewj90234902349023',
        amount: '280000000', // 280 shares
        decimals: 6,
        uiAmount: 280,
        isToken2022: true,
      },
      {
        mint: 'BackedMSFT11111111111111111111111111111111111',
        tokenAccount: 'ATAmsft89234jkmdf90234890238490238490',
        amount: '160000000', // 160 shares
        decimals: 6,
        uiAmount: 160,
        isToken2022: false,
      },
      {
        mint: 'BackedSPY111111111111111111111111111111111111',
        tokenAccount: 'ATAspy90342klmsdf90234890234890238490',
        amount: '120000000', // 120 shares
        decimals: 6,
        uiAmount: 120,
        isToken2022: false,
      },
      {
        mint: 'DinariTSLA11111111111111111111111111111111111',
        tokenAccount: 'ATAnsla9023489klmsdf89023489023489023',
        amount: '190000000', // 190 shares
        decimals: 6,
        uiAmount: 190,
        isToken2022: true,
      },
    ],
    transactions: [
      {
        signature: '5K3W...9xL2q',
        slot: 284102991,
        blockTime: 1726000000,
        type: 'settlement',
        mint: 'DinariNVDA11111111111111111111111111111111111',
        symbol: 'dNVDA',
        amount: 75,
        status: 'finalized',
      },
      {
        signature: '3J9a...8vK1m',
        slot: 283991204,
        blockTime: 1725800000,
        type: 'settlement',
        mint: 'BackedSPY111111111111111111111111111111111111',
        symbol: 'bSPY',
        amount: 40,
        status: 'finalized',
      },
    ],
  },
  {
    address: '4v6NdYk532fT9qP88xK198LmQe2pLq93K45mN7812345',
    name: 'Macro & Index Allocator',
    description: 'Core exposure to US large-cap indexes and semiconductor manufacturing',
    solBalance: 6.42,
    tokens: [
      {
        mint: 'BackedSPY111111111111111111111111111111111111',
        tokenAccount: 'ATAspy4v6NdYk532fT9qP88xK198LmQe2pLq93',
        amount: '85000000', // 85 shares
        decimals: 6,
        uiAmount: 85,
        isToken2022: false,
      },
      {
        mint: 'BackedQQQ111111111111111111111111111111111111',
        tokenAccount: 'ATAqqq4v6NdYk532fT9qP88xK198LmQe2pLq93',
        amount: '95000000', // 95 shares
        decimals: 6,
        uiAmount: 95,
        isToken2022: false,
      },
      {
        mint: 'xStocksAMD11111111111111111111111111111111111',
        tokenAccount: 'ATAamd4v6NdYk532fT9qP88xK198LmQe2pLq93',
        amount: '110000000', // 110 shares
        decimals: 6,
        uiAmount: 110,
        isToken2022: true,
      },
      {
        mint: 'DinariCOIN11111111111111111111111111111111111',
        tokenAccount: 'ATAcoin4v6NdYk532fT9qP88xK198LmQe2pLq',
        amount: '50000000', // 50 shares
        decimals: 6,
        uiAmount: 50,
        isToken2022: true,
      },
    ],
    transactions: [
      {
        signature: '4B8m...1qP9s',
        slot: 284000120,
        blockTime: 1725900000,
        type: 'settlement',
        mint: 'BackedQQQ111111111111111111111111111111111111',
        symbol: 'bQQQ',
        amount: 30,
        status: 'finalized',
      },
    ],
  },
  {
    address: '7mKp3X9r8vQ1234567890abcdefABCDEF1234567890',
    name: 'Emerging Onchain Shareholder',
    description: 'Direct beneficial ownership of tokenized Tesla and Apple',
    solBalance: 2.15,
    tokens: [
      {
        mint: 'DinariTSLA11111111111111111111111111111111111',
        tokenAccount: 'ATAtsla7mKp3X9r8vQ1234567890abcdefAB',
        amount: '18000000', // 18 shares
        decimals: 6,
        uiAmount: 18,
        isToken2022: true,
      },
      {
        mint: 'DinariAAPL11111111111111111111111111111111111',
        tokenAccount: 'ATAaapl7mKp3X9r8vQ1234567890abcdefAB',
        amount: '12000000', // 12 shares
        decimals: 6,
        uiAmount: 12,
        isToken2022: true,
      },
    ],
    transactions: [],
  },
];

export class SolanaDevAdapter implements ISolanaDataProvider {
  readonly name = 'Onfolio Sandbox Adapter';
  readonly isMock = true;

  async fetchTokenAccounts(address: string): Promise<RawTokenAccount[]> {
    // Artificial latency to preserve realistic asynchronous state transitions
    await new Promise((r) => setTimeout(r, 450));

    const sample = DEV_SAMPLE_WALLETS.find(
      (w) => w.address.toLowerCase() === address.trim().toLowerCase()
    );

    if (sample) {
      return sample.tokens.map((t) => ({
        pubkey: t.tokenAccount,
        mint: t.mint,
        owner: address,
        amount: t.amount,
        decimals: t.decimals,
        uiAmount: t.uiAmount,
        programId: t.isToken2022
          ? 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
          : 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        isToken2022: t.isToken2022,
      }));
    }

    // If an unknown address is scanned in Sandbox mode, return empty token accounts
    return [];
  }

  async fetchSolBalance(address: string): Promise<number> {
    const sample = DEV_SAMPLE_WALLETS.find(
      (w) => w.address.toLowerCase() === address.trim().toLowerCase()
    );
    return sample ? sample.solBalance : 0.05;
  }

  async fetchRecentTransactions(address: string): Promise<Transaction[]> {
    const sample = DEV_SAMPLE_WALLETS.find(
      (w) => w.address.toLowerCase() === address.trim().toLowerCase()
    );
    return sample ? sample.transactions : [];
  }

  async getCurrentSlot(): Promise<number> {
    return 284152890;
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; message?: string }> {
    return {
      ok: true,
      latencyMs: 12,
      message: 'Sandbox / Dev Adapter Active (Deterministic Testing Engine)',
    };
  }
}
