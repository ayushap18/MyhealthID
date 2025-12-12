import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import User from '../models/User.js';
import Record from '../models/Record.js';
import Consent from '../models/Consent.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myhealthid');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Record.deleteMany({});
    // await Consent.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    const passwordHash = await bcrypt.hash('Pilot@2024', 12);

    // Create 2 patients
    const patients = [
      {
        patientId: 'P0001',
        walletAddress: ethers.Wallet.createRandom().address,
        role: 'patient',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        phoneVerified: true,
        passwordHash,
        publicKey: ethers.Wallet.createRandom().publicKey
      },
      {
        patientId: 'P0002',
        walletAddress: ethers.Wallet.createRandom().address,
        role: 'patient',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        phoneVerified: true,
        passwordHash,
        publicKey: ethers.Wallet.createRandom().publicKey
      }
    ];

    // Create 1 doctor
    const doctor = {
      patientId: 'DOC0001',
      walletAddress: ethers.Wallet.createRandom().address,
      role: 'doctor',
      name: 'Dr. Sarah Johnson',
      email: 'dr.johnson@example.com',
      passwordHash,
      publicKey: ethers.Wallet.createRandom().publicKey
    };

    // Create 1 hospital staff
    const hospital = {
      patientId: 'STAFF0001',
      walletAddress: ethers.Wallet.createRandom().address,
      role: 'hospital',
      name: 'City Hospital Admin',
      email: 'admin@cityhospital.com',
      passwordHash,
      publicKey: ethers.Wallet.createRandom().publicKey
    };

    // Create 1 insurer
    const insurer = {
      patientId: 'AGENT0001',
      walletAddress: ethers.Wallet.createRandom().address,
      role: 'insurer',
      name: 'HealthCare Insurance Agent',
      email: 'agent@healthcare.com',
      passwordHash,
      publicKey: ethers.Wallet.createRandom().publicKey
    };

    // Save all users
    const allUsers = [...patients, doctor, hospital, insurer];
    const savedUsers = await User.insertMany(allUsers);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Create demo records for Patient 1
    const records = [
      {
        recordId: `REC${Date.now()}1`,
        patientId: 'P0001',
        type: 'Lab Report',
        title: 'Complete Blood Count (CBC)',
        hospitalId: 'STAFF0001',
        hospitalName: 'City Hospital',
        uploadedBy: 'STAFF0001',
        ipfsCID: 'QmTest123456789BloodTest',
        encryptionHash: ethers.id('blood-test-encrypted'),
        fileSize: '2.5 MB',
        blockchainTxHash: '0x' + ethers.id('blood-test-tx').slice(2, 66),
        status: 'verified',
        metadata: {
          mimeType: 'application/pdf',
          originalName: 'blood_test_report_nov_2025.pdf',
          encryptionAlgorithm: 'AES-256-GCM'
        },
        uploadDate: new Date('2025-11-15')
      },
      {
        recordId: `REC${Date.now()}2`,
        patientId: 'P0001',
        type: 'X-Ray Report',
        title: 'Chest X-Ray',
        hospitalId: 'STAFF0001',
        hospitalName: 'City Hospital',
        uploadedBy: 'STAFF0001',
        ipfsCID: 'QmTest123456789XRay',
        encryptionHash: ethers.id('xray-encrypted'),
        fileSize: '8.1 MB',
        blockchainTxHash: '0x' + ethers.id('xray-tx').slice(2, 66),
        status: 'verified',
        metadata: {
          mimeType: 'image/jpeg',
          originalName: 'chest_xray_nov_2025.jpg',
          encryptionAlgorithm: 'AES-256-GCM'
        },
        uploadDate: new Date('2025-11-20')
      }
    ];

    // Create demo record for Patient 2
    records.push({
      recordId: `REC${Date.now()}3`,
      patientId: 'P0002',
      type: 'MRI Scan',
      title: 'Brain MRI Scan',
      hospitalId: 'STAFF0001',
      hospitalName: 'Regional Hospital',
      uploadedBy: 'STAFF0001',
      ipfsCID: 'QmTest123456789MRI',
      encryptionHash: ethers.id('mri-encrypted'),
      fileSize: '45.3 MB',
      blockchainTxHash: '0x' + ethers.id('mri-tx').slice(2, 66),
      status: 'verified',
      metadata: {
        mimeType: 'application/dicom',
        originalName: 'brain_mri_scan_nov_2025.dcm',
        encryptionAlgorithm: 'AES-256-GCM'
      },
      uploadDate: new Date('2025-11-10')
    });

    const savedRecords = await Record.insertMany(records);
    console.log(`✅ Created ${savedRecords.length} demo records`);

    // Create demo consent requests
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

    const consents = [
      {
        consentId: `CONSENT${Date.now()}1`,
        patientId: 'P0001',
        requesterId: 'DOC0001',
        requesterName: 'Dr. Sarah Johnson',
        requesterRole: 'hospital',
        purpose: 'Review medical history for consultation',
        status: 'pending',
        requestedAt: new Date(),
        expiresAt: expiryDate
      },
      {
        consentId: `CONSENT${Date.now()}2`,
        patientId: 'P0002',
        requesterId: 'AGENT0001',
        requesterName: 'HealthCare Insurance Agent',
        requesterRole: 'insurer',
        purpose: 'Verify medical records for claim processing',
        status: 'pending',
        requestedAt: new Date(),
        expiresAt: expiryDate
      }
    ];

    const savedConsents = await Consent.insertMany(consents);
    console.log(`✅ Created ${savedConsents.length} consent requests`);

    console.log('\n📋 Pilot Test Accounts Created:');
    console.log('\n👤 Patients:');
    console.log('  Email: john.doe@example.com | Password: Pilot@2024 | ID: P0001');
    console.log('  Email: jane.smith@example.com | Password: Pilot@2024 | ID: P0002');
    console.log('\n👨‍⚕️ Doctor:');
    console.log('  Email: dr.johnson@example.com | Password: Pilot@2024 | ID: DOC0001');
    console.log('\n🏥 Hospital:');
    console.log('  Email: admin@cityhospital.com | Password: Pilot@2024 | ID: STAFF0001');
    console.log('\n🏢 Insurer:');
    console.log('  Email: agent@healthcare.com | Password: Pilot@2024 | ID: AGENT0001');
    console.log('\n✨ All users have password: Pilot@2024\n');

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
