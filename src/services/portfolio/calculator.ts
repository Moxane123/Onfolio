/**
 * Onfolio — Portfolio Calculation Engine
 *
 * PIPELINE POSITION:
 * NORMALIZED ONCHAIN DATA → ASSET REGISTRY → PORTFOLIO ENGINE
 *
 * Aggregates onchain token accounts, identifies verified tokenized equities via Asset Registry,
 * and calculates valuations, weights, issuer concentration, and diversification metrics.
 *
 * CRITICAL ASSET INTELLIGENCE RULES:
 * 1. Never identify an asset solely by ticker/symbol. A token saying "AAPL" is not Apple stock.
 * 2. The registry supports multiple tokenized representations of the same underlying asset:
 *    UNDERLYING SECURITY → TOKENIZED REPRESENTATION → ISSUER → SOLANA MINT.
 * 3. Clean status model: verified, supported, unknown, unsupported, stale metadata.
 * 4. Unknown assets remain visible as unknown tokens rather than being falsely classified.
 */

import {
  Holding,
  IssuerConcentration,
  Portfolio,
  Transaction,
  UnknownTokenHolding,
} from '../../types';
import { assetRegistry } from '../assetRegistry/registry';
import { recognizeToken } from '../assetRegistry/recognizer';
import { NormalizedTokenAccount, RawTokenAccount } from '../solana/types';
import {
  calculateHoldingPerformance,
  calculatePortfolioPerformance,
} from './performanceCalculator';
import { determinePricingFreshness } from './pricingFreshness';
import {
  calculateHoldingHistory,
  calculateSectorAllocation,
  evaluateMilestones,
} from './milestoneEngine';

const ESTIMATED_SOL_PRICE_USD = 145.5;

export function calculatePortfolio(
  walletAddress: string,
  tokenAccounts: Array<RawTokenAccount | NormalizedTokenAccount>,
  solBalance: number,
  isMockData: boolean,
  dataSource: string,
  transactions: Transaction[] = []
): Portfolio {
  const recognizedHoldings: Holding[] = [];
  const unknownTokens: UnknownTokenHolding[] = [];
  let totalEquityValueUsd = 0;
  let totalSharesCount = 0;

  // 1. Process and authoritatively verify each token account
  for (const account of tokenAccounts) {
    if (account.uiAmount <= 0) continue;

    const mint = account.mint;
    const symbol = 'metadata' in account && account.metadata?.symbol
      ? account.metadata.symbol
      : ('tokenSymbol' in account ? account.tokenSymbol : undefined);
    const name = 'metadata' in account && account.metadata?.name
      ? account.metadata.name
      : ('tokenName' in account ? account.tokenName : undefined);

    const recognition = recognizeToken(mint, symbol, name);
    const pubkey = 'tokenAccountAddress' in account ? account.tokenAccountAddress : account.pubkey;
    const rawBal = 'rawAmount' in account ? account.rawAmount : account.amount;

    if (recognition.isRecognized && recognition.equity) {
      const equity = recognition.equity;
      const amount = account.uiAmount;
      const valueUsd = amount * equity.marketPriceUsd;
      totalEquityValueUsd += valueUsd;
      totalSharesCount += amount;

      const initialHolding: Holding = {
        asset: equity,
        rawBalance: rawBal,
        amount,
        valueUsd,
        allocationPercentage: 0, // Computed in next pass
        tokenAccountAddress: pubkey,
        isToken2022: account.isToken2022,
      };

      // Calculate holding performance without inventing cost basis
      initialHolding.performance = calculateHoldingPerformance(initialHolding, transactions);

      recognizedHoldings.push(initialHolding);
    } else {
      // Unknown or unverified token
      // CRITICAL: Keep visible as unknown token rather than discarding or falsely classifying!
      unknownTokens.push({
        mint,
        tokenAccountAddress: pubkey,
        amount: account.uiAmount,
        rawBalance: rawBal,
        decimals: account.decimals,
        symbol,
        name,
        isToken2022: account.isToken2022,
        status: recognition.status === 'unsupported' ? 'unsupported' : 'unknown',
        isImpostorRisk: recognition.isImpostorRisk,
        detectedTickerMatch: recognition.detectedTickerMatch,
        rejectionReason: recognition.reason || 'Token mint address is not registered in the verified Onfolio Tokenized Equity Registry.',
      });
    }
  }

  // 2. Sort recognized holdings by USD value descending
  recognizedHoldings.sort((a, b) => b.valueUsd - a.valueUsd);

  // 3. Compute allocation percentages and issuer concentration
  const issuersMap: Record<string, { valueUsd: number; assetCount: number }> = {};
  let herfindahlSum = 0;

  for (const holding of recognizedHoldings) {
    const alloc = totalEquityValueUsd > 0 ? (holding.valueUsd / totalEquityValueUsd) * 100 : 0;
    holding.allocationPercentage = Number(alloc.toFixed(2));

    const weightFraction = alloc / 100;
    herfindahlSum += weightFraction * weightFraction;

    const issuer = holding.asset.issuer;
    if (!issuersMap[issuer]) {
      issuersMap[issuer] = { valueUsd: 0, assetCount: 0 };
    }
    issuersMap[issuer].valueUsd += holding.valueUsd;
    issuersMap[issuer].assetCount += 1;
  }

  // Convert issuer concentration to record with percentages
  const issuersBreakdown: Record<string, IssuerConcentration> = {};
  for (const [issuerName, stats] of Object.entries(issuersMap)) {
    issuersBreakdown[issuerName] = {
      issuerName,
      valueUsd: stats.valueUsd,
      percentage: totalEquityValueUsd > 0 ? Number(((stats.valueUsd / totalEquityValueUsd) * 100).toFixed(1)) : 0,
      assetCount: stats.assetCount,
    };
  }

  // 4. Consolidate holdings by underlying company / security
  const consolidatedHoldings = assetRegistry.consolidateHoldings(recognizedHoldings);

  // 5. Calculate Diversification Index (0 to 100)
  let diversificationIndex = 0;
  if (recognizedHoldings.length > 0 && totalEquityValueUsd > 0) {
    const rawHhi = herfindahlSum; // 0 to 1
    const rawDiversification = (1 - rawHhi) * 100;
    const issuerBonus = Math.min(Object.keys(issuersBreakdown).length * 4, 15);
    diversificationIndex = Math.min(Math.round(rawDiversification + issuerBonus), 99);
  }

  const topAllocationTicker = recognizedHoldings[0]?.asset?.underlyingTicker || 'NONE';
  const solBalanceUsd = Number((solBalance * ESTIMATED_SOL_PRICE_USD).toFixed(2));
  const totalNetWorthUsd = Number((totalEquityValueUsd + solBalanceUsd).toFixed(2));

  // 6. Portfolio Performance & Pricing Freshness
  const performance = calculatePortfolioPerformance(recognizedHoldings, transactions);
  const pricingFreshness = determinePricingFreshness(isMockData, dataSource);

  // 7. Sector Allocation, Milestones & Holding History
  const sectorAllocation = calculateSectorAllocation(recognizedHoldings, totalEquityValueUsd);
  const holdingHistory = calculateHoldingHistory(recognizedHoldings, transactions);
  const milestones = evaluateMilestones(
    recognizedHoldings,
    totalEquityValueUsd,
    Object.keys(issuersBreakdown).length,
    holdingHistory
  );

  return {
    walletAddress,
    holdings: recognizedHoldings,
    consolidatedHoldings,
    unknownTokens,
    totalValueUsd: Number(totalEquityValueUsd.toFixed(2)),
    totalSharesCount: Number(totalSharesCount.toFixed(2)),
    totalAssetsCount: recognizedHoldings.length,
    unrecognizedTokensCount: unknownTokens.length,
    solBalance: Number(solBalance.toFixed(4)),
    solBalanceUsd,
    totalNetWorthUsd,
    performance,
    pricingFreshness,
    sectorAllocation,
    milestones,
    holdingHistory,
    recentTransactions: transactions,
    diversificationIndex,
    issuersBreakdown,
    topAllocationTicker,
    updatedAt: new Date().toISOString(),
    isMockData,
    dataSource,
  };
}
