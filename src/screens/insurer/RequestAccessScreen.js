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
import { COLORS, MOCK_PATIENTS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { Button } from '../../components/Button';
import { Header } from '../../components/Common';

export default function RequestAccessScreen({ navigation }) {
  const [insurer, setInsurer] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [recordType, setRecordType] = useState('');
  const [purpose, setPurpose] = useState('');

  React.useEffect(() => {
    loadInsurerData();
  }, []);

  const loadInsurerData = async () => {
    const currentUser = await storageService.getCurrentUser();
    if (currentUser && currentUser.role === 'insurer') {
      setInsurer(currentUser.data);
    }
  };

  const handleRequestAccess = async () => {
    if (!patientId.trim()) {
      Alert.alert('Error', 'Please enter Patient ID');
      return;
    }

    if (!recordType.trim()) {
      Alert.alert('Error', 'Please enter Record Type');
      return;
    }

    // Find patient records
    const allRecords = await storageService.getRecords();
    const matchingRecords = allRecords?.filter(
      r => r.patientId === patientId.trim() && 
           r.type.toLowerCase().includes(recordType.trim().toLowerCase())
    );

    if (!matchingRecords || matchingRecords.length === 0) {
      Alert.alert('No Records Found', 'No matching records found for this patient and record type.');
      return;
    }

    // Navigate to verification screen with first matching record
    navigation.navigate('VerifyRecord', {
      record: matchingRecords[0],
      insurer: insurer,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Request Patient Record"
        subtitle="Request access for verification"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Patient ID */}
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

        {/* Record Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Record Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Blood Test, X-Ray, Prescription"
            value={recordType}
            onChangeText={setRecordType}
          />
          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectLabel}>Common Types:</Text>
            {['Blood Test', 'X-Ray Report', 'Prescription'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.quickSelectButton}
                onPress={() => setRecordType(type)}
              >
                <Text style={styles.quickSelectText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purpose */}
        <View style={styles.section}>
          <Text style={styles.label}>Purpose (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Insurance claim verification"
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <Button
          title="🔍 Find & Verify Record"
          onPress={handleRequestAccess}
        />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • Search for patient records by ID{'\n'}
            • Check if patient has granted consent{'\n'}
            • Download encrypted record from IPFS{'\n'}
            • Verify hash against blockchain{'\n'}
            • View authenticity status
          </Text>
        </View>
      </ScrollView>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  infoBox: {
    backgroundColor: COLORS.navy + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
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
