import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI (will be generated after compilation)
const CONTRACT_ABI = [
  "function registerDocument(string recordId, string patientId, string ipfsCID, bytes32 metadataHash) external",
  "function grantAccess(string patientId, address requester, uint256 durationInSeconds) external",
  "function emergencyAccess(string patientId) external",
  "function revokeAccess(uint256 tokenId) external",
  "function logAccess(string recordId, address accessor, string action) external",
  "function checkAccess(address requester, string patientId) external view returns (bool)",
  "function getRecord(string recordId) external view returns (string, string, bytes32, address, uint256, bool)",
  "function getAccessToken(uint256 tokenId) external view returns (string, address, uint256, bool, uint256, bool)",
  "event RecordRegistered(string indexed recordId, string indexed patientId, string ipfsCID, address indexed uploadedBy, uint256 timestamp)",
  "event AccessGranted(uint256 indexed tokenId, string indexed patientId, address indexed requester, uint256 expiresAt, bool isEmergency)",
  "event EmergencyAccessTriggered(string indexed patientId, address indexed responder, uint256 timestamp)",
  "event AuditLogged(string indexed recordId, address indexed accessor, string action, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Connect to Ethereum Sepolia testnet
      this.provider = new ethers.JsonRpcProvider(
        process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
      );

      // Create wallet from private key
      if (!process.env.PRIVATE_KEY) {
        console.warn('⚠️  No PRIVATE_KEY found. Blockchain features will be read-only.');
        return;
      }

      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Connect to deployed contract
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (contractAddress && contractAddress !== 'will-be-set-after-deployment' && ethers.isAddress(contractAddress)) {
        this.contract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          this.wallet
        );
        console.log('✅ Blockchain service initialized');
        console.log(`📍 Contract: ${contractAddress}`);
        console.log(`🔗 Network: Ethereum Sepolia (Chain ID: 11155111)`);
      }
      // Silently skip contract initialization if not deployed yet

      this.initialized = true;
    } catch (error) {
      console.error('❌ Blockchain initialization error:', error.message);
    }
  }

  /**
   * Register a document on blockchain
   */
  async registerDocument(recordId, patientId, ipfsCID, metadataHash) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Convert metadata hash to bytes32
      const hashBytes = ethers.id(metadataHash);

      const tx = await this.contract.registerDocument(
        recordId,
        patientId,
        ipfsCID,
        hashBytes
      );

      console.log(`⛓️  Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Document registered in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Blockchain registration error:', error);
      throw new Error(`Failed to register on blockchain: ${error.message}`);
    }
  }

  /**
   * Grant access to a requester
   */
  async grantAccess(patientId, requesterAddress, expiresAt) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Calculate duration in seconds
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const durationInSeconds = Math.floor((expiry - now) / 1000);

      if (durationInSeconds <= 0) {
        throw new Error('Expiration time must be in the future');
      }

      const tx = await this.contract.grantAccess(
        patientId,
        requesterAddress,
        durationInSeconds
      );

      console.log(`⛓️  Access grant transaction: ${tx.hash}`);

      const receipt = await tx.wait();

      // Extract tokenId from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'AccessGranted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        tokenId = parsed.args.tokenId.toString();
      }

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        tokenId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Access grant error:', error);
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  /**
   * Trigger Emergency Access
   */
  async emergencyAccess(patientId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.emergencyAccess(patientId);
      console.log(`🚨 Emergency access transaction: ${tx.hash}`);

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Emergency access error:', error);
      throw new Error(`Failed to trigger emergency access: ${error.message}`);
    }
  }

  /**
   * Log access on blockchain
   */
  async logAccess(recordId, accessorAddress, action) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.logAccess(recordId, accessorAddress, action);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Audit log error:', error);
      throw new Error(`Failed to log access: ${error.message}`);
    }
  }

  /**
   * Check if an address has access
   */
  async checkAccess(requesterAddress, patientId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const hasAccess = await this.contract.checkAccess(requesterAddress, patientId);
      return hasAccess;
    } catch (error) {
      console.error('Access check error:', error);
      return false;
    }
  }

  /**
   * Get record from blockchain
   */
  async getRecord(recordId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [patientId, ipfsCID, metadataHash, uploadedBy, timestamp] = 
        await this.contract.getRecord(recordId);

      return {
        patientId,
        ipfsCID,
        metadataHash,
        uploadedBy,
        timestamp: Number(timestamp)
      };
    } catch (error) {
      console.error('Get record error:', error);
      throw new Error(`Record not found: ${error.message}`);
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const balance = this.wallet 
        ? await this.provider.getBalance(this.wallet.address)
        : 0;

      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        balance: ethers.formatEther(balance),
        walletAddress: this.wallet?.address
      };
    } catch (error) {
      console.error('Network info error:', error);
      return null;
    }
  }
}

export default new BlockchainService();
