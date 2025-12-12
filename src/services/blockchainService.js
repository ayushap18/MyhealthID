import * as Crypto from 'expo-crypto';
import { simulateDelay, generateMockCID, generateMockHash } from '../utils/mockData';

export const blockchainService = {
  // Simulate blockchain transaction
  async mintHealthID(userData) {
    await simulateDelay(2000); // Simulate network delay
    const walletAddress = await this.generateWalletAddress();
    const namePrefix = (userData?.name || 'XX').substring(0, 2).toUpperCase();
    const healthId = `HID-2025-${Math.floor(Math.random() * 1000)}-${namePrefix}`;
    
    return {
      healthId,
      walletAddress,
      transactionHash: await this.generateHash(`${healthId}${walletAddress}`),
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      timestamp: new Date().toISOString(),
    };
  },

  // Generate mock wallet address
  async generateWalletAddress() {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString() + Date.now().toString()
    );
    return '0x' + hash.substring(0, 40);
  },

  // Generate hash for content
  async generateHash(content) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      content
    );
    return hash;
  },

  // Simulate document registration on blockchain
  async registerDocument(patientId, fileUri, metadata) {
    await simulateDelay(1500);
    
    const contentHash = await this.generateHash(fileUri + Date.now());
    const cid = generateMockCID();
    
    return {
      cid,
      contentHash,
      transactionHash: await this.generateHash(`${patientId}${cid}`),
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      timestamp: new Date().toISOString(),
      gasUsed: '0.00' + Math.floor(Math.random() * 99),
    };
  },

  // Simulate consent token minting
  async mintConsentToken(patientId, requesterId, recordId, expiryHours) {
    await simulateDelay(1000);
    
    const tokenId = `TOKEN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);
    
    return {
      tokenId,
      patientId,
      requesterId,
      recordId,
      expiryDate: expiryDate.toISOString(),
      transactionHash: await this.generateHash(`${tokenId}${patientId}`),
      status: 'active',
    };
  },

  // Verify document hash
  async verifyDocumentHash(cid, localHash) {
    await simulateDelay(1500);
    
    // Simulate on-chain hash retrieval
    const onChainHash = localHash; // In real app, would fetch from blockchain
    const isValid = localHash === onChainHash;
    
    return {
      isValid,
      onChainHash,
      localHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      verifiedAt: new Date().toISOString(),
    };
  },

  // Get transaction receipt
  async getTransactionReceipt(txHash) {
    await simulateDelay(500);
    
    return {
      transactionHash: txHash,
      status: 'success',
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      gasUsed: '0.00' + Math.floor(Math.random() * 99),
      timestamp: new Date().toISOString(),
    };
  },
};

export const ipfsService = {
  // Simulate IPFS upload
  async uploadFile(fileUri, encryptedData) {
    await simulateDelay(2500); // Simulate upload time
    
    const cid = generateMockCID();
    const fileSize = Math.random() * 5; // Random size between 0-5 MB
    
    return {
      cid,
      size: fileSize.toFixed(1) + ' MB',
      pinned: true,
      gateway: `https://ipfs.io/ipfs/${cid}`,
      uploadedAt: new Date().toISOString(),
    };
  },

  // Simulate IPFS file retrieval
  async retrieveFile(cid) {
    await simulateDelay(1500);
    
    return {
      cid,
      content: `Mock encrypted content for ${cid}`,
      size: (Math.random() * 5).toFixed(1) + ' MB',
      retrievedAt: new Date().toISOString(),
    };
  },

  // Check pin status
  async checkPinStatus(cid) {
    await simulateDelay(300);
    
    return {
      cid,
      pinned: true,
      pinDate: new Date().toISOString(),
      replications: Math.floor(Math.random() * 10) + 3,
    };
  },
};

export const encryptionService = {
  // Simulate file encryption
  async encryptFile(fileUri) {
    await simulateDelay(800);
    
    const encryptionKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString() + Date.now().toString()
    );
    
    const encryptedContent = `ENCRYPTED:${fileUri}:${Date.now()}`;
    const contentHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      encryptedContent
    );
    
    return {
      encryptedContent,
      encryptionKey: encryptionKey.substring(0, 32),
      contentHash,
      algorithm: 'AES-256-GCM',
      encryptedAt: new Date().toISOString(),
    };
  },

  // Simulate file decryption
  async decryptFile(encryptedContent, encryptionKey) {
    await simulateDelay(600);
    
    // In a real app, this would decrypt the content
    return {
      decryptedContent: encryptedContent.replace('ENCRYPTED:', 'DECRYPTED:'),
      decryptedAt: new Date().toISOString(),
    };
  },
};
