// Mock data constants and utilities

export const COLORS = {
  // Dark Theme Palette
  background: '#000000',
  card: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#27272A',

  // Brand Colors
  navy: '#000000', // Re-mapped to black for headers
  teal: '#14B8A6',
  tealDark: '#0D9488',
  
  // Legacy & Utility
  white: '#FFFFFF', // Keep for text/icons on dark backgrounds
  lightGray: '#18181B', // Re-mapped to dark gray for secondary backgrounds
  gray: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const MOCK_PATIENTS = [
  {
    id: 'P001',
    name: 'Rahul Sharma',
    age: 34,
    healthId: 'HID-2025-001-RS',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@email.com',
  },
  {
    id: 'P002',
    name: 'Priya Patel',
    age: 28,
    healthId: 'HID-2025-002-PP',
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    phone: '+91 98765 43211',
    email: 'priya.patel@email.com',
  },
];

export const MOCK_RECORDS = [
  {
    id: 'REC001',
    patientId: 'P001',
    type: 'Blood Test',
    title: 'Complete Blood Count (CBC)',
    hospitalName: 'Apollo Diagnostics',
    uploadDate: '2025-11-28T10:30:00Z',
    cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    encryptionHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    fileSize: '2.4 MB',
    status: 'verified',
  },
  {
    id: 'REC002',
    patientId: 'P001',
    type: 'X-Ray Report',
    title: 'Chest X-Ray Analysis',
    hospitalName: 'Max Healthcare',
    uploadDate: '2025-11-25T14:20:00Z',
    cid: 'bafkreih475g3yk67xjuvk7jnbxjqjqjgjgjgjgjgjgjgjgjgjgjgjgjgjgjg',
    encryptionHash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    fileSize: '1.8 MB',
    status: 'verified',
  },
  {
    id: 'REC003',
    patientId: 'P002',
    type: 'Prescription',
    title: 'General Consultation - Fever',
    hospitalName: 'Fortis Hospital',
    uploadDate: '2025-11-27T09:15:00Z',
    cid: 'bafkreibme22gw2h7y2h6tg56bftqnbnbxqxqxqxqxqxqxqxqxqxqxqxqxqx',
    encryptionHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    fileSize: '0.5 MB',
    status: 'verified',
  },
];

export const MOCK_CONSENT_REQUESTS = [
  {
    id: 'CONSENT001',
    patientId: 'P001',
    requesterId: 'INS001',
    requesterName: 'HDFC Health Insurance',
    requesterType: 'insurer',
    recordId: 'REC001',
    recordType: 'Blood Test',
    status: 'pending',
    requestDate: '2025-11-29T16:45:00Z',
    expiryHours: 48,
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'AUDIT001',
    patientId: 'P001',
    recordId: 'REC002',
    accessorName: 'Star Health Insurance',
    accessorType: 'insurer',
    action: 'VIEW',
    timestamp: '2025-11-26T11:30:00Z',
    verified: true,
  },
  {
    id: 'AUDIT002',
    patientId: 'P001',
    recordId: 'REC001',
    accessorName: 'Apollo Diagnostics',
    accessorType: 'hospital',
    action: 'UPLOAD',
    timestamp: '2025-11-28T10:35:00Z',
    verified: true,
  },
];

export const MOCK_HOSPITALS = [
  {
    id: 'HOSP001',
    name: 'Apollo Diagnostics',
    staffId: 'STAFF001',
    staffName: 'Dr. Amit Kumar',
    registrationNumber: 'HOSP-REG-2025-001',
  },
  {
    id: 'HOSP002',
    name: 'Max Healthcare',
    staffId: 'STAFF002',
    staffName: 'Dr. Sneha Reddy',
    registrationNumber: 'HOSP-REG-2025-002',
  },
];

export const MOCK_INSURERS = [
  {
    id: 'INS001',
    name: 'HDFC Health Insurance',
    agentId: 'AGENT001',
    agentName: 'Vikram Singh',
    licenseNumber: 'INS-LIC-2025-001',
  },
  {
    id: 'INS002',
    name: 'Star Health Insurance',
    agentId: 'AGENT002',
    agentName: 'Anjali Desai',
    licenseNumber: 'INS-LIC-2025-002',
  },
];

// Utility functions
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeSince = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const generateMockCID = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let cid = 'bafybei';
  for (let i = 0; i < 52; i++) {
    cid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cid;
};

export const generateMockHash = (length = 64) => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < length; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

export const simulateDelay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
