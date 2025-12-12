import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const TAG_LENGTH = 16; // 16 bytes for authentication tag
const SALT_LENGTH = 32; // 32 bytes for key derivation

/**
 * Get encryption key from environment or generate one
 */
const getEncryptionKey = () => {
  let key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    // Generate temporary key silently (will log on first use)
    key = crypto.randomBytes(32).toString('hex');
  }

  // Ensure key is 32 bytes (64 hex characters)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }

  return Buffer.from(key, 'hex');
};

/**
 * Encrypt data using AES-256-GCM
 * @param {Buffer|string} data - Data to encrypt
 * @returns {{encrypted: string, iv: string, tag: string}} - Encrypted data with IV and auth tag
 */
const encrypt = (data) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Convert string to buffer if needed
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final()
    ]);
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encrypted - Base64 encoded encrypted data
 * @param {string} iv - Hex encoded IV
 * @param {string} tag - Hex encoded authentication tag
 * @returns {Buffer} - Decrypted data
 */
const decrypt = (encrypted, iv, tag) => {
  try {
    const key = getEncryptionKey();
    
    // Convert from strings to buffers
    const encryptedBuffer = Buffer.from(encrypted, 'base64');
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(tagBuffer);
    
    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
  }
};

/**
 * Encrypt a file (buffer)
 * @param {Buffer} fileBuffer - File data as buffer
 * @returns {{encryptedData: string, iv: string, tag: string, originalSize: number}}
 */
const encryptFile = (fileBuffer) => {
  try {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error('File data must be a Buffer');
    }

    const { encrypted, iv, tag } = encrypt(fileBuffer);
    
    return {
      encryptedData: encrypted,
      iv,
      tag,
      originalSize: fileBuffer.length,
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt a file
 * @param {string} encryptedData - Base64 encoded encrypted file
 * @param {string} iv - Hex encoded IV
 * @param {string} tag - Hex encoded authentication tag
 * @returns {Buffer} - Decrypted file buffer
 */
const decryptFile = (encryptedData, iv, tag) => {
  try {
    return decrypt(encryptedData, iv, tag);
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

/**
 * Hash data using SHA-256 (for integrity checks)
 * @param {Buffer|string} data - Data to hash
 * @returns {string} - Hex encoded hash
 */
const hashData = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'));
  return hash.digest('hex');
};

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default 32)
 * @returns {string} - Hex encoded token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Derive encryption key from password (PBKDF2)
 * @param {string} password - User password
 * @param {string} salt - Salt (hex string)
 * @returns {Buffer} - Derived key
 */
const deriveKey = (password, salt) => {
  const saltBuffer = Buffer.from(salt, 'hex');
  return crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');
};

/**
 * Generate encryption key for .env file
 * @returns {string} - 64-character hex string
 */
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

export {
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  hashData,
  generateToken,
  deriveKey,
  generateEncryptionKey,
  ALGORITHM
};
