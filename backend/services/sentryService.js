// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Comprehensive Sentry Integration
// Full-featured error tracking, performance monitoring, and profiling
// ═══════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import os from 'os';

// Track if Sentry is initialized
let isInitialized = false;

/**
 * Initialize Sentry with all available features
 * @param {Express} app - Express application instance
 */
export const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn || dsn === 'your-sentry-dsn-here') {
    console.log('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn,
      
      // ═══════════════════════════════════════════════════════════════════
      // ENVIRONMENT & RELEASE TRACKING
      // ═══════════════════════════════════════════════════════════════════
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || `myhealthid-backend@${process.env.npm_package_version || '1.0.0'}`,
      
      // Server name for identification
      serverName: process.env.SERVER_NAME || os.hostname(),
      
      // ═══════════════════════════════════════════════════════════════════
      // PERFORMANCE MONITORING
      // ═══════════════════════════════════════════════════════════════════
      // Capture 100% in dev, 20% in production for performance
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      
      // Sample rate for profiling (relative to tracesSampleRate)
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      
      // ═══════════════════════════════════════════════════════════════════
      // INTEGRATIONS
      // ═══════════════════════════════════════════════════════════════════
      integrations: [
        // Performance profiling
        nodeProfilingIntegration(),
      ],
      
      // ═══════════════════════════════════════════════════════════════════
      // DATA SCRUBBING & PRIVACY
      // ═══════════════════════════════════════════════════════════════════
      // Send PII but scrub sensitive fields
      sendDefaultPii: true,
      
      // Maximum breadcrumbs to keep
      maxBreadcrumbs: 100,
      
      // Attach stack traces to messages
      attachStacktrace: true,
      
      // Before send hook - filter sensitive data
      beforeSend(event, hint) {
        // Filter out health check noise
        if (event.request?.url?.includes('/health')) {
          return null;
        }
        
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-auth-token'];
        }
        
        // Remove sensitive body data
        if (event.request?.data) {
          let data = event.request.data;
          try {
            data = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (e) {
            // Keep as string if not valid JSON
          }
          
          if (typeof data === 'object' && data !== null) {
            const sensitiveFields = [
              'password', 'passwordHash', 'newPassword', 'currentPassword',
              'privateKey', 'mnemonic', 'seedPhrase', 'secret',
              'token', 'refreshToken', 'accessToken',
              'otp', 'code', 'verificationCode',
              'ssn', 'socialSecurityNumber',
              'creditCard', 'cardNumber', 'cvv',
            ];
            
            sensitiveFields.forEach(field => {
              if (data[field]) {
                data[field] = '[REDACTED]';
              }
            });
            
            event.request.data = data;
          }
        }
        
        // Remove sensitive extras
        if (event.extra) {
          delete event.extra.password;
          delete event.extra.privateKey;
          delete event.extra.mnemonic;
        }
        
        return event;
      },
      
      // Before breadcrumb hook - filter sensitive data
      beforeBreadcrumb(breadcrumb, hint) {
        // Don't log sensitive HTTP requests
        if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
          if (breadcrumb.data.url.includes('auth') || 
              breadcrumb.data.url.includes('login') ||
              breadcrumb.data.url.includes('password')) {
            if (breadcrumb.data.body) {
              breadcrumb.data.body = '[REDACTED]';
            }
          }
        }
        return breadcrumb;
      },
      
      // ═══════════════════════════════════════════════════════════════════
      // ERROR FILTERING
      // ═══════════════════════════════════════════════════════════════════
      ignoreErrors: [
        // Network errors that are expected
        'NetworkError',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ECONNRESET',
        'EPIPE',
        'socket hang up',
        'Request aborted',
        
        // Common client errors we don't need to track
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        
        // JWT expiration is expected behavior
        'jwt expired',
        'TokenExpiredError',
        
        // Rate limiting
        'Too Many Requests',
      ],
    });

    // Set global tags
    Sentry.setTags({
      'app.name': 'myhealthid-backend',
      'app.component': 'api-server',
      'blockchain.network': 'sepolia',
      'blockchain.chainId': '11155111',
    });

    isInitialized = true;
    console.log('✅ Sentry error tracking initialized');
    console.log(`   📊 Environment: ${process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV}`);
    console.log(`   🏷️  Release: ${process.env.SENTRY_RELEASE || 'myhealthid-backend@1.0.0'}`);
    
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error.message);
  }
};

/**
 * Check if Sentry is initialized
 */
export const isSentryInitialized = () => isInitialized;

/**
 * Sentry request handler - must be the first middleware
 */
export const sentryRequestHandler = () => {
  // Return no-op middleware if Sentry is not initialized
  if (!isInitialized || !Sentry.Handlers?.requestHandler) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler({
    user: ['id', 'email', 'role'],
    ip: true,
    request: ['method', 'url', 'query_string', 'data'],
  });
};

/**
 * Sentry tracing handler - for performance monitoring
 */
export const sentryTracingHandler = () => {
  // Return no-op middleware if Sentry is not initialized
  if (!isInitialized || !Sentry.Handlers?.tracingHandler) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
};

/**
 * Sentry error handler - must be after all routes
 */
export const sentryErrorHandler = () => {
  // Return no-op middleware if Sentry is not initialized
  if (!isInitialized || !Sentry.Handlers?.errorHandler) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      const status = error.status || error.statusCode || 500;
      return status >= 400;
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Capture an exception with context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export const captureException = (error, context = {}) => {
  if (!isInitialized) {
    console.error('Sentry not initialized:', error);
    return;
  }
  
  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    if (context.user) {
      scope.setUser({
        id: context.user.id || context.user.patientId,
        email: context.user.email,
        role: context.user.role,
      });
    }
    
    if (context.level) {
      scope.setLevel(context.level);
    }
    
    if (context.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Capture a message with context
 * @param {string} message - The message to capture
 * @param {string} level - 'fatal' | 'error' | 'warning' | 'info' | 'debug'
 * @param {Object} context - Additional context
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!isInitialized) {
    console.log(`[${level}]`, message);
    return;
  }
  
  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });
};

/**
 * Set user context for error reports
 * @param {Object} user - User information
 */
export const setUserContext = (user) => {
  if (!isInitialized) return;
  
  Sentry.setUser({
    id: user.userId || user.patientId || user.id,
    email: user.email,
    username: user.name,
    role: user.role,
    walletAddress: user.walletAddress,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (!isInitialized) return;
  Sentry.setUser(null);
};

/**
 * Add a breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (e.g., 'auth', 'blockchain', 'database')
 * @param {Object} data - Additional data
 * @param {string} level - 'fatal' | 'error' | 'warning' | 'info' | 'debug'
 */
export const addBreadcrumb = (message, category, data = {}, level = 'info') => {
  if (!isInitialized) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Set a tag on all future events
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const setTag = (key, value) => {
  if (!isInitialized) return;
  Sentry.setTag(key, value);
};

/**
 * Set extra context on all future events
 * @param {string} key - Extra key
 * @param {any} value - Extra value
 */
export const setExtra = (key, value) => {
  if (!isInitialized) return;
  Sentry.setExtra(key, value);
};

/**
 * Track blockchain operations
 * @param {string} action - Action name (e.g., 'registerDocument', 'grantAccess')
 * @param {Object} data - Transaction data
 */
export const trackBlockchainOperation = (action, data = {}) => {
  addBreadcrumb(
    `Blockchain: ${action}`,
    'blockchain',
    {
      action,
      txHash: data.txHash,
      blockNumber: data.blockNumber,
      gasUsed: data.gasUsed,
      ...data,
    },
    'info'
  );
};

/**
 * Track database operations
 * @param {string} operation - Operation (e.g., 'create', 'update', 'delete')
 * @param {string} collection - Collection name
 * @param {Object} data - Operation data
 */
export const trackDatabaseOperation = (operation, collection, data = {}) => {
  addBreadcrumb(
    `DB: ${operation} on ${collection}`,
    'database',
    {
      operation,
      collection,
      documentId: data.id || data._id,
      ...data,
    },
    'info'
  );
};

/**
 * Track authentication events
 * @param {string} event - Event type (e.g., 'login', 'logout', 'register')
 * @param {Object} data - Event data
 */
export const trackAuthEvent = (event, data = {}) => {
  addBreadcrumb(
    `Auth: ${event}`,
    'auth',
    {
      event,
      userId: data.userId,
      role: data.role,
      ...data,
    },
    'info'
  );
  
  if (['register', 'login_failed', 'account_locked'].includes(event)) {
    captureMessage(`Auth event: ${event}`, 'info', {
      tags: { authEvent: event },
      extra: data,
    });
  }
};

/**
 * Track HIPAA-relevant access events
 * @param {string} action - Access action
 * @param {Object} data - Access data
 */
export const trackAccessEvent = (action, data = {}) => {
  addBreadcrumb(
    `Access: ${action}`,
    'access',
    {
      action,
      patientId: data.patientId,
      recordId: data.recordId,
      accessedBy: data.accessedBy,
      ...data,
    },
    'info'
  );
};

/**
 * Flush pending events (call before process exit)
 */
export const flush = async (timeout = 2000) => {
  if (!isInitialized) return;
  await Sentry.flush(timeout);
};

/**
 * Close Sentry client
 */
export const close = async (timeout = 2000) => {
  if (!isInitialized) return;
  await Sentry.close(timeout);
};

// Export Sentry for advanced usage
export default Sentry;
