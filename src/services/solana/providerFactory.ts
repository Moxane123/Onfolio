/**
 * Onfolio — Provider Factory
 * Manages active Solana data provider instance, automatic fallback, and endpoint overrides.
 */

import { SolanaDevAdapter } from './devAdapter';
import { SolanaRpcDataProvider } from './rpcProvider';
import { ISolanaDataProvider } from './types';

let currentRpcProvider: SolanaRpcDataProvider | null = null;
let currentDevAdapter: SolanaDevAdapter | null = null;

export function getSolanaDataProvider(
  forceDevAdapter = false,
  customRpcUrl?: string
): ISolanaDataProvider {
  if (forceDevAdapter) {
    if (!currentDevAdapter) {
      currentDevAdapter = new SolanaDevAdapter();
    }
    return currentDevAdapter;
  }

  if (!currentRpcProvider) {
    currentRpcProvider = new SolanaRpcDataProvider(customRpcUrl);
  } else if (customRpcUrl && currentRpcProvider.getEndpoint() !== customRpcUrl) {
    currentRpcProvider.setEndpoint(customRpcUrl);
  }

  return currentRpcProvider;
}
