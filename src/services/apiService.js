import axios from 'axios';
import { API_CONFIG } from '../config/api';
import logger from '../utils/logger';
import { tokenStorage, userStorage, clearAllAuthStorage } from './secureStorage';

let isRefreshing = false;
let refreshPromise = null;
let sessionExpiredCallback = null;

// Allow external components to register session expiry handler
export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

const setAuthStorage = async ({ token, refreshToken, user }) => {
  const operations = [];

  if (token) operations.push(tokenStorage.setAccessToken(token));
  if (refreshToken) operations.push(tokenStorage.setRefreshToken(refreshToken));
  if (user) operations.push(userStorage.setCurrentUser(user));

  if (operations.length) {
    await Promise.all(operations);
  }
};

const clearAuthStorage = async () => {
  await clearAllAuthStorage();
};

export const authStorage = {
  setSession: setAuthStorage,
  clearSession: clearAuthStorage,
  getAccessToken: () => tokenStorage.getAccessToken(),
  getRefreshToken: () => tokenStorage.getRefreshToken(),
  getCurrentUser: () => userStorage.getCurrentUser(),
  getUserRole: () => userStorage.getUserRole(),
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request timing for logging
apiClient.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: Date.now() };
    const token = await authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh access token helper
const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      logger.debug('API', 'Attempting token refresh');
      const resp = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, { refreshToken }, {
        timeout: 10000,
      });

      const { token: newToken, refreshToken: newRefreshToken } = resp.data;
      if (!newToken) throw new Error('No access token in refresh response');

      await setAuthStorage({ token: newToken, refreshToken: newRefreshToken });
      logger.info('API', 'Token refreshed successfully');
      return newToken;
    } catch (error) {
      logger.warn('API', 'Token refresh failed', error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Response interceptor for error handling + token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful API calls in dev
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    logger.api(response.config.method, response.config.url, response.status, duration);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = Date.now() - (originalRequest?.metadata?.startTime || Date.now());
    
    // Log failed API calls
    logger.api(
      originalRequest?.method || 'unknown',
      originalRequest?.url || 'unknown',
      error.response?.status || 0,
      duration
    );

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        logger.error('API', 'Session expired, clearing auth');
        await clearAuthStorage();
        // Notify app of session expiry
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.token) {
        await setAuthStorage({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        });
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.token) {
        await setAuthStorage({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        });
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      await userStorage.setCurrentUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user info' };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    await clearAuthStorage();
  },
};

/**
 * Records API
 */
export const recordsAPI = {
  /**
   * Upload medical record
   */
  upload: async (formData, onUploadProgress) => {
    try {
      const token = await tokenStorage.getAccessToken();
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/records/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: API_CONFIG.UPLOAD_TIMEOUT,
          onUploadProgress,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  },

  /**
   * Get patient records
   */
  getRecords: async (patientId) => {
    try {
      const response = await apiClient.get(`/records/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch records' };
    }
  },

  /**
   * Get record details
   */
  getRecordDetail: async (recordId) => {
    try {
      const response = await apiClient.get(`/records/detail/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch record details' };
    }
  },

  /**
   * Verify record on blockchain
   */
  verifyRecord: async (recordId) => {
    try {
      const response = await apiClient.post(`/records/verify/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Verification failed' };
    }
  },
};

/**
 * Consent API
 */
export const consentAPI = {
  /**
   * Request access to patient records
   */
  requestAccess: async (consentData) => {
    try {
      const response = await apiClient.post('/consent/request', consentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to request access' };
    }
  },

  /**
   * Approve consent request
   */
  approveConsent: async (consentId) => {
    try {
      const response = await apiClient.post('/consent/approve', { consentId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to approve consent' };
    }
  },

  /**
   * Reject consent request
   */
  rejectConsent: async (consentId) => {
    try {
      const response = await apiClient.post('/consent/reject', { consentId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reject consent' };
    }
  },

  /**
   * Get consent requests for patient
   * Fetches all consent requests (pending, approved, rejected)
   */
  getAllConsentRequests: async (patientId) => {
    try {
      const response = await apiClient.get(`/consent/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch consents' };
    }
  },

  /**
   * Get pending consent requests
   */
  getPendingConsents: async (patientId) => {
    try {
      const response = await apiClient.get(`/consent/pending/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch pending consents' };
    }
  },
};

/**
 * Audit API
 */
export const auditAPI = {
  /**
   * Get audit logs for patient
   */
  getLogs: async (patientId, options = {}) => {
    try {
      const params = new URLSearchParams(options).toString();
      const response = await apiClient.get(`/audit/${patientId}?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch audit logs' };
    }
  },

  /**
   * Get audit logs for specific record
   */
  getRecordLogs: async (recordId) => {
    try {
      const response = await apiClient.get(`/audit/record/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch record logs' };
    }
  },

  /**
   * Get audit statistics
   */
  getStats: async (patientId) => {
    try {
      const response = await apiClient.get(`/audit/stats/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch audit stats' };
    }
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    logger.error('API', 'Health check failed', error);
    throw { error: 'Backend server is not reachable' };
  }
};

/**
 * Patient API (dashboard endpoints)
 */
export const patientAPI = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/patient/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch dashboard' };
    }
  },

  verifyPatient: async (healthId) => {
    try {
      const response = await apiClient.get(`/patient/verify/${healthId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to verify patient' };
    }
  },
};

/**
 * Hospital API (dashboard endpoints)
 */
export const hospitalAPI = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/hospital/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch dashboard' };
    }
  },
};

/**
 * Insurer API (dashboard endpoints)
 */
export const insurerAPI = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/insurer/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch dashboard' };
    }
  },
};

/**
 * Emergency Access API
 */
export const emergencyAPI = {
  /**
   * Activate emergency access (24-hour access to all records)
   */
  activate: async (patientId) => {
    try {
      const response = await apiClient.post('/emergency/grant-access', { patientId });
      return {
        token: response.data.consentId,
        expiresAt: response.data.expiresAt,
        qrCode: response.data.qrCode,
        active: true,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to activate emergency access' };
    }
  },

  /**
   * Deactivate emergency access
   */
  deactivate: async (patientId) => {
    try {
      const response = await apiClient.post('/emergency/revoke-access', { patientId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to deactivate emergency access' };
    }
  },

  /**
   * Check emergency access status
   */
  checkStatus: async (patientId) => {
    try {
      const response = await apiClient.get('/emergency/status');
      return {
        active: response.data.active,
        token: response.data.consentId,
        expiresAt: response.data.expiresAt,
        timeRemaining: response.data.timeRemaining,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to check emergency status' };
    }
  },

  /**
   * Verify emergency token (for hospitals)
   */
  verifyToken: async (token, patientId) => {
    try {
      const response = await apiClient.post('/emergency/verify', { token, patientId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Invalid emergency token' };
    }
  },
};

export const apiService = {
  auth: authAPI,
  records: recordsAPI,
  consent: consentAPI,
  audit: auditAPI,
  patient: patientAPI,
  hospital: hospitalAPI,
  insurer: insurerAPI,
  emergency: emergencyAPI,
  healthCheck,
};

export default apiClient;
