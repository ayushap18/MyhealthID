import CryptoJS from 'crypto-js';
import logger from '../utils/logger';

// In production, this key should be derived from the user's wallet signature
// or a secure key exchange protocol, NOT hardcoded.
const DEFAULT_ENCRYPTION_KEY = "myhealthid-secure-key-v1"; 

export const encryptionService = {
  /**
   * Generate a secure encryption key from user's wallet
   * @param {string} walletAddress - User's wallet address
   * @returns {string} - Derived encryption key
   */
  deriveKeyFromWallet(walletAddress) {
    return CryptoJS.SHA256(walletAddress + DEFAULT_ENCRYPTION_KEY).toString();
  },

  /**
   * Encrypt data/file content
   * @param {string} content - Raw content to encrypt
   * @param {string} key - Encryption key (optional)
   * @returns {object} - { encryptedContent, iv, timestamp }
   */
  encrypt(content, key = DEFAULT_ENCRYPTION_KEY) {
    try {
      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(content, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return {
        encryptedContent: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Encryption', 'Encrypt error', error);
      throw new Error("Failed to encrypt data");
    }
  },

  /**
   * Decrypt data
   * @param {string} encryptedContent - Ciphertext
   * @param {string} key - Decryption key
   * @returns {string} - Original content
   */
  decrypt(encryptedContent, key = DEFAULT_ENCRYPTION_KEY) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) throw new Error("Decryption failed (wrong key?)");
      return originalText;
    } catch (error) {
      logger.error('Encryption', 'Decrypt error', error);
      throw new Error("Failed to decrypt data");
    }
  },

  /**
   * Generate content hash for integrity verification
   * @param {string} content - Content to hash
   * @returns {string} - SHA256 hash
   */
  generateHash(content) {
    return CryptoJS.SHA256(content).toString();
  }
};
