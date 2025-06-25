import { create } from 'zustand';
import { VocabularyWord, WordSession, UserProgress, UserProfile, WordAction, Category, Achievement } from '@/types/vocabulary';
import { TestQuestion, TestSession, TestResult, TestProgress } from '@/types/test';
import { vocabularyService } from '@/services/vocabularyService';
import { testService } from '@/services/testService';
import { srsService } from '@/services/srsService';
import { audioService } from '@/services/audioService';
import { achievementService } from '@/services/achievementService';

interface AppState {
  // Current session data
  currentSession: WordSession | null;
  currentWordIndex: number;
  
  // Category data
  selectedCategory: Category | 'All';
  categoryWords: VocabularyWord[];
  
  // Test data
  testQuestions: TestQuestion[];
  testProgress: TestProgress;
  currentTestSession: TestSession | null;
  testResults: TestResult[];
  
  // User data
  userProfile: UserProfile;
  userProgress: UserProgress;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTodaysSession: () => Promise<void>;
  loadCategoryWords: (category: Category) => Promise<void>;
  setSelectedCategory: (category: Category | 'All') => void;
  markWordAsFavorite: (wordId: string) => Promise<void>;
  markWordAsKnown: (wordId: string) => Promise<void>;
  shareWord: (wordId: string) => Promise<void>;
  requestNewWordSet: () => Promise<void>;
  nextWord: () => void;
  resetSession: () => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  
  // Test actions
  generateTest: (category?: Category, questionCount?: number) => Promise<void>;
  startTest: (wordCount?: number) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => void;
  completeTest: () => Promise<TestResult>;
  loadTestResults: () => Promise<void>;
  retryTest: () => Promise<void>;
  
  // SRS actions
  loadSRSData: () => Promise<void>;
  recordReview: (wordId: string, quality: number) => Promise<void>;
  addWordToSRS: (wordId: string) => Promise<void>;
  getWordsDueForReview: () => Promise<void>;
  
  // Audio actions
  speakWord: (word: string) => Promise<void>;
  updateAudioSettings: (settings: Partial<AppState['audioSettings']>) => Promise<void>;
  
  // Achievement actions
  checkAchievements: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  
  // Vocabulary actions
  loadWords: () => Promise<void>;
  addWord: (word: VocabularyWord) => void;
  removeWord: (wordId: string) => void;
  
  // Test state
  currentTest: any;
  isTestActive: boolean;
  
  // SRS state
  wordsDueForReview: VocabularyWord[];
  srsStatistics: {
    totalWords: number;
    wordsDueToday: number;
    wordsDueTomorrow: number;
    averageAccuracy: number;
    totalReviews: number;
  };
  
  // Audio state
  audioSettings: {
    accent: 'US' | 'UK' | 'AU';
    speed: number;
    autoPlay: boolean;
  };
  
  // Achievement state
  achievements: Achievement[];
  showLevelUp: boolean;
  levelUpMessage: string;
  
  // Utility actions
  resetAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentSession: null,
  currentWordIndex: 0,
  selectedCategory: 'All',
  categoryWords: [],
  testQuestions: [],
  testProgress: {
    currentQuestion: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    timeElapsed: 0,
    isComplete: false,
  },
  currentTestSession: null,
  testResults: [],
  userProfile: {
    favoriteWords: [],
    knownWords: [],
    totalWordsLearned: 0,
    streakCount: 0,
  },
  userProgress: {
    totalWords: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: '',
    knownWords: 0,
    favoriteWords: 0,
    wordsDueForReview: 0,
    totalReviewsCompleted: 0,
    averageAccuracy: 0,
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    achievements: [],
  },
  isLoading: false,
  error: null,
  
  currentTest: null,
  isTestActive: false,
  
  wordsDueForReview: [],
  srsStatistics: {
    totalWords: 0,
    wordsDueToday: 0,
    wordsDueTomorrow: 0,
    averageAccuracy: 0,
    totalReviews: 0,
  },
  
  audioSettings: {
    accent: 'US',
    speed: 1.0,
    autoPlay: true,
  },
  
  achievements: [],
  showLevelUp: false,
  levelUpMessage: '',

  // Actions
  loadTodaysSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await vocabularyService.getOrCreateTodaysSession();
      const progress = await vocabularyService.getProgress();
      const profile = await vocabularyService.getUserProfile();
      
      set({ 
        currentSession: session, 
        userProgress: progress,
        userProfile: profile,
        currentWordIndex: 0,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to load session', isLoading: false });
    }
  },

  loadCategoryWords: async (category: Category) => {
    set({ isLoading: true, error: null });
    try {
      const words = await vocabularyService.getAllWordsByCategory(category);
      set({ 
        categoryWords: words,
        selectedCategory: category,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to load category words', isLoading: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    const { categoryWords } = get();
    const filteredWords = category === 'All' 
      ? categoryWords 
      : categoryWords.filter(word => word.category === category);
    set({ filteredWords });
  },

  markWordAsFavorite: async (wordId: string) => {
    try {
      await vocabularyService.addToFavorites(wordId);
      const profile = await vocabularyService.getUserProfile();
      const progress = await vocabularyService.getProgress();
      
      set({ userProfile: profile, userProgress: progress });
      get().nextWord();
    } catch (error) {
      set({ error: 'Failed to save favorite' });
    }
  },

  markWordAsKnown: async (wordId: string) => {
    try {
      await vocabularyService.markAsKnown(wordId);
      const profile = await vocabularyService.getUserProfile();
      const progress = await vocabularyService.getProgress();
      
      set({ userProfile: profile, userProgress: progress });
      get().nextWord();
    } catch (error) {
      set({ error: 'Failed to mark as known' });
    }
  },

  shareWord: async (wordId: string) => {
    try {
      await vocabularyService.shareWord(wordId);
      // Don't advance to next word for sharing
    } catch (error) {
      set({ error: 'Failed to share word' });
    }
  },

  requestNewWordSet: async () => {
    set({ isLoading: true });
    try {
      const newSession = await vocabularyService.generateNewSession();
      set({ 
        currentSession: newSession, 
        currentWordIndex: 0,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to generate new words', isLoading: false });
    }
  },

  nextWord: () => {
    const { currentWordIndex, currentSession } = get();
    if (currentSession && currentWordIndex < currentSession.words.length - 1) {
      set({ currentWordIndex: currentWordIndex + 1 });
    }
  },

  resetSession: () => {
    set({ currentWordIndex: 0 });
  },

  updateProgress: (updates) => {
    set(state => ({
      userProgress: { ...state.userProgress, ...updates }
    }));
    
    // Check achievements after progress update
    const { checkAchievements } = get();
    checkAchievements();
  },

  // Test actions
  generateTest: async (category?: Category, questionCount: number = 20) => {
    set({ isLoading: true, error: null });
    try {
      const questions = await testService.generateTest(category, questionCount);
      set({ 
        testQuestions: questions,
        testProgress: {
          currentQuestion: 0,
          totalQuestions: questions.length,
          correctAnswers: 0,
          streak: 0,
          maxStreak: 0,
          timeElapsed: 0,
          isComplete: false,
        },
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to generate test', isLoading: false });
    }
  },

  startTest: async (wordCount = 10) => {
    const { testQuestions } = get();
    if (testQuestions.length === 0) return;

    const session: TestSession = {
      id: `test-${Date.now()}`,
      date: new Date().toISOString(),
      questions: testQuestions,
      userAnswers: {},
      correctAnswers: 0,
      totalQuestions: testQuestions.length,
      timeTaken: 0,
      streak: 0,
      maxStreak: 0,
    };

    set({ 
      currentTestSession: session,
      testProgress: {
        ...get().testProgress,
        currentQuestion: 0,
        timeElapsed: 0,
      },
      currentTest: testQuestions,
      isTestActive: true,
      testResults: null
    });
  },

  answerQuestion: (questionId: string, answer: string) => {
    const { currentTestSession, testProgress, testQuestions } = get();
    if (!currentTestSession) return;

    const currentQuestion = testQuestions[testProgress.currentQuestion];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    const newStreak = isCorrect ? testProgress.streak + 1 : 0;
    const newMaxStreak = Math.max(testProgress.maxStreak, newStreak);
    
    const updatedSession = {
      ...currentTestSession,
      userAnswers: {
        ...currentTestSession.userAnswers,
        [questionId]: answer,
      },
      correctAnswers: currentTestSession.correctAnswers + (isCorrect ? 1 : 0),
      streak: newStreak,
      maxStreak: newMaxStreak,
    };

    const nextQuestion = testProgress.currentQuestion + 1;
    const isComplete = nextQuestion >= testQuestions.length;

    set({
      currentTestSession: updatedSession,
      testProgress: {
        ...testProgress,
        currentQuestion: nextQuestion,
        correctAnswers: updatedSession.correctAnswers,
        streak: newStreak,
        maxStreak: newMaxStreak,
        isComplete,
      }
    });
  },

  completeTest: async () => {
    const { currentTestSession } = get();
    if (!currentTestSession) throw new Error('No active test session');

    const result: TestResult = {
      sessionId: currentTestSession.id,
      accuracy: (currentTestSession.correctAnswers / currentTestSession.totalQuestions) * 100,
      timeTaken: currentTestSession.timeTaken,
      correctAnswers: currentTestSession.correctAnswers,
      totalQuestions: currentTestSession.totalQuestions,
      streak: currentTestSession.streak,
      maxStreak: currentTestSession.maxStreak,
      wordsToReview: [], // TODO: Implement words to review logic
      date: new Date().toISOString(),
    };

    await testService.saveTestResult(result);
    await testService.saveTestSession(currentTestSession);

    set({
      testResults: [...get().testResults, result],
      currentTestSession: null,
      currentTest: null,
      isTestActive: false,
    });

    // Update progress
    const { updateProgress } = get();
    updateProgress({
      sessionsCompleted: get().userProgress.sessionsCompleted + 1,
      averageAccuracy: result.accuracy,
    });

    return result;
  },

  loadTestResults: async () => {
    try {
      const results = await testService.getTestResults();
      set({ testResults: results });
    } catch (error) {
      console.error('Failed to load test results:', error);
    }
  },

  retryTest: async () => {
    const { selectedCategory } = get();
    await get().generateTest(selectedCategory);
    get().startTest();
  },

  // SRS actions
  loadSRSData: async () => {
    try {
      const statistics = await srsService.getSRSStatistics();
      const wordsDue = await srsService.getWordsDueForReview();
      
      set({ 
        srsStatistics: statistics,
        wordsDueForReview: wordsDue,
      });
      
      // Update progress with SRS data
      const { updateProgress } = get();
      updateProgress({
        wordsDueForReview: statistics.wordsDueToday,
        totalReviewsCompleted: statistics.totalReviews,
        averageAccuracy: statistics.averageAccuracy,
      });
    } catch (error) {
      console.error('Error loading SRS data:', error);
    }
  },
  
  recordReview: async (wordId, quality) => {
    try {
      await srsService.recordReview(wordId, quality);
      
      // Reload SRS data
      const { loadSRSData } = get();
      await loadSRSData();
      
      // Update progress
      const { updateProgress } = get();
      updateProgress({
        totalReviewsCompleted: get().userProgress.totalReviewsCompleted + 1,
      });
    } catch (error) {
      console.error('Error recording review:', error);
    }
  },
  
  addWordToSRS: async (wordId) => {
    try {
      await srsService.addWordToSRS(wordId);
      
      // Reload SRS data
      const { loadSRSData } = get();
      await loadSRSData();
    } catch (error) {
      console.error('Error adding word to SRS:', error);
    }
  },
  
  getWordsDueForReview: async () => {
    try {
      const wordsDue = await srsService.getWordsDueForReview();
      set({ wordsDueForReview: wordsDue });
    } catch (error) {
      console.error('Error getting words due for review:', error);
    }
  },
  
  // Audio actions
  speakWord: async (word) => {
    try {
      const { audioSettings } = get();
      await audioService.speakWord(word, {
        accent: audioSettings.accent,
        speed: audioSettings.speed,
      });
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  },
  
  updateAudioSettings: async (settings) => {
    try {
      await audioService.updateSettings(settings);
      set(state => ({
        audioSettings: { ...state.audioSettings, ...settings }
      }));
    } catch (error) {
      console.error('Error updating audio settings:', error);
    }
  },
  
  // Achievement actions
  checkAchievements: async () => {
    try {
      const { userProgress } = get();
      const achievements = await achievementService.checkAchievements(userProgress);
      
      // Check for level up
      const oldXP = achievementService.calculateXP(get().achievements);
      const newXP = achievementService.calculateXP(achievements);
      
      if (achievementService.shouldShowLevelUp(oldXP, newXP)) {
        const { level } = achievementService.calculateLevel(newXP);
        const message = achievementService.getLevelUpMessage(level);
        set({ showLevelUp: true, levelUpMessage: message });
        
        // Auto-hide level up message after 3 seconds
        setTimeout(() => {
          set({ showLevelUp: false });
        }, 3000);
      }
      
      set({ achievements });
      
      // Update progress with new XP and level
      const { level, xpToNext } = achievementService.calculateLevel(newXP);
      const { updateProgress } = get();
      updateProgress({
        currentLevel: level,
        currentXP: newXP,
        xpToNextLevel: xpToNext,
        achievements,
      });
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  },
  
  loadAchievements: async () => {
    try {
      const achievements = await achievementService.getAchievements();
      set({ achievements });
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  },
  
  // Vocabulary actions
  loadWords: async () => {
    set({ isLoading: true });
    try {
      const words = await vocabularyService.getVocabularyWords();
      set({ categoryWords: words, filteredWords: words });
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addWord: (word) => {
    const { categoryWords, filteredWords } = get();
    const newWords = [...categoryWords, word];
    const newFilteredWords = [...filteredWords, word];
    set({ categoryWords: newWords, filteredWords: newFilteredWords });
  },
  
  removeWord: (wordId) => {
    const { categoryWords, filteredWords } = get();
    const newWords = categoryWords.filter(w => w.id !== wordId);
    const newFilteredWords = filteredWords.filter(w => w.id !== wordId);
    set({ categoryWords: newWords, filteredWords: newFilteredWords });
  },
  
  // Test state
  currentTest: null,
  isTestActive: false,

  // Utility actions
  resetAllData: async () => {
    try {
      await srsService.resetWord('all');
      await achievementService.resetAchievements();
      set({
        currentSession: null,
        currentWordIndex: 0,
        selectedCategory: 'All',
        categoryWords: [],
        testQuestions: [],
        testProgress: {
          currentQuestion: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          streak: 0,
          maxStreak: 0,
          timeElapsed: 0,
          isComplete: false,
        },
        currentTestSession: null,
        testResults: [],
        userProfile: {
          favoriteWords: [],
          knownWords: [],
          totalWordsLearned: 0,
          streakCount: 0,
        },
        userProgress: {
          totalWords: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastSessionDate: '',
          knownWords: 0,
          favoriteWords: 0,
          wordsDueForReview: 0,
          totalReviewsCompleted: 0,
          averageAccuracy: 0,
          currentLevel: 1,
          currentXP: 0,
          xpToNextLevel: 100,
          achievements: [],
        },
        isLoading: false,
        error: null,
        currentTest: null,
        isTestActive: false,
        wordsDueForReview: [],
        srsStatistics: {
          totalWords: 0,
          wordsDueToday: 0,
          wordsDueTomorrow: 0,
          averageAccuracy: 0,
          totalReviews: 0,
        },
        audioSettings: {
          accent: 'US',
          speed: 1.0,
          autoPlay: true,
        },
        achievements: [],
        showLevelUp: false,
        levelUpMessage: '',
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },
}));