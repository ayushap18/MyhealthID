import './src/polyfills';
import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Context
import { AuthProvider } from './src/context/AuthContext';

// Services
import socketService from './src/services/socketService';
import { setSessionExpiredCallback } from './src/services/apiService';

// Utils
import toast from './src/utils/toast';
import logger from './src/utils/logger';

// Components
import NotificationBanner from './src/components/NotificationBanner';

// ═══════════════════════════════════════════════════════════════════════════
// NEW PREMIUM ANIMATED SCREENS
// ═══════════════════════════════════════════════════════════════════════════

// Splash & Onboarding
import AnimatedSplash from './src/screens/Splash';
import AnimatedOnboarding from './src/screens/Onboarding';
import RoleSelect from './src/screens/RoleSelect';

// Auth Screens
import PatientAuth from './src/screens/Auth/PatientAuth';
import HospitalAuth from './src/screens/Auth/HospitalAuth';
import InsurerAuth from './src/screens/Auth/InsurerAuth';

// Dashboard Screens
import PatientDashboard from './src/screens/Dashboard/PatientDashboard';
import HospitalDashboard from './src/screens/Dashboard/HospitalDashboard';
import InsurerDashboard from './src/screens/Dashboard/InsurerDashboard';

// Hospital Specific Screens
import UploadRecord from './src/screens/hospital/UploadRecord';

// Settings & Policy
import SettingsScreen from './src/screens/SettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';

// Legacy/Placeholder Screens (kept as requested)
import ConsentManagerScreen from './src/screens/patient/ConsentManagerScreen';
import AuditLogScreen from './src/screens/patient/AuditLogScreen';
import RecordDetailScreen from './src/screens/patient/RecordDetailScreen';
import EmergencyAccessScreen from './src/screens/patient/EmergencyAccessScreen';
import QRHealthCardScreen from './src/screens/patient/QRHealthCardScreen';
import RequestAccessScreen from './src/screens/insurer/RequestAccessScreen';
import VerifyRecordScreen from './src/screens/insurer/VerifyRecordScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://ba362b6c03946ef3b80383e49d43c1a7@o4510520744673280.ingest.us.sentry.io/4510520756666368',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const Stack = createStackNavigator();

export default Sentry.wrap(function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef(null);

  // Handle session expiry - redirect to login
  const handleSessionExpired = useCallback(() => {
    logger.info('App', 'Session expired, redirecting to login');
    toast.sessionExpired();
    
    // Navigate to role select after brief delay
    setTimeout(() => {
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'RoleSelect' }],
        });
      }
    }, 500);
  }, []);

  useEffect(() => {
    // Register session expiry callback
    setSessionExpiredCallback(handleSessionExpired);

    // Socket will connect automatically when user logs in
    // No need to connect on app startup
    return () => {
      socketService.disconnect();
      setSessionExpiredCallback(null);
    };
  }, [handleSessionExpired]);

  // Show animated splash screen first
  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <AnimatedSplash onComplete={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={styles.container}>
        <NotificationBanner />
        <StatusBar style="light" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, next, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                    {
                      scale: next
                        ? next.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.95],
                          })
                        : 1,
                    },
                  ],
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
                overlayStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                },
              }),
            }}
          >
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* ONBOARDING FLOW */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Stack.Screen name="Onboarding" component={AnimatedOnboarding} />
            <Stack.Screen name="RoleSelect" component={RoleSelect} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* PATIENT FLOW */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Stack.Screen 
              name="PatientAuth" 
              component={PatientAuth}
              options={{
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: { opacity: current.progress },
                }),
              }}
            />
            <Stack.Screen 
              name="PatientDashboard" 
              component={PatientDashboard}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="ConsentManager" component={ConsentManagerScreen} />
            <Stack.Screen name="AuditLog" component={AuditLogScreen} />
            <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
            <Stack.Screen name="PatientRecords" component={AuditLogScreen} />
            <Stack.Screen name="ShareRecords" component={ConsentManagerScreen} />
            <Stack.Screen name="AccessHistory" component={AuditLogScreen} />
            <Stack.Screen name="EmergencyAccess" component={EmergencyAccessScreen} />
            <Stack.Screen name="QRHealthCard" component={QRHealthCardScreen} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* HOSPITAL FLOW */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Stack.Screen 
              name="HospitalAuth" 
              component={HospitalAuth}
              options={{
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: { opacity: current.progress },
                }),
              }}
            />
            <Stack.Screen 
              name="HospitalDashboard" 
              component={HospitalDashboard}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="UploadRecord" component={UploadRecord} />
            <Stack.Screen name="PatientList" component={AuditLogScreen} />
            <Stack.Screen name="VerifyPatient" component={AuditLogScreen} />
            <Stack.Screen name="UploadHistory" component={AuditLogScreen} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* INSURER FLOW */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Stack.Screen 
              name="InsurerAuth" 
              component={InsurerAuth}
              options={{
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: { opacity: current.progress },
                }),
              }}
            />
            <Stack.Screen 
              name="InsurerDashboard" 
              component={InsurerDashboard}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="NewAccessRequest" component={RequestAccessScreen} />
            <Stack.Screen name="VerifyRecords" component={VerifyRecordScreen} />
            <Stack.Screen name="PendingRequests" component={AuditLogScreen} />
            <Stack.Screen name="RequestHistory" component={AuditLogScreen} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* COMMON SCREENS */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={PrivacyPolicyScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </AuthProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});