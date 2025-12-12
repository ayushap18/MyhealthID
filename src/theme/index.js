// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Premium Dark Theme System
// ═══════════════════════════════════════════════════════════════════════════

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// COLORS - Premium Healthcare Dark Theme
// ─────────────────────────────────────────────────────────────────────────────
export const Colors = {
  // Core Brand
  primary: '#00D9FF',        // Cyan - Healthcare Tech
  primaryDark: '#00B8D9',
  primaryLight: '#4DE8FF',
  
  secondary: '#7C3AED',      // Purple - Trust & Security
  secondaryDark: '#6D28D9',
  secondaryLight: '#A78BFA',
  
  accent: '#10B981',         // Emerald - Health & Wellness
  accentDark: '#059669',
  accentLight: '#34D399',
  
  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Backgrounds - Pure Black Theme
  bg: '#000000',
  bgElevated: '#0A0A0F',
  bgCard: '#111118',
  bgCardHover: '#18181F',
  bgInput: '#0D0D12',
  
  // Surfaces with transparency
  surface: 'rgba(17, 17, 24, 0.95)',
  surfaceLight: 'rgba(24, 24, 31, 0.9)',
  glass: 'rgba(0, 217, 255, 0.05)',
  glassBorder: 'rgba(0, 217, 255, 0.15)',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textDisabled: '#4B5563',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderFocus: '#00D9FF',
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#00D9FF', '#7C3AED'],
  gradientSecondary: ['#7C3AED', '#EC4899'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientDark: ['#000000', '#0A0A0F', '#111118'],
  gradientCard: ['#111118', '#0A0A0F'],
  gradientGlow: ['rgba(0, 217, 255, 0.3)', 'rgba(0, 217, 255, 0)'],
  
  // Role-specific colors
  patient: '#00D9FF',
  hospital: '#10B981',
  insurer: '#F59E0B',
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────
export const Typography = {
  fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
  
  // Sizes
  hero: 40,
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,
  tiny: 10,
  
  // Weights
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// ─────────────────────────────────────────────────────────────────────────────
// SPACING (4px base grid)
// ─────────────────────────────────────────────────────────────────────────────
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
  full: 9999,
};

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────────────────────
export const Shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: (color = Colors.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  }),
  innerGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 0,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION CONFIGS
// ─────────────────────────────────────────────────────────────────────────────
export const Animation = {
  // Durations (ms)
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  
  // Spring configs
  spring: {
    gentle: { tension: 40, friction: 7 },
    default: { tension: 50, friction: 8 },
    bouncy: { tension: 80, friction: 6 },
    stiff: { tension: 100, friction: 10 },
  },
  
  // Easing functions (for timing animations)
  easing: {
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeIn: [0.55, 0.06, 0.68, 0.19],
    easeInOut: [0.65, 0, 0.35, 1],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN DIMENSIONS
// ─────────────────────────────────────────────────────────────────────────────
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
  padding: 20,
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 60,
  statusBarHeight: Platform.OS === 'ios' ? 47 : 24,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMON STYLES
// ─────────────────────────────────────────────────────────────────────────────
export const CommonStyles = {
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Screen.statusBarHeight,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  
  cardGlass: {
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  
  // Inputs
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    ...Shadows.glow(Colors.primary),
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  textHero: {
    fontSize: Typography.hero,
    fontWeight: Typography.extrabold,
    color: Colors.text,
    letterSpacing: -1,
  },
  
  textH1: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  
  textH2: {
    fontSize: Typography.h2,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  
  textH3: {
    fontSize: Typography.h3,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  
  textBody: {
    fontSize: Typography.body,
    fontWeight: Typography.regular,
    color: Colors.text,
    lineHeight: 24,
  },
  
  textCaption: {
    fontSize: Typography.caption,
    fontWeight: Typography.regular,
    color: Colors.textSecondary,
  },
  
  textSmall: {
    fontSize: Typography.small,
    fontWeight: Typography.regular,
    color: Colors.textMuted,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Utilities
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Animation,
  Screen,
  CommonStyles,
};
