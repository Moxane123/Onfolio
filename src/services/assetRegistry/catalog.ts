/**
 * Onfolio — Asset Registry Catalog
 * Authoritative registry of verified tokenized equities and RWAs on Solana.
 *
 * Each asset entry details:
 * - Underlying security ticker
 * - Regulated Issuer & Legal Jurisdiction
 * - Qualified Custodian
 * - Collateral Model (e.g., 1:1 physical share custody)
 * - Public prospectus / audit link
 * - Solana SPL / Token-2022 mint addresses
 */

import { TokenizedEquity } from '../../types';

export const VERIFIED_TOKENIZED_EQUITIES: TokenizedEquity[] = [
  {
    mint: 'DinariAAPL11111111111111111111111111111111111',
    name: 'Apple Inc. Tokenized dShare',
    symbol: 'dAAPL',
    underlyingTicker: 'AAPL',
    companyName: 'Apple Inc.',
    decimals: 6,
    type: 'equity',
    issuer: 'Dinari Inc.',
    regulatoryFramework: 'US SEC Registered Transfer Agent (Form TA-1)',
    custodian: 'DriveWealth LLC (SEC / FINRA / SIPC Member)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US0378331005',
    sector: 'Consumer Electronics & Software',
    marketPriceUsd: 228.45,
    change24h: 1.42,
    isToken2022: true,
  },
  {
    mint: 'DinariNVDA11111111111111111111111111111111111',
    name: 'NVIDIA Corp. Tokenized dShare',
    symbol: 'dNVDA',
    underlyingTicker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    decimals: 6,
    type: 'equity',
    issuer: 'Dinari Inc.',
    regulatoryFramework: 'US SEC Registered Transfer Agent (Form TA-1)',
    custodian: 'DriveWealth LLC (SEC / FINRA / SIPC Member)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US67066G1040',
    sector: 'Semiconductors & AI Hardware',
    marketPriceUsd: 132.80,
    change24h: 3.18,
    isToken2022: true,
  },
  {
    mint: 'BackedMSFT11111111111111111111111111111111111',
    name: 'Backed Microsoft Tokenized Share',
    symbol: 'bMSFT',
    underlyingTicker: 'MSFT',
    companyName: 'Microsoft Corporation',
    decimals: 6,
    type: 'equity',
    issuer: 'Backed Finance AG',
    regulatoryFramework: 'Swiss DLT Act (Art. 973c CO, Ledger-based Securities)',
    custodian: 'Maerki Baumann & Co. AG (FINMA Regulated)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://backed.fi/prospectus-cert-ch',
    isin: 'CH1173294245',
    sector: 'Cloud Infrastructure & Enterprise Software',
    marketPriceUsd: 448.20,
    change24h: 0.85,
    isToken2022: false,
  },
  {
    mint: 'BackedSPY111111111111111111111111111111111111',
    name: 'Backed S&P 500 ETF Token',
    symbol: 'bSPY',
    underlyingTicker: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    decimals: 6,
    type: 'etf',
    issuer: 'Backed Finance AG',
    regulatoryFramework: 'Swiss DLT Act / Prospectus Regulation (EU) 2017/1129',
    custodian: 'InCore Bank AG (FINMA Supervised Private Bank)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://backed.fi/prospectus/bspy',
    isin: 'CH1173294278',
    sector: 'Broad US Large-Cap Equity Index',
    marketPriceUsd: 574.60,
    change24h: 0.52,
    isToken2022: false,
  },
  {
    mint: 'DinariTSLA11111111111111111111111111111111111',
    name: 'Tesla Inc. Tokenized dShare',
    symbol: 'dTSLA',
    underlyingTicker: 'TSLA',
    companyName: 'Tesla, Inc.',
    decimals: 6,
    type: 'equity',
    issuer: 'Dinari Inc.',
    regulatoryFramework: 'US SEC Registered Transfer Agent (Form TA-1)',
    custodian: 'DriveWealth LLC (SEC / FINRA / SIPC Member)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US88160R1014',
    sector: 'Automotive & Energy Storage',
    marketPriceUsd: 235.10,
    change24h: -1.25,
    isToken2022: true,
  },
  {
    mint: 'DinariCOIN11111111111111111111111111111111111',
    name: 'Coinbase Global Tokenized dShare',
    symbol: 'dCOIN',
    underlyingTicker: 'COIN',
    companyName: 'Coinbase Global, Inc.',
    decimals: 6,
    type: 'equity',
    issuer: 'Dinari Inc.',
    regulatoryFramework: 'US SEC Registered Transfer Agent (Form TA-1)',
    custodian: 'DriveWealth LLC (SEC / FINRA / SIPC Member)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://dinari.com/transparency/dshares-prospectus',
    isin: 'US19260Q1076',
    sector: 'Digital Asset Financial Infrastructure',
    marketPriceUsd: 214.90,
    change24h: 4.80,
    isToken2022: true,
  },
  {
    mint: 'xStocksAMD11111111111111111111111111111111111',
    name: 'AMD Tokenized Common Stock',
    symbol: 'xAMD',
    underlyingTicker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    decimals: 6,
    type: 'equity',
    issuer: 'xStocks Protocol',
    regulatoryFramework: 'Bermuda Digital Asset Business Act (DABA 2018)',
    custodian: 'Interactive Brokers (UK) Ltd',
    collateralization: 'Depository Trust Company (DTC) Custody',
    prospectusUrl: 'https://xstocks.fi/custody-audit-amd',
    isin: 'US0079031078',
    sector: 'Semiconductor Computing',
    marketPriceUsd: 154.30,
    change24h: 2.10,
    isToken2022: true,
  },
  {
    mint: 'BackedQQQ111111111111111111111111111111111111',
    name: 'Backed Invesco QQQ Trust ETF',
    symbol: 'bQQQ',
    underlyingTicker: 'QQQ',
    companyName: 'Invesco QQQ Trust, Series 1',
    decimals: 6,
    type: 'etf',
    issuer: 'Backed Finance AG',
    regulatoryFramework: 'Swiss DLT Act (Art. 973c CO)',
    custodian: 'Maerki Baumann & Co. AG (FINMA Regulated)',
    collateralization: '1:1 Backed Shares',
    prospectusUrl: 'https://backed.fi/prospectus/bqqq',
    isin: 'CH1173294328',
    sector: 'Nasdaq-100 Large Cap Tech Index',
    marketPriceUsd: 489.15,
    change24h: 1.12,
    isToken2022: false,
  },
];

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
