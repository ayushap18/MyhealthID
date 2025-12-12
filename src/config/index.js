// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - App Configuration
// ═══════════════════════════════════════════════════════════════════════════

// API Configuration
export const API_BASE_URL = 'http://localhost:5002';

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK: 'sepolia',
  CONTRACT_ADDRESS: '0xdF068781556FBd580c8C982B30b0669A19b8ddc3',
  CHAIN_ID: 11155111,
  RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
  EXPLORER_URL: 'https://sepolia.etherscan.io',
};

// IPFS Configuration
export const IPFS_CONFIG = {
  GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  API_URL: 'https://api.pinata.cloud',
};

// App Settings
export const APP_CONFIG = {
  APP_NAME: 'MyHealthID',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@myhealthid.com',
  PRIVACY_URL: 'https://myhealthid.com/privacy',
  TERMS_URL: 'https://myhealthid.com/terms',
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  RESEND_COOLDOWN_SECONDS: 60,
};

// Record Types
export const RECORD_TYPES = {
  PRESCRIPTION: 'prescription',
  LAB_REPORT: 'lab',
  IMAGING: 'imaging',
  DISCHARGE_SUMMARY: 'discharge',
  CONSULTATION: 'consultation',
  OTHER: 'other',
};

// Consent Status
export const CONSENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  HOSPITAL: 'hospital',
  INSURER: 'insurer',
};
