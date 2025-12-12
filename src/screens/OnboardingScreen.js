import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to MyHealthID',
    description: 'Your medical records, secured on blockchain. Only you control who sees your data.',
    icon: '🏥',
    color: ['#667eea', '#764ba2']
  },
  {
    id: 2,
    title: 'How It Works',
    description: 'Hospitals upload your records → encrypted and stored → you approve who can access them.',
    icon: '🔐',
    color: ['#f093fb', '#f5576c']
  },
  {
    id: 3,
    title: 'Blockchain Verified',
    description: 'Every access is logged on blockchain. Insurance claims verified instantly.',
    icon: '⛓️',
    color: ['#4facfe', '#00f2fe']
  },
  {
    id: 4,
    title: 'Your Data, Your Control',
    description: 'Grant or revoke access anytime. View complete audit logs of who accessed your records.',
    icon: '👤',
    color: ['#43e97b', '#38f9d7']
  },
  {
    id: 5,
    title: 'Pilot Program Notice',
    description: 'This is a test version. Data is NOT HIPAA-compliant yet. Do not upload real medical records.',
    icon: '⚠️',
    color: ['#fa709a', '#fee140']
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.replace('RoleSelector');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    navigation.replace('RoleSelector');
  };

  const currentSlide = slides[currentIndex];

  return (
    <LinearGradient
      colors={currentSlide.color}
      style={styles.container}
    >
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>{currentSlide.icon}</Text>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  icon: {
    fontSize: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
