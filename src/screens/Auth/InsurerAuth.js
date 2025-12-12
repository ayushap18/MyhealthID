// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Insurer Authentication Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { apiService } from '../../services/apiService';
import logger from '../../utils/logger';

const INSURER_IMAGE = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=640&q=80';

const InsurerAuth = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formSlide = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.9)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
      Animated.timing(imageOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(infoOpacity, { toValue: 1, duration: 450, delay: 250, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const toggleMode = () => {
    Animated.sequence([
      Animated.timing(formSlide, { toValue: 50, duration: 150, useNativeDriver: true }),
      Animated.timing(formSlide, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (!isLogin && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Must contain uppercase, lowercase, number & special character';
    }

    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Company/Agent name is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await apiService.auth.login(
        formData.email.toLowerCase().trim(),
        formData.password
      );

      if (!data?.user || !data?.success) {
        Alert.alert('Login Failed', data?.message || data?.error || 'Invalid credentials');
        return;
      }

      if (data.user.role !== 'insurer') {
        await apiService.auth.logout();
        Alert.alert('Wrong Portal', `This account is registered as ${data.user.role}. Please use the correct login portal.`);
        return;
      }

      navigation.reset({ index: 0, routes: [{ name: 'InsurerDashboard' }] });
    } catch (error) {
      logger.error('InsurerAuth', 'Login error', error);
      Alert.alert('Connection Error', 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await apiService.auth.register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'insurer',
      });

      if (!data?.user || !data?.success) {
        const errorMsg = data?.errors ? data.errors.map(e => e.msg).join('\n') : data?.message || 'Registration failed';
        Alert.alert('Registration Failed', errorMsg);
        return;
      }

      if (data.wallet) {
        Alert.alert('🔍 Verifier Account Created!', `Wallet: ${data.wallet.address.slice(0, 20)}...\n\nRecovery Phrase:\n${data.wallet.mnemonic}\n\nSave this securely!`, [
          { text: 'I Have Saved It', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'InsurerDashboard' }] }) },
        ]);
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'InsurerDashboard' }] });
      }
    } catch (error) {
      logger.error('InsurerAuth', 'Register error', error);
      Alert.alert('Connection Error', 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    if (isLogin) handleLogin();
    else handleRegister();
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['#000000', '#050510', '#0A0A1A']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: headerScale }] }]}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.iconContainer}>
            <Animated.Image
              source={{ uri: INSURER_IMAGE }}
              style={[styles.heroImage, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}
              resizeMode="cover"
            />
          </LinearGradient>
          <Text style={styles.title}>Insurance Verifier</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Agent login portal' : 'Register verifier account'}</Text>
        </Animated.View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleButton, isLogin && styles.toggleActive]} onPress={() => !isLogin && toggleMode()}>
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, !isLogin && styles.toggleActive]} onPress={() => isLogin && toggleMode()}>
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.form, { transform: [{ translateX: formSlide }] }]}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company / Agent Name</Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <TextInput style={styles.input} value={formData.name} onChangeText={(text) => { setFormData({ ...formData, name: text }); if (errors.name) setErrors({ ...errors, name: null }); }} placeholder="Enter name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <TextInput style={styles.input} value={formData.email} onChangeText={(text) => { setFormData({ ...formData, email: text }); if (errors.email) setErrors({ ...errors, email: null }); }} placeholder="Enter your email" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <TextInput style={[styles.input, { flex: 1 }]} value={formData.password} onChangeText={(text) => { setFormData({ ...formData, password: text }); if (errors.password) setErrors({ ...errors, password: null }); }} placeholder="Enter password" placeholderTextColor={Colors.textMuted} secureTextEntry={secureEntry} autoCapitalize="none" />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setSecureEntry(!secureEntry)}>
                <Text style={styles.eyeText}>{secureEntry ? '👁' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                <TextInput style={styles.input} value={formData.confirmPassword} onChangeText={(text) => { setFormData({ ...formData, confirmPassword: text }); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }); }} placeholder="Confirm password" placeholderTextColor={Colors.textMuted} secureTextEntry={secureEntry} autoCapitalize="none" />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>{isLogin ? 'Login' : 'Create Account'}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.infoBox, { opacity: infoOpacity }]}>
            <Text style={styles.infoText}>Insurance verifiers can request and validate patient records securely with consent.</Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  glow: { position: 'absolute', top: -100, left: '50%', marginLeft: -150, width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.insurer },
  scrollContent: { flexGrow: 1, padding: Spacing.xl, paddingTop: 60 },
  backButton: { marginBottom: Spacing.xl },
  backText: { color: Colors.textSecondary, fontSize: Typography.body },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  iconContainer: { width: 72, height: 72, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, ...Shadows.lg },
  heroImage: { width: '100%', height: '100%', borderRadius: Radius.lg },
  title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  toggleContainer: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.xxl },
  toggleButton: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: Radius.md },
  toggleActive: { backgroundColor: Colors.insurer },
  toggleText: { fontSize: Typography.body, color: Colors.textSecondary, fontWeight: Typography.medium },
  toggleTextActive: { color: '#000', fontWeight: Typography.semibold },
  form: { flex: 1 },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  inputError: { borderColor: Colors.error },
  input: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, fontSize: Typography.body, color: Colors.text },
  eyeButton: { padding: Spacing.md },
  eyeText: { fontSize: 18 },
  errorText: { color: Colors.error, fontSize: Typography.small, marginTop: Spacing.xs },
  submitButton: { marginTop: Spacing.lg, borderRadius: Radius.md, overflow: 'hidden', ...Shadows.md },
  submitGradient: { paddingVertical: Spacing.lg, alignItems: 'center' },
  submitText: { fontSize: Typography.body, fontWeight: Typography.semibold, color: '#000' },
  infoBox: { marginTop: Spacing.xxl, padding: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  infoText: { fontSize: Typography.caption, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});

export default InsurerAuth;
