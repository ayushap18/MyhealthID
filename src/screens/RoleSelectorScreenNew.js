import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const roles = [
  {
    id: 'patient',
    icon: '👤',
    title: 'Patient',
    description: 'View records, manage consent, track access history',
    gradient: ['#6366F1', '#8B5CF6'],
    features: ['Health Records', 'Consent Control', 'Audit Logs'],
  },
  {
    id: 'hospital',
    icon: '🏥',
    title: 'Hospital Staff',
    description: 'Upload encrypted medical records to blockchain',
    gradient: ['#14B8A6', '#06B6D4'],
    features: ['Upload Records', 'Blockchain Verify', 'Patient Search'],
  },
  {
    id: 'insurer',
    icon: '🔍',
    title: 'Insurance Verifier',
    description: 'Request access and verify patient records',
    gradient: ['#F472B6', '#EC4899'],
    features: ['Request Access', 'Verify Claims', 'Audit Trail'],
  },
];

export default function RoleSelectorScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(50)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardScales = useRef(roles.map(() => new Animated.Value(0.9))).current;
  const cardOpacities = useRef(roles.map(() => new Animated.Value(0))).current;
  const backgroundShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Background animation
    Animated.loop(
      Animated.timing(backgroundShift, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Header animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Cards staggered animation
    roles.forEach((_, index) => {
      Animated.parallel([
        Animated.spring(cardScales[index], {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: 300 + index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacities[index], {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 150,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Footer animation
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleRolePress = (role) => {
    setSelectedRole(role.id);
    
    // Animate selection
    setTimeout(() => {
      if (role.id === 'patient') {
        navigation.navigate('PatientLogin');
      } else if (role.id === 'hospital') {
        navigation.navigate('HospitalLogin');
      } else if (role.id === 'insurer') {
        navigation.navigate('InsurerLogin');
      }
      setSelectedRole(null);
    }, 300);
  };

  const backgroundRotate = backgroundShift.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.background, THEME.backgroundSecondary, THEME.backgroundTertiary]}
        style={styles.background}
      />

      {/* Animated Background Decoration */}
      <Animated.View
        style={[
          styles.backgroundDecor,
          { transform: [{ rotate: backgroundRotate }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
          style={styles.decorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={THEME.gradients.primary}
            style={styles.logo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>🏥</Text>
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.appName}>MyHealthID</Text>
        <Text style={styles.tagline}>Decentralized Health Records</Text>
        
        {/* Tech Stack Pills */}
        <View style={styles.techStack}>
          <View style={styles.techPill}>
            <Text style={styles.techPillText}>⛓️ Ethereum</Text>
          </View>
          <View style={styles.techPill}>
            <Text style={styles.techPillText}>📦 IPFS</Text>
          </View>
          <View style={styles.techPill}>
            <Text style={styles.techPillText}>🔐 Encrypted</Text>
          </View>
        </View>
      </Animated.View>

      {/* Role Cards */}
      <View style={styles.rolesContainer}>
        <Text style={styles.sectionTitle}>Choose Your Role</Text>
        
        {roles.map((role, index) => (
          <Animated.View
            key={role.id}
            style={[
              {
                opacity: cardOpacities[index],
                transform: [{ scale: cardScales[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleRolePress(role)}
              style={styles.roleCardTouchable}
            >
              <LinearGradient
                colors={selectedRole === role.id ? role.gradient : [THEME.card, THEME.cardHover]}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {/* Icon */}
                <View style={styles.roleIconContainer}>
                  <LinearGradient
                    colors={role.gradient}
                    style={styles.roleIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.roleEmoji}>{role.icon}</Text>
                  </LinearGradient>
                </View>

                {/* Content */}
                <View style={styles.roleContent}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                  
                  {/* Feature Tags */}
                  <View style={styles.featureTags}>
                    {role.features.map((feature, i) => (
                      <View key={i} style={styles.featureTag}>
                        <Text style={styles.featureTagText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <LinearGradient
                    colors={role.gradient}
                    style={styles.arrowBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.arrow}>→</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <View style={styles.footerContent}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>Sepolia Testnet • Live Demo</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundDecor: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    top: -width / 2,
    left: -width / 2,
  },
  decorGradient: {
    flex: 1,
    borderRadius: width,
  },
  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: THEME.textSecondary,
    marginBottom: 20,
  },
  techStack: {
    flexDirection: 'row',
    gap: 8,
  },
  techPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: THEME.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
  },
  techPillText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: SPACING.lg,
    letterSpacing: 0.3,
  },
  roleCardTouchable: {
    marginBottom: SPACING.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...SHADOWS.md,
  },
  roleCardSelected: {
    borderColor: 'transparent',
  },
  roleIconContainer: {
    marginRight: SPACING.md,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  featureTagText: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  arrowContainer: {
    marginLeft: SPACING.sm,
  },
  arrowBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: THEME.text,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: THEME.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.success,
  },
  footerText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
});
