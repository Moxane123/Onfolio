/**
 * Onfolio — Settings & RPC Provider Configuration Modal
 * Allows switching between Live Solana Mainnet RPC and Sandbox Development Adapter,
 * configuring custom RPC endpoints (Helius, QuickNode, Triton, etc.), and testing connectivity.
 */

import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSolanaDataProvider } from '../../services/solana/providerFactory';
import { Button } from '../ui/Button';

export const SettingsModal: React.FC = () => {
  const {
    preferences,
    setUseDevAdapter,
    setRpcEndpoint,
    isSettingsModalOpen,
    setSettingsModalOpen,
    scanAddress,
    wallet,
  } = useApp();

  const [endpointInput, setEndpointInput] = useState(preferences.rpcEndpoint);
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestingStatus(null);
    try {
      const provider = getSolanaDataProvider(false, endpointInput);
      const health = await provider.healthCheck();
      if (health.ok) {
        setTestingStatus(`Connected successfully. Latency: ${health.latencyMs}ms (${health.message})`);
      } else {
        setTestingStatus(`Connection warning: ${health.message}`);
      }
    } catch (e: unknown) {
      setTestingStatus(`Connection failed: ${e instanceof Error ? e.message : 'Unreachable'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndApply = async () => {
    setRpcEndpoint(endpointInput);
    setSettingsModalOpen(false);
    if (wallet.address) {
      await scanAddress(wallet.address);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="settings-modal-card"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB] rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Solana Provider Configuration</h3>
              <p className="text-xs text-[#798596]">Manage RPC connection &amp; testing modes</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Provider Mode Selection */}
          <div>
            <label className="font-bold text-[#191F28] block mb-2">Operation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseDevAdapter(false)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  !preferences.useDevAdapter
                    ? 'border-[#D26E46] bg-[#FAF0EB] text-[#191F28] ring-1 ring-[#D26E46]'
                    : 'border-[#E8E3DC] bg-[#FAF8F5] text-[#4A5361] hover:bg-[#F4F0EB]'
                }`}
              >
                <div className="font-bold text-xs text-[#191F28]">Live Solana RPC</div>
                <div className="text-[11px] text-[#798596] mt-1">
                  Queries actual onchain SPL &amp; Token-2022 accounts on Solana Mainnet.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseDevAdapter(true)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  preferences.useDevAdapter
                    ? 'border-[#B87002] bg-[#FEF8E7] text-[#191F28] ring-1 ring-[#B87002]'
                    : 'border-[#E8E3DC] bg-[#FAF8F5] text-[#4A5361] hover:bg-[#F4F0EB]'
                }`}
              >
                <div className="font-bold text-xs text-[#191F28]">Sandbox Dev Adapter</div>
                <div className="text-[11px] text-[#798596] mt-1">
                  Isolated testing profiles. Immune to public RPC rate limits.
                </div>
              </button>
            </div>
          </div>

          {/* RPC Endpoint Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-[#191F28]">Solana RPC Endpoint URL</label>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-[11px] text-[#D26E46] hover:text-[#BF5D35] flex items-center space-x-1 font-semibold cursor-pointer"
              >
                {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Radio className="w-3 h-3" />}
                <span>Test Ping</span>
              </button>
            </div>
            <input
              type="text"
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              placeholder="https://api.mainnet-beta.solana.com"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl font-mono text-[#191F28] text-xs focus:bg-white focus:ring-2 focus:ring-[#D26E46] focus:border-[#D26E46] focus:outline-hidden"
            />
            <p className="text-[11px] text-[#798596] mt-1">
              Compatible with custom Solana endpoints (Helius, QuickNode, Triton, or private validators).
            </p>

            {testingStatus && (
              <div className="mt-2.5 p-2.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl text-[11px] font-mono text-[#191F28]">
                {testingStatus}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F0ECE5] bg-[#FAF8F5] flex items-center justify-end space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAndApply}
          >
            Save &amp; Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
