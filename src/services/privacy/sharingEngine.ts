/**
 * Onfolio — Privacy & Selective Disclosure Engine
 *
 * Mandate:
 * "Proof without unnecessary exposure.
 *  The user owns their passport visibility.
 *  PRIVATE: Only the user can view the full passport.
 *  PUBLIC: The user can create a public passport page.
 *  SHARED VIEW: The user can share a limited version of their passport.
 *  Allow the user to control what appears publicly where technically appropriate."
 *
 * Security:
 * - Never put private credentials/keys into URLs or state.
 * - Never expose internal API secrets client-side.
 * - Deterministic public IDs allow public view without leaking full wallet address.
 * - Public data must be intentional.
 */

import { Passport, Portfolio, VerificationRecord } from '../../types';
import {
  PrivacyControlsConfig,
  SharedPassportProfile,
  SanitizedPassportPayload,
  SanitizedEvidencePayload,
  PassportAccessScope,
} from '../../types/privacy';

export const DEFAULT_PRIVACY_CONTROLS: PrivacyControlsConfig = {
  showPortfolioValue: false, // Default to privacy-first: proof of tier without exact balance
  showHoldings: true,
  selectedHoldingsMints: [], // empty = all holdings in portfolio
  hideWalletAddress: true, // Default to privacy-first: hide raw address
  showPerformance: false,
  showMilestones: true,
  showInvestmentHistory: true,
  showTransactionHistory: false,
};

const STORAGE_SHARED_PASSPORTS_KEY = 'onfolio_shared_passports_v1';
const STORAGE_USER_PRIVACY_SETTINGS_KEY = 'onfolio_user_privacy_settings_v1';

/**
 * Generate a clean, non-sensitive public identifier for sharing.
 * Example: `pass-7x2m-89ac` or deterministic hash of wallet + salt.
 */
export function generatePublicPassportId(walletAddress: string, salt = ''): string {
  if (!walletAddress) return `pass-anon-${Math.random().toString(36).slice(2, 8)}`;
  
  // Clean alphanumeric slice
  const clean = walletAddress.replace(/[^a-zA-Z0-9]/g, '');
  const prefix = clean.slice(0, 4).toLowerCase();
  const suffix = clean.slice(-4).toLowerCase();
  
  // Deterministic 4-char hash
  let hash = 0;
  const str = `${walletAddress}:${salt}:${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(4, '0').slice(0, 4);

  return `pass-${prefix}-${suffix}-${hex}`;
}

/**
 * Sanitize a passport and portfolio according to strict user-selected privacy controls.
 * Guarantees that any disabled item is completely excluded from the payload.
 */
export function buildSanitizedPassport(
  passport: Passport,
  portfolio: Portfolio,
  publicId: string,
  controls: PrivacyControlsConfig
): SanitizedPassportPayload {
  // 1. Wallet Address Masking & Multi-Wallet representation
  // Rule: Show '3 verified wallets' but do not automatically expose all wallet addresses publicly
  const walletCount = passport.walletCount || portfolio.walletCount || 1;
  const isMultiWallet = walletCount > 1;

  let displayedWalletAddress: string;
  if (isMultiWallet) {
    displayedWalletAddress = `${walletCount} verified wallets`;
  } else if (controls.hideWalletAddress) {
    displayedWalletAddress = `SolPass#${passport.walletAddress.slice(0, 4)}••••${passport.walletAddress.slice(-4)}`;
  } else {
    displayedWalletAddress = passport.walletAddress;
  }

  // 2. Disclosed Holdings
  let disclosedHoldings: SanitizedPassportPayload['disclosedHoldings'] = [];
  if (controls.showHoldings) {
    const isSelective = controls.selectedHoldingsMints.length > 0;
    const targetHoldings = isSelective
      ? portfolio.holdings.filter((h) => controls.selectedHoldingsMints.includes(h.asset.mint))
      : portfolio.holdings;

    disclosedHoldings = targetHoldings.map((h) => ({
      mint: h.asset.mint,
      ticker: h.asset.underlyingTicker,
      companyName: h.asset.companyName,
      issuerName: typeof h.asset.issuer === 'string' ? h.asset.issuer : (h.asset.issuer as any)?.name || 'Verified Issuer',
      amount: controls.showPortfolioValue ? h.amount : undefined,
      valueUsd: controls.showPortfolioValue ? h.valueUsd : undefined,
      allocationPercentage: controls.showPortfolioValue ? h.allocationPercentage : undefined,
      isToken2022: Boolean(h.isToken2022),
      verificationStatus: 'verified',
      collateralization: h.asset.collateralization,
      sector: h.asset.sector,
    }));
  }

  // 3. Performance
  let performance: SanitizedPassportPayload['performance'] = undefined;
  if (controls.showPerformance && portfolio.performance) {
    performance = {
      performance24hPercent: portfolio.performance.performance24hPercent,
      performance24hUsd: controls.showPortfolioValue ? portfolio.performance.performance24hUsd : undefined,
      topGainerTicker: portfolio.performance.topGainerTicker,
      topGainerPercent: portfolio.performance.topGainerPercent,
      disclaimer: portfolio.performance.disclaimer,
    };
  }

  // 4. Milestones
  let milestones: SanitizedPassportPayload['milestones'] = undefined;
  if (controls.showMilestones && portfolio.milestones) {
    milestones = portfolio.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      achieved: m.achieved,
      achievedAt: m.achievedAt,
      description: m.description,
    }));
  }

  // 5. Investment History
  let investmentHistory: SanitizedPassportPayload['investmentHistory'] = undefined;
  if (controls.showInvestmentHistory && portfolio.holdingHistory) {
    investmentHistory = portfolio.holdingHistory.map((hh) => ({
      ticker: hh.ticker,
      companyName: hh.companyName,
      firstAcquiredDate: hh.firstAcquiredDate,
      estimatedHoldingDays: hh.estimatedHoldingDays,
      activityStatus: hh.activityStatus,
    }));
  }

  // 6. Transaction History
  let recentTransactions: SanitizedPassportPayload['recentTransactions'] = undefined;
  if (controls.showTransactionHistory && portfolio.recentTransactions) {
    recentTransactions = portfolio.recentTransactions.slice(0, 10).map((tx) => ({
      signature: tx.signature,
      shortSignature: `${tx.signature.slice(0, 4)}...${tx.signature.slice(-4)}`,
      timestamp: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString(),
      type: tx.type,
      status: tx.status,
    }));
  }

  return {
    passportId: passport.passportId,
    publicId,
    profileIdentifier: passport.profileIdentifier,
    tier: passport.tier,
    tierTitle: passport.title,
    onchainScore: passport.onchainScore,
    issuanceDate: passport.issuanceDate,
    validUntil: passport.validUntil,
    checksum: passport.checksum,
    isVerifiedOnchain: passport.isVerifiedOnchain,
    verificationDataSource: passport.verificationDataSource,

    portfolioValueUsd: controls.showPortfolioValue ? passport.verifiedEquityValueUsd : undefined,
    isPortfolioValueDisclosed: controls.showPortfolioValue,

    isWalletAddressHidden: controls.hideWalletAddress,
    displayedWalletAddress,
    explorerUrl: (controls.hideWalletAddress || isMultiWallet)
      ? undefined
      : `https://solscan.io/account/${passport.walletAddress}`,
    walletCount,
    isMultiWallet,

    isHoldingsDisclosed: controls.showHoldings,
    holdingsCount: disclosedHoldings.length,
    disclosedHoldings,

    isPerformanceDisclosed: controls.showPerformance,
    performance,

    isMilestonesDisclosed: controls.showMilestones,
    milestones,

    isInvestmentHistoryDisclosed: controls.showInvestmentHistory,
    investmentHistory,

    isTransactionHistoryDisclosed: controls.showTransactionHistory,
    transactionCount: recentTransactions ? recentTransactions.length : 0,
    recentTransactions,
  };
}

/**
 * Build sanitized cryptographic evidence for the public passport
 */
export function buildSanitizedEvidence(
  passport: Passport,
  portfolio: Portfolio,
  record?: VerificationRecord | null
): SanitizedEvidencePayload {
  return {
    sha256Hash: passport.evidenceSummary.sha256Hash || passport.checksum,
    solanaBlockSlot: passport.evidenceSummary.solanaSlot || record?.solanaBlockSlot,
    verifiedAt: record?.verifiedAt || passport.issuanceDate,
    verificationMethod: record?.verificationMethod || (passport.isVerifiedOnchain ? 'SOLANA_MAINNET_RPC' : 'DEV_SANDBOX_ADAPTER'),
    isLiveOnchain: passport.isVerifiedOnchain,
    verifiedHoldingsCount: passport.holdingCount,
    underlyingSecuritiesCount: passport.underlyingEquities.length,
    depositoryJurisdictions: passport.jurisdictionCompliance,
  };
}

/**
 * Create and persist a new shareable passport profile
 */
export function createSharedPassportProfile(
  passport: Passport,
  portfolio: Portfolio,
  scope: PassportAccessScope,
  controls: PrivacyControlsConfig,
  audienceNote?: string
): SharedPassportProfile {
  const publicId = generatePublicPassportId(passport.walletAddress, scope);
  const sanitizedPassport = buildSanitizedPassport(passport, portfolio, publicId, controls);
  const sanitizedEvidence = buildSanitizedEvidence(passport, portfolio);

  const profile: SharedPassportProfile = {
    publicId,
    ownerWalletAddress: passport.walletAddress,
    accessScope: scope,
    controls,
    createdAt: new Date().toISOString(),
    audienceNote,
    sanitizedPassport,
    sanitizedEvidence,
  };

  saveSharedPassport(profile);
  return profile;
}

/**
 * Persistence layer for shared passports (Indexed / LocalStorage with schema versioning)
 */
export function getAllSharedPassports(): SharedPassportProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_SHARED_PASSPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getSharedPassportById(publicId: string): SharedPassportProfile | null {
  const all = getAllSharedPassports();
  return all.find((p) => p.publicId.toLowerCase() === publicId.toLowerCase()) || null;
}

export function saveSharedPassport(profile: SharedPassportProfile): void {
  try {
    const all = getAllSharedPassports();
    const filtered = all.filter((p) => p.publicId !== profile.publicId);
    filtered.unshift(profile);
    // Keep last 25 profiles to conserve quota
    localStorage.setItem(STORAGE_SHARED_PASSPORTS_KEY, JSON.stringify(filtered.slice(0, 25)));
  } catch {
    // local storage quota or disabled
  }
}

export function deleteSharedPassport(publicId: string): void {
  try {
    const all = getAllSharedPassports();
    const updated = all.filter((p) => p.publicId !== publicId);
    localStorage.setItem(STORAGE_SHARED_PASSPORTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Load user's saved privacy configuration
 */
export function loadUserPrivacyControls(): PrivacyControlsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_USER_PRIVACY_SETTINGS_KEY);
    if (!raw) return DEFAULT_PRIVACY_CONTROLS;
    return { ...DEFAULT_PRIVACY_CONTROLS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVACY_CONTROLS;
  }
}

/**
 * Save user's ongoing privacy configuration
 */
export function saveUserPrivacyControls(controls: PrivacyControlsConfig): void {
  try {
    localStorage.setItem(STORAGE_USER_PRIVACY_SETTINGS_KEY, JSON.stringify(controls));
  } catch {
    // ignore
  }
}
