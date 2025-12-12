import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  logId: {
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
  recordId: String,
  accessedBy: {
    type: String,
    required: true
  },
  accessorName: {
    type: String,
    required: true
  },
  accessorRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['view', 'upload', 'download', 'share', 'consent_granted', 'consent_rejected', 'access_revoked']
  },
  ipAddress: String,
  userAgent: String,
  location: String,
  // Blockchain proof
  blockchainTxHash: String,
  verified: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

auditLogSchema.index({ patientId: 1, timestamp: -1 });
auditLogSchema.index({ accessedBy: 1 });
auditLogSchema.index({ recordId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
