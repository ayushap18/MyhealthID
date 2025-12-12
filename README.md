# MyHealthID

**Your Health. Your Identity. Your Control.**

MyHealthID is a decentralized, patient-owned health identity platform secured by Ethereum Sepolia and IPFS.

---

## 📚 Documentation

- **[Project Overview](./PROJECT_OVERVIEW.md)**: Concept, features, and architecture.
- **[Code Documentation](./CODE_DOCUMENTATION.md)**: Tech stack, folder structure, and configuration details.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js & npm
- MongoDB (Local or Atlas)
- Expo Go app on your mobile device

### 2. Installation

```bash
# Install dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Run the Application

```bash
# Start the backend (from root)
cd backend
npm start

# Start the frontend (from root in a new terminal)
npm start
```
Scan the QR code with Expo Go to launch the app.

---

## 🛠 Deployment (Ethereum Sepolia)

The project is configured for **Ethereum Sepolia Testnet**.

### 1. Get Testnet ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address: `0x6389b44A56E1bb6BCff56FDE4A563CCF41b15825`

### 2. Deploy Smart Contract
```bash
cd backend/contracts
npx hardhat run deploy.js --network sepolia
```

### 3. Update Configuration
Copy the deployed contract address and update `backend/.env`:
```bash
CONTRACT_ADDRESS=0x[your-new-address]
```

### 4. Seed Data (Optional)
To populate the database with test users and records (configured for Sepolia):
```bash
cd backend
node scripts/seedPilotData.js
```

---

## ✅ Current Status
- **Network:** Migrated to Ethereum Sepolia (Chain ID: 11155111).
- **Wallet Balance:** ~100 PYUSD (Sepolia).
- **Codebase:** Fully updated to reference Sepolia/Ethereum instead of Polygon.
