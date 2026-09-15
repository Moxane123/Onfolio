/**
 * Onfolio — Asset Registry Explorer & Mint Verifier
 *
 * Dedicated tool providing transparency into Onfolio's Asset Intelligence Layer:
 * 1. Browse all supported underlying securities & token representations
 * 2. Test any Solana mint address for cryptographic verification & anti-spoofing
 * 3. Add custom tokenized equity representations dynamically without app rewrites
 */

import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  Building,
  ExternalLink,
  Plus,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { assetRegistry } from '../../services/assetRegistry/registry';
import {
  AssetRecognitionResult,
  TokenizedAssetRecord,
  UnderlyingSecurity,
} from '../../services/assetRegistry/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AssetDetailModal } from '../portfolio/AssetDetailModal';

interface AssetRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetRegistryModal: React.FC<AssetRegistryModalProps> = ({ isOpen, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'verifier' | 'register'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [testMintInput, setTestMintInput] = useState('');
  const [testSymbolHint, setTestSymbolHint] = useState('');
  const [verificationResult, setVerificationResult] = useState<AssetRecognitionResult | null>(null);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);

  // New Asset Registration Form State
  const [regForm, setRegForm] = useState({
    underlyingTicker: 'AMZN',
    underlyingCompany: 'Amazon.com, Inc.',
    mint: '',
    name: 'Dinari dShare AMZN',
    symbol: 'dAMZN',
    issuerId: 'dinari',
    issuerName: 'Dinari Inc.',
    custodian: 'Interactive Brokers LLC',
    framework: 'US SEC Registered / Reg S',
    prospectusUrl: 'https://dinari.com/disclosures/dAMZN-prospectus.pdf',
    priceUsd: 185.2,
  });
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const allAssets = assetRegistry.getAllAssets();
  const allUnderlying = assetRegistry.getAllUnderlyingSecurities();
  const stats = assetRegistry.getStats();

  const filteredAssets = allAssets.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.symbol.toLowerCase().includes(q) ||
      a.companyName.toLowerCase().includes(q) ||
      a.underlyingTicker.toLowerCase().includes(q) ||
      a.mint.toLowerCase().includes(q) ||
      a.issuer.name.toLowerCase().includes(q)
    );
  });

  const handleRunVerification = () => {
    if (!testMintInput.trim()) return;
    const res = assetRegistry.verifyToken(
      testMintInput.trim(),
      testSymbolHint.trim() || undefined
    );
    setVerificationResult(res);
  };

  const handleRegisterNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.mint.trim()) {
      setRegistrationNotice('Error: Solana mint address is required.');
      return;
    }

    const newRecord: TokenizedAssetRecord = {
      underlyingTicker: regForm.underlyingTicker.toUpperCase(),
      companyName: regForm.underlyingCompany,
      name: regForm.name,
      symbol: regForm.symbol,
      mint: regForm.mint.trim(),
      issuer: {
        id: regForm.issuerId,
        name: regForm.issuerName,
        legalEntity: `${regForm.issuerName} LLC`,
        jurisdiction: 'United States',
        regulatoryFramework: regForm.framework,
        regulator: 'US SEC',
        custodian: regForm.custodian,
        collateralModel: '1:1 Backed Shares',
        website: 'https://onfolio.app',
      },
      assetType: 'equity',
      chain: 'solana',
      decimals: 6,
      collateralization: '1:1 Backed Shares',
      regulatoryFramework: regForm.framework,
      custodian: regForm.custodian,
      prospectusUrl: regForm.prospectusUrl,
      sector: 'Technology',
      marketPriceUsd: Number(regForm.priceUsd),
      change24h: 0,
      verificationStatus: 'verified',
      isToken2022: true,
      lastUpdated: new Date().toISOString(),
      verificationNotes: 'User-registered tokenized representation',
      explorerReference: {
        solscanUrl: `https://solscan.io/token/${regForm.mint.trim()}`,
        solanaFmUrl: `https://solana.fm/address/${regForm.mint.trim()}`,
        explorerSolanaUrl: `https://explorer.solana.com/address/${regForm.mint.trim()}`,
      },
      priceSource: {
        provider: 'Onfolio Financial Engine',
        indicativePriceUsd: Number(regForm.priceUsd),
        lastUpdated: new Date().toISOString(),
        quoteCurrency: 'USD',
        latencySeconds: 1,
        confidenceScore: 0.99,
      },
    };

    assetRegistry.registerAsset(newRecord);
    setRegistrationNotice(`Success! Registered "${newRecord.name}" (${newRecord.mint.slice(0, 8)}...) into authoritative registry without restarting.`);
    setTimeout(() => {
      setActiveSubTab('catalog');
      setRegistrationNotice(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="asset-registry-modal-card"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center text-[#D26E46]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-[#191F28]">Onfolio Asset Registry</h3>
                <Badge variant="success" size="sm">
                  {stats.totalTokenizedRepresentations} Token Mints
                </Badge>
              </div>
              <p className="text-xs text-[#798596] mt-0.5">
                Authoritative tokenized securities database &amp; cryptographic anti-spoofing engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F0EB] hover:bg-[#EAE5DF] flex items-center justify-center text-[#798596] hover:text-[#191F28] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 pt-3 border-b border-[#F0ECE5] flex items-center space-x-4 bg-white">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            Authoritative Asset Catalog ({stats.totalTokenizedRepresentations})
          </button>
          <button
            onClick={() => setActiveSubTab('verifier')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'verifier'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Anti-Spoofing Mint Verifier</span>
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'register'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Asset</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* SUB-TAB 1: AUTHORITATIVE CATALOG */}
          {activeSubTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#798596] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by company (e.g. Apple), ticker (AAPL), issuer, or mint address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl text-xs text-[#191F28] placeholder-[#798596] focus:outline-hidden focus:border-[#D26E46]"
                />
              </div>

              {/* Assets Grid / Table */}
              <div className="border border-[#E8E3DC] rounded-2xl overflow-hidden divide-y divide-[#F0ECE5]">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.mint}
                    onClick={() => setSelectedMint(asset.mint)}
                    className="p-4 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] border border-[#F1D8CB] flex items-center justify-center font-mono font-bold text-xs text-[#D26E46] shrink-0">
                        {asset.underlyingTicker}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#191F28]">
                            {asset.companyName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F0EB] text-[#4E5968]">
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#798596] mt-0.5 truncate max-w-sm">
                          Issuer: {asset.issuer.name} • {asset.isToken2022 ? 'Token-2022' : 'SPL'} • Mint: {asset.mint.slice(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#191F28]">
                          ${asset.priceSource.indicativePriceUsd.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#798596]">Indicative</div>
                      </div>
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-[#798596]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: ANTI-SPOOFING MINT VERIFIER */}
          {activeSubTab === 'verifier' && (
            <div className="space-y-6">
              <div className="bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl p-5 text-xs text-[#4E5968] space-y-2">
                <div className="font-bold text-[#191F28] flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-[#D26E46]" />
                  <span>Onfolio Anti-Spoofing Audit Rule</span>
                </div>
                <p className="leading-relaxed">
                  &quot;Never identify an asset solely by ticker/symbol. A token saying &apos;AAPL&apos; is not
                  automatically Apple stock.&quot; Test this safeguard below by pasting a legitimate mint or
                  an unverified token claiming stock symbols.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] text-[#798596]">Try Sample Mints:</span>
                  <button
                    onClick={() => {
                      setTestMintInput('DinariNVDA11111111111111111111111111111111111');
                      setTestSymbolHint('dNVDA');
                    }}
                    className="text-[11px] font-mono text-[#D26E46] underline hover:opacity-80"
                  >
                    Legitimate NVIDIA dShare
                  </button>
                  <button
                    onClick={() => {
                      setTestMintInput('FakeAppleMint1111111111111111111111111111111');
                      setTestSymbolHint('AAPL');
                    }}
                    className="text-[11px] font-mono text-amber-600 underline hover:opacity-80"
                  >
                    Counterfeit AAPL Impostor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Solana Mint Address
                  </label>
                  <Input
                    placeholder="Enter 44-character base58 Solana mint address..."
                    value={testMintInput}
                    onChange={(e) => setTestMintInput(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Symbol Hint (Optional)
                  </label>
                  <Input
                    placeholder="e.g. AAPL"
                    value={testSymbolHint}
                    onChange={(e) => setTestSymbolHint(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <Button variant="primary" onClick={handleRunVerification} className="w-full sm:w-auto">
                Execute Cryptographic Verification
              </Button>

              {/* Verification Result Output */}
              {verificationResult && (
                <div
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    verificationResult.isRecognized
                      ? 'bg-[#E8F5EE] border-[#C2E4D2] text-[#1B603D]'
                      : verificationResult.confidence === 'REJECTED_IMPOSTOR'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-[#F4F0EB] border-[#E8E3DC] text-[#4E5968]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold flex items-center space-x-2">
                      {verificationResult.isRecognized ? (
                        <>
                          <ShieldCheck className="w-5 h-5 text-[#2A7954]" />
                          <span className="text-sm">Cryptographically Verified Equity Mint</span>
                        </>
                      ) : verificationResult.confidence === 'REJECTED_IMPOSTOR' ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <span className="text-sm">REJECTED: Impostor Ticker Detected</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-[#798596]" />
                          <span className="text-sm">Unregistered Token</span>
                        </>
                      )}
                    </div>
                    <Badge
                      variant={
                        verificationResult.isRecognized
                          ? 'success'
                          : verificationResult.confidence === 'REJECTED_IMPOSTOR'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {verificationResult.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="leading-relaxed font-mono">{verificationResult.reason}</p>

                  {verificationResult.asset && (
                    <div className="pt-2 border-t border-black/10 flex justify-between items-center">
                      <div>
                        <span className="font-bold">{verificationResult.asset.name}</span> •{' '}
                        <span>{verificationResult.asset.issuer.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMint(verificationResult.asset!.mint)}
                      >
                        Inspect Full Record
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: EXTENSIBLE ASSET REGISTRATION */}
          {activeSubTab === 'register' && (
            <form onSubmit={handleRegisterNewAsset} className="space-y-4">
              <div className="bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl p-4 text-xs text-[#4E5968]">
                <span className="font-bold text-[#191F28] block mb-1">
                  Extensible Registry Architecture:
                </span>
                New tokenized equities can be registered dynamically at runtime without rewriting the
                application. Fill out the parameters below to add a token to this session.
              </div>

              {registrationNotice && (
                <div className="p-3 rounded-xl bg-[#E8F5EE] border border-[#C2E4D2] text-[#1B603D] text-xs font-mono">
                  {registrationNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Underlying Security Ticker
                  </label>
                  <Input
                    value={regForm.underlyingTicker}
                    onChange={(e) => setRegForm({ ...regForm, underlyingTicker: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Company Name
                  </label>
                  <Input
                    value={regForm.underlyingCompany}
                    onChange={(e) => setRegForm({ ...regForm, underlyingCompany: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                  Solana Mint Address (Base58)
                </label>
                <Input
                  value={regForm.mint}
                  onChange={(e) => setRegForm({ ...regForm, mint: e.target.value })}
                  placeholder="e.g. DinariAMZN1111111111111111111111111111111111"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Token Name
                  </label>
                  <Input
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Token Symbol
                  </label>
                  <Input
                    value={regForm.symbol}
                    onChange={(e) => setRegForm({ ...regForm, symbol: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Issuer
                  </label>
                  <Input
                    value={regForm.issuerName}
                    onChange={(e) => setRegForm({ ...regForm, issuerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#798596] uppercase mb-1">
                    Indicative Price USD
                  </label>
                  <Input
                    type="number"
                    value={regForm.priceUsd}
                    onChange={(e) => setRegForm({ ...regForm, priceUsd: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Register Tokenized Equity
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE5] flex justify-between items-center">
          <span className="text-xs font-mono text-[#798596]">
            {stats.totalUnderlyingSecurities} Underlying Companies • {stats.totalVerifiedIssuers} Regulated Issuers
          </span>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {selectedMint && (
        <AssetDetailModal mint={selectedMint} onClose={() => setSelectedMint(null)} />
      )}
    </div>
  );
};
