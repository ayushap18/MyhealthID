import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfills for ethers.js and crypto libraries
global.Buffer = Buffer;

// Process polyfill
if (typeof process === 'undefined') {
  global.process = { env: {} };
}

// BigInt polyfill (fallback - usually native in modern React Native)
if (typeof BigInt === 'undefined') {
  console.warn('BigInt not supported natively, some blockchain features may not work');
}

// TextEncoder/TextDecoder polyfill
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('text-encoding').TextDecoder;
}
