import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { Header } from '../../components/Common';
import { Button } from '../../components/Button';

export default function InsurerDashboardScreen({ navigation }) {
  const [insurer, setInsurer] = useState(null);
  const [verifiedRecords, setVerifiedRecords] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'insurer') {
      setInsurer(currentUser.data);

      // Load audit logs where this insurer was the accessor
      const allLogs = await storageService.getAuditLogs();
      const insurerLogs = allLogs?.filter(
        log => log.accessorName === currentUser.data.name && log.action === 'VIEW'
      ) || [];
      setVerifiedRecords(insurerLogs);
    }
  };

  const handleLogout = async () => {
    await storageService.clearCurrentUser();
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelector' }],
    });
  };

  if (!insurer) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Verifier Portal"
        subtitle={insurer.name}
        rightAction={
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Insurer Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Insurance Agent</Text>
          <Text style={styles.infoValue}>{insurer.agentName}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Agent ID</Text>
              <Text style={styles.infoItemValue}>{insurer.agentId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>License</Text>
              <Text style={styles.infoItemValue}>
                {insurer.licenseNumber ? insurer.licenseNumber.substring(0, 15) + '...' : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Access</Text>
          <Button
            title="🔍 Request Patient Record"
            onPress={() => navigation.navigate('RequestAccess')}
          />
        </View>

        {/* Verification Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{verifiedRecords.length}</Text>
            <Text style={styles.statLabel}>Records Verified</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Recent Verifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Verifications</Text>

          {verifiedRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No verifications yet</Text>
            </View>
          ) : (
            verifiedRecords.map((log, index) => (
              <View key={log._id || log.recordId || `log-${index}`} style={styles.verificationCard}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ VERIFIED</Text>
                </View>
                <Text style={styles.verificationPatient}>
                  Patient ID: {log.patientId || 'N/A'}
                </Text>
                <Text style={styles.verificationRecord}>
                  Record ID: {log.recordId || 'N/A'}
                </Text>
                <Text style={styles.verificationDate}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                </Text>
                {log.transactionHash && (
                  <Text style={styles.verificationHash}>
                    Tx: {log.transactionHash.substring(0, 20)}...
                  </Text>
                )}
              </View>
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
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoItem: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.teal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
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
  verificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  verificationPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  verificationRecord: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  verificationDate: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 8,
  },
  verificationHash: {
    fontSize: 11,
    color: COLORS.gray,
    fontFamily: 'monospace',
  },
});
