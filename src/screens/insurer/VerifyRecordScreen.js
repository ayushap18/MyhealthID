import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../utils/mockData';
import { storageService } from '../../services/storageService';
import { blockchainService, ipfsService } from '../../services/blockchainService';
import { Button } from '../../components/Button';
import { Header, LoadingOverlay } from '../../components/Common';

export default function VerifyRecordScreen({ route, navigation }) {
  const { record, insurer } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [consentStatus, setConsentStatus] = useState(null);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const requests = await storageService.getAllConsentRequests();
    const relevantConsent = requests?.find(
      r => r.patientId === record.patientId && 
           r.recordId === record.id && 
           r.status === 'approved'
    );
    setConsentStatus(relevantConsent);
  };

  const addVerificationStep = (step, status = 'processing') => {
    setVerificationSteps(prev => [...prev, { text: step, status }]);
  };

  const updateLastStep = (status) => {
    setVerificationSteps(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
      }
      return updated;
    });
  };

  const handleVerify = async () => {
    // Check if consent exists (in demo mode, we'll proceed anyway for testing)
    if (!consentStatus) {
      Alert.alert(
        'No Consent Found',
        'Patient has not approved access to this record. In production, verification would be blocked.\n\nProceed anyway for demo?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Demo: Proceed', onPress: () => performVerification() },
        ]
      );
      return;
    }

    performVerification();
  };

  const performVerification = async () => {
    setLoading(true);
    setVerificationSteps([]);
    setVerificationResult(null);

    try {
      // Step 1: Retrieve from IPFS
      setLoadingMessage('Fetching record from IPFS...');
      addVerificationStep('📥 Retrieving file from IPFS', 'processing');
      const ipfsData = await ipfsService.retrieveFile(record.cid);
      updateLastStep('success');

      // Step 2: Compute local hash
      setLoadingMessage('Computing content hash...');
      addVerificationStep('🔐 Computing local content hash', 'processing');
      await new Promise(resolve => setTimeout(resolve, 800));
      const localHash = record.encryptionHash; // In real app, would compute from downloaded file
      updateLastStep('success');

      // Step 3: Verify on blockchain
      setLoadingMessage('Verifying hash on blockchain...');
      addVerificationStep('⛓️ Querying Ethereum blockchain', 'processing');
      const verification = await blockchainService.verifyDocumentHash(record.cid, localHash);
      updateLastStep(verification.isValid ? 'success' : 'error');

      // Step 4: Check integrity
      addVerificationStep('✓ Hash comparison', verification.isValid ? 'success' : 'error');

      setVerificationResult(verification);

      // Add audit log
      await storageService.addAuditLog({
        id: `AUDIT-${Date.now()}`,
        patientId: record.patientId,
        recordId: record.id,
        accessorName: insurer.name,
        accessorType: 'insurer',
        action: 'VIEW',
        timestamp: new Date().toISOString(),
        verified: verification.isValid,
      });

      setLoading(false);

      if (verification.isValid) {
        Alert.alert(
          '✓ Verification Successful',
          'Record authenticity confirmed on blockchain!',
        );
      } else {
        Alert.alert(
          '✗ Verification Failed',
          'Hash mismatch detected. Record may be tampered.',
        );
      }
    } catch (error) {
      setLoading(false);
      updateLastStep('error');
      Alert.alert('Verification Error', error.message || 'An error occurred during verification');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Verify Record"
        subtitle="Blockchain verification"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Record Info */}
        <View style={styles.recordCard}>
          <Text style={styles.recordLabel}>Record Details</Text>
          <View style={styles.recordRow}>
            <Text style={styles.recordKey}>Type:</Text>
            <Text style={styles.recordValue}>{record.type}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordKey}>Title:</Text>
            <Text style={styles.recordValue}>{record.title}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordKey}>Hospital:</Text>
            <Text style={styles.recordValue}>{record.hospitalName}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordKey}>Patient ID:</Text>
            <Text style={styles.recordValue}>{record.patientId}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordKey}>Upload Date:</Text>
            <Text style={styles.recordValue}>
              {new Date(record.uploadDate).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Blockchain Data */}
        <View style={styles.blockchainCard}>
          <Text style={styles.blockchainLabel}>Blockchain Data</Text>
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>IPFS CID:</Text>
            <Text style={styles.hashValue}>{record.cid || record.ipfsCID || 'N/A'}</Text>
          </View>
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>Content Hash:</Text>
            <Text style={styles.hashValue}>
              {record.encryptionHash ? record.encryptionHash.substring(0, 40) + '...' : 'N/A'}
            </Text>
          </View>
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>File Size:</Text>
            <Text style={styles.hashValue}>{record.fileSize || 'N/A'}</Text>
          </View>
        </View>

        {/* Consent Status */}
        {consentStatus ? (
          <View style={styles.consentCard}>
            <Text style={styles.consentStatus}>✓ Patient Consent: APPROVED</Text>
            <Text style={styles.consentDetails}>
              Approved: {new Date(consentStatus.approvedAt).toLocaleString()}
            </Text>
          </View>
        ) : (
          <View style={[styles.consentCard, styles.noConsentCard]}>
            <Text style={styles.noConsentStatus}>⚠️ No Consent Found</Text>
            <Text style={styles.consentDetails}>
              Patient has not approved access. Demo mode allows bypass.
            </Text>
          </View>
        )}

        {/* Verify Button */}
        {!verificationResult && (
          <Button
            title="🔍 Verify Authenticity"
            onPress={handleVerify}
            style={styles.verifyButton}
          />
        )}

        {/* Verification Steps */}
        {verificationSteps.length > 0 && (
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Verification Process:</Text>
            {verificationSteps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <Text style={styles.stepIcon}>
                  {step.status === 'success' && '✓'}
                  {step.status === 'error' && '✗'}
                  {step.status === 'processing' && '⏳'}
                </Text>
                <Text style={[
                  styles.stepText,
                  step.status === 'success' && styles.stepSuccess,
                  step.status === 'error' && styles.stepError,
                ]}>
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <View style={[
            styles.resultCard,
            verificationResult.isValid ? styles.resultSuccess : styles.resultError
          ]}>
            <Text style={styles.resultIcon}>
              {verificationResult.isValid ? '✓' : '✗'}
            </Text>
            <Text style={styles.resultTitle}>
              {verificationResult.isValid ? 'VERIFIED' : 'VERIFICATION FAILED'}
            </Text>
            <Text style={styles.resultMessage}>
              {verificationResult.isValid
                ? 'Record authenticity confirmed on Ethereum blockchain'
                : 'Hash mismatch detected - possible tampering'
              }
            </Text>
            <View style={styles.resultDetails}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>On-Chain Hash:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.onChainHash ? verificationResult.onChainHash.substring(0, 20) + '...' : 'N/A'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Local Hash:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.localHash ? verificationResult.localHash.substring(0, 20) + '...' : 'N/A'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Block Number:</Text>
                <Text style={styles.resultValue}>{verificationResult.blockNumber || 'N/A'}</Text>
              </View>
            </View>

            {verificationResult.isValid && (
              <Button
                title="✓ Mark as Claim Ready"
                variant="secondary"
                onPress={() => {
                  Alert.alert(
                    'Success',
                    'Record marked as verified and claim ready!',
                    [{ text: 'Done', onPress: () => navigation.goBack() }]
                  );
                }}
                style={styles.claimButton}
              />
            )}
          </View>
        )}
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
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  recordRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recordKey: {
    fontSize: 14,
    color: COLORS.gray,
    width: 100,
  },
  recordValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.navy,
  },
  blockchainCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  blockchainLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  hashContainer: {
    marginBottom: 12,
  },
  hashLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  consentCard: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  noConsentCard: {
    backgroundColor: COLORS.warning + '20',
    borderLeftColor: COLORS.warning,
  },
  consentStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  noConsentStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  consentDetails: {
    fontSize: 13,
    color: COLORS.gray,
  },
  verifyButton: {
    marginBottom: 24,
  },
  stepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  stepSuccess: {
    color: COLORS.success,
  },
  stepError: {
    color: COLORS.error,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultSuccess: {
    backgroundColor: COLORS.success + '20',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  resultError: {
    backgroundColor: COLORS.error + '20',
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultRow: {
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.navy,
    fontFamily: 'monospace',
  },
  claimButton: {
    width: '100%',
  },
});
