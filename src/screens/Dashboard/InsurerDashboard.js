// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Insurer Dashboard Screen
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import apiClient, { apiService, authStorage } from '../../services/apiService';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');

const InsurerDashboard = ({ navigation }) => {
  const [insurer, setInsurer] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadInsurerData();
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
        Animated.delay(300 + index * 80),
        Animated.spring(anim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const loadInsurerData = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      if (storedUser) {
        setInsurer(storedUser);
        return;
      }

      const legacyUser = await AsyncStorage.getItem('userData');
      if (legacyUser) {
        const parsed = JSON.parse(legacyUser);
        setInsurer(parsed);
        await authStorage.setSession({ user: parsed, token: await authStorage.getAccessToken() });
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      logger.error('InsurerDashboard', 'Load insurer error', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/insurer/dashboard');
      const data = response.data;
      
      if (data?.success) {
        setStats({
          totalRequests: data.totalRequests || 0,
          approvedRequests: data.approvedRequests || 0,
          pendingRequests: data.pendingRequests || 0,
          rejectedRequests: data.rejectedRequests || 0,
        });
        setRecentRequests(data.recentRequests || []);
      }
    } catch (error) {
      logger.error('InsurerDashboard', 'Fetch dashboard error', error);
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
      id: 'request',
      icon: '📝',
      title: 'New Request',
      description: 'Request patient records',
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => navigation.navigate('NewAccessRequest'),
    },
    {
      id: 'verify',
      icon: '✓',
      title: 'Verify Records',
      description: 'Verify shared records',
      gradient: ['#10B981', '#059669'],
      onPress: () => navigation.navigate('VerifyRecords'),
    },
    {
      id: 'pending',
      icon: '⏳',
      title: 'Pending',
      description: 'View pending requests',
      gradient: ['#7C3AED', '#5B21B6'],
      badge: stats.pendingRequests,
      onPress: () => navigation.navigate('PendingRequests'),
    },
    {
      id: 'history',
      icon: '📊',
      title: 'History',
      description: 'All access history',
      gradient: ['#00D9FF', '#0891B2'],
      onPress: () => navigation.navigate('RequestHistory'),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

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
            tintColor={Colors.insurer}
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
              <Text style={styles.greeting}>Insurance Verifier</Text>
              <Text style={styles.companyName}>
                {insurer?.companyName || 'Insurance Company'}
              </Text>
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

          {/* License Card */}
          <LinearGradient
            colors={['#F59E0B20', '#D9770610']}
            style={styles.licenseCard}
          >
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseLabel}>IRDAI LICENSE</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            </View>
            <Text style={styles.licenseNumber}>
              {insurer?.licenseId || 'XXXXXXXXXX'}
            </Text>
            <Text style={styles.verifierName}>
              Verifier: {insurer?.verifierName || 'Not specified'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Patient Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search patient by Health ID..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Total', value: stats.totalRequests, color: Colors.insurer },
            { label: 'Approved', value: stats.approvedRequests, color: Colors.success },
            { label: 'Pending', value: stats.pendingRequests, color: Colors.warning },
            { label: 'Rejected', value: stats.rejectedRequests, color: Colors.error },
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
            {quickActions.map((action) => (
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
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{action.badge}</Text>
                      </View>
                    )}
                  </LinearGradient>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Request CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('NewAccessRequest')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaIcon}>📋</Text>
              <Text style={styles.ctaText}>Request Patient Records Access</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RequestHistory')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          {recentRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>
                Start by requesting access to patient records
              </Text>
            </View>
          ) : (
            recentRequests.slice(0, 5).map((request, index) => (
              <View key={request._id || index} style={styles.requestCard}>
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.requestGradient}
                >
                  <View style={styles.requestIcon}>
                    <Text>👤</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle}>
                      {request.patientName || `Patient ${request.patientHealthId}`}
                    </Text>
                    <Text style={styles.requestMeta}>
                      {request.recordTypes?.join(', ') || 'All Records'} • {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[
                    styles.requestStatus,
                    { backgroundColor: getStatusColor(request.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.requestStatusText,
                      { color: getStatusColor(request.status) }
                    ]}>
                      {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </View>

        {/* Consent Notice */}
        <View style={styles.noticeContainer}>
          <LinearGradient
            colors={['#EF444420', '#DC262610']}
            style={styles.noticeCard}
          >
            <Text style={styles.noticeIcon}>⚠️</Text>
            <View style={styles.noticeInfo}>
              <Text style={styles.noticeTitle}>Patient Consent Required</Text>
              <Text style={styles.noticeText}>
                All record access requires explicit patient consent. Unauthorized access is logged and reported.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Blockchain Info */}
        <View style={styles.blockchainContainer}>
          <LinearGradient
            colors={['#10B98110', '#05966910']}
            style={styles.blockchainCard}
          >
            <Text style={styles.blockchainIcon}>⛓️</Text>
            <View style={styles.blockchainInfo}>
              <Text style={styles.blockchainTitle}>Blockchain Verified</Text>
              <Text style={styles.blockchainText}>
                All access requests are recorded on the Ethereum blockchain for complete transparency
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
    fontSize: Typography.caption,
    color: Colors.insurer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  companyName: {
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
  licenseCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.insurer + '30',
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  licenseLabel: {
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
  licenseNumber: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  verifierName: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
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
    color: Colors.insurer,
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
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  ctaIcon: {
    fontSize: 20,
  },
  ctaText: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: '#000',
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
    textAlign: 'center',
  },
  requestCard: {
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  requestIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  requestStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  requestStatusText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.medium,
  },
  noticeContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  blockchainContainer: {
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
    fontSize: 24,
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
});

export default InsurerDashboard;
