import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { THEME, SPACING, RADIUS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '🏥',
    title: 'Welcome to MyHealthID',
    description: 'Your medical records, secured on blockchain. Take complete control of your health data.',
    gradient: ['#6366F1', '#8B5CF6'],
    accent: '#6366F1',
  },
  {
    id: '2',
    icon: '🔐',
    title: 'Military-Grade Security',
    description: 'AES-256 encryption protects every record. Your data is encrypted before leaving your device.',
    gradient: ['#14B8A6', '#06B6D4'],
    accent: '#14B8A6',
  },
  {
    id: '3',
    icon: '⛓️',
    title: 'Blockchain Verified',
    description: 'Every access is permanently logged on Ethereum. Tamper-proof audit trail for complete transparency.',
    gradient: ['#F472B6', '#EC4899'],
    accent: '#F472B6',
  },
  {
    id: '4',
    icon: '🌐',
    title: 'Decentralized Storage',
    description: 'Records stored on IPFS/Filecoin. No single point of failure, accessible worldwide.',
    gradient: ['#3B82F6', '#2563EB'],
    accent: '#3B82F6',
  },
  {
    id: '5',
    icon: '👤',
    title: 'You Are In Control',
    description: 'Grant or revoke access instantly. You decide who sees your medical history.',
    gradient: ['#10B981', '#059669'],
    accent: '#10B981',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateSlide();
  }, [currentIndex]);

  const animateSlide = () => {
    // Reset animations
    iconScale.setValue(0);
    iconRotate.setValue(0);
    textOpacity.setValue(0);
    textTranslateY.setValue(30);
    buttonOpacity.setValue(0);

    // Start animations
    Animated.parallel([
      // Icon bounce in
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      // Icon rotate
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      // Text slide up
      Animated.spring(textTranslateY, {
        toValue: 0,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Button fade in
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
      // Progress bar
      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / slides.length,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.replace('RoleSelector');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    navigation.replace('RoleSelector');
  };

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.Text
            style={[
              styles.icon,
              {
                transform: [
                  { scale: index === currentIndex ? iconScale : 1 },
                  { rotate: index === currentIndex ? spin : '0deg' },
                ],
              },
            ]}
          >
            {item.icon}
          </Animated.Text>
        </LinearGradient>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: index === currentIndex ? textOpacity : 1,
              transform: [{ translateY: index === currentIndex ? textTranslateY : 0 }],
            },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.background, THEME.backgroundSecondary]}
        style={styles.background}
      />

      {/* Decorative Elements */}
      <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: currentSlide.accent + '20' }]} />
      <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: currentSlide.accent + '15' }]} />
      <View style={[styles.decorCircle, styles.decorCircle3, { backgroundColor: currentSlide.accent + '10' }]} />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth, backgroundColor: currentSlide.accent },
            ]}
          />
        </View>
      </View>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.slidesContainer}
      />

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: buttonOpacity }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && [styles.activeDot, { backgroundColor: currentSlide.accent }],
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={currentSlide.gradient}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Text style={styles.nextArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  decorCircle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 300,
    height: 300,
    bottom: 100,
    left: -100,
  },
  decorCircle3: {
    width: 200,
    height: 200,
    top: '40%',
    right: -50,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  progressBg: {
    height: 4,
    backgroundColor: THEME.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skipButton: {
    position: 'absolute',
    top: 80,
    right: SPACING.lg,
    zIndex: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skipText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  slidesContainer: {
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 100,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.card,
  },
  activeDot: {
    width: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: RADIUS.lg,
    gap: 12,
  },
  nextText: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
  },
  nextArrow: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
