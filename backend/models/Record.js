import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Lab Report', 'X-Ray Report', 'MRI Scan', 'Prescription', 'Discharge Summary', 'Consultation Notes']
  },
  title: {
    type: String,
    required: true
  },
  hospitalId: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  // IPFS Data
  ipfsCID: {
    type: String,
    required: true,
    index: true
  },
  encryptionHash: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    required: true
  },
  // Blockchain Data
  blockchainTxHash: {
    type: String,
    required: true,
    index: true
  },
  blockNumber: Number,
  chainId: {
    type: Number,
    default: 11155111 // Ethereum Sepolia
  },
  // Metadata
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  verifiedAt: Date,
  metadata: {
    mimeType: String,
    originalName: String,
    encryptionAlgorithm: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

recordSchema.index({ patientId: 1, uploadDate: -1 });
recordSchema.index({ hospitalId: 1 });

export default mongoose.model('Record', recordSchema);
