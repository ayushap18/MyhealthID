# MyHealthID — Code Documentation

## 1. Technical Stack

### Frontend (Mobile App)
- **Framework:** React Native (Expo)
- **Language:** JavaScript/TypeScript
- **Key Libraries:**
  - `ethers.js`: Blockchain interaction
  - `expo-crypto`: Hashing and encryption
  - `react-navigation`: App routing

### Backend (API & Services)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Blockchain Service:** Custom service using `ethers.js` to interact with Ethereum Sepolia.

### Blockchain
- **Network:** Ethereum Sepolia Testnet
- **Smart Contract Language:** Solidity
- **Development Environment:** Hardhat
- **Storage:** IPFS (Simulated/Pinata)

## 2. Folder Structure

```
MyHealthID/
├── src/                    # Frontend Source Code
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens (Patient, Hospital, Insurer flows)
│   ├── navigation/         # Navigation configuration
│   └── services/           # Frontend services (API, Crypto)
├── backend/                # Backend Source Code
│   ├── contracts/          # Solidity Smart Contracts & Deploy Scripts
│   ├── models/             # MongoDB Mongoose Models
│   ├── routes/             # API Routes
│   ├── services/           # Business Logic (Blockchain, IPFS)
│   └── server.js           # Entry point
├── assets/                 # Images and static assets
└── ...config files
```

## 3. Network Configuration (Ethereum Sepolia)

The project has been migrated from Polygon Amoy to Ethereum Sepolia.

- **Chain ID:** `11155111`
- **RPC URL:** `https://rpc.sepolia.org` (or Alchemy/Infura)
- **Currency:** ETH (Testnet)
- **Explorer:** [Sepolia Etherscan](https://sepolia.etherscan.io/)

### Key Configuration Files
- **`backend/.env`**: Contains `SEPOLIA_RPC_URL` and `CONTRACT_ADDRESS`.
- **`backend/contracts/hardhat.config.js`**: Configured for `sepolia` network.
- **`backend/models/Record.js`**: Default `chainId` set to `11155111`.

## 4. Key Components

### Smart Contract (`HealthRecordRegistry.sol`)
Manages:
- Patient identity mapping.
- Record registry (CIDs, metadata hashes).
- Consent management (granting/revoking access).
- Audit logging.

### Backend Services
- **`blockchainService.js`**: Handles read/write operations to the smart contract.
- **`ipfsService.js`**: Handles file upload and retrieval from IPFS.

### Frontend Flows
- **Patient:** View records, manage consent, emergency mode.
- **Hospital:** Upload records, request access.
- **Insurer:** Verify record authenticity via blockchain hash.

## 5. Environment Variables

Required in `backend/.env`:
```bash
PORT=5002
MONGODB_URI=...
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=...
CONTRACT_ADDRESS=0x...
JWT_SECRET=...
```
