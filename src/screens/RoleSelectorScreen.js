import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/mockData';
import { storageService } from '../services/storageService';
import { 
  MOCK_PATIENTS, 
  MOCK_RECORDS, 
  MOCK_CONSENT_REQUESTS, 
  MOCK_AUDIT_LOGS 
} from '../utils/mockData';

export default function RoleSelectorScreen({ navigation }) {
  const selectRole = (role) => {
    if (role === 'patient') {
      navigation.navigate('PatientLogin');
    } else if (role === 'hospital') {
      navigation.navigate('HospitalLogin');
    } else if (role === 'insurer') {
      navigation.navigate('InsurerLogin');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.navy, '#0A1F47']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Brand Area */}
        <View style={styles.brandContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>❤️+</Text>
          </View>
          <Text style={styles.appName}>MyHealthID</Text>
          <Text style={styles.tagline}>Your Health. Your Identity. Your Control.</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          <Text style={styles.selectRoleText}>Select Your Role</Text>
          
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => selectRole('patient')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleEmoji}>👤</Text>
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Patient</Text>
              <Text style={styles.roleDescription}>
                View records, manage consent, audit access
              </Text>
            </View>
            <Text style={styles.roleArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => selectRole('hospital')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleEmoji}>🏥</Text>
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Hospital Staff</Text>
              <Text style={styles.roleDescription}>
                Upload medical records to blockchain
              </Text>
            </View>
            <Text style={styles.roleArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => selectRole('insurer')}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleEmoji}>🔍</Text>
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Insurance Verifier</Text>
              <Text style={styles.roleDescription}>
                Request and verify patient records
              </Text>
            </View>
            <Text style={styles.roleArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>🎯 Demo Mode Active</Text>
          <Text style={styles.demoSubtext}>Mock blockchain & IPFS simulation</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
  },
  selectRoleText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: COLORS.gray,
  },
  roleArrow: {
    fontSize: 24,
    color: COLORS.teal,
    fontWeight: '600',
  },
  demoInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  demoSubtext: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
  },
});
