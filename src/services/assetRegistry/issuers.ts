/**
 * Onfolio — Trusted Regulated Issuers
 * Authoritative registry of licensed tokenized securities issuers.
 */

import { RegulatedIssuer } from './types';

export const TRUSTED_ISSUERS: Record<string, RegulatedIssuer> = {
  dinari: {
    id: 'dinari',
    name: 'Dinari Inc.',
    legalEntity: 'Dinari Securities Inc. / Dinari Global Ltd.',
    jurisdiction: 'United States (Delaware)',
    regulatoryFramework: 'US SEC Registered Transfer Agent (Form TA-1, CIK: 0001948574)',
    regulator: 'US Securities and Exchange Commission (SEC)',
    custodian: 'DriveWealth LLC (SEC / FINRA / SIPC Member)',
    collateralModel: '1:1 Backed Shares',
    website: 'https://dinari.com',
  },
  backed: {
    id: 'backed',
    name: 'Backed Finance AG',
    legalEntity: 'Backed Finance AG (CHE-410.160.001)',
    jurisdiction: 'Switzerland (Zug)',
    regulatoryFramework: 'Swiss DLT Act (Art. 973c CO, Ledger-based Securities) / EU Prospectus Regulation 2017/1129',
    regulator: 'Financial Market Supervisory Authority (FINMA Supervised Custodians)',
    custodian: 'Maerki Baumann & Co. AG & InCore Bank AG (Swiss Private Banks)',
    collateralModel: '1:1 Backed Shares',
    website: 'https://backed.fi',
  },
  xstocks: {
    id: 'xstocks',
    name: 'xStocks Protocol',
    legalEntity: 'xStocks Global Asset Holdings Ltd.',
    jurisdiction: 'Bermuda',
    regulatoryFramework: 'Bermuda Digital Asset Business Act (DABA 2018)',
    regulator: 'Bermuda Monetary Authority (BMA)',
    custodian: 'Interactive Brokers (UK) Ltd (FCA Regulated) via DTC Depository',
    collateralModel: 'Depository Trust Company (DTC) Custody',
    website: 'https://xstocks.fi',
  },
};
