import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myhealthid');
    console.log('✅ Connected to MongoDB');

    const email = 'john.doe@example.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
    } else {
      console.log('✅ User found:', user.email);
      console.log('   Role:', user.role);
      
      // Reset password to ensure it's correct
      const newHash = await bcrypt.hash('Pilot@2024', 12);
      user.passwordHash = newHash;
      await user.save();
      console.log('✅ Password reset to: Pilot@2024');

      const isMatch = await bcrypt.compare('Pilot@2024', user.passwordHash);
      console.log('   Password Match (Pilot@2024):', isMatch);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUser();
