/**
 * Onfolio — Asset Recognizer Service
 *
 * Authoritatively identifies whether a Solana token corresponds to a verified tokenized equity or RWA.
 *
 * CRITICAL RULE (Audit Mandate):
 * "Never identify an asset solely by ticker/symbol. A token saying 'AAPL' is not automatically Apple stock.
 * Use trusted metadata/issuer mappings and explicit registry records."
 *
 * The registry supports multiple tokenized representations of the same underlying asset:
 * UNDERLYING SECURITY → TOKENIZED REPRESENTATION → ISSUER → SOLANA MINT.
 *
 * Unknown assets must remain visible as unknown tokens rather than being falsely classified.
 */

import { TokenizedEquity } from '../../types';
import { recordToTokenizedEquity } from './catalog';
import { assetRegistry } from './registry';
import {
  AssetRecognitionResult,
  AssetVerificationStatus,
  TokenizedAssetRecord,
  UnderlyingSecurity,
} from './types';

export interface TokenRecognitionResult {
  isRecognized: boolean;
  status: AssetVerificationStatus;
  equity?: TokenizedEquity;
  record?: TokenizedAssetRecord;
  underlying?: UnderlyingSecurity;
  confidence: 'EXACT_MINT_MATCH' | 'REJECTED_IMPOSTOR' | 'UNREGISTERED_MINT';
  isImpostorRisk: boolean;
  detectedTickerMatch?: string;
  reason?: string;
}

export function recognizeToken(
  mintAddress: string,
  symbolHint?: string,
  nameHint?: string
): TokenRecognitionResult {
  const result: AssetRecognitionResult = assetRegistry.verifyToken(
    mintAddress,
    symbolHint,
    nameHint
  );

  if (result.isRecognized && result.asset) {
    return {
      isRecognized: true,
      status: result.status,
      equity: recordToTokenizedEquity(result.asset),
      record: result.asset,
      underlying: result.underlying,
      confidence: 'EXACT_MINT_MATCH',
      isImpostorRisk: false,
      reason: result.reason,
    };
  }

  // Impostor risk detection
  const isImpostor = result.confidence === 'REJECTED_IMPOSTOR';

  return {
    isRecognized: false,
    status: result.status,
    confidence: isImpostor ? 'REJECTED_IMPOSTOR' : 'UNREGISTERED_MINT',
    isImpostorRisk: isImpostor,
    detectedTickerMatch: result.detectedTickerMatch,
    reason: result.reason,
  };
}

export function getAllVerifiedEquities(): TokenizedEquity[] {
  return assetRegistry.getAllAssets().map(recordToTokenizedEquity);
}

export function getRegistryStats() {
  return assetRegistry.getStats();
}
