/**
 * Onfolio — Verification & Cryptographic Proof Drawer
 * Displays the immutable SHA-256 audit record, ledger slot, and W3C credential export.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Download,
  AlertTriangle,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateVerifiableCredentialJson } from '../../services/privacy/privacyManager';
import { performAuditChecks } from '../../services/verification/verifier';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const VerificationDrawer: React.FC = () => {
  const {
    passport,
    portfolio,
    verificationRecord,
    preferences,
    isVerificationModalOpen,
    setVerificationModalOpen,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'json'>('audit');

  if (!isVerificationModalOpen || !passport || !portfolio || !verificationRecord) {
    return null;
  }

  const auditChecks = performAuditChecks(portfolio, passport, verificationRecord);
  const credentialJson = generateVerifiableCredentialJson(
    passport,
    portfolio,
    verificationRecord,
    preferences.privacyMode
  );

  const handleCopyJson = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(credentialJson);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for iframe sandboxes
      const textArea = document.createElement('textarea');
      textArea.value = credentialJson;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.warn('Copy fallback failed', e);
      }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([credentialJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passport.passportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="verification-modal-card"
        className="bg-white rounded-3xl border border-[#E8E3DC] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191F28]">Cryptographic Verification Proof</h3>
              <p className="text-xs text-[#798596] font-mono">
                RECORD ID: {verificationRecord.recordId}
              </p>
            </div>
          </div>
          <button
            id="close-verification-modal-btn"
            onClick={() => setVerificationModalOpen(false)}
            className="p-1.5 text-[#798596] hover:text-[#191F28] hover:bg-[#F4F0EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#F0ECE5] px-6 bg-white">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            Ledger &amp; Regulatory Checks
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'json'
                ? 'border-[#D26E46] text-[#D26E46]'
                : 'border-transparent text-[#798596] hover:text-[#191F28]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Verifiable Credential (JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'audit' ? (
            <>
              {/* Snapshot Hash Summary */}
              <div className="bg-[#191F28] text-white p-4 rounded-2xl font-mono space-y-2 border border-[#2A3542]">
                <div className="flex items-center justify-between text-[#A5AFBD]">
                  <span>SHA-256 STATE DIGEST</span>
                  <span>Solana Slot #{verificationRecord.solanaBlockSlot?.toLocaleString()}</span>
                </div>
                <div className="text-[#E8926F] font-bold break-all">
                  {verificationRecord.dataHash}
                </div>
                <div className="text-[11px] text-[#A5AFBD] pt-2 border-t border-[#2A3542] flex justify-between">
                  <span>Verification Method:</span>
                  <span className="text-white">{verificationRecord.verificationMethod}</span>
                </div>
              </div>

              {/* Data Provenance Warning if in Mock/Sandbox Mode */}
              {!verificationRecord.isVerifiableOnchain && (
                <div className="p-3 bg-[#FEF8E7] border border-[#FCE6B5] rounded-xl flex items-start space-x-2 text-xs text-[#B87002]">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Development Adapter Notice:</strong> This passport proof was generated
                    using the isolated Sandbox Development Adapter for evaluation and testing. It
                    does not represent live mainnet ledger state until switched to Live Solana RPC.
                  </div>
                </div>
              )}

              {/* Audit Checklist */}
              <div>
                <h4 className="text-xs font-bold text-[#191F28] uppercase tracking-wider mb-3">
                  Verification Criteria
                </h4>
                <div className="space-y-2.5">
                  {auditChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3.5 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#191F28]">{check.name}</div>
                        <div className="text-xs text-[#798596] mt-0.5">{check.details}</div>
                      </div>
                      <Badge
                        variant={
                          check.status === 'passed'
                            ? 'success'
                            : check.status === 'info'
                            ? 'neutral'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#798596]">
                <span>W3C-compatible Verifiable Credential standard format</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyJson}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#2A7954]" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={handleDownloadJson}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download JSON
                  </Button>
                </div>
              </div>
              <pre className="p-4 bg-[#191F28] text-[#E8E3DC] rounded-2xl font-mono text-xs overflow-x-auto max-h-[380px] border border-[#2A3542]">
                {credentialJson}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#F0ECE5] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#798596]">
          <span>Non-transferable onchain investment passport credential</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setVerificationModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
