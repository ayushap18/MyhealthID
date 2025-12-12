import express from 'express';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

/**
 * POST /api/emergency/grant-access
 * Grant emergency access to all providers (24-hour auto-revoke)
 */
router.post('/grant-access', authenticate, async (req, res) => {
  try {
    const patientId = req.user.userId;
    
    // Create emergency consent (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const emergencyConsent = new Consent({
      consentId: `EMERGENCY${Date.now()}`,
      patientId,
      requesterId: 'EMERGENCY',
      requesterName: 'Emergency Access',
      purpose: 'Emergency medical situation - full access granted',
      status: 'approved',
      requestDate: new Date(),
      responseDate: new Date(),
      expiresAt,
      emergencyAccess: true
    });

    await emergencyConsent.save();

    // Log emergency access grant
    const auditLog = new AuditLog({
      patientId,
      action: 'emergency_access_granted',
      performedBy: patientId,
      details: {
        consentId: emergencyConsent.consentId,
        expiresAt: expiresAt.toISOString(),
        autoRevoke: '24 hours'
      },
      timestamp: new Date()
    });

    await auditLog.save();

    // Emit notification
    io.to(patientId).emit('emergency_access_granted', {
      consentId: emergencyConsent.consentId,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Emergency access granted',
      consentId: emergencyConsent.consentId,
      expiresAt,
      qrCode: `myhealthid://emergency/${patientId}/${emergencyConsent.consentId}`
    });
  } catch (error) {
    console.error('Emergency access error:', error);
    res.status(500).json({ error: 'Failed to grant emergency access' });
  }
});

/**
 * POST /api/emergency/revoke-access
 * Manually revoke emergency access
 */
router.post('/revoke-access', authenticate, async (req, res) => {
  try {
    const patientId = req.user.userId;

    // Find and revoke all active emergency consents
    const result = await Consent.updateMany(
      {
        patientId,
        emergencyAccess: true,
        status: 'approved',
        expiresAt: { $gt: new Date() }
      },
      {
        status: 'revoked',
        revokeDate: new Date(),
        revokeReason: 'Manually revoked by patient'
      }
    );

    // Log revocation
    const auditLog = new AuditLog({
      patientId,
      action: 'emergency_access_revoked',
      performedBy: patientId,
      details: {
        revokedCount: result.modifiedCount,
        reason: 'Manual revocation'
      },
      timestamp: new Date()
    });

    await auditLog.save();

    // Emit notification
    io.to(patientId).emit('emergency_access_revoked', {
      revokedCount: result.modifiedCount
    });

    res.json({
      success: true,
      message: 'Emergency access revoked',
      revokedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Revoke emergency access error:', error);
    res.status(500).json({ error: 'Failed to revoke emergency access' });
  }
});

/**
 * GET /api/emergency/status
 * Check if emergency access is active
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const patientId = req.user.userId;

    const activeEmergency = await Consent.findOne({
      patientId,
      emergencyAccess: true,
      status: 'approved',
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      active: !!activeEmergency,
      ...(activeEmergency && {
        consentId: activeEmergency.consentId,
        expiresAt: activeEmergency.expiresAt,
        timeRemaining: Math.ceil((activeEmergency.expiresAt - new Date()) / (1000 * 60 * 60)) + ' hours'
      })
    });
  } catch (error) {
    console.error('Emergency status error:', error);
    res.status(500).json({ error: 'Failed to check emergency status' });
  }
});

export default router;
