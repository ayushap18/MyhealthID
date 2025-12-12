import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, MOCK_INSURERS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { Button } from '../../components/Button';

export default function InsurerLoginScreen({ navigation }) {
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!agentId.trim()) {
      Alert.alert('Error', 'Please enter your Agent ID');
      return;
    }

    setLoading(true);

    // Simulate authentication
    setTimeout(async () => {
      const insurer = MOCK_INSURERS.find(i => i.agentId === agentId.trim());
      
      if (insurer) {
        await storageService.setCurrentUser({
          role: 'insurer',
          data: insurer,
        });
        setLoading(false);
        navigation.replace('InsurerDashboard');
      } else {
        setLoading(false);
        Alert.alert('Login Failed', 'Invalid Agent ID. Try: AGENT001 or AGENT002');
      }
    }, 1000);
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

  return (
    <LinearGradient
      colors={[COLORS.navy, '#0A1F47']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.backButton} onPress={() => navigation.goBack()}>
            ← Back
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔍</Text>
          </View>
          <Text style={styles.title}>Insurance Verifier Login</Text>
          <Text style={styles.subtitle}>Access patient record verification portal</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Agent ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your agent ID"
              placeholderTextColor={COLORS.gray}
              value={agentId}
              onChangeText={setAgentId}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Demo Quick Login */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Demo Quick Login</Text>
            <View style={styles.demoButtons}>
              <Button
                title="HDFC Health Insurance"
                variant="outline"
                onPress={() => handleQuickLogin('AGENT001')}
                style={styles.demoButton}
              />
              <Button
                title="Star Health Insurance"
                variant="outline"
                onPress={() => handleQuickLogin('AGENT002')}
                style={styles.demoButton}
              />
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButton: {
    marginBottom: 40,
  },
  demoSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButtons: {
    gap: 12,
  },
  demoButton: {
    borderColor: COLORS.white,
  },
});
