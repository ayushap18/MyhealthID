import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import sentryTest from '../utils/sentryTest';
import * as Sentry from '@sentry/react-native';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [sentryTesting, setSentryTesting] = useState(false);

  const handleTestSentry = async () => {
    setSentryTesting(true);
    try {
      const results = sentryTest.runAllTests();
      Alert.alert(
        '🔍 Sentry Test Complete',
        `Tests run: ${Object.keys(results).length}\n\nCheck your Sentry dashboard:\nhttps://codecatalysts-c4.sentry.io/issues/`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Sentry test failed: ' + error.message);
    } finally {
      setSentryTesting(false);
    }
  };

  const handleShowFeedbackWidget = () => {
    Sentry.showFeedbackWidget();
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await apiClient.get('/compliance/export');
      
      Alert.alert(
        'Data Exported',
        `Your data has been exported successfully. Total records: ${response.data.records?.length || 0}`,
        [
          {
            text: 'View JSON',
            onPress: () => logger.debug('Settings', 'Exported data', response.data)
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      logger.error('Settings', 'Export error', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? Your account will be deleted in 7 days. You can cancel anytime during this period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiClient.post('/compliance/delete-account');
              Alert.alert(
                'Deletion Scheduled',
                `Your account will be deleted on ${new Date(response.data.deletionDate).toLocaleDateString()}. You have ${response.data.gracePeriodDays} days to cancel.`,
                [{ text: 'OK', onPress: () => logout() }]
              );
            } catch (error) {
              logger.error('Settings', 'Delete account error', error);
              Alert.alert('Error', 'Failed to schedule account deletion');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim() || rating === 0) {
      Alert.alert('Missing Information', 'Please provide a rating and feedback');
      return;
    }

    Alert.alert(
      'Feedback Submitted',
      'Thank you for your feedback! This helps us improve MyHealthID.',
      [{ text: 'OK', onPress: () => { setFeedback(''); setRating(0); } }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
          
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role}</Text>
          
          <Text style={styles.label}>Patient ID</Text>
          <Text style={styles.value}>{user?.patientId}</Text>
        </View>

        <Text style={styles.sectionTitle}>Compliance & Privacy</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={styles.menuText}>📋 Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TermsOfService')}
        >
          <Text style={styles.menuText}>📄 Terms of Service</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleExportData}
          disabled={exportLoading}
        >
          <Text style={styles.menuText}>📦 Export My Data (GDPR)</Text>
          {exportLoading ? (
            <ActivityIndicator size="small" color="#667eea" />
          ) : (
            <Text style={styles.arrow}>›</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Feedback</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Rate Your Experience</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Text style={styles.star}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What could we improve?"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.dangerButtonText}>🗑️ Delete Account</Text>
          )}
        </TouchableOpacity>

        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            <TouchableOpacity
              style={styles.devButton}
              onPress={handleTestSentry}
              disabled={sentryTesting}
            >
              {sentryTesting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.devButtonText}>🧪 Test Sentry Integration</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: '#6366f1' }]}
              onPress={handleShowFeedbackWidget}
            >
              <Text style={styles.devButtonText}>💬 Open Sentry Feedback</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#718096',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1a202c',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1a202c',
  },
  arrow: {
    fontSize: 24,
    color: '#cbd5e0',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  star: {
    fontSize: 32,
    marginRight: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#f56565',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  devButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
