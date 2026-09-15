/**
 * Onfolio — Wallet Layer Service
 *
 * STRICT SECURITY PRINCIPLES ENFORCED:
 * - Read-only public address discovery ONLY.
 * - ZERO transaction signing or approval requests.
 * - No seed phrase or private key handling.
 * - No fund custody.
 * - Unconditional support for manual address pasting without connecting a wallet.
 */

import { DiscoveredWallet, Wallet, WalletEntryMethod } from '../../types';

// Declare standard browser wallet provider shape
export interface SolanaWindowProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toString(): string };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on?(event: string, handler: (args: unknown) => void): void;
}

declare global {
  interface Window {
    solana?: SolanaWindowProvider;
    phantom?: { solana?: SolanaWindowProvider };
    solflare?: SolanaWindowProvider;
    backpack?: SolanaWindowProvider;
  }
}

/** Base58 character set regex for Solana public keys (32 to 44 characters) */
const SOLANA_BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Known Solana core system programs (valid Base58 addresses, but not user equity wallets) */
export const SOLANA_SYSTEM_PROGRAMS: Record<string, string> = {
  '11111111111111111111111111111111': 'Solana System Program',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'SPL Token Program',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022 Program',
  'Vote111111111111111111111111111111111111111': 'Solana Vote Program',
  'Stake11111111111111111111111111111111111111': 'Solana Stake Program',
  'SysvarRent111111111111111111111111111111111': 'Sysvar Rent Program',
  'ComputeBudget111111111111111111111111111111': 'Compute Budget Program',
  'AddressLookupTab1e1111111111111111111111111': 'Address Lookup Table Program',
};

/**
 * Validates whether an address is a valid Solana Base58 public key.
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return SOLANA_BASE58_REGEX.test(trimmed);
}

/**
 * Classifies an address to detect whether it's valid, malformed, or a non-user system program ID.
 */
export function classifySolanaAddress(address: string): {
  isValid: boolean;
  isSystemProgram: boolean;
  programName?: string;
  errorReason?: string;
} {
  const trimmed = address ? address.trim() : '';

  if (!trimmed) {
    return { isValid: false, isSystemProgram: false, errorReason: 'Empty address' };
  }

  if (trimmed.length < 32 || trimmed.length > 44) {
    return {
      isValid: false,
      isSystemProgram: false,
      errorReason: `Invalid length (${trimmed.length} chars). Solana addresses must be between 32 and 44 characters.`,
    };
  }

  if (!SOLANA_BASE58_REGEX.test(trimmed)) {
    return {
      isValid: false,
      isSystemProgram: false,
      errorReason: 'Invalid characters. Solana Base58 does not use 0, O, I, or l.',
    };
  }

  // Check if it is a core system program ID
  if (SOLANA_SYSTEM_PROGRAMS[trimmed]) {
    return {
      isValid: true,
      isSystemProgram: true,
      programName: SOLANA_SYSTEM_PROGRAMS[trimmed],
      errorReason: `This address is the ${SOLANA_SYSTEM_PROGRAMS[trimmed]}, not a user equity wallet.`,
    };
  }

  return { isValid: true, isSystemProgram: false };
}

/**
 * Abbreviates long wallet addresses throughout the UI: 7xK...92Ab
 */
export function formatAbbreviatedAddress(address: string, lead = 4, tail = 4): string {
  if (!address) return '';
  const trimmed = address.trim();
  if (trimmed.length <= lead + tail + 2) return trimmed;
  return `${trimmed.slice(0, lead)}...${trimmed.slice(-tail)}`;
}

/**
 * Generates external block explorer URL for verifying onchain holdings
 */
export function getSolanaExplorerUrl(address: string): string {
  return `https://solscan.io/account/${encodeURIComponent(address.trim())}`;
}

/**
 * Safe clipboard copy with fallback for iframe sandboxes
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to textarea fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export interface WalletProviderOption {
  id: string;
  name: string;
  isInstalled: boolean;
  icon: string;
  description: string;
}

export function detectInstalledWallets(): WalletProviderOption[] {
  if (typeof window === 'undefined') return [];

  const hasPhantom = !!(window.solana?.isPhantom || window.phantom?.solana?.isPhantom);
  const hasSolflare = !!(window.solflare?.isSolflare || window.solana?.isSolflare);
  const hasBackpack = !!window.backpack;

  return [
    {
      id: 'phantom',
      name: 'Phantom',
      isInstalled: hasPhantom,
      icon: 'phantom',
      description: 'Popular Solana multi-chain self-custody wallet',
    },
    {
      id: 'solflare',
      name: 'Solflare',
      isInstalled: hasSolflare,
      icon: 'solflare',
      description: 'Solana-native self-custody wallet with institutional features',
    },
    {
      id: 'backpack',
      name: 'Backpack',
      isInstalled: hasBackpack,
      icon: 'backpack',
      description: 'xNFT and Solana ecosystem wallet',
    },
  ];
}

/**
 * Connects to a detected browser wallet in strict read-only mode.
 * ONLY the public key is requested. Never requests signatures or transaction authorization.
 */
export async function connectReadonlyWallet(providerId?: string): Promise<{
  address: string;
  connectorName: string;
  entryMethod: WalletEntryMethod;
}> {
  if (typeof window === 'undefined') {
    throw new Error('Window environment is not available');
  }

  let provider: SolanaWindowProvider | undefined;
  let detectedName = 'Solana Wallet';

  if (providerId === 'phantom') {
    provider = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : undefined);
    detectedName = 'Phantom';
  } else if (providerId === 'solflare') {
    provider = window.solflare || (window.solana?.isSolflare ? window.solana : undefined);
    detectedName = 'Solflare';
  } else if (providerId === 'backpack') {
    provider = window.backpack;
    detectedName = 'Backpack';
  } else {
    // Auto-detect priority
    provider =
      window.phantom?.solana ||
      (window.solana?.isPhantom ? window.solana : undefined) ||
      window.solflare ||
      window.backpack ||
      window.solana;

    if (provider?.isPhantom) detectedName = 'Phantom';
    else if (provider?.isSolflare) detectedName = 'Solflare';
    else if (window.backpack) detectedName = 'Backpack';
  }

  if (!provider) {
    throw new Error(
      `No ${providerId ? providerId : 'Solana'} wallet extension detected in this browser. You can scan any public address directly without connecting!`
    );
  }

  try {
    // Only requests public key connection. NEVER asks for signatures or transaction approval.
    const res = await provider.connect();
    const address = res?.publicKey?.toString() || provider.publicKey?.toString();

    if (!address || !isValidSolanaAddress(address)) {
      throw new Error('Could not retrieve a valid public address from the connected wallet.');
    }

    return {
      address,
      connectorName: detectedName,
      entryMethod: 'connected',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('User rejected') || err.message.includes('cancelled')) {
        throw new Error('Connection request was declined by the user in their wallet.');
      }
      throw err;
    }
    throw new Error('Failed to connect wallet for read-only address discovery.');
  }
}

/**
 * For development/iframe testing where browser extensions cannot inject:
 * Provides clean simulated read-only wallet connection without asking for keys.
 */
export function simulateExtensionConnection(providerName = 'Phantom (Sandbox)'): {
  address: string;
  connectorName: string;
  entryMethod: WalletEntryMethod;
} {
  // Use a known live Solana public address for simulation
  const demoAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
  return {
    address: demoAddress,
    connectorName: providerName,
    entryMethod: 'connected',
  };
}

export async function disconnectWallet(): Promise<void> {
  const provider = window.phantom?.solana || window.solflare || window.backpack || window.solana;
  if (provider && typeof provider.disconnect === 'function') {
    try {
      await provider.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}

export function createInitialWalletState(): Wallet {
  const detected = detectInstalledWallets();
  return {
    address: '',
    connected: false,
    entryMethod: 'scanned',
    connectorName: 'None',
    isReadOnlyScan: true,
    detectedProviders: detected.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      isInstalled: d.isInstalled,
    })),
  };
}

/**
 * Creates a new DiscoveredWallet entry for multi-wallet state management
 */
export function createDiscoveredWallet(
  address: string,
  entryMethod: WalletEntryMethod,
  connectorName: string,
  label?: string
): DiscoveredWallet {
  const short = formatAbbreviatedAddress(address, 3, 4);
  const defaultLabel =
    label ||
    (entryMethod === 'connected' ? `${connectorName} (${short})` : `Scanned (${short})`);

  return {
    id: `wallet-${address.slice(0, 8)}-${Date.now()}`,
    address,
    entryMethod,
    connectorName,
    label: defaultLabel,
    addedAt: new Date().toISOString(),
    isPrimary: true,
  };
}

