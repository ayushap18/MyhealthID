import express from 'express';
import User from '../models/User.js';
import Record from '../models/Record.js';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/compliance/export
 * Export all user data (GDPR compliance)
 */
router.get('/export', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all user data
    const user = await User.findOne({ patientId: userId }).select('-passwordHash -refreshToken');
    const records = await Record.find({ patientId: userId });
    const consents = await Consent.find({ patientId: userId });
    const auditLogs = await AuditLog.find({ patientId: userId });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: user?.toObject(),
      records: records.map(r => r.toObject()),
      consents: consents.map(c => c.toObject()),
      auditLogs: auditLogs.map(a => a.toObject())
    };

    res.json({
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    });
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * POST /api/compliance/delete-account
 * Request account deletion (7-day grace period)
 */
router.post('/delete-account', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ patientId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set deletion date 7 days from now
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 7);

    user.deletionScheduled = deletionDate;
    await user.save();

    res.json({
      success: true,
      message: 'Account deletion scheduled',
      deletionDate: deletionDate.toISOString(),
      gracePeriodDays: 7
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to schedule account deletion' });
  }
});

/**
 * POST /api/compliance/cancel-deletion
 * Cancel scheduled account deletion
 */
router.post('/cancel-deletion', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ patientId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deletionScheduled = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Account deletion cancelled'
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
});

/**
 * GET /api/compliance/privacy-policy
 * Get privacy policy
 */
router.get('/privacy-policy', (req, res) => {
  res.json({
    version: '1.0',
    lastUpdated: '2025-12-01',
    content: `
# MyHealthID Privacy Policy (Pilot Version)

**Last Updated:** December 1, 2025

## IMPORTANT NOTICE
This is a pilot/test version of MyHealthID. Your data is:
- NOT HIPAA-compliant yet
- Stored on testnet blockchain (may be reset)
- Shared only with your explicit consent

## What We Collect
- Name, email, phone number
- Medical records you upload
- Access logs (who viewed your data)
- Device information for authentication

## How We Use It
- To provide health record storage
- To enable consent management
- To verify record authenticity
- To improve the platform

## Your Rights
- View all your data anytime
- Export data as JSON
- Delete your account (7-day grace period)
- Revoke consent instantly

## Data Security
- AES-256-GCM encryption for files
- Blockchain logging for audit trail
- Rate limiting and security headers
- Regular security audits

## Contact
pilot@myhealthid.com
    `.trim()
  });
});

/**
 * GET /api/compliance/terms
 * Get terms of service
 */
router.get('/terms', (req, res) => {
  res.json({
    version: '1.0',
    lastUpdated: '2025-12-01',
    content: `
# MyHealthID Terms of Service

**Last Updated:** December 1, 2025

## 1. Acceptance of Terms
By using MyHealthID, you agree to these terms.

## 2. Pilot Program
This is a pilot version. Features may change or be discontinued.

## 3. User Responsibilities
- Keep your credentials secure
- Provide accurate information
- Comply with applicable laws
- Use the service responsibly

## 4. Data Ownership
You own your medical data. We only store and process it on your behalf.

## 5. Consent Management
You control who accesses your records. Access requires your approval.

## 6. Limitations
- Service provided "as-is"
- No warranty of uptime
- Not for emergency medical situations

## 7. Termination
You may delete your account anytime with a 7-day grace period.

## 8. Contact
For questions: pilot@myhealthid.com
    `.trim()
  });
});

export default router;
