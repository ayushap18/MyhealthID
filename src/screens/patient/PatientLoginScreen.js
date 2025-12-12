import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';

import { web3Service } from '../../services/web3Service';

export default function PatientLoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showWalletLogin, setShowWalletLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await login(email.toLowerCase().trim(), password);
    setLoading(false);

    if (result.success) {
      navigation.replace('PatientDashboard');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const handleWalletConnect = async () => {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter your Private Key');
      return;
    }

    // Validate private key format
    const pkTrimmed = privateKey.trim();
    if (!pkTrimmed.startsWith('0x') && pkTrimmed.length !== 66 && pkTrimmed.length !== 64) {
      Alert.alert('Invalid Key', 'Private key should be 64 hex characters (with or without 0x prefix)');
      return;
    }

    setLoading(true);
    try {
      await web3Service.init();
      const wallet = await web3Service.connectWallet(pkTrimmed);
      
      Alert.alert(
        '✅ Wallet Connected', 
        `Address: ${wallet.address.substring(0, 10)}...${wallet.address.substring(38)}\nBalance: ${wallet.balance} ETH`,
        [
          {
            text: 'Continue',
            onPress: async () => {
              // Try to login with demo credentials for UI purposes
              // In production, you'd look up the user by wallet address
              const result = await login('jane.smith@example.com', 'Pilot@2024');
              if (result.success) {
                navigation.replace('PatientDashboard');
              } else {
                Alert.alert('Notice', 'Wallet connected but no linked account found. Using demo mode.');
                navigation.replace('PatientDashboard');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Wallet Error', error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.navy, '#0A1F47']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <Text style={styles.title}>Patient Login</Text>
            <Text style={styles.subtitle}>Access your health records</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <Button
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <TouchableOpacity 
              style={{ marginTop: 20, alignItems: 'center' }}
              onPress={() => setShowWalletLogin(!showWalletLogin)}
            >
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                {showWalletLogin ? 'Hide Wallet Login' : '🔑 Connect with Private Key'}
              </Text>
            </TouchableOpacity>

            {showWalletLogin && (
              <View style={{ marginTop: 15, padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Private Key (Sepolia)</Text>
                <TextInput
                  style={[styles.input, { fontSize: 12 }]}
                  placeholder="0x..."
                  placeholderTextColor={COLORS.gray}
                  value={privateKey}
                  onChangeText={setPrivateKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <Button
                  title="Connect Wallet"
                  onPress={handleWalletConnect}
                  loading={loading}
                  style={{ marginTop: 10, backgroundColor: '#E67E22' }}
                />
              </View>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PatientRegister')}
                disabled={loading}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loginButton: {
    marginTop: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
