import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /audit/:patientId
 * Get audit logs for a patient
 */
router.get('/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, skip = 0, action } = req.query;

    // Authorization check
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build query
    const query = { patientId };
    if (action) {
      query.action = action;
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      total,
      logs
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs', details: error.message });
  }
});

/**
 * GET /audit/record/:recordId
 * Get audit logs for a specific record
 */
router.get('/record/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const logs = await AuditLog.find({ recordId })
      .sort({ timestamp: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: logs.length,
      logs
    });

  } catch (error) {
    console.error('Get record audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch record audit logs', details: error.message });
  }
});

/**
 * GET /audit/stats/:patientId
 * Get audit statistics for a patient
 */
router.get('/stats/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Authorization check
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get stats
    const totalAccesses = await AuditLog.countDocuments({ patientId });
    
    const actionStats = await AuditLog.aggregate([
      { $match: { patientId } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const roleStats = await AuditLog.aggregate([
      { $match: { patientId } },
      { $group: { _id: '$accessorRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentAccesses = await AuditLog.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('accessorName action timestamp');

    res.json({
      success: true,
      stats: {
        totalAccesses,
        byAction: actionStats,
        byRole: roleStats,
        recentAccesses
      }
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch audit stats', details: error.message });
  }
});

export default router;
