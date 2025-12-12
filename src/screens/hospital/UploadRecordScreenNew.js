import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MOCK_PATIENTS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { blockchainService } from '../../services/blockchainService';
import { encryptionService } from '../../services/encryptionService';
import { ipfsService } from '../../services/ipfsService';
import { THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const { width } = Dimensions.get('window');

export default function UploadRecordScreenNew({ navigation }) {
  const [hospital, setHospital] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState('');
  const [recordTitle, setRecordTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHospitalData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadHospitalData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'hospital') {
      setHospital(currentUser.data);
    }
  };

  const addProgressStep = (step, stepIndex) => {
    setUploadProgress(prev => [...prev, step]);
    setCurrentStep(stepIndex);
    Animated.timing(progressAnim, {
      toValue: (stepIndex / 5) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile({
        uri: result.assets[0].uri,
        name: 'medical-record.jpg',
        type: 'image',
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled) {
      setSelectedFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: 'document',
      });
    }
  };

  const handleUpload = async () => {
    if (!patientId.trim()) {
      Alert.alert('Missing Info', 'Please enter Patient ID');
      return;
    }
    if (!recordType.trim()) {
      Alert.alert('Missing Info', 'Please enter Record Type');
      return;
    }
    if (!recordTitle.trim()) {
      Alert.alert('Missing Info', 'Please enter Record Title');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Missing Info', 'Please select a file to upload');
      return;
    }

    setLoading(true);
    setUploadProgress([]);
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    try {
      // Step 1: Read file
      setLoadingMessage('Reading file...');
      addProgressStep({ icon: '📄', text: 'Reading file', status: 'complete' }, 1);
      let fileContent = '';
      try {
        fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        fileContent = selectedFile.uri;
      }

      // Step 2: Encrypt
      setLoadingMessage('Encrypting with AES-256...');
      addProgressStep({ icon: '🔐', text: 'Encrypting file', status: 'complete' }, 2);
      const encryption = encryptionService.encrypt(fileContent);
      const contentHash = encryptionService.generateHash(fileContent);

      // Step 3: Upload IPFS
      setLoadingMessage('Uploading to IPFS...');
      addProgressStep({ icon: '📤', text: 'Uploading to IPFS', status: 'complete' }, 3);
      const ipfsUpload = await ipfsService.uploadFile(encryption.encryptedContent, selectedFile.name);

      // Step 4: Blockchain
      setLoadingMessage('Registering on blockchain...');
      addProgressStep({ icon: '⛓️', text: 'Blockchain registration', status: 'complete' }, 4);
      const blockchainTx = await blockchainService.registerDocument(
        patientId,
        selectedFile.uri,
        { type: recordType, title: recordTitle, hospitalId: hospital.id }
      );

      // Step 5: Save
      addProgressStep({ icon: '💾', text: 'Saving metadata', status: 'complete' }, 5);
      const newRecord = {
        id: `REC${Date.now()}`,
        patientId: patientId.trim(),
        type: recordType.trim(),
        title: recordTitle.trim(),
        hospitalName: hospital.name,
        uploadDate: new Date().toISOString(),
        cid: ipfsUpload.cid,
        encryptionHash: contentHash,
        encryptionIV: encryption.iv,
        fileSize: ipfsUpload.size || `${(fileContent.length / 1024).toFixed(1)} KB`,
        status: 'verified',
        transactionHash: blockchainTx.transactionHash,
        blockNumber: blockchainTx.blockNumber,
      };

      await storageService.addRecord(newRecord);

      // Create consent request
      const consentRequest = {
        id: `CONSENT${Date.now()}`,
        patientId: patientId.trim(),
        requesterId: hospital.id,
        requesterName: hospital.name,
        requesterType: 'hospital',
        recordId: newRecord.id,
        recordType: recordType.trim(),
        status: 'pending',
        requestDate: new Date().toISOString(),
        expiryHours: 48,
      };

      const existingRequests = (await storageService.getAllConsentRequests()) || [];
      await storageService.saveConsentRequests([...existingRequests, consentRequest]);

      await storageService.addAuditLog({
        id: `AUDIT-${Date.now()}`,
        patientId: patientId.trim(),
        recordId: newRecord.id,
        accessorName: hospital.name,
        accessorType: 'hospital',
        action: 'UPLOAD',
        timestamp: new Date().toISOString(),
        verified: true,
        transactionHash: blockchainTx.transactionHash,
      });

      setLoading(false);
      pulseAnim.stopAnimation();

      Alert.alert(
        '✅ Upload Complete!',
        `Record encrypted and stored on blockchain.\n\nCID: ${ipfsUpload.cid.substring(0, 25)}...\nTx: ${blockchainTx.transactionHash.substring(0, 20)}...`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      pulseAnim.stopAnimation();
      Alert.alert('Upload Failed', error.message || 'An error occurred');
    }
  };

  const recordTypes = ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Lab Report', 'Other'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[THEME.background, '#0D1B3C', '#091428']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Record</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeIcon}>🔐</Text>
          <Text style={styles.headerBadgeText}>End-to-End Encrypted</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Patient ID */}
          <View style={styles.section}>
            <Text style={styles.label}>Patient ID *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Patient ID"
                placeholderTextColor={THEME.textSecondary}
                value={patientId}
                onChangeText={setPatientId}
                autoCapitalize="characters"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelect}>
              {MOCK_PATIENTS.map(patient => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.quickChip, patientId === patient.id && styles.quickChipActive]}
                  onPress={() => setPatientId(patient.id)}
                >
                  <Text style={[styles.quickChipText, patientId === patient.id && styles.quickChipTextActive]}>
                    {patient.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Record Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Record Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {recordTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, recordType === type && styles.typeChipActive]}
                  onPress={() => setRecordType(type)}
                >
                  <Text style={styles.typeChipIcon}>
                    {type === 'Blood Test' ? '🩸' : type === 'X-Ray' ? '🔬' : type === 'MRI' ? '🧠' : type === 'Prescription' ? '💊' : '📋'}
                  </Text>
                  <Text style={[styles.typeChipText, recordType === type && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Record Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Record Title *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Complete Blood Count (CBC)"
                placeholderTextColor={THEME.textSecondary}
                value={recordTitle}
                onChangeText={setRecordTitle}
              />
            </View>
          </View>

          {/* File Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Attach File *</Text>
            {selectedFile ? (
              <View style={styles.fileCard}>
                <LinearGradient colors={[THEME.success + '20', THEME.success + '10']} style={styles.fileGradient}>
                  <Text style={styles.fileIcon}>
                    {selectedFile.type === 'image' ? '🖼️' : '📄'}
                  </Text>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileType}>{selectedFile.type === 'image' ? 'Image' : 'PDF'}</Text>
                  </View>
                  <TouchableOpacity style={styles.fileRemove} onPress={() => setSelectedFile(null)}>
                    <Text style={styles.fileRemoveText}>✕</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.fileButtons}>
                <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
                  <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.fileButtonGradient}>
                    <Text style={styles.fileButtonIcon}>📷</Text>
                    <Text style={styles.fileButtonText}>Select Image</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
                  <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.fileButtonGradient}>
                    <Text style={styles.fileButtonIcon}>📄</Text>
                    <Text style={styles.fileButtonText}>Select PDF</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Upload Progress */}
          {loading && (
            <Animated.View style={[styles.progressCard, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={[THEME.primary + '30', THEME.primary + '10']} style={styles.progressGradient}>
                <Text style={styles.progressTitle}>🚀 {loadingMessage}</Text>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
                    ]}
                  />
                </View>
                <View style={styles.progressSteps}>
                  {uploadProgress.map((step, index) => (
                    <View key={index} style={styles.progressStep}>
                      <Text style={styles.progressStepIcon}>{step.icon}</Text>
                      <Text style={styles.progressStepText}>{step.text}</Text>
                      <Text style={styles.progressStepCheck}>✓</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? [THEME.card, THEME.card] : [THEME.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadGradient}
            >
              <Text style={styles.uploadIcon}>🔐</Text>
              <Text style={styles.uploadText}>
                {loading ? 'Processing...' : 'Encrypt & Upload to Blockchain'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <LinearGradient colors={[THEME.card, '#1A2A4A']} style={styles.infoGradient}>
              <Text style={styles.infoTitle}>🔒 Secure Upload Process</Text>
              <View style={styles.infoItems}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemIcon}>🔐</Text>
                  <Text style={styles.infoItemText}>AES-256-GCM encryption</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemIcon}>📦</Text>
                  <Text style={styles.infoItemText}>IPFS decentralized storage</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemIcon}>⛓️</Text>
                  <Text style={styles.infoItemText}>Ethereum blockchain proof</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoItemIcon}>🔔</Text>
                  <Text style={styles.infoItemText}>Patient consent notification</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  backText: {
    color: THEME.text,
    fontSize: TYPOGRAPHY.body,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h1,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: SPACING.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.success + '20',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  headerBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  headerBadgeText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.success,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.small,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: THEME.text,
  },
  quickSelect: {
    marginTop: SPACING.sm,
  },
  quickChip: {
    backgroundColor: THEME.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quickChipActive: {
    backgroundColor: THEME.primary + '30',
    borderColor: THEME.primary,
  },
  quickChipText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  quickChipTextActive: {
    color: THEME.primary,
    fontWeight: '600',
  },
  typeScroll: {
    marginTop: SPACING.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  typeChipActive: {
    backgroundColor: THEME.secondary + '30',
    borderColor: THEME.secondary,
  },
  typeChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeChipText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  typeChipTextActive: {
    color: THEME.secondary,
    fontWeight: '600',
  },
  fileButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  fileButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  fileButtonGradient: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: 'dashed',
  },
  fileButtonIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  fileButtonText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
  fileCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  fileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.success,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
  },
  fileType: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  fileRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.error + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileRemoveText: {
    fontSize: 16,
    color: THEME.error,
  },
  progressCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressGradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: THEME.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 3,
  },
  progressSteps: {
    gap: SPACING.sm,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStepIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  progressStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.small,
    color: THEME.text,
  },
  progressStepCheck: {
    fontSize: 14,
    color: THEME.success,
  },
  uploadButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.large,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  uploadIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '700',
    color: THEME.text,
  },
  infoCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  infoGradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: SPACING.md,
  },
  infoItems: {
    gap: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    width: 24,
  },
  infoItemText: {
    fontSize: TYPOGRAPHY.small,
    color: THEME.textSecondary,
  },
});
