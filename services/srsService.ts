import AsyncStorage from '@react-native-async-storage/async-storage';
import { SRSData, SRSResult, VocabularyWord } from '@/types/vocabulary';

const SRS_DATA_KEY = 'srs_data';
const SRS_SETTINGS_KEY = 'srs_settings';

interface SRSSettings {
  initialEaseFactor: number;
  minEaseFactor: number;
  maxEaseFactor: number;
  initialInterval: number;
  maxInterval: number;
}

class SRSService {
  private settings: SRSSettings = {
    initialEaseFactor: 2.5,
    minEaseFactor: 1.3,
    maxEaseFactor: 2.5,
    initialInterval: 1,
    maxInterval: 36500, // 100 years
  };

  // SM-2 Algorithm implementation
  calculateNextReview(
    currentData: SRSData,
    quality: number // 0-5 scale (0=total blackout, 5=perfect response)
  ): SRSResult {
    const { level, easeFactor, interval, reviewCount } = currentData;

    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newLevel = level;

    // Calculate new ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor stays within bounds
    newEaseFactor = Math.max(this.settings.minEaseFactor, 
                           Math.min(this.settings.maxEaseFactor, newEaseFactor));

    // Calculate new interval based on quality
    if (quality < 3) {
      // Failed - reset to level 0
      newLevel = 0;
      newInterval = this.settings.initialInterval;
    } else {
      // Passed
      if (level === 0) {
        newInterval = 1;
        newLevel = 1;
      } else if (level === 1) {
        newInterval = 6;
        newLevel = 2;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
        newLevel = level + 1;
      }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      newLevel,
      newInterval,
      newEaseFactor,
      nextReview,
    };
  }

  // Get words due for review
  async getWordsDueForReview(): Promise<VocabularyWord[]> {
    try {
      const srsData = await this.getAllSRSData();
      const now = new Date();
      
      const dueWords = srsData.filter(data => 
        new Date(data.nextReview) <= now
      );

      // Sort by priority (earliest due first)
      dueWords.sort((a, b) => 
        new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      );

      return dueWords.map(data => ({
        id: data.wordId,
        word: '', // Will be populated from vocabulary service
        partOfSpeech: '',
        definition: '',
        example: '',
        synonyms: [],
        antonyms: [],
        category: 'Science' as any,
        dateGenerated: '',
        srsLevel: data.level,
        nextReview: data.nextReview.toISOString(),
        reviewCount: data.reviewCount,
        correctCount: data.correctCount,
        incorrectCount: data.incorrectCount,
      }));
    } catch (error) {
      console.error('Error getting words due for review:', error);
      return [];
    }
  }

  // Add word to SRS system
  async addWordToSRS(wordId: string): Promise<void> {
    try {
      const srsData = await this.getAllSRSData();
      
      const newSRSData: SRSData = {
        wordId,
        level: 0,
        nextReview: new Date(), // Due immediately
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: new Date(),
        easeFactor: this.settings.initialEaseFactor,
        interval: this.settings.initialInterval,
      };

      srsData.push(newSRSData);
      await this.saveSRSData(srsData);
    } catch (error) {
      console.error('Error adding word to SRS:', error);
    }
  }

  // Record review result
  async recordReview(wordId: string, quality: number): Promise<void> {
    try {
      const srsData = await this.getAllSRSData();
      const wordData = srsData.find(data => data.wordId === wordId);
      
      if (!wordData) {
        console.warn('Word not found in SRS data:', wordId);
        return;
      }

      // Calculate new SRS parameters
      const result = this.calculateNextReview(wordData, quality);
      
      // Update word data
      wordData.level = result.newLevel;
      wordData.interval = result.newInterval;
      wordData.easeFactor = result.newEaseFactor;
      wordData.nextReview = result.nextReview;
      wordData.lastReviewed = new Date();
      wordData.reviewCount += 1;
      
      if (quality >= 3) {
        wordData.correctCount += 1;
      } else {
        wordData.incorrectCount += 1;
      }

      await this.saveSRSData(srsData);
    } catch (error) {
      console.error('Error recording review:', error);
    }
  }

  // Get SRS statistics
  async getSRSStatistics(): Promise<{
    totalWords: number;
    wordsDueToday: number;
    wordsDueTomorrow: number;
    averageAccuracy: number;
    totalReviews: number;
  }> {
    try {
      const srsData = await this.getAllSRSData();
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const wordsDueToday = srsData.filter(data => 
        new Date(data.nextReview) <= now
      ).length;

      const wordsDueTomorrow = srsData.filter(data => {
        const reviewDate = new Date(data.nextReview);
        return reviewDate > now && reviewDate <= tomorrow;
      }).length;

      const totalReviews = srsData.reduce((sum, data) => sum + data.reviewCount, 0);
      const totalCorrect = srsData.reduce((sum, data) => sum + data.correctCount, 0);
      const averageAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

      return {
        totalWords: srsData.length,
        wordsDueToday,
        wordsDueTomorrow,
        averageAccuracy,
        totalReviews,
      };
    } catch (error) {
      console.error('Error getting SRS statistics:', error);
      return {
        totalWords: 0,
        wordsDueToday: 0,
        wordsDueTomorrow: 0,
        averageAccuracy: 0,
        totalReviews: 0,
      };
    }
  }

  // Get learning queue (new words + due reviews)
  async getLearningQueue(limit: number = 20): Promise<{
    newWords: VocabularyWord[];
    dueReviews: VocabularyWord[];
  }> {
    try {
      const dueReviews = await this.getWordsDueForReview();
      const allWords = await this.getAllWords();
      const srsData = await this.getAllSRSData();
      
      // Get words not in SRS yet
      const wordsInSRS = new Set(srsData.map(data => data.wordId));
      const newWords = allWords
        .filter(word => !wordsInSRS.has(word.id))
        .slice(0, limit - dueReviews.length);

      return {
        newWords,
        dueReviews: dueReviews.slice(0, limit),
      };
    } catch (error) {
      console.error('Error getting learning queue:', error);
      return { newWords: [], dueReviews: [] };
    }
  }

  // Private helper methods
  private async getAllSRSData(): Promise<SRSData[]> {
    try {
      const stored = await AsyncStorage.getItem(SRS_DATA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting SRS data:', error);
      return [];
    }
  }

  private async saveSRSData(data: SRSData[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SRS_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving SRS data:', error);
    }
  }

  private async getAllWords(): Promise<VocabularyWord[]> {
    // This would typically come from vocabulary service
    // For now, return empty array
    return [];
  }

  // Reset SRS data for a word
  async resetWord(wordId: string): Promise<void> {
    try {
      const srsData = await this.getAllSRSData();
      const filteredData = srsData.filter(data => data.wordId !== wordId);
      await this.saveSRSData(filteredData);
    } catch (error) {
      console.error('Error resetting word:', error);
    }
  }

  // Get review history for a word
  async getWordHistory(wordId: string): Promise<{
    totalReviews: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
    lastReviewed: Date | null;
    nextReview: Date | null;
  }> {
    try {
      const srsData = await this.getAllSRSData();
      const wordData = srsData.find(data => data.wordId === wordId);
      
      if (!wordData) {
        return {
          totalReviews: 0,
          correctCount: 0,
          incorrectCount: 0,
          accuracy: 0,
          lastReviewed: null,
          nextReview: null,
        };
      }

      const accuracy = wordData.reviewCount > 0 
        ? (wordData.correctCount / wordData.reviewCount) * 100 
        : 0;

      return {
        totalReviews: wordData.reviewCount,
        correctCount: wordData.correctCount,
        incorrectCount: wordData.incorrectCount,
        accuracy,
        lastReviewed: wordData.lastReviewed,
        nextReview: wordData.nextReview,
      };
    } catch (error) {
      console.error('Error getting word history:', error);
      return {
        totalReviews: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        lastReviewed: null,
        nextReview: null,
      };
    }
  }
}

export const srsService = new SRSService(); 