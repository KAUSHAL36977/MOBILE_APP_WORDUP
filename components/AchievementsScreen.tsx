import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Achievement } from '@/types/vocabulary';
import { useAppStore } from '@/store/useAppStore';
import { achievementService } from '@/services/achievementService';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const { theme } = useTheme();
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        {
          backgroundColor: theme.surface,
          ...getCardShadow(theme),
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: theme.text }]}>{achievement.title}</Text>
          <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>{achievement.description}</Text>
        </View>
        <View style={styles.achievementStatus}>
          {achievement.unlocked ? (
            <Text style={[styles.unlockedText, { color: theme.success }]}>✓</Text>
          ) : (
            <Text style={styles.lockedText}>🔒</Text>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: achievement.unlocked ? theme.success : theme.border,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {achievement.progress} / {achievement.maxProgress}
        </Text>
      </View>

      {achievement.unlocked && achievement.unlockedAt && (
        <Text style={[styles.unlockedDate, { color: theme.success }]}>
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </Animated.View>
  );
};

export const AchievementsScreen: React.FC = () => {
  const { achievements, userProgress, loadAchievements } = useAppStore();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [summary, setSummary] = useState({
    total: 0,
    unlocked: 0,
    progress: 0,
    recentUnlocks: 0,
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      const achievementSummary = await achievementService.getAchievementSummary();
      setSummary(achievementSummary);
    };
    loadSummary();
  }, [achievements]);

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'streak', label: 'Streaks', icon: '🔥' },
    { id: 'test', label: 'Tests', icon: '📝' },
    { id: 'social', label: 'Social', icon: '👥' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Track your learning progress</Text>
      </View>

      {/* Progress Summary */}
      <View style={[styles.summaryContainer, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{summary.unlocked}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Unlocked</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{summary.total}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{Math.round(summary.progress)}%</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Progress</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{summary.recentUnlocks}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Recent</Text>
        </View>
      </View>

      {/* User Level */}
      <View style={[styles.levelContainer, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Text style={[styles.levelTitle, { color: theme.text }]}>Level {userProgress.currentLevel}</Text>
        <View style={[styles.levelProgressBar, { backgroundColor: theme.divider }]}>
          <View
            style={[
              styles.levelProgressFill,
              {
                width: `${((userProgress.currentXP % 100) / 100) * 100}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <Text style={[styles.levelText, { color: theme.textSecondary }]}>
          {userProgress.currentXP} XP • {userProgress.xpToNextLevel} XP to next level
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoryTabs, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              {
                backgroundColor: selectedCategory === category.id ? theme.primary : theme.surfaceVariant,
              },
            ]}
            onPress={() => setSelectedCategory(category.id as any)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                {
                  color: selectedCategory === category.id ? theme.textInverse : theme.textSecondary,
                },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements List */}
      <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
        {filteredAchievements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No achievements yet</Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              Start learning words to unlock your first achievement!
            </Text>
          </View>
        ) : (
          filteredAchievements.map((achievement, index) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    fontSize: 14,
  },
  categoryTabs: {
    borderBottomWidth: 1,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsList: {
    flex: 1,
    padding: 20,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedText: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  unlockedDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 