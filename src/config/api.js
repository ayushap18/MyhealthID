// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - API Configuration
// Environment-aware configuration with validation
// ═══════════════════════════════════════════════════════════════════════════

// Environment detection
const isDevelopment = __DEV__;

// Environment variables (set via EAS secrets or .env)
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;
const ENV_SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

// Default URLs
const DEFAULTS = {
  // Production URL - Railway deployment
  PRODUCTION: 'https://myhealthid-backend-production.up.railway.app',
  // Development URL - local backend (update IP for physical device testing)
  DEVELOPMENT: 'http://10.199.252.47:5002',
};

// Resolve base URL
const resolveBaseURL = () => {
  // 1. Explicit env var takes priority
  if (ENV_API_URL) return ENV_API_URL;
  
  // 2. Use dev/prod defaults
  return isDevelopment ? DEFAULTS.DEVELOPMENT : DEFAULTS.PRODUCTION;
};

const BASE_URL = resolveBaseURL();

export const API_CONFIG = {
  BASE_URL: `${BASE_URL}/api`,
  SOCKET_URL: ENV_SOCKET_URL || BASE_URL,
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 120000, // 2 minutes for file uploads
  IS_DEVELOPMENT: isDevelopment,
};

// Config validation (runs once at startup)
export const validateConfig = () => {
  const warnings = [];
  
  if (isDevelopment && !ENV_API_URL) {
    warnings.push('Using default development API URL. Set EXPO_PUBLIC_API_URL for custom backend.');
  }
  
  if (!isDevelopment && !ENV_API_URL) {
    warnings.push('⚠️ Production build without EXPO_PUBLIC_API_URL - using default Railway URL');
  }

  // Log warnings in dev
  if (isDevelopment && warnings.length > 0) {
    console.log('⚙️ Config Warnings:', warnings);
  }

  return { valid: true, warnings };
};

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  SEPOLIA_RPC_URL: process.env.EXPO_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
  CONTRACT_ADDRESS: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '0xdF068781556FBd580c8C982B30b0669A19b8ddc3',
  CHAIN_ID: 11155111,
  CHAIN_NAME: 'Ethereum Sepolia',
  BLOCK_EXPLORER: 'https://sepolia.etherscan.io',
};

// Validate and log config on startup
validateConfig();

if (API_CONFIG.IS_DEVELOPMENT) {
  console.log('🌍 API Config:', {
    environment: 'Development',
    baseURL: API_CONFIG.BASE_URL,
    socketURL: API_CONFIG.SOCKET_URL,
    blockchain: BLOCKCHAIN_CONFIG.CHAIN_NAME,
  });
}
