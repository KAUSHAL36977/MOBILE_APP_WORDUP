export type Category = 'Science' | 'Technology' | 'Arts' | 'Literature';

export interface VocabularyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  category: Category;
  dateGenerated: string;
  // SRS fields
  srsLevel: number;
  nextReview: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  // Audio fields
  pronunciation?: string;
  audioUrl?: string;
  phonetic?: string;
}

// SRS Algorithm types
export interface SRSData {
  wordId: string;
  level: number;
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  easeFactor: number;
  interval: number;
}

export interface SRSResult {
  newLevel: number;
  newInterval: number;
  newEaseFactor: number;
  nextReview: Date;
}

// Audio Pronunciation types
export type AccentType = 'US' | 'UK' | 'AU';

export interface PronunciationData {
  wordId: string;
  accent: AccentType;
  audioUrl: string;
  phonetic: string;
  speed: number; // 0.5 to 2.0
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'learning' | 'streak' | 'test' | 'social';
}

// User Progress with SRS
export interface UserProgress {
  totalWords: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  knownWords: number;
  favoriteWords: number;
  // SRS Progress
  wordsDueForReview: number;
  totalReviewsCompleted: number;
  averageAccuracy: number;
  // XP and Levels
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  // Achievements
  achievements: Achievement[];
}

export interface WordSession {
  id: string;
  date: string;
  words: VocabularyWord[];
  completed: boolean;
}

export interface UserProfile {
  favoriteWords: string[];
  knownWords: string[];
  totalWordsLearned: number;
  streakCount: number;
}

export interface WordAction {
  wordId: string;
  action: 'favorite' | 'known' | 'shared';
  timestamp: string;
}