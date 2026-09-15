/**
 * Onfolio — Privacy & Selective Disclosure Layer
 *
 * Provides cryptographic masking and selective disclosure controls:
 * - Full disclosure (public audit)
 * - Masked Balances (proof of tier & equity holding without revealing exact net worth)
 * - Anonymous Passport (masked address for credential presentation)
 */

import { Passport, Portfolio, PrivacyMode, VerificationRecord } from '../../types';

export function formatMaskedCurrency(
  valueUsd: number,
  mode: PrivacyMode,
  currency = '$'
): string {
  if (mode === 'masked_balances' || mode === 'anonymous_pass') {
    if (valueUsd >= 100000) return `${currency}***,***`;
    if (valueUsd >= 10000) return `${currency}**,***`;
    if (valueUsd >= 1000) return `${currency}*,***`;
    return `${currency}***`;
  }
  return `${currency}${valueUsd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMaskedBalance(amount: number, mode: PrivacyMode): string {
  if (mode === 'masked_balances' || mode === 'anonymous_pass') {
    return '***.**';
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatMaskedAddress(address: string, mode: PrivacyMode): string {
  if (!address) return '';
  if (mode === 'anonymous_pass') {
    return `zk-Pass#${address.slice(0, 4)}••••${address.slice(-3)}`;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function generateVerifiableCredentialJson(
  passport: Passport,
  portfolio: Portfolio,
  record: VerificationRecord,
  mode: PrivacyMode
): string {
  const credential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://onfolio.network/contexts/v1.jsonld',
    ],
    id: `urn:onfolio:passport:${passport.passportId}`,
    type: ['VerifiableCredential', 'OnchainInvestmentPassport'],
    issuer: {
      id: record.credentialSummary.issuer,
      name: 'Onfolio Protocol Verification Engine',
    },
    issuanceDate: passport.issuanceDate,
    expirationDate: passport.validUntil,
    credentialSubject: {
      id: mode === 'anonymous_pass' ? 'did:zk:anonymous-holder' : record.credentialSummary.subject,
      tier: passport.tier,
      tierTitle: passport.title,
      onchainScore: passport.onchainScore,
      equityHoldingCount: passport.holdingCount,
      verifiedValueRangeUsd:
        mode === 'masked_balances' || mode === 'anonymous_pass'
          ? `Tier: ${passport.tier}`
          : passport.verifiedEquityValueUsd,
      primaryIssuers: passport.primaryIssuers,
      underlyingSecurities: passport.underlyingEquities,
      jurisdictionCompliance: passport.jurisdictionCompliance,
    },
    proof: {
      type: 'SolanaEd25519LedgerAttestation2024',
      created: record.verifiedAt,
      verificationMethod: record.verificationMethod,
      solanaBlockSlot: record.solanaBlockSlot,
      dataHash: record.dataHash,
      isLiveOnchain: record.isVerifiableOnchain,
      checksum: passport.checksum,
    },
  };

  return JSON.stringify(credential, null, 2);
}
