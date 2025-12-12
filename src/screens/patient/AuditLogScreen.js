import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { AuditLogCard } from '../../components/Card';
import { Header, EmptyState } from '../../components/Common';

export default function AuditLogScreen({ navigation }) {
  const [patient, setPatient] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'patient') {
      setPatient(currentUser.data);

      const allLogs = await storageService.getAuditLogs();
      const patientLogs = allLogs?.filter(
        log => log.patientId === currentUser.data.id
      ) || [];
      setAuditLogs(patientLogs);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Audit Log"
        subtitle="Track who accessed your records"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{auditLogs.length}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {auditLogs.filter(l => l.action === 'VIEW').length}
            </Text>
            <Text style={styles.statLabel}>Record Views</Text>
          </View>
        </View>

        {/* Audit Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Timeline</Text>
          {auditLogs.length === 0 ? (
            <EmptyState
              icon="📋"
              message="No activity yet"
            />
          ) : (
            auditLogs.map((log, index) => (
              <AuditLogCard key={log._id || log.recordId || `audit-${index}`} log={log} />
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
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
});
