import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  Wallet as WalletIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { detectInstalledWallets, WalletProviderOption } from '../../services/wallet/walletService';

export const ConnectWalletModal: React.FC = () => {
  const { isConnectWalletModalOpen, setConnectWalletModalOpen, connectWallet, isScanning } = useApp();
  const [providers, setProviders] = React.useState<WalletProviderOption[]>([]);

  useEffect(() => {
    if (isConnectWalletModalOpen) {
      setProviders(detectInstalledWallets());
    }
  }, [isConnectWalletModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnectWalletModalOpen) {
        setConnectWalletModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnectWalletModalOpen, setConnectWalletModalOpen]);

  if (!isConnectWalletModalOpen) return null;

  const handleProviderSelect = async (provider: WalletProviderOption) => {
    if (provider.isInstalled) {
      await connectWallet(provider.id, false);
    } else {
      // In sandbox/iframe environment or if not installed, allow simulated connection
      await connectWallet(provider.id, true);
    }
  };

  const handleSimulatedConnect = async () => {
    await connectWallet('phantom', true);
  };

  return (
    <div
      id="connect-wallet-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setConnectWalletModalOpen(false)}
    >
      <div
        id="connect-wallet-modal-container"
        className="relative w-full max-w-lg bg-white border border-[#E8E3DC] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[#191F28]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DC] flex items-center justify-center text-[#D26E46]">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Connect Solana Wallet</h3>
              <p className="text-xs text-[#798596]">Read-only public address discovery</p>
            </div>
          </div>
          <button
            id="close-connect-wallet-modal-btn"
            type="button"
            onClick={() => setConnectWalletModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#798596] hover:text-[#191F28] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Non-Custodial Guarantee */}
        <div className="my-5 p-4 bg-[#F5F8F6] border border-[#D5EADF] rounded-2xl">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#2A7954] mt-0.5 shrink-0" />
            <div className="text-xs text-[#2A4838] leading-relaxed">
              <span className="font-semibold text-[#1B5238] block mb-1">
                Zero-Permission Read-Only Guarantee
              </span>
              Onfolio only requests your public address to discover tokenized equities on the Solana ledger. We{' '}
              <strong className="text-[#1B5238]">never</strong> request seed phrases, private keys, transaction approvals, or unnecessary signatures.
            </div>
          </div>
        </div>

        {/* Provider List */}
        <div className="space-y-2.5 my-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#798596] font-semibold block mb-2">
            Available Wallet Adapters
          </span>

          {providers.map((provider) => (
            <button
              key={provider.id}
              id={`connect-provider-${provider.id}`}
              type="button"
              disabled={isScanning}
              onClick={() => handleProviderSelect(provider)}
              className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F5] hover:bg-[#F2EEE9] border border-[#E8E3DC] hover:border-[#D5CFC5] rounded-2xl transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E3DC] flex items-center justify-center font-bold text-sm text-[#191F28] shadow-2xs group-hover:scale-105 transition-transform">
                  {provider.name[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-[#191F28]">{provider.name}</span>
                    {provider.isInstalled ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5F6ED] text-[#2A7954] font-medium border border-[#BDE8D1]">
                        Detected in browser
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#798596] font-medium border border-[#E8E3DC]">
                        Sandbox Adapter
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#798596] mt-0.5">{provider.description}</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#D26E46] group-hover:translate-x-0.5 transition-transform">
                Connect →
              </span>
            </button>
          ))}
        </div>

        {/* Quick Sandbox Extension Test Option */}
        <div className="pt-4 border-t border-[#F0ECE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5 text-[#798596]">
            <Sparkles className="w-3.5 h-3.5 text-[#D26E46]" />
            <span>Running in an iframe or sandbox?</span>
          </div>

          <button
            id="connect-sandbox-simulated-btn"
            type="button"
            onClick={handleSimulatedConnect}
            className="text-xs font-semibold text-[#191F28] hover:text-[#D26E46] underline decoration-[#D26E46]/40 cursor-pointer"
          >
            Connect Sandbox Wallet (Demo Address)
          </button>
        </div>

        {/* Footnote Reminder */}
        <p className="text-[11px] text-center text-[#798596] mt-4">
          Prefer not to connect? You can scan a public wallet without connecting it anytime using the scanner form.
        </p>
      </div>
    </div>
  );
};
