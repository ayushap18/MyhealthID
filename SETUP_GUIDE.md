# MyHealthID - Setup & Demo Guide

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
cd /Users/ayush18/MyhealthID
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Open on Your Device
- Install **Expo Go** app on your phone
- Scan the QR code from terminal
- App will load with role selector screen

---

## 🎯 Demo Flow (< 2 minutes)

### Scenario: Hospital Upload → Patient Consent → Insurer Verification

#### **Step 1: Hospital Uploads Record** (30 seconds)
1. Select **Hospital Staff** role
2. Quick login: **Apollo Diagnostics** (STAFF001)
3. Tap "Upload New Record"
4. Quick select Patient: **P001 - Rahul Sharma**
5. Record Type: **Blood Test**
6. Record Title: **CBC Test - Dec 2025**
7. Select file (take photo or choose document)
8. Tap "Encrypt & Upload to Blockchain"
9. Watch the progress:
   - 🔐 Encrypting file
   - 📤 Uploading to IPFS
   - ⛓️ Minting blockchain transaction
   - ✅ Upload complete!

#### **Step 2: Patient Approves Consent** (20 seconds)
1. Go back to Role Selector (tap Logout)
2. Select **Patient** role (auto-login as Rahul Sharma)
3. See yellow alert: "1 Pending Consent Request"
4. Tap the alert or go to "Consent" button
5. Review request from Apollo Diagnostics
6. Tap **Approve**
7. See success message with Token ID

#### **Step 3: Insurer Verifies Record** (40 seconds)
1. Go back to Role Selector
2. Select **Insurance Verifier** role
3. Quick login: **HDFC Health Insurance** (AGENT001)
4. Tap "Request Patient Record"
5. Quick select Patient: **P001**
6. Quick select Record Type: **Blood Test**
7. Tap "Find & Verify Record"
8. On verification screen, tap "Verify Authenticity"
9. Watch verification process:
   - 📥 Retrieving from IPFS
   - 🔐 Computing hash
   - ⛓️ Querying blockchain
   - ✓ Hash comparison
10. See **VERIFIED ✓** result
11. Tap "Mark as Claim Ready"

---

## 👥 Demo Credentials

### Patients (Auto-login)
- **P001**: Rahul Sharma - Has 2 existing records
- **P002**: Priya Patel - Has 1 existing record

### Hospital Staff
- **STAFF001**: Apollo Diagnostics - Dr. Amit Kumar
- **STAFF002**: Max Healthcare - Dr. Sneha Reddy

### Insurance Agents
- **AGENT001**: HDFC Health Insurance - Vikram Singh
- **AGENT002**: Star Health Insurance - Anjali Desai

---

## 📱 Screen Navigation Map

```
Role Selector
├── Patient Flow
│   ├── Dashboard (landing)
│   ├── Consent Manager
│   └── Audit Log
│
├── Hospital Flow
│   ├── Login
│   ├── Dashboard
│   └── Upload Record
│
└── Insurer Flow
    ├── Login
    ├── Dashboard
    ├── Request Access
    └── Verify Record
```

---

## 🎨 Key Features to Highlight

### Patient Dashboard
- Health ID card with wallet address
- Pending consent alerts
- Medical records timeline
- Quick action buttons

### Hospital Upload
- Patient quick-select
- Image/PDF picker
- Multi-step upload progress
- Real-time encryption simulation
- IPFS CID generation
- Blockchain transaction hash

### Insurer Verification
- Patient record search
- Consent status check
- Multi-step verification
- Hash comparison display
- Blockchain validation
- Success/failure indicators

---

## 🔐 Technical Highlights

### Mock Blockchain Features
- **expo-crypto** for SHA-256 hashing
- Simulated IPFS CID generation (60-char base58)
- Mock Ethereum transaction hashes
- Simulated block numbers
- Gas fee calculations

### Data Persistence
- **AsyncStorage** for all data
- Survives app restarts
- Pre-seeded demo data
- Real-time updates across roles

### UI/UX Features
- Loading overlays with animations
- Progress step indicators
- Color-coded status badges
- Responsive alerts
- Smooth navigation transitions

---

## 🐛 Troubleshooting

### "Metro bundler not starting"
```bash
# Clear cache and restart
npm start -- --clear
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Expo Go won't connect"
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npm start -- --tunnel`

### "Assets not loading"
The placeholder asset files are intentional. The app uses default Expo assets and emojis for icons.

---

## 📊 Mock Data Summary

### Pre-seeded Records
- **REC001**: Blood Test for P001 (Apollo)
- **REC002**: X-Ray Report for P001 (Max)
- **REC003**: Prescription for P002 (Fortis)

### Pre-seeded Consent Request
- **CONSENT001**: HDFC requesting P001's Blood Test (pending)

### Pre-seeded Audit Logs
- Star Insurance viewed P001's X-Ray
- Apollo uploaded P001's Blood Test

---

## 🎯 Judge Demo Script

**Opening (10 seconds):**
"MyHealthID - patient-owned health records with blockchain verification. Your Health. Your Identity. Your Control."

**Demo Flow (90 seconds):**
1. "Hospital uploads encrypted medical record"
   - Show encryption → IPFS → blockchain registration
2. "Patient receives instant notification and approves consent"
   - Show consent approval with token minting
3. "Insurer verifies record authenticity in real-time"
   - Show hash comparison and blockchain validation
4. "Complete flow under 2 minutes with full audit trail"

**Closing (20 seconds):**
"Every action immutably recorded. Zero-knowledge ready. ABDM-compliant. Built for trust."

---

## 📝 Notes for Presentation

### Key Differentiators
- **Patient-Centric**: Patients control all access
- **Verifiable**: Blockchain-anchored authenticity
- **Fast**: < 2 minute complete flow
- **Transparent**: Full audit trail
- **ABDM-Ready**: JSON schema compatible

### Technology Stack
- Expo SDK 51+ (cross-platform)
- React Navigation 6
- expo-crypto for hashing
- AsyncStorage for persistence
- Mock Web3/IPFS services

### Production Readiness
- Replace mock services with:
  - Real Ethereum RPC (Sepolia/Mainnet)
  - Actual IPFS/Filecoin pinning
  - MetaMask/WalletConnect integration
  - Real encryption libraries
  - Backend API for consent tokens
