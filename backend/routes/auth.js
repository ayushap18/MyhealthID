import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { ethers } from 'ethers';
import { validateRequest, phoneVerifySchema, otpVerifySchema, registerSchema, loginSchema } from '../middleware/validation.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { sendOTP, verifyOTP, isTwilioConfigured } from '../services/otpService.js';
import { trackAuthEvent, setUserContext, captureException, addBreadcrumb } from '../services/sentryService.js';

const router = express.Router();

// Generate JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.patientId,
      walletAddress: user.walletAddress,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days for pilot
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.patientId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * POST /auth/send-otp
 * Send OTP to phone number for verification
 */
router.post('/send-otp', otpLimiter, validateRequest(phoneVerifySchema), async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if phone is already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Phone number already registered',
        message: 'This phone number is already associated with an account'
      });
    }

    // Send OTP
    const result = await sendOTP(phone);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
        // Include testOTP in development/test mode
        ...(result.testOTP && { testOTP: result.testOTP })
      });
    } else {
      res.status(500).json({
        error: 'Failed to send OTP',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP', 
      message: error.message 
    });
  }
});

/**
 * POST /auth/verify-otp
 * Verify OTP code
 */
router.post('/verify-otp', authLimiter, validateRequest(otpVerifySchema), async (req, res) => {
  try {
    const { phone, code } = req.body;

    // Verify OTP
    const result = await verifyOTP(phone, code);

    if (result.success) {
      // Generate temporary token for registration completion
      const tempToken = jwt.sign(
        { phone, verified: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes to complete registration
      );

      res.json({
        success: true,
        message: result.message,
        tempToken
      });
    } else {
      res.status(400).json({
        error: 'OTP verification failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to verify OTP', 
      message: error.message 
    });
  }
});

/**
 * POST /auth/register
 * Register new user with wallet creation (updated with phone support)
 */
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('role').isIn(['patient', 'hospital', 'insurer', 'doctor']).withMessage('Invalid role'),
  body('phone').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone must be in E.164 format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        ...(phone ? [{ phone }] : [])
      ]
    });
    
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      return res.status(400).json({ 
        error: 'User already exists',
        field 
      });
    }

    // Create new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Hash password
    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 rounds
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate patient/staff ID
    const rolePrefix = role === 'patient' ? 'P' : 
                       role === 'hospital' ? 'STAFF' : 
                       role === 'doctor' ? 'DOC' : 'AGENT';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${rolePrefix}${Date.now().toString().slice(-4)}${randomNum}`;

    // Create user
    const user = new User({
      patientId: userId,
      walletAddress: wallet.address,
      role,
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      passwordHash,
      publicKey: wallet.publicKey,
      phoneVerified: !!phone // Mark as verified if phone provided
    });

    await user.save();

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Track registration in Sentry
    trackAuthEvent('register', {
      userId: user.patientId,
      role: user.role,
      email: user.email,
    });
    setUserContext(user);
    addBreadcrumb('User registered successfully', 'auth', { userId: user.patientId, role: user.role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        patientId: user.patientId,
        walletAddress: wallet.address,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      wallet: {
        address: wallet.address,
        mnemonic: wallet.mnemonic.phrase,
        privateKey: wallet.privateKey // ⚠️ Send only once, user must save it!
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    captureException(error, { tags: { action: 'register' }, extra: { email: req.body?.email } });
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

/**
 * POST /auth/login
 * Login with email and password (updated with refresh token)
 */
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Track login in Sentry
    trackAuthEvent('login', {
      userId: user.patientId,
      role: user.role,
      email: user.email,
    });
    setUserContext(user);
    addBreadcrumb('User logged in', 'auth', { userId: user.patientId, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        patientId: user.patientId,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    captureException(error, { tags: { action: 'login' }, extra: { email: req.body?.email } });
    trackAuthEvent('login_failed', { email: req.body?.email, error: error.message });
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Get user
    const user = await User.findOne({ patientId: decoded.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new tokens
    const newToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * GET /auth/me
 * Get current user info (requires auth)
 */
router.get('/me', async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findOne({ patientId: decoded.userId }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        patientId: user.patientId,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
