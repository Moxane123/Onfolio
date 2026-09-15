/**
 * Onfolio — Portfolio Calculation Engine
 * Aggregates raw Solana token accounts, identifies tokenized equities via Asset Registry,
 * and calculates valuations, weights, issuer concentration, and diversification metrics.
 */

import { Holding, IssuerConcentration, Portfolio } from '../../types';
import { recognizeToken } from '../assetRegistry/recognizer';
import { RawTokenAccount } from '../solana/types';

const ESTIMATED_SOL_PRICE_USD = 145.5;

export function calculatePortfolio(
  walletAddress: string,
  rawTokenAccounts: RawTokenAccount[],
  solBalance: number,
  isMockData: boolean,
  dataSource: string
): Portfolio {
  const recognizedHoldings: Holding[] = [];
  let unrecognizedCount = 0;
  let totalEquityValueUsd = 0;

  // 1. Process and recognize each token account
  for (const account of rawTokenAccounts) {
    if (account.uiAmount <= 0) continue;

    const recognition = recognizeToken(
      account.mint,
      account.tokenSymbol,
      account.tokenName
    );

    if (recognition.isRecognized && recognition.equity) {
      const equity = recognition.equity;
      const amount = account.uiAmount;
      const valueUsd = amount * equity.marketPriceUsd;
      totalEquityValueUsd += valueUsd;

      recognizedHoldings.push({
        asset: equity,
        rawBalance: account.amount,
        amount,
        valueUsd,
        allocationPercentage: 0, // Computed in next pass
        tokenAccountAddress: account.pubkey,
        isToken2022: account.isToken2022,
      });
    } else {
      unrecognizedCount++;
    }
  }

  // 2. Sort holdings by USD value descending
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

  // Calculate Diversification Index (0 to 100)
  // Inverse HHI: 1 - HHI gives 0 for 100% single asset, approaching 1 as diversity increases
  let diversificationIndex = 0;
  if (recognizedHoldings.length > 0 && totalEquityValueUsd > 0) {
    const rawHhi = herfindahlSum; // 0 to 1
    const rawDiversification = (1 - rawHhi) * 100;
    // Boost slightly if multiple independent regulated issuers are present
    const issuerBonus = Math.min(Object.keys(issuersBreakdown).length * 4, 15);
    diversificationIndex = Math.min(Math.round(rawDiversification + issuerBonus), 99);
  }

  const topAllocationTicker = recognizedHoldings[0]?.asset?.underlyingTicker || 'NONE';
  const solBalanceUsd = Number((solBalance * ESTIMATED_SOL_PRICE_USD).toFixed(2));

  return {
    walletAddress,
    holdings: recognizedHoldings,
    totalValueUsd: Number(totalEquityValueUsd.toFixed(2)),
    totalAssetsCount: recognizedHoldings.length,
    unrecognizedTokensCount: unrecognizedCount,
    solBalance: Number(solBalance.toFixed(4)),
    solBalanceUsd,
    diversificationIndex,
    issuersBreakdown,
    topAllocationTicker,
    updatedAt: new Date().toISOString(),
    isMockData,
    dataSource,
  };
}
