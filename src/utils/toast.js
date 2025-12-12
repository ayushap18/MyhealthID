// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Toast / Notification Helper
// Centralized toast notifications with consistent styling
// ═══════════════════════════════════════════════════════════════════════════

import { Alert, Platform, ToastAndroid } from 'react-native';

const TOAST_DURATION = {
  SHORT: 2000,
  LONG: 4000,
};

/**
 * Show a toast message (Android) or alert (iOS)
 */
const showToast = (message, duration = 'SHORT') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      message,
      duration === 'LONG' ? ToastAndroid.LONG : ToastAndroid.SHORT
    );
  } else {
    // iOS doesn't have native toast, use a subtle alert
    // In a production app, you'd use a custom toast component
    Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
  }
};

/**
 * Toast notification types
 */
export const toast = {
  /**
   * Success toast
   */
  success: (message) => {
    showToast(`✓ ${message}`);
  },

  /**
   * Error toast
   */
  error: (message) => {
    showToast(`✕ ${message}`, 'LONG');
  },

  /**
   * Warning toast
   */
  warning: (message) => {
    showToast(`⚠ ${message}`);
  },

  /**
   * Info toast
   */
  info: (message) => {
    showToast(message);
  },

  /**
   * Network error toast
   */
  networkError: () => {
    showToast('✕ Network error. Please check your connection.', 'LONG');
  },

  /**
   * Session expired toast
   */
  sessionExpired: () => {
    showToast('⚠ Session expired. Please login again.', 'LONG');
  },
};

/**
 * Confirmation dialog
 */
export const confirm = (title, message, onConfirm, onCancel = () => {}) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm },
    ],
    { cancelable: true }
  );
};

/**
 * Info alert
 */
export const alert = {
  info: (title, message, onDismiss = () => {}) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: onDismiss }]);
  },

  success: (title, message, onDismiss = () => {}) => {
    Alert.alert(`✓ ${title}`, message, [{ text: 'OK', onPress: onDismiss }]);
  },

  error: (title, message, onDismiss = () => {}) => {
    Alert.alert(`✕ ${title}`, message, [{ text: 'OK', onPress: onDismiss }]);
  },

  warning: (title, message, onDismiss = () => {}) => {
    Alert.alert(`⚠ ${title}`, message, [{ text: 'OK', onPress: onDismiss }]);
  },
};

export default toast;
