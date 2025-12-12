import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const STORAGE_KEYS = {
  PATIENTS: '@myhealthid:patients',
  RECORDS: '@myhealthid:records',
  CONSENT_REQUESTS: '@myhealthid:consents',
  AUDIT_LOGS: '@myhealthid:audits',
  CURRENT_USER: '@myhealthid:current_user',
};

export const storageService = {
  // Generic storage methods
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Storage', 'setItem error', error);
      return false;
    }
  },

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Storage', 'getItem error', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('Storage', 'removeItem error', error);
      return false;
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      logger.error('Storage', 'clear error', error);
      return false;
    }
  },

  // Specific data methods
  async savePatients(patients) {
    return await this.setItem(STORAGE_KEYS.PATIENTS, patients);
  },

  async getPatients() {
    return await this.getItem(STORAGE_KEYS.PATIENTS);
  },

  async saveRecords(records) {
    return await this.setItem(STORAGE_KEYS.RECORDS, records);
  },

  async getRecords() {
    return await this.getItem(STORAGE_KEYS.RECORDS);
  },

  async addRecord(record) {
    const records = (await this.getRecords()) || [];
    records.push(record);
    return await this.saveRecords(records);
  },

  async saveConsentRequests(requests) {
    return await this.setItem(STORAGE_KEYS.CONSENT_REQUESTS, requests);
  },

  async getAllConsentRequests() {
    return await this.getItem(STORAGE_KEYS.CONSENT_REQUESTS);
  },

  async updateConsentRequest(requestId, updates) {
    const requests = (await this.getAllConsentRequests()) || [];
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      return await this.saveConsentRequests(requests);
    }
    return false;
  },

  async saveAuditLogs(logs) {
    return await this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  async getAuditLogs() {
    return await this.getItem(STORAGE_KEYS.AUDIT_LOGS);
  },

  async addAuditLog(log) {
    const logs = (await this.getAuditLogs()) || [];
    logs.unshift(log); // Add to beginning
    return await this.saveAuditLogs(logs);
  },

  async setCurrentUser(user) {
    return await this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  async getCurrentUser() {
    return await this.getItem(STORAGE_KEYS.CURRENT_USER);
  },

  async clearCurrentUser() {
    return await this.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};
