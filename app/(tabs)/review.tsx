import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { SRSReviewCard } from '@/components/SRSReviewCard';
import { VocabularyWord } from '@/types/vocabulary';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';

export default function ReviewScreen() {
  const {
    wordsDueForReview,
    srsStatistics,
    loadSRSData,
    recordReview,
    updateProgress,
  } = useAppStore();
  const { theme } = useTheme();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<{
    wordId: string;
    quality: number;
  }[]>([]);

  useEffect(() => {
    loadSRSData();
  }, []);

  const currentWord = wordsDueForReview[currentWordIndex];
  const progress = {
    current: currentWordIndex + 1,
    total: wordsDueForReview.length,
  };

  const handleReviewComplete = async (quality: number) => {
    if (!currentWord) return;

    const newReviewedWords = [
      ...reviewedWords,
      { wordId: currentWord.id, quality },
    ];
    setReviewedWords(newReviewedWords);

    // Record the review
    await recordReview(currentWord.id, quality);

    // Move to next word or complete
    if (currentWordIndex < wordsDueForReview.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setIsReviewComplete(true);
      showReviewSummary();
    }
  };

  const handleSkip = () => {
    if (currentWordIndex < wordsDueForReview.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setIsReviewComplete(true);
      showReviewSummary();
    }
  };

  const showReviewSummary = () => {
    const totalReviewed = reviewedWords.length;
    const correctAnswers = reviewedWords.filter(r => r.quality >= 3).length;
    const accuracy = totalReviewed > 0 ? (correctAnswers / totalReviewed) * 100 : 0;

    Alert.alert(
      'Review Complete!',
      `You reviewed ${totalReviewed} words with ${accuracy.toFixed(1)}% accuracy.`,
      [
        {
          text: 'Continue',
          onPress: () => {
            // Reset for next session
            setCurrentWordIndex(0);
            setReviewedWords([]);
            setIsReviewComplete(false);
            loadSRSData();
          },
        },
      ]
    );
  };

  const startNewReview = () => {
    setCurrentWordIndex(0);
    setReviewedWords([]);
    setIsReviewComplete(false);
  };

  if (wordsDueForReview.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No words due for review!</Text>
          <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            Great job! You've completed all your reviews for today.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, ...getCardShadow(theme) }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{srsStatistics.totalWords}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Words</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, ...getCardShadow(theme) }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{srsStatistics.totalReviews}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Reviews</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, ...getCardShadow(theme) }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{srsStatistics.averageAccuracy.toFixed(1)}%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.primary }]} 
            onPress={loadSRSData}
          >
            <Text style={[styles.refreshButtonText, { color: theme.textInverse }]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isReviewComplete) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeIcon}>✅</Text>
          <Text style={[styles.completeTitle, { color: theme.text }]}>Review Complete!</Text>
          <Text style={[styles.completeDescription, { color: theme.textSecondary }]}>
            You've reviewed {reviewedWords.length} words today.
          </Text>
          
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: theme.success }]} 
            onPress={startNewReview}
          >
            <Text style={[styles.startButtonText, { color: theme.textInverse }]}>Start New Review</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Text style={[styles.title, { color: theme.text }]}>SRS Review</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Review {progress.current} of {progress.total} words
        </Text>
        
        {/* Simple Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: `${(progress.current / progress.total) * 100}%`,
                  backgroundColor: theme.success,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {Math.round((progress.current / progress.total) * 100)}%
          </Text>
        </View>
      </View>

      {/* Review Card */}
      {currentWord && (
        <SRSReviewCard
          word={currentWord}
          onComplete={handleReviewComplete}
          onSkip={handleSkip}
        />
      )}

      {/* Quick Stats */}
      <View style={[styles.quickStats, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.text }]}>{srsStatistics.wordsDueToday}</Text>
          <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Due Today</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.text }]}>{srsStatistics.wordsDueTomorrow}</Text>
          <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Due Tomorrow</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.text }]}>{srsStatistics.averageAccuracy.toFixed(1)}%</Text>
          <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Accuracy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}); 