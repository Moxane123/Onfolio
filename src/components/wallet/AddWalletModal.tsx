/**
 * Onfolio — Add Wallet Modal
 *
 * Mandate:
 * "Create:
 *  Add Wallet
 *  The user can:
 *  - connect another wallet
 *  - add another public wallet address
 *  Each wallet should have a clear label.
 *  Example: Primary, Trading, Cold Storage.
 *  The user can rename labels.
 *
 *  SECURITY & READ-ONLY RULE:
 *  Adding a public wallet address must remain read-only.
 *  Do not require transaction signatures merely to add an address."
 */

import React, { useState } from 'react';
import {
  X,
  Search,
  Wallet as WalletIcon,
  ShieldCheck,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEV_SAMPLE_WALLETS } from '../../services/solana/devAdapter';
import { classifySolanaAddress } from '../../services/wallet/walletService';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LABELS = ['Primary', 'Trading', 'Cold Storage', 'DeFi / App', 'Treasury', 'Vault'];

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose }) => {
  const { addWallet, isScanning, scanError, preferences, discoveredWallets } = useApp();

  const [activeTab, setActiveTab] = useState<'address' | 'connect'>('address');
  const [addressInput, setAddressInput] = useState('');
  const [labelInput, setLabelInput] = useState(() => {
    // Smart default label based on how many wallets exist
    if (discoveredWallets.length === 0) return 'Primary';
    if (discoveredWallets.length === 1) return 'Trading';
    if (discoveredWallets.length === 2) return 'Cold Storage';
    return `Wallet ${discoveredWallets.length + 1}`;
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: string) => {
    setLabelInput(preset);
  };

  const handleQuickSelectSample = (sampleAddress: string, defaultLabel: string) => {
    setAddressInput(sampleAddress);
    setLabelInput(defaultLabel);
    setValidationError(null);
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanAddress = addressInput.trim();
    if (!cleanAddress) {
      setValidationError('Please enter a Solana wallet address.');
      return;
    }

    const classification = classifySolanaAddress(cleanAddress);
    if (!classification.isValid) {
      setValidationError(
        classification.errorReason || 'Invalid Solana address format. Must be a 32-44 character Base58 string.'
      );
      return;
    }

    if (classification.isSystemProgram) {
      setValidationError('This address is a Solana system program ID, not a user equity wallet.');
      return;
    }

    const cleanLabel = labelInput.trim() || (discoveredWallets.length === 0 ? 'Primary' : 'Secondary');

    setIsSubmitting(true);
    try {
      await addWallet(cleanAddress, cleanLabel, 'scanned', 'Public Ledger Scan');
      onClose();
      setAddressInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add wallet';
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectProvider = async (providerId: string, simulate = false) => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const cleanLabel = labelInput.trim() || (discoveredWallets.length === 0 ? 'Primary' : 'Trading');
      const connectorName =
        providerId === 'phantom'
          ? 'Phantom'
          : providerId === 'solflare'
          ? 'Solflare'
          : providerId === 'backpack'
          ? 'Backpack'
          : 'Sandbox Simulator';

      // Pass address dummy if simulate or browser connect
      await addWallet(
        '', // resolved in AppContext connect handler
        cleanLabel,
        'connected',
        connectorName,
        simulate
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet connection failed';
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-wallet-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="add-wallet-modal"
        className="relative w-full max-w-lg bg-white border border-[#E8E3DC] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#191F28]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F0ECE5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center text-[#D26E46] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Add Wallet to Passport</h3>
              <p className="text-xs text-[#798596] mt-0.5">
                Aggregate supported holdings across multiple Solana addresses into one unified portfolio.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-add-wallet-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#E8E3DC] mt-4">
          <button
            type="button"
            id="add-wallet-tab-address"
            onClick={() => setActiveTab('address')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'address'
                ? 'bg-white text-[#191F28] shadow-xs border border-[#E8E3DC]'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Add Public Address</span>
          </button>

          <button
            type="button"
            id="add-wallet-tab-connect"
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-white text-[#191F28] shadow-xs border border-[#E8E3DC]'
                : 'text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <WalletIcon className="w-3.5 h-3.5 text-[#D26E46]" />
            <span>Connect Wallet</span>
          </button>
        </div>

        {/* Wallet Label Section */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-[#191F28] flex items-center justify-between">
            <span>Wallet Label</span>
            <span className="text-[11px] text-[#798596] font-normal">Renamable anytime</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="wallet-label-input"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. Primary, Trading, Cold Storage"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] text-[#191F28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D26E46]/30 focus:border-[#D26E46]"
            />
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_LABELS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  labelInput === preset
                    ? 'bg-[#FAF0EB] text-[#D26E46] border-[#D26E46] font-semibold'
                    : 'bg-[#FAF8F5] text-[#798596] border-[#E8E3DC] hover:text-[#191F28] hover:border-[#D5CFC5]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Add Public Address Form */}
        {activeTab === 'address' && (
          <form onSubmit={handleSubmitAddress} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#191F28] flex items-center justify-between">
                <span>Public Solana Address</span>
                <span className="text-[10px] font-mono text-[#798596]">Base58</span>
              </label>
              <input
                type="text"
                id="public-wallet-address-input"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Paste public Solana address (e.g., 9xQe... or 4v6N...)"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] text-[#191F28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D26E46]/30 focus:border-[#D26E46]"
                disabled={isSubmitting || isScanning}
              />
            </div>

            {/* Error Display */}
            {(validationError || scanError) && (
              <div className="p-3 bg-[#FCEDEC] border border-[#F5C2BF] rounded-xl flex items-start space-x-2 text-xs text-[#C13B2E]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError || scanError}</span>
              </div>
            )}

            {/* Sandbox Quick Selects (if in dev mode or testing) */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#798596] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D26E46]" />
                <span>Quick Test Profiles (Sandbox Wallets)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickSelectSample(DEV_SAMPLE_WALLETS[1].address, 'Trading')
                  }
                  className="p-2 text-left bg-white border border-[#E8E3DC] hover:border-[#D26E46] rounded-xl transition-all cursor-pointer text-xs"
                >
                  <div className="font-semibold text-[#191F28] flex items-center justify-between">
                    <span>Macro & Index</span>
                    <span className="text-[10px] text-[#2A7954] font-mono">SPY / TSMC</span>
                  </div>
                  <div className="text-[10px] text-[#798596] truncate mt-0.5">
                    Label: Trading
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickSelectSample(DEV_SAMPLE_WALLETS[2].address, 'Cold Storage')
                  }
                  className="p-2 text-left bg-white border border-[#E8E3DC] hover:border-[#D26E46] rounded-xl transition-all cursor-pointer text-xs"
                >
                  <div className="font-semibold text-[#191F28] flex items-center justify-between">
                    <span>Growth Pioneer</span>
                    <span className="text-[10px] text-[#2A7954] font-mono">TSLA / MSFT</span>
                  </div>
                  <div className="text-[10px] text-[#798596] truncate mt-0.5">
                    Label: Cold Storage
                  </div>
                </button>
              </div>
            </div>

            {/* Read-Only Security Assurance Banner */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl flex items-start space-x-2 text-[11px] text-[#475569]">
              <ShieldCheck className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#191F28]">Strictly Read-Only:</span> Adding a public wallet address merely indexes its verified equity holdings into your local Onfolio view. Zero transaction signatures or private keys required.
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#798596] hover:text-[#191F28] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-add-wallet-btn"
                disabled={isSubmitting || isScanning}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#191F28] hover:bg-[#2C3440] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Indexing Onchain Holdings...</span>
                ) : (
                  <>
                    <span>Add to Unified Portfolio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D26E46]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Connect Wallet Form */}
        {activeTab === 'connect' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-[#798596]">
              Connect another browser wallet extension. Adding a wallet is strictly read-only and will never prompt for transaction approvals.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleConnectProvider('phantom')}
                className="w-full p-3.5 rounded-2xl border border-[#E8E3DC] hover:border-[#D26E46] bg-[#FAF8F5] hover:bg-white flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#AB9FF2]/20 border border-[#AB9FF2]/40 flex items-center justify-center text-[#5C45C4] font-bold text-xs">
                    👻
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#191F28] group-hover:text-[#D26E46] transition-colors">
                      Phantom
                    </div>
                    <div className="text-[11px] text-[#798596]">Connect installed extension</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#798596] group-hover:text-[#D26E46] transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleConnectProvider('solflare')}
                className="w-full p-3.5 rounded-2xl border border-[#E8E3DC] hover:border-[#D26E46] bg-[#FAF8F5] hover:bg-white flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FC8122]/15 border border-[#FC8122]/30 flex items-center justify-center text-[#FC8122] font-bold text-xs">
                    ☀️
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#191F28] group-hover:text-[#D26E46] transition-colors">
                      Solflare
                    </div>
                    <div className="text-[11px] text-[#798596]">Connect installed extension</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#798596] group-hover:text-[#D26E46] transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleConnectProvider('backpack')}
                className="w-full p-3.5 rounded-2xl border border-[#E8E3DC] hover:border-[#D26E46] bg-[#FAF8F5] hover:bg-white flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E33E38]/15 border border-[#E33E38]/30 flex items-center justify-center text-[#E33E38] font-bold text-xs">
                    🎒
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#191F28] group-hover:text-[#D26E46] transition-colors">
                      Backpack
                    </div>
                    <div className="text-[11px] text-[#798596]">Connect installed extension</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#798596] group-hover:text-[#D26E46] transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleConnectProvider('sandbox', true)}
                className="w-full p-3.5 rounded-2xl border border-dashed border-[#D26E46]/40 hover:border-[#D26E46] bg-[#FAF0EB]/60 hover:bg-[#FAF0EB] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D26E46]/20 border border-[#D26E46]/40 flex items-center justify-center text-[#D26E46]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#D26E46]">
                      Simulated Extension (Sandbox Adapter)
                    </div>
                    <div className="text-[11px] text-[#798596]">Instant testnet connection without browser extension</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#D26E46]" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl flex items-start space-x-2 text-[11px] text-[#475569]">
              <Lock className="w-4 h-4 text-[#2A7954] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#191F28]">Read-Only Verification:</span> Only public addresses are queried to audit token accounts. No signatures or approvals are ever requested.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
