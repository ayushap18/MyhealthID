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

export default function HospitalDashboardScreen({ navigation }) {
  const [hospital, setHospital] = useState(null);
  const [uploadedRecords, setUploadedRecords] = useState([]);

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
    if (currentUser && currentUser.role === 'hospital') {
      setHospital(currentUser.data);

      const allRecords = await storageService.getRecords();
      const hospitalRecords = allRecords?.filter(
        r => r.hospitalName === currentUser.data.name
      ) || [];
      setUploadedRecords(hospitalRecords);
    }
  };

  const handleLogout = async () => {
    await storageService.clearCurrentUser();
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelector' }],
    });
  };

  if (!hospital) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Hospital Portal"
        subtitle={hospital.name}
        rightAction={
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Hospital Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Staff Member</Text>
          <Text style={styles.infoValue}>{hospital.staffName}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Staff ID</Text>
              <Text style={styles.infoItemValue}>{hospital.staffId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Registration</Text>
              <Text style={styles.infoItemValue}>
                {hospital.registrationNumber ? hospital.registrationNumber.substring(0, 15) + '...' : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Upload Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Medical Record</Text>
          <Button
            title="📄 Upload New Record"
            onPress={() => navigation.navigate('UploadRecord')}
          />
        </View>

        {/* Recent Uploads */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Uploads</Text>
          <Text style={styles.sectionSubtitle}>
            {uploadedRecords.length} records uploaded to blockchain
          </Text>

          {uploadedRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📤</Text>
              <Text style={styles.emptyText}>No records uploaded yet</Text>
            </View>
          ) : (
            uploadedRecords.map((record, index) => (
              <View key={record.recordId || record._id || `upload-${index}`} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordType}>{record.type || 'Unknown'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ ON-CHAIN</Text>
                  </View>
                </View>
                <Text style={styles.recordTitle}>{record.title || 'Untitled'}</Text>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordDetail}>
                    Patient: {record.patientId || 'N/A'}
                  </Text>
                  <Text style={styles.recordDetail}>
                    {record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.recordMeta}>
                  <Text style={styles.recordMetaText}>
                    CID: {(record.cid || record.ipfsCID || 'N/A').substring(0, 30)}...
                  </Text>
                </View>
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
    marginBottom: 32,
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
  recordCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordType: {
    fontSize: 12,
    color: COLORS.gray,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordDetail: {
    fontSize: 14,
    color: COLORS.gray,
  },
  recordMeta: {
    marginTop: 4,
  },
  recordMetaText: {
    fontSize: 11,
    color: COLORS.gray,
    fontFamily: 'monospace',
  },
});
