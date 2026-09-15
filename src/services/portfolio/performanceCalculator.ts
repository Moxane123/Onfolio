/**
 * Onfolio — Portfolio Performance & Cost Basis Engine
 *
 * MANDATE:
 * "Calculate, where reliable data exists:
 *  - gain/loss where cost basis can be reliably determined
 *  Do not invent cost basis.
 *  If reliable historical acquisition data is unavailable, clearly label performance as unavailable or estimated."
 */

import {
  CostBasisStatus,
  Holding,
  HoldingPerformance,
  PortfolioPerformance,
  Transaction,
} from '../../types';

export function calculateHoldingPerformance(
  holding: Holding,
  transactions: Transaction[] = []
): HoldingPerformance {
  const currentPrice = holding.asset.marketPriceUsd;
  const change24hPercent = holding.asset.change24h;
  const currentTotalValue = holding.valueUsd;

  // Calculate 24h dollar change:
  // previousPrice = currentPrice / (1 + change24hPercent / 100)
  // dollarChange = currentTotalValue - (holding.amount * previousPrice)
  const prevPrice = currentPrice / (1 + (change24hPercent || 0) / 100);
  const change24hUsd = Number(((currentPrice - prevPrice) * holding.amount).toFixed(2));

  // Check if reliable historical acquisition data exists in transactions
  // For SPL tokens, normal transfers/settlements do not record fiat cost basis onchain
  const relatedTxs = transactions.filter(
    (tx) => tx.mint.toLowerCase() === holding.asset.mint.toLowerCase()
  );

  let costBasisStatus: CostBasisStatus = 'unavailable';
  let costBasisUsd: number | undefined;
  let costBasisPerShare: number | undefined;
  let unrealizedGainLossUsd: number | undefined;
  let unrealizedGainLossPercent: number | undefined;

  // If a settlement transaction specifically has a verifiable valueUsd recorded
  const settlementWithBasis = relatedTxs.find(
    (tx) => tx.type === 'settlement' && typeof tx.valueUsd === 'number' && tx.valueUsd > 0
  );

  if (settlementWithBasis && settlementWithBasis.valueUsd) {
    costBasisStatus = 'determined';
    costBasisUsd = settlementWithBasis.valueUsd;
    costBasisPerShare = Number((settlementWithBasis.valueUsd / holding.amount).toFixed(2));
    unrealizedGainLossUsd = Number((currentTotalValue - costBasisUsd).toFixed(2));
    unrealizedGainLossPercent = Number(
      (((currentTotalValue - costBasisUsd) / costBasisUsd) * 100).toFixed(2)
    );
  }

  // Construct clear, honest performance label
  let performanceLabel: string;
  let performanceDisclaimer: string;

  if (costBasisStatus === 'determined' && unrealizedGainLossUsd !== undefined && unrealizedGainLossPercent !== undefined) {
    const sign = unrealizedGainLossUsd >= 0 ? '+' : '';
    performanceLabel = `${sign}$${Math.abs(unrealizedGainLossUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${unrealizedGainLossPercent}%) All-Time`;
    performanceDisclaimer =
      'Cost basis determined from verified onchain primary issuance settlement event.';
  } else {
    const sign = change24hPercent >= 0 ? '+' : '';
    performanceLabel = `${sign}${change24hPercent.toFixed(2)}% (24h Market Delta)`;
    performanceDisclaimer =
      'Historical acquisition cost basis is not recorded in onchain transfer memos. Performance reflects 24h market price change of the underlying security.';
  }

  return {
    change24hUsd,
    change24hPercent,
    costBasisUsd,
    costBasisPerShare,
    unrealizedGainLossUsd,
    unrealizedGainLossPercent,
    costBasisStatus,
    performanceLabel,
    performanceDisclaimer,
  };
}

export function calculatePortfolioPerformance(
  holdings: Holding[],
  transactions: Transaction[] = []
): PortfolioPerformance {
  let net24hUsd = 0;
  let previousTotalUsd = 0;
  let topGainerTicker: string | undefined;
  let topGainerPercent = -Infinity;

  let allHaveDeterminedBasis = holdings.length > 0;
  let totalCostBasisUsd = 0;

  for (const h of holdings) {
    const perf = calculateHoldingPerformance(h, transactions);
    net24hUsd += perf.change24hUsd;
    const prevHoldingVal = h.valueUsd - perf.change24hUsd;
    previousTotalUsd += Math.max(0, prevHoldingVal);

    if (perf.change24hPercent > topGainerPercent) {
      topGainerPercent = perf.change24hPercent;
      topGainerTicker = h.asset.underlyingTicker;
    }

    if (perf.costBasisStatus === 'determined' && perf.costBasisUsd) {
      totalCostBasisUsd += perf.costBasisUsd;
    } else {
      allHaveDeterminedBasis = false;
    }
  }

  const net24hPercent =
    previousTotalUsd > 0 ? Number(((net24hUsd / previousTotalUsd) * 100).toFixed(2)) : 0;

  const costBasisStatus: CostBasisStatus = allHaveDeterminedBasis ? 'determined' : 'unavailable';

  let unrealizedGainLossUsd: number | undefined;
  let unrealizedGainLossPercent: number | undefined;

  if (costBasisStatus === 'determined' && totalCostBasisUsd > 0) {
    const currentTotal = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
    unrealizedGainLossUsd = Number((currentTotal - totalCostBasisUsd).toFixed(2));
    unrealizedGainLossPercent = Number(
      (((currentTotal - totalCostBasisUsd) / totalCostBasisUsd) * 100).toFixed(2)
    );
  }

  const disclaimer =
    costBasisStatus === 'determined'
      ? 'Aggregate cost basis derived from verified primary issuance settlement events.'
      : 'Historical acquisition cost basis is not cryptographically recorded in onchain transfer memos. Performance is measured using verified 24h market price change.';

  return {
    performance24hUsd: Number(net24hUsd.toFixed(2)),
    performance24hPercent: net24hPercent,
    costBasisStatus,
    totalCostBasisUsd: costBasisStatus === 'determined' ? totalCostBasisUsd : undefined,
    unrealizedGainLossUsd,
    unrealizedGainLossPercent,
    topGainerTicker: topGainerPercent !== -Infinity ? topGainerTicker : undefined,
    topGainerPercent: topGainerPercent !== -Infinity ? topGainerPercent : undefined,
    disclaimer,
  };
}
