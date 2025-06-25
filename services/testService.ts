import AsyncStorage from '@react-native-async-storage/async-storage';
import { vocabularyService } from './vocabularyService';
import { VocabularyWord, Category } from '@/types/vocabulary';
import { TestQuestion, TestSession, TestResult, QuestionType } from '@/types/test';

const TEST_SESSIONS_KEY = 'test_sessions';
const TEST_RESULTS_KEY = 'test_results';

class TestService {
  // Generate a test with mixed question types
  async generateTest(category?: Category, questionCount: number = 20): Promise<TestQuestion[]> {
    try {
      // Get words for the category or all words
      const words = category 
        ? await vocabularyService.getAllWordsByCategory(category)
        : await vocabularyService.getAllWordsByCategory('Science'); // Default

      if (words.length < 4) {
        throw new Error('Not enough words to generate test');
      }

      const questions: TestQuestion[] = [];
      const questionTypes: QuestionType[] = [
        'definition_match',
        'word_match', 
        'fill_blank',
        'synonym_antonym'
      ];

      // Shuffle words and question types
      const shuffledWords = this.shuffleArray([...words]);
      const shuffledTypes = this.shuffleArray([...questionTypes]);

      for (let i = 0; i < Math.min(questionCount, shuffledWords.length); i++) {
        const word = shuffledWords[i];
        const questionType = shuffledTypes[i % shuffledTypes.length];
        
        const question = await this.generateQuestion(word, questionType, shuffledWords);
        if (question) {
          questions.push(question);
        }
      }

      return questions.slice(0, questionCount);
    } catch (error) {
      console.error('Error generating test:', error);
      return [];
    }
  }

  private async generateQuestion(
    word: VocabularyWord, 
    type: QuestionType, 
    allWords: VocabularyWord[]
  ): Promise<TestQuestion | null> {
    try {
      const otherWords = allWords.filter(w => w.word !== word.word);
      const randomWords = this.shuffleArray(otherWords).slice(0, 3);

      switch (type) {
        case 'definition_match':
          return this.generateDefinitionMatch(word, randomWords);
        case 'word_match':
          return this.generateWordMatch(word, randomWords);
        case 'fill_blank':
          return this.generateFillBlank(word, randomWords);
        case 'synonym_antonym':
          return this.generateSynonymAntonym(word, randomWords);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error generating question:', error);
      return null;
    }
  }

  private generateDefinitionMatch(word: VocabularyWord, otherWords: VocabularyWord[]): TestQuestion {
    const options = [
      word.word,
      ...otherWords.map(w => w.word)
    ];
    
    return {
      id: `def_${word.id}`,
      type: 'definition_match',
      word,
      question: `What word matches this definition?\n\n"${word.definition}"`,
      options: this.shuffleArray(options),
      correctAnswer: word.word,
      explanation: `The correct answer is "${word.word}" because it means: ${word.definition}`
    };
  }

  private generateWordMatch(word: VocabularyWord, otherWords: VocabularyWord[]): TestQuestion {
    const options = [
      word.definition,
      ...otherWords.map(w => w.definition)
    ];

    return {
      id: `word_${word.id}`,
      type: 'word_match',
      word,
      question: `What is the definition of "${word.word}"?`,
      options: this.shuffleArray(options),
      correctAnswer: word.definition,
      explanation: `"${word.word}" means: ${word.definition}`
    };
  }

  private generateFillBlank(word: VocabularyWord, otherWords: VocabularyWord[]): TestQuestion {
    const options = [
      word.word,
      ...otherWords.map(w => w.word)
    ];

    // Create a fill-in-the-blank sentence
    const sentence = word.example.replace(word.word, '_____');

    return {
      id: `fill_${word.id}`,
      type: 'fill_blank',
      word,
      question: `Complete the sentence:\n\n"${sentence}"`,
      options: this.shuffleArray(options),
      correctAnswer: word.word,
      explanation: `The correct word is "${word.word}" which means: ${word.definition}`
    };
  }

  private generateSynonymAntonym(word: VocabularyWord, otherWords: VocabularyWord[]): TestQuestion {
    const isSynonym = Math.random() > 0.5;
    const correctOption = isSynonym 
      ? word.synonyms[0] || word.word
      : word.antonyms[0] || 'opposite';
    
    const options = [
      correctOption,
      ...otherWords.map(w => w.synonyms[0] || w.word)
    ];

    return {
      id: `syn_${word.id}`,
      type: 'synonym_antonym',
      word,
      question: `What is a ${isSynonym ? 'synonym' : 'antonym'} of "${word.word}"?`,
      options: this.shuffleArray(options),
      correctAnswer: correctOption,
      explanation: `A ${isSynonym ? 'synonym' : 'antonym'} of "${word.word}" is "${correctOption}"`
    };
  }

  // Save test session
  async saveTestSession(session: TestSession): Promise<void> {
    try {
      const existingSessions = await this.getTestSessions();
      existingSessions.push(session);
      await AsyncStorage.setItem(TEST_SESSIONS_KEY, JSON.stringify(existingSessions));
    } catch (error) {
      console.error('Error saving test session:', error);
    }
  }

  // Get all test sessions
  async getTestSessions(): Promise<TestSession[]> {
    try {
      const stored = await AsyncStorage.getItem(TEST_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting test sessions:', error);
      return [];
    }
  }

  // Save test result
  async saveTestResult(result: TestResult): Promise<void> {
    try {
      const existingResults = await this.getTestResults();
      existingResults.push(result);
      await AsyncStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(existingResults));
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  }

  // Get all test results
  async getTestResults(): Promise<TestResult[]> {
    try {
      const stored = await AsyncStorage.getItem(TEST_RESULTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting test results:', error);
      return [];
    }
  }

  // Calculate test statistics
  async getTestStatistics(): Promise<{
    totalTests: number;
    averageAccuracy: number;
    bestStreak: number;
    totalWordsLearned: number;
  }> {
    try {
      const results = await this.getTestResults();
      
      if (results.length === 0) {
        return {
          totalTests: 0,
          averageAccuracy: 0,
          bestStreak: 0,
          totalWordsLearned: 0,
        };
      }

      const totalTests = results.length;
      const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
      const bestStreak = Math.max(...results.map(r => r.maxStreak));
      const totalWordsLearned = results.reduce((sum, r) => sum + r.correctAnswers, 0);

      return {
        totalTests,
        averageAccuracy,
        bestStreak,
        totalWordsLearned,
      };
    } catch (error) {
      console.error('Error getting test statistics:', error);
      return {
        totalTests: 0,
        averageAccuracy: 0,
        bestStreak: 0,
        totalWordsLearned: 0,
      };
    }
  }

  // Utility function to shuffle arrays
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const testService = new TestService(); 