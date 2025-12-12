// ═══════════════════════════════════════════════════════════════════════════
// Sentry Integration Test Utility
// Run these tests to verify Sentry is working correctly
// ═══════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/react-native';

export const sentryTest = {
  /**
   * Test 1: Capture a simple error
   */
  captureTestError: () => {
    try {
      throw new Error('🧪 Sentry Test: Manual error capture works!');
    } catch (error) {
      Sentry.captureException(error);
      console.log('✅ Test error sent to Sentry');
      return true;
    }
  },

  /**
   * Test 2: Capture a message
   */
  captureTestMessage: () => {
    Sentry.captureMessage('🧪 Sentry Test: Message capture works!', 'info');
    console.log('✅ Test message sent to Sentry');
    return true;
  },

  /**
   * Test 3: Add breadcrumbs
   */
  testBreadcrumbs: () => {
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User started Sentry test',
      level: 'info',
    });
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test breadcrumb 2',
      level: 'info',
    });
    Sentry.captureMessage('🧪 Sentry Test: Breadcrumbs attached', 'info');
    console.log('✅ Breadcrumbs sent to Sentry');
    return true;
  },

  /**
   * Test 4: Set user context
   */
  testUserContext: () => {
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@myhealthid.app',
      role: 'patient',
    });
    Sentry.captureMessage('🧪 Sentry Test: User context set', 'info');
    console.log('✅ User context sent to Sentry');
    return true;
  },

  /**
   * Test 5: Test with extra context
   */
  testExtraContext: () => {
    Sentry.withScope((scope) => {
      scope.setExtra('testData', { foo: 'bar', timestamp: Date.now() });
      scope.setTag('test_type', 'integration');
      Sentry.captureMessage('🧪 Sentry Test: Extra context attached', 'info');
    });
    console.log('✅ Extra context sent to Sentry');
    return true;
  },

  /**
   * Test 6: Use Sentry logger (if enabled)
   */
  testLogger: () => {
    if (Sentry.logger) {
      Sentry.logger.info('🧪 Sentry Logger Test: Info message');
      Sentry.logger.warn('🧪 Sentry Logger Test: Warning message');
      console.log('✅ Logger messages sent to Sentry');
      return true;
    }
    console.log('⚠️ Sentry logger not available');
    return false;
  },

  /**
   * Run all tests
   */
  runAllTests: () => {
    console.log('\n🔍 Starting Sentry Integration Tests...\n');
    
    const results = {
      errorCapture: sentryTest.captureTestError(),
      messageCapture: sentryTest.captureTestMessage(),
      breadcrumbs: sentryTest.testBreadcrumbs(),
      userContext: sentryTest.testUserContext(),
      extraContext: sentryTest.testExtraContext(),
      logger: sentryTest.testLogger(),
    };

    console.log('\n📊 Test Results:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });

    const allPassed = Object.values(results).every(r => r);
    console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`);
    console.log('📍 Check your Sentry dashboard: https://codecatalysts-c4.sentry.io/issues/\n');

    return results;
  },
};

export default sentryTest;
