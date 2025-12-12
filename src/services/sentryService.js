// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Comprehensive Sentry Integration (React Native)
// Full-featured error tracking, performance monitoring, session replay
// ═══════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/react-native';

// Track if Sentry is initialized (check __DEV__ for dev mode)
const isEnabled = !__DEV__;

// ═══════════════════════════════════════════════════════════════════════════
// USER CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set user context for error tracking
 * @param {Object} user - User object with id, email, role
 */
export const setUser = (user) => {
  if (!user) return;
  
  Sentry.setUser({
    id: user.id || user.patientId || user.hospitalId || user.insurerId,
    email: user.email,
    username: user.name,
    role: user.role,
    walletAddress: user.walletAddress,
  });
  
  // Also set as tag for filtering
  Sentry.setTag('user.role', user.role);
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  Sentry.setUser(null);
  Sentry.setTag('user.role', undefined);
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CAPTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Capture an error with optional context
 * @param {Error|string} error - The error to capture
 * @param {Object} context - Additional context
 */
export const captureError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add tags
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    // Add extra context
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Set screen/component context
    if (context.screen) {
      scope.setTag('screen', context.screen);
    }
    
    // Set error level
    scope.setLevel(context.level || 'error');
    
    // Set fingerprint for grouping
    if (context.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }
    
    // Capture
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), 'error');
    }
  });
};

/**
 * Capture a warning (less severe than error)
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
export const captureWarning = (message, context = {}) => {
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
    scope.setLevel('warning');
    Sentry.captureMessage(message, 'warning');
  });
};

/**
 * Capture an info message
 * @param {string} message - Info message
 * @param {Object} context - Additional context
 */
export const captureInfo = (message, context = {}) => {
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
    scope.setLevel('info');
    Sentry.captureMessage(message, 'info');
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a breadcrumb for debugging
 * @param {string} category - Category (navigation, ui, api, auth, blockchain)
 * @param {string} message - Breadcrumb message
 * @param {Object} data - Additional data
 * @param {string} level - 'info' | 'warning' | 'error' | 'debug'
 */
export const addBreadcrumb = (category, message, data = {}, level = 'info') => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track navigation between screens
 * @param {string} from - Previous screen
 * @param {string} to - New screen
 */
export const trackNavigation = (from, to) => {
  addBreadcrumb('navigation', `Navigate: ${from || 'start'} → ${to}`, { from, to });
  Sentry.setTag('screen', to);
};

/**
 * Track user interaction
 * @param {string} element - UI element interacted with
 * @param {string} action - Action taken (press, swipe, etc.)
 * @param {Object} data - Additional data
 */
export const trackUserAction = (element, action, data = {}) => {
  addBreadcrumb('ui', `${action}: ${element}`, { element, action, ...data });
};

/**
 * Track API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {Object} data - Additional data
 */
export const trackApiRequest = (method, url, statusCode, data = {}) => {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warning' : 'info';
  addBreadcrumb('api', `${method} ${url} → ${statusCode}`, { method, url, statusCode, ...data }, level);
};

/**
 * Track blockchain interaction
 * @param {string} action - Blockchain action
 * @param {Object} data - Transaction data
 */
export const trackBlockchain = (action, data = {}) => {
  addBreadcrumb('blockchain', `Blockchain: ${action}`, {
    action,
    txHash: data.txHash,
    blockNumber: data.blockNumber,
    ...data,
  });
};

/**
 * Track authentication event
 * @param {string} event - Auth event (login, logout, register, etc.)
 * @param {Object} data - Event data
 */
export const trackAuth = (event, data = {}) => {
  addBreadcrumb('auth', `Auth: ${event}`, { event, ...data });
  
  // Track important auth events as messages
  if (['login_success', 'register_success', 'logout'].includes(event)) {
    captureInfo(`Auth: ${event}`, {
      tags: { authEvent: event },
      extra: { userId: data.userId, role: data.role },
    });
  }
};

/**
 * Track record access (HIPAA audit)
 * @param {string} action - Access action (view, download, share)
 * @param {Object} data - Access data
 */
export const trackRecordAccess = (action, data = {}) => {
  addBreadcrumb('access', `Record: ${action}`, {
    action,
    recordId: data.recordId,
    patientId: data.patientId,
    ...data,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// TAGS & CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set a tag on all future events
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const setTag = (key, value) => {
  Sentry.setTag(key, value);
};

/**
 * Set multiple tags at once
 * @param {Object} tags - Object of key-value pairs
 */
export const setTags = (tags) => {
  Sentry.setTags(tags);
};

/**
 * Set extra context data
 * @param {string} key - Extra key
 * @param {any} value - Extra value
 */
export const setExtra = (key, value) => {
  Sentry.setExtra(key, value);
};

/**
 * Set the current screen/context
 * @param {string} screen - Screen name
 */
export const setScreen = (screen) => {
  Sentry.setTag('screen', screen);
  addBreadcrumb('navigation', `Viewing: ${screen}`, { screen });
};

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Measure an async operation's performance
 * @param {string} name - Operation name
 * @param {string} operation - Operation type (e.g., 'api.request', 'blockchain.tx')
 * @param {Function} callback - Async function to measure
 * @returns {Promise} Result of the callback
 */
export const measurePerformance = async (name, operation, callback) => {
  const startTime = Date.now();
  
  try {
    const result = await callback();
    const duration = Date.now() - startTime;
    
    addBreadcrumb('performance', `${name} completed in ${duration}ms`, {
      operation,
      duration,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    addBreadcrumb('performance', `${name} failed after ${duration}ms`, {
      operation,
      duration,
      success: false,
      error: error.message,
    }, 'error');
    
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK & SESSION REPLAY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Show the feedback widget for user reports
 */
export const showFeedback = () => {
  try {
    Sentry.showFeedbackWidget();
  } catch (error) {
    console.warn('Feedback widget not available:', error.message);
  }
};

/**
 * Capture user feedback programmatically
 * @param {Object} feedback - Feedback object
 */
export const captureFeedback = (feedback) => {
  Sentry.captureFeedback({
    name: feedback.name,
    email: feedback.email,
    message: feedback.message,
    associatedEventId: feedback.eventId,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// SENTRY LOGGER (for structured logging)
// ═══════════════════════════════════════════════════════════════════════════

export const log = {
  debug: (message, data = {}) => {
    if (__DEV__) console.debug(message, data);
    Sentry.logger?.debug(message, data);
  },
  info: (message, data = {}) => {
    if (__DEV__) console.info(message, data);
    Sentry.logger?.info(message, data);
  },
  warn: (message, data = {}) => {
    if (__DEV__) console.warn(message, data);
    Sentry.logger?.warn(message, data);
  },
  error: (message, data = {}) => {
    if (__DEV__) console.error(message, data);
    Sentry.logger?.error(message, data);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrap a component with Sentry error boundary
 * @param {Component} component - React component
 * @returns {Component} Wrapped component
 */
export const withErrorBoundary = (component, fallback) => {
  return Sentry.withErrorBoundary(component, { fallback });
};

/**
 * Create a wrapped navigation container that tracks screen changes
 * @param {Object} navigation - Navigation ref
 */
export const trackNavigationChanges = (navigation) => {
  const routeNameRef = { current: undefined };
  
  return {
    onReady: () => {
      routeNameRef.current = navigation.current?.getCurrentRoute()?.name;
    },
    onStateChange: () => {
      const previousRouteName = routeNameRef.current;
      const currentRouteName = navigation.current?.getCurrentRoute()?.name;
      
      if (previousRouteName !== currentRouteName) {
        trackNavigation(previousRouteName, currentRouteName);
      }
      
      routeNameRef.current = currentRouteName;
    },
  };
};

/**
 * Flush pending events
 */
export const flush = async (timeout = 2000) => {
  await Sentry.flush(timeout);
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // User context
  setUser,
  clearUser,
  
  // Error capture
  captureError,
  captureWarning,
  captureInfo,
  
  // Breadcrumbs
  addBreadcrumb,
  trackNavigation,
  trackUserAction,
  trackApiRequest,
  trackBlockchain,
  trackAuth,
  trackRecordAccess,
  
  // Tags & context
  setTag,
  setTags,
  setExtra,
  setScreen,
  
  // Performance
  measurePerformance,
  
  // Feedback
  showFeedback,
  captureFeedback,
  
  // Logger
  log,
  
  // Utilities
  withErrorBoundary,
  trackNavigationChanges,
  flush,
  
  // Re-export Sentry for advanced usage
  Sentry,
};
