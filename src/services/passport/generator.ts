/**
 * Onfolio — Passport Layer Generator
 *
 * THE PASSPORT IS THE PRODUCT.
 * Generates an immutable-style onchain investment passport credential
 * from the calculated portfolio state.
 */

import { Passport, PassportTier, Portfolio } from '../../types';

/** Generates a deterministic 8-character hex checksum from address and timestamp */
export function generateChecksum(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase();
  return hex.padStart(8, '0').slice(0, 8);
}

export function determineTier(totalValueUsd: number, holdingsCount: number, issuerCount: number): {
  tier: PassportTier;
  title: string;
} {
  if (totalValueUsd <= 0 || holdingsCount === 0) {
    return {
      tier: 'Observer',
      title: 'Solana Public Observer',
    };
  }

  if (totalValueUsd >= 250000 || (totalValueUsd >= 100000 && holdingsCount >= 4 && issuerCount >= 2)) {
    return {
      tier: 'Sovereign',
      title: 'Sovereign Onchain Allocator',
    };
  }

  if (totalValueUsd >= 50000) {
    return {
      tier: 'Institutional Prime',
      title: 'Prime Tokenized Equity Allocator',
    };
  }

  if (totalValueUsd >= 10000) {
    return {
      tier: 'Accredited Tier',
      title: 'Accredited Onchain Shareholder',
    };
  }

  if (totalValueUsd >= 1000) {
    return {
      tier: 'Verified Holder',
      title: 'Verified Tokenized Shareholder',
    };
  }

  return {
    tier: 'Pioneer',
    title: 'Onchain Equity Pioneer',
  };
}

export function calculateOnchainScore(portfolio: Portfolio): number {
  if (portfolio.totalAssetsCount === 0 || portfolio.totalValueUsd === 0) {
    return 10; // Baseline address observer score
  }

  // 1. Capital Exposure Score (Max 40 points)
  let capitalScore = 0;
  if (portfolio.totalValueUsd >= 250000) capitalScore = 40;
  else if (portfolio.totalValueUsd >= 50000) capitalScore = 32 + (portfolio.totalValueUsd / 250000) * 8;
  else if (portfolio.totalValueUsd >= 10000) capitalScore = 24 + (portfolio.totalValueUsd / 50000) * 8;
  else if (portfolio.totalValueUsd >= 1000) capitalScore = 15 + (portfolio.totalValueUsd / 10000) * 9;
  else capitalScore = (portfolio.totalValueUsd / 1000) * 15;

  // 2. Diversification & Asset Breadth (Max 30 points)
  const assetCountScore = Math.min(portfolio.totalAssetsCount * 5, 15);
  const divIndexScore = (portfolio.diversificationIndex / 100) * 15;
  const diversificationScore = assetCountScore + divIndexScore;

  // 3. Regulated Issuer & Legal Backing Quality (Max 20 points)
  const issuerCount = Object.keys(portfolio.issuersBreakdown).length;
  const issuerBreadth = Math.min(issuerCount * 6, 12);
  const has1to1Backed = portfolio.holdings.some((h) => h.asset.collateralization === '1:1 Backed Shares');
  const backingQuality = has1to1Backed ? 8 : 4;
  const legalQualityScore = issuerBreadth + backingQuality;

  // 4. Account Stability & Gas Reserve (Max 10 points)
  const solReserveScore = portfolio.solBalance >= 0.1 ? 10 : (portfolio.solBalance / 0.1) * 10;

  const rawTotal = capitalScore + diversificationScore + legalQualityScore + solReserveScore;
  return Math.min(Math.round(rawTotal), 99);
}

export function generatePassport(portfolio: Portfolio): Passport {
  const shortAddr = portfolio.walletAddress.length > 8
    ? `${portfolio.walletAddress.slice(0, 4)}${portfolio.walletAddress.slice(-4)}`
    : 'SOL0';

  const issuerCount = Object.keys(portfolio.issuersBreakdown).length;
  const { tier, title } = determineTier(
    portfolio.totalValueUsd,
    portfolio.totalAssetsCount,
    issuerCount
  );

  const checksum = generateChecksum(
    `${portfolio.walletAddress}-${portfolio.totalValueUsd}-${portfolio.totalAssetsCount}`
  );

  const passportId = `ONF-SOL-${shortAddr.toUpperCase()}-${checksum}`;

  const primaryIssuers = Array.from(
    new Set(portfolio.holdings.map((h) => h.asset.issuer))
  );

  const underlyingEquities = Array.from(
    new Set(portfolio.holdings.map((h) => h.asset.underlyingTicker))
  );

  const jurisdictionCompliance = Array.from(
    new Set(
      portfolio.holdings.map((h) => {
        if (h.asset.issuer.includes('Dinari')) return 'US SEC Transfer Agent (Form TA-1)';
        if (h.asset.issuer.includes('Backed')) return 'Swiss DLT Act (Art. 973c CO)';
        if (h.asset.issuer.includes('xStocks')) return 'Bermuda DABA 2018';
        return h.asset.regulatoryFramework;
      })
    )
  );

  const now = new Date();
  const validUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days validity

  return {
    passportId,
    walletAddress: portfolio.walletAddress,
    tier,
    title,
    onchainScore: calculateOnchainScore(portfolio),
    issuanceDate: now.toISOString(),
    validUntil: validUntil.toISOString(),
    holdingCount: portfolio.totalAssetsCount,
    verifiedEquityValueUsd: portfolio.totalValueUsd,
    primaryIssuers,
    underlyingEquities,
    jurisdictionCompliance,
    status: portfolio.totalAssetsCount > 0 ? 'ACTIVE' : 'EMPTY_PORTFOLIO',
    checksum,
  };
}
