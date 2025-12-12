// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Logger Utility
// Centralized logging with environment awareness and Sentry integration
// ═══════════════════════════════════════════════════════════════════════════

// Lazy import Sentry to avoid circular dependencies
let sentryService = null;
const getSentry = () => {
  if (!sentryService) {
    try {
      sentryService = require('../services/sentryService').default;
    } catch (e) {
      sentryService = null;
    }
  }
  return sentryService;
};

const isDev = __DEV__;

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Set minimum log level (DEBUG in dev, WARN in prod)
const MIN_LEVEL = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

const formatMessage = (level, tag, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}] [${tag}]`;
  return { prefix, message, data };
};

const shouldLog = (level) => level >= MIN_LEVEL;

export const logger = {
  /**
   * Debug level logging (dev only)
   */
  debug: (tag, message, data = null) => {
    if (!shouldLog(LOG_LEVELS.DEBUG)) return;
    const { prefix } = formatMessage('DEBUG', tag, message, data);
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },

  /**
   * Info level logging
   */
  info: (tag, message, data = null) => {
    if (!shouldLog(LOG_LEVELS.INFO)) return;
    const { prefix } = formatMessage('INFO', tag, message, data);
    if (data) {
      console.info(`${prefix} ${message}`, data);
    } else {
      console.info(`${prefix} ${message}`);
    }
    
    // Add breadcrumb in production
    if (!isDev) {
      const sentry = getSentry();
      sentry?.addBreadcrumb(tag, message, data || {}, 'info');
    }
  },

  /**
   * Warning level logging
   */
  warn: (tag, message, data = null) => {
    if (!shouldLog(LOG_LEVELS.WARN)) return;
    const { prefix } = formatMessage('WARN', tag, message, data);
    if (data) {
      console.warn(`${prefix} ${message}`, data);
    } else {
      console.warn(`${prefix} ${message}`);
    }
    
    // Add breadcrumb in production
    if (!isDev) {
      const sentry = getSentry();
      sentry?.addBreadcrumb(tag, message, data || {}, 'warning');
    }
  },

  /**
   * Error level logging (always logs, reports to Sentry in prod)
   */
  error: (tag, message, error = null) => {
    const { prefix } = formatMessage('ERROR', tag, message, error);
    console.error(`${prefix} ${message}`, error || '');

    // In production, send to Sentry
    if (!isDev) {
      const sentry = getSentry();
      sentry?.captureError(error || new Error(message), {
        tag,
        message,
        level: 'error',
      });
    }
  },

  /**
   * API request/response logging (dev only)
   */
  api: (method, url, status, duration) => {
    if (!isDev) return;
    const statusColor = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢';
    console.log(`${statusColor} [API] ${method.toUpperCase()} ${url} → ${status} (${duration}ms)`);
  },

  /**
   * User action tracking
   */
  track: (action, properties = {}) => {
    if (isDev) {
      console.log(`📊 [TRACK] ${action}`, properties);
    }
    
    // Add breadcrumb for user actions in production
    if (!isDev) {
      const sentry = getSentry();
      sentry?.addBreadcrumb('user_action', action, properties, 'info');
    }
  },
};

export default logger;
