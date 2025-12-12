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

export default function HospitalDashboardScreenNew({ navigation }) {
  const [hospital, setHospital] = useState(null);
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const uploadButtonScale = useRef(new Animated.Value(1)).current;

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
  };

  const loadDashboardData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'hospital') {
      setHospital(currentUser.data);

      const allRecords = await storageService.getRecords();
      const hospitalRecords = allRecords?.filter(
        r => r.hospitalName === currentUser.data.name
      ) || [];
      setUploadedRecords(hospitalRecords);
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

  const handleUploadPress = () => {
    Animated.sequence([
      Animated.timing(uploadButtonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(uploadButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('UploadRecord');
    });
  };

  if (!hospital) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[THEME.background, '#0D1B3C']} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.loadingSpinner, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.loadingIcon}>🏥</Text>
        </Animated.View>
        <Text style={styles.loadingText}>Loading portal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[THEME.background, '#0D1B3C', '#091428']} style={StyleSheet.absoluteFill} />

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
            <Text style={styles.headerLabel}>Hospital Portal</Text>
            <Text style={styles.headerTitle}>{hospital.name}</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.secondary} />
        }
      >
        {/* Staff Info Card */}
        <Animated.View
          style={[
            styles.staffCard,
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
            colors={[THEME.secondary, '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.staffGradient}
          >
            <View style={styles.staffHeader}>
              <View style={styles.staffAvatar}>
                <Text style={styles.staffAvatarText}>
                  {hospital.staffName?.charAt(0) || 'H'}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>Verified Staff</Text>
              </View>
            </View>

            <Text style={styles.staffName}>{hospital.staffName}</Text>
            <Text style={styles.staffRole}>Medical Records Administrator</Text>

            <View style={styles.staffDetails}>
              <View style={styles.staffDetailItem}>
                <Text style={styles.staffDetailLabel}>Staff ID</Text>
                <Text style={styles.staffDetailValue}>{hospital.staffId}</Text>
              </View>
              <View style={styles.staffDetailDivider} />
              <View style={styles.staffDetailItem}>
                <Text style={styles.staffDetailLabel}>Registration</Text>
                <Text style={styles.staffDetailValue}>
                  {hospital.registrationNumber ? hospital.registrationNumber.substring(0, 12) + '...' : 'N/A'}
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
              <Text style={styles.statIcon}>📤</Text>
              <Text style={styles.statValue}>{uploadedRecords.length}</Text>
              <Text style={styles.statLabel}>Uploads</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.statGradient}>
              <Text style={styles.statIcon}>⛓️</Text>
              <Text style={styles.statValue}>{uploadedRecords.length}</Text>
              <Text style={styles.statLabel}>On-Chain</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.statGradient}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Upload Button */}
        <Animated.View style={{ transform: [{ scale: uploadButtonScale }] }}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[THEME.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadGradient}
            >
              <View style={styles.uploadIconWrapper}>
                <Text style={styles.uploadIcon}>📄</Text>
              </View>
              <View style={styles.uploadTextWrapper}>
                <Text style={styles.uploadTitle}>Upload Medical Record</Text>
                <Text style={styles.uploadSubtitle}>Add new patient record to blockchain</Text>
              </View>
              <Text style={styles.uploadArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Uploads Section */}
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
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{uploadedRecords.length} records</Text>
            </View>
          </View>

          {uploadedRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Text style={styles.emptyIcon}>📤</Text>
              </View>
              <Text style={styles.emptyTitle}>No Records Yet</Text>
              <Text style={styles.emptySubtitle}>Upload your first medical record to get started</Text>
            </View>
          ) : (
            uploadedRecords.map((record, index) => (
              <Animated.View
                key={record.recordId || record._id || `upload-${index}`}
                style={[
                  styles.recordCard,
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
                <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.recordGradient}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTypeWrapper}>
                      <Text style={styles.recordTypeIcon}>
                        {record.type === 'Blood Test' ? '🩸' : record.type === 'X-Ray' ? '🔬' : '📋'}
                      </Text>
                      <Text style={styles.recordType}>{record.type || 'Medical Record'}</Text>
                    </View>
                    <View style={styles.chainBadge}>
                      <Text style={styles.chainBadgeIcon}>⛓️</Text>
                      <Text style={styles.chainBadgeText}>ON-CHAIN</Text>
                    </View>
                  </View>

                  <Text style={styles.recordTitle}>{record.title || 'Untitled Record'}</Text>

                  <View style={styles.recordMeta}>
                    <View style={styles.recordMetaItem}>
                      <Text style={styles.recordMetaIcon}>👤</Text>
                      <Text style={styles.recordMetaText}>{record.patientId || 'N/A'}</Text>
                    </View>
                    <View style={styles.recordMetaItem}>
                      <Text style={styles.recordMetaIcon}>📅</Text>
                      <Text style={styles.recordMetaText}>
                        {record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recordCID}>
                    <Text style={styles.cidLabel}>CID:</Text>
                    <Text style={styles.cidValue}>
                      {(record.cid || record.ipfsCID || 'N/A').substring(0, 25)}...
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Ethereum & IPFS</Text>
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
    color: THEME.secondary,
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
  staffCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  staffGradient: {
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarText: {
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
    fontSize: 12,
    marginRight: 4,
    color: THEME.text,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.text,
    fontWeight: '600',
  },
  staffName: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700',
    color: THEME.text,
  },
  staffRole: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  staffDetails: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  staffDetailItem: {
    flex: 1,
  },
  staffDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.md,
  },
  staffDetailLabel: {
    fontSize: TYPOGRAPHY.small,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  staffDetailValue: {
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
  uploadButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.large,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  uploadIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadTextWrapper: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '700',
    color: THEME.text,
  },
  uploadSubtitle: {
    fontSize: TYPOGRAPHY.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  uploadArrow: {
    fontSize: 24,
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
  recordCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  recordGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: RADIUS.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recordTypeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  recordType: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.secondary,
    fontWeight: '600',
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.success + '30',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  chainBadgeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  chainBadgeText: {
    fontSize: 10,
    color: THEME.success,
    fontWeight: '700',
  },
  recordTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: SPACING.sm,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  recordMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordMetaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  recordMetaText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  recordCID: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  cidLabel: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
    marginRight: SPACING.xs,
  },
  cidValue: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.primary,
    fontFamily: 'monospace',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
});
