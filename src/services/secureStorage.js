// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Secure Storage Service
// Uses expo-secure-store for sensitive data (tokens) with AsyncStorage fallback
// ═══════════════════════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import logger from '../utils/logger';

// Dynamic import for SecureStore (not available on web)
let SecureStore = null;

const initSecureStore = async () => {
  if (Platform.OS !== 'web' && !SecureStore) {
    try {
      SecureStore = await import('expo-secure-store');
    } catch (error) {
      logger.warn('SecureStorage', 'SecureStore not available, using AsyncStorage fallback');
    }
  }
};

// Initialize on load
initSecureStore();

const SECURE_KEYS = {
  ACCESS_TOKEN: 'myhealthid_access_token',
  REFRESH_TOKEN: 'myhealthid_refresh_token',
};

const STORAGE_KEYS = {
  CURRENT_USER: 'myhealthid_current_user',
  USER_ROLE: 'myhealthid_user_role',
  ONBOARDING_COMPLETE: 'myhealthid_onboarding_complete',
};

/**
 * Secure storage for sensitive data (tokens)
 */
export const secureStorage = {
  /**
   * Store a value securely
   */
  setItem: async (key, value) => {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback for web or if SecureStore unavailable
        await AsyncStorage.setItem(key, value);
      }
      return true;
    } catch (error) {
      logger.error('SecureStorage', `Failed to set ${key}`, error);
      return false;
    }
  },

  /**
   * Get a value from secure storage
   */
  getItem: async (key) => {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error('SecureStorage', `Failed to get ${key}`, error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  removeItem: async (key) => {
    try {
      if (SecureStore && Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      logger.error('SecureStorage', `Failed to remove ${key}`, error);
      return false;
    }
  },
};

/**
 * Auth tokens storage (secure)
 */
export const tokenStorage = {
  setAccessToken: (token) => secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, token),
  getAccessToken: () => secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN),
  removeAccessToken: () => secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN),

  setRefreshToken: (token) => secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, token),
  getRefreshToken: () => secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN),
  removeRefreshToken: () => secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN),

  clearTokens: async () => {
    await Promise.all([
      secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN),
      secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN),
    ]);
  },
};

/**
 * User data storage (regular AsyncStorage - not sensitive)
 */
export const userStorage = {
  setCurrentUser: async (user) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      if (user?.role) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      }
      return true;
    } catch (error) {
      logger.error('UserStorage', 'Failed to set current user', error);
      return false;
    }
  },

  getCurrentUser: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.error('UserStorage', 'Failed to get current user', error);
      return null;
    }
  },

  getUserRole: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    } catch (error) {
      logger.error('UserStorage', 'Failed to get user role', error);
      return null;
    }
  },

  clearUser: async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.CURRENT_USER, STORAGE_KEYS.USER_ROLE]);
      return true;
    } catch (error) {
      logger.error('UserStorage', 'Failed to clear user', error);
      return false;
    }
  },

  setOnboardingComplete: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      return true;
    } catch (error) {
      return false;
    }
  },

  isOnboardingComplete: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      return false;
    }
  },
};

/**
 * Clear all auth-related storage
 */
export const clearAllAuthStorage = async () => {
  await Promise.all([
    tokenStorage.clearTokens(),
    userStorage.clearUser(),
  ]);
  logger.info('Storage', 'All auth storage cleared');
};

export default {
  secure: secureStorage,
  tokens: tokenStorage,
  user: userStorage,
  clearAll: clearAllAuthStorage,
};
