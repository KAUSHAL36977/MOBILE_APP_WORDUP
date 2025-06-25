import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserProgress } from '@/types/vocabulary';

const ACHIEVEMENTS_KEY = 'achievements';
const USER_PROGRESS_KEY = 'user_progress';

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'test' | 'social';
  maxProgress: number;
  condition: (progress: UserProgress) => number;
}

class AchievementService {
  private achievements: AchievementDefinition[] = [
    // Learning achievements
    {
      id: 'first_word',
      title: 'First Steps',
      description: 'Learn your first word',
      icon: '🌟',
      category: 'learning',
      maxProgress: 1,
      condition: (progress) => progress.totalWords,
    },
    {
      id: 'word_master_10',
      title: 'Word Explorer',
      description: 'Learn 10 words',
      icon: '📚',
      category: 'learning',
      maxProgress: 10,
      condition: (progress) => progress.totalWords,
    },
    {
      id: 'word_master_50',
      title: 'Vocabulary Builder',
      description: 'Learn 50 words',
      icon: '📖',
      category: 'learning',
      maxProgress: 50,
      condition: (progress) => progress.totalWords,
    },
    {
      id: 'word_master_100',
      title: 'Word Wizard',
      description: 'Learn 100 words',
      icon: '🧙‍♂️',
      category: 'learning',
      maxProgress: 100,
      condition: (progress) => progress.totalWords,
    },
    {
      id: 'word_master_500',
      title: 'Lexicon Legend',
      description: 'Learn 500 words',
      icon: '👑',
      category: 'learning',
      maxProgress: 500,
      condition: (progress) => progress.totalWords,
    },
    {
      id: 'perfect_session',
      title: 'Perfect Session',
      description: 'Complete a session with 100% accuracy',
      icon: '🎯',
      category: 'learning',
      maxProgress: 1,
      condition: (progress) => progress.averageAccuracy >= 100 ? 1 : 0,
    },
    {
      id: 'review_master',
      title: 'Review Master',
      description: 'Complete 100 reviews',
      icon: '🔄',
      category: 'learning',
      maxProgress: 100,
      condition: (progress) => progress.totalReviewsCompleted,
    },
    // Streak achievements
    {
      id: 'streak_3',
      title: 'Getting Started',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'streak',
      maxProgress: 3,
      condition: (progress) => progress.currentStreak,
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥🔥',
      category: 'streak',
      maxProgress: 7,
      condition: (progress) => progress.currentStreak,
    },
    {
      id: 'streak_30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🔥🔥🔥',
      category: 'streak',
      maxProgress: 30,
      condition: (progress) => progress.currentStreak,
    },
    {
      id: 'streak_100',
      title: 'Century Streak',
      description: 'Maintain a 100-day streak',
      icon: '🔥🔥🔥🔥',
      category: 'streak',
      maxProgress: 100,
      condition: (progress) => progress.currentStreak,
    },
    // Test achievements
    {
      id: 'test_perfect',
      title: 'Perfect Score',
      description: 'Get 100% on a test',
      icon: '🏆',
      category: 'test',
      maxProgress: 1,
      condition: (progress) => progress.averageAccuracy >= 100 ? 1 : 0,
    },
    {
      id: 'test_master',
      title: 'Test Master',
      description: 'Complete 10 tests',
      icon: '📝',
      category: 'test',
      maxProgress: 10,
      condition: (progress) => progress.sessionsCompleted,
    },
    // Social achievements (placeholder for future)
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Share 5 words with friends',
      icon: '🦋',
      category: 'social',
      maxProgress: 5,
      condition: (progress) => 0, // Placeholder
    },
  ];

  // Check and update achievements based on current progress
  async checkAchievements(progress: UserProgress): Promise<Achievement[]> {
    try {
      const currentAchievements = await this.getAchievements();
      const updatedAchievements: Achievement[] = [];

      for (const definition of this.achievements) {
        const currentAchievement = currentAchievements.find(a => a.id === definition.id);
        const currentProgress = definition.condition(progress);
        const isUnlocked = currentProgress >= definition.maxProgress;

        if (currentAchievement) {
          // Update existing achievement
          const updatedAchievement: Achievement = {
            ...currentAchievement,
            progress: Math.min(currentProgress, definition.maxProgress),
            unlocked: isUnlocked,
            unlockedAt: isUnlocked && !currentAchievement.unlocked 
              ? new Date().toISOString() 
              : currentAchievement.unlockedAt,
          };
          updatedAchievements.push(updatedAchievement);
        } else {
          // Create new achievement
          const newAchievement: Achievement = {
            id: definition.id,
            title: definition.title,
            description: definition.description,
            icon: definition.icon,
            unlocked: isUnlocked,
            unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
            progress: Math.min(currentProgress, definition.maxProgress),
            maxProgress: definition.maxProgress,
            category: definition.category,
          };
          updatedAchievements.push(newAchievement);
        }
      }

      await this.saveAchievements(updatedAchievements);
      return updatedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Get all achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Get unlocked achievements
  async getUnlockedAchievements(): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    return achievements.filter(a => a.unlocked);
  }

  // Get achievements by category
  async getAchievementsByCategory(category: Achievement['category']): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    return achievements.filter(a => a.category === category);
  }

  // Get recent achievements (unlocked in last 7 days)
  async getRecentAchievements(): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return achievements.filter(a => 
      a.unlocked && 
      a.unlockedAt && 
      new Date(a.unlockedAt) > weekAgo
    );
  }

  // Calculate XP from achievements
  calculateXP(achievements: Achievement[]): number {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, achievement) => {
        // Different categories give different XP
        const categoryMultiplier = {
          learning: 10,
          streak: 15,
          test: 20,
          social: 5,
        };
        
        return total + (achievement.maxProgress * categoryMultiplier[achievement.category]);
      }, 0);
  }

  // Calculate level from XP
  calculateLevel(xp: number): { level: number; xpToNext: number } {
    const baseXP = 100;
    const level = Math.floor(Math.sqrt(xp / baseXP)) + 1;
    const xpForCurrentLevel = (level - 1) ** 2 * baseXP;
    const xpForNextLevel = level ** 2 * baseXP;
    const xpToNext = xpForNextLevel - xp;

    return { level, xpToNext };
  }

  // Get achievement progress summary
  async getAchievementSummary(): Promise<{
    total: number;
    unlocked: number;
    progress: number;
    recentUnlocks: number;
  }> {
    const achievements = await this.getAchievements();
    const recentAchievements = await this.getRecentAchievements();

    return {
      total: achievements.length,
      unlocked: achievements.filter(a => a.unlocked).length,
      progress: achievements.length > 0 
        ? (achievements.filter(a => a.unlocked).length / achievements.length) * 100 
        : 0,
      recentUnlocks: recentAchievements.length,
    };
  }

  // Reset all achievements (for testing)
  async resetAchievements(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);
    } catch (error) {
      console.error('Error resetting achievements:', error);
    }
  }

  // Save achievements to storage
  private async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  // Get achievement definitions (for UI)
  getAchievementDefinitions(): AchievementDefinition[] {
    return [...this.achievements];
  }

  // Check if user should get a level up notification
  shouldShowLevelUp(oldXP: number, newXP: number): boolean {
    const oldLevel = this.calculateLevel(oldXP).level;
    const newLevel = this.calculateLevel(newXP).level;
    return newLevel > oldLevel;
  }

  // Get level up message
  getLevelUpMessage(level: number): string {
    const messages = [
      '🎉 Congratulations! You\'ve reached level ' + level + '!',
      '🚀 Level ' + level + ' achieved! Keep up the great work!',
      '⭐ You\'re now level ' + level + '! Your vocabulary is growing!',
      '🏆 Level ' + level + ' unlocked! You\'re becoming a word master!',
    ];
    
    return messages[level % messages.length];
  }
}

export const achievementService = new AchievementService(); 