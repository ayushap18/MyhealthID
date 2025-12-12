// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Patient Dashboard Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import apiClient, { apiService, authStorage } from '../../services/apiService';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');

const PatientDashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingConsents: 0,
    sharedRecords: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
    fetchDashboardData();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    cardAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(300 + index * 100),
        Animated.spring(anim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Pulse animation for notification badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        return;
      }

      // Legacy key support
      const legacyUser = await AsyncStorage.getItem('userData');
      if (legacyUser) {
        const parsed = JSON.parse(legacyUser);
        setUser(parsed);
        await authStorage.setSession({ user: parsed, token: await authStorage.getAccessToken() });
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      logger.error('PatientDashboard', 'Load user error', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/patient/dashboard');
      const data = response.data;

      if (data?.success) {
        setRecords(data.records || []);
        setStats({
          totalRecords: data.totalRecords || 0,
          pendingConsents: data.pendingConsents || 0,
          sharedRecords: data.sharedRecords || 0,
        });
      }
    } catch (error) {
      logger.error('PatientDashboard', 'Fetch dashboard error', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await apiService.auth.logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelect' }],
          });
        },
      },
    ]);
  };

  const quickActions = [
    {
      id: 'records',
      icon: '📋',
      title: 'My Records',
      description: 'View health records',
      color: Colors.patient,
      gradient: ['#00D9FF', '#0891B2'],
      onPress: () => navigation.navigate('PatientRecords'),
    },
    {
      id: 'consent',
      icon: '🔐',
      title: 'Consent Manager',
      description: 'Manage data access',
      color: Colors.secondary,
      gradient: ['#7C3AED', '#5B21B6'],
      badge: stats.pendingConsents,
      onPress: () => navigation.navigate('ConsentManager'),
    },
    {
      id: 'share',
      icon: '📤',
      title: 'Share Records',
      description: 'Share with providers',
      color: Colors.accent,
      gradient: ['#10B981', '#059669'],
      onPress: () => navigation.navigate('ShareRecords'),
    },
    {
      id: 'history',
      icon: '📊',
      title: 'Access History',
      description: 'View audit trail',
      color: Colors.insurer,
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => navigation.navigate('AccessHistory'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.patient}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Health ID Card */}
          <LinearGradient
            colors={['#00D9FF20', '#0891B210']}
            style={styles.healthIdCard}
          >
            <View style={styles.healthIdHeader}>
              <Text style={styles.healthIdLabel}>HEALTH ID</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            </View>
            <Text style={styles.healthIdNumber}>
              {user?.healthId || 'XXXX-XXXX-XXXX'}
            </Text>
            <Text style={styles.healthIdPhone}>
              +91 {user?.phone || 'XXXXXXXXXX'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Total Records', value: stats.totalRecords, color: Colors.patient },
            { label: 'Pending Consents', value: stats.pendingConsents, color: Colors.insurer },
            { label: 'Shared Records', value: stats.sharedRecords, color: Colors.hospital },
          ].map((stat, index) => (
            <Animated.View
              key={stat.label}
              style={[
                styles.statCard,
                {
                  opacity: cardAnims[index],
                  transform: [{
                    scale: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
            >
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.actionGradient}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionIcon}
                  >
                    <Text style={styles.actionEmoji}>{action.icon}</Text>
                    {action.badge > 0 && (
                      <Animated.View
                        style={[
                          styles.badge,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      >
                        <Text style={styles.badgeText}>{action.badge}</Text>
                      </Animated.View>
                    )}
                  </LinearGradient>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Access & Health Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          {/* Emergency Access Button */}
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => navigation.navigate('EmergencyAccess')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF4444', '#CC0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emergencyGradient}
            >
              <Text style={styles.emergencyIcon}>🚨</Text>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>Emergency Access</Text>
                <Text style={styles.emergencySubtitle}>
                  Grant 24-hour access in medical emergencies
                </Text>
              </View>
              <Text style={styles.emergencyArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* QR Health Card Button */}
          <TouchableOpacity
            style={styles.healthCardButton}
            onPress={() => navigation.navigate('QRHealthCard')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1E3A5F', '#0D1F33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.healthCardGradient}
            >
              <Text style={styles.healthCardIcon}>🪪</Text>
              <View style={styles.healthCardInfo}>
                <Text style={styles.healthCardTitle}>Digital Health Card</Text>
                <Text style={styles.healthCardSubtitle}>
                  Show QR code for instant verification
                </Text>
              </View>
              <Text style={styles.healthCardArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Records</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PatientRecords')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyText}>No records yet</Text>
              <Text style={styles.emptySubtext}>
                Your health records will appear here
              </Text>
            </View>
          ) : (
            records.slice(0, 3).map((record, index) => (
              <TouchableOpacity
                key={record._id || index}
                style={styles.recordCard}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.recordGradient}
                >
                  <View style={styles.recordIcon}>
                    <Text style={styles.recordEmoji}>
                      {record.type === 'prescription' ? '💊' :
                       record.type === 'lab' ? '🔬' :
                       record.type === 'imaging' ? '🩻' : '📄'}
                    </Text>
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title || 'Health Record'}</Text>
                    <Text style={styles.recordMeta}>
                      {record.hospitalName || 'Unknown Provider'} • {new Date(record.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.recordArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Blockchain Status */}
        <View style={styles.blockchainStatus}>
          <LinearGradient
            colors={['#10B98110', '#05966910']}
            style={styles.blockchainCard}
          >
            <View style={styles.blockchainIcon}>
              <Text>⛓️</Text>
            </View>
            <View style={styles.blockchainInfo}>
              <Text style={styles.blockchainTitle}>Blockchain Secured</Text>
              <Text style={styles.blockchainText}>
                All your records are encrypted and stored on Ethereum
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  logoutButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.error + '20',
    borderRadius: Radius.md,
  },
  logoutText: {
    color: Colors.error,
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsIcon: {
    fontSize: 20,
  },
  healthIdCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.patient + '30',
  },
  healthIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  healthIdLabel: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  verifiedBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  verifiedText: {
    fontSize: Typography.tiny,
    color: Colors.success,
    fontWeight: Typography.medium,
  },
  healthIdNumber: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  healthIdPhone: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  seeAll: {
    fontSize: Typography.caption,
    color: Colors.patient,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  actionEmoji: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: Typography.tiny,
    color: '#fff',
    fontWeight: Typography.bold,
  },
  actionTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
  },
  recordCard: {
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recordEmoji: {
    fontSize: 20,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  recordMeta: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  recordArrow: {
    fontSize: Typography.body,
    color: Colors.textMuted,
  },
  blockchainStatus: {
    paddingHorizontal: Spacing.xl,
  },
  blockchainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hospital + '30',
  },
  blockchainIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.hospital + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  blockchainInfo: {
    flex: 1,
  },
  blockchainTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  blockchainText: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  // Emergency Access Button Styles
  emergencyButton: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    color: '#fff',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: Typography.tiny,
    color: 'rgba(255,255,255,0.8)',
  },
  emergencyArrow: {
    fontSize: Typography.h3,
    color: 'rgba(255,255,255,0.6)',
  },
  // Health Card Button Styles
  healthCardButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  healthCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  healthCardIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  healthCardInfo: {
    flex: 1,
  },
  healthCardTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    color: '#fff',
    marginBottom: 2,
  },
  healthCardSubtitle: {
    fontSize: Typography.tiny,
    color: 'rgba(255,255,255,0.7)',
  },
  healthCardArrow: {
    fontSize: Typography.h3,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default PatientDashboard;
