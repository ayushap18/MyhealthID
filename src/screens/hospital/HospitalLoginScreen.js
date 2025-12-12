import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, MOCK_HOSPITALS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { Button } from '../../components/Button';

export default function HospitalLoginScreen({ navigation }) {
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffId.trim()) {
      Alert.alert('Error', 'Please enter your Staff ID');
      return;
    }

    setLoading(true);

    // Simulate authentication
    setTimeout(async () => {
      const hospital = MOCK_HOSPITALS.find(h => h.staffId === staffId.trim());
      
      if (hospital) {
        await storageService.setCurrentUser({
          role: 'hospital',
          data: hospital,
        });
        setLoading(false);
        navigation.replace('HospitalDashboard');
      } else {
        setLoading(false);
        Alert.alert('Login Failed', 'Invalid Staff ID. Try: STAFF001 or STAFF002');
      }
    }, 1000);
  };

  const handleQuickLogin = async (staffId) => {
    setStaffId(staffId);
    const hospital = MOCK_HOSPITALS.find(h => h.staffId === staffId);
    await storageService.setCurrentUser({
      role: 'hospital',
      data: hospital,
    });
    navigation.replace('HospitalDashboard');
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
            <Text style={styles.icon}>🏥</Text>
          </View>
          <Text style={styles.title}>Hospital Staff Login</Text>
          <Text style={styles.subtitle}>Access the medical records upload portal</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Staff ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your staff ID"
              placeholderTextColor={COLORS.gray}
              value={staffId}
              onChangeText={setStaffId}
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
                title="Apollo Diagnostics"
                variant="outline"
                onPress={() => handleQuickLogin('STAFF001')}
                style={styles.demoButton}
              />
              <Button
                title="Max Healthcare"
                variant="outline"
                onPress={() => handleQuickLogin('STAFF002')}
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
