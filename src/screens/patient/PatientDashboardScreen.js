import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { RecordCard } from '../../components/Card';
import { Header } from '../../components/Common';
import logger from '../../utils/logger';

export default function PatientDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [consentRequests, setConsentRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        loadDashboardData();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

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
      logger.error('PatientDashboard', 'Error loading dashboard', err);
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadDashboardData();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.coral} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.coral} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          title="Dashboard"
          subtitle={`Welcome, ${user.name}`}
          rightAction={
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          }
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Welcome, ${user.name}`}
        rightAction={
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Health ID Card */}
        <View style={styles.healthIdCard}>
          <Text style={styles.healthIdLabel}>Your Health ID</Text>
          <Text style={styles.healthIdValue}>{user.patientId || 'N/A'}</Text>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Wallet</Text>
            <Text style={styles.walletAddress}>
              {user.walletAddress && typeof user.walletAddress === 'string' 
                ? `${user.walletAddress.substring(0, 20)}...` 
                : 'Not connected'}
            </Text>
          </View>
        </View>

        {/* Pending Consent Requests Alert */}
        {consentRequests.length > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('ConsentManager')}
          >
            <View style={styles.alertIcon}>
              <Text style={styles.alertEmoji}>⚠️</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {consentRequests.length} Pending Consent Request{consentRequests.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSubtext}>Tap to review and approve</Text>
            </View>
            <Text style={styles.alertArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ConsentManager')}
          >
            <Text style={styles.actionEmoji}>✓</Text>
            <Text style={styles.actionText}>Consent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AuditLog')}
          >
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionText}>Audit Log</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Records Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Records</Text>
          <Text style={styles.sectionSubtitle}>{records.length} records on blockchain</Text>
          
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No medical records yet</Text>
            </View>
          ) : (
            records.map((record, index) => (
              <RecordCard
                key={record.recordId || record._id || `record-${index}`}
                record={record}
                onPress={() => navigation.navigate('RecordDetail', { record })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoutText: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: '600',
  },
  healthIdCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  healthIdLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  healthIdValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginRight: 8,
  },
  walletAddress: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  alertCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  alertSubtext: {
    fontSize: 13,
    color: COLORS.gray,
  },
  alertArrow: {
    fontSize: 20,
    color: COLORS.warning,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
