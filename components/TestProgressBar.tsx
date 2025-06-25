import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface TestProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  streak: number;
  maxStreak: number;
}

export default function TestProgressBar({
  currentQuestion,
  totalQuestions,
  streak,
  maxStreak,
}: TestProgressBarProps) {
  const progress = useSharedValue(0);
  const streakScale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withSpring(currentQuestion / totalQuestions, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentQuestion, totalQuestions]);

  React.useEffect(() => {
    streakScale.value = withTiming(1.2, { duration: 200 }, () => {
      streakScale.value = withTiming(1, { duration: 200 });
    });
  }, [streak]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const streakStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: streakScale.value }],
    };
  });

  const progressTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.1], [0, 1]);
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressInfo}>
          <Animated.Text style={[styles.progressText, progressTextStyle]}>
            Question {currentQuestion} of {totalQuestions}
          </Animated.Text>
          <Text style={styles.percentageText}>
            {Math.round((currentQuestion / totalQuestions) * 100)}%
          </Text>
        </View>
        
        <Animated.View style={[styles.streakContainer, streakStyle]}>
          <Text style={styles.streakLabel}>🔥 Streak</Text>
          <Text style={styles.streakText}>{streak}</Text>
          {maxStreak > 0 && (
            <Text style={styles.maxStreakText}>Best: {maxStreak}</Text>
          )}
        </Animated.View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 14,
    color: '#8B5FBF',
    fontWeight: '500',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  streakLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5FBF',
  },
  maxStreakText: {
    fontSize: 10,
    color: '#856404',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5FBF',
    borderRadius: 4,
  },
}); 