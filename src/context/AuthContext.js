import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, authStorage } from '../services/apiService';
import socketService from '../services/socketService';
import logger from '../utils/logger';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await authStorage.getAccessToken();
      const storedUser = await authStorage.getCurrentUser();
      const legacyUser = await AsyncStorage.getItem('user');

      const userData = storedUser || (legacyUser ? JSON.parse(legacyUser) : null);

      if (storedToken && userData) {
        setToken(storedToken);
        setUser(userData);

        // Migrate legacy key if present
        if (!storedUser && legacyUser) {
          await authStorage.setSession({ token: storedToken, user: userData });
          await AsyncStorage.removeItem('user');
        }

        try {
          await socketService.connect();
          socketService.joinRoom(userData.patientId || userData.id);
        } catch (socketError) {
          logger.warn('AuthContext', 'Socket connection failed', socketError.message);
        }
      }
    } catch (error) {
      logger.error('AuthContext', 'Auth check failed', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login(email, password);

      if (!response?.user || !response?.token) {
        throw new Error(response?.message || 'Login failed');
      }

      setToken(response.token);
      setUser(response.user);
      await authStorage.setSession({
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user,
      });
      
      try {
        await socketService.connect();
        socketService.joinRoom(response.user.patientId || response.user.id);
      } catch (socketError) {
        logger.warn('AuthContext', 'Socket connection failed', socketError.message);
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      logger.error('AuthContext', 'Login error', error);
      return { success: false, error: error.message || error.error || 'Login failed' };
    }
  };

  const register = async (name, email, password, role = 'patient') => {
    try {
      const response = await apiService.auth.register({ name, email, password, role });

      if (!response?.user || !response?.token) {
        throw new Error(response?.message || 'Registration failed');
      }

      setToken(response.token);
      setUser(response.user);
      await authStorage.setSession({
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user,
      });
      
      try {
        await socketService.connect();
        socketService.joinRoom(response.user.patientId || response.user.id);
      } catch (socketError) {
        logger.warn('AuthContext', 'Socket connection failed', socketError.message);
      }
      
      return { success: true, user: response.user, wallet: response.wallet };
    } catch (error) {
      logger.error('AuthContext', 'Registration error', error);
      return { success: false, error: error.message || error.error || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      socketService.leaveRoom(user?.patientId || user?.id);
      socketService.disconnect();
      await apiService.auth.logout();
      setToken(null);
      setUser(null);
    } catch (error) {
      logger.error('AuthContext', 'Logout error', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
