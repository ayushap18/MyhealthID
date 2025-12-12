// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Hospital Dashboard Screen
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

const HospitalDashboard = ({ navigation }) => {
  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState({
    uploadedRecords: 0,
    patientsServed: 0,
    pendingUploads: 0,
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadHospitalData();
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
  }, []);

  const loadHospitalData = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      if (storedUser) {
        setHospital(storedUser);
        return;
      }

      const legacyUser = await AsyncStorage.getItem('userData');
      if (legacyUser) {
        const parsed = JSON.parse(legacyUser);
        setHospital(parsed);
        await authStorage.setSession({ user: parsed, token: await authStorage.getAccessToken() });
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      logger.error('HospitalDashboard', 'Load hospital error', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/hospital/dashboard');
      const data = response.data;
      
      if (data?.success) {
        setStats({
          uploadedRecords: data.uploadedRecords || 0,
          patientsServed: data.patientsServed || 0,
          pendingUploads: data.pendingUploads || 0,
        });
        setRecentUploads(data.recentUploads || []);
      }
    } catch (error) {
      logger.error('HospitalDashboard', 'Fetch dashboard error', error);
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
      id: 'upload',
      icon: '📤',
      title: 'Upload Record',
      description: 'Add new patient record',
      gradient: ['#10B981', '#059669'],
      onPress: () => navigation.navigate('UploadRecord'),
    },
    {
      id: 'patients',
      icon: '👥',
      title: 'Patient List',
      description: 'View all patients',
      gradient: ['#00D9FF', '#0891B2'],
      onPress: () => navigation.navigate('PatientList'),
    },
    {
      id: 'verify',
      icon: '✓',
      title: 'Verify Patient',
      description: 'Verify patient identity',
      gradient: ['#7C3AED', '#5B21B6'],
      onPress: () => navigation.navigate('VerifyPatient'),
    },
    {
      id: 'history',
      icon: '📊',
      title: 'Upload History',
      description: 'View all uploads',
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => navigation.navigate('UploadHistory'),
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
            tintColor={Colors.hospital}
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
              <Text style={styles.greeting}>Healthcare Provider</Text>
              <Text style={styles.hospitalName}>
                {hospital?.hospitalName || 'Hospital'}
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

          {/* Registration Card */}
          <LinearGradient
            colors={['#10B98120', '#05966910']}
            style={styles.registrationCard}
          >
            <View style={styles.regHeader}>
              <Text style={styles.regLabel}>REGISTRATION ID</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>● Active</Text>
              </View>
            </View>
            <Text style={styles.regNumber}>
              {hospital?.registrationId || 'XXXXXXXXXX'}
            </Text>
            <Text style={styles.adminName}>
              Admin: {hospital?.adminName || 'Not specified'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Patient Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search patient by Health ID or phone..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Records Uploaded', value: stats.uploadedRecords, color: Colors.hospital },
            { label: 'Patients Served', value: stats.patientsServed, color: Colors.patient },
            { label: 'Pending Uploads', value: stats.pendingUploads, color: Colors.insurer },
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
                  </LinearGradient>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload New Record CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('UploadRecord')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaIcon}>➕</Text>
              <Text style={styles.ctaText}>Upload New Patient Record</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Uploads */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UploadHistory')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          
          {recentUploads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No uploads yet</Text>
              <Text style={styles.emptySubtext}>
                Start by uploading your first patient record
              </Text>
            </View>
          ) : (
            recentUploads.slice(0, 5).map((upload, index) => (
              <View key={upload._id || index} style={styles.uploadCard}>
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.uploadGradient}
                >
                  <View style={styles.uploadIcon}>
                    <Text>📄</Text>
                  </View>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>{upload.patientName || 'Patient'}</Text>
                    <Text style={styles.uploadMeta}>
                      {upload.recordType || 'Record'} • {new Date(upload.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[
                    styles.uploadStatus,
                    { backgroundColor: upload.onChain ? Colors.success + '20' : Colors.warning + '20' }
                  ]}>
                    <Text style={[
                      styles.uploadStatusText,
                      { color: upload.onChain ? Colors.success : Colors.warning }
                    ]}>
                      {upload.onChain ? '⛓️ On Chain' : '⏳ Pending'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </View>

        {/* Compliance Notice */}
        <View style={styles.complianceContainer}>
          <LinearGradient
            colors={['#7C3AED10', '#5B21B610']}
            style={styles.complianceCard}
          >
            <Text style={styles.complianceIcon}>🔐</Text>
            <View style={styles.complianceInfo}>
              <Text style={styles.complianceTitle}>HIPAA Compliant</Text>
              <Text style={styles.complianceText}>
                All patient data is encrypted and compliant with healthcare regulations
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
    color: Colors.hospital,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hospitalName: {
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
  registrationCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.hospital + '30',
  },
  regHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  regLabel: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  activeBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  activeText: {
    fontSize: Typography.tiny,
    color: Colors.success,
    fontWeight: Typography.medium,
  },
  regNumber: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  adminName: {
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
    color: Colors.hospital,
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
  },
  actionEmoji: {
    fontSize: 24,
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
  uploadCard: {
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  uploadMeta: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
  uploadStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  uploadStatusText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.medium,
  },
  complianceContainer: {
    paddingHorizontal: Spacing.xl,
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  complianceIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  complianceInfo: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  complianceText: {
    fontSize: Typography.tiny,
    color: Colors.textMuted,
  },
});

export default HospitalDashboard;
