import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_INSURERS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

export default function InsurerLoginScreenNew({ navigation }) {
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  // Floating elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  // Radar animation
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.medium,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Radar sweep animation
    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Floating animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Staggered card animations
    setTimeout(() => {
      Animated.spring(card1Anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    }, 500);
    setTimeout(() => {
      Animated.spring(card2Anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    }, 650);
  }, []);

  const handleInputFocus = (focused) => {
    setInputFocused(focused);
    Animated.spring(inputBorderAnim, {
      toValue: focused ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!agentId.trim()) {
      shakeInput();
      Alert.alert('Error', 'Please enter your Agent ID');
      return;
    }

    setLoading(true);
    Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }).start();

    setTimeout(async () => {
      const insurer = MOCK_INSURERS.find(i => i.agentId === agentId.trim());

      if (insurer) {
        await storageService.setCurrentUser({
          role: 'insurer',
          data: insurer,
        });
        setLoading(false);
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        navigation.replace('InsurerDashboard');
      } else {
        setLoading(false);
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        shakeInput();
        Alert.alert('Login Failed', 'Invalid Agent ID. Try: AGENT001 or AGENT002');
      }
    }, 1200);
  };

  const handleQuickLogin = async (agentId) => {
    setAgentId(agentId);
    const insurer = MOCK_INSURERS.find(i => i.agentId === agentId);
    await storageService.setCurrentUser({
      role: 'insurer',
      data: insurer,
    });
    navigation.replace('InsurerDashboard');
  };

  const inputBorderColor = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.2)', THEME.warning],
  });

  const floatY1 = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floatY2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const radarRotate = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[THEME.background, '#1A0D2E', '#0D1428']}
      style={styles.container}
    >
      {/* Floating Background Elements */}
      <Animated.View style={[styles.floatingElement, styles.float1, { transform: [{ translateY: floatY1 }] }]}>
        <LinearGradient
          colors={[THEME.warning + '40', THEME.warning + '10']}
          style={styles.floatGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.floatingElement, styles.float2, { transform: [{ translateY: floatY2 }] }]}>
        <LinearGradient
          colors={[THEME.primary + '40', THEME.primary + '10']}
          style={styles.floatGradient}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Animated Icon with Radar Effect */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[THEME.warning, '#D97706']}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>🔍</Text>
              </LinearGradient>
              <Animated.View
                style={[
                  styles.radarSweep,
                  { transform: [{ rotate: radarRotate }] },
                ]}
              >
                <View style={styles.radarLine} />
              </Animated.View>
              <Animated.View style={[styles.iconPulse, { transform: [{ scale: pulseAnim }] }]} />
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Verification Portal</Text>
            <Text style={styles.subtitle}>Verify patient records with blockchain</Text>

            {/* Input Field */}
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  transform: [{ translateX: shakeAnim }],
                  borderColor: inputBorderColor,
                },
              ]}
            >
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Agent ID"
                placeholderTextColor={THEME.textSecondary}
                value={agentId}
                onChangeText={setAgentId}
                onFocus={() => handleInputFocus(true)}
                onBlur={() => handleInputFocus(false)}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </Animated.View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonLoading]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? [THEME.card, THEME.card] : [THEME.warning, '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginGradient}
                >
                  {loading ? (
                    <Text style={styles.loginText}>Verifying...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginText}>Login</Text>
                      <Text style={styles.loginArrow}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Demo Section */}
            <View style={styles.demoSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Quick Demo Access</Text>
                <View style={styles.divider} />
              </View>

              {/* Demo Cards */}
              <Animated.View
                style={[
                  styles.demoCard,
                  {
                    opacity: card1Anim,
                    transform: [{ scale: card1Anim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.demoCardInner}
                  onPress={() => handleQuickLogin('AGENT001')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[THEME.card, '#1A2A4A']}
                    style={styles.demoGradient}
                  >
                    <View style={styles.demoIconWrapper}>
                      <Text style={styles.demoIcon}>🛡️</Text>
                    </View>
                    <View style={styles.demoInfo}>
                      <Text style={styles.demoName}>HDFC Health Insurance</Text>
                      <Text style={styles.demoId}>AGENT001</Text>
                    </View>
                    <View style={styles.demoArrow}>
                      <Text style={styles.demoArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={[
                  styles.demoCard,
                  {
                    opacity: card2Anim,
                    transform: [{ scale: card2Anim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.demoCardInner}
                  onPress={() => handleQuickLogin('AGENT002')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[THEME.card, '#1A2A4A']}
                    style={styles.demoGradient}
                  >
                    <View style={styles.demoIconWrapper}>
                      <Text style={styles.demoIcon}>⭐</Text>
                    </View>
                    <View style={styles.demoInfo}>
                      <Text style={styles.demoName}>Star Health Insurance</Text>
                      <Text style={styles.demoId}>AGENT002</Text>
                    </View>
                    <View style={styles.demoArrow}>
                      <Text style={styles.demoArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Security Features */}
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Blockchain Verified</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Consent Based</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 200,
    overflow: 'hidden',
  },
  float1: {
    top: -50,
    right: -100,
    width: 250,
    height: 250,
  },
  float2: {
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
  },
  floatGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  backButton: {
    marginBottom: SPACING.xl,
  },
  backText: {
    color: THEME.text,
    fontSize: TYPOGRAPHY.body,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    marginBottom: SPACING.xl,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  icon: {
    fontSize: 48,
  },
  radarSweep: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarLine: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: THEME.warning + '60',
    right: 0,
    top: '50%',
    marginTop: -1,
    transformOrigin: 'left center',
  },
  iconPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: THEME.warning + '40',
  },
  title: {
    fontSize: TYPOGRAPHY.h1,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body,
    color: THEME.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
    ...SHADOWS.medium,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: THEME.text,
  },
  loginButton: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  loginButtonLoading: {
    opacity: 0.8,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minWidth: width - SPACING.lg * 2,
  },
  loginText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '700',
    color: THEME.text,
  },
  loginArrow: {
    fontSize: TYPOGRAPHY.body,
    color: THEME.text,
    marginLeft: SPACING.sm,
  },
  demoSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    color: THEME.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    marginHorizontal: SPACING.md,
  },
  demoCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  demoCardInner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  demoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  demoIcon: {
    fontSize: 20,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  demoId: {
    fontSize: TYPOGRAPHY.caption,
    color: THEME.warning,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  demoArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.warning + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoArrowText: {
    fontSize: 18,
    color: THEME.warning,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card + '80',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  featureIcon: {
    fontSize: 14,
    color: THEME.success,
    marginRight: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
});
