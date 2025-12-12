// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Animated Role Selection Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

const { width, height } = Dimensions.get('window');

const ROLES = [
  {
    id: 'patient',
    icon: '👤',
    title: 'Patient',
    description: 'Access your health records, manage consent, and share data securely',
    color: Colors.patient,
    gradient: ['#00D9FF', '#0891B2'],
    features: ['View Records', 'Manage Consent', 'Share Data'],
    route: 'PatientAuth',
  },
  {
    id: 'hospital',
    icon: '🏥',
    title: 'Healthcare Provider',
    description: 'Upload patient records to blockchain with encryption',
    color: Colors.hospital,
    gradient: ['#10B981', '#059669'],
    features: ['Upload Records', 'Verify Identity', 'Audit Trail'],
    route: 'HospitalAuth',
  },
  {
    id: 'insurer',
    icon: '🔍',
    title: 'Insurance Verifier',
    description: 'Request and verify patient records with consent',
    color: Colors.insurer,
    gradient: ['#F59E0B', '#D97706'],
    features: ['Request Access', 'Verify Records', 'Compliance'],
    route: 'InsurerAuth',
  },
];

const RoleSelector = ({ navigation }) => {
  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-30)).current;
  const cardsOpacity = useRef(ROLES.map(() => new Animated.Value(0))).current;
  const cardsScale = useRef(ROLES.map(() => new Animated.Value(0.9))).current;
  const cardsTranslate = useRef(ROLES.map(() => new Animated.Value(50))).current;
  const decorOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslate, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    ROLES.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(200 + index * 150),
        Animated.parallel([
          Animated.timing(cardsOpacity[index], {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(cardsScale[index], {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardsTranslate[index], {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Decorations
    Animated.timing(decorOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRoleSelect = (role) => {
    // Scale down animation on press
    Animated.sequence([
      Animated.timing(cardsScale[ROLES.findIndex(r => r.id === role.id)], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardsScale[ROLES.findIndex(r => r.id === role.id)], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(role.route);
    });
  };

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background decorations */}
      <Animated.View style={[styles.decorContainer, { opacity: decorOpacity }]}>
        <Animated.View
          style={[
            styles.decorCircle,
            styles.decorCircle1,
            { transform: [{ translateY: floatTranslate }] },
          ]}
        />
        <Animated.View
          style={[
            styles.decorCircle,
            styles.decorCircle2,
            { transform: [{ translateY: Animated.multiply(floatTranslate, -1) }] },
          ]}
        />
      </Animated.View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Choose Your Role</Text>
        <Text style={styles.headerSubtitle}>
          Select how you want to use MyHealthID
        </Text>
      </Animated.View>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        {ROLES.map((role, index) => (
          <Animated.View
            key={role.id}
            style={[
              styles.cardWrapper,
              {
                opacity: cardsOpacity[index],
                transform: [
                  { scale: cardsScale[index] },
                  { translateY: cardsTranslate[index] },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.bgCard, Colors.bgCardHover]}
                style={styles.cardGradient}
              >
                {/* Icon section */}
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={role.gradient}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                  </LinearGradient>
                  
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: role.color + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: role.color }]}>
                        {role.id.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.arrowContainer}>
                    <Text style={[styles.arrow, { color: role.color }]}>→</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.roleDescription}>{role.description}</Text>

                {/* Features */}
                <View style={styles.features}>
                  {role.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <View style={[styles.featureDot, { backgroundColor: role.color }]} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Bottom accent line */}
                <LinearGradient
                  colors={role.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardAccent}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: headerOpacity }]}>
        <Text style={styles.footerText}>
          Powered by <Text style={styles.footerHighlight}>Ethereum</Text> &{' '}
          <Text style={styles.footerHighlight}>IPFS</Text>
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.5,
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: Colors.primary + '10',
  },
  decorCircle2: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -100,
    backgroundColor: Colors.secondary + '10',
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  headerTitle: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  cardWrapper: {
    flex: 1,
    maxHeight: 180,
  },
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  cardGradient: {
    flex: 1,
    padding: Spacing.lg,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleIcon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  roleBadgeText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.semibold,
    letterSpacing: 1,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
  },
  roleDescription: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: Typography.small,
    color: Colors.textMuted,
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  footer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
  },
  footerHighlight: {
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
});

export default RoleSelector;
