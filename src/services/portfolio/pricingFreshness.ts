/**
 * Onfolio — Pricing Freshness & Valuation Status Engine
 *
 * MANDATE:
 * "Clearly state whether values are:
 *  - live
 *  - delayed
 *  - estimated
 *  Never imply real-time pricing when the data is not real-time.
 *  Create strong loading and stale-data states."
 */

import { PricingFreshness, PricingFreshnessStatus } from '../../types';

export const STALE_THRESHOLD_MINUTES = 15;

export function determinePricingFreshness(
  isMockData: boolean,
  dataSource: string,
  explicitStatus?: PricingFreshnessStatus,
  customTimestamp?: string
): PricingFreshness {
  const now = new Date();
  const quoteTime = customTimestamp ? new Date(customTimestamp) : now;
  const ageMs = now.getTime() - quoteTime.getTime();
  const ageMinutes = Math.max(0, Math.floor(ageMs / (1000 * 60)));

  // If using Sandbox Adapter, valuations are realistic estimated indicative quotes
  let status: PricingFreshnessStatus = 'delayed';
  let label = 'Market-Hours Delayed (15m)';
  let delayMinutes = 15;
  let provider = 'Consolidated Exchange Tape via IEX Cloud / SEC Form TA-1';
  let pricingDisclaimer =
    'Equity valuations reflect 15-minute delayed consolidated market tape pricing. Not intended for active order routing or real-time trading.';

  if (isMockData) {
    status = 'estimated';
    label = 'Indicative Benchmark Valuation';
    delayMinutes = 15;
    provider = 'Onfolio Sandbox Model / SEC Filing Benchmarks';
    pricingDisclaimer =
      'Sandbox valuations reflect indicative benchmark pricing for portfolio modeling and credential demonstration.';
  } else if (explicitStatus === 'live') {
    status = 'live';
    label = 'Live Market Hours Feed';
    delayMinutes = 0;
    provider = 'Pyth Network / Switchboard Direct Onchain Oracle';
    pricingDisclaimer =
      'Live decentralized oracle feed. Values update dynamically during US equity market operating hours.';
  } else {
    // Normal RPC / mainnet scan: tokenized securities track underlying equities with 15m delayed composite tape
    status = 'delayed';
    label = 'Market-Hours Delayed (15m)';
    delayMinutes = 15;
    provider = `${dataSource} • Consolidated Composite Tape`;
    pricingDisclaimer =
      'Tokenized shares are valued against 15-minute delayed composite quotes of underlying traditional equities.';
  }

  const isStale = ageMinutes > STALE_THRESHOLD_MINUTES;
  const staleMessage = isStale
    ? `Price quotes were last refreshed ${ageMinutes} minutes ago. Markets may have moved since the last scan.`
    : undefined;

  return {
    status,
    label,
    delayMinutes,
    provider,
    lastUpdated: quoteTime.toISOString(),
    isStale,
    staleMessage,
    pricingDisclaimer,
  };
}
