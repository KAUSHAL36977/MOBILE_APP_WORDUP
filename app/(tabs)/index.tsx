import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import SwipeableCard from '@/components/SwipeableCard';
import CompletionScreen from '@/components/CompletionScreen';
import { Sparkles, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    currentSession,
    currentWordIndex,
    isLoading,
    error,
    loadTodaysSession,
    markWordAsFavorite,
    markWordAsKnown,
    shareWord,
    requestNewWordSet,
    resetSession,
    userProgress,
    srsStatistics,
    loadSRSData,
  } = useAppStore();
  const { theme } = useTheme();

  const [completedActions, setCompletedActions] = useState({
    favorites: 0,
    known: 0,
  });

  useEffect(() => {
    loadTodaysSession();
    loadSRSData();
  }, []);

  const handleSwipeLeft = async (wordId: string) => {
    await markWordAsFavorite(wordId);
    setCompletedActions(prev => ({ ...prev, favorites: prev.favorites + 1 }));
  };

  const handleSwipeRight = async (wordId: string) => {
    await markWordAsKnown(wordId);
    setCompletedActions(prev => ({ ...prev, known: prev.known + 1 }));
  };

  const handleLongPress = async (wordId: string) => {
    try {
      await shareWord(wordId);
    } catch (error) {
      Alert.alert('Share Error', 'Unable to share this word. Please try again.');
    }
  };

  const handleRequestNewSet = async () => {
    Alert.alert(
      'New Word Set',
      'Are you sure you want to get a new set of words? This will replace your current session.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Get New Words', 
          onPress: async () => {
            await requestNewWordSet();
            setCompletedActions({ favorites: 0, known: 0 });
          }
        }
      ]
    );
  };

  const handleResetSession = () => {
    Alert.alert(
      'Reset Session',
      'Do you want to restart the current word set from the beginning?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            resetSession();
            setCompletedActions({ favorites: 0, known: 0 });
          }
        }
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to expand your vocabulary?",
      "Every word learned is a step forward!",
      "Your brain is a muscle - let's exercise it!",
      "Knowledge is power, words are your tools!",
      "Today's learning shapes tomorrow's success!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.loadingCard, { backgroundColor: theme.surfaceVariant }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading your words...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.errorCard, { backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadTodaysSession}>
              <Text style={[styles.retryButtonText, { color: theme.text }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentSession || currentSession.words.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.emptyCard, { backgroundColor: theme.surfaceVariant }]}>
            <Text style={[styles.emptyText, { color: theme.text }]}>No words available</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={handleRequestNewSet}>
              <Text style={[styles.retryButtonText, { color: theme.text }]}>Get Words</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Check if all words have been completed
  const isSessionComplete = currentWordIndex >= currentSession.words.length;

  if (isSessionComplete) {
    return (
      <CompletionScreen
        onRequestNewSet={handleRequestNewSet}
        wordsCompleted={currentSession.words.length}
        favoriteCount={completedActions.favorites}
        knownCount={completedActions.known}
      />
    );
  }

  // Get current and upcoming cards for stacking effect
  const visibleCards = currentSession.words.slice(currentWordIndex, currentWordIndex + 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <Text style={[styles.greeting, { color: theme.text }]}>{getGreeting()}!</Text>
          <Text style={[styles.motivationalMessage, { color: theme.textSecondary }]}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.totalWords}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words Learned</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{srsStatistics.wordsDueToday}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Due Today</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.currentLevel}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level</Text>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <View style={[styles.levelSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Level Progress</Text>
          
          <View style={styles.levelInfo}>
            <Text style={[styles.levelText, { color: theme.text }]}>Level {userProgress.currentLevel}</Text>
            <Text style={[styles.xpText, { color: theme.textSecondary }]}>
              {userProgress.currentXP} / {userProgress.xpToNextLevel} XP
            </Text>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((userProgress.currentXP % 100) / 100) * 100}%`,
                  backgroundColor: theme.success,
                },
              ]}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Review</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                {srsStatistics.wordsDueToday} words due
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Test</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                Challenge yourself
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Browse</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                Explore words
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Progress</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                View stats
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Session */}
        <View style={[styles.sessionSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Words</Text>
          
          <View style={styles.sessionWords}>
            {currentSession.words.slice(0, 3).map((word, index) => (
              <View key={word.id} style={[styles.wordItem, { backgroundColor: theme.surfaceVariant }]}>
                <Text style={[styles.wordText, { color: theme.text }]}>{word.word}</Text>
                <Text style={[styles.wordDefinition, { color: theme.textSecondary }]}>
                  {word.definition}
                </Text>
              </View>
            ))}
          </View>
          
          {currentSession.words.length > 3 && (
            <Text style={[styles.moreWordsText, { color: theme.textSecondary }]}>
              +{currentSession.words.length - 3} more words
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCard: {
    backgroundColor: '#F8F6FF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5FBF',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorCard: {
    backgroundColor: '#FFE8E8',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#FFB5B5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#B85450',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCard: {
    backgroundColor: '#F8F6FF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#8B5FBF',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
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
  levelSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  sessionSection: {
    padding: 20,
  },
  sessionWords: {
    gap: 12,
  },
  wordItem: {
    padding: 16,
    borderRadius: 12,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wordDefinition: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreWordsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});