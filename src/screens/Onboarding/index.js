// ═══════════════════════════════════════════════════════════════════════════
// MyHealthID - Animated Onboarding Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '🏥',
    title: 'Own Your Health Data',
    description: 'Your medical records belong to you. Access them anytime, anywhere with blockchain security.',
    color: Colors.primary,
    gradient: Colors.gradientPrimary,
  },
  {
    id: '2',
    icon: '🔐',
    title: 'Military-Grade Security',
    description: 'AES-256 encryption ensures your sensitive health data remains private and secure.',
    color: Colors.secondary,
    gradient: Colors.gradientSecondary,
  },
  {
    id: '3',
    icon: '⛓️',
    title: 'Blockchain Verified',
    description: 'Every record is verified on Ethereum blockchain, ensuring authenticity and tamper-proof storage.',
    color: Colors.accent,
    gradient: Colors.gradientSuccess,
  },
  {
    id: '4',
    icon: '🤝',
    title: 'Consent-Based Sharing',
    description: 'You control who sees your data. Grant and revoke access with a single tap.',
    color: Colors.primary,
    gradient: Colors.gradientPrimary,
  },
];

const AnimatedOnboarding = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Update progress
    Animated.timing(progressWidth, {
      toValue: ((currentIndex + 1) / SLIDES.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('RoleSelect');
    }
  };

  const handleSkip = () => {
    navigation.replace('RoleSelect');
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              transform: [{ scale }, { translateY }],
              opacity,
            },
          ]}
        >
          {/* Icon with glow */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconGlow, { backgroundColor: item.color + '30' }]} />
            <LinearGradient
              colors={item.gradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.icon}>{item.icon}</Text>
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Feature tags */}
          <View style={styles.featureTags}>
            <View style={[styles.featureTag, { borderColor: item.color }]}>
              <Text style={[styles.featureTagText, { color: item.color }]}>
                ✓ Secure
              </Text>
            </View>
            <View style={[styles.featureTag, { borderColor: item.color }]}>
              <Text style={[styles.featureTagText, { color: item.color }]}>
                ✓ Private
              </Text>
            </View>
            <View style={[styles.featureTag, { borderColor: item.color }]}>
              <Text style={[styles.featureTagText, { color: item.color }]}>
                ✓ Decentralized
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: currentIndex === index ? Colors.primary : Colors.textMuted,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#050510', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      <Animated.View style={[styles.skipContainer, { opacity: fadeIn }]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{currentIndex + 1}/{SLIDES.length}</Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Bottom section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }, { scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Text style={styles.nextButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  skipText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 60,
    gap: Spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.small,
    color: Colors.textMuted,
    width: 35,
    textAlign: 'right',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  slideContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing.xxxl,
  },
  iconGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -30,
    left: -30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: Spacing.xxl,
  },
  featureTags: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  featureTag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  featureTagText: {
    fontSize: Typography.small,
    fontWeight: Typography.medium,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
  },
  nextButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  nextButtonIcon: {
    fontSize: Typography.h3,
    color: Colors.text,
  },
});

export default AnimatedOnboarding;
