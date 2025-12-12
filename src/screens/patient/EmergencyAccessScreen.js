// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Emergency Access Screen
// Life-saving feature: Grant temporary access to all medical records
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Vibration,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { apiService, authStorage } from '../../services/apiService';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');

export default function EmergencyAccessScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyToken, setEmergencyToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    checkExistingEmergency();
  }, []);

  useEffect(() => {
    if (emergencyActive) {
      // Pulse animation for emergency mode
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [emergencyActive]);

  useEffect(() => {
    if (expiresAt) {
      const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) {
          setEmergencyActive(false);
          setEmergencyToken(null);
          setCountdown(null);
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expiresAt]);

  const loadUserData = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      setUser(storedUser);
    } catch (error) {
      logger.error('EmergencyAccess', 'Error loading user', error);
    }
  };

  const checkExistingEmergency = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      if (!storedUser?.patientId) return;

      const response = await apiService.emergency.checkStatus(storedUser.patientId);
      if (response?.active) {
        setEmergencyActive(true);
        setEmergencyToken(response.token);
        setExpiresAt(response.expiresAt);
      }
    } catch (error) {
      // No active emergency - that's fine
      logger.debug('EmergencyAccess', 'No active emergency');
    }
  };

  const activateEmergency = async () => {
    Alert.alert(
      '🚨 Activate Emergency Access',
      'This will grant ANY hospital access to your complete medical records for 24 hours.\n\nUse only in genuine medical emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ACTIVATE',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            Vibration.vibrate([0, 200, 100, 200]);

            try {
              const response = await apiService.emergency.activate(user.patientId);
              
              setEmergencyActive(true);
              setEmergencyToken(response.token);
              setExpiresAt(response.expiresAt);

              logger.info('EmergencyAccess', 'Emergency activated', { 
                patientId: user.patientId,
                expiresAt: response.expiresAt 
              });

              Alert.alert(
                '✅ Emergency Access Activated',
                'Your medical records are now accessible to any verified hospital for 24 hours.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              logger.error('EmergencyAccess', 'Activation failed', error);
              Alert.alert('Error', 'Failed to activate emergency access');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const deactivateEmergency = async () => {
    Alert.alert(
      'Deactivate Emergency Access',
      'This will revoke all emergency access immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.emergency.deactivate(user.patientId);
              
              setEmergencyActive(false);
              setEmergencyToken(null);
              setExpiresAt(null);
              setCountdown(null);

              Alert.alert('✅ Deactivated', 'Emergency access has been revoked.');
            } catch (error) {
              logger.error('EmergencyAccess', 'Deactivation failed', error);
              Alert.alert('Error', 'Failed to deactivate');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const shareEmergencyInfo = async () => {
    try {
      const message = `🚨 EMERGENCY MEDICAL ACCESS\n\nPatient: ${user?.name}\nHealth ID: ${user?.healthId || user?.patientId}\nEmergency Token: ${emergencyToken}\n\nValid for: ${countdown}\n\nScan this at any MyHealthID-enabled hospital for immediate access to medical records.`;
      
      await Share.share({
        message,
        title: 'Emergency Medical Access',
      });
    } catch (error) {
      logger.error('EmergencyAccess', 'Share failed', error);
    }
  };

  const criticalInfo = [
    { label: 'Blood Type', value: user?.bloodType || 'O+', icon: '🩸' },
    { label: 'Allergies', value: user?.allergies || 'None known', icon: '⚠️' },
    { label: 'Medications', value: user?.medications || 'None', icon: '💊' },
    { label: 'Emergency Contact', value: user?.emergencyContact || '+91 9876543210', icon: '📞' },
  ];

  const glowStyle = {
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 30],
    }),
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={emergencyActive ? ['#1a0000', '#0a0000', '#000'] : ['#000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Access</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Emergency Status */}
          <View style={styles.statusSection}>
            <Animated.View style={[styles.emergencyButton, emergencyActive && glowStyle]}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={emergencyActive ? deactivateEmergency : activateEmergency}
                  disabled={loading}
                  style={[
                    styles.bigButton,
                    emergencyActive && styles.bigButtonActive,
                  ]}
                >
                  <LinearGradient
                    colors={emergencyActive ? ['#FF4444', '#CC0000'] : ['#333', '#222']}
                    style={styles.bigButtonGradient}
                  >
                    <Text style={styles.emergencyIcon}>🚨</Text>
                    <Text style={styles.emergencyText}>
                      {loading ? 'Processing...' : emergencyActive ? 'EMERGENCY ACTIVE' : 'ACTIVATE EMERGENCY'}
                    </Text>
                    {emergencyActive && countdown && (
                      <Text style={styles.countdownText}>Expires in: {countdown}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {!emergencyActive && (
              <Text style={styles.warningText}>
                ⚠️ Only use in genuine medical emergencies
              </Text>
            )}
          </View>

          {/* QR Code Section */}
          {emergencyActive && emergencyToken && (
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Emergency QR Code</Text>
              <Text style={styles.sectionSubtitle}>Show this to any hospital for instant access</Text>
              
              <View style={styles.qrContainer}>
                <LinearGradient
                  colors={['#FF444420', '#CC000010']}
                  style={styles.qrWrapper}
                >
                  <QRCode
                    value={JSON.stringify({
                      type: 'EMERGENCY_ACCESS',
                      patientId: user?.patientId,
                      token: emergencyToken,
                      expiresAt,
                    })}
                    size={200}
                    color="#FFFFFF"
                    backgroundColor="transparent"
                  />
                </LinearGradient>
              </View>

              <TouchableOpacity style={styles.shareButton} onPress={shareEmergencyInfo}>
                <Text style={styles.shareButtonText}>📤 Share Emergency Info</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Critical Medical Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Critical Medical Information</Text>
            <Text style={styles.sectionSubtitle}>Always visible in emergencies</Text>

            {criticalInfo.map((info, index) => (
              <View key={index} style={styles.infoCard}>
                <Text style={styles.infoIcon}>{info.icon}</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* How It Works */}
          <View style={styles.howItWorks}>
            <Text style={styles.sectionTitle}>How Emergency Access Works</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>You activate emergency access (valid 24 hours)</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Any verified hospital can scan your QR code</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>They get instant access to your medical records</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>All access is logged on blockchain for transparency</Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backText: {
    color: Colors.text,
    fontSize: Typography.body,
  },
  headerTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.xl,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emergencyButton: {
    borderRadius: 100,
  },
  bigButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#333',
  },
  bigButtonActive: {
    borderColor: '#FF4444',
  },
  bigButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  emergencyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emergencyText: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    color: '#fff',
    textAlign: 'center',
  },
  countdownText: {
    fontSize: Typography.caption,
    color: '#FFaaaa',
    marginTop: Spacing.xs,
  },
  warningText: {
    color: Colors.warning,
    fontSize: Typography.caption,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  qrContainer: {
    marginBottom: Spacing.lg,
  },
  qrWrapper: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  shareButton: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
  },
  infoSection: {
    marginBottom: Spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  howItWorks: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: '#000',
    fontWeight: Typography.bold,
    fontSize: Typography.caption,
  },
  stepText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.caption,
  },
  spacer: {
    height: 40,
  },
});
