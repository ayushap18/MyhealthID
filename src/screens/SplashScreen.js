import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME, TYPOGRAPHY, SCREEN } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // Animation Values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.5)).current;
  const ringScale2 = useRef(new Animated.Value(0.5)).current;
  const ringOpacity1 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.8)).current;
  const backgroundShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Background gradient animation
    Animated.loop(
      Animated.timing(backgroundShift, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Logo entrance with spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Particles fade in
    Animated.timing(particleOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Pulsing rings
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ringScale1, {
              toValue: 2,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ringScale1, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringOpacity1, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity1, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }, 600);

    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ringScale2, {
              toValue: 2.5,
              duration: 2500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ringScale2, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringOpacity2, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity2, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }, 900);

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Title entrance
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.spring(titleTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle entrance
    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Finish after animations
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * width,
    y: Math.random() * height,
    delay: Math.random() * 2000,
    duration: Math.random() * 3000 + 2000,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.background, THEME.backgroundSecondary, THEME.backgroundTertiary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particleOpacity }]}>
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}
      </Animated.View>

      {/* Pulsing Rings */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale1 }],
            opacity: ringOpacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          {
            transform: [{ scale: ringScale2 }],
            opacity: ringOpacity2,
          },
        ]}
      />

      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseAnim) },
              { rotate: spin },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={THEME.gradients.primary}
          style={styles.logoBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoIcon}>🏥</Text>
        </LinearGradient>
        
        {/* Blockchain nodes decoration */}
        <View style={styles.nodeContainer}>
          <View style={[styles.node, styles.node1]} />
          <View style={[styles.node, styles.node2]} />
          <View style={[styles.node, styles.node3]} />
          <View style={[styles.node, styles.node4]} />
          <View style={styles.nodeLine1} />
          <View style={styles.nodeLine2} />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>MyHealthID</Text>
        <View style={styles.taglineContainer}>
          <View style={styles.taglineLine} />
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Blockchain Health Records
          </Animated.Text>
          <View style={styles.taglineLine} />
        </View>
      </Animated.View>

      {/* Tech badges */}
      <Animated.View style={[styles.techBadges, { opacity: subtitleOpacity }]}>
        <View style={styles.techBadge}>
          <Text style={styles.techBadgeText}>⛓️ Ethereum</Text>
        </View>
        <View style={styles.techBadge}>
          <Text style={styles.techBadgeText}>🔐 IPFS</Text>
        </View>
        <View style={styles.techBadge}>
          <Text style={styles.techBadgeText}>🛡️ AES-256</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Floating Particle Component
const FloatingParticle = ({ size, x, y, delay, duration }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: THEME.primary,
  },
  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  ring2: {
    borderColor: THEME.secondary,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  logoIcon: {
    fontSize: 60,
  },
  nodeContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
  },
  node: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.secondary,
  },
  node1: { top: 0, left: '50%', marginLeft: -6 },
  node2: { bottom: 0, left: '50%', marginLeft: -6 },
  node3: { left: 0, top: '50%', marginTop: -6 },
  node4: { right: 0, top: '50%', marginTop: -6 },
  nodeLine1: {
    position: 'absolute',
    width: 2,
    height: 180,
    left: '50%',
    marginLeft: -1,
    backgroundColor: THEME.secondary,
    opacity: 0.3,
  },
  nodeLine2: {
    position: 'absolute',
    width: 180,
    height: 2,
    top: '50%',
    marginTop: -1,
    backgroundColor: THEME.secondary,
    opacity: 0.3,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 1,
    marginBottom: 12,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taglineLine: {
    width: 40,
    height: 2,
    backgroundColor: THEME.primary,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  techBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 60,
  },
  techBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
  },
  techBadgeText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
});

const SHADOWS = {
  lg: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
