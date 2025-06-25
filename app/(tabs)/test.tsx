import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import TestProgressBar from '@/components/TestProgressBar';
import QuestionCard from '@/components/QuestionCard';
import TestResultsScreen from '@/components/TestResultsScreen';
import { Sparkles, Play, Target, Clock } from 'lucide-react-native';
import { TestResult } from '@/types/test';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TestScreen() {
  const {
    testQuestions,
    testProgress,
    currentTestSession,
    isLoading,
    error,
    generateTest,
    startTest,
    answerQuestion,
    completeTest,
    retryTest,
    selectedCategory,
  } = useAppStore();

  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Animation values
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (testStarted && !testProgress.isComplete) {
        Alert.alert(
          'Exit Test?',
          'Are you sure you want to exit? Your progress will be lost.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => resetTest() },
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [testStarted, testProgress.isComplete]);

  useEffect(() => {
    if (testProgress.isComplete && currentTestSession) {
      handleTestComplete();
    }
  }, [testProgress.isComplete]);

  useEffect(() => {
    if (testStarted && !testProgress.isComplete) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [testStarted, testProgress.isComplete]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      // Update time elapsed in store if needed
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartTest = async () => {
    try {
      await generateTest(selectedCategory, 20);
      startTest();
      setTestStarted(true);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Animation
      containerScale.value = withSpring(0.95, { damping: 15 }, () => {
        containerScale.value = withSpring(1, { damping: 15 });
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start test. Please try again.');
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentTestSession || testProgress.isComplete) return;

    const currentQuestion = testQuestions[testProgress.currentQuestion];
    const isCorrect = answer === currentQuestion.correctAnswer;

    // Haptic feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Answer the question
    answerQuestion(currentQuestion.id, answer);

    // Wait a bit before moving to next question
    setTimeout(() => {
      if (testProgress.currentQuestion < testQuestions.length - 1) {
        // Animate to next question
        containerOpacity.value = withTiming(0, { duration: 200 }, () => {
          containerOpacity.value = withTiming(1, { duration: 200 });
        });
      }
    }, 1500);
  };

  const handleTestComplete = async () => {
    try {
      stopTimer();
      const result = await completeTest();
      setCurrentResult(result);
      setShowResults(true);
      setTestStarted(false);
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete test.');
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setShowResults(false);
    setCurrentResult(null);
    stopTimer();
    
    // Reset animations
    containerScale.value = 1;
    containerOpacity.value = 1;
  };

  const handleRetry = async () => {
    setShowResults(false);
    setCurrentResult(null);
    await retryTest();
    setTestStarted(true);
  };

  const handleStudyMissed = () => {
    // TODO: Navigate to study missed words
    Alert.alert('Coming Soon', 'Study missed words feature will be available soon!');
  };

  const handleShare = () => {
    if (!currentResult) return;
    
    const shareText = `🎯 I scored ${Math.round(currentResult.accuracy)}% on my WordUp vocabulary test!\n\n` +
      `✅ ${currentResult.correctAnswers}/${currentResult.totalQuestions} correct answers\n` +
      `🔥 Best streak: ${currentResult.maxStreak}\n` +
      `⏱️ Time: ${Math.floor(currentResult.timeTaken / 60)}:${(currentResult.timeTaken % 60).toString().padStart(2, '0')}\n\n` +
      `Download WordUp to improve your vocabulary!`;
    
    // For now, just show an alert. In a real app, use expo-sharing
    Alert.alert('Share Results', shareText);
  };

  const handleClose = () => {
    resetTest();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCard, { transform: [{ scale: containerScale.value }] }]}>
            <Sparkles size={48} color="#8B5FBF" />
            <Text style={styles.loadingTitle}>Preparing Your Test</Text>
            <Text style={styles.loadingText}>Generating questions...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleStartTest}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Results screen
  if (showResults && currentResult) {
    return (
      <TestResultsScreen
        result={currentResult}
        onRetry={handleRetry}
        onStudyMissed={handleStudyMissed}
        onShare={handleShare}
        onClose={handleClose}
      />
    );
  }

  // Test in progress
  if (testStarted && testQuestions.length > 0 && testProgress.currentQuestion < testQuestions.length) {
    const currentQuestion = testQuestions[testProgress.currentQuestion];
    const userAnswer = currentTestSession?.userAnswers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    return (
      <SafeAreaView style={styles.container}>
        <TestProgressBar
          currentQuestion={testProgress.currentQuestion + 1}
          totalQuestions={testQuestions.length}
          streak={testProgress.streak}
          maxStreak={testProgress.maxStreak}
        />
        
        <Animated.View style={[styles.testContainer, { opacity: containerOpacity.value }]}>
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            isAnswered={!!userAnswer}
            selectedAnswer={userAnswer}
            isCorrect={isCorrect}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Start screen
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.startContainer, { transform: [{ scale: containerScale.value }] }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Sparkles size={32} color="#8B5FBF" />
            <Text style={styles.title}>Vocabulary Test</Text>
          </View>
          <Text style={styles.subtitle}>Test your knowledge with interactive questions</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Target size={24} color="#8B5FBF" />
            <Text style={styles.featureText}>20 Mixed Questions</Text>
          </View>
          <View style={styles.featureItem}>
            <Clock size={24} color="#8B5FBF" />
            <Text style={styles.featureText}>Timed Challenge</Text>
          </View>
          <View style={styles.featureItem}>
            <Sparkles size={24} color="#8B5FBF" />
            <Text style={styles.featureText}>Streak Tracking</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Play size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Test</Text>
        </TouchableOpacity>

        <Text style={styles.categoryText}>
          Category: {selectedCategory}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#8B5FBF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8B5FBF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: '#8B5FBF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#8B5FBF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 24,
    fontWeight: '500',
  },
}); 