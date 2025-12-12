// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Upload Record Screen (Hospital)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { API_CONFIG } from '../../config/api';
import logger from '../../utils/logger';

const RECORD_TYPES = [
  { id: 'prescription', label: 'Prescription', icon: '💊' },
  { id: 'lab', label: 'Lab Report', icon: '🔬' },
  { id: 'imaging', label: 'Imaging/Scan', icon: '🩻' },
  { id: 'discharge', label: 'Discharge Summary', icon: '📋' },
  { id: 'consultation', label: 'Consultation Notes', icon: '📝' },
  { id: 'other', label: 'Other', icon: '📄' },
];

const UploadRecord = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    patientHealthId: '',
    patientName: '',
    patientPhone: '',
    recordType: '',
    title: '',
    description: '',
    diagnosis: '',
    file: null,
  });

  const [patientVerified, setPatientVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
    return AsyncStorage.getItem('userToken');
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress]);

  const verifyPatient = async () => {
    if (!formData.patientHealthId) {
      Alert.alert('Error', 'Please enter patient Health ID');
      return;
    }

    setVerifying(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/patient/verify/${formData.patientHealthId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success && data.patient) {
        setFormData({
          ...formData,
          patientName: data.patient.name,
          patientPhone: data.patient.phone,
        });
        setPatientVerified(true);
        Alert.alert('Success', 'Patient verified successfully');
      } else {
        Alert.alert('Error', 'Patient not found. Please check the Health ID.');
      }
    } catch (error) {
      logger.error('UploadRecord', 'Verify patient error', error);
      Alert.alert('Error', 'Failed to verify patient');
    }
    setVerifying(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFormData({ ...formData, file: result.assets[0] });
      }
    } catch (error) {
      logger.error('UploadRecord', 'Pick document error', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFormData({ ...formData, file: result.assets[0] });
      }
    } catch (error) {
      logger.error('UploadRecord', 'Pick image error', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFormData({ ...formData, file: result.assets[0] });
      }
    } catch (error) {
      logger.error('UploadRecord', 'Take photo error', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUpload = async () => {
    if (!patientVerified) {
      Alert.alert('Error', 'Please verify patient first');
      return;
    }

    if (!formData.recordType) {
      Alert.alert('Error', 'Please select record type');
      return;
    }

    if (!formData.title) {
      Alert.alert('Error', 'Please enter record title');
      return;
    }

    if (!formData.file) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = await getAuthToken();
      const uploadData = new FormData();
      
      uploadData.append('patientHealthId', formData.patientHealthId);
      uploadData.append('patientName', formData.patientName);
      uploadData.append('recordType', formData.recordType);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('diagnosis', formData.diagnosis);
      
      uploadData.append('file', {
        uri: formData.file.uri,
        name: formData.file.name || 'record.pdf',
        type: formData.file.mimeType || 'application/pdf',
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_CONFIG.BASE_URL}/records/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: uploadData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          'Success',
          'Record uploaded and stored on blockchain successfully!',
          [
            {
              text: 'View Dashboard',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to upload record');
      }
    } catch (error) {
      logger.error('UploadRecord', 'Upload error', error);
      Alert.alert('Error', 'Failed to upload record. Please try again.');
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>📤</Text>
          </LinearGradient>
          <Text style={styles.title}>Upload Patient Record</Text>
          <Text style={styles.subtitle}>
            Securely upload and store records on blockchain
          </Text>
        </Animated.View>

        {/* Patient Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient Health ID *</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={formData.patientHealthId}
                onChangeText={(text) => {
                  setFormData({ ...formData, patientHealthId: text });
                  setPatientVerified(false);
                }}
                placeholder="Enter Health ID (Aadhaar/ABHA)"
                placeholderTextColor={Colors.textMuted}
                editable={!patientVerified}
              />
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  patientVerified && styles.verifiedButton,
                ]}
                onPress={patientVerified ? () => setPatientVerified(false) : verifyPatient}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {patientVerified ? '✓ Verified' : 'Verify'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {patientVerified && (
            <View style={styles.patientInfo}>
              <LinearGradient
                colors={['#10B98120', '#05966910']}
                style={styles.patientCard}
              >
                <Text style={styles.patientName}>{formData.patientName}</Text>
                <Text style={styles.patientPhone}>+91 {formData.patientPhone}</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Record Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Type *</Text>
          <View style={styles.recordTypesGrid}>
            {RECORD_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.recordTypeCard,
                  formData.recordType === type.id && styles.recordTypeSelected,
                ]}
                onPress={() => setFormData({ ...formData, recordType: type.id })}
              >
                <Text style={styles.recordTypeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.recordTypeLabel,
                    formData.recordType === type.id && styles.recordTypeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Record Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Blood Test Report - March 2024"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diagnosis/Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.diagnosis}
              onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
              placeholder="Enter diagnosis or clinical notes"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Additional description"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* File Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Document *</Text>
          
          {formData.file ? (
            <View style={styles.filePreview}>
              <LinearGradient
                colors={[Colors.bgCard, Colors.bgCardHover]}
                style={styles.filePreviewCard}
              >
                {formData.file.mimeType?.startsWith('image/') ? (
                  <Image
                    source={{ uri: formData.file.uri }}
                    style={styles.fileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileIcon}>
                    <Text style={styles.fileIconText}>📄</Text>
                  </View>
                )}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {formData.file.name || 'Document'}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formData.file.size ? `${(formData.file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeFile}
                  onPress={() => setFormData({ ...formData, file: null })}
                >
                  <Text style={styles.removeFileText}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.uploadOptionGradient}
                >
                  <Text style={styles.uploadOptionIcon}>📄</Text>
                  <Text style={styles.uploadOptionText}>Choose File</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.uploadOptionGradient}
                >
                  <Text style={styles.uploadOptionIcon}>🖼️</Text>
                  <Text style={styles.uploadOptionText}>Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
                <LinearGradient
                  colors={[Colors.bgCard, Colors.bgCardHover]}
                  style={styles.uploadOptionGradient}
                >
                  <Text style={styles.uploadOptionIcon}>📷</Text>
                  <Text style={styles.uploadOptionText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, uploading && styles.submitDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <LinearGradient
            colors={uploading ? ['#555', '#444'] : ['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitIcon}>⛓️</Text>
                <Text style={styles.submitText}>Upload to Blockchain</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Security Notice</Text>
          <Text style={styles.infoText}>
            • Records are encrypted with AES-256 before upload{'\n'}
            • IPFS hash is stored on Ethereum blockchain{'\n'}
            • Only the patient can grant access to their records{'\n'}
            • Complete audit trail is maintained
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: Spacing.xl,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    fontSize: Typography.body,
    color: Colors.text,
  },
  inputFlex: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  verifyButton: {
    backgroundColor: Colors.hospital,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  verifiedButton: {
    backgroundColor: Colors.success,
  },
  verifyButtonText: {
    color: '#000',
    fontWeight: Typography.semibold,
    fontSize: Typography.caption,
  },
  patientInfo: {
    marginTop: Spacing.md,
  },
  patientCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.hospital + '30',
  },
  patientName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  recordTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  recordTypeCard: {
    width: '31%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordTypeSelected: {
    borderColor: Colors.hospital,
    backgroundColor: Colors.hospital + '20',
  },
  recordTypeIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  recordTypeLabel: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  recordTypeLabelSelected: {
    color: Colors.hospital,
    fontWeight: Typography.medium,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadOption: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  uploadOptionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  uploadOptionIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  uploadOptionText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  filePreview: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  fileImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  fileIconText: {
    fontSize: 28,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
  },
  removeFile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileText: {
    color: Colors.error,
    fontSize: Typography.body,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.hospital,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  submitIcon: {
    fontSize: 20,
  },
  submitText: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: '#000',
  },
  infoBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default UploadRecord;
