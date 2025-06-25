import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabularyWord, WordSession, UserProgress, UserProfile, Category } from '@/types/vocabulary';
import { Platform } from 'react-native';

const USED_WORDS_KEY = 'used_words';
const SESSIONS_KEY = 'word_sessions';
const PROGRESS_KEY = 'user_progress';
const PROFILE_KEY = 'user_profile';
const FAVORITES_KEY = 'favorite_words';
const KNOWN_WORDS_KEY = 'known_words';

// Comprehensive word database organized by categories
const WORD_DATABASE: Omit<VocabularyWord, 'id' | 'dateGenerated'>[] = [
  // Science Category
  {
    word: 'Perspicacious',
    partOfSpeech: 'adjective',
    definition: 'Having keen insight or discernment; penetrating in understanding or judgment.',
    example: 'The perspicacious detective immediately noticed the inconsistencies in the witness testimony.',
    synonyms: ['astute', 'perceptive', 'shrewd'],
    antonyms: ['obtuse', 'naive', 'imperceptive'],
    category: 'Science'
  },
  {
    word: 'Ephemeral',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transitory.',
    example: 'The cherry blossoms created an ephemeral display of beauty that lasted only a week.',
    synonyms: ['fleeting', 'transient', 'momentary'],
    antonyms: ['permanent', 'enduring', 'lasting'],
    category: 'Science'
  },
  {
    word: 'Vicissitude',
    partOfSpeech: 'noun',
    definition: 'A natural change or mutation visible in nature or human affairs; alternation between opposite conditions.',
    example: 'Despite the vicissitudes of his business career, he maintained an optimistic outlook.',
    synonyms: ['variation', 'fluctuation', 'alternation'],
    antonyms: ['stability', 'constancy', 'uniformity'],
    category: 'Science'
  },
  {
    word: 'Sagacious',
    partOfSpeech: 'adjective',
    definition: 'Having or showing keen mental discernment and good judgment; wise.',
    example: 'The sagacious advisor helped the young king navigate complex political challenges.',
    synonyms: ['wise', 'prudent', 'judicious'],
    antonyms: ['foolish', 'imprudent', 'unwise'],
    category: 'Science'
  },
  {
    word: 'Cogent',
    partOfSpeech: 'adjective',
    definition: 'Clear, logical, and convincing; having the power to compel belief.',
    example: 'The lawyer presented a cogent argument that swayed the jury\'s opinion.',
    synonyms: ['compelling', 'persuasive', 'convincing'],
    antonyms: ['unconvincing', 'weak', 'fallacious'],
    category: 'Science'
  },
  {
    word: 'Pellucid',
    partOfSpeech: 'adjective',
    definition: 'Transparently clear; easily understood; expressed clearly.',
    example: 'The professor\'s pellucid explanation made the complex theory accessible to all students.',
    synonyms: ['clear', 'transparent', 'lucid'],
    antonyms: ['opaque', 'unclear', 'murky'],
    category: 'Science'
  },

  // Technology Category
  {
    word: 'Obfuscate',
    partOfSpeech: 'verb',
    definition: 'To render obscure, unclear, or unintelligible; to deliberately make something confusing.',
    example: 'The politician attempted to obfuscate the issue with technical jargon and circular reasoning.',
    synonyms: ['obscure', 'confound', 'muddle'],
    antonyms: ['clarify', 'illuminate', 'elucidate'],
    category: 'Technology'
  },
  {
    word: 'Quixotic',
    partOfSpeech: 'adjective',
    definition: 'Extremely idealistic and unrealistic; pursuing noble but impractical goals.',
    example: 'His quixotic quest to eliminate poverty single-handedly was admirable but ultimately futile.',
    synonyms: ['idealistic', 'impractical', 'visionary'],
    antonyms: ['pragmatic', 'realistic', 'practical'],
    category: 'Technology'
  },
  {
    word: 'Intransigent',
    partOfSpeech: 'adjective',
    definition: 'Unwilling or refusing to change one\'s views or to agree about something.',
    example: 'The intransigent negotiator refused to consider any compromise proposals.',
    synonyms: ['inflexible', 'uncompromising', 'obstinate'],
    antonyms: ['flexible', 'accommodating', 'yielding'],
    category: 'Technology'
  },
  {
    word: 'Insidious',
    partOfSpeech: 'adjective',
    definition: 'Proceeding in a gradual, subtle way with harmful effect; treacherous.',
    example: 'The insidious spread of misinformation gradually eroded public trust.',
    synonyms: ['subtle', 'cunning', 'treacherous'],
    antonyms: ['obvious', 'straightforward', 'honest'],
    category: 'Technology'
  },
  {
    word: 'Surreptitious',
    partOfSpeech: 'adjective',
    definition: 'Kept secret, especially because it would not be approved of; stealthy.',
    example: 'He cast surreptitious glances at his watch during the tedious meeting.',
    synonyms: ['secretive', 'stealthy', 'clandestine'],
    antonyms: ['open', 'obvious', 'overt'],
    category: 'Technology'
  },
  {
    word: 'Vitiate',
    partOfSpeech: 'verb',
    definition: 'To spoil or impair the quality or efficiency of; to make faulty or defective.',
    example: 'The researcher\'s bias threatened to vitiate the entire study\'s credibility.',
    synonyms: ['corrupt', 'contaminate', 'undermine'],
    antonyms: ['improve', 'enhance', 'strengthen'],
    category: 'Technology'
  },

  // Arts Category
  {
    word: 'Mellifluous',
    partOfSpeech: 'adjective',
    definition: 'Sweet or musical; pleasant to hear; flowing smoothly and sweetly.',
    example: 'The opera singer\'s mellifluous voice captivated the entire audience.',
    synonyms: ['melodious', 'harmonious', 'dulcet'],
    antonyms: ['cacophonous', 'harsh', 'discordant'],
    category: 'Arts'
  },
  {
    word: 'Grandiloquent',
    partOfSpeech: 'adjective',
    definition: 'Pompous or extravagant in language, style, or manner; using high-sounding but meaningless words.',
    example: 'The senator\'s grandiloquent speech impressed few voters who preferred plain speaking.',
    synonyms: ['bombastic', 'pompous', 'pretentious'],
    antonyms: ['modest', 'understated', 'plain-spoken'],
    category: 'Arts'
  },
  {
    word: 'Loquacious',
    partOfSpeech: 'adjective',
    definition: 'Tending to talk a great deal; talkative.',
    example: 'The loquacious professor could turn a simple question into an hour-long dissertation.',
    synonyms: ['garrulous', 'voluble', 'talkative'],
    antonyms: ['taciturn', 'reticent', 'laconic'],
    category: 'Arts'
  },
  {
    word: 'Lugubrious',
    partOfSpeech: 'adjective',
    definition: 'Looking or sounding sad and dismal; mournful.',
    example: 'The lugubrious melody perfectly captured the somber mood of the memorial service.',
    synonyms: ['mournful', 'doleful', 'melancholy'],
    antonyms: ['cheerful', 'upbeat', 'joyful'],
    category: 'Arts'
  },
  {
    word: 'Fastidious',
    partOfSpeech: 'adjective',
    definition: 'Very attentive to and concerned about accuracy and detail; difficult to please.',
    example: 'The fastidious editor scrutinized every sentence for grammatical perfection.',
    synonyms: ['meticulous', 'particular', 'discriminating'],
    antonyms: ['careless', 'sloppy', 'indiscriminate'],
    category: 'Arts'
  },
  {
    word: 'Apposite',
    partOfSpeech: 'adjective',
    definition: 'Apt in the circumstances or in relation to something; appropriate.',
    example: 'Her apposite quotation from Shakespeare perfectly illustrated the moral dilemma.',
    synonyms: ['appropriate', 'relevant', 'pertinent'],
    antonyms: ['inappropriate', 'irrelevant', 'unsuitable'],
    category: 'Arts'
  },

  // Literature Category
  {
    word: 'Pusillanimous',
    partOfSpeech: 'adjective',
    definition: 'Showing a lack of courage or determination; timid and cowardly.',
    example: 'The general\'s pusillanimous retreat abandoned his troops to certain defeat.',
    synonyms: ['cowardly', 'timorous', 'craven'],
    antonyms: ['courageous', 'bold', 'valiant'],
    category: 'Literature'
  },
  {
    word: 'Truculent',
    partOfSpeech: 'adjective',
    definition: 'Eager or quick to argue or fight; aggressively defiant.',
    example: 'The truculent customer berated the staff over a minor billing error.',
    synonyms: ['belligerent', 'combative', 'pugnacious'],
    antonyms: ['peaceful', 'conciliatory', 'amicable'],
    category: 'Literature'
  },
  {
    word: 'Perfunctory',
    partOfSpeech: 'adjective',
    definition: 'Carried out with a minimum of effort or reflection; performed merely as a routine duty.',
    example: 'His perfunctory apology lacked sincerity and failed to address the real issues.',
    synonyms: ['cursory', 'superficial', 'mechanical'],
    antonyms: ['thorough', 'conscientious', 'heartfelt'],
    category: 'Literature'
  },
  {
    word: 'Obsequious',
    partOfSpeech: 'adjective',
    definition: 'Obedient or attentive to an excessive or servile degree; fawning.',
    example: 'The obsequious waiter\'s constant hovering made the diners uncomfortable.',
    synonyms: ['servile', 'sycophantic', 'fawning'],
    antonyms: ['assertive', 'independent', 'defiant'],
    category: 'Literature'
  },
  {
    word: 'Pernicious',
    partOfSpeech: 'adjective',
    definition: 'Having a harmful effect, especially in a gradual or subtle way.',
    example: 'The pernicious influence of corruption slowly undermined the institution\'s integrity.',
    synonyms: ['harmful', 'destructive', 'detrimental'],
    antonyms: ['beneficial', 'helpful', 'salutary'],
    category: 'Literature'
  },
  {
    word: 'Sanguine',
    partOfSpeech: 'adjective',
    definition: 'Optimistic or positive, especially in an apparently bad or difficult situation.',
    example: 'Despite the economic downturn, she remained sanguine about her company\'s prospects.',
    synonyms: ['optimistic', 'hopeful', 'confident'],
    antonyms: ['pessimistic', 'despondent', 'gloomy'],
    category: 'Literature'
  }
];

class VocabularyService {
  // Get all previously used words
  async getUsedWords(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(USED_WORDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting used words:', error);
      return [];
    }
  }

  // Add words to used list
  async addUsedWords(words: string[]): Promise<void> {
    try {
      const usedWords = await this.getUsedWords();
      const updatedWords = [...new Set([...usedWords, ...words])];
      await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(updatedWords));
    } catch (error) {
      console.error('Error adding used words:', error);
    }
  }

  // Generate exactly 10 unique words that haven't been used
  async generateDailyWords(): Promise<VocabularyWord[]> {
    const usedWords = await this.getUsedWords();
    const availableWords = WORD_DATABASE.filter(
      word => !usedWords.includes(word.word.toLowerCase())
    );

    if (availableWords.length < 10) {
      console.warn('Not enough unused words available. Consider expanding the database.');
    }

    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(10, shuffled.length));

    const currentDate = new Date().toISOString();
    const vocabularyWords: VocabularyWord[] = selectedWords.map((word, index) => ({
      ...word,
      id: `${currentDate}-${index}`,
      dateGenerated: currentDate
    }));

    await this.addUsedWords(vocabularyWords.map(w => w.word.toLowerCase()));

    return vocabularyWords;
  }

  // Generate a new session (not tied to today)
  async generateNewSession(): Promise<WordSession> {
    const words = await this.generateDailyWords();
    const session: WordSession = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      words,
      completed: false
    };
    await this.saveSession(session);
    return session;
  }

  // Save a word session
  async saveSession(session: WordSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const updatedSessions = [...sessions.filter(s => s.id !== session.id), session];
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Get all sessions
  async getAllSessions(): Promise<WordSession[]> {
    try {
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  // Get today's session
  async getTodaysSession(): Promise<WordSession | null> {
    const sessions = await this.getAllSessions();
    const today = new Date().toDateString();
    return sessions.find(session => 
      new Date(session.date).toDateString() === today
    ) || null;
  }

  // Get or create today's session
  async getOrCreateTodaysSession(): Promise<WordSession> {
    let session = await this.getTodaysSession();
    
    if (!session) {
      const words = await this.generateDailyWords();
      session = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        words,
        completed: false
      };
      await this.saveSession(session);
    }

    return session;
  }

  // User profile methods
  async getUserProfile(): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : {
        favoriteWords: [],
        knownWords: [],
        totalWordsLearned: 0,
        streakCount: 0,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        favoriteWords: [],
        knownWords: [],
        totalWordsLearned: 0,
        streakCount: 0,
      };
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Add word to favorites
  async addToFavorites(wordId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile.favoriteWords.includes(wordId)) {
        profile.favoriteWords.push(wordId);
        await this.saveUserProfile(profile);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  // Mark word as known
  async markAsKnown(wordId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile.knownWords.includes(wordId)) {
        profile.knownWords.push(wordId);
        profile.totalWordsLearned += 1;
        await this.saveUserProfile(profile);
      }
    } catch (error) {
      console.error('Error marking as known:', error);
    }
  }

  // Share word
  async shareWord(wordId: string): Promise<void> {
    try {
      // Find the word in current session or all sessions
      const sessions = await this.getAllSessions();
      let wordToShare: VocabularyWord | null = null;

      for (const session of sessions) {
        const found = session.words.find(w => w.id === wordId);
        if (found) {
          wordToShare = found;
          break;
        }
      }

      if (!wordToShare) return;

      const shareContent = `📚 Word of the Day: ${wordToShare.word}\n\n` +
        `Definition: ${wordToShare.definition}\n\n` +
        `Example: "${wordToShare.example}"\n\n` +
        `Shared from WordUp - Vocabulary Learning App`;

      if (Platform.OS === 'web') {
        // Web sharing fallback
        if (navigator.share) {
          await navigator.share({
            title: `Word: ${wordToShare.word}`,
            text: shareContent,
          });
        } else {
          // Copy to clipboard as fallback
          await navigator.clipboard.writeText(shareContent);
          alert('Word copied to clipboard!');
        }
      } else {
        // Mobile fallback: just copy to clipboard and alert
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareContent);
          alert('Word copied to clipboard!');
        } else {
          // If clipboard API is not available, just show the content in an alert
          alert(shareContent);
        }
      }
    } catch (error) {
      console.error('Error sharing word:', error);
    }
  }

  // Update user progress
  async updateProgress(): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const completedSessions = sessions.filter(s => s.completed);
      const profile = await this.getUserProfile();
      
      const progress: UserProgress = {
        totalWords: completedSessions.reduce((sum, s) => sum + s.words.length, 0),
        sessionsCompleted: completedSessions.length,
        currentStreak: this.calculateCurrentStreak(completedSessions),
        longestStreak: this.calculateLongestStreak(completedSessions),
        lastSessionDate: completedSessions.length > 0 
          ? completedSessions[completedSessions.length - 1].date 
          : '',
        knownWords: profile.knownWords.length,
        favoriteWords: profile.favoriteWords.length,
      };

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  // Get user progress
  async getProgress(): Promise<UserProgress> {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {
        totalWords: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: '',
        knownWords: 0,
        favoriteWords: 0,
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return {
        totalWords: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: '',
        knownWords: 0,
        favoriteWords: 0,
      };
    }
  }

  private calculateCurrentStreak(sessions: WordSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(sessions: WordSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedSessions.length; i++) {
      const prevDate = new Date(sortedSessions[i - 1].date);
      const currentDate = new Date(sortedSessions[i].date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(maxStreak, currentStreak);
  }

  // Get all available categories
  getCategories(): Category[] {
    return ['Science', 'Technology', 'Arts', 'Literature'];
  }

  // Get words by category
  async getWordsByCategory(category: Category): Promise<VocabularyWord[]> {
    try {
      const usedWords = await this.getUsedWords();
      const availableWords = WORD_DATABASE.filter(word => 
        !usedWords.includes(word.word) && word.category === category
      );

      // If not enough words in category, get some from other categories
      if (availableWords.length < 5) {
        const otherWords = WORD_DATABASE.filter(word => 
          !usedWords.includes(word.word) && word.category !== category
        );
        availableWords.push(...otherWords.slice(0, 5 - availableWords.length));
      }

      return availableWords.map(word => ({
        ...word,
        id: `${word.word}-${Date.now()}-${Math.random()}`,
        dateGenerated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting words by category:', error);
      return [];
    }
  }

  // Generate session for specific category
  async generateCategorySession(category: Category): Promise<WordSession> {
    const words = await this.getWordsByCategory(category);
    const session: WordSession = {
      id: `session-${category}-${Date.now()}`,
      date: new Date().toISOString(),
      words: words.slice(0, 10), // Limit to 10 words per session
      completed: false
    };
    await this.saveSession(session);
    return session;
  }

  // Get all words for browsing (not session-based)
  async getAllWordsByCategory(category: Category): Promise<VocabularyWord[]> {
    return WORD_DATABASE
      .filter(word => word.category === category)
      .map(word => ({
        ...word,
        id: `${word.word}-${Date.now()}-${Math.random()}`,
        dateGenerated: new Date().toISOString()
      }));
  }
}

export const vocabularyService = new VocabularyService();