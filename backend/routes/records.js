import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import Record from '../models/Record.js';
import AuditLog from '../models/AuditLog.js';
import blockchainService from '../services/blockchainService.js';
import ipfsService from '../services/ipfsService.js';
import { authenticateToken } from '../middleware/auth.js';
import { io } from '../server.js';
import { encryptFile, hashData } from '../services/encryptionService.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { validateFileUpload } from '../middleware/validation.js';
import { trackAccessEvent, trackBlockchainOperation, captureException, addBreadcrumb } from '../services/sentryService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

/**
 * POST /records/upload
 * Upload medical record with IPFS and blockchain integration
 * Now with real AES-256-GCM encryption
 */
router.post('/upload', authenticateToken, uploadLimiter, upload.single('file'), validateFileUpload, [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('type').notEmpty().withMessage('Record type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('hospitalName').notEmpty().withMessage('Hospital name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, type, title, hospitalName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Generate record ID
    const recordId = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    console.log(`📤 Processing upload for record ${recordId}...`);

    // Step 1: Encrypt file with AES-256-GCM
    console.log('🔐 Encrypting file...');
    const encryptionResult = encryptFile(file.buffer);
    const { encryptedData, iv, tag, originalSize } = encryptionResult;
    
    // Step 2: Generate content hash for integrity verification
    const contentHash = hashData(file.buffer);
    const encryptionHash = hashData(encryptedData);
    
    // Step 3: Upload encrypted data to IPFS
    console.log('📦 Uploading encrypted file to IPFS...');
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const ipfsCID = await ipfsService.uploadFile(encryptedBuffer, file.originalname);

    // Step 4: Register on blockchain
    console.log('⛓️  Registering on blockchain...');
    const blockchainResult = await blockchainService.registerDocument(
      recordId,
      patientId,
      ipfsCID,
      contentHash // Use original content hash for blockchain
    );

    // Step 5: Save to database with encryption metadata
    const record = new Record({
      recordId,
      patientId,
      type,
      title,
      hospitalId: req.user.userId,
      hospitalName,
      uploadedBy: req.user.userId,
      ipfsCID,
      encryptionHash, // Hash of encrypted data
      fileSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
      blockchainTxHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
      status: 'verified',
      verifiedAt: new Date(),
      metadata: {
        mimeType: file.mimetype,
        originalName: file.originalname,
        encryptionAlgorithm: 'AES-256-GCM',
        encryptionIV: iv, // Store IV for decryption
        encryptionTag: tag, // Store auth tag for decryption
        contentHash, // Original file hash for verification
        encryptedSize: `${(encryptedBuffer.length / 1024 / 1024).toFixed(2)} MB`
      }
    });

    await record.save();

    // Step 6: Create audit log
    const auditLog = new AuditLog({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId,
      recordId,
      accessedBy: req.user.userId,
      accessorName: hospitalName,
      accessorRole: 'hospital',
      action: 'upload',
      blockchainTxHash: blockchainResult.txHash,
      verified: true,
      metadata: {
        fileSize: record.fileSize,
        ipfsCID
      }
    });

    await auditLog.save();

    // Emit real-time notification to patient
    if (io) {
      io.to(patientId).emit('newRecord', {
        recordId: record.recordId,
        title: record.title,
        hospitalName: record.hospitalName,
        uploadDate: record.uploadDate
      });
    }

    console.log(`✅ Record ${recordId} uploaded successfully`);

    // Track in Sentry
    trackAccessEvent('upload', {
      recordId,
      patientId,
      uploadedBy: req.user.userId,
      hospitalName,
      fileSize: record.fileSize,
    });
    trackBlockchainOperation('registerDocument', {
      recordId,
      txHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
      ipfsCID,
    });
    addBreadcrumb('Record uploaded to blockchain', 'records', { recordId, patientId });

    res.status(201).json({
      success: true,
      message: 'Record uploaded successfully',
      record: {
        recordId: record.recordId,
        patientId: record.patientId,
        type: record.type,
        title: record.title,
        hospitalName: record.hospitalName,
        ipfsCID: record.ipfsCID,
        encryptionHash: record.encryptionHash,
        fileSize: record.fileSize,
        blockchainTxHash: record.blockchainTxHash,
        blockNumber: record.blockNumber,
        status: record.status,
        uploadDate: record.uploadDate
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    captureException(error, {
      tags: { action: 'upload', type: 'record' },
      extra: { patientId: req.body?.patientId, hospitalName: req.body?.hospitalName },
    });
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

/**
 * GET /records/:patientId
 * Fetch all records for a patient
 */
router.get('/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Authorization check
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const records = await Record.find({ patientId })
      .sort({ uploadDate: -1 })
      .select('-__v');

    // Log access
    if (req.user.userId !== patientId) {
      const auditLog = new AuditLog({
        logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
        patientId,
        accessedBy: req.user.userId,
        accessorName: req.user.name || req.user.userId,
        accessorRole: req.user.role,
        action: 'view',
        metadata: {
          recordCount: records.length
        }
      });

      await auditLog.save();
    }

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ error: 'Failed to fetch records', details: error.message });
  }
});

/**
 * GET /records/detail/:recordId
 * Get detailed record information
 */
router.get('/detail/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await Record.findOne({ recordId });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Authorization check
    if (req.user.role === 'patient' && req.user.userId !== record.patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get blockchain verification
    let blockchainData = null;
    try {
      blockchainData = await blockchainService.getRecord(recordId);
    } catch (error) {
      console.warn('Could not fetch blockchain data:', error.message);
    }

    // Log access
    if (req.user.userId !== record.patientId) {
      const auditLog = new AuditLog({
        logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
        patientId: record.patientId,
        recordId,
        accessedBy: req.user.userId,
        accessorName: req.user.name || req.user.userId,
        accessorRole: req.user.role,
        action: 'view'
      });

      await auditLog.save();
    }

    res.json({
      success: true,
      record,
      blockchainData
    });

  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ error: 'Failed to get record', details: error.message });
  }
});

/**
 * POST /records/verify/:recordId
 * Verify record hash against blockchain
 */
router.post('/verify/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await Record.findOne({ recordId });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Get data from blockchain
    const blockchainData = await blockchainService.getRecord(recordId);

    // Verify CID matches
    const cidMatches = blockchainData.ipfsCID === record.ipfsCID;

    // Log verification
    const auditLog = new AuditLog({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId: record.patientId,
      recordId,
      accessedBy: req.user.userId,
      accessorName: req.user.name || req.user.userId,
      accessorRole: req.user.role,
      action: 'verify',
      verified: cidMatches
    });

    await auditLog.save();

    res.json({
      success: true,
      verified: cidMatches,
      record: {
        ipfsCID: record.ipfsCID,
        encryptionHash: record.encryptionHash
      },
      blockchain: blockchainData
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

/**
 * GET /records/download/:recordId
 * Download and decrypt medical record file
 */
router.get('/download/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    // Get record from database
    const record = await Record.findOne({ recordId });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check access permission
    const isPatient = req.user.userId === record.patientId;
    const isUploader = req.user.userId === record.uploadedBy;
    
    if (!isPatient && !isUploader) {
      // Check if requester has consent
      const Consent = (await import('../models/Consent.js')).default;
      const consent = await Consent.findOne({
        patientId: record.patientId,
        requesterId: req.user.userId,
        status: 'approved'
      });

      if (!consent) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to download this record'
        });
      }
    }

    // Get encryption metadata
    const { encryptionIV, encryptionTag, encryptionAlgorithm } = record.metadata;
    
    if (!encryptionIV || !encryptionTag) {
      return res.status(500).json({ 
        error: 'Decryption not possible',
        message: 'Encryption metadata not found'
      });
    }

    console.log(`📥 Downloading encrypted file from IPFS: ${record.ipfsCID}`);
    
    // Download encrypted file from IPFS
    const encryptedData = await ipfsService.downloadFile(record.ipfsCID);
    
    console.log('🔓 Decrypting file...');
    
    // Import decryptFile dynamically to avoid circular dependencies
    const { decryptFile } = await import('../services/encryptionService.js');
    
    // Decrypt file
    const decryptedBuffer = decryptFile(
      encryptedData.toString('base64'),
      encryptionIV,
      encryptionTag
    );

    // Verify content integrity
    const { hashData } = await import('../services/encryptionService.js');
    const contentHash = hashData(decryptedBuffer);
    
    if (contentHash !== record.metadata.contentHash) {
      console.error('⚠️ Content hash mismatch - file may be corrupted');
      return res.status(500).json({
        error: 'File integrity check failed',
        message: 'The downloaded file does not match the original. It may have been tampered with.'
      });
    }

    // Log download
    const AuditLogModel = (await import('../models/AuditLog.js')).default;
    const auditLog = new AuditLogModel({
      logId: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      patientId: record.patientId,
      recordId,
      accessedBy: req.user.userId,
      accessorName: req.user.name || req.user.userId,
      accessorRole: req.user.role,
      action: 'download',
      metadata: {
        fileSize: record.fileSize,
        ipfsCID: record.ipfsCID
      }
    });
    await auditLog.save();

    // Emit real-time notification
    if (io) {
      io.to(record.patientId).emit('recordAccessed', {
        recordId: record.recordId,
        accessedBy: req.user.name || req.user.userId,
        action: 'download',
        timestamp: new Date()
      });
    }

    console.log(`✅ File decrypted and downloaded successfully`);

    // Set response headers
    res.setHeader('Content-Type', record.metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${record.metadata.originalName}"`);
    res.setHeader('Content-Length', decryptedBuffer.length);

    // Send decrypted file
    res.send(decryptedBuffer);

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ 
      error: 'Download failed', 
      details: error.message 
    });
  }
});

export default router;
