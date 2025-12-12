import express from 'express';
import { body, validationResult } from 'express-validator';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import blockchainService from '../services/blockchainService.js';
import { authenticateToken } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

/**
 * POST /consent/request
 * Create new consent request
 */
router.post('/request', authenticateToken, [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('purpose').notEmpty().withMessage('Purpose is required'),
  body('durationDays').isInt({ min: 1, max: 365 }).withMessage('Duration must be 1-365 days')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, purpose, durationDays, recordIds } = req.body;

    // Get requester info
    const requester = await User.findOne({ patientId: req.user.userId });
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));

    // Generate consent ID
    const consentId = `CONSENT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create consent request
    const consent = new Consent({
      consentId,
      patientId,
      requesterId: req.user.userId,
      requesterName: requester.name,
      requesterRole: req.user.role,
      recordIds: recordIds || [],
      purpose,
      expiresAt,
      status: 'pending'
    });

    await consent.save();

    // Create audit log
    const auditLog = new AuditLog({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId,
      accessedBy: req.user.userId,
      accessorName: requester.name,
      accessorRole: req.user.role,
      action: 'consent_requested',
      metadata: {
        consentId,
        purpose,
        durationDays
      }
    });

    await auditLog.save();

    // Emit real-time notification to patient
    if (io) {
      io.to(patientId).emit('consentRequest', {
        consentId: consent.consentId,
        requesterName: consent.requesterName,
        purpose: consent.purpose,
        requestedAt: consent.requestedAt
      });
    }

    console.log(`📨 Consent request ${consentId} created for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Consent request created',
      consent: {
        consentId: consent.consentId,
        patientId: consent.patientId,
        requesterName: consent.requesterName,
        purpose: consent.purpose,
        status: consent.status,
        requestedAt: consent.requestedAt,
        expiresAt: consent.expiresAt
      }
    });

  } catch (error) {
    console.error('Consent request error:', error);
    res.status(500).json({ error: 'Failed to create consent request', details: error.message });
  }
});

/**
 * POST /consent/approve
 * Approve consent request (mints on-chain access token)
 */
router.post('/approve', authenticateToken, [
  body('consentId').notEmpty().withMessage('Consent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { consentId } = req.body;

    // Find consent
    const consent = await Consent.findOne({ consentId });
    if (!consent) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    // Authorization check
    if (consent.patientId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the patient can approve consent' });
    }

    if (consent.status !== 'pending') {
      return res.status(400).json({ error: 'Consent already processed' });
    }

    // Get requester wallet address
    const requester = await User.findOne({ patientId: consent.requesterId });
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    console.log(`✅ Approving consent ${consentId}...`);

    // Grant access on blockchain
    console.log('⛓️  Minting access token on blockchain...');
    const blockchainResult = await blockchainService.grantAccess(
      consent.patientId,
      requester.walletAddress,
      consent.expiresAt
    );

    // Update consent
    consent.status = 'approved';
    consent.respondedAt = new Date();
    consent.blockchainTxHash = blockchainResult.txHash;
    consent.accessTokenId = blockchainResult.tokenId;

    await consent.save();

    // Create audit log
    const auditLog = new AuditLog({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId: consent.patientId,
      accessedBy: req.user.userId,
      accessorName: req.user.name || req.user.userId,
      accessorRole: 'patient',
      action: 'consent_granted',
      blockchainTxHash: blockchainResult.txHash,
      verified: true,
      metadata: {
        consentId,
        requesterId: consent.requesterId,
        accessTokenId: blockchainResult.tokenId
      }
    });

    await auditLog.save();

    // Emit notification to requester
    if (io) {
      io.to(consent.requesterId).emit('consentApproved', {
        consentId: consent.consentId,
        patientId: consent.patientId,
        accessTokenId: blockchainResult.tokenId
      });
    }

    console.log(`✅ Consent ${consentId} approved with token ID ${blockchainResult.tokenId}`);

    res.json({
      success: true,
      message: 'Consent approved successfully',
      consent: {
        consentId: consent.consentId,
        status: consent.status,
        blockchainTxHash: consent.blockchainTxHash,
        accessTokenId: consent.accessTokenId,
        approvedAt: consent.respondedAt
      }
    });

  } catch (error) {
    console.error('Consent approval error:', error);
    res.status(500).json({ error: 'Failed to approve consent', details: error.message });
  }
});

/**
 * POST /consent/reject
 * Reject consent request
 */
router.post('/reject', authenticateToken, [
  body('consentId').notEmpty().withMessage('Consent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { consentId } = req.body;

    const consent = await Consent.findOne({ consentId });
    if (!consent) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    if (consent.patientId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the patient can reject consent' });
    }

    if (consent.status !== 'pending') {
      return res.status(400).json({ error: 'Consent already processed' });
    }

    consent.status = 'rejected';
    consent.respondedAt = new Date();
    await consent.save();

    // Create audit log
    const auditLog = new AuditLog({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId: consent.patientId,
      accessedBy: req.user.userId,
      accessorName: req.user.name || req.user.userId,
      accessorRole: 'patient',
      action: 'consent_rejected',
      metadata: { consentId, requesterId: consent.requesterId }
    });

    await auditLog.save();

    // Emit notification to requester
    if (io) {
      io.to(consent.requesterId).emit('consentRejected', {
        consentId: consent.consentId,
        patientId: consent.patientId
      });
    }

    res.json({
      success: true,
      message: 'Consent rejected',
      consent: {
        consentId: consent.consentId,
        status: consent.status,
        rejectedAt: consent.respondedAt
      }
    });

  } catch (error) {
    console.error('Consent rejection error:', error);
    res.status(500).json({ error: 'Failed to reject consent', details: error.message });
  }
});

/**
 * GET /consent/:patientId
 * Get all consent requests for a patient
 */
router.get('/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Authorization
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const consents = await Consent.find({ patientId })
      .sort({ requestedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: consents.length,
      consents
    });

  } catch (error) {
    console.error('Get consents error:', error);
    res.status(500).json({ error: 'Failed to fetch consents', details: error.message });
  }
});

/**
 * GET /consent/pending/:patientId
 * Get pending consent requests
 */
router.get('/pending/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const consents = await Consent.find({ 
      patientId, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: consents.length,
      consents
    });

  } catch (error) {
    console.error('Get pending consents error:', error);
    res.status(500).json({ error: 'Failed to fetch pending consents', details: error.message });
  }
});

export default router;
