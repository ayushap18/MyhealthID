// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - QR Health Card Screen
// Full-screen digital health card with QR code
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { authStorage } from '../../services/apiService';
import QRHealthCard from '../../components/QRHealthCard';
import logger from '../../utils/logger';

export default function QRHealthCardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await authStorage.getCurrentUser();
      setUser(storedUser);
    } catch (error) {
      logger.error('QRHealthCardScreen', 'Error loading user', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Card</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.descTitle}>Your Digital Health Card</Text>
            <Text style={styles.descText}>
              Present this card at any MyHealthID-enabled healthcare facility for instant verification and secure access to your medical records.
            </Text>
          </View>

          {/* QR Health Card */}
          <View style={styles.cardSection}>
            {!loading && <QRHealthCard user={user} showShare={true} />}
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🔒</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Secure & Private</Text>
                <Text style={styles.infoText}>
                  Your QR code contains only your Health ID. Records are accessed only with your consent.
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⛓️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Blockchain Verified</Text>
                <Text style={styles.infoText}>
                  Every access is recorded on blockchain for complete transparency and audit trail.
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🌐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Works Anywhere</Text>
                <Text style={styles.infoText}>
                  Compatible with all MyHealthID-enabled hospitals and clinics nationwide.
                </Text>
              </View>
            </View>
          </View>

          {/* Usage Instructions */}
          <View style={styles.usageSection}>
            <Text style={styles.usageTitle}>How to Use</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Open this card at the hospital registration desk</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Let them scan the QR code on your phone</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Approve the access request notification</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>Your records are securely shared with the provider</Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backText: {
    color: Colors.text,
    fontSize: Typography.body,
  },
  headerTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.xl,
  },
  description: {
    marginBottom: Spacing.xl,
  },
  descTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  descText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardSection: {
    marginBottom: Spacing.xxl,
  },
  infoSection: {
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  usageSection: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  usageTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.patient,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: '#000',
    fontWeight: Typography.bold,
    fontSize: Typography.caption,
  },
  stepText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.caption,
  },
  spacer: {
    height: 40,
  },
});
