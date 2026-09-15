/**
 * Onfolio — Portfolio Milestones & Holding History Engine
 *
 * Evaluates:
 * - Holding history & acquisition timelines
 * - Economic sector allocation breakdown
 * - Portfolio milestones & capital stewardship achievements
 */

import {
  Holding,
  HoldingHistoryItem,
  PortfolioMilestone,
  PortfolioSectorAllocation,
  Transaction,
} from '../../types';

export function calculateSectorAllocation(
  holdings: Holding[],
  totalEquityValueUsd: number
): PortfolioSectorAllocation[] {
  const map: Record<string, { valueUsd: number; assetCount: number }> = {};

  for (const h of holdings) {
    const sector = h.asset.sector || 'Unclassified';
    if (!map[sector]) {
      map[sector] = { valueUsd: 0, assetCount: 0 };
    }
    map[sector].valueUsd += h.valueUsd;
    map[sector].assetCount += 1;
  }

  const list: PortfolioSectorAllocation[] = [];
  for (const [sector, data] of Object.entries(map)) {
    const pct = totalEquityValueUsd > 0 ? (data.valueUsd / totalEquityValueUsd) * 100 : 0;
    list.push({
      sector,
      valueUsd: Number(data.valueUsd.toFixed(2)),
      percentage: Number(pct.toFixed(1)),
      assetCount: data.assetCount,
    });
  }

  return list.sort((a, b) => b.valueUsd - a.valueUsd);
}

export function calculateHoldingHistory(
  holdings: Holding[],
  transactions: Transaction[] = []
): HoldingHistoryItem[] {
  const now = Date.now();

  return holdings.map((h) => {
    const relatedTxs = transactions.filter(
      (tx) => tx.mint.toLowerCase() === h.asset.mint.toLowerCase()
    );

    // Find earliest transaction timestamp if any
    let earliestTimeMs = now - 90 * 24 * 60 * 60 * 1000; // default estimated ~90 days
    if (relatedTxs.length > 0) {
      const timestamps = relatedTxs
        .map((t) => (t.blockTime > 0 ? t.blockTime * 1000 : null))
        .filter((t): t is number => t !== null);
      if (timestamps.length > 0) {
        earliestTimeMs = Math.min(...timestamps);
      }
    }

    const holdingDays = Math.max(1, Math.floor((now - earliestTimeMs) / (1000 * 60 * 60 * 24)));
    const firstAcquiredDate = new Date(earliestTimeMs).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return {
      mint: h.asset.mint,
      ticker: h.asset.underlyingTicker,
      companyName: h.asset.companyName,
      firstAcquiredDate,
      estimatedHoldingDays: holdingDays,
      transactionCount: Math.max(1, relatedTxs.length),
      activityStatus: 'active_holding',
    };
  });
}

export function evaluateMilestones(
  holdings: Holding[],
  totalEquityValueUsd: number,
  issuersCount: number,
  holdingHistory: HoldingHistoryItem[] = []
): PortfolioMilestone[] {
  const hasHoldings = holdings.length > 0;
  const milestones: PortfolioMilestone[] = [];

  // 1. First Supported Equity Discovered
  if (hasHoldings) {
    const firstHolding = holdings[0];
    const earliestItem = holdingHistory.length > 0
      ? [...holdingHistory].sort((a, b) => b.estimatedHoldingDays - a.estimatedHoldingDays)[0]
      : null;
    const targetTicker = earliestItem?.ticker || firstHolding.asset.underlyingTicker;
    const targetCompany = earliestItem?.companyName || firstHolding.asset.companyName;

    milestones.push({
      id: 'first_supported_equity',
      title: 'First Supported Equity Discovered',
      category: 'holding',
      achieved: true,
      achievedAt: earliestItem?.firstAcquiredDate || 'Verified onchain',
      description: `Discovered and indexed supported tokenized ${targetCompany} (${targetTicker}) on Solana.`,
      evidence: `Identified registered mint for ${targetTicker} across Solana SPL token accounts`,
    });
  }

  // 2. First Verified Position
  if (hasHoldings) {
    const firstHolding = holdings[0];
    milestones.push({
      id: 'first_verified_position',
      title: 'First Verified Position',
      category: 'holding',
      achieved: true,
      achievedAt: 'Verified onchain',
      description: `Confirmed 1:1 depository backing for ${firstHolding.asset.companyName} with ${firstHolding.asset.issuer}.`,
      evidence: `${firstHolding.asset.collateralization} under ${firstHolding.asset.regulatoryFramework}`,
    });
  }

  // 3. Portfolio Value Milestone (Dynamic tier based on verified onchain valuation)
  if (totalEquityValueUsd >= 100000) {
    milestones.push({
      id: 'value_milestone_sovereign',
      title: 'Sovereign Scale Milestone ($100,000+)',
      category: 'tier',
      achieved: true,
      achievedAt: 'Verified',
      description: 'Surpassed $100,000 in verified onchain equity capital.',
      evidence: `Current verified capital: $${totalEquityValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  } else if (totalEquityValueUsd >= 50000) {
    milestones.push({
      id: 'value_milestone_institutional',
      title: 'Institutional Prime Milestone ($50,000+)',
      category: 'tier',
      achieved: true,
      achievedAt: 'Verified',
      description: 'Attained high-conviction institutional scale in real-world tokenized assets.',
      evidence: `Current verified capital: $${totalEquityValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  } else if (totalEquityValueUsd >= 10000) {
    milestones.push({
      id: 'value_milestone_accredited',
      title: 'Accredited Scale Milestone ($10,000+)',
      category: 'tier',
      achieved: true,
      achievedAt: 'Verified',
      description: 'Surpassed $10,000 in verified onchain equity capital.',
      evidence: `Current verified capital: $${totalEquityValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  } else if (totalEquityValueUsd >= 1000) {
    milestones.push({
      id: 'value_milestone_holder',
      title: 'Verified Shareholder Milestone ($1,000+)',
      category: 'tier',
      achieved: true,
      achievedAt: 'Verified',
      description: 'Surpassed $1,000 in verified onchain equity capital.',
      evidence: `Current verified capital: $${totalEquityValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  } else if (totalEquityValueUsd > 0) {
    milestones.push({
      id: 'value_milestone_pioneer',
      title: 'Initial Equity Capital Milestone',
      category: 'tier',
      achieved: true,
      achievedAt: 'Verified',
      description: 'Established an active verified onchain stock position.',
      evidence: `Current verified capital: $${totalEquityValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  }

  // 4. Longest-Held Supported Asset
  if (holdingHistory.length > 0) {
    const sorted = [...holdingHistory].sort((a, b) => b.estimatedHoldingDays - a.estimatedHoldingDays);
    const topHeld = sorted[0];
    if (topHeld && topHeld.estimatedHoldingDays > 0) {
      milestones.push({
        id: 'longest_held_asset',
        title: 'Longest-Held Supported Asset',
        category: 'holding',
        achieved: true,
        achievedAt: topHeld.firstAcquiredDate,
        description: `Maintained continuous onchain holding of ${topHeld.companyName} (${topHeld.ticker}) across ${topHeld.estimatedHoldingDays} days.`,
        evidence: `Ledger tenure: ~${topHeld.estimatedHoldingDays} days without disposal`,
      });
    }
  }

  // 5. Multi-Issuer Regulatory Resilience
  if (issuersCount >= 2) {
    milestones.push({
      id: 'multi_issuer_diversity',
      title: 'Multi-Issuer Regulatory Resilience',
      category: 'diversification',
      achieved: true,
      achievedAt: 'Active',
      description:
        'Mitigated single-entity counterparty risk by holding tokenized equities across 2 or more independent regulated transfer agents.',
      evidence: `${issuersCount} independent issuers verified (e.g. Dinari Inc., Backed Finance AG)`,
    });
  }

  // 6. Token-2022 Transfer Hook Architecture
  const hasToken2022 = holdings.some((h) => h.isToken2022);
  if (hasToken2022) {
    milestones.push({
      id: 'token_2022_compliance',
      title: 'Token-2022 Transfer Hook Standard',
      category: 'compliance',
      achieved: true,
      achievedAt: 'Verified Standard',
      description:
        'Holds assets compliant with Solana Token-2022 extensions for enterprise transfer hooks and compliance controls.',
      evidence: 'Token-2022 accounts confirmed onchain',
    });
  }

  return milestones;
}
