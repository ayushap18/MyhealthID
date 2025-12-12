// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Patient Routes
// Patient-specific API endpoints for dashboard, records, etc.
// ═══════════════════════════════════════════════════════════════════════════

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Record from '../models/Record.js';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

/**
 * GET /api/patient/dashboard
 * Get patient dashboard data including stats and recent records
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const patientId = req.user.userId;

    // Get records count
    const totalRecords = await Record.countDocuments({ patientId });

    // Get recent records
    const records = await Record.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get pending consents count
    const pendingConsents = await Consent.countDocuments({
      patientId,
      status: 'pending'
    });

    // Get approved consents count (shared records)
    const sharedRecords = await Consent.countDocuments({
      patientId,
      status: 'approved',
      expiresAt: { $gt: new Date() }
    });

    // Get recent audit logs
    const recentActivity = await AuditLog.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      totalRecords,
      pendingConsents,
      sharedRecords,
      records: records.map(r => ({
        _id: r._id,
        title: r.title || r.recordType || 'Health Record',
        type: r.recordType || 'document',
        hospitalName: r.hospitalName || r.providerName || 'Unknown Provider',
        createdAt: r.createdAt,
        verified: r.blockchainVerified || false
      })),
      recentActivity: recentActivity.map(a => ({
        _id: a._id,
        action: a.action,
        performedBy: a.performedBy,
        timestamp: a.timestamp,
        details: a.details
      }))
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/patient/verify/:healthId
 * Verify a patient by their health ID
 */
router.get('/verify/:healthId', authenticate, async (req, res) => {
  try {
    const { healthId } = req.params;

    // In a real implementation, this would verify against the health ID database
    // For now, we'll return a mock verification
    res.json({
      success: true,
      verified: true,
      healthId,
      message: 'Patient verified successfully'
    });
  } catch (error) {
    console.error('Patient verification error:', error);
    res.status(500).json({ error: 'Failed to verify patient' });
  }
});

/**
 * GET /api/patient/profile
 * Get patient profile details
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const patientId = req.user.userId;

    // Get patient's records summary
    const recordsSummary = await Record.aggregate([
      { $match: { patientId } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      userId: patientId,
      recordsSummary,
      memberSince: req.user.createdAt
    });
  } catch (error) {
    console.error('Patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
