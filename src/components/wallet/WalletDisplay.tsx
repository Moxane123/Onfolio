import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Eye,
  LogOut,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  copyToClipboard,
  formatAbbreviatedAddress,
  getSolanaExplorerUrl,
} from '../../services/wallet/walletService';

interface WalletDisplayProps {
  onOpenMultiWallet?: () => void;
  showDisconnect?: boolean;
}

export const WalletDisplay: React.FC<WalletDisplayProps> = ({
  onOpenMultiWallet,
  showDisconnect = true,
}) => {
  const { wallet, disconnect, discoveredWallets } = useApp();
  const [copied, setCopied] = useState(false);

  if (!wallet.address) return null;

  const isConnected = wallet.entryMethod === 'connected';
  const abbreviated = formatAbbreviatedAddress(wallet.address, 4, 4);
  const explorerUrl = getSolanaExplorerUrl(wallet.address);

  const handleCopy = async () => {
    const success = await copyToClipboard(wallet.address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="wallet-display-badge"
      className="inline-flex flex-wrap items-center gap-2 p-2 sm:p-2.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl shadow-2xs"
    >
      {/* Explicit Security State Distinction: "Wallet connected" vs "Address scanned" */}
      {isConnected ? (
        <div
          id="status-wallet-connected"
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#E8F5EE] border border-[#C2E4D2] rounded-xl text-xs font-semibold text-[#1B603D]"
          title="Browser wallet connected via read-only adapter. No private keys or signatures requested."
        >
          <span className="w-2 h-2 rounded-full bg-[#2A7954] animate-pulse"></span>
          <span>Wallet connected</span>
          <span className="text-[10px] opacity-75 font-mono">({wallet.connectorName})</span>
        </div>
      ) : (
        <div
          id="status-address-scanned"
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#EEF2F6] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#334155]"
          title="Public Solana ledger scan. Zero browser extension connection or permissions required."
        >
          <Eye className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Address scanned</span>
          <span className="text-[10px] opacity-75 font-mono">(Read-Only)</span>
        </div>
      )}

      {/* Abbreviated Solana Address */}
      <div className="flex items-center space-x-1 pl-1">
        <span
          id="formatted-solana-address"
          className="font-mono text-xs font-bold text-[#191F28] tracking-tight"
          title={wallet.address}
        >
          {abbreviated}
        </span>

        {/* Copy Button */}
        <button
          id="copy-wallet-address-btn"
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-md text-[#798596] hover:text-[#191F28] hover:bg-white transition-colors cursor-pointer"
          title={copied ? 'Copied to clipboard!' : 'Copy full Solana address'}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#2A7954]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* External Block Explorer Link */}
        <a
          id="solana-explorer-link"
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-md text-[#798596] hover:text-[#D26E46] hover:bg-white transition-colors cursor-pointer"
          title="View account on Solscan Block Explorer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Multi-Wallet Collection Counter (if more than 1 wallet discovered) */}
      {discoveredWallets.length > 1 && onOpenMultiWallet && (
        <button
          id="open-multi-wallet-btn"
          type="button"
          onClick={onOpenMultiWallet}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white border border-[#E8E3DC] text-[11px] font-semibold text-[#4A5361] hover:text-[#191F28] cursor-pointer"
          title="Manage discovered wallets"
        >
          <Layers className="w-3 h-3 text-[#D26E46]" />
          <span>{discoveredWallets.length} Wallets</span>
          <ChevronDown className="w-3 h-3 text-[#798596]" />
        </button>
      )}

      {/* Disconnect / Reset Button */}
      {showDisconnect && (
        <button
          id="disconnect-wallet-action-btn"
          type="button"
          onClick={disconnect}
          className="p-1 rounded-md text-[#798596] hover:text-[#C13B2E] hover:bg-white transition-colors cursor-pointer ml-auto"
          title={isConnected ? 'Disconnect wallet' : 'Clear scanned address'}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
