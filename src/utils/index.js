// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Utilities Index
// Centralized export for all utility functions
// ═══════════════════════════════════════════════════════════════════════════

export { default as logger } from './logger';
export { toast, confirm, alert } from './toast';
export { debounce, throttle, useDebounce, useDebouncedValue } from './debounce';

// Common validation helpers
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  phone: (phone) => /^\+[1-9]\d{1,14}$/.test(phone),
  
  password: (password) => {
    if (password.length < 8) return { valid: false, message: 'At least 8 characters' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Needs lowercase letter' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Needs uppercase letter' };
    if (!/\d/.test(password)) return { valid: false, message: 'Needs a number' };
    if (!/[@$!%*?&#]/.test(password)) return { valid: false, message: 'Needs special character' };
    return { valid: true };
  },
  
  healthId: (id) => /^[A-Z]{1,5}\d{4,10}$/.test(id),
  
  name: (name) => name && name.trim().length >= 2,
};

// Format helpers
export const formatters = {
  date: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  },

  dateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  truncateAddress: (address, startLen = 6, endLen = 4) => {
    if (!address) return '';
    if (address.length <= startLen + endLen) return address;
    return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
  },

  fileSize: (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  },

  healthId: (id) => {
    if (!id) return '';
    // Format as XXXX-XXXX-XXXX
    return id.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  },
};

// Status/role helpers
export const roleHelpers = {
  getPortalName: (role) => {
    const names = {
      patient: 'Patient Portal',
      hospital: 'Healthcare Provider',
      doctor: 'Healthcare Provider',
      insurer: 'Insurance Verifier',
    };
    return names[role] || 'Portal';
  },

  getDashboardRoute: (role) => {
    const routes = {
      patient: 'PatientDashboard',
      hospital: 'HospitalDashboard',
      doctor: 'HospitalDashboard',
      insurer: 'InsurerDashboard',
    };
    return routes[role] || 'RoleSelect';
  },

  getAuthRoute: (role) => {
    const routes = {
      patient: 'PatientAuth',
      hospital: 'HospitalAuth',
      insurer: 'InsurerAuth',
    };
    return routes[role] || 'RoleSelect';
  },
};
