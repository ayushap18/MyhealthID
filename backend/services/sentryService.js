import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry error tracking
 */
export const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn || dsn === 'your-sentry-dsn-here') {
    // Silently skip Sentry initialization if not configured
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],
    
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    
    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Remove sensitive body data
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object') {
          delete data.password;
          delete data.passwordHash;
          delete data.privateKey;
          delete data.mnemonic;
        }
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'NetworkError',
      'timeout',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ],
  });

  console.log('✅ Sentry error tracking initialized');
};

/**
 * Sentry request handler - must be the first middleware
 */
export const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

/**
 * Sentry tracing handler
 */
export const sentryTracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

/**
 * Sentry error handler - must be after all routes
 */
export const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status >= 500
      return error.status >= 500;
    },
  });
};

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    tags: context.tags,
    extra: context.extra,
    user: context.user,
  });
};

/**
 * Capture message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags,
    extra: context.extra,
  });
};

/**
 * Add user context to error reports
 */
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.userId || user.patientId,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
  });
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category, data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start a transaction for performance monitoring
 */
export const startTransaction = (name, op) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

export default Sentry;
