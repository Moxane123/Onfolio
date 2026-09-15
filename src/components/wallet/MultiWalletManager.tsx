import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatAbbreviatedAddress,
  getSolanaExplorerUrl,
} from '../../services/wallet/walletService';

interface MultiWalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanNew: () => void;
  onOpenConnectNew: () => void;
}

export const MultiWalletManager: React.FC<MultiWalletManagerProps> = ({
  isOpen,
  onClose,
  onOpenScanNew,
  onOpenConnectNew,
}) => {
  const { discoveredWallets, wallet, selectWallet, removeWallet } = useApp();

  if (!isOpen) return null;

  return (
    <div
      id="multi-wallet-manager-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="multi-wallet-manager-modal"
        className="relative w-full max-w-lg bg-white border border-[#E8E3DC] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#191F28]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DC] flex items-center justify-center text-[#D26E46]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Discovered Wallets</h3>
              <p className="text-xs text-[#798596]">
                Multi-wallet portfolio registry ({discoveredWallets.length} indexed)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallets List */}
        <div className="my-5 space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {discoveredWallets.length === 0 ? (
            <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8E3DC]">
              <p className="text-xs text-[#798596]">No wallets discovered yet.</p>
            </div>
          ) : (
            discoveredWallets.map((w) => {
              const isActive = w.address.toLowerCase() === wallet.address.toLowerCase();
              const isConnected = w.entryMethod === 'connected';
              const abbreviated = formatAbbreviatedAddress(w.address, 4, 4);

              return (
                <div
                  key={w.id}
                  id={`discovered-wallet-${w.id}`}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[#FAF8F5] border-[#D26E46] shadow-2xs ring-1 ring-[#D26E46]/30'
                      : 'bg-white border-[#E8E3DC] hover:border-[#D5CFC5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
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

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#191F28] truncate font-mono">
                            {abbreviated}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isConnected
                                ? 'bg-[#E8F5EE] text-[#1B603D] border border-[#C2E4D2]'
                                : 'bg-[#EEF2F6] text-[#334155] border border-[#CBD5E1]'
                            }`}
                          >
                            {isConnected ? 'Wallet connected' : 'Address scanned'}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#798596] flex items-center gap-2 mt-0.5">
                          <span>{w.connectorName}</span>
                          {w.portfolioSummary && (
                            <>
                              <span>•</span>
                              <span className="text-[#191F28] font-medium">
                                ${w.portfolioSummary.verifiedValueUsd.toLocaleString()}
                              </span>
                              <span>({w.portfolioSummary.holdingCount} assets)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isActive ? (
                        <span className="flex items-center space-x-1 text-[11px] font-semibold text-[#2A7954] bg-[#E8F5EE] px-2.5 py-1 rounded-lg">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            selectWallet(w.id);
                            onClose();
                          }}
                          className="text-[11px] font-semibold text-[#191F28] hover:text-[#D26E46] bg-[#FAF8F5] hover:bg-[#F2EEE9] border border-[#E8E3DC] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      )}

                      <a
                        href={getSolanaExplorerUrl(w.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-[#798596] hover:text-[#191F28] cursor-pointer"
                        title="View on Solscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => removeWallet(w.id)}
                        className="p-1 text-[#798596] hover:text-[#C13B2E] cursor-pointer"
                        title="Remove from discovered list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#F0ECE5] flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenConnectNew();
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#191F28] hover:bg-[#2C3440] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <WalletIcon className="w-4 h-4 text-[#D26E46]" />
            <span>Connect Another Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenScanNew();
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F2EEE9] border border-[#E8E3DC] text-xs font-semibold text-[#191F28] rounded-xl transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#798596]" />
            <span>Scan Another Address</span>
          </button>
        </div>
      </div>
    </div>
  );
};
