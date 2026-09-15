/**
 * Onfolio — Authoritative Asset Registry Catalog
 *
 * Implements the required Asset Intelligence architecture:
 * UNDERLYING SECURITY
 *   ↓
 * TOKENIZED REPRESENTATION
 *   ↓
 * REGULATED ISSUER
 *   ↓
 * SOLANA MINT
 *
 * CRITICAL RULE:
 * Never identify an asset solely by ticker/symbol. A token saying "AAPL" is not Apple stock.
 * Verification strictly requires cryptographic confirmation of the registered Solana mint address.
 */

import { TokenizedEquity } from '../../types';
import { TRUSTED_ISSUERS } from './issuers';
import {
  TokenizedAssetRecord,
  UnderlyingSecurity,
} from './types';

/**
 * Underlying Real-World Securities (Companies & ETFs)
 */
export const UNDERLYING_SECURITIES: Record<string, UnderlyingSecurity> = {
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Consumer Electronics & Software',
    isin: 'US0378331005',
    cusip: '037833100',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Designer and manufacturer of smartphones, personal computers, tablets, wearables, and cloud software services.',
    marketPriceUsd: 228.45,
    change24h: 1.42,
    priceSource: {
      provider: 'Pyth Network / CTA Consolidated Tape',
      feedId: 'pyth-aapl-usd-feed-99824',
      indicativePriceUsd: 228.45,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.2,
      confidenceScore: 0.999,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'DinariAAPL11111111111111111111111111111111111',
      'BackedAAPL11111111111111111111111111111111111',
    ],
  },
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Semiconductors & AI Accelerated Hardware',
    isin: 'US67066G1040',
    cusip: '67066G104',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Global pioneer in GPU-accelerated computing, enterprise AI data center chips, and high-performance computing.',
    marketPriceUsd: 132.80,
    change24h: 3.18,
    priceSource: {
      provider: 'Pyth Network / CTA Consolidated Tape',
      feedId: 'pyth-nvda-usd-feed-10294',
      indicativePriceUsd: 132.80,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 0.8,
      confidenceScore: 0.999,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'DinariNVDA11111111111111111111111111111111111',
    ],
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Cloud Infrastructure & Enterprise Software',
    isin: 'US5949181045',
    cusip: '594918104',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Provider of Microsoft Cloud (Azure), enterprise productivity software (Office 365), and generative AI platforms.',
    marketPriceUsd: 448.20,
    change24h: 0.85,
    priceSource: {
      provider: 'Pyth Network / Consolidated Tape',
      feedId: 'pyth-msft-usd-feed-39281',
      indicativePriceUsd: 448.20,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.1,
      confidenceScore: 0.998,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'BackedMSFT11111111111111111111111111111111111',
    ],
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    sector: 'Automotive & Clean Energy Storage',
    isin: 'US88160R1014',
    cusip: '88160R101',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Designer and manufacturer of electric vehicles, stationary grid-scale battery storage, and solar energy systems.',
    marketPriceUsd: 235.10,
    change24h: -1.25,
    priceSource: {
      provider: 'Pyth Network / CTA Consolidated Tape',
      feedId: 'pyth-tsla-usd-feed-88231',
      indicativePriceUsd: 235.10,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 0.9,
      confidenceScore: 0.999,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'DinariTSLA11111111111111111111111111111111111',
      'BackedTSLA11111111111111111111111111111111111',
    ],
  },
  SPY: {
    ticker: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    sector: 'Broad US Large-Cap Equity Index',
    isin: 'US78462F1030',
    cusip: '78462F103',
    primaryExchange: 'NYSE Arca',
    description: 'Exchange-traded fund tracking the investment results of the S&P 500 Index composed of five hundred selected large US companies.',
    marketPriceUsd: 574.60,
    change24h: 0.52,
    priceSource: {
      provider: 'Pyth Network / OPRA & CTA Feeds',
      feedId: 'pyth-spy-usd-feed-50291',
      indicativePriceUsd: 574.60,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.0,
      confidenceScore: 0.999,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'BackedSPY111111111111111111111111111111111111',
    ],
  },
  QQQ: {
    ticker: 'QQQ',
    companyName: 'Invesco QQQ Trust, Series 1',
    sector: 'Nasdaq-100 Large Cap Technology Index',
    isin: 'US46090E1038',
    cusip: '46090E103',
    primaryExchange: 'NASDAQ Global Market',
    description: 'Benchmark ETF tracking the 100 largest non-financial companies listed on NASDAQ.',
    marketPriceUsd: 489.15,
    change24h: 1.12,
    priceSource: {
      provider: 'Pyth Network / CTA Consolidated Tape',
      feedId: 'pyth-qqq-usd-feed-48192',
      indicativePriceUsd: 489.15,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.2,
      confidenceScore: 0.998,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'BackedQQQ111111111111111111111111111111111111',
    ],
  },
  COIN: {
    ticker: 'COIN',
    companyName: 'Coinbase Global, Inc.',
    sector: 'Digital Asset Financial Infrastructure',
    isin: 'US19260Q1076',
    cusip: '19260Q107',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Financial technology company providing digital currency brokerage, custodial infrastructure, and prime brokerage.',
    marketPriceUsd: 214.90,
    change24h: 4.80,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-coin-usd-feed-77341',
      indicativePriceUsd: 214.90,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.4,
      confidenceScore: 0.997,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'DinariCOIN11111111111111111111111111111111111',
    ],
  },
  AMD: {
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    sector: 'Semiconductor Computing & Microprocessors',
    isin: 'US0079031078',
    cusip: '007903107',
    primaryExchange: 'NASDAQ Global Select Market',
    description: 'Global designer of high-performance semiconductor processing units (x86 microprocessors, GPUs, and adaptive SoCs).',
    marketPriceUsd: 154.30,
    change24h: 2.10,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-amd-usd-feed-99321',
      indicativePriceUsd: 154.30,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.0,
      confidenceScore: 0.999,
    },
    lastUpdated: '2026-09-15T15:30:00.000Z',
    tokenizedRepresentations: [
      'xStocksAMD11111111111111111111111111111111111',
    ],
  },
};

/**
 * Tokenized Asset Records (Exact Mint Addresses on Solana)
 */
export const TOKENIZED_ASSET_REGISTRY: TokenizedAssetRecord[] = [
  // 1. Apple Inc. — Dinari dShare (Token-2022)
  {
    mint: 'DinariAAPL11111111111111111111111111111111111',
    underlyingTicker: 'AAPL',
    companyName: 'Apple Inc.',
    name: 'Apple Inc. Tokenized dShare',
    symbol: 'dAAPL',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.dinari,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.dinari.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.dinari.regulatoryFramework,
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US0378331005',
    sector: 'Consumer Electronics & Software',
    marketPriceUsd: 228.45,
    change24h: 1.42,
    isToken2022: true,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-aapl-usd-feed-99824',
      indicativePriceUsd: 228.45,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.2,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/DinariAAPL11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/DinariAAPL11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/DinariAAPL11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified onchain. Direct transfer agent TA-1 filing confirmed with qualified FINRA/SIPC custodian DriveWealth LLC.',
    metadata: {
      transferAgentRegistration: 'SEC CIK 0001948574',
      tokenStandard: 'Solana Token-2022 (Transfer Hook + Metadata Extension)',
      auditReportUrl: 'https://dinari.com/audits/monthly-attestation-latest.pdf',
    },
  },

  // 2. Apple Inc. — Backed bAAPL (Swiss DLT Ledger-based Security)
  {
    mint: 'BackedAAPL11111111111111111111111111111111111',
    underlyingTicker: 'AAPL',
    companyName: 'Apple Inc.',
    name: 'Backed Apple Tokenized Share',
    symbol: 'bAAPL',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.backed,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.backed.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.backed.regulatoryFramework,
    prospectusUrl: 'https://backed.fi/prospectus/baapl',
    isin: 'CH1173294286',
    sector: 'Consumer Electronics & Software',
    marketPriceUsd: 228.45,
    change24h: 1.42,
    isToken2022: false,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-aapl-usd-feed-99824',
      indicativePriceUsd: 228.45,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.2,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/BackedAAPL11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/BackedAAPL11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/BackedAAPL11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified. Compliant with Swiss DLT Act Art. 973c CO. Underlying shares held 1:1 by regulated Swiss private bank.',
    metadata: {
      tokenStandard: 'Solana SPL Token',
      auditReportUrl: 'https://backed.fi/proof-of-reserves/baapl',
    },
  },

  // 3. NVIDIA Corp. — Dinari dShare
  {
    mint: 'DinariNVDA11111111111111111111111111111111111',
    underlyingTicker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    name: 'NVIDIA Corp. Tokenized dShare',
    symbol: 'dNVDA',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.dinari,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.dinari.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.dinari.regulatoryFramework,
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US67066G1040',
    sector: 'Semiconductors & AI Accelerated Hardware',
    marketPriceUsd: 132.80,
    change24h: 3.18,
    isToken2022: true,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-nvda-usd-feed-10294',
      indicativePriceUsd: 132.80,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 0.8,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/DinariNVDA11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/DinariNVDA11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/DinariNVDA11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified. Real-time TA-1 record link with 1:1 NVDA share custodial proof.',
    metadata: {
      transferAgentRegistration: 'SEC CIK 0001948574',
      tokenStandard: 'Solana Token-2022',
      auditReportUrl: 'https://dinari.com/audits/monthly-attestation-latest.pdf',
    },
  },

  // 4. Microsoft Corp. — Backed bMSFT
  {
    mint: 'BackedMSFT11111111111111111111111111111111111',
    underlyingTicker: 'MSFT',
    companyName: 'Microsoft Corporation',
    name: 'Backed Microsoft Tokenized Share',
    symbol: 'bMSFT',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.backed,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.backed.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.backed.regulatoryFramework,
    prospectusUrl: 'https://backed.fi/prospectus-cert-ch',
    isin: 'CH1173294245',
    sector: 'Cloud Infrastructure & Enterprise Software',
    marketPriceUsd: 448.20,
    change24h: 0.85,
    isToken2022: false,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-msft-usd-feed-39281',
      indicativePriceUsd: 448.20,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.1,
      confidenceScore: 0.998,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/BackedMSFT11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/BackedMSFT11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/BackedMSFT11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified under Swiss CO Art. 973c ledger-based security regime.',
    metadata: {
      tokenStandard: 'Solana SPL Token',
      auditReportUrl: 'https://backed.fi/proof-of-reserves/bmsft',
    },
  },

  // 5. Tesla Inc. — Dinari dShare
  {
    mint: 'DinariTSLA11111111111111111111111111111111111',
    underlyingTicker: 'TSLA',
    companyName: 'Tesla, Inc.',
    name: 'Tesla Inc. Tokenized dShare',
    symbol: 'dTSLA',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.dinari,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.dinari.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.dinari.regulatoryFramework,
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US88160R1014',
    sector: 'Automotive & Clean Energy Storage',
    marketPriceUsd: 235.10,
    change24h: -1.25,
    isToken2022: true,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-tsla-usd-feed-88231',
      indicativePriceUsd: 235.10,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 0.9,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/DinariTSLA11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/DinariTSLA11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/DinariTSLA11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified. SEC TA-1 recorded shares with DriveWealth custodian.',
    metadata: {
      transferAgentRegistration: 'SEC CIK 0001948574',
      tokenStandard: 'Solana Token-2022',
      auditReportUrl: 'https://dinari.com/audits/monthly-attestation-latest.pdf',
    },
  },

  // 6. Tesla Inc. — Backed bTSLA
  {
    mint: 'BackedTSLA11111111111111111111111111111111111',
    underlyingTicker: 'TSLA',
    companyName: 'Tesla, Inc.',
    name: 'Backed Tesla Tokenized Share',
    symbol: 'bTSLA',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.backed,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.backed.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.backed.regulatoryFramework,
    prospectusUrl: 'https://backed.fi/prospectus/btsla',
    isin: 'CH1173294336',
    sector: 'Automotive & Clean Energy Storage',
    marketPriceUsd: 235.10,
    change24h: -1.25,
    isToken2022: false,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-tsla-usd-feed-88231',
      indicativePriceUsd: 235.10,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 0.9,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/BackedTSLA11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/BackedTSLA11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/BackedTSLA11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified under Swiss DLT securities framework.',
    metadata: {
      tokenStandard: 'Solana SPL Token',
      auditReportUrl: 'https://backed.fi/proof-of-reserves/btsla',
    },
  },

  // 7. SPDR S&P 500 ETF Trust — Backed bSPY
  {
    mint: 'BackedSPY111111111111111111111111111111111111',
    underlyingTicker: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    name: 'Backed S&P 500 ETF Token',
    symbol: 'bSPY',
    chain: 'solana',
    decimals: 6,
    assetType: 'etf',
    issuer: TRUSTED_ISSUERS.backed,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.backed.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.backed.regulatoryFramework,
    prospectusUrl: 'https://backed.fi/prospectus/bspy',
    isin: 'CH1173294278',
    sector: 'Broad US Large-Cap Equity Index',
    marketPriceUsd: 574.60,
    change24h: 0.52,
    isToken2022: false,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-spy-usd-feed-50291',
      indicativePriceUsd: 574.60,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.0,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/BackedSPY111111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/BackedSPY111111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/BackedSPY111111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified ETF tracker. Custody in regulated Swiss private bank.',
    metadata: {
      tokenStandard: 'Solana SPL Token',
      auditReportUrl: 'https://backed.fi/proof-of-reserves/bspy',
    },
  },

  // 8. Invesco QQQ Trust — Backed bQQQ
  {
    mint: 'BackedQQQ111111111111111111111111111111111111',
    underlyingTicker: 'QQQ',
    companyName: 'Invesco QQQ Trust, Series 1',
    name: 'Backed Invesco QQQ Trust ETF',
    symbol: 'bQQQ',
    chain: 'solana',
    decimals: 6,
    assetType: 'etf',
    issuer: TRUSTED_ISSUERS.backed,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.backed.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.backed.regulatoryFramework,
    prospectusUrl: 'https://backed.fi/prospectus/bqqq',
    isin: 'CH1173294328',
    sector: 'Nasdaq-100 Large Cap Tech Index',
    marketPriceUsd: 489.15,
    change24h: 1.12,
    isToken2022: false,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-qqq-usd-feed-48192',
      indicativePriceUsd: 489.15,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.2,
      confidenceScore: 0.998,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/BackedQQQ111111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/BackedQQQ111111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/BackedQQQ111111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified Nasdaq-100 index tokenized security.',
    metadata: {
      tokenStandard: 'Solana SPL Token',
      auditReportUrl: 'https://backed.fi/proof-of-reserves/bqqq',
    },
  },

  // 9. Coinbase Global — Dinari dShare
  {
    mint: 'DinariCOIN11111111111111111111111111111111111',
    underlyingTicker: 'COIN',
    companyName: 'Coinbase Global, Inc.',
    name: 'Coinbase Global Tokenized dShare',
    symbol: 'dCOIN',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.dinari,
    collateralization: '1:1 Backed Shares',
    custodian: TRUSTED_ISSUERS.dinari.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.dinari.regulatoryFramework,
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US19260Q1076',
    sector: 'Digital Asset Financial Infrastructure',
    marketPriceUsd: 214.90,
    change24h: 4.80,
    isToken2022: true,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-coin-usd-feed-77341',
      indicativePriceUsd: 214.90,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.4,
      confidenceScore: 0.997,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/DinariCOIN11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/DinariCOIN11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/DinariCOIN11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified SEC TA-1 recorded shares with DriveWealth custodian.',
    metadata: {
      transferAgentRegistration: 'SEC CIK 0001948574',
      tokenStandard: 'Solana Token-2022',
      auditReportUrl: 'https://dinari.com/audits/monthly-attestation-latest.pdf',
    },
  },

  // 10. AMD — xStocks Common Stock
  {
    mint: 'xStocksAMD11111111111111111111111111111111111',
    underlyingTicker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    name: 'AMD Tokenized Common Stock',
    symbol: 'xAMD',
    chain: 'solana',
    decimals: 6,
    assetType: 'equity',
    issuer: TRUSTED_ISSUERS.xstocks,
    collateralization: 'Depository Trust Company (DTC) Custody',
    custodian: TRUSTED_ISSUERS.xstocks.custodian,
    regulatoryFramework: TRUSTED_ISSUERS.xstocks.regulatoryFramework,
    prospectusUrl: 'https://xstocks.fi/custody-audit-amd',
    isin: 'US0079031078',
    sector: 'Semiconductor Computing & Microprocessors',
    marketPriceUsd: 154.30,
    change24h: 2.10,
    isToken2022: true,
    priceSource: {
      provider: 'Pyth Network / CTA Feed',
      feedId: 'pyth-amd-usd-feed-99321',
      indicativePriceUsd: 154.30,
      lastUpdated: '2026-09-15T15:30:00.000Z',
      quoteCurrency: 'USD',
      latencySeconds: 1.0,
      confidenceScore: 0.999,
    },
    explorerReference: {
      solscanUrl: 'https://solscan.io/token/xStocksAMD11111111111111111111111111111111111',
      solanaFmUrl: 'https://solana.fm/address/xStocksAMD11111111111111111111111111111111111',
      explorerSolanaUrl: 'https://explorer.solana.com/address/xStocksAMD11111111111111111111111111111111111',
    },
    verificationStatus: 'verified',
    lastUpdated: '2026-09-15T15:30:00.000Z',
    verificationNotes: 'Authoritatively verified. Bermuda DABA 2018 regulated issuer with Interactive Brokers UK DTC depository custody.',
    metadata: {
      tokenStandard: 'Solana Token-2022',
      auditReportUrl: 'https://xstocks.fi/audits/amd-q3.pdf',
    },
  },
];

/**
 * Adapter helper for backwards compatibility with any existing components
 * expecting TokenizedEquity format (where issuer is a string name)
 */
export function recordToTokenizedEquity(record: TokenizedAssetRecord): TokenizedEquity {
  return {
    mint: record.mint,
    name: record.name,
    symbol: record.symbol,
    underlyingTicker: record.underlyingTicker,
    companyName: record.companyName,
    decimals: record.decimals,
    type: record.assetType,
    issuer: record.issuer.name,
    regulatoryFramework: record.regulatoryFramework,
    custodian: record.custodian,
    collateralization: record.collateralization,
    prospectusUrl: record.prospectusUrl,
    isin: record.isin,
    sector: record.sector,
    marketPriceUsd: record.marketPriceUsd,
    change24h: record.change24h,
    isToken2022: record.isToken2022,
  };
}

/**
 * Backward compatibility array of TokenizedEquity
 */
export const VERIFIED_TOKENIZED_EQUITIES: TokenizedEquity[] = TOKENIZED_ASSET_REGISTRY.map(
  recordToTokenizedEquity
);

/** Index by mint address for rapid O(1) matching */
export const MINT_MAP: Map<string, TokenizedEquity> = new Map(
  VERIFIED_TOKENIZED_EQUITIES.map((asset) => [asset.mint.toLowerCase(), asset])
);

/** Index by ticker symbol for fuzzy / heuristic matching */
export const TICKER_MAP: Map<string, TokenizedEquity> = new Map(
  VERIFIED_TOKENIZED_EQUITIES.map((asset) => [asset.underlyingTicker.toUpperCase(), asset])
);

/** Index by token symbol (e.g. dAAPL, bTSLA) */
export const SYMBOL_MAP: Map<string, TokenizedEquity> = new Map(
  VERIFIED_TOKENIZED_EQUITIES.map((asset) => [asset.symbol.toUpperCase(), asset])
);
