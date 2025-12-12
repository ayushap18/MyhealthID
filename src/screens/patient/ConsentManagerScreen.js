import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import socketService from '../../services/socketService';
import { ConsentCard } from '../../components/Card';
import { Header, LoadingOverlay, EmptyState } from '../../components/Common';
import logger from '../../utils/logger';

export default function ConsentManagerScreen({ navigation }) {
  const { user } = useAuth();
  const [consentRequests, setConsentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (user) {
      loadConsentRequests();
      setupSocketListeners();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      socketService.off('consentRequest');
    };
  }, [user]);

  const setupSocketListeners = () => {
    socketService.on('consentRequest', (data) => {
      loadConsentRequests();
    });
  };

  const loadConsentRequests = async () => {
    if (!user?.patientId) return;
    
    try {
      setError(null);
      const response = await apiService.consent.getAllConsentRequests(user.patientId);
      const requests = response?.consents || (Array.isArray(response) ? response : []);
      setConsentRequests(requests);
    } catch (err) {
      logger.error('ConsentManager', 'Error loading consent requests', err);
      setError(err.message || 'Failed to load consent requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConsentRequests();
  };

  const handleApprove = async (request) => {
    Alert.alert(
      '✓ Approve Access',
      `Grant ${request.requesterName} access to this record for ${request.expiryHours} hours?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessingId(request.id);
            try {
              await apiService.consent.approveConsent(
                request.id,
                request.expiryHours || 24
              );
              
              Alert.alert(
                'Success',
                `Access granted to ${request.requesterName}`,
                [{ text: 'OK', onPress: () => loadConsentRequests() }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to approve consent request'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeny = async (request) => {
    Alert.alert(
      '✕ Deny Access',
      `Deny access request from ${request.requesterName}?\n\nThis action will be logged on the blockchain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(request.id);
            try {
              await apiService.consent.rejectConsent(request.id);
              
              Alert.alert(
                'Access Denied',
                'Consent request has been denied',
                [{ text: 'OK', onPress: () => loadConsentRequests() }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to deny consent request'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const pendingRequests = consentRequests.filter(r => r.status === 'pending');
  const historicalRequests = consentRequests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Consent Manager"
          subtitle="Loading requests..."
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Loading consent requests...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          title="Consent Manager"
          subtitle="Error loading data"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadConsentRequests}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Consent Manager"
        subtitle={`${pendingRequests.length} pending request${pendingRequests.length !== 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Stats */}
        <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{pendingRequests.length}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{historicalRequests.filter(r => r.status === 'approved').length}</Text>
              <Text style={styles.summaryLabel}>Approved</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{historicalRequests.filter(r => r.status === 'rejected').length}</Text>
              <Text style={styles.summaryLabel}>Denied</Text>
            </View>
          </View>
        </Animated.View>

        {/* Pending Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⏳ Pending Requests</Text>
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </View>
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>No pending consent requests</Text>
            </View>
          ) : (
            pendingRequests.map((request, index) => (
              <Animated.View
                key={request._id || request.id || `pending-${index}`}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }}
              >
                <ConsentCard
                  request={request}
                  onApprove={() => handleApprove(request)}
                  onDeny={() => handleDeny(request)}
                  loading={processingId === (request._id || request.id)}
                />
              </Animated.View>
            ))
          )}
        </View>

        {/* History */}
        {historicalRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 History</Text>
            </View>
            {historicalRequests.map((request, index) => (
              <View key={request._id || request.id || `history-${index}`} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyRequester}>{request.requesterName}</Text>
                  <View style={[
                    styles.historyBadge,
                    { backgroundColor: request.status === 'approved' 
                      ? COLORS.success + '20' 
                      : COLORS.error + '20' 
                    }
                  ]}>
                    <Text style={[
                      styles.historyBadgeText,
                      { color: request.status === 'approved' 
                        ? COLORS.success 
                        : COLORS.error 
                      }
                    ]}>
                      {(request.status || 'UNKNOWN').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyRecord}>{request.recordType || 'Unknown'}</Text>
                <Text style={styles.historyDate}>
                  {(request.approvedAt || request.deniedAt) ? new Date(request.approvedAt || request.deniedAt).toLocaleString() : 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <LoadingOverlay visible={loading} message={loadingMessage} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
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
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyRequester: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  historyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyRecord: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
});
