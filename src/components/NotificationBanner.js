import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import socketService from '../services/socketService';

const NotificationBanner = ({ onPress }) => {
  const [notification, setNotification] = useState(null);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Listen for notifications
    const handleNewRecord = (data) => {
      showNotification({
        title: 'New Medical Record',
        message: `${data.hospitalName} uploaded: ${data.title}`,
        type: 'info',
        data,
      });
    };

    const handleConsentRequest = (data) => {
      showNotification({
        title: 'Access Request',
        message: `${data.requesterName} is requesting access to your records`,
        type: 'warning',
        data,
      });
    };

    const handleConsentApproved = (data) => {
      showNotification({
        title: 'Access Granted',
        message: 'Your consent request has been approved',
        type: 'success',
        data,
      });
    };

    const handleConsentRejected = (data) => {
      showNotification({
        title: 'Access Denied',
        message: 'Your consent request has been rejected',
        type: 'error',
        data,
      });
    };

    // Add listeners
    socketService.on('newRecord', handleNewRecord);
    socketService.on('consentRequest', handleConsentRequest);
    socketService.on('consentApproved', handleConsentApproved);
    socketService.on('consentRejected', handleConsentRejected);

    // Cleanup
    return () => {
      socketService.off('newRecord', handleNewRecord);
      socketService.off('consentRequest', handleConsentRequest);
      socketService.off('consentApproved', handleConsentApproved);
      socketService.off('consentRejected', handleConsentRejected);
    };
  }, []);

  const showNotification = (notif) => {
    setNotification(notif);

    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  };

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  const handlePress = () => {
    if (onPress && notification) {
      onPress(notification);
    }
    hideNotification();
  };

  if (!notification) return null;

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
        <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50, // Account for status bar
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.95,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default NotificationBanner;
