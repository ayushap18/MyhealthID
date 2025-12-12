import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/mockData';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.buttonContainer, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? [COLORS.gray, COLORS.gray] : [COLORS.teal, COLORS.tealDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              {icon}
              <Text style={styles.primaryButtonText}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.secondaryButton, disabled && styles.disabledButton, style]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.teal} />
        ) : (
          <>
            {icon}
            <Text style={styles.secondaryButtonText}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outlineButton, disabled && styles.disabledButton, style]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.navy} />
        ) : (
          <>
            {icon}
            <Text style={styles.outlineButtonText}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
