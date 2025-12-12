import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Check if Twilio is configured
const isTwilioConfigured = () => {
  return accountSid && authToken && twilioPhoneNumber;
};

// Initialize client only if configured
if (isTwilioConfigured()) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
  }
}
// Silently use test mode if not configured

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number in E.164 format (e.g., +1234567890)
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendOTP = async (phone) => {
  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(phone, { otp, expiresAt, attempts: 0 });

    // If Twilio is configured, send real SMS
    if (client && isTwilioConfigured()) {
      try {
        await client.messages.create({
          body: `Your MyHealthID verification code is: ${otp}. Valid for 5 minutes.`,
          from: twilioPhoneNumber,
          to: phone
        });

        console.log(`✅ OTP sent to ${phone}`);
        return {
          success: true,
          message: 'OTP sent successfully',
          expiresIn: 300 // 5 minutes in seconds
        };
      } catch (twilioError) {
        console.error('Twilio SMS error:', twilioError.message);
        
        // Fall back to test mode
        return {
          success: true,
          message: 'OTP sent (test mode)',
          testOTP: otp, // Include OTP in response for testing
          expiresIn: 300
        };
      }
    } else {
      // Development mode - return OTP in response
      return {
        success: true,
        message: 'OTP sent (test mode)',
        testOTP: otp, // Include OTP in response for testing
        expiresIn: 300
      };
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
};

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} code - OTP code
 * @returns {Promise<{success: boolean, message: string}>}
 */
const verifyOTP = async (phone, code) => {
  try {
    const stored = otpStore.get(phone);

    if (!stored) {
      return {
        success: false,
        message: 'No OTP found for this phone number. Please request a new one.'
      };
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempts (max 3)
    if (stored.attempts >= 3) {
      otpStore.delete(phone);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (stored.otp === code) {
      otpStore.delete(phone);
      console.log(`✅ OTP verified for ${phone}`);
      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } else {
      // Increment attempts
      stored.attempts += 1;
      otpStore.set(phone, stored);

      return {
        success: false,
        message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.`
      };
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    };
  }
};

/**
 * Clean up expired OTPs (run periodically)
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
};

// Clean up every 10 minutes
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

export { sendOTP, verifyOTP, isTwilioConfigured };
