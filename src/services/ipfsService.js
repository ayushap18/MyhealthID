// IPFS Service for decentralized file storage
// Uses Pinata/Web3.Storage or falls back to mock for development

import logger from '../utils/logger';

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const W3S_GATEWAY = "https://w3s.link/ipfs/";

class IPFSService {
  constructor() {
    this.apiToken = null; // Set via configure()
    this.gateway = W3S_GATEWAY;
  }

  /**
   * Configure IPFS service with API token
   * @param {string} token - Pinata or Web3.Storage API token
   */
  configure(token) {
    this.apiToken = token;
  }

  /**
   * Upload file to IPFS
   * @param {string} content - Encrypted content to upload
   * @param {string} filename - Original filename
   * @returns {Promise<object>} - { cid, url }
   */
  async uploadFile(content, filename = 'health-record') {
    // If no API token, use mock CID for development
    if (!this.apiToken) {
      logger.info('IPFS', 'Upload simulated (No API Token)');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockCid = this.generateMockCID();
      return {
        cid: mockCid,
        url: `${this.gateway}${mockCid}`,
        simulated: true
      };
    }

    try {
      // Real Pinata upload
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: this.createFormData(content, filename)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        cid: result.IpfsHash,
        url: `${this.gateway}${result.IpfsHash}`,
        simulated: false
      };
    } catch (error) {
      logger.error('IPFS', 'Upload error', error);
      // Fallback to mock
      const mockCid = this.generateMockCID();
      return {
        cid: mockCid,
        url: `${this.gateway}${mockCid}`,
        simulated: true,
        error: error.message
      };
    }
  }

  /**
   * Retrieve file from IPFS
   * @param {string} cid - Content Identifier
   * @returns {Promise<string>} - The content
   */
  async getFile(cid) {
    // Check for mock CID
    if (cid.startsWith('bafybe') && cid.includes('...')) {
      return "MOCK_ENCRYPTED_DATA_FROM_IPFS";
    }

    try {
      const response = await fetch(`${this.gateway}${cid}`);
      if (!response.ok) throw new Error('Failed to fetch from IPFS');
      return await response.text();
    } catch (error) {
      logger.error('IPFS', 'Fetch error', error);
      throw error;
    }
  }

  /**
   * Generate mock CID for development
   */
  generateMockCID() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let cid = 'bafybe';
    for (let i = 0; i < 50; i++) {
      cid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return cid;
  }

  /**
   * Create FormData for file upload
   */
  createFormData(content, filename) {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'application/octet-stream' });
    formData.append('file', blob, filename);
    return formData;
  }
}

export const ipfsService = new IPFSService();
