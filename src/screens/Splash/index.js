// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Premium Animated Splash Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

const AnimatedSplash = ({ onComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.8)).current;
  const ringScale2 = useRef(new Animated.Value(0.8)).current;
  const ringScale3 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const ringOpacity3 = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  // DNA Helix particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
    angle: (i / 12) * Math.PI * 2,
  }));

  useEffect(() => {
    // Staggered animation sequence
    const animationSequence = Animated.sequence([
      // Phase 1: Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Phase 2: Rings expand
      Animated.stagger(150, [
        Animated.parallel([
          Animated.spring(ringScale1, { toValue: 1.5, tension: 30, friction: 8, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0.6, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(ringScale2, { toValue: 2, tension: 30, friction: 8, useNativeDriver: true }),
          Animated.timing(ringOpacity2, { toValue: 0.4, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(ringScale3, { toValue: 2.5, tension: 30, friction: 8, useNativeDriver: true }),
          Animated.timing(ringOpacity3, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        ]),
      ]),

      // Phase 3: Text reveal
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslate, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(particlesOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Subtitle
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Hold
      Animated.delay(800),

      // Phase 5: Fade out
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    // Start main sequence
    animationSequence.start(() => {
      onComplete && onComplete();
    });

    // Continuous animations
    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scan line
    Animated.loop(
      Animated.timing(scanLine, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Particle animations
    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateY, {
            toValue: -20,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: 0,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(particle.opacity, {
        toValue: 0.6,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scanLinePosition = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, height + 100],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background grid pattern */}
      <View style={styles.gridOverlay} />

      {/* Scan line effect */}
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: scanLinePosition }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', Colors.primary + '40', 'transparent']}
          style={styles.scanLineGradient}
        />
      </Animated.View>

      {/* Floating particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particlesOpacity }]}>
        {particles.map((particle, index) => {
          const x = Math.cos(particle.angle) * 120;
          const y = Math.sin(particle.angle) * 120;
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: width / 2 + x - 4,
                  top: height / 2 + y - 4,
                  opacity: particle.opacity,
                  transform: [{ translateY: particle.translateY }],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Animated rings */}
      <View style={styles.ringsContainer}>
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringScale1 }],
              opacity: ringOpacity1,
              borderColor: Colors.primary,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringScale2 }],
              opacity: ringOpacity2,
              borderColor: Colors.secondary,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringScale3 }],
              opacity: ringOpacity3,
              borderColor: Colors.primary,
            },
          ]}
        />
      </View>

      {/* Main logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }, { rotate: logoRotation }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Animated.View style={[styles.glowEffect, { opacity: glowPulse }]} />
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Text style={styles.logoIcon}>🏥</Text>
        </LinearGradient>
      </Animated.View>

      {/* Brand text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          },
        ]}
      >
        <Text style={styles.brandText}>
          <Text style={styles.brandHighlight}>My</Text>HealthID
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={{ opacity: subtitleOpacity }}>
        <Text style={styles.tagline}>Decentralized Health Records</Text>
        <View style={styles.techBadges}>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>⛓️ Blockchain</Text>
          </View>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>🔐 Encrypted</Text>
          </View>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>🌐 IPFS</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorLine} />
        <Text style={styles.versionText}>v1.0.0</Text>
        <View style={styles.decorLine} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
    // Grid pattern would be added via SVG or image
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
  },
  scanLineGradient: {
    flex: 1,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  ringsContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  glowEffect: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  techBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  techBadge: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  techBadgeText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  decorLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
  },
  versionText: {
    fontSize: Typography.small,
    color: Colors.textMuted,
  },
});

export default AnimatedSplash;
