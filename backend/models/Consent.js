import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  consentId: {
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
  requesterId: {
    type: String,
    required: true,
    index: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterRole: {
    type: String,
    enum: ['hospital', 'insurer'],
    required: true
  },
  recordIds: [{
    type: String
  }],
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  // Blockchain data
  blockchainTxHash: String,
  accessTokenId: String,
  // Metadata
  accessLevel: {
    type: String,
    enum: ['read', 'read-write'],
    default: 'read'
  },
  notes: String,
  // Emergency access
  emergencyAccess: {
    type: Boolean,
    default: false
  },
  revokeDate: Date,
  revokeReason: String
}, {
  timestamps: true
});

consentSchema.index({ patientId: 1, status: 1 });
consentSchema.index({ requesterId: 1, status: 1 });
consentSchema.index({ expiresAt: 1 });

export default mongoose.model('Consent', consentSchema);
