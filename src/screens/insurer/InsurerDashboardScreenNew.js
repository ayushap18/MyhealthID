import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { storageService } from '../../services/storageService';
import { THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../utils/theme';

const { width } = Dimensions.get('window');

export default function InsurerDashboardScreenNew({ navigation }) {
  const [insurer, setInsurer] = useState(null);
  const [verifiedRecords, setVerifiedRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const verifyButtonScale = useRef(new Animated.Value(1)).current;

  // Scanning animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const startAnimations = () => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(listAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadDashboardData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'insurer') {
      setInsurer(currentUser.data);

      const allLogs = await storageService.getAuditLogs();
      const insurerLogs = allLogs?.filter(
        log => log.accessorName === currentUser.data.name && log.action === 'VIEW'
      ) || [];
      setVerifiedRecords(insurerLogs);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await storageService.clearCurrentUser();
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelector' }],
    });
  };

  const handleVerifyPress = () => {
    Animated.sequence([
      Animated.timing(verifyButtonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(verifyButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('RequestAccess');
    });
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  if (!insurer) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[THEME.background, '#1A0D2E']} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.loadingSpinner, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.loadingIcon}>🔍</Text>
        </Animated.View>
        <Text style={styles.loadingText}>Loading verifier portal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[THEME.background, '#1A0D2E', '#0D1428']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>Verifier Portal</Text>
            <Text style={styles.headerTitle}>{insurer.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.warning} />
        }
      >
        {/* Agent Info Card */}
        <Animated.View
          style={[
            styles.agentCard,
            {
              opacity: cardAnim,
              transform: [
                { scale: Animated.multiply(cardAnim, pulseAnim) },
                { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[THEME.warning, '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.agentGradient}
          >
            {/* Scan line effect */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslate }] },
              ]}
            />

            <View style={styles.agentHeader}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>
                  {insurer.agentName?.charAt(0) || 'A'}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>🛡️</Text>
                <Text style={styles.verifiedText}>Certified Agent</Text>
              </View>
            </View>

            <Text style={styles.agentName}>{insurer.agentName}</Text>
            <Text style={styles.agentRole}>Insurance Verification Officer</Text>

            <View style={styles.agentDetails}>
              <View style={styles.agentDetailItem}>
                <Text style={styles.agentDetailLabel}>Agent ID</Text>
                <Text style={styles.agentDetailValue}>{insurer.agentId}</Text>
              </View>
              <View style={styles.agentDetailDivider} />
              <View style={styles.agentDetailItem}>
                <Text style={styles.agentDetailLabel}>License</Text>
                <Text style={styles.agentDetailValue}>
                  {insurer.licenseNumber ? insurer.licenseNumber.substring(0, 12) + '...' : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Decorative Elements */}
            <View style={styles.cardDecoration1} />
            <View style={styles.cardDecoration2} />
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.statGradient}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>{verifiedRecords.length}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.statGradient}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.statGradient}>
              <Text style={styles.statIcon}>⛓️</Text>
              <Text style={styles.statValue}>{verifiedRecords.length}</Text>
              <Text style={styles.statLabel}>On-Chain</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Verify Button */}
        <Animated.View style={{ transform: [{ scale: verifyButtonScale }] }}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[THEME.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyGradient}
            >
              <View style={styles.verifyIconWrapper}>
                <Text style={styles.verifyIcon}>🔍</Text>
              </View>
              <View style={styles.verifyTextWrapper}>
                <Text style={styles.verifyTitle}>Request Patient Record</Text>
                <Text style={styles.verifySubtitle}>Verify medical records with consent</Text>
              </View>
              <Text style={styles.verifyArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('VerifyRecord')}
          >
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.quickActionGradient}>
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>Verify Hash</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Verifications Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: listAnim,
              transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Verifications</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{verifiedRecords.length} records</Text>
            </View>
          </View>

          {verifiedRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Text style={styles.emptyIcon}>🔍</Text>
              </View>
              <Text style={styles.emptyTitle}>No Verifications Yet</Text>
              <Text style={styles.emptySubtitle}>Request your first record verification to get started</Text>
            </View>
          ) : (
            verifiedRecords.map((log, index) => (
              <Animated.View
                key={log._id || log.recordId || `log-${index}`}
                style={[
                  styles.verificationCard,
                  {
                    opacity: listAnim,
                    transform: [
                      {
                        translateX: listAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50 * (index + 1), 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.verificationGradient}>
                  <View style={styles.verificationHeader}>
                    <View style={styles.verificationBadge}>
                      <Text style={styles.verificationBadgeIcon}>✓</Text>
                      <Text style={styles.verificationBadgeText}>VERIFIED</Text>
                    </View>
                    <Text style={styles.verificationDate}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.verificationDetails}>
                    <View style={styles.verificationDetailRow}>
                      <Text style={styles.verificationDetailIcon}>👤</Text>
                      <View>
                        <Text style={styles.verificationDetailLabel}>Patient ID</Text>
                        <Text style={styles.verificationDetailValue}>{log.patientId || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={styles.verificationDetailRow}>
                      <Text style={styles.verificationDetailIcon}>📄</Text>
                      <View>
                        <Text style={styles.verificationDetailLabel}>Record ID</Text>
                        <Text style={styles.verificationDetailValue}>{log.recordId || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {log.transactionHash && (
                    <View style={styles.txHashWrapper}>
                      <Text style={styles.txLabel}>Transaction:</Text>
                      <Text style={styles.txValue}>{log.transactionHash.substring(0, 22)}...</Text>
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Text style={styles.footerIcon}>🔐</Text>
            <Text style={styles.footerText}>All verifications are consent-based</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  loadingIcon: {
    fontSize: 40,
  },
  loadingText: {
    color: THEME.textSecondary,
    fontSize: TYPOGRAPHY.body,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: THEME.warning,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  logoutIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  logoutText: {
    color: THEME.text,
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  agentCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  agentGradient: {
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  verifiedIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.text,
    fontWeight: '600',
  },
  agentName: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700',
    color: THEME.text,
  },
  agentRole: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  agentDetails: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  agentDetailItem: {
    flex: 1,
  },
  agentDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.md,
  },
  agentDetailLabel: {
    fontSize: TYPOGRAPHY.small,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  agentDetailValue: {
    fontSize: TYPOGRAPHY.caption,
    color: THEME.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  cardDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: RADIUS.lg,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700',
    color: THEME.text,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  verifyButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  verifyIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  verifyIcon: {
    fontSize: 24,
  },
  verifyTextWrapper: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '700',
    color: THEME.text,
  },
  verifySubtitle: {
    fontSize: TYPOGRAPHY.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  verifyArrow: {
    fontSize: 24,
    color: THEME.text,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  quickAction: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: RADIUS.lg,
  },
  quickActionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: THEME.text,
  },
  sectionBadge: {
    backgroundColor: THEME.card,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  sectionBadgeText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  emptyState: {
    backgroundColor: THEME.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: 'dashed',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  verificationCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  verificationGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: RADIUS.lg,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.success + '30',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
  },
  verificationBadgeIcon: {
    fontSize: 12,
    color: THEME.success,
    marginRight: 4,
  },
  verificationBadgeText: {
    fontSize: 11,
    color: THEME.success,
    fontWeight: '700',
  },
  verificationDate: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  verificationDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  verificationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  verificationDetailIcon: {
    fontSize: 16,
  },
  verificationDetailLabel: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  verificationDetailValue: {
    fontSize: TYPOGRAPHY.caption,
    color: THEME.text,
    fontWeight: '600',
  },
  txHashWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  txLabel: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
    marginRight: SPACING.xs,
  },
  txValue: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.primary,
    fontFamily: 'monospace',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card + '80',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  footerIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
});
