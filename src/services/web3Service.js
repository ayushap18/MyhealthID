import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

// Configuration
const SEPOLIA_RPC_URL = "https://ethereum-sepolia.publicnode.com";
const CONTRACT_ADDRESS = "0xdF068781556FBd580c8C982B30b0669A19b8ddc3";

// Embedded Contract ABI (extracted from HealthRecordRegistryV2)
const CONTRACT_ABI = [
  "function registerDocument(string recordId, string patientId, string ipfsCID, bytes32 metadataHash) external",
  "function grantAccess(string patientId, address requester, uint256 durationInSeconds) external",
  "function emergencyAccess(string patientId) external",
  "function revokeAccess(uint256 tokenId) external",
  "function logAccess(string recordId, address accessor, string action) external",
  "function checkAccess(address requester, string patientId) external view returns (bool)",
  "function getRecord(string recordId) external view returns (string, string, bytes32, address, uint256, bool)",
  "function getAccessToken(uint256 tokenId) external view returns (string, address, uint256, bool, uint256, bool)",
  "function verifyAccessToken(uint256 tokenId) external view returns (bool)",
  "event RecordRegistered(string indexed recordId, string indexed patientId, string ipfsCID, address indexed uploadedBy, uint256 timestamp)",
  "event AccessGranted(uint256 indexed tokenId, string indexed patientId, address indexed requester, uint256 expiresAt, bool isEmergency)",
  "event AccessRevoked(uint256 indexed tokenId, string indexed patientId, address indexed requester)"
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize Web3 Provider (Read-Only)
   */
  async init() {
    if (this.initialized) return true;

    try {
      this.provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      this.initialized = true;
      logger.info('Web3', 'Initialized (Read-Only)');
      return true;
    } catch (error) {
      logger.error('Web3', 'Init error', error);
      return false;
    }
  }

  /**
   * Connect with Private Key
   */
  async connectWallet(privateKey) {
    try {
      if (!this.provider) await this.init();
      if (!privateKey) throw new Error('Private key required');

      const wallet = new ethers.Wallet(privateKey, this.provider);
      this.signer = wallet;
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

      await AsyncStorage.setItem('wallet_address', wallet.address);
      const balance = await this.provider.getBalance(wallet.address);

      logger.info('Web3', `Wallet connected: ${wallet.address}`);
      return {
        address: wallet.address,
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      logger.error('Web3', 'Wallet connect error', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet() {
    this.signer = null;
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
    await AsyncStorage.removeItem('wallet_address');
  }

  /**
   * Get connected wallet address
   */
  async getWalletAddress() {
    return await AsyncStorage.getItem('wallet_address');
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected() {
    return this.signer !== null;
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      if (!this.provider) await this.init();
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: 'Ethereum Sepolia'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify a record exists on-chain
   */
  async verifyRecord(recordId) {
    try {
      if (!this.contract) await this.init();
      const result = await this.contract.getRecord(recordId);
      return {
        patientId: result[0],
        ipfsCID: result[1],
        metadataHash: result[2],
        uploadedBy: result[3],
        timestamp: Number(result[4]),
        exists: result[5]
      };
    } catch (error) {
      logger.error('Web3', 'Verify record error', error);
      return { exists: false };
    }
  }

  /**
   * Check access permission
   */
  async checkAccess(requesterAddress, patientId) {
    try {
      if (!this.contract) await this.init();
      return await this.contract.checkAccess(requesterAddress, patientId);
    } catch (error) {
      logger.error('Web3', 'Check access error', error);
      return false;
    }
  }
}

export const web3Service = new Web3Service();
