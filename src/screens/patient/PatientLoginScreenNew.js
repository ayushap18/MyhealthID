import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { THEME, SPACING, RADIUS } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

export default function PatientLoginScreen({ navigation }) {
  const { login, connectWallet } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [focusedInput, setFocusedInput] = useState(null);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Header entrance
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

    // Form entrance
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(formTranslateY, {
        toValue: 0,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'email' ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animateSuccess = () => {
    Animated.spring(successScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      shakeForm();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.toLowerCase().trim(), password);
      if (result.success) {
        animateSuccess();
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'PatientDashboard' }],
          });
        }, 500);
      } else {
        shakeForm();
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      shakeForm();
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!privateKey) {
      shakeForm();
      Alert.alert('Error', 'Please enter your private key');
      return;
    }

    setWalletLoading(true);
    try {
      const wallet = await connectWallet(privateKey.trim());
      if (wallet) {
        animateSuccess();
        Alert.alert(
          '🎉 Wallet Connected!',
          `Address: ${wallet.address.substring(0, 10)}...${wallet.address.substring(38)}\nBalance: ${wallet.balance} ETH`,
          [{ text: 'Continue', onPress: () => {} }]
        );
      }
    } catch (error) {
      shakeForm();
      Alert.alert('Connection Failed', error.message || 'Invalid private key');
    } finally {
      setWalletLoading(false);
    }
  };

  const tabTranslateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2 - SPACING.lg - 8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.background, THEME.backgroundSecondary, THEME.backgroundTertiary]}
        style={styles.background}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

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
                <Text style={styles.logoIcon}>👤</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Patient Portal</Text>
            <Text style={styles.subtitle}>Access your health records securely</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formOpacity,
                transform: [
                  { translateY: formTranslateY },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  { transform: [{ translateX: tabTranslateX }] },
                ]}
              >
                <LinearGradient
                  colors={THEME.gradients.primary}
                  style={styles.tabIndicatorGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab('email')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                  📧 Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab('wallet')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
                  🔐 Wallet
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'email' ? (
              <>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                  ]}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="jane.smith@example.com"
                      placeholderTextColor={THEME.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputWrapperFocused,
                  ]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor={THEME.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.showHideText}>
                        {showPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Demo credentials hint */}
                <View style={styles.hintContainer}>
                  <Text style={styles.hintTitle}>🎯 Demo Credentials</Text>
                  <Text style={styles.hintText}>jane.smith@example.com / Pilot@2024</Text>
                </View>

                {/* Login Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    onPress={handleEmailLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={THEME.gradients.primary}
                      style={styles.loginButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <ActivityIndicator color={THEME.text} />
                      ) : (
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
            ) : (
              <>
                {/* Wallet Login */}
                <View style={styles.walletInfo}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                    style={styles.walletInfoBg}
                  >
                    <Text style={styles.walletInfoIcon}>⛓️</Text>
                    <Text style={styles.walletInfoTitle}>Blockchain Connection</Text>
                    <Text style={styles.walletInfoText}>
                      Connect with your Ethereum wallet to access blockchain features
                    </Text>
                  </LinearGradient>
                </View>

                {/* Private Key Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Private Key</Text>
                  <View style={[
                    styles.inputWrapper,
                    styles.inputWrapperMultiline,
                    focusedInput === 'privateKey' && styles.inputWrapperFocused,
                  ]}>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      placeholder="0x..."
                      placeholderTextColor={THEME.textMuted}
                      value={privateKey}
                      onChangeText={setPrivateKey}
                      secureTextEntry
                      multiline
                      numberOfLines={3}
                      onFocus={() => setFocusedInput('privateKey')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                  <Text style={styles.warningText}>
                    ⚠️ Never share your private key. This is for demo purposes only.
                  </Text>
                </View>

                {/* Connect Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    onPress={handleWalletLogin}
                    disabled={walletLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={THEME.gradients.secondary}
                      style={styles.loginButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {walletLoading ? (
                        <ActivityIndicator color={THEME.text} />
                      ) : (
                        <Text style={styles.loginButtonText}>Connect Wallet</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PatientRegister')}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <Animated.View
        style={[
          styles.successOverlay,
          {
            opacity: successScale,
            transform: [{ scale: successScale }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
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
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    bottom: 100,
    left: -100,
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  backButtonText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
  },
  formContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.card,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: 30,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  tabIndicatorGradient: {
    flex: 1,
    borderRadius: RADIUS.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  tabTextActive: {
    color: THEME.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
    paddingHorizontal: SPACING.md,
  },
  inputWrapperFocused: {
    borderColor: THEME.primary,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: THEME.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  showHideText: {
    fontSize: 20,
    padding: SPACING.sm,
  },
  warningText: {
    fontSize: 12,
    color: THEME.warning,
    marginTop: 8,
    marginLeft: 4,
  },
  hintContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  walletInfo: {
    marginBottom: 24,
  },
  walletInfoBg: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  walletInfoIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  walletInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  walletInfoText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    paddingVertical: 18,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 6,
  },
  registerText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 60,
  },
});
