import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.connecting = false;
  }

  /**
   * Connect to Socket.io server
   */
  async connect() {
    if (this.socket?.connected) {
      logger.debug('Socket', 'Already connected');
      return;
    }

    if (this.connecting) {
      return;
    }

    try {
      this.connecting = true;
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('currentUser');
      
      if (!token || !user) {
        // Skip socket connection until user logs in
        this.connecting = false;
        return;
      }

      const userData = JSON.parse(user);

      this.socket = io(API_CONFIG.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        logger.info('Socket', `Connected: ${this.socket.id}`);
        this.connected = true;
        this.connecting = false;
        this.clearReconnectTimer();
        this.flushQueuedListeners();
        
        // Join user's room
        this.socket.emit('join', userData.patientId);
      });

      this.socket.on('disconnect', (reason) => {
        logger.info('Socket', `Disconnected: ${reason}`);
        this.connected = false;
        this.connecting = false;
        this.scheduleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        this.connected = false;
        this.connecting = false;
        logger.debug('Socket', 'Connection error', error.message);
        this.scheduleReconnect();
      });

      this.socket.on('reconnect', (attemptNumber) => {
        logger.info('Socket', `Reconnected after ${attemptNumber} attempts`);
        this.connected = true;
        this.connecting = false;
        this.clearReconnectTimer();
      });

      // Set up default listeners
      this.setupDefaultListeners();

    } catch (error) {
      logger.error('Socket', 'Connection failed', error);
    } finally {
      this.connecting = false;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    // Gentle retry to avoid spamming logs when backend is offline
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Set up default event listeners
   */
  setupDefaultListeners() {
    // New record notification
    this.on('newRecord', (data) => {
      logger.debug('Socket', 'New record received', data);
    });

    // Consent request notification
    this.on('consentRequest', (data) => {
      logger.debug('Socket', 'Consent request received', data);
    });

    // Consent approved notification
    this.on('consentApproved', (data) => {
      logger.debug('Socket', 'Consent approved', data);
    });

    // Consent rejected notification
    this.on('consentRejected', (data) => {
      logger.debug('Socket', 'Consent rejected', data);
    });
  }

  flushQueuedListeners() {
    if (!this.socket || !this.socket.connected) return;
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        // Ensure we do not double-bind after reconnect
        this.socket.off(event, cb);
        this.socket.on(event, cb);
      });
    });
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!event || typeof callback !== 'function') {
      logger.warn('Socket', 'Invalid event or callback');
      return;
    }
    
    if (!this.socket || !this.socket.connected) {
      // Store for later when socket connects
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      return;
    }

    // Store callback reference
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Add listener to socket
    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!event) return;
    
    // Remove from listeners map
    if (this.listeners.has(event)) {
      if (callback) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // Remove all listeners for this event
        this.listeners.delete(event);
      }
    }
    
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      // Remove all listeners for this event from socket
      this.socket.removeAllListeners(event);
    }
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (!this.socket?.connected) {
      logger.debug('Socket', 'Cannot emit - not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Join a user room
   * @param {string} userId 
   */
  joinRoom(userId) {
    if (!userId) return;
    this.emit('join', userId);
  }

  /**
   * Leave a user room
   * @param {string} userId 
   */
  leaveRoom(userId) {
    if (!userId) return;
    this.emit('leave', userId);
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();

      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
      this.clearReconnectTimer();
      logger.info('Socket', 'Disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
