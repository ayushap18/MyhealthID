import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, formatDateTime } from '../../utils/mockData';
import { Header } from '../../components/Common';

export default function RecordDetailScreen({ route, navigation }) {
  const { record } = route.params;

  return (
    <View style={styles.container}>
      <Header
        title="Record Details"
        subtitle="Blockchain-verified medical record"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Record Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{record.type}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{record.title}</Text>

        {/* Hospital Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Medical Facility</Text>
          <Text style={styles.infoValue}>{record.hospitalName}</Text>
        </View>

        {/* Record Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Record ID:</Text>
            <Text style={styles.detailValue}>{record.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Patient ID:</Text>
            <Text style={styles.detailValue}>{record.patientId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Upload Date:</Text>
            <Text style={styles.detailValue}>{formatDateTime(record.uploadDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File Size:</Text>
            <Text style={styles.detailValue}>{record.fileSize || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={[styles.statusText, { color: COLORS.success }]}>
                {(record.status || 'VERIFIED').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Blockchain Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blockchain Data</Text>
          
          <View style={styles.blockchainCard}>
            <Text style={styles.blockchainLabel}>IPFS CID</Text>
            <Text style={styles.blockchainValue}>{record.cid || record.ipfsCID || 'N/A'}</Text>
          </View>

          <View style={styles.blockchainCard}>
            <Text style={styles.blockchainLabel}>Content Hash (SHA-256)</Text>
            <Text style={styles.blockchainValue}>{record.encryptionHash || 'N/A'}</Text>
          </View>

          {record.transactionHash && (
            <View style={styles.blockchainCard}>
              <Text style={styles.blockchainLabel}>Transaction Hash</Text>
              <Text style={styles.blockchainValue}>{record.transactionHash}</Text>
            </View>
          )}

          {record.blockNumber && (
            <View style={styles.blockchainCard}>
              <Text style={styles.blockchainLabel}>Block Number</Text>
              <Text style={styles.blockchainValue}>{record.blockNumber}</Text>
            </View>
          )}
        </View>

        {/* Verification Status */}
        <View style={styles.verificationCard}>
          <Text style={styles.verificationIcon}>✓</Text>
          <View style={styles.verificationContent}>
            <Text style={styles.verificationTitle}>Blockchain Verified</Text>
            <Text style={styles.verificationText}>
              This record has been verified and anchored on the Ethereum Sepolia blockchain. 
              The content hash ensures data integrity and authenticity.
            </Text>
          </View>
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
  typeBadge: {
    backgroundColor: COLORS.teal + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  typeText: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockchainCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blockchainLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 8,
  },
  blockchainValue: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  verificationCard: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  verificationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  verificationText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
