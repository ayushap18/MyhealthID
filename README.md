<div align="center">

# 🏥 MyHealthID - Your Health, Your Identity, Your Control 🏥

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=32&pause=1000&color=00D9FF&center=true&vCenter=true&random=false&width=900&lines=Decentralized+Health+Identity+Platform+%F0%9F%94%90;Powered+by+Ethereum+Sepolia+%E2%9A%A1;Secured+with+IPFS+%F0%9F%8C%90;Patient+Data+Sovereignty+%F0%9F%9B%A1%EF%B8%8F;Your+Health%2C+Your+Rules+%E2%9C%A8" alt="Typing SVG" />

<img src="https://user-images.githubusercontent.com/74038190/212748830-4c709398-a386-4761-84d7-9e10b98fbe6e.gif" width="700">

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://sepolia.etherscan.io/)
[![IPFS](https://img.shields.io/badge/IPFS-Decentralized-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)](https://ipfs.io/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">

## 🎯 What is MyHealthID?

<img align="right" width="400" src="https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif">

</div>

**MyHealthID** is a revolutionary decentralized health identity platform that puts **YOU** in control of your medical data. Built on **Ethereum Sepolia** blockchain and secured with **IPFS**, MyHealthID ensures your health information is:

### 🔐 Core Principles

- **🛡️ Secure** - Military-grade encryption + blockchain immutability
- **👤 Private** - You own and control your data, not corporations
- **🌐 Decentralized** - No central authority or single point of failure
- **🔓 Interoperable** - Share with any healthcare provider seamlessly
- **📱 Accessible** - Your health records, anytime, anywhere

<br clear="right"/>

---

<div align="center">

## ✨ Key Features

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">

</div>

### 🆔 Decentralized Identity
<img align="left" width="350" src="https://user-images.githubusercontent.com/74038190/212749447-bfb7e725-6987-49d9-ae85-2015e3e7cc41.gif">

Your health identity is stored on the **Ethereum blockchain**, ensuring:
- Permanent, tamper-proof records
- No central database vulnerabilities
- True data ownership
- Cross-platform compatibility

<br clear="left"/>

---

### 📊 Complete Medical Records
<img align="right" width="350" src="https://user-images.githubusercontent.com/74038190/212749171-b84692a8-2848-41a2-99c3-5ffb527abd26.gif">

Store and manage all your health data:
- Medical history & diagnoses
- Prescriptions & medications
- Lab results & imaging
- Vaccination records
- Allergies & conditions

<br clear="right"/>

---

### 🔒 Privacy-First Design
<img align="left" width="350" src="https://user-images.githubusercontent.com/74038190/212750672-2f3f2b50-c84f-4ed8-a60a-849ae69ff9df.gif">

Your data is encrypted and secure:
- End-to-end encryption
- Zero-knowledge proofs
- Granular access controls
- Audit trails for all access
- HIPAA-compliant architecture

<br clear="left"/>

---

### 🌍 Universal Access
<img align="right" width="350" src="https://user-images.githubusercontent.com/74038190/212750996-938b257b-266c-45a7-9af7-655341c0f58b.gif">

Access your health data anywhere:
- Mobile app (iOS & Android)
- Web portal
- Emergency access protocols
- Provider integrations
- International compatibility

<br clear="right"/>

---

<div align="center">

## 📚 Documentation

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="300">

</div>

### 📖 Available Documentation

| Document | Description | Link |
|----------|-------------|------|
| 📋 **Project Overview** | Concept, features, and architecture | [View](./PROJECT_OVERVIEW.md) |
| 💻 **Code Documentation** | Tech stack, folder structure, configuration | [View](./CODE_DOCUMENTATION.md) |
| 🔧 **API Reference** | Backend endpoints and usage | Coming Soon |
| 🎨 **UI/UX Guide** | Design system and components | Coming Soon |

---

<div align="center">

## 🚀 Quick Start Guide

<img src="https://user-images.githubusercontent.com/74038190/212750147-854a394f-fee9-4080-9770-78a4b7ece53f.gif" width="400">

### Get MyHealthID running in 10 minutes!

</div>

---

## ⚙️ Prerequisites

<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="25"> **Required Software**

Before you begin, ensure you have these installed:

- ✅ **Node.js** (v16 or higher) & npm
- ✅ **MongoDB** (Local installation or MongoDB Atlas account)
- ✅ **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- ✅ **MetaMask** or any Ethereum wallet (for deployment)
- ✅ **Git** for cloning the repository

---

## 📥 Installation

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212749695-a6817c5a-a794-462b-afca-1b5ce31a9685.gif" width="350">
</div>

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/MyHealthID.git
cd MyHealthID
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Configure Environment

Create a `.env` file in the `backend` directory:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/myhealthid
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myhealthid

# Ethereum Sepolia Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x6389b44A56E1bb6BCff56FDE4A563CCF41b15825

# IPFS Configuration
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/

# JWT Secret
JWT_SECRET=your_secure_random_secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## 🎮 Running the Application

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212750155-3ceddfbd-19d3-40a3-87af-8d329c8323c4.gif" width="350">
</div>

### 🖥️ Start Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 3000
✅ Connected to MongoDB
✅ Contract deployed at: 0x6389b44A56E1bb6BCff56FDE4A563CCF41b15825
```

### 📱 Start Frontend Application

Open a **new terminal** window and run:

```bash
# From the root directory
npm start
```

This will start the Expo development server. You'll see a QR code in the terminal.

### 📲 Launch on Mobile

1. Open **Expo Go** app on your phone
2. Scan the QR code displayed in the terminal
3. Wait for the app to build and launch
4. 🎉 Start using MyHealthID!

---

<div align="center">

## 🌐 Blockchain Deployment

<img src="https://user-images.githubusercontent.com/74038190/212750680-2b4b3e56-091e-44f9-b2e1-0603156dad6a.gif" width="400">

### Deploy to Ethereum Sepolia Testnet

</div>

MyHealthID is configured for **Ethereum Sepolia Testnet** (Chain ID: 11155111)

---

### 💰 Step 1: Get Testnet ETH

You need Sepolia ETH to deploy smart contracts and make transactions.

**Official Faucets:**
- 🚰 [Sepolia Faucet](https://sepoliafaucet.com/)
- 🚰 [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- 🚰 [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

**Steps:**
1. Visit any faucet above
2. Enter your wallet address: `0x6389b44A56E1bb6BCff56FDE4A563CCF41b15825`
3. Complete captcha/verification
4. Receive 0.5-1.0 Sepolia ETH

---

### 🚀 Step 2: Deploy Smart Contract

```bash
# Navigate to contracts directory
cd backend/contracts

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
🔨 Compiling contracts...
✅ Compilation successful
🚀 Deploying HealthIDContract...
✅ Contract deployed to: 0xYOUR_NEW_CONTRACT_ADDRESS
📝 Transaction hash: 0x...
⛽ Gas used: ~2,500,000
```

---

### ⚙️ Step 3: Update Configuration

After successful deployment, update your `backend/.env` file:

```bash
CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
```

Then restart your backend server:

```bash
cd backend
npm start
```

---

### 🌱 Step 4: Seed Test Data (Optional)

Populate the database with pilot users and sample health records:

```bash
cd backend
node scripts/seedPilotData.js
```

This will create:
- 👥 5 test patient accounts
- 🏥 3 test healthcare provider accounts
- 📋 Sample medical records
- 💊 Sample prescriptions
- 🧪 Sample lab results

**Test Accounts:**
```
Patient 1: patient1@test.com / password123
Patient 2: patient2@test.com / password123
Doctor 1: doctor1@test.com / password123
```

---

<div align="center">

## 📊 Current Status

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="500">

</div>

### ✅ Production Ready Features

| Feature | Status | Details |
|---------|--------|---------|
| 🌐 **Network** | ✅ Live | Ethereum Sepolia (Chain ID: 11155111) |
| 💰 **Wallet** | ✅ Funded | ~100 PYUSD (Sepolia Testnet) |
| 🏗️ **Smart Contract** | ✅ Deployed | `0x6389b44A56E1bb6BCff56FDE4A563CCF41b15825` |
| 📱 **Mobile App** | ✅ Working | React Native + Expo |
| 🖥️ **Backend API** | ✅ Running | Node.js + Express |
| 💾 **Database** | ✅ Active | MongoDB |
| 🔐 **Authentication** | ✅ Secure | JWT + Blockchain signatures |
| 📦 **IPFS Storage** | ✅ Integrated | Decentralized file storage |

### 🔄 Migration Complete

- ✅ **Migrated from:** Polygon Mumbai → Ethereum Sepolia
- ✅ **Codebase Updated:** All references updated to Sepolia/Ethereum
- ✅ **Testing Complete:** Full functionality verified on Sepolia
- ✅ **Documentation Updated:** All guides reflect current setup

---

<div align="center">

## 🏗️ Architecture

<img src="https://user-images.githubusercontent.com/74038190/212750147-854a394f-fee9-4080-9770-78a4b7ece53f.gif" width="400">

</div>

### 📱 Tech Stack

<div align="center">

#### Frontend
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

#### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

#### Blockchain
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=hardhat&logoColor=black)

#### Storage
![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)

</div>

### 🔄 Data Flow

```
📱 Mobile App (React Native)
        ↕
🔐 Authentication Layer (JWT + Blockchain)
        ↕
🖥️ Backend API (Node.js + Express)
        ↕
    ┌───┴───┬───────┬──────┐
    ↓       ↓       ↓      ↓
💾 MongoDB ⛓️ Ethereum 📦 IPFS 🔒 Encryption
```

---

<div align="center">

## 🛡️ Security Features

<img src="https://user-images.githubusercontent.com/74038190/212750996-938b257b-266c-45a7-9af7-655341c0f58b.gif" width="350">

</div>

### 🔐 Multi-Layer Security

- 🔒 **End-to-End Encryption** - AES-256 encryption for all health data
- ⛓️ **Blockchain Immutability** - Tamper-proof record keeping
- 🎫 **JWT Authentication** - Secure session management
- 🔑 **Private Key Management** - Hardware wallet support
- 📝 **Audit Logs** - Complete access history
- 🛡️ **Smart Contract Security** - Audited and tested code
- 🚫 **Zero-Knowledge Proofs** - Verify without revealing data
- 🔐 **Multi-Signature** - Critical operations require multiple approvals

---

<div align="center">

## 🤝 Contributing

<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="600">

</div>

We welcome contributions from the community! Here's how you can help:

### 🚀 Getting Started

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/MyHealthID.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

### 💡 Ways to Contribute

- 🐛 **Bug Reports** - Found a bug? Let us know!
- ✨ **Feature Requests** - Have an idea? Share it!
- 📝 **Documentation** - Help improve our docs
- 🎨 **UI/UX** - Design improvements
- 🔒 **Security** - Security audits and improvements
- 🧪 **Testing** - Write tests, find edge cases
- 🌍 **Translations** - Help make it multilingual

---

<div align="center">

## 🗺️ Roadmap

<img src="https://user-images.githubusercontent.com/74038190/212750155-3ceddfbd-19d3-40a3-87af-8d329c8323c4.gif" width="350">

</div>

### 🎯 Current Phase (Q1 2025)
- ✅ Core platform development
- ✅ Ethereum Sepolia integration
- ✅ Mobile app MVP
- ✅ Basic health record management

### 🚀 Next Phase (Q2 2025)
- 🔄 Healthcare provider integrations
- 🔄 Advanced encryption features
- 🔄 Emergency access protocols
- 🔄 Multi-language support

### 🌟 Future Vision (Q3-Q4 2025)
- 📅 AI-powered health insights
- 📅 Wearable device integration
- 📅 Telemedicine integration
- 📅 Insurance claim automation
- 📅 Mainnet deployment

---

<div align="center">

## 📞 Support & Contact

<img src="https://user-images.githubusercontent.com/74038190/212750672-2f3f2b50-c84f-4ed8-a60a-849ae69ff9df.gif" width="400">

</div>

### 🆘 Need Help?

- 🐛 **Report Bugs:** [GitHub Issues](https://github.com/YOUR_USERNAME/MyHealthID/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/MyHealthID/discussions)
- 📧 **Email:** support@myhealthid.io
- 📚 **Documentation:** [Full Docs](./docs)
- 💼 **Business Inquiries:** partnerships@myhealthid.io

### 🌐 Community

[![Discord](https://img.shields.io/badge/Discord-Join_Us-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/myhealthid)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/myhealthid)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/myhealthid)

---

<div align="center">

## 📜 License

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="300">

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### ⚖️ What This Means

- ✅ Free to use, modify, and distribute
- ✅ Commercial use allowed
- ✅ No warranty provided
- ⚠️ License and copyright notice must be included

---

## 🙏 Acknowledgments

Special thanks to:
- 🌐 **Ethereum Foundation** - For the blockchain infrastructure
- 📦 **IPFS Protocol Labs** - For decentralized storage
- 🏥 **Healthcare Community** - For feedback and support
- 💻 **Open Source Community** - For amazing tools and libraries

---

## ⚠️ Important Disclaimers

<img src="https://user-images.githubusercontent.com/74038190/212750147-854a394f-fee9-4080-9770-78a4b7ece53f.gif" width="300">

### 🚧 Development Status

MyHealthID is currently in **active development** and deployed on the **Sepolia testnet**. This means:

- ⚠️ **Not for production use** - Do not store real medical data yet
- ⚠️ **Testnet only** - Using test cryptocurrencies, not real money
- ⚠️ **Breaking changes possible** - APIs and features may change
- ⚠️ **Security audit pending** - Full security audit in progress

### 🏥 Medical Disclaimer

- 📋 This platform is for health record management only
- 🚫 Not a substitute for professional medical advice
- 🚫 Not intended for diagnosis or treatment
- 👨‍⚕️ Always consult healthcare professionals for medical decisions

### 🔒 Privacy Notice

- 🔐 Your data is encrypted and stored securely
- 👤 You maintain full ownership of your health data
- 🔓 You control who accesses your information
- 📊 See our [Privacy Policy](./PRIVACY.md) for details

---

## 🏥 Made with ❤️ for Healthcare Innovation

<img src="https://user-images.githubusercontent.com/74038190/212748830-4c709398-a386-4761-84d7-9e10b98fbe6e.gif" width="600">

### Empowering Patients. Securing Data. Transforming Healthcare. 🚀

**Your Health. Your Identity. Your Control.** ✨

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="600">

[![Star this repo](https://img.shields.io/github/stars/YOUR_USERNAME/MyHealthID?style=social)](https://github.com/YOUR_USERNAME/MyHealthID)
[![Watch this repo](https://img.shields.io/github/watchers/YOUR_USERNAME/MyHealthID?style=social)](https://github.com/YOUR_USERNAME/MyHealthID)
[![Fork this repo](https://img.shields.io/github/forks/YOUR_USERNAME/MyHealthID?style=social)](https://github.com/YOUR_USERNAME/MyHealthID/fork)

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,5,10&height=120&section=footer&text=Take%20Control%20of%20Your%20Health!%20💪&fontSize=30&fontColor=fff&animation=twinkling" width="100%">

</div>
