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
import {
  ISolanaDataProvider,
  MintInfo,
  ProviderHealth,
  RawAccountInfo,
  RawTokenAccount,
  TokenMetadata,
} from './types';
import { MINT_MAP } from '../assetRegistry/catalog';

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
    tokenName?: string;
    tokenSymbol?: string;
  }>;
  transactions: Transaction[];
}

export const DEV_SAMPLE_WALLETS: SampleProfile[] = [
  {
    address: '9xQeWv7Kx5jT34eM9QvB3N8rZ2vL8gK6yJ789P8J4k12',
    name: 'Institutional Tech Allocator',
    description: 'Holds multiple tokenized representations of Apple (Dinari dAAPL + Backed bAAPL) & NVIDIA',
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
        amount: '280000000', // 280 shares Dinari
        decimals: 6,
        uiAmount: 280,
        isToken2022: true,
      },
      {
        mint: 'BackedAAPL11111111111111111111111111111111111',
        tokenAccount: 'ATAbaapl9012384902384092384092384092',
        amount: '120000000', // 120 shares Backed
        decimals: 6,
        uiAmount: 120,
        isToken2022: false,
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
      {
        mint: 'BonkRewardSol1111111111111111111111111111111',
        tokenAccount: 'ATAbonk902348902348902348902348902384',
        amount: '500000000000', // 5,000,000 BONK (unregistered token)
        decimals: 5,
        uiAmount: 5000000,
        isToken2022: false,
        tokenName: 'Bonk Rewards Protocol',
        tokenSymbol: 'BONK',
      },
    ],
    transactions: [
      {
        signature: '5K3W7vB9xL2qM4p8Rt1yU6sA3dF7gH9jK2lZ4xV6cB8n',
        slot: 284102991,
        blockTime: 1726050000,
        type: 'settlement',
        mint: 'DinariNVDA11111111111111111111111111111111111',
        symbol: 'dNVDA',
        amount: 75,
        valueUsd: 8850,
        status: 'finalized',
        counterparty: 'DinariPrimaryIssuancePool111111111111111111',
      },
      {
        signature: '3J9a2mK8vK1mP5r7Xt2yV8sB4eG8hJ1kL3mZ5xW7cD9p',
        slot: 283991204,
        blockTime: 1725840000,
        type: 'settlement',
        mint: 'BackedSPY111111111111111111111111111111111111',
        symbol: 'bSPY',
        amount: 40,
        valueUsd: 22400,
        status: 'finalized',
        counterparty: 'BackedFinanceSwissVault111111111111111111',
      },
      {
        signature: '4R8p9tX1yV7sB2eG5hJ8kL2mZ4xW6cD8nQ1a3vB5xL7q',
        slot: 283750112,
        blockTime: 1725520000,
        type: 'transfer_in',
        mint: 'DinariAAPL11111111111111111111111111111111111',
        symbol: 'dAAPL',
        amount: 80,
        valueUsd: 17792,
        status: 'finalized',
        counterparty: 'CustodyEscrowBrokerage9912384902384092384',
      },
      {
        signature: '2K4m7vP9xT3qR6yU8sB1eD4gH7jL1mZ3xV5cB7nQ9a2s',
        slot: 283510800,
        blockTime: 1725200000,
        type: 'settlement',
        mint: 'BackedMSFT11111111111111111111111111111111111',
        symbol: 'bMSFT',
        amount: 50,
        valueUsd: 21400,
        status: 'finalized',
        counterparty: 'BackedFinanceSwissVault111111111111111111',
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
        signature: '4B8m9xK2lZ5pW7cD1qP9sA3eF7gH9jK2lZ4xV6cB8n2m',
        slot: 284000120,
        blockTime: 1725900000,
        type: 'settlement',
        mint: 'BackedQQQ111111111111111111111111111111111111',
        symbol: 'bQQQ',
        amount: 30,
        valueUsd: 14610,
        status: 'finalized',
        counterparty: 'BackedFinanceSwissVault111111111111111111',
      },
      {
        signature: '3X7q9vL2mZ4pW6cB8nA1dF5gH8jK1lZ3xV5cB7nQ9a1s',
        slot: 283800250,
        blockTime: 1725650000,
        type: 'transfer_in',
        mint: 'BackedSPY111111111111111111111111111111111111',
        symbol: 'bSPY',
        amount: 45,
        valueUsd: 25200,
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
    transactions: [
      {
        signature: '1M9z5xW7cD3pA2eG6hJ9kL1mZ3xV5cB7nQ8a2s4vB6xL',
        slot: 283920100,
        blockTime: 1725790000,
        type: 'settlement',
        mint: 'DinariTSLA11111111111111111111111111111111111',
        symbol: 'dTSLA',
        amount: 18,
        valueUsd: 4104,
        status: 'finalized',
        counterparty: 'DinariPrimaryIssuancePool111111111111111111',
      },
      {
        signature: '2N1y6xV8cB4qB3fH7jK1lM2nZ4xW6cD8nQ9b3t5wA7yM',
        slot: 283610400,
        blockTime: 1725350000,
        type: 'transfer_in',
        mint: 'DinariAAPL11111111111111111111111111111111111',
        symbol: 'dAAPL',
        amount: 12,
        valueUsd: 2668.8,
        status: 'finalized',
      },
    ],
  },
  {
    address: 'SpoofTestWallet111111111111111111111111111111',
    name: 'Ticker Spoof Test (Security Proof)',
    description: 'Holds valid NVIDIA equity alongside a fake unverified token labeled "AAPL" to prove anti-spoofing',
    solBalance: 4.10,
    tokens: [
      {
        mint: 'DinariNVDA11111111111111111111111111111111111',
        tokenAccount: 'ATAnvdaSpoofTest111111111111111111111111111',
        amount: '60000000', // 60 shares NVDA (Verified!)
        decimals: 6,
        uiAmount: 60,
        isToken2022: true,
      },
      {
        mint: 'FakeAppleMint1111111111111111111111111111111',
        tokenAccount: 'ATAFakeAppleSpoofTest111111111111111111111',
        amount: '50000000000', // 50,000 fake tokens claiming to be AAPL!
        decimals: 6,
        uiAmount: 50000,
        isToken2022: false,
        tokenName: 'Apple Inc. Counterfeit Share',
        tokenSymbol: 'AAPL',
      },
      {
        mint: 'RandomCommunityMeme11111111111111111111111',
        tokenAccount: 'ATARandomMemeTest1111111111111111111111111',
        amount: '250000000000',
        decimals: 6,
        uiAmount: 250000,
        isToken2022: false,
        tokenName: 'Solana Doge Community',
        tokenSymbol: 'SDOGE',
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
        tokenName: t.tokenName,
        tokenSymbol: t.tokenSymbol,
      }));
    }

    // If an unknown address is scanned in Sandbox mode, return empty token accounts
    return [];
  }

  async fetchTokenBalances(address: string): Promise<Map<string, number>> {
    const accounts = await this.fetchTokenAccounts(address);
    const map = new Map<string, number>();
    for (const acc of accounts) {
      const existing = map.get(acc.mint) || 0;
      map.set(acc.mint, existing + acc.uiAmount);
    }
    return map;
  }

  async fetchTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    const reg = MINT_MAP.get(mint.trim().toLowerCase());
    if (reg) {
      return {
        mint: reg.mint,
        name: reg.name,
        symbol: reg.symbol,
        decimals: reg.decimals,
        logoUri: reg.logoUrl,
        uri: reg.prospectusUrl,
        isToken2022: Boolean(reg.isToken2022),
        metadataSource: 'onchain-mint',
      };
    }

    // Impostor spoof simulation test token
    if (mint === 'FakeAppleMint1111111111111111111111111111111') {
      return {
        mint,
        name: 'Apple Inc. Counterfeit Share',
        symbol: 'AAPL',
        decimals: 6,
        isToken2022: false,
        metadataSource: 'onchain-mint',
      };
    }

    // Community / Unknown token simulation
    if (mint === 'BonkRewardSol1111111111111111111111111111111') {
      return {
        mint,
        name: 'Bonk Rewards Protocol',
        symbol: 'BONK',
        decimals: 5,
        isToken2022: false,
        metadataSource: 'onchain-mint',
      };
    }

    return {
      mint,
      name: `Token ${mint.slice(0, 4)}`,
      symbol: 'SPL',
      decimals: 6,
      isToken2022: false,
      metadataSource: 'fallback',
    };
  }

  async fetchAccountInfo(address: string): Promise<RawAccountInfo | null> {
    const sample = DEV_SAMPLE_WALLETS.find(
      (w) => w.address.toLowerCase() === address.trim().toLowerCase()
    );
    const sol = sample ? sample.solBalance : 0.05;
    return {
      pubkey: address,
      lamports: Math.round(sol * 1e9),
      owner: '11111111111111111111111111111111',
      executable: false,
    };
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

  async resolveMint(mint: string): Promise<MintInfo | null> {
    const reg = MINT_MAP.get(mint.trim().toLowerCase());
    return {
      mint,
      decimals: reg?.decimals ?? 6,
      supply: '1000000000000',
      isToken2022: Boolean(reg?.isToken2022),
    };
  }

  async getCurrentSlot(): Promise<number> {
    return 284152890;
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      ok: true,
      latencyMs: 12,
      currentSlot: 284152890,
      endpoint: 'sandbox://dev-adapter',
      providerName: this.name,
      message: 'Sandbox / Dev Adapter Active (Deterministic Testing Engine)',
    };
  }
}
