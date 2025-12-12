import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['patient', 'hospital', 'insurer', 'doctor'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    sparse: true, // Allow null but enforce uniqueness when present
    unique: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    required: true
  },
  publicKey: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  refreshToken: String, // For storing current valid refresh token
  deletionScheduled: Date, // Account deletion date (7-day grace period)
  termsAccepted: {
    version: String,
    date: Date
  },
  privacyPolicyAccepted: {
    version: String,
    date: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
