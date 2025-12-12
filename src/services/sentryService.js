// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Sentry Helper Service
// Utility functions for Sentry error tracking (initialized via Sentry Wizard)
// ═══════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/react-native';

/**
 * Set user context for error tracking
 */
export const setUser = (user) => {
  if (__DEV__) return;
  
  Sentry.setUser({
    id: user?.id || user?.patientId || user?.hospitalId || 'anonymous',
    email: user?.email || undefined,
    role: user?.role || 'unknown',
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (__DEV__) return;
  Sentry.setUser(null);
};

/**
 * Capture an error with optional context
 */
export const captureError = (error, context = {}) => {
  if (__DEV__) return;
  
  Sentry.withScope((scope) => {
    // Add extra context
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    
    // Set error level
    scope.setLevel(context.level || 'error');
    
    // Capture
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), 'error');
    }
  });
};

/**
 * Add a breadcrumb for debugging
 */
export const addBreadcrumb = (category, message, data = {}, level = 'info') => {
  if (__DEV__) return;
  
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Show the feedback widget
 */
export const showFeedback = () => {
  Sentry.showFeedbackWidget();
};

/**
 * Log a message using Sentry logger
 */
export const log = {
  debug: (message, data) => Sentry.logger?.debug(message, data),
  info: (message, data) => Sentry.logger?.info(message, data),
  warn: (message, data) => Sentry.logger?.warn(message, data),
  error: (message, data) => Sentry.logger?.error(message, data),
};

export default {
  setUser,
  clearUser,
  captureError,
  addBreadcrumb,
  showFeedback,
  log,
  // Re-export Sentry for advanced usage
  Sentry,
};
