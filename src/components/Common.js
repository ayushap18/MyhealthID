import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/mockData';

export const Header = ({ title, subtitle, onBack, rightAction }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        {rightAction}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
};

export const LoadingOverlay = ({ visible, message = 'Processing...' }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.loadingContainer}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

export const StatusBadge = ({ status, label }) => {
  const statusColors = {
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.teal,
  };

  return (
    <View style={[styles.badge, { backgroundColor: (statusColors[status] || COLORS.teal) + '20' }]}>
      <Text style={[styles.badgeText, { color: statusColors[status] || COLORS.teal }]}>
        {label || (status ? status.toUpperCase() : 'UNKNOWN')}
      </Text>
    </View>
  );
};

export const InfoBox = ({ title, value, icon }) => {
  return (
    <View style={styles.infoBox}>
      {icon && <View style={styles.infoIcon}>{icon}</View>}
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

export const EmptyState = ({ icon, message, action }) => {
  return (
    <View style={styles.emptyState}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </View>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    color: COLORS.teal,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  // Loading Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: COLORS.lightGray,
    borderTopColor: COLORS.teal,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: '500',
  },
  // Status Badge
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
});
