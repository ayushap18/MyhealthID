// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - QR Health Card Component
// Digital health identity card with scannable QR code
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius } from '../theme';
import logger from '../utils/logger';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

export default function QRHealthCard({ 
  user, 
  compact = false, 
  showShare = true,
  onPress,
}) {
  const [flipAnim] = useState(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const shareCard = async () => {
    try {
      const message = `🏥 MyHealthID Card\n\n` +
        `Name: ${user?.name || 'Patient'}\n` +
        `Health ID: ${user?.healthId || user?.patientId || 'MHID-XXXXXX'}\n` +
        `Verified: ✅\n\n` +
        `Scan this at any MyHealthID-enabled hospital for secure record access.`;

      await Share.share({
        message,
        title: 'My Health Card',
      });
    } catch (error) {
      logger.error('QRHealthCard', 'Share failed', error);
    }
  };

  const qrData = JSON.stringify({
    type: 'HEALTH_CARD',
    patientId: user?.patientId || user?._id,
    healthId: user?.healthId || `MHID-${Date.now().toString(36).toUpperCase()}`,
    name: user?.name,
    verified: true,
    timestamp: new Date().toISOString(),
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  if (compact) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={styles.compactCard}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1E3A5F', '#0D1F33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactQR}>
            <QRCode
              value={qrData}
              size={50}
              color="#FFFFFF"
              backgroundColor="transparent"
            />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle}>Health Card</Text>
            <Text style={styles.compactId}>
              {user?.healthId || `MHID-${(user?.patientId || '').slice(-6).toUpperCase()}`}
            </Text>
          </View>
          <Text style={styles.compactArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={flipCard} activeOpacity={0.95}>
        <View style={styles.cardWrapper}>
          {/* Front of Card */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <LinearGradient
              colors={['#1E3A5F', '#0D1F33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>MyHealthID</Text>
                  <Text style={styles.cardSubtitle}>Digital Health Card</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.cardBody}>
                <View style={styles.qrSection}>
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={qrData}
                      size={80}
                      color="#FFFFFF"
                      backgroundColor="transparent"
                    />
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {user?.name || 'Patient Name'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Health ID</Text>
                    <Text style={styles.healthId}>
                      {user?.healthId || `MHID-${(user?.patientId || Date.now().toString()).slice(-8).toUpperCase()}`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Tap to flip • Blockchain Secured</Text>
                <Text style={styles.footerIcon}>🔗</Text>
              </View>

              {/* Decorative elements */}
              <View style={styles.decoration1} />
              <View style={styles.decoration2} />
            </LinearGradient>
          </Animated.View>

          {/* Back of Card */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <LinearGradient
              colors={['#0D1F33', '#1E3A5F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.backContent}>
                <View style={styles.largQrWrapper}>
                  <QRCode
                    value={qrData}
                    size={150}
                    color="#FFFFFF"
                    backgroundColor="transparent"
                  />
                </View>
                <Text style={styles.backTitle}>Scan for Health Records</Text>
                <Text style={styles.backSubtitle}>
                  Present this QR code at any MyHealthID-enabled healthcare facility
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Tap to flip back</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </TouchableOpacity>

      {showShare && (
        <TouchableOpacity style={styles.shareButton} onPress={shareCard}>
          <Text style={styles.shareButtonText}>📤 Share Health Card</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardGradient: {
    flex: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(0,255,136,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.5)',
  },
  verifiedText: {
    color: '#00FF88',
    fontSize: Typography.caption - 2,
    fontWeight: Typography.semibold,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  qrSection: {
    marginRight: Spacing.lg,
  },
  qrWrapper: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.md,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.caption - 2,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: '#fff',
    marginTop: 2,
  },
  healthId: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: '#00AAFF',
    letterSpacing: 1,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: Typography.caption - 2,
    color: 'rgba(255,255,255,0.4)',
  },
  footerIcon: {
    fontSize: 14,
  },
  decoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0,170,255,0.1)',
  },
  decoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,255,136,0.05)',
  },
  backContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largQrWrapper: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  backTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  backSubtitle: {
    fontSize: Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  shareButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.medium,
  },
  // Compact styles
  compactCard: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  compactQR: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.xs,
    borderRadius: Radius.sm,
  },
  compactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  compactTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
  compactId: {
    fontSize: Typography.caption,
    color: '#00AAFF',
  },
  compactArrow: {
    fontSize: Typography.h3,
    color: 'rgba(255,255,255,0.4)',
  },
});
