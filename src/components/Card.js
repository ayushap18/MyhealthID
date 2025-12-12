import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/mockData';

export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, style]}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export const RecordCard = ({ record, onPress }) => {
  const statusColors = {
    verified: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.error,
  };

  return (
    <Card onPress={onPress} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Text style={styles.recordType}>{record.type || 'Unknown'}</Text>
          <Text style={styles.recordTitle}>{record.title || 'Untitled'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[record.status || 'verified'] || COLORS.green) + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[record.status || 'verified'] || COLORS.green }]}>
            {(record.status || 'VERIFIED').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.recordDetails}>
        <Text style={styles.recordHospital}>{record.hospitalName || 'Unknown Hospital'}</Text>
        <Text style={styles.recordDate}>{record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <View style={styles.recordMeta}>
        <Text style={styles.recordMetaText}>Size: {record.fileSize || 'N/A'}</Text>
        <Text style={styles.recordMetaText}>CID: {(record.cid || record.ipfsCID || '').substring(0, 20) || 'N/A'}...</Text>
      </View>
    </Card>
  );
};

export const ConsentCard = ({ request, onApprove, onDeny }) => {
  return (
    <Card style={styles.consentCard}>
      <View style={styles.consentHeader}>
        <Text style={styles.consentTitle}>Access Request</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>PENDING</Text>
        </View>
      </View>
      <Text style={styles.consentRequester}>{request.requesterName}</Text>
      <Text style={styles.consentDetails}>
        Requesting access to: <Text style={styles.consentBold}>{request.recordType}</Text>
      </Text>
      <Text style={styles.consentExpiry}>
        Valid for {request.expiryHours} hours after approval
      </Text>
      <View style={styles.consentActions}>
        <TouchableOpacity
          onPress={onDeny}
          style={[styles.consentButton, styles.denyButton]}
        >
          <Text style={styles.denyButtonText}>Deny</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApprove}
          style={[styles.consentButton, styles.approveButton]}
        >
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export const AuditLogCard = ({ log }) => {
  const actionColors = {
    VIEW: COLORS.teal,
    UPLOAD: COLORS.success,
    APPROVE: COLORS.success,
    DENY: COLORS.error,
  };

  return (
    <Card style={styles.auditCard}>
      <View style={styles.auditHeader}>
        <View style={[styles.actionBadge, { backgroundColor: actionColors[log.action] + '20' }]}>
          <Text style={[styles.actionText, { color: actionColors[log.action] }]}>
            {log.action}
          </Text>
        </View>
        <Text style={styles.auditTime}>
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.auditAccessor}>{log.accessorName}</Text>
      <Text style={styles.auditType}>{log.accessorType}</Text>
      {log.verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified on blockchain</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Record Card
  recordCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  recordType: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordHospital: {
    fontSize: 14,
    color: COLORS.navy,
  },
  recordDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  recordMeta: {
    gap: 4,
  },
  recordMetaText: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: 'monospace',
  },
  // Consent Card
  consentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.warning,
  },
  consentRequester: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  consentDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  consentBold: {
    fontWeight: '600',
    color: COLORS.navy,
  },
  consentExpiry: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 16,
  },
  consentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  consentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  denyButton: {
    backgroundColor: COLORS.lightGray,
  },
  denyButtonText: {
    color: COLORS.navy,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // Audit Log Card
  auditCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.navy,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  auditTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  auditAccessor: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  auditType: {
    fontSize: 14,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  verifiedBadge: {
    marginTop: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
});
