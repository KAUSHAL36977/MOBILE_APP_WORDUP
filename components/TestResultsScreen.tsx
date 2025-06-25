import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { TestResult } from '@/types/test';
import { Trophy, Clock, Target, Share2, RotateCcw, BookOpen } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TestResultsScreenProps {
  result: TestResult;
  onRetry: () => void;
  onStudyMissed: () => void;
  onShare: () => void;
  onClose: () => void;
}

export default function TestResultsScreen({
  result,
  onRetry,
  onStudyMissed,
  onShare,
  onClose,
}: TestResultsScreenProps) {
  const progressValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);
  const opacityValue = useSharedValue(0);

  useEffect(() => {
    // Animate in the results
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacityValue.value = withTiming(1, { duration: 500 });
    
    // Animate the progress circle
    progressValue.value = withDelay(300, withSpring(result.accuracy / 100, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progressValue.value * 360}deg` }],
    };
  });

  const getAccuracyColor = () => {
    if (result.accuracy >= 90) return '#28a745';
    if (result.accuracy >= 70) return '#ffc107';
    return '#dc3545';
  };

  const getAccuracyMessage = () => {
    if (result.accuracy >= 90) return 'Excellent!';
    if (result.accuracy >= 70) return 'Good job!';
    if (result.accuracy >= 50) return 'Keep practicing!';
    return 'Keep learning!';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Test Complete!</Text>
          <Text style={styles.subtitle}>{getAccuracyMessage()}</Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
            <View style={styles.progressCenter}>
              <Text style={[styles.accuracyText, { color: getAccuracyColor() }]}>
                {Math.round(result.accuracy)}%
              </Text>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Target size={20} color="#8B5FBF" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{result.correctAnswers}/{result.totalQuestions}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Clock size={20} color="#8B5FBF" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatTime(result.timeTaken)}</Text>
              <Text style={styles.statLabel}>Time Taken</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Trophy size={20} color="#8B5FBF" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{result.maxStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Words to Review */}
        {result.wordsToReview.length > 0 && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Words to Review</Text>
            <Text style={styles.reviewText}>
              {result.wordsToReview.length} word{result.wordsToReview.length !== 1 ? 's' : ''} to practice
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
            <RotateCcw size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Take Test Again</Text>
          </TouchableOpacity>

          {result.wordsToReview.length > 0 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onStudyMissed}>
              <BookOpen size={20} color="#8B5FBF" />
              <Text style={styles.secondaryButtonText}>Study Missed Words</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Share2 size={20} color="#8B5FBF" />
            <Text style={styles.shareButtonText}>Share Results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#8B5FBF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#8B5FBF',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressCenter: {
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  reviewContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#856404',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5FBF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5FBF',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#8B5FBF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  shareButtonText: {
    color: '#8B5FBF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
}); 