import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter for authentication endpoints - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Your account has been temporarily locked. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// OTP request limiter - 3 OTP requests per 5 minutes
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    error: 'Too many OTP requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by phone number instead of IP
    return req.body.phone || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests',
      message: 'You have requested too many OTPs. Please try again in 5 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// File upload limiter - 10 uploads per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You have exceeded the hourly upload limit. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Per-user rate limiter - 10 requests per minute (for production pilot)
export const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You are making requests too quickly. Please wait a moment.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});
