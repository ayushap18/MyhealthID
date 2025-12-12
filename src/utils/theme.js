// Modern Theme Configuration
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN = { width, height };

// Premium Color Palette - Healthcare Focused
export const THEME = {
  // Primary Colors
  primary: '#6366F1',      // Indigo - Trust & Technology
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Secondary Colors
  secondary: '#14B8A6',    // Teal - Health & Wellness
  secondaryDark: '#0D9488',
  secondaryLight: '#2DD4BF',
  
  // Accent Colors
  accent: '#F472B6',       // Pink - Warmth
  accentDark: '#EC4899',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  
  // Dark Mode Background
  background: '#0F0F23',
  backgroundSecondary: '#1A1A2E',
  backgroundTertiary: '#16213E',
  
  // Cards & Surfaces
  card: '#1E1E3F',
  cardHover: '#2A2A4A',
  cardBorder: 'rgba(99, 102, 241, 0.2)',
  
  // Glass Effect
  glass: 'rgba(30, 30, 63, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0F0F23',
  
  // Gradient Presets
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#14B8A6', '#06B6D4'],
    accent: ['#F472B6', '#EC4899'],
    success: ['#10B981', '#34D399'],
    warning: ['#F59E0B', '#FBBF24'],
    error: ['#EF4444', '#F87171'],
    dark: ['#0F0F23', '#1A1A2E'],
    premium: ['#6366F1', '#14B8A6'],
    sunset: ['#F472B6', '#FB923C'],
    ocean: ['#06B6D4', '#3B82F6'],
    aurora: ['#8B5CF6', '#06B6D4', '#10B981'],
  },
};

// Typography Scale
export const TYPOGRAPHY = {
  hero: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

// Spacing Scale (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  }),
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
