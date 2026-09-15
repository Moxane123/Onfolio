/**
 * Onfolio — Application State Context
 * Orchestrates wallet discovery, Solana data fetching, asset recognition,
 * portfolio calculation, passport generation, and verification proofs.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { calculatePortfolio } from '../services/portfolio/calculator';
import { generatePassport } from '../services/passport/generator';
import { DEV_SAMPLE_WALLETS } from '../services/solana/devAdapter';
import { getSolanaDataProvider } from '../services/solana/providerFactory';
import { createVerificationRecord } from '../services/verification/verifier';
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
  UserPreferences,
  VerificationRecord,
  Wallet,
  WalletEntryMethod,
} from '../types';

interface AppContextType {
  wallet: Wallet;
  discoveredWallets: DiscoveredWallet[];
  activeWalletId: string | null;
  scannerState: ScannerState;
  portfolio: Portfolio | null;
  passport: Passport | null;
  verificationRecord: VerificationRecord | null;
  preferences: UserPreferences;
  isScanning: boolean;
  scanError: string | null;
  isVerificationModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isConnectWalletModalOpen: boolean;
  setConnectWalletModalOpen: (open: boolean) => void;
  scanAddress: (
    targetAddress: string,
    sourceLabel?: string,
    forceDev?: boolean,
    entryMethod?: WalletEntryMethod,
    connectorName?: string
  ) => Promise<void>;
  connectWallet: (providerId?: string, simulate?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletId: string) => Promise<void>;
  removeWallet: (walletId: string) => void;
  resetScannerState: () => void;
  setPrivacyMode: (mode: PrivacyMode) => void;
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
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [verificationRecord, setVerificationRecord] = useState<VerificationRecord | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isConnectWalletModalOpen, setConnectWalletModalOpen] = useState<boolean>(false);

  const resetScannerState = useCallback(() => {
    setScannerState('idle');
    setScanError(null);
  }, []);

  /**
   * Core Scan Workflow:
   * USER → WALLET ADDRESS → SOLANA DATA → ASSET RECOGNITION → PORTFOLIO → PASSPORT → VERIFICATION
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

      // State: Validating
      setScannerState('validating');
      setScanError(null);

      const classification = classifySolanaAddress(cleanAddress);

      if (!classification.isValid) {
        setScannerState('invalid address');
        setScanError(
          classification.errorReason ||
            'Invalid Solana address format. Must be a 32-44 character Base58 string.'
        );
        return;
      }

      if (classification.isSystemProgram) {
        setScannerState('unsupported address');
        setScanError(
          classification.errorReason ||
            'This address is a Solana system program ID, not a user equity wallet.'
        );
        return;
      }

      // State: Scanning
      setIsScanning(true);
      setScannerState('scanning');
      setScanError(null);

      // Check if address is a known demo sample profile
      const isKnownSample = DEV_SAMPLE_WALLETS.some(
        (s) => s.address.toLowerCase() === cleanAddress.toLowerCase()
      );
      const shouldUseDev = forceDev === true || isKnownSample || preferences.useDevAdapter;
      const entryMethod: WalletEntryMethod = explicitEntryMethod || (wallet.connected ? 'connected' : 'scanned');
      const connectorName = connectorNameOverride || (entryMethod === 'connected' ? wallet.connectorName : 'Public Ledger Scan');

      try {
        // 1. Obtain data provider (Live Solana RPC or Dev Adapter)
        const provider = getSolanaDataProvider(
          shouldUseDev,
          preferences.rpcEndpoint
        );

        // 2. Fetch Solana data concurrently
        const [tokenAccounts, solBalance, currentSlot] = await Promise.all([
          provider.fetchTokenAccounts(cleanAddress),
          provider.fetchSolBalance(cleanAddress),
          provider.getCurrentSlot().catch(() => 284152890),
        ]);

        // 3. Asset recognition & Portfolio calculation
        const calculatedPortfolio = calculatePortfolio(
          cleanAddress,
          tokenAccounts,
          solBalance,
          provider.isMock,
          provider.name
        );

        // 4. Generate Passport Credential
        const generatedPassport = generatePassport(calculatedPortfolio);

        // 5. Generate Verification Record with cryptographic hash
        const record = await createVerificationRecord(
          generatedPassport,
          calculatedPortfolio,
          currentSlot
        );

        // 6. Update state
        setPortfolio(calculatedPortfolio);
        setPassport(generatedPassport);
        setVerificationRecord(record);

        const updatedWallet: Wallet = {
          ...wallet,
          address: cleanAddress,
          entryMethod,
          connectorName,
          connected: entryMethod === 'connected',
          isReadOnlyScan: entryMethod === 'scanned',
          label: sourceLabel || (entryMethod === 'connected' ? `${connectorName} (${cleanAddress.slice(0, 4)}...${cleanAddress.slice(-4)})` : 'Scanned Address'),
        };
        setWallet(updatedWallet);

        // Multi-Wallet registry abstraction
        setDiscoveredWallets((prev) => {
          const existingIndex = prev.findIndex(
            (w) => w.address.toLowerCase() === cleanAddress.toLowerCase()
          );
          const walletSummary = {
            verifiedValueUsd: generatedPassport.verifiedEquityValueUsd,
            holdingCount: generatedPassport.holdingCount,
            tier: generatedPassport.tier,
          };

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              entryMethod,
              connectorName,
              portfolioSummary: walletSummary,
              isPrimary: true,
            };
            return updated.map((w, idx) => ({ ...w, isPrimary: idx === existingIndex }));
          } else {
            const newDiscovered = createDiscoveredWallet(
              cleanAddress,
              entryMethod,
              connectorName,
              sourceLabel
            );
            newDiscovered.portfolioSummary = walletSummary;
            return [newDiscovered, ...prev.map((w) => ({ ...w, isPrimary: false }))];
          }
        });

        // 7. Resolve Scanner State
        if (calculatedPortfolio.holdings.length === 0) {
          setScannerState('no supported assets');
        } else {
          setScannerState('success');
        }
      } catch (err: unknown) {
        console.error('Scan error:', err);
        const errMsg = err instanceof Error ? err.message : String(err);

        // If public RPC fails with 403 or rate limits, gracefully fallback to Sandbox simulation
        if (errMsg.includes('403') || errMsg.includes('rate limit') || errMsg.includes('429')) {
          console.warn('RPC restricted or rate limited, falling back to Sandbox Adapter');
          try {
            const fallbackProvider = getSolanaDataProvider(true);
            const [tokenAccounts, solBalance, currentSlot] = await Promise.all([
              fallbackProvider.fetchTokenAccounts(cleanAddress),
              fallbackProvider.fetchSolBalance(cleanAddress),
              fallbackProvider.getCurrentSlot(),
            ]);
            const calculatedPortfolio = calculatePortfolio(
              cleanAddress,
              tokenAccounts,
              solBalance,
              true,
              'Sandbox Simulation (Live RPC Fallback)'
            );
            const generatedPassport = generatePassport(calculatedPortfolio);
            const record = await createVerificationRecord(
              generatedPassport,
              calculatedPortfolio,
              currentSlot
            );
            setPortfolio(calculatedPortfolio);
            setPassport(generatedPassport);
            setVerificationRecord(record);
            setWallet((prev) => ({
              ...prev,
              address: cleanAddress,
              entryMethod,
              connectorName,
              connected: entryMethod === 'connected',
              isReadOnlyScan: entryMethod === 'scanned',
              label: sourceLabel || (entryMethod === 'connected' ? prev.label : 'Scanned Address'),
            }));
            setPreferences((prev) => ({ ...prev, useDevAdapter: true }));
            setScannerState(calculatedPortfolio.holdings.length === 0 ? 'no supported assets' : 'partial data');
            setScanError(
              'Public RPC experienced network throttling. Ingested via Sandbox Simulation.'
            );
            return;
          } catch (fallbackErr) {
            console.error('Fallback error:', fallbackErr);
          }
        }

        setScannerState('network error');
        setScanError(errMsg);
      } finally {
        setIsScanning(false);
      }
    },
    [preferences.useDevAdapter, preferences.rpcEndpoint, wallet]
  );

  /** Read-only wallet connection (Phantom / Solflare / Backpack / Simulated) */
  const connectWallet = useCallback(
    async (providerId?: string, simulate = false) => {
      setIsScanning(true);
      setScanError(null);
      setScannerState('validating');

      try {
        let connectionResult: { address: string; connectorName: string; entryMethod: WalletEntryMethod };

        if (simulate) {
          const providerName =
            providerId === 'solflare'
              ? 'Solflare (Sandbox)'
              : providerId === 'backpack'
              ? 'Backpack (Sandbox)'
              : 'Phantom (Sandbox)';
          connectionResult = simulateExtensionConnection(providerName);
        } else {
          connectionResult = await connectReadonlyWallet(providerId);
        }

        const { address, connectorName, entryMethod } = connectionResult;

        setWallet((prev) => ({
          ...prev,
          address,
          connected: true,
          connectorName,
          entryMethod,
          isReadOnlyScan: false,
          label: `${connectorName} (${address.slice(0, 4)}...${address.slice(-4)})`,
        }));

        setConnectWalletModalOpen(false);

        // Automatically scan the newly connected public address with entryMethod 'connected'
        await scanAddress(address, `${connectorName} Wallet`, simulate, 'connected', connectorName);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Wallet connection failed';
        setScannerState('network error');
        setScanError(message);
      } finally {
        setIsScanning(false);
      }
    },
    [scanAddress]
  );

  /** Disconnect wallet */
  const disconnect = useCallback(async () => {
    await disconnectBrowserWallet();
    setWallet(createInitialWalletState());
    setPortfolio(null);
    setPassport(null);
    setVerificationRecord(null);
    setScannerState('idle');
    setScanError(null);
  }, []);

  /** Switch active wallet from multi-wallet list */
  const selectWallet = useCallback(
    async (walletId: string) => {
      const selected = discoveredWallets.find((w) => w.id === walletId);
      if (!selected) return;

      setActiveWalletId(walletId);
      setDiscoveredWallets((prev) =>
        prev.map((w) => ({ ...w, isPrimary: w.id === walletId }))
      );

      await scanAddress(
        selected.address,
        selected.label,
        undefined,
        selected.entryMethod,
        selected.connectorName
      );
    },
    [discoveredWallets, scanAddress]
  );

  /** Remove wallet from multi-wallet list */
  const removeWallet = useCallback((walletId: string) => {
    setDiscoveredWallets((prev) => prev.filter((w) => w.id !== walletId));
  }, []);

  const setPrivacyMode = useCallback((mode: PrivacyMode) => {
    setPreferences((prev) => ({ ...prev, privacyMode: mode }));
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
      await scanAddress(sampleAddress, 'Sample Portfolio', true, 'scanned', 'Public Ledger Scan');
    },
    [scanAddress]
  );

  // Initialize with the first sample profile for instant demonstration if no address has been scanned
  useEffect(() => {
    const initialSample = DEV_SAMPLE_WALLETS[0];
    if (!portfolio && !isScanning) {
      loadSampleProfile(initialSample.address);
    }
  }, [loadSampleProfile, portfolio, isScanning]);

  const value: AppContextType = {
    wallet,
    discoveredWallets,
    activeWalletId,
    scannerState,
    portfolio,
    passport,
    verificationRecord,
    preferences,
    isScanning,
    scanError,
    isVerificationModalOpen,
    isSettingsModalOpen,
    isConnectWalletModalOpen,
    setConnectWalletModalOpen,
    scanAddress,
    connectWallet,
    disconnect,
    selectWallet,
    removeWallet,
    resetScannerState,
    setPrivacyMode,
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
