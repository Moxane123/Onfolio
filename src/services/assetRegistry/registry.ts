/**
 * Onfolio — Asset Registry Engine
 *
 * Core service governing asset intelligence, verification, and hierarchy:
 *
 * UNDERLYING SECURITY (e.g. Apple Inc. / AAPL)
 *   ↓
 * TOKENIZED REPRESENTATION (e.g. Dinari dShare, Backed Share)
 *   ↓
 * REGULATED ISSUER (e.g. Dinari Inc., Backed Finance AG)
 *   ↓
 * SOLANA MINT (e.g. DinariAAPL..., BackedAAPL...)
 *
 * CRITICAL RULE:
 * Never identify an asset solely by ticker/symbol. A token saying "AAPL" is not Apple stock.
 * Verification requires explicit cryptographic confirmation of the registered Solana mint address.
 *
 * EXTENSIBILITY:
 * New tokenized equities can be registered dynamically at runtime or build-time via registerAsset()
 * without rewriting the application.
 */

import { Holding } from '../../types';
import {
  TOKENIZED_ASSET_REGISTRY,
  UNDERLYING_SECURITIES,
} from './catalog';
import {
  AssetRecognitionResult,
  AssetVerificationStatus,
  ConsolidatedUnderlyingHolding,
  RegistryStats,
  TokenizedAssetRecord,
  UnderlyingSecurity,
} from './types';

export class AssetRegistryService {
  private underlyingSecurities: Map<string, UnderlyingSecurity> = new Map();
  private tokenRecords: Map<string, TokenizedAssetRecord> = new Map();
  private tickerToMints: Map<string, Set<string>> = new Map();
  private issuerToMints: Map<string, Set<string>> = new Map();

  constructor() {
    this.bootstrap();
  }

  /**
   * Initialize registry from authoritative catalog
   */
  private bootstrap(): void {
    // 1. Seed underlying securities
    for (const [ticker, security] of Object.entries(UNDERLYING_SECURITIES)) {
      this.registerUnderlying(security);
    }

    // 2. Seed tokenized representations
    for (const record of TOKENIZED_ASSET_REGISTRY) {
      this.registerAsset(record);
    }
  }

  /**
   * Register or update an underlying security (e.g., Apple Inc., NVIDIA Corp.)
   */
  public registerUnderlying(security: UnderlyingSecurity): void {
    const key = security.ticker.trim().toUpperCase();
    this.underlyingSecurities.set(key, { ...security });
    if (!this.tickerToMints.has(key)) {
      this.tickerToMints.set(key, new Set());
    }
  }

  /**
   * Register a new tokenized equity representation.
   * Enables partners and new issuers to add assets without application rewrites.
   */
  public registerAsset(asset: TokenizedAssetRecord): void {
    const normMint = asset.mint.trim().toLowerCase();
    const tickerKey = asset.underlyingTicker.trim().toUpperCase();

    // Store record
    this.tokenRecords.set(normMint, { ...asset });

    // Link in ticker index
    if (!this.tickerToMints.has(tickerKey)) {
      this.tickerToMints.set(tickerKey, new Set());
    }
    this.tickerToMints.get(tickerKey)!.add(normMint);

    // Link in issuer index
    const issuerId = asset.issuer.id;
    if (!this.issuerToMints.has(issuerId)) {
      this.issuerToMints.set(issuerId, new Set());
    }
    this.issuerToMints.get(issuerId)!.add(normMint);

    // Ensure underlying security records this representation
    const underlying = this.underlyingSecurities.get(tickerKey);
    if (underlying) {
      if (!underlying.tokenizedRepresentations.includes(asset.mint)) {
        underlying.tokenizedRepresentations.push(asset.mint);
      }
    }
  }

  /**
   * Query asset record by Solana mint address
   */
  public getByMint(mintAddress: string): TokenizedAssetRecord | undefined {
    return this.tokenRecords.get(mintAddress.trim().toLowerCase());
  }

  /**
   * Query underlying security by ticker (e.g. 'AAPL')
   */
  public getUnderlyingByTicker(ticker: string): UnderlyingSecurity | undefined {
    return this.underlyingSecurities.get(ticker.trim().toUpperCase());
  }

  /**
   * Query all verified tokenized representations for a given underlying ticker
   */
  public getRepresentationsForUnderlying(ticker: string): TokenizedAssetRecord[] {
    const mints = this.tickerToMints.get(ticker.trim().toUpperCase());
    if (!mints) return [];

    const results: TokenizedAssetRecord[] = [];
    for (const mint of mints) {
      const rec = this.tokenRecords.get(mint);
      if (rec) results.push(rec);
    }
    return results;
  }

  /**
   * Get all registered tokenized assets
   */
  public getAllAssets(): TokenizedAssetRecord[] {
    return Array.from(this.tokenRecords.values());
  }

  /**
   * Get all underlying securities
   */
  public getAllUnderlyingSecurities(): UnderlyingSecurity[] {
    return Array.from(this.underlyingSecurities.values());
  }

  /**
   * Check if a mint address is authoritatively verified
   */
  public isMintVerified(mintAddress: string): boolean {
    const record = this.getByMint(mintAddress);
    return Boolean(record && record.verificationStatus === 'verified');
  }

  /**
   * Authoritatively verify an onchain token.
   *
   * CRITICAL SECURITY PRINCIPLE:
   * "Never identify an asset solely by ticker/symbol. A token saying 'AAPL' is not automatically Apple stock."
   */
  public verifyToken(
    mintAddress: string,
    symbolHint?: string,
    nameHint?: string
  ): AssetRecognitionResult {
    const normMint = mintAddress.trim().toLowerCase();
    const record = this.tokenRecords.get(normMint);

    // 1. Authoritative Exact Cryptographic Mint Match
    if (record) {
      const underlying = this.underlyingSecurities.get(record.underlyingTicker.toUpperCase());
      return {
        status: record.verificationStatus,
        isRecognized: record.verificationStatus === 'verified' || record.verificationStatus === 'supported',
        asset: record,
        underlying,
        confidence: 'CRYPTOGRAPHIC_MINT_MATCH',
        reason: `Authoritatively verified in Onfolio Asset Registry by cryptographic mint address (${record.name} issued by ${record.issuer.name})`,
      };
    }

    // 2. Ticker-spoofing and impostor token detection
    // If an unverified token claims to be "AAPL", "NVDA", etc., flag it strictly as UNKNOWN / IMPOSTOR
    if (symbolHint) {
      const cleanSymbol = symbolHint.trim().toUpperCase();
      // Check if symbol matches any underlying security ticker or any token symbol
      let matchedTicker: string | undefined;
      if (this.underlyingSecurities.has(cleanSymbol)) {
        matchedTicker = cleanSymbol;
      } else {
        for (const [ticker] of this.underlyingSecurities) {
          if (cleanSymbol.includes(ticker)) {
            matchedTicker = ticker;
            break;
          }
        }
      }

      if (matchedTicker) {
        return {
          status: 'unknown',
          isRecognized: false,
          confidence: 'REJECTED_IMPOSTOR',
          detectedTickerMatch: matchedTicker,
          reason: `SECURITY ALERT: Token symbol claims "${symbolHint}", but the Solana mint (${mintAddress.slice(0, 8)}...) is UNVERIFIED in the Onfolio Asset Registry. Excluded from equity passport.`,
        };
      }
    }

    // 3. General unrecognized onchain token
    return {
      status: 'unknown',
      isRecognized: false,
      confidence: 'UNREGISTERED_MINT',
      reason: 'Token mint address is not registered in the verified Onfolio Tokenized Equity Registry',
    };
  }

  /**
   * Consolidate verified holdings by underlying security:
   * E.g. If a user holds Dinari dAAPL and Backed bAAPL, they are consolidated under Apple Inc. (AAPL)
   * while retaining the underlying token identities, mints, and issuers.
   */
  public consolidateHoldings(holdings: Holding[]): ConsolidatedUnderlyingHolding[] {
    const groups = new Map<string, {
      totalAmount: number;
      totalValueUsd: number;
      representations: ConsolidatedUnderlyingHolding['representations'];
      issuers: Set<string>;
    }>();

    let grandTotalValueUsd = 0;

    for (const h of holdings) {
      const ticker = h.asset.underlyingTicker.toUpperCase();
      grandTotalValueUsd += h.valueUsd;

      if (!groups.has(ticker)) {
        groups.set(ticker, {
          totalAmount: 0,
          totalValueUsd: 0,
          representations: [],
          issuers: new Set(),
        });
      }

      const grp = groups.get(ticker)!;
      grp.totalAmount += h.amount;
      grp.totalValueUsd += h.valueUsd;
      grp.issuers.add(h.asset.issuer);

      // Find full record for rich representation details
      const record = this.getByMint(h.asset.mint);
      grp.representations.push({
        mint: h.asset.mint,
        tokenAccountAddress: h.tokenAccountAddress,
        symbol: h.asset.symbol,
        name: h.asset.name,
        issuerName: h.asset.issuer,
        amount: h.amount,
        valueUsd: h.valueUsd,
        isToken2022: h.isToken2022,
        verificationStatus: record?.verificationStatus ?? 'verified',
        prospectusUrl: h.asset.prospectusUrl,
        custodian: h.asset.custodian,
      });
    }

    const consolidated: ConsolidatedUnderlyingHolding[] = [];

    for (const [ticker, grp] of groups.entries()) {
      const underlying = this.underlyingSecurities.get(ticker) || {
        ticker,
        companyName: grp.representations[0]?.name || ticker,
        sector: 'Tokenized Equity',
        isin: 'N/A',
        primaryExchange: 'US Markets',
        description: 'Verified tokenized equity position',
        marketPriceUsd: grp.representations[0]?.valueUsd / (grp.totalAmount || 1),
        change24h: 0,
        priceSource: {
          provider: 'Onfolio Asset Intelligence',
          indicativePriceUsd: grp.representations[0]?.valueUsd / (grp.totalAmount || 1),
          lastUpdated: new Date().toISOString(),
          quoteCurrency: 'USD',
        },
        lastUpdated: new Date().toISOString(),
        tokenizedRepresentations: grp.representations.map((r) => r.mint),
      };

      const allocation = grandTotalValueUsd > 0
        ? Number(((grp.totalValueUsd / grandTotalValueUsd) * 100).toFixed(2))
        : 0;

      consolidated.push({
        underlying,
        totalAmount: Number(grp.totalAmount.toFixed(4)),
        totalValueUsd: Number(grp.totalValueUsd.toFixed(2)),
        allocationPercentage: allocation,
        representations: grp.representations,
        issuers: Array.from(grp.issuers),
      });
    }

    // Sort by USD value descending
    consolidated.sort((a, b) => b.totalValueUsd - a.totalValueUsd);
    return consolidated;
  }

  /**
   * Registry aggregate metrics
   */
  public getStats(): RegistryStats {
    let token2022 = 0;
    const issuerIds = new Set<string>();

    for (const rec of this.tokenRecords.values()) {
      if (rec.isToken2022) token2022++;
      issuerIds.add(rec.issuer.id);
    }

    return {
      totalUnderlyingSecurities: this.underlyingSecurities.size,
      totalTokenizedRepresentations: this.tokenRecords.size,
      totalVerifiedIssuers: issuerIds.size,
      token2022Count: token2022,
      lastRegistryUpdate: new Date().toISOString(),
    };
  }
}

/**
 * Singleton instance of the Onfolio Asset Registry
 */
export const assetRegistry = new AssetRegistryService();
