// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Reusable UI State Components
// Loading, Error, Empty states with consistent styling
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../theme';

/**
 * Full-screen loading state
 */
export const LoadingScreen = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <LinearGradient
      colors={['#000000', '#050510', '#0A0A1A']}
      style={StyleSheet.absoluteFill}
    />
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

/**
 * Inline loading indicator
 */
export const LoadingIndicator = ({ size = 'small', color = Colors.primary }) => (
  <View style={styles.inlineLoading}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

/**
 * Error state with retry button
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again',
  onRetry,
  retryText = 'Retry',
}) => (
  <View style={styles.stateContainer}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateMessage}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>{retryText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Empty state
 */
export const EmptyState = ({
  icon = '📭',
  title = 'No data yet',
  message = 'Nothing to display',
  action,
  actionText = 'Get Started',
}) => (
  <View style={styles.stateContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateMessage}>{message}</Text>
    {action && (
      <TouchableOpacity style={styles.actionButton} onPress={action}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButtonGradient}
        >
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </LinearGradient>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Network error state
 */
export const NetworkError = ({ onRetry }) => (
  <ErrorState
    title="No Connection"
    message="Please check your internet connection and try again"
    onRetry={onRetry}
    retryText="Try Again"
  />
);

/**
 * Card skeleton loader
 */
export const SkeletonCard = ({ width = '100%', height = 100 }) => (
  <View style={[styles.skeleton, { width, height }]}>
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#1a1a2e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  </View>
);

/**
 * List skeleton loader
 */
export const SkeletonList = ({ count = 3 }) => (
  <View style={styles.skeletonList}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} height={80} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  inlineLoading: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  stateTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryButtonText: {
    fontSize: Typography.body,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  actionButton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  actionButtonText: {
    fontSize: Typography.body,
    color: '#000',
    fontWeight: Typography.semibold,
  },
  skeleton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  skeletonList: {
    padding: Spacing.lg,
  },
});

export default {
  LoadingScreen,
  LoadingIndicator,
  ErrorState,
  EmptyState,
  NetworkError,
  SkeletonCard,
  SkeletonList,
};
