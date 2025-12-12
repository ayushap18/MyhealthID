import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS, MOCK_PATIENTS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { blockchainService } from '../../services/blockchainService';
import { encryptionService } from '../../services/encryptionService';
import { ipfsService } from '../../services/ipfsService';
import { web3Service } from '../../services/web3Service';
import { Button } from '../../components/Button';
import { Header, LoadingOverlay } from '../../components/Common';

export default function UploadRecordScreen({ navigation }) {
  const [hospital, setHospital] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState('');
  const [recordTitle, setRecordTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState([]);

  React.useEffect(() => {
    loadHospitalData();
  }, []);

  const loadHospitalData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'hospital') {
      setHospital(currentUser.data);
    }
  };

  const addProgressStep = (step) => {
    setUploadProgress(prev => [...prev, step]);
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
      Alert.alert('Error', 'Please enter Patient ID');
      return;
    }

    if (!recordType.trim()) {
      Alert.alert('Error', 'Please enter Record Type');
      return;
    }

    if (!recordTitle.trim()) {
      Alert.alert('Error', 'Please enter Record Title');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    setLoading(true);
    setUploadProgress([]);

    try {
      // Step 1: Read file content
      setLoadingMessage('Reading file...');
      addProgressStep('📄 Reading file');
      let fileContent = '';
      try {
        fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        // If reading fails, use the URI as content for demo
        fileContent = selectedFile.uri;
      }

      // Step 2: Encrypt file
      setLoadingMessage('Encrypting file with AES-256...');
      addProgressStep('🔐 Encrypting file locally');
      const encryption = encryptionService.encrypt(fileContent);
      const contentHash = encryptionService.generateHash(fileContent);

      // Step 3: Upload to IPFS
      setLoadingMessage('Uploading to IPFS/Filecoin...');
      addProgressStep('📤 Uploading to IPFS');
      const ipfsUpload = await ipfsService.uploadFile(encryption.encryptedContent, selectedFile.name);

      // Step 4: Register on blockchain (using mock service for demo)
      setLoadingMessage('Registering on Ethereum blockchain...');
      addProgressStep('⛓️ Minting blockchain transaction');
      const blockchainTx = await blockchainService.registerDocument(
        patientId,
        selectedFile.uri,
        {
          type: recordType,
          title: recordTitle,
          hospitalId: hospital.id,
        }
      );

      // Step 4: Save to local storage
      addProgressStep('💾 Saving metadata');
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

      // Step 5: Create consent request for patient
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

      // Add audit log
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
      addProgressStep('✅ Upload complete!');

      Alert.alert(
        'Success! ✓',
        `Medical record uploaded and registered on blockchain.\n\nCID: ${ipfsUpload.cid.substring(0, 30)}...\nTx Hash: ${blockchainTx.transactionHash.substring(0, 20)}...`,
        [
          {
            text: 'View Details',
            onPress: () => showUploadSummary(newRecord, ipfsUpload, blockchainTx),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload');
    }
  };

  const showUploadSummary = (record, ipfs, blockchain) => {
    Alert.alert(
      'Upload Summary',
      `Record ID: ${record.id}\n\nIPFS CID: ${ipfs.cid}\n\nBlock Number: ${blockchain.blockNumber}\n\nGas Used: ${blockchain.gasUsed} ETH\n\nStatus: Verified ✓`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Upload Medical Record"
        subtitle="Encrypt and store on blockchain"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Patient Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Patient ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Patient ID (e.g., P001)"
            value={patientId}
            onChangeText={setPatientId}
            autoCapitalize="characters"
          />
          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectLabel}>Quick Select:</Text>
            {MOCK_PATIENTS.map(patient => (
              <TouchableOpacity
                key={patient.id}
                style={styles.quickSelectButton}
                onPress={() => setPatientId(patient.id)}
              >
                <Text style={styles.quickSelectText}>
                  {patient.id} - {patient.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Record Details */}
        <View style={styles.section}>
          <Text style={styles.label}>Record Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Blood Test, X-Ray, Prescription"
            value={recordType}
            onChangeText={setRecordType}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Record Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Complete Blood Count (CBC)"
            value={recordTitle}
            onChangeText={setRecordTitle}
          />
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Attach File *</Text>
          {selectedFile ? (
            <View style={styles.fileSelected}>
              <Text style={styles.fileIcon}>
                {selectedFile.type === 'image' ? '📷' : '📄'}
              </Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileType}>
                  {selectedFile.type === 'image' ? 'Image' : 'PDF Document'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Text style={styles.removeFile}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.filePickers}>
              <Button
                title="📷 Take Photo"
                variant="secondary"
                onPress={pickImage}
              />
              <Button
                title="📄 Select PDF"
                variant="secondary"
                onPress={pickDocument}
              />
            </View>
          )}
        </View>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Upload Progress:</Text>
            {uploadProgress.map((step, index) => (
              <Text key={index} style={styles.progressStep}>
                {step}
              </Text>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="🔐 Encrypt & Upload to Blockchain"
          onPress={handleUpload}
          style={styles.uploadButton}
        />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            • File encrypted with AES-256{'\n'}
            • Uploaded to IPFS/Filecoin{'\n'}
            • CID hash registered on Ethereum{'\n'}
            • Patient notified for consent{'\n'}
            • Audit log entry created
          </Text>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} message={loadingMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickSelectContainer: {
    marginTop: 12,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  quickSelectButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickSelectText: {
    fontSize: 14,
    color: COLORS.navy,
  },
  filePickers: {
    gap: 12,
  },
  fileSelected: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  fileType: {
    fontSize: 13,
    color: COLORS.gray,
  },
  removeFile: {
    fontSize: 24,
    color: COLORS.error,
    paddingHorizontal: 8,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  progressStep: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 6,
  },
  uploadButton: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: COLORS.navy + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
