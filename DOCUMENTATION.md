# MyHealthID - Complete Documentation

> **Your Health. Your Identity. Your Control.**

MyHealthID is a **decentralized, patient-owned health identity platform** that empowers individuals to securely store, manage, and share their medical records using blockchain technology (Ethereum Sepolia) and decentralized storage (IPFS).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Data Models](#data-models)
7. [API Reference](#api-reference)
8. [Smart Contract](#smart-contract)
9. [Security Features](#security-features)
10. [User Roles & Workflows](#user-roles--workflows)
11. [Installation & Setup](#installation--setup)
12. [Environment Variables](#environment-variables)
13. [Deployment Guide](#deployment-guide)
14. [Troubleshooting](#troubleshooting)

---

## Overview

MyHealthID solves critical problems in healthcare data management:

| Problem | MyHealthID Solution |
|---------|---------------------|
| Fragmented medical records across providers | Unified patient-controlled health identity |
| Lack of data ownership | Patient owns and controls all records |
| Data breaches & privacy concerns | End-to-end encryption + blockchain verification |
| Difficult record sharing | Consent-based access with time-limited tokens |
| No audit trail | Immutable blockchain audit logs |
| Emergency access challenges | Emergency responder access with automatic audit |

---

## Key Features

### 🔐 Patient Features
- **Digital Health Identity**: Unique patient ID linked to Ethereum wallet
- **Record Management**: View, download, and manage all health records
- **Consent Control**: Grant/revoke access to hospitals and insurers
- **QR Health Card**: Scannable QR code for emergency medical info
- **Audit Logs**: Full transparency on who accessed records and when
- **Emergency Access**: Allow emergency responders temporary access

### 🏥 Hospital Features
- **Record Upload**: Upload patient records to IPFS with blockchain verification
- **Patient Search**: Find patients and request access to records
- **Real-time Notifications**: Get notified when consent is granted/revoked

### 🏢 Insurer Features
- **Access Requests**: Request patient consent for record access
- **Record Verification**: Verify record authenticity via blockchain hash
- **Claims Processing**: Access approved records for claims

### 🔗 Blockchain Features
- **Immutable Registration**: All records registered on Ethereum Sepolia
- **Access Tokens**: Time-limited, revocable access grants
- **Audit Trail**: Every access logged on-chain
- **Hash Verification**: Detect any tampering via metadata hash

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Native / Expo App                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │    │
│  │  │ Patient  │  │ Hospital │  │ Insurer  │  │ Auth & Navigation    │ │    │
│  │  │Dashboard │  │Dashboard │  │Dashboard │  │ Context              │ │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │    │
│  └───────┼─────────────┼─────────────┼───────────────────┼─────────────┘    │
│          │             │             │                   │                   │
│          └─────────────┴─────────────┴───────────────────┘                   │
│                                    │                                         │
│                           API Service Layer                                  │
│                    (Axios + Socket.io Client)                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS / WSS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Express.js Backend                               │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────────┐   │    │
│  │  │   Auth    │  │  Records  │  │  Consent  │  │    Emergency    │   │    │
│  │  │  Routes   │  │  Routes   │  │  Routes   │  │     Routes      │   │    │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───────┬─────────┘   │    │
│  │        │              │              │                │              │    │
│  │  ┌─────┴──────────────┴──────────────┴────────────────┴─────────┐   │    │
│  │  │                    Middleware Layer                           │   │    │
│  │  │  (Auth JWT | Rate Limiter | Validation | Helmet | CORS)      │   │    │
│  │  └──────────────────────────────┬────────────────────────────────┘   │    │
│  │                                 │                                     │    │
│  │  ┌──────────────────────────────┴────────────────────────────────┐   │    │
│  │  │                     Services Layer                             │   │    │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │   │    │
│  │  │  │ Blockchain │  │   IPFS     │  │ Encryption │  │   OTP    │ │   │    │
│  │  │  │  Service   │  │  Service   │  │  Service   │  │ Service  │ │   │    │
│  │  │  └─────┬──────┘  └─────┬──────┘  └────────────┘  └──────────┘ │   │    │
│  │  └────────┼───────────────┼──────────────────────────────────────┘   │    │
│  └───────────┼───────────────┼──────────────────────────────────────────┘    │
└──────────────┼───────────────┼──────────────────────────────────────────────┘
               │               │
               ▼               ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────────┐
│   Ethereum Sepolia   │  │    IPFS / Web3.Storage│  │       MongoDB           │
│   Smart Contract     │  │    Decentralized      │  │    (User, Records,      │
│   (Audit + Access)   │  │    File Storage       │  │     Consent, Audit)     │
└──────────────────────┘  └──────────────────────┘  └─────────────────────────┘
```

---

## Technology Stack

### Frontend (Mobile App)
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | 54.0.28 | Development platform & tools |
| React Navigation | 6.x | Navigation & routing |
| Ethers.js | 6.16.0 | Ethereum wallet & blockchain interaction |
| Socket.io Client | 4.6.0 | Real-time notifications |
| Expo Secure Store | 15.x | Secure credential storage |
| CryptoJS | 4.2.0 | Client-side encryption |
| Lottie | 7.3.4 | Premium animations |
| Sentry | 7.2.0 | Error tracking & monitoring |

### Backend (API Server)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| MongoDB + Mongoose | 8.0.3 | Database & ODM |
| Ethers.js | 6.9.0 | Blockchain service |
| Socket.io | 4.6.0 | WebSocket server |
| JWT | 9.0.2 | Authentication tokens |
| Bcrypt | 5.1.1 | Password hashing |
| Helmet | 7.1.0 | Security headers |
| Twilio | 5.10.6 | SMS OTP service |
| Sentry | 10.27.0 | Error monitoring |

### Blockchain
| Technology | Network | Purpose |
|------------|---------|---------|
| Solidity | 0.8.20 | Smart contract language |
| Hardhat | - | Development & deployment |
| OpenZeppelin | - | Access control & security |
| Ethereum Sepolia | Chain ID: 11155111 | Testnet deployment |

### Storage
| Technology | Purpose |
|------------|---------|
| IPFS (via Web3.Storage) | Decentralized file storage |
| MongoDB | Off-chain metadata & user data |

---

## Project Structure

```
MyhealthID/
├── App.js                      # Main app entry with navigation
├── app.json                    # Expo configuration
├── package.json                # Frontend dependencies
│
├── src/                        # Frontend source code
│   ├── components/             # Reusable UI components
│   │   ├── Button.js           # Custom button component
│   │   ├── Card.js             # Card layouts
│   │   ├── NotificationBanner.js # Toast notifications
│   │   ├── QRCodeGenerator.js  # QR code generation
│   │   └── QRHealthCard.js     # Health card with QR
│   │
│   ├── config/                 # App configuration
│   │   ├── api.js              # API URL configuration
│   │   └── index.js            # General config
│   │
│   ├── context/                # React Context
│   │   └── AuthContext.js      # Authentication state
│   │
│   ├── screens/                # App screens
│   │   ├── Splash/             # Animated splash screen
│   │   ├── Onboarding/         # Welcome slides
│   │   ├── RoleSelect/         # Role selection
│   │   ├── Auth/               # Login/Register screens
│   │   │   ├── PatientAuth.js
│   │   │   ├── HospitalAuth.js
│   │   │   └── InsurerAuth.js
│   │   ├── Dashboard/          # Main dashboards
│   │   │   ├── PatientDashboard.js
│   │   │   ├── HospitalDashboard.js
│   │   │   └── InsurerDashboard.js
│   │   ├── patient/            # Patient-specific screens
│   │   │   ├── ConsentManagerScreen.js
│   │   │   ├── AuditLogScreen.js
│   │   │   ├── RecordDetailScreen.js
│   │   │   ├── EmergencyAccessScreen.js
│   │   │   └── QRHealthCardScreen.js
│   │   ├── hospital/           # Hospital-specific screens
│   │   │   ├── UploadRecordScreen.js
│   │   │   └── HospitalDashboardScreen.js
│   │   └── insurer/            # Insurer-specific screens
│   │       ├── RequestAccessScreen.js
│   │       └── VerifyRecordScreen.js
│   │
│   ├── services/               # API & blockchain services
│   │   ├── apiService.js       # HTTP client & auth
│   │   ├── blockchainService.js # Ethers.js wrapper
│   │   ├── encryptionService.js # Client encryption
│   │   ├── ipfsService.js      # IPFS interaction
│   │   ├── secureStorage.js    # Secure storage
│   │   ├── socketService.js    # WebSocket client
│   │   └── web3Service.js      # Web3 utilities
│   │
│   ├── theme/                  # Design system
│   │   └── index.js            # Colors, typography, spacing
│   │
│   └── utils/                  # Utilities
│       ├── logger.js           # Logging utility
│       ├── toast.js            # Toast notifications
│       └── debounce.js         # Debounce helper
│
├── backend/                    # Backend API server
│   ├── server.js               # Express app entry
│   ├── package.json            # Backend dependencies
│   │
│   ├── contracts/              # Smart contracts
│   │   ├── src/
│   │   │   ├── HealthRecordRegistry.sol    # Main contract
│   │   │   └── HealthRecordRegistryV2.sol  # Upgraded version
│   │   ├── scripts/
│   │   │   └── deploy.js       # Deployment script
│   │   └── hardhat.config.js   # Hardhat configuration
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── validation.js       # Request validation
│   │
│   ├── models/                 # Mongoose models
│   │   ├── User.js             # User schema
│   │   ├── Record.js           # Health record schema
│   │   ├── Consent.js          # Consent schema
│   │   └── AuditLog.js         # Audit log schema
│   │
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Authentication
│   │   ├── records.js          # Record CRUD
│   │   ├── consent.js          # Consent management
│   │   ├── audit.js            # Audit logs
│   │   ├── patient.js          # Patient endpoints
│   │   ├── emergency.js        # Emergency access
│   │   └── compliance.js       # HIPAA compliance
│   │
│   ├── services/               # Backend services
│   │   ├── blockchainService.js # Ethereum interaction
│   │   ├── ipfsService.js      # Web3.Storage upload
│   │   ├── encryptionService.js # AES-256-GCM
│   │   ├── otpService.js       # Twilio SMS OTP
│   │   └── sentryService.js    # Error tracking
│   │
│   └── scripts/
│       └── seedPilotData.js    # Test data seeder
│
└── assets/                     # Images & icons
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## Data Models

### User Model
```javascript
{
  patientId: String,          // Unique identifier (e.g., "PAT-abc123")
  walletAddress: String,      // Ethereum wallet address
  role: String,               // "patient" | "hospital" | "insurer" | "doctor"
  name: String,               // Full name
  email: String,              // Email address (unique)
  phone: String,              // Phone in E.164 format
  phoneVerified: Boolean,     // Phone verification status
  passwordHash: String,       // Bcrypt hashed password
  publicKey: String,          // For end-to-end encryption
  refreshToken: String,       // Current refresh token
  termsAccepted: {
    version: String,
    date: Date
  },
  createdAt: Date,
  lastLogin: Date
}
```

### Record Model
```javascript
{
  recordId: String,           // Unique record ID
  patientId: String,          // Owner patient ID
  type: String,               // "Lab Report" | "X-Ray" | "MRI" | "Prescription" | etc.
  title: String,              // Record title
  hospitalId: String,         // Uploading hospital ID
  hospitalName: String,       // Hospital display name
  uploadedBy: String,         // Uploader's user ID
  
  // IPFS Data
  ipfsCID: String,            // IPFS Content Identifier
  encryptionHash: String,     // SHA-256 hash for verification
  fileSize: String,           // File size
  
  // Blockchain Data
  blockchainTxHash: String,   // Ethereum transaction hash
  blockNumber: Number,        // Block number
  chainId: Number,            // 11155111 (Sepolia)
  
  // Status
  status: String,             // "pending" | "verified" | "failed"
  verifiedAt: Date,
  
  metadata: {
    mimeType: String,
    originalName: String,
    encryptionAlgorithm: String
  },
  uploadDate: Date
}
```

### Consent Model
```javascript
{
  consentId: String,          // Unique consent ID
  patientId: String,          // Patient granting consent
  requesterId: String,        // Hospital/insurer requesting
  requesterName: String,      // Requester display name
  requesterRole: String,      // "hospital" | "insurer"
  recordIds: [String],        // Specific records (optional)
  purpose: String,            // Reason for access
  status: String,             // "pending" | "approved" | "rejected" | "expired"
  
  requestedAt: Date,
  respondedAt: Date,
  expiresAt: Date,            // Access expiration
  
  // Blockchain
  blockchainTxHash: String,
  accessTokenId: String,
  
  accessLevel: String,        // "read" | "read-write"
  emergencyAccess: Boolean,   // Emergency override flag
  
  revokeDate: Date,
  revokeReason: String
}
```

### Audit Log Model
```javascript
{
  auditId: String,
  patientId: String,
  action: String,             // "view" | "download" | "share" | "revoke" | etc.
  performedBy: String,        // User who performed action
  performerRole: String,
  recordId: String,           // Affected record (optional)
  details: Object,            // Additional context
  ipAddress: String,
  userAgent: String,
  blockchainTxHash: String,   // On-chain log reference
  timestamp: Date
}
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout & invalidate tokens |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| GET | `/api/auth/me` | Get current user profile |
| DELETE | `/api/auth/account` | Delete account (7-day grace) |

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/dashboard` | Get dashboard data |
| GET | `/api/patient/records` | List all records |
| GET | `/api/patient/records/:id` | Get record details |
| GET | `/api/patient/consents` | List consent requests |
| PUT | `/api/patient/consents/:id` | Approve/reject consent |

### Record Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/records/upload` | Upload new record |
| GET | `/api/records/:id` | Get record by ID |
| GET | `/api/records/:id/download` | Download record file |
| GET | `/api/records/:id/verify` | Verify blockchain hash |

### Consent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/consent/request` | Request access |
| GET | `/api/consent/pending` | List pending requests |
| PUT | `/api/consent/:id/approve` | Approve request |
| PUT | `/api/consent/:id/reject` | Reject request |
| DELETE | `/api/consent/:id/revoke` | Revoke granted access |

### Emergency Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/access` | Request emergency access |
| GET | `/api/emergency/status/:patientId` | Check emergency status |
| POST | `/api/emergency/revoke` | Revoke emergency access |

### Audit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/logs` | Get audit logs |
| GET | `/api/audit/logs/:recordId` | Logs for specific record |

---

## Smart Contract

### HealthRecordRegistry.sol

The smart contract manages:

1. **Document Registration**: Records are registered with IPFS CID and metadata hash
2. **Access Control**: Time-limited access tokens granted by patients
3. **Emergency Access**: Special access for emergency responders
4. **Audit Logging**: All access events logged on-chain

#### Key Functions

```solidity
// Register a health record on-chain
function registerDocument(
    string recordId,
    string patientId,
    string ipfsCID,
    bytes32 metadataHash
) external onlyRole(HOSPITAL_ROLE)

// Grant time-limited access to a requester
function grantAccess(
    string patientId,
    address requester,
    uint256 expiresAt
) external returns (uint256 tokenId)

// Revoke access
function revokeAccess(uint256 tokenId) external

// Check if requester has valid access
function checkAccess(
    address requester,
    string patientId
) external view returns (bool)

// Log access event
function logAccess(
    string recordId,
    address accessor,
    string action
) external
```

#### Events

```solidity
event RecordRegistered(recordId, patientId, ipfsCID, uploadedBy, timestamp)
event AccessGranted(tokenId, patientId, requester, expiresAt)
event AccessRevoked(tokenId, patientId, requester)
event AuditLogged(recordId, accessor, action, timestamp)
```

---

## Security Features

### 🔐 Encryption
- **AES-256-GCM**: All files encrypted before IPFS upload
- **Unique Keys**: Per-record encryption keys
- **Client-side Encryption**: Data encrypted before leaving device

### 🛡️ Authentication
- **JWT Tokens**: Short-lived access tokens (7 days)
- **Refresh Tokens**: Long-lived tokens (30 days) for renewal
- **Password Requirements**: Min 8 chars, uppercase, lowercase, number, special char
- **Phone OTP**: Optional two-factor via Twilio SMS

### 🚦 Rate Limiting
- **API Limiter**: 100 requests/15 minutes per IP
- **Auth Limiter**: 5 attempts/15 minutes
- **OTP Limiter**: 3 attempts/15 minutes

### 🔒 Backend Security
- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **CORS**: Configurable origin whitelist
- **MongoDB Sanitization**: Prevent NoSQL injection
- **HPP**: HTTP parameter pollution prevention
- **Input Validation**: Joi + express-validator

### ⛓️ Blockchain Security
- **Role-Based Access Control**: OpenZeppelin AccessControl
- **On-chain Verification**: Metadata hash stored on Ethereum
- **Tamper Detection**: Compare IPFS hash with blockchain record
- **Audit Trail**: Immutable access logs

---

## User Roles & Workflows

### Patient Workflow
```
1. Register → Create account with email/password
2. Verify → Optional phone OTP verification
3. Dashboard → View health records & stats
4. Receive Requests → Hospitals/insurers request access
5. Manage Consent → Approve/reject/revoke access
6. View Audit → See who accessed records
7. Emergency Card → Generate QR with emergency info
```

### Hospital Workflow
```
1. Login → Authenticate with hospital credentials
2. Dashboard → View assigned patients
3. Upload Records → Encrypt & upload to IPFS + blockchain
4. Request Access → Ask patients for record access
5. View Approved → Access consented records
6. Verify Records → Confirm blockchain authenticity
```

### Insurer Workflow
```
1. Login → Authenticate with insurer credentials
2. Request Access → Request specific patient records
3. Wait for Consent → Patient approves/rejects
4. View Records → Access approved records
5. Verify Authenticity → Blockchain verification
6. Process Claims → Use verified records
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo Go app on mobile device
- MetaMask wallet (for blockchain features)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ayushap18/MyhealthID.git
cd MyhealthID

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 5. Start MongoDB (if local)
mongod

# 6. Start the backend
cd backend
npm start

# 7. Start the frontend (new terminal)
cd ..  # Back to root
npm start

# 8. Scan QR code with Expo Go app
```

---

## Environment Variables

Create `backend/.env` with these variables:

```env
# Server
PORT=5002
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/myhealthid

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-64-char-hex-key

# Ethereum Sepolia
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0x...

# IPFS (Web3.Storage)
WEB3_STORAGE_TOKEN=your-web3-storage-token

# Twilio (Optional - for OTP)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Sentry (Optional - for error tracking)
SENTRY_DSN=your-sentry-dsn

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.x.x:8081
```

---

## Deployment Guide

### Deploy Smart Contract

```bash
cd backend/contracts

# Install Hardhat dependencies
npm install

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Copy the contract address to backend/.env
```

### Deploy Backend (Railway/Heroku)

```bash
cd backend

# Railway
railway login
railway link
railway up

# Or Heroku
heroku create myhealthid-api
git subtree push --prefix backend heroku main
```

### Build Mobile App

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MONGODB_URI and ensure MongoDB is running |
| Blockchain service not ready | Verify PRIVATE_KEY and CONTRACT_ADDRESS in .env |
| IPFS upload fails | Check WEB3_STORAGE_TOKEN is valid |
| JWT errors | Regenerate JWT_SECRET and JWT_REFRESH_SECRET |
| CORS errors | Add your client URL to ALLOWED_ORIGINS |
| OTP not sending | Verify Twilio credentials |

### Debug Commands

```bash
# Check backend logs
cd backend && npm start

# Check MongoDB connection
mongosh mongodb://localhost:27017/myhealthid

# Test blockchain connection
node -e "require('./services/blockchainService.js').default.initialize()"

# Clear Expo cache
npx expo start --clear
```

---

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

## Support

- **GitHub Issues**: [Report a bug](https://github.com/ayushap18/MyhealthID/issues)
- **Email**: ayushap18@example.com

---

**Built with ❤️ for a healthier, more secure future.**
