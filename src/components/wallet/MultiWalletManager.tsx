/**
 * Onfolio — Multi-Wallet Manager
 *
 * Mandate:
 * "One person may have:
 *  - a main wallet
 *  - a trading wallet
 *  - a cold wallet
 *  - another wallet used for a different application
 *  Onfolio should allow these to contribute to one portfolio.
 *
 *  Create:
 *  Add Wallet
 *  The user can:
 *  - connect another wallet
 *  - add another public wallet address
 *
 *  Each wallet should have a clear label.
 *  Example: Primary, Trading, Cold Storage.
 *  The user can rename labels.
 *
 *  PASSPORT:
 *  Show: '3 verified wallets' but do not automatically expose all wallet addresses publicly.
 *
 *  PRIVACY:
 *  Users should be able to remove a wallet from their Onfolio portfolio.
 *  Explain what removing a wallet does:
 *  'It removes this wallet's data from your Onfolio portfolio view. It does not affect the wallet or blockchain.'"
 */

import React, { useState } from 'react';
import {
  Layers,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Wallet as WalletIcon,
  Search,
  X,
  ShieldCheck,
  Eye,
  Edit2,
  Star,
  AlertTriangle,
  Info,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatAbbreviatedAddress,
  getSolanaExplorerUrl,
} from '../../services/wallet/walletService';

interface MultiWalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddWallet: () => void;
}

const PRESET_LABELS = ['Primary', 'Trading', 'Cold Storage', 'DeFi / App', 'Treasury', 'Vault'];

export const MultiWalletManager: React.FC<MultiWalletManagerProps> = ({
  isOpen,
  onClose,
  onOpenAddWallet,
}) => {
  const {
    discoveredWallets,
    portfolio,
    renameWallet,
    removeWallet,
    setPrimaryWallet,
  } = useApp();

  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState<string>('');
  const [walletToRemove, setWalletToRemove] = useState<{ id: string; label: string; address: string } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRename = (walletId: string, currentLabel: string) => {
    setEditingWalletId(walletId);
    setEditingLabelValue(currentLabel);
  };

  const handleSaveRename = (walletId: string) => {
    if (editingLabelValue.trim()) {
      renameWallet(walletId, editingLabelValue.trim());
    }
    setEditingWalletId(null);
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleConfirmRemove = async () => {
    if (walletToRemove) {
      await removeWallet(walletToRemove.id);
      setWalletToRemove(null);
    }
  };

  const totalWallets = discoveredWallets.length;
  const totalValue = portfolio?.totalValueUsd || 0;
  const totalAssets = portfolio?.totalAssetsCount || 0;

  return (
    <div
      id="multi-wallet-manager-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="multi-wallet-manager-modal"
        className="relative w-full max-w-xl bg-white border border-[#E8E3DC] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#191F28]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F0ECE5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center text-[#D26E46] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#191F28]">Portfolio Wallets</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB]">
                  {totalWallets} {totalWallets === 1 ? 'wallet' : 'verified wallets'}
                </span>
              </div>
              <p className="text-xs text-[#798596] mt-0.5">
                All addresses contribute verified holdings to your single unified passport.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-wallet-manager-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unified Portfolio Summary Bar */}
        <div className="my-4 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3DC] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#798596] tracking-wider">
              UNIFIED PORTFOLIO VALUE
            </div>
            <div className="text-lg font-bold font-mono text-[#191F28] mt-0.5">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-[#798596] tracking-wider">
              ASSETS RECOGNIZED
            </div>
            <div className="text-xs font-semibold text-[#2A7954] mt-0.5 flex items-center justify-end space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{totalAssets} positions verified</span>
            </div>
          </div>
        </div>

        {/* Wallets List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {discoveredWallets.length === 0 ? (
            <div className="text-center py-10 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8E3DC] p-6">
              <Layers className="w-8 h-8 text-[#798596] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#191F28]">No wallets connected</p>
              <p className="text-[11px] text-[#798596] mt-1">
                Add your primary, trading, or cold storage wallets to generate your passport.
              </p>
            </div>
          ) : (
            discoveredWallets.map((w) => {
              const isPrimary = w.isPrimary;
              const isConnected = w.entryMethod === 'connected';
              const abbreviated = formatAbbreviatedAddress(w.address, 4, 4);
              const isEditing = editingWalletId === w.id;

              return (
                <div
                  key={w.id}
                  id={`discovered-wallet-${w.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPrimary
                      ? 'bg-white border-[#D26E46] shadow-sm ring-1 ring-[#D26E46]/20'
                      : 'bg-white border-[#E8E3DC] hover:border-[#D5CFC5]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Wallet Identity & Label */}
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isConnected
                            ? 'bg-[#E8F5EE] text-[#2A7954]'
                            : 'bg-[#EEF2F6] text-[#475569]'
                        }`}
                      >
                        {isConnected ? (
                          <WalletIcon className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Label Row with Rename Editing */}
                        {isEditing ? (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingLabelValue}
                                onChange={(e) => setEditingLabelValue(e.target.value)}
                                className="px-2.5 py-1 text-xs font-bold border border-[#D26E46] rounded-lg bg-[#FAF8F5] focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(w.id);
                                  if (e.key === 'Escape') setEditingWalletId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(w.id)}
                                className="px-2 py-1 bg-[#191F28] text-white text-[10px] font-semibold rounded-md cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingWalletId(null)}
                                className="text-[10px] text-[#798596] hover:text-[#191F28] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {PRESET_LABELS.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setEditingLabelValue(p)}
                                  className="text-[9px] px-1.5 py-0.5 bg-[#FAF8F5] hover:bg-[#F2EEE9] border border-[#E8E3DC] rounded text-[#798596] cursor-pointer"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#191F28]">{w.label}</span>
                            <button
                              type="button"
                              onClick={() => handleStartRename(w.id, w.label)}
                              className="p-1 text-[#798596] hover:text-[#D26E46] transition-colors cursor-pointer"
                              title="Rename wallet label"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            {isPrimary && (
                              <span className="inline-flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#D26E46] font-semibold border border-[#F1D8CB]">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Primary Identity</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Address & Badges */}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-mono text-[#475569]">{abbreviated}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(w.address)}
                            className="text-[#798596] hover:text-[#191F28] cursor-pointer p-0.5"
                            title="Copy address"
                          >
                            {copiedAddress === w.address ? (
                              <Check className="w-3 h-3 text-[#2A7954]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={getSolanaExplorerUrl(w.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#798596] hover:text-[#D26E46] cursor-pointer p-0.5"
                            title="Inspect on Solscan"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              isConnected
                                ? 'bg-[#E8F5EE] text-[#1B603D]'
                                : 'bg-[#EEF2F6] text-[#334155]'
                            }`}
                          >
                            {isConnected ? 'Connected' : 'Scanned'}
                          </span>
                        </div>

                        {/* Contribution Summary */}
                        {w.portfolioSummary && (
                          <div className="text-[11px] text-[#798596] mt-1.5 flex items-center space-x-2">
                            <span>Contributes:</span>
                            <span className="text-[#191F28] font-bold font-mono">
                              ${w.portfolioSummary.verifiedValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-[#2A7954]">
                              {w.portfolioSummary.holdingCount} assets
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryWallet(w.id)}
                          className="text-[11px] font-semibold text-[#191F28] hover:text-[#D26E46] bg-[#FAF8F5] hover:bg-[#F2EEE9] border border-[#E8E3DC] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setWalletToRemove({
                            id: w.id,
                            label: w.label,
                            address: w.address,
                          })
                        }
                        className="p-1.5 text-[#798596] hover:text-[#C13B2E] hover:bg-[#FCEDEC] rounded-xl transition-colors cursor-pointer"
                        title="Remove wallet from portfolio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 mt-4 border-t border-[#F0ECE5] flex items-center justify-between gap-3">
          <div className="text-xs text-[#798596] hidden sm:flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-[#D26E46]" />
            <span>Holdings are deduplicated across all verified addresses.</span>
          </div>

          <button
            type="button"
            id="open-add-wallet-from-manager-btn"
            onClick={() => {
              onClose();
              onOpenAddWallet();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-2.5 px-5 bg-[#191F28] hover:bg-[#2C3440] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D26E46]" />
            <span>Add Another Wallet</span>
          </button>
        </div>

        {/* Confirmation Modal for Removing Wallet */}
        {walletToRemove && (
          <div
            id="remove-wallet-dialog-backdrop"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setWalletToRemove(null)}
          >
            <div
              id="remove-wallet-dialog"
              className="bg-white border border-[#E8E3DC] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 text-[#C13B2E]">
                <div className="w-10 h-10 rounded-2xl bg-[#FCEDEC] border border-[#F5C2BF] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#191F28]">Remove Wallet?</h4>
                  <p className="text-xs text-[#798596]">
                    {walletToRemove.label} ({formatAbbreviatedAddress(walletToRemove.address, 4, 4)})
                  </p>
                </div>
              </div>

              {/* Exact User Requested Human Explanation */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl text-xs text-[#475569] leading-relaxed">
                <p className="font-semibold text-[#191F28] mb-1">
                  "It removes this wallet's data from your Onfolio portfolio view. It does not affect the wallet or blockchain."
                </p>
                <p className="text-[11px] text-[#798596]">
                  Your private keys and onchain assets remain untouched. You can re-add this address at any time.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletToRemove(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#798596] hover:text-[#191F28] transition-colors cursor-pointer"
                >
                  Keep Wallet
                </button>
                <button
                  type="button"
                  id="confirm-remove-wallet-btn"
                  onClick={handleConfirmRemove}
                  className="px-4 py-2 bg-[#C13B2E] hover:bg-[#A82F24] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Remove Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
