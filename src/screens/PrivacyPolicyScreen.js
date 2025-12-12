import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/apiService';
import logger from '../utils/logger';

export default function PrivacyPolicyScreen({ navigation }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const response = await apiClient.get('/compliance/privacy-policy');
      setPolicy(response.data);
    } catch (error) {
      logger.error('PrivacyPolicy', 'Load policy error', error);
      // Set default policy if API fails
      setPolicy({
        version: '1.0',
        lastUpdated: new Date().toLocaleDateString(),
        content: 'MyHealthID Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect, use, and protect your health data.\n\n1. Data Collection: We collect health records, consent information, and usage data.\n\n2. Data Security: All data is encrypted using AES-256 and stored securely on blockchain.\n\n3. Data Sharing: Your data is only shared with your explicit consent.\n\n4. Your Rights: You can access, export, or delete your data at any time.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    setAccepted(true);
    Alert.alert(
      'Privacy Policy Accepted',
      'Thank you for reviewing our privacy policy.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.version}>Version {policy?.version} • Last updated: {policy?.lastUpdated}</Text>
        
        <Text style={styles.text}>{policy?.content}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, accepted && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={accepted}
        >
          <Text style={styles.buttonText}>
            {accepted ? 'Accepted ✓' : 'I Accept'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#2d3748',
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#48bb78',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
