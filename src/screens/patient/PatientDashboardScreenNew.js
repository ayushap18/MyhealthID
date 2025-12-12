import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { THEME, SPACING, RADIUS } from '../../utils/theme';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');

export default function PatientDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [consentRequests, setConsentRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const cardAnimations = useRef([...Array(6)].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(30),
    scale: new Animated.Value(0.95),
  }))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      loadDashboardData();
      startAnimations();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) loadDashboardData();
    });
    return unsubscribe;
  }, [navigation, user]);

  const startAnimations = () => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Cards staggered animation
    cardAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          friction: 8,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(anim.scale, {
          toValue: 1,
          friction: 6,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadDashboardData = async () => {
    if (!user?.patientId) return;
    
    try {
      setError(null);
      const [recordsResponse, consentsResponse] = await Promise.all([
        apiService.records.getRecords(user.patientId).catch(() => ({ records: [] })),
        apiService.consent.getAllConsentRequests(user.patientId).catch(() => ({ consents: [] })),
      ]);
      
      const recordsList = recordsResponse?.records || (Array.isArray(recordsResponse) ? recordsResponse : []);
      setRecords(recordsList);

      const consentsList = consentsResponse?.consents || (Array.isArray(consentsResponse) ? consentsResponse : []);
      const pendingRequests = consentsList.filter(r => r.status === 'pending');
      setConsentRequests(pendingRequests);
    } catch (err) {
      logger.error('PatientDashboardNew', 'Error loading dashboard', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'RoleSelector' }],
            });
          },
        },
      ]
    );
  };

  if (!user || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[THEME.background, THEME.backgroundSecondary]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const stats = [
    { label: 'Total Records', value: records.length, icon: '📋', color: THEME.primary },
    { label: 'Pending Consents', value: consentRequests.length, icon: '⏳', color: THEME.warning },
    { label: 'Verified', value: records.filter(r => r.status === 'verified').length, icon: '✅', color: THEME.success },
  ];

  const quickActions = [
    { id: 'consent', icon: '🔐', label: 'Manage Consent', route: 'ConsentManager', gradient: THEME.gradients.primary },
    { id: 'audit', icon: '📋', label: 'Audit Log', route: 'AuditLog', gradient: THEME.gradients.secondary },
    { id: 'settings', icon: '⚙️', label: 'Settings', route: 'Settings', gradient: THEME.gradients.accent },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.background, THEME.backgroundSecondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                style={styles.logoutGradient}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Health ID Card */}
        <Animated.View
          style={[
            {
              opacity: cardAnimations[0].opacity,
              transform: [
                { translateY: cardAnimations[0].translateY },
                { scale: Animated.multiply(cardAnimations[0].scale, pulseAnim) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={THEME.gradients.primary}
            style={styles.healthIdCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.healthIdHeader}>
              <Text style={styles.healthIdLabel}>HEALTH ID</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            </View>
            <Text style={styles.healthIdValue}>{user.patientId || 'N/A'}</Text>
            
            <View style={styles.healthIdDivider} />
            
            <View style={styles.walletRow}>
              <View style={styles.walletIcon}>
                <Text style={styles.walletEmoji}>⛓️</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Ethereum Wallet</Text>
                <Text style={styles.walletAddress}>
                  {user.walletAddress && typeof user.walletAddress === 'string'
                    ? `${user.walletAddress.substring(0, 12)}...${user.walletAddress.substring(38)}`
                    : 'Not connected'}
                </Text>
              </View>
            </View>

            {/* Blockchain decoration */}
            <View style={styles.blockchainDecor}>
              <View style={styles.block} />
              <View style={styles.blockLine} />
              <View style={styles.block} />
              <View style={styles.blockLine} />
              <View style={styles.block} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Alert Banner */}
        {consentRequests.length > 0 && (
          <Animated.View
            style={[
              {
                opacity: cardAnimations[1].opacity,
                transform: [{ translateY: cardAnimations[1].translateY }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ConsentManager')}
            >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                style={styles.alertBanner}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {consentRequests.length} Pending Request{consentRequests.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.alertSubtitle}>Tap to review access requests</Text>
                </View>
                <Text style={styles.alertArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Stats Grid */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: cardAnimations[2].opacity,
              transform: [{ translateY: cardAnimations[2].translateY }],
            },
          ]}
        >
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient
                colors={[THEME.card, THEME.cardHover]}
                style={styles.statGradient}
              >
                <View style={[styles.statIconBg, { backgroundColor: stat.color + '20' }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: cardAnimations[3].opacity,
              transform: [{ translateY: cardAnimations[3].translateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(action.route)}
                style={styles.actionCard}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Medical Records */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: cardAnimations[4].opacity,
              transform: [{ translateY: cardAnimations[4].translateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Records</Text>
            <Text style={styles.sectionCount}>{records.length} on blockchain</Text>
          </View>

          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[THEME.card, THEME.cardHover]}
                style={styles.emptyStateGradient}
              >
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyTitle}>No Records Yet</Text>
                <Text style={styles.emptyText}>Your medical records will appear here</Text>
              </LinearGradient>
            </View>
          ) : (
            records.slice(0, 5).map((record, index) => (
              <TouchableOpacity
                key={record.recordId || record._id || `record-${index}`}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('RecordDetail', { record })}
              >
                <LinearGradient
                  colors={[THEME.card, THEME.cardHover]}
                  style={styles.recordCard}
                >
                  <View style={styles.recordIcon}>
                    <Text style={styles.recordEmoji}>
                      {record.type === 'Lab Report' ? '🧪' :
                       record.type === 'X-Ray Report' ? '🩻' :
                       record.type === 'Prescription' ? '💊' : '📋'}
                    </Text>
                  </View>
                  <View style={styles.recordContent}>
                    <Text style={styles.recordType}>{record.type || 'Unknown'}</Text>
                    <Text style={styles.recordTitle}>{record.title || 'Untitled'}</Text>
                    <Text style={styles.recordMeta}>
                      {record.hospitalName || 'Unknown Hospital'} • {record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.recordStatus}>
                    <View style={[styles.statusDot, { backgroundColor: THEME.success }]} />
                    <Text style={styles.statusText}>Verified</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: THEME.textSecondary,
    fontSize: 16,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    bottom: 200,
    left: -100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.text,
  },
  logoutButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  logoutGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: THEME.error,
    fontSize: 14,
    fontWeight: '600',
  },
  healthIdCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  healthIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  healthIdLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.text,
  },
  healthIdValue: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  healthIdDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  walletEmoji: {
    fontSize: 20,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    fontFamily: 'monospace',
  },
  blockchainDecor: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.3,
  },
  block: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME.text,
  },
  blockLine: {
    width: 12,
    height: 2,
    backgroundColor: THEME.text,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.warning,
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  alertArrow: {
    fontSize: 20,
    color: THEME.warning,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    borderRadius: RADIUS.lg,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  sectionCount: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
  },
  emptyState: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    borderRadius: RADIUS.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recordEmoji: {
    fontSize: 24,
  },
  recordContent: {
    flex: 1,
  },
  recordType: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  recordMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.success,
  },
});
