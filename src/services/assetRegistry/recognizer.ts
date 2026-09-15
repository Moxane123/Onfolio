/**
 * Onfolio — Asset Recognizer Service
 * Detects whether a Solana token account corresponds to a recognized tokenized equity or RWA.
 */

import { TokenizedEquity } from '../../types';
import { MINT_MAP, SYMBOL_MAP, TICKER_MAP, VERIFIED_TOKENIZED_EQUITIES } from './catalog';

export interface TokenRecognitionResult {
  isRecognized: boolean;
  equity?: TokenizedEquity;
  confidence: 'EXACT_MINT_MATCH' | 'SYMBOL_MATCH' | 'UNRECOGNIZED';
  reason?: string;
}

export function recognizeToken(
  mintAddress: string,
  symbolHint?: string,
  nameHint?: string
): TokenRecognitionResult {
  const normalizedMint = mintAddress.trim().toLowerCase();

  // 1. Direct mint address match
  if (MINT_MAP.has(normalizedMint)) {
    return {
      isRecognized: true,
      equity: MINT_MAP.get(normalizedMint),
      confidence: 'EXACT_MINT_MATCH',
    };
  }

  // 2. Exact token symbol match (e.g., 'dAAPL', 'bSPY')
  if (symbolHint) {
    const normSymbol = symbolHint.trim().toUpperCase();
    if (SYMBOL_MAP.has(normSymbol)) {
      return {
        isRecognized: true,
        equity: SYMBOL_MAP.get(normSymbol),
        confidence: 'SYMBOL_MATCH',
        reason: `Matched registered ticker symbol: ${normSymbol}`,
      };
    }

    // Check underlying ticker (e.g. user or token named 'AAPL')
    if (TICKER_MAP.has(normSymbol)) {
      return {
        isRecognized: true,
        equity: TICKER_MAP.get(normSymbol),
        confidence: 'SYMBOL_MATCH',
        reason: `Matched underlying equity ticker: ${normSymbol}`,
      };
    }
  }

  // 3. Heuristic matching on token name (e.g., "Apple Inc.", "Backed S&P 500")
  if (nameHint) {
    const lowerName = nameHint.toLowerCase();
    const candidate = VERIFIED_TOKENIZED_EQUITIES.find((asset) =>
      lowerName.includes(asset.companyName.toLowerCase()) ||
      lowerName.includes(asset.underlyingTicker.toLowerCase())
    );

    if (candidate) {
      return {
        isRecognized: true,
        equity: candidate,
        confidence: 'SYMBOL_MATCH',
        reason: `Matched verified company description: ${candidate.companyName}`,
      };
    }
  }

  return {
    isRecognized: false,
    confidence: 'UNRECOGNIZED',
    reason: 'Token is not registered in the verified Onfolio Tokenized Equity Registry',
  };
}

export function getAllVerifiedEquities(): TokenizedEquity[] {
  return [...VERIFIED_TOKENIZED_EQUITIES];
}
