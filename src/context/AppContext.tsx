/**
 * Onfolio — Application State Context
 * Orchestrates multi-wallet discovery, Solana data fetching, asset recognition,
 * portfolio aggregation, passport generation, and verification proofs.
 *
 * Mandate:
 * "One person may have: a main wallet, a trading wallet, a cold wallet,
 * another wallet used for a different application. Onfolio should allow these
 * to contribute to one portfolio."
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { generatePassport } from '../services/passport/generator';
import { DEV_SAMPLE_WALLETS } from '../services/solana/devAdapter';
import { getSolanaDataProvider } from '../services/solana/providerFactory';
import { runOnchainPipeline } from '../services/solana/pipeline';
import { NormalizedOnchainData, RawTokenAccount } from '../services/solana/types';
import { createVerificationRecord } from '../services/verification/verifier';
import {
  aggregateMultiWalletPortfolio,
  WalletOnchainDataPayload,
} from '../services/portfolio/multiWalletAggregator';
import {
  classifySolanaAddress,
  connectReadonlyWallet,
  createDiscoveredWallet,
  createInitialWalletState,
  disconnectWallet as disconnectBrowserWallet,
  simulateExtensionConnection,
} from '../services/wallet/walletService';
import {
  DiscoveredWallet,
  Passport,
  Portfolio,
  PrivacyMode,
  ScannerState,
  Transaction,
  UserPreferences,
  VerificationRecord,
  Wallet,
  WalletEntryMethod,
} from '../types';
import { PrivacyControlsConfig } from '../types/privacy';
import { loadUserPrivacyControls, saveUserPrivacyControls } from '../services/privacy/sharingEngine';

const STORAGE_WALLETS_KEY = 'onfolio_wallets_v2';

interface CachedPipelineResult {
  normData: NormalizedOnchainData;
  tokenAccounts: RawTokenAccount[];
  solBalance: number;
  transactions: Transaction[];
  isMockData: boolean;
  dataSource: string;
  slot: number;
}

interface AppContextType {
  wallet: Wallet;
  discoveredWallets: DiscoveredWallet[];
  activeWalletId: string | null;
  scannerState: ScannerState;
  portfolio: Portfolio | null;
  passport: Passport | null;
  verificationRecord: VerificationRecord | null;
  normalizedData: NormalizedOnchainData | null;
  preferences: UserPreferences;
  isScanning: boolean;
  scanError: string | null;
  isVerificationModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isConnectWalletModalOpen: boolean;
  isRegistryModalOpen: boolean;
  isAddWalletModalOpen: boolean;
  isWalletManagerOpen: boolean;
  setConnectWalletModalOpen: (open: boolean) => void;
  setRegistryModalOpen: (open: boolean) => void;
  setAddWalletModalOpen: (open: boolean) => void;
  setWalletManagerOpen: (open: boolean) => void;
  scanAddress: (
    targetAddress: string,
    sourceLabel?: string,
    forceDev?: boolean,
    entryMethod?: WalletEntryMethod,
    connectorName?: string
  ) => Promise<void>;
  addWallet: (
    targetAddress: string,
    label: string,
    entryMethod?: WalletEntryMethod,
    connectorName?: string,
    simulate?: boolean
  ) => Promise<void>;
  renameWallet: (walletId: string, newLabel: string) => void;
  removeWallet: (walletId: string) => Promise<void>;
  setPrimaryWallet: (walletId: string) => Promise<void>;
  connectWallet: (providerId?: string, simulate?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletId: string) => Promise<void>;
  resetScannerState: () => void;
  setPrivacyMode: (mode: PrivacyMode) => void;
  updatePrivacyControls: (controls: Partial<PrivacyControlsConfig>) => void;
  setUseDevAdapter: (enabled: boolean) => void;
  setRpcEndpoint: (endpoint: string) => void;
  setVerificationModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  loadSampleProfile: (address: string) => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  privacyMode: 'public',
  selectedCurrency: 'USD',
  rpcEndpoint:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_ENDPOINT) ||
    '/api/solana-rpc',
  useDevAdapter: false,
  allowSharing: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet>(createInitialWalletState());
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_WALLETS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse failure
    }
    return [];
  });
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [verificationRecord, setVerificationRecord] = useState<VerificationRecord | null>(null);
  const [normalizedData, setNormalizedData] = useState<NormalizedOnchainData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Modals
  const [isVerificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isConnectWalletModalOpen, setConnectWalletModalOpen] = useState<boolean>(false);
  const [isRegistryModalOpen, setRegistryModalOpen] = useState<boolean>(false);
  const [isAddWalletModalOpen, setAddWalletModalOpen] = useState<boolean>(false);
  const [isWalletManagerOpen, setWalletManagerOpen] = useState<boolean>(false);

  // In-memory cache for onchain pipeline results per address
  const pipelineCache = useRef<Map<string, CachedPipelineResult>>(new Map());

  // Save discoveredWallets changes to localStorage
  const persistWallets = useCallback((wallets: DiscoveredWallet[]) => {
    try {
      localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(wallets));
    } catch {
      // Ignore localStorage failure
    }
  }, []);

  const resetScannerState = useCallback(() => {
    setScannerState('idle');
    setScanError(null);
  }, []);

  /**
   * Re-aggregates all discovered wallets into a unified portfolio and passport.
   */
  const reaggregateWallets = useCallback(
    async (walletsToAggregate: DiscoveredWallet[]): Promise<void> => {
      if (walletsToAggregate.length === 0) {
        setPortfolio(null);
        setPassport(null);
        setVerificationRecord(null);
        setNormalizedData(null);
        setScannerState('idle');
        return;
      }

      setIsScanning(true);
      setScannerState('scanning');
      setScanError(null);

      try {
        const payloads: WalletOnchainDataPayload[] = [];

        for (const w of walletsToAggregate) {
          const cacheKey = w.address.toLowerCase();
          let cached = pipelineCache.current.get(cacheKey);

          if (!cached) {
            const isKnownSample = DEV_SAMPLE_WALLETS.some(
              (s) => s.address.toLowerCase() === w.address.toLowerCase()
            );
            const shouldUseDev = isKnownSample || preferences.useDevAdapter;
            const provider = getSolanaDataProvider(shouldUseDev, preferences.rpcEndpoint);

            const pipelineResult = await runOnchainPipeline(w.address, provider);
            cached = {
              normData: pipelineResult.normalizedData,
              tokenAccounts: pipelineResult.rawTokens,
              solBalance: pipelineResult.solBalance,
              transactions: pipelineResult.transactions,
              isMockData: pipelineResult.portfolio.isMockData,
              dataSource: pipelineResult.portfolio.dataSource,
              slot: pipelineResult.slot,
            };
            pipelineCache.current.set(cacheKey, cached);
          }

          payloads.push({
            wallet: w,
            tokenAccounts: cached.tokenAccounts,
            solBalance: cached.solBalance,
            transactions: cached.transactions,
            isMockData: cached.isMockData,
            dataSource: cached.dataSource,
          });
        }

        // Aggregate across all wallets — avoid double counting, preserve token-level proofs
        const unifiedPortfolio = aggregateMultiWalletPortfolio(payloads);
        const generatedPassport = generatePassport(unifiedPortfolio);

        const primaryPayload = payloads.find((p) => p.wallet.isPrimary) || payloads[0];
        const primarySlot = primaryPayload ? pipelineCache.current.get(primaryPayload.wallet.address.toLowerCase())?.slot : undefined;

        const record = await createVerificationRecord(
          generatedPassport,
          unifiedPortfolio,
          primarySlot
        );

        setPortfolio(unifiedPortfolio);
        setPassport(generatedPassport);
        setVerificationRecord(record);
        if (primaryPayload) {
          setNormalizedData(pipelineCache.current.get(primaryPayload.wallet.address.toLowerCase())?.normData || null);
        }

        // Update each wallet's portfolio summary
        const updatedWallets = walletsToAggregate.map((w) => {
          const contrib = unifiedPortfolio.contributingWallets?.find((cw) => cw.id === w.id);
          return {
            ...w,
            portfolioSummary: contrib
              ? {
                  verifiedValueUsd: contrib.valueUsd,
                  holdingCount: contrib.holdingCount,
                  tier: generatedPassport.tier,
                }
              : w.portfolioSummary,
          };
        });

        setDiscoveredWallets(updatedWallets);
        persistWallets(updatedWallets);

        // Update active wallet representation
        const primaryW = updatedWallets.find((w) => w.isPrimary) || updatedWallets[0];
        if (primaryW) {
          setWallet({
            address: primaryW.address,
            connected: primaryW.entryMethod === 'connected',
            entryMethod: primaryW.entryMethod,
            connectorName: primaryW.connectorName,
            isReadOnlyScan: primaryW.entryMethod === 'scanned',
            label: primaryW.label,
            detectedProviders: [],
          });
          setActiveWalletId(primaryW.id);
        }

        if (unifiedPortfolio.holdings.length === 0) {
          setScannerState('no supported assets');
        } else {
          setScannerState('success');
        }
      } catch (err: unknown) {
        console.error('Multi-wallet aggregation error:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setScannerState('network error');
        setScanError(`Onchain data retrieval error: ${errMsg}`);
      } finally {
        setIsScanning(false);
      }
    },
    [preferences.useDevAdapter, preferences.rpcEndpoint, persistWallets]
  );

  /**
   * Add a new wallet to the unified passport (read-only, no signatures required).
   */
  const addWallet = useCallback(
    async (
      targetAddress: string,
      label: string,
      explicitEntryMethod?: WalletEntryMethod,
      connectorNameOverride?: string,
      simulate = false
    ) => {
      let cleanAddress = targetAddress.trim();
      let entryMethod: WalletEntryMethod = explicitEntryMethod || 'scanned';
      let connectorName = connectorNameOverride || 'Public Ledger Scan';

      // If connecting via extension or simulation
      if (entryMethod === 'connected' && !cleanAddress) {
        let connectionResult: { address: string; connectorName: string; entryMethod: WalletEntryMethod };
        if (simulate) {
          const provName = connectorNameOverride || 'Phantom (Sandbox)';
          connectionResult = simulateExtensionConnection(provName);
        } else {
          connectionResult = await connectReadonlyWallet();
        }
        cleanAddress = connectionResult.address;
        connectorName = connectionResult.connectorName;
        entryMethod = connectionResult.entryMethod;
      }

      const classification = classifySolanaAddress(cleanAddress);
      if (!classification.isValid) {
        throw new Error(
          classification.errorReason ||
            'Invalid Solana address format. Must be a 32-44 character Base58 string.'
        );
      }

      if (classification.isSystemProgram) {
        throw new Error('This address is a Solana system program ID, not a user equity wallet.');
      }

      // Check if wallet is already added
      const existing = discoveredWallets.find(
        (w) => w.address.toLowerCase() === cleanAddress.toLowerCase()
      );

      let nextWallets: DiscoveredWallet[];
      if (existing) {
        // Update label and details
        nextWallets = discoveredWallets.map((w) =>
          w.id === existing.id
            ? { ...w, label: label || w.label, entryMethod, connectorName }
            : w
        );
      } else {
        const isFirst = discoveredWallets.length === 0;
        const newWallet: DiscoveredWallet = {
          id: `w-${cleanAddress.slice(0, 6)}-${Date.now().toString(36)}`,
          address: cleanAddress,
          label: label || (isFirst ? 'Primary' : `Wallet ${discoveredWallets.length + 1}`),
          entryMethod,
          connectorName,
          addedAt: new Date().toISOString(),
          isPrimary: isFirst,
          sourceType: entryMethod === 'connected' ? 'solana_connected' : 'solana_address',
          chain: 'solana',
        };
        nextWallets = [...discoveredWallets, newWallet];
      }

      setDiscoveredWallets(nextWallets);
      persistWallets(nextWallets);

      // Re-aggregate unified portfolio with the newly added wallet
      await reaggregateWallets(nextWallets);
    },
    [discoveredWallets, persistWallets, reaggregateWallets]
  );

  /**
   * Rename a wallet's custom label (e.g. Primary, Trading, Cold Storage).
   */
  const renameWallet = useCallback(
    (walletId: string, newLabel: string) => {
      const cleanLabel = newLabel.trim();
      if (!cleanLabel) return;

      const updated = discoveredWallets.map((w) =>
        w.id === walletId ? { ...w, label: cleanLabel } : w
      );
      setDiscoveredWallets(updated);
      persistWallets(updated);

      // Immediate re-aggregation so holdings immediately reflect new wallet label
      reaggregateWallets(updated);
    },
    [discoveredWallets, persistWallets, reaggregateWallets]
  );

  /**
   * Remove a wallet from the Onfolio portfolio view.
   * "It removes this wallet's data from your Onfolio portfolio view. It does not affect the wallet or blockchain."
   */
  const removeWallet = useCallback(
    async (walletId: string) => {
      const target = discoveredWallets.find((w) => w.id === walletId);
      if (target) {
        pipelineCache.current.delete(target.address.toLowerCase());
      }

      const remaining = discoveredWallets.filter((w) => w.id !== walletId);

      // If removed wallet was primary, assign primary to first remaining
      if (remaining.length > 0 && !remaining.some((w) => w.isPrimary)) {
        remaining[0].isPrimary = true;
      }

      setDiscoveredWallets(remaining);
      persistWallets(remaining);

      if (remaining.length === 0) {
        setPortfolio(null);
        setPassport(null);
        setVerificationRecord(null);
        setNormalizedData(null);
        setWallet(createInitialWalletState());
        setActiveWalletId(null);
        setScannerState('idle');
      } else {
        await reaggregateWallets(remaining);
      }
    },
    [discoveredWallets, persistWallets, reaggregateWallets]
  );

  /**
   * Designate a wallet as the primary identity for the unified passport.
   */
  const setPrimaryWallet = useCallback(
    async (walletId: string) => {
      const updated = discoveredWallets.map((w) => ({
        ...w,
        isPrimary: w.id === walletId,
      }));
      setDiscoveredWallets(updated);
      persistWallets(updated);
      setActiveWalletId(walletId);

      await reaggregateWallets(updated);
    },
    [discoveredWallets, persistWallets, reaggregateWallets]
  );

  /**
   * Scan Address workflow (compatible with hero input and sample switchers).
   */
  const scanAddress = useCallback(
    async (
      targetAddress: string,
      sourceLabel?: string,
      forceDev?: boolean,
      explicitEntryMethod?: WalletEntryMethod,
      connectorNameOverride?: string
    ) => {
      const cleanAddress = targetAddress.trim();
      const isKnownSample = DEV_SAMPLE_WALLETS.some(
        (s) => s.address.toLowerCase() === cleanAddress.toLowerCase()
      );
      if (forceDev || isKnownSample) {
        setPreferences((prev) => ({ ...prev, useDevAdapter: true }));
      }

      const label = sourceLabel || (discoveredWallets.length === 0 ? 'Primary' : 'Scanned Address');
      await addWallet(
        cleanAddress,
        label,
        explicitEntryMethod || 'scanned',
        connectorNameOverride || 'Public Ledger Scan'
      );
    },
    [addWallet, discoveredWallets.length]
  );

  /** Read-only wallet connection (Phantom / Solflare / Backpack / Simulated) */
  const connectWallet = useCallback(
    async (providerId?: string, simulate = false) => {
      const provName =
        providerId === 'solflare'
          ? 'Solflare'
          : providerId === 'backpack'
          ? 'Backpack'
          : simulate
          ? 'Sandbox Simulator'
          : 'Phantom';

      await addWallet('', 'Primary', 'connected', provName, simulate);
      setConnectWalletModalOpen(false);
    },
    [addWallet]
  );

  /** Disconnect wallet and clear active session */
  const disconnect = useCallback(async () => {
    await disconnectBrowserWallet();
    setWallet(createInitialWalletState());
    setPortfolio(null);
    setPassport(null);
    setVerificationRecord(null);
    setNormalizedData(null);
    setScannerState('idle');
    setScanError(null);
    setDiscoveredWallets([]);
    persistWallets([]);
    pipelineCache.current.clear();
  }, [persistWallets]);

  /** Select active wallet / focus view */
  const selectWallet = useCallback(
    async (walletId: string) => {
      await setPrimaryWallet(walletId);
    },
    [setPrimaryWallet]
  );

  const setPrivacyMode = useCallback((mode: PrivacyMode) => {
    setPreferences((prev) => ({ ...prev, privacyMode: mode }));
  }, []);

  const updatePrivacyControls = useCallback((updated: Partial<PrivacyControlsConfig>) => {
    setPreferences((prev) => {
      const currentControls = prev.privacyControls || loadUserPrivacyControls();
      const next = { ...currentControls, ...updated };
      saveUserPrivacyControls(next);
      return { ...prev, privacyControls: next };
    });
  }, []);

  const setUseDevAdapter = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, useDevAdapter: enabled }));
  }, []);

  const setRpcEndpoint = useCallback((endpoint: string) => {
    setPreferences((prev) => ({ ...prev, rpcEndpoint: endpoint }));
  }, []);

  const loadSampleProfile = useCallback(
    async (sampleAddress: string) => {
      setPreferences((prev) => ({ ...prev, useDevAdapter: true }));
      await scanAddress(sampleAddress, 'Primary (Tech Allocator)', true, 'scanned', 'Public Ledger Scan');
    },
    [scanAddress]
  );

  // Initialize: if wallets stored in localStorage, re-aggregate them; else load default sample profile
  useEffect(() => {
    if (!portfolio && !isScanning) {
      if (discoveredWallets.length > 0) {
        reaggregateWallets(discoveredWallets);
      } else {
        const initialSample = DEV_SAMPLE_WALLETS[0];
        loadSampleProfile(initialSample.address);
      }
    }
  }, []); // Run once on mount

  const value: AppContextType = {
    wallet,
    discoveredWallets,
    activeWalletId,
    scannerState,
    portfolio,
    passport,
    verificationRecord,
    normalizedData,
    preferences,
    isScanning,
    scanError,
    isVerificationModalOpen,
    isSettingsModalOpen,
    isConnectWalletModalOpen,
    isRegistryModalOpen,
    isAddWalletModalOpen,
    isWalletManagerOpen,
    setConnectWalletModalOpen,
    setRegistryModalOpen,
    setAddWalletModalOpen,
    setWalletManagerOpen,
    scanAddress,
    addWallet,
    renameWallet,
    removeWallet,
    setPrimaryWallet,
    connectWallet,
    disconnect,
    selectWallet,
    resetScannerState,
    setPrivacyMode,
    updatePrivacyControls,
    setUseDevAdapter,
    setRpcEndpoint,
    setVerificationModalOpen,
    setSettingsModalOpen,
    loadSampleProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
