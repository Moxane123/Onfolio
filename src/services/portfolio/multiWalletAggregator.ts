/**
 * Onfolio — Multi-Wallet Portfolio Aggregator
 *
 * PIPELINE POSITION:
 * MULTI-WALLET ONCHAIN DATA → ASSET REGISTRY → UNIFIED PORTFOLIO ENGINE
 *
 * Mandate:
 * "One person may have: a main wallet, a trading wallet, a cold wallet,
 * another wallet used for a different application. Onfolio should allow these
 * to contribute to one portfolio."
 *
 * CRITICAL REQUIREMENTS:
 * 1. Aggregate supported holdings across all verified wallet addresses.
 * 2. Avoid double counting:
 *    - Strict deduplication of token accounts by (walletAddress + pubkey).
 *    - No duplicate asset representations counted twice.
 * 3. Preserve token-level evidence:
 *    - Each holding and consolidated representation records the originating wallet address and label.
 *    - If the same underlying position appears through multiple representations
 *      (e.g., Dinari dAAPL in Main + Backed bAAPL in Trading), consolidate under
 *      the underlying security (AAPL) while displaying both token-level proofs.
 * 4. Extensible to future non-Solana sources (brokerages, EVM) via NormalizedHoldingSource abstraction.
 */

import {
  DiscoveredWallet,
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
import { determineTier } from '../passport/generator';

const ESTIMATED_SOL_PRICE_USD = 145.5;

export interface WalletOnchainDataPayload {
  wallet: DiscoveredWallet;
  tokenAccounts: Array<RawTokenAccount | NormalizedTokenAccount>;
  solBalance: number;
  transactions?: Transaction[];
  isMockData: boolean;
  dataSource: string;
}

/**
 * Aggregates onchain data from multiple wallets into a single, unified Portfolio state.
 */
export function aggregateMultiWalletPortfolio(
  walletPayloads: WalletOnchainDataPayload[]
): Portfolio {
  if (walletPayloads.length === 0) {
    throw new Error('Cannot aggregate an empty wallet list');
  }

  // 1. Identify primary wallet identity
  const primaryPayload = walletPayloads.find((p) => p.wallet.isPrimary) || walletPayloads[0];
  const primaryWalletAddress = primaryPayload.wallet.address;

  // Track deduplication keys to prevent double-counting
  const seenAccountKeys = new Set<string>();
  const seenUnknownMints = new Set<string>();

  const recognizedHoldings: Holding[] = [];
  const unknownTokens: UnknownTokenHolding[] = [];
  const aggregatedTransactions: Transaction[] = [];

  let grandTotalEquityValueUsd = 0;
  let grandTotalSharesCount = 0;
  let totalSolBalance = 0;

  // Per-wallet contribution accumulators
  const walletContributions = new Map<
    string,
    { valueUsd: number; holdingCount: number }
  >();

  for (const payload of walletPayloads) {
    walletContributions.set(payload.wallet.id, { valueUsd: 0, holdingCount: 0 });
  }

  let isAnyMock = false;
  const dataSourcesSet = new Set<string>();

  // 2. Ingest and authoritatively verify accounts from each wallet
  for (const payload of walletPayloads) {
    const { wallet, tokenAccounts, solBalance, transactions = [], isMockData, dataSource } = payload;
    if (isMockData) isAnyMock = true;
    if (dataSource) dataSourcesSet.add(dataSource);

    totalSolBalance += solBalance;

    // Collect transactions
    for (const tx of transactions) {
      if (!aggregatedTransactions.some((existing) => existing.signature === tx.signature)) {
        aggregatedTransactions.push(tx);
      }
    }

    const walletContribution = walletContributions.get(wallet.id)!;

    for (const account of tokenAccounts) {
      if (account.uiAmount <= 0) continue;

      const pubkey = 'tokenAccountAddress' in account ? account.tokenAccountAddress : account.pubkey;
      const dedupeKey = `${wallet.address.toLowerCase()}:${(pubkey || account.mint).toLowerCase()}`;

      // CRITICAL: Avoid double-counting!
      if (seenAccountKeys.has(dedupeKey)) {
        continue;
      }
      seenAccountKeys.add(dedupeKey);

      const mint = account.mint;
      const symbol = 'metadata' in account && account.metadata?.symbol
        ? account.metadata.symbol
        : ('tokenSymbol' in account ? account.tokenSymbol : undefined);
      const name = 'metadata' in account && account.metadata?.name
        ? account.metadata.name
        : ('tokenName' in account ? account.tokenName : undefined);

      const recognition = recognizeToken(mint, symbol, name);
      const rawBal = 'rawAmount' in account ? account.rawAmount : account.amount;

      if (recognition.isRecognized && recognition.equity) {
        const equity = recognition.equity;
        const amount = account.uiAmount;
        const valueUsd = amount * equity.marketPriceUsd;

        grandTotalEquityValueUsd += valueUsd;
        grandTotalSharesCount += amount;

        walletContribution.valueUsd += valueUsd;
        walletContribution.holdingCount += 1;

        const holding: Holding = {
          asset: equity,
          rawBalance: rawBal,
          amount,
          valueUsd,
          allocationPercentage: 0, // Computed in next pass
          tokenAccountAddress: pubkey,
          isToken2022: account.isToken2022,
          walletAddress: wallet.address,
          walletLabel: wallet.label || (wallet.isPrimary ? 'Primary' : 'Trading'),
        };

        // Calculate holding performance without inventing cost basis
        holding.performance = calculateHoldingPerformance(holding, transactions);

        recognizedHoldings.push(holding);
      } else {
        // Unknown or unverified token
        const unknownKey = `${wallet.address}:${mint}`;
        if (!seenUnknownMints.has(unknownKey)) {
          seenUnknownMints.add(unknownKey);
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
    }
  }

  // 3. Sort recognized holdings by USD value descending
  recognizedHoldings.sort((a, b) => b.valueUsd - a.valueUsd);

  // 4. Compute allocation percentages and issuer concentration across the unified portfolio
  const issuersMap: Record<string, { valueUsd: number; assetCount: number }> = {};
  let herfindahlSum = 0;

  for (const holding of recognizedHoldings) {
    const alloc = grandTotalEquityValueUsd > 0
      ? (holding.valueUsd / grandTotalEquityValueUsd) * 100
      : 0;
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

  // Convert issuer concentration to record
  const issuersBreakdown: Record<string, IssuerConcentration> = {};
  for (const [issuerName, stats] of Object.entries(issuersMap)) {
    issuersBreakdown[issuerName] = {
      issuerName,
      valueUsd: stats.valueUsd,
      percentage: grandTotalEquityValueUsd > 0
        ? Number(((stats.valueUsd / grandTotalEquityValueUsd) * 100).toFixed(1))
        : 0,
      assetCount: stats.assetCount,
    };
  }

  // 5. Consolidate holdings by underlying company / security
  // If the same underlying position appears through multiple representations across wallets,
  // this consolidates them under Apple Inc. (AAPL) etc., with each representation's wallet label attached!
  const consolidatedHoldings = assetRegistry.consolidateHoldings(recognizedHoldings);

  // 6. Calculate Diversification Index (0 to 100)
  let diversificationIndex = 0;
  if (recognizedHoldings.length > 0 && grandTotalEquityValueUsd > 0) {
    const rawHhi = herfindahlSum;
    const rawDiversification = (1 - rawHhi) * 100;
    const issuerBonus = Math.min(Object.keys(issuersBreakdown).length * 4, 15);
    diversificationIndex = Math.min(Math.round(rawDiversification + issuerBonus), 99);
  }

  const topAllocationTicker = recognizedHoldings[0]?.asset?.underlyingTicker || 'NONE';
  const solBalanceUsd = Number((totalSolBalance * ESTIMATED_SOL_PRICE_USD).toFixed(2));
  const totalNetWorthUsd = Number((grandTotalEquityValueUsd + solBalanceUsd).toFixed(2));

  // 7. Portfolio Performance & Pricing Freshness
  const performance = calculatePortfolioPerformance(recognizedHoldings, aggregatedTransactions);
  const compositeDataSource = Array.from(dataSourcesSet).join(', ') || 'Solana Mainnet-Beta RPC';
  const pricingFreshness = determinePricingFreshness(isAnyMock, compositeDataSource);

  // 8. Sector Allocation, Milestones & Holding History
  const sectorAllocation = calculateSectorAllocation(recognizedHoldings, grandTotalEquityValueUsd);
  const holdingHistory = calculateHoldingHistory(recognizedHoldings, aggregatedTransactions);
  const milestones = evaluateMilestones(
    recognizedHoldings,
    grandTotalEquityValueUsd,
    Object.keys(issuersBreakdown).length,
    holdingHistory
  );

  // 9. Build contributing wallets breakdown
  const contributingWallets = walletPayloads.map((p) => {
    const contrib = walletContributions.get(p.wallet.id) || { valueUsd: 0, holdingCount: 0 };
    return {
      id: p.wallet.id,
      address: p.wallet.address,
      label: p.wallet.label || (p.wallet.isPrimary ? 'Primary' : 'Trading'),
      entryMethod: p.wallet.entryMethod,
      connectorName: p.wallet.connectorName,
      isPrimary: p.wallet.isPrimary,
      holdingCount: contrib.holdingCount,
      valueUsd: Number(contrib.valueUsd.toFixed(2)),
    };
  });

  return {
    walletAddress: primaryWalletAddress,
    walletCount: walletPayloads.length,
    contributingWallets,
    holdings: recognizedHoldings,
    consolidatedHoldings,
    unknownTokens,
    totalValueUsd: Number(grandTotalEquityValueUsd.toFixed(2)),
    totalSharesCount: Number(grandTotalSharesCount.toFixed(2)),
    totalAssetsCount: recognizedHoldings.length,
    unrecognizedTokensCount: unknownTokens.length,
    solBalance: Number(totalSolBalance.toFixed(4)),
    solBalanceUsd,
    totalNetWorthUsd,
    performance,
    pricingFreshness,
    sectorAllocation,
    milestones,
    holdingHistory,
    recentTransactions: aggregatedTransactions,
    diversificationIndex,
    issuersBreakdown,
    topAllocationTicker,
    updatedAt: new Date().toISOString(),
    isMockData: isAnyMock,
    dataSource: compositeDataSource,
  };
}
