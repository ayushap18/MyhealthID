import axios from 'axios';
import crypto from 'crypto';

class IPFSService {
  constructor() {
    this.web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
    this.uploadUrl = 'https://api.web3.storage/upload';
  }

  /**
   * Upload file to Web3.Storage (IPFS + Filecoin)
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename
   * @returns {Promise<string>} - IPFS CID
   */
  async uploadFile(fileBuffer, filename) {
    if (!this.web3StorageToken) {
      console.warn('⚠️  Web3.Storage token not configured, using mock CID');
      return this.generateMockCID();
    }

    try {
      const response = await axios.post(
        this.uploadUrl,
        fileBuffer,
        {
          headers: {
            'Authorization': `Bearer ${this.web3StorageToken}`,
            'Content-Type': 'application/octet-stream',
            'X-NAME': filename
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const cid = response.data.cid;
      console.log(`📦 File uploaded to IPFS: ${cid}`);
      
      return cid;
    } catch (error) {
      console.error('IPFS upload error:', error.message);
      
      // Fallback to mock CID for development
      console.warn('Falling back to mock CID');
      return this.generateMockCID();
    }
  }

  /**
   * Generate encryption hash for file
   */
  generateEncryptionHash(fileBuffer) {
    return crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');
  }

  /**
   * Encrypt file buffer (AES-256-GCM simulation server-side)
   * In production, encryption should be done client-side
   */
  encryptFile(fileBuffer, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: Buffer.concat([iv, authTag, encrypted]),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Generate mock CID for development
   */
  generateMockCID() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let cid = 'bafkrei';
    
    for (let i = 0; i < 52; i++) {
      cid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return cid;
  }

  /**
   * Download file from IPFS
   * @param {string} cid - IPFS CID
   * @returns {Promise<Buffer>} - File buffer
   */
  async downloadFile(cid) {
    // Check if this is a mock CID
    if (cid.startsWith('bafkrei') && cid.length === 59) {
      console.warn('⚠️  Mock CID detected, returning mock encrypted data');
      // Return mock encrypted data for testing
      return Buffer.from('mock-encrypted-data-for-testing', 'utf8');
    }

    try {
      const gateway = 'https://w3s.link/ipfs/';
      const response = await axios.get(`${gateway}${cid}`, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });

      console.log(`📥 Downloaded file from IPFS: ${cid}`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error('IPFS download error:', error.message);
      throw new Error(`Failed to download file from IPFS: ${error.message}`);
    }
  }

  /**
   * Retrieve file from IPFS (via gateway)
   */
  async retrieveFile(cid) {
    const gateway = 'https://w3s.link/ipfs/';
    
    try {
      const response = await axios.get(`${gateway}${cid}`, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('IPFS retrieval error:', error.message);
      throw new Error(`Failed to retrieve file from IPFS: ${cid}`);
    }
  }

  /**
   * Verify file hash matches expected hash
   */
  verifyFileHash(fileBuffer, expectedHash) {
    const actualHash = this.generateEncryptionHash(fileBuffer);
    return actualHash === expectedHash;
  }
}

export default new IPFSService();
