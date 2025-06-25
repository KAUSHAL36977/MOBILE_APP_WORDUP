import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { AchievementsScreen } from '@/components/AchievementsScreen';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';

export default function ProgressScreen() {
  const { userProgress, srsStatistics, achievements, loadSRSData, loadAchievements } = useAppStore();
  const { theme } = useTheme();

  useEffect(() => {
    loadSRSData();
    loadAchievements();
  }, []);

  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <Text style={[styles.title, { color: theme.text }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Track your learning journey</Text>
        </View>

        {/* Level Progress */}
        <View style={[styles.levelSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <View style={styles.levelHeader}>
            <Text style={[styles.levelTitle, { color: theme.text }]}>Level {userProgress.currentLevel}</Text>
            <Text style={[styles.levelSubtitle, { color: theme.textSecondary }]}>Vocabulary Master</Text>
          </View>
          
          <View style={styles.levelProgressContainer}>
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
            <Text style={[styles.levelProgressText, { color: theme.textSecondary }]}>
              {userProgress.currentXP} / {userProgress.xpToNextLevel} XP to next level
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.totalWords}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words Learned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{userProgress.currentXP}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{achievements.filter(a => a.unlocked).length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* SRS Statistics */}
        <View style={[styles.srsSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>SRS Statistics</Text>
          
          <View style={styles.srsStats}>
            <View style={[styles.srsStatCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.srsStatIcon}>📚</Text>
              <Text style={[styles.srsStatNumber, { color: theme.text }]}>{srsStatistics.totalWords}</Text>
              <Text style={[styles.srsStatLabel, { color: theme.textSecondary }]}>Total Words</Text>
            </View>
            <View style={[styles.srsStatCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.srsStatIcon}>🔄</Text>
              <Text style={[styles.srsStatNumber, { color: theme.text }]}>{srsStatistics.totalReviews}</Text>
              <Text style={[styles.srsStatLabel, { color: theme.textSecondary }]}>Total Reviews</Text>
            </View>
            <View style={[styles.srsStatCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.srsStatIcon}>📅</Text>
              <Text style={[styles.srsStatNumber, { color: theme.text }]}>{srsStatistics.wordsDueToday}</Text>
              <Text style={[styles.srsStatLabel, { color: theme.textSecondary }]}>Due Today</Text>
            </View>
            <View style={[styles.srsStatCard, { backgroundColor: theme.surfaceVariant, ...getCardShadow(theme) }]}>
              <Text style={styles.srsStatIcon}>🎯</Text>
              <Text style={[styles.srsStatNumber, { color: theme.text }]}>{srsStatistics.averageAccuracy.toFixed(1)}%</Text>
              <Text style={[styles.srsStatLabel, { color: theme.textSecondary }]}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={[styles.achievementsSection, { backgroundColor: theme.surface }]}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Achievements</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentAchievements.length === 0 ? (
            <View style={styles.emptyAchievements}>
              <Text style={styles.emptyAchievementsIcon}>🏆</Text>
              <Text style={[styles.emptyAchievementsText, { color: theme.textSecondary }]}>
                No achievements unlocked yet. Keep learning to earn your first badge!
              </Text>
            </View>
          ) : (
            <View style={styles.recentAchievementsList}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementItem, { backgroundColor: theme.surfaceVariant }]}>
                  <Text style={styles.achievementItemIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementItemInfo}>
                    <Text style={[styles.achievementItemTitle, { color: theme.text }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementItemDate, { color: theme.textSecondary }]}>
                      {new Date(achievement.unlockedAt || 0).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
  },
  levelSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  levelHeader: {
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 16,
  },
  levelProgressContainer: {
    marginBottom: 20,
  },
  levelProgressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  levelProgressText: {
    fontSize: 14,
    textAlign: 'center',
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
  srsSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  srsStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  srsStatCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  srsStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  srsStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  srsStatLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementsSection: {
    padding: 20,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyAchievements: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAchievementsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyAchievementsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  recentAchievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  achievementItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementItemInfo: {
    flex: 1,
  },
  achievementItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementItemDate: {
    fontSize: 12,
  },
});