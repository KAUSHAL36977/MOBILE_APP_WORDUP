import { AccentType, PronunciationData } from '@/types/vocabulary';
import * as Speech from 'expo-speech';

const AUDIO_SETTINGS_KEY = 'audio_settings';

interface AudioSettings {
  accent: AccentType;
  speed: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
}

class AudioService {
  private settings: AudioSettings = {
    accent: 'US',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoPlay: true,
  };

  private isInitialized = false;

  constructor() {
    this.loadSettings();
  }

  // Initialize audio service
  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing audio service:', error);
    }
  }

  // Speak a word with current settings
  async speakWord(word: string, options?: Partial<AudioSettings>): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const settings = { ...this.settings, ...options };
      
      await Speech.speak(word, {
        language: this.getLanguageCode(settings.accent),
        pitch: settings.pitch,
        rate: settings.speed,
        volume: settings.volume,
        onDone: () => {
          console.log('Finished speaking:', word);
        },
        onError: (error: any) => {
          console.error('Speech error:', error);
        },
      });
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  }

  // Stop current speech
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  // Check if speech is available
  async isSpeechAvailable(): Promise<boolean> {
    try {
      // expo-speech doesn't have isAvailableAsync, so we'll assume it's available
      return true;
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  }

  // Get available voices
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      // expo-speech doesn't have getAvailableVoicesAsync, return empty array
      return [];
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  // Generate phonetic transcription (simplified)
  generatePhonetic(word: string, accent: AccentType = 'US'): string {
    // This is a simplified phonetic generator
    // In a real app, you'd use a proper phonetic library or API
    const phoneticMap: Record<string, string> = {
      'a': 'æ',
      'e': 'ɛ',
      'i': 'ɪ',
      'o': 'oʊ',
      'u': 'ʌ',
      'th': 'θ',
      'ch': 'tʃ',
      'sh': 'ʃ',
      'ph': 'f',
    };

    let phonetic = word.toLowerCase();
    
    // Apply basic phonetic rules
    for (const [sound, phoneticSymbol] of Object.entries(phoneticMap)) {
      phonetic = phonetic.replace(new RegExp(sound, 'g'), phoneticSymbol);
    }

    return `/${phonetic}/`;
  }

  // Get language code for accent
  private getLanguageCode(accent: AccentType): string {
    switch (accent) {
      case 'US':
        return 'en-US';
      case 'UK':
        return 'en-GB';
      case 'AU':
        return 'en-AU';
      default:
        return 'en-US';
    }
  }

  // Update audio settings
  async updateSettings(newSettings: Partial<AudioSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();
    } catch (error) {
      console.error('Error updating audio settings:', error);
    }
  }

  // Get current settings
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Load settings from storage
  private async loadSettings(): Promise<void> {
    try {
      // In a real app, you'd load from AsyncStorage
      // For now, use default settings
      this.settings = {
        accent: 'US',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        autoPlay: true,
      };
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  // Save settings to storage
  private async saveSettings(): Promise<void> {
    try {
      // In a real app, you'd save to AsyncStorage
      console.log('Audio settings saved:', this.settings);
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }

  // Pronunciation practice mode
  async startPronunciationPractice(word: string): Promise<void> {
    try {
      // Speak the word slowly for practice
      await this.speakWord(word, { speed: 0.7 });
      
      // Wait a moment, then speak again at normal speed
      setTimeout(async () => {
        await this.speakWord(word, { speed: 1.0 });
      }, 2000);
    } catch (error) {
      console.error('Error in pronunciation practice:', error);
    }
  }

  // Compare pronunciation (simplified)
  async comparePronunciation(userRecording: string, targetWord: string): Promise<{
    similarity: number;
    feedback: string[];
  }> {
    // This is a simplified comparison
    // In a real app, you'd use speech recognition and comparison APIs
    
    const feedback: string[] = [];
    let similarity = 0.8; // Mock similarity score

    // Mock feedback based on common pronunciation issues
    if (targetWord.includes('th') && !userRecording.includes('th')) {
      feedback.push('Try to pronounce the "th" sound more clearly');
      similarity -= 0.2;
    }

    if (targetWord.length !== userRecording.length) {
      feedback.push('Check the word length and syllables');
      similarity -= 0.1;
    }

    return {
      similarity: Math.max(0, similarity),
      feedback,
    };
  }

  // Get pronunciation tips for a word
  getPronunciationTips(word: string): string[] {
    const tips: string[] = [];
    
    if (word.includes('th')) {
      tips.push('Place your tongue between your teeth for the "th" sound');
    }
    
    if (word.includes('ch')) {
      tips.push('Make the "ch" sound like in "church"');
    }
    
    if (word.includes('sh')) {
      tips.push('Make the "sh" sound like in "ship"');
    }
    
    if (word.endsWith('ing')) {
      tips.push('The "ing" ending should sound like "ing" not "in"');
    }
    
    return tips;
  }

  // Audio speed control
  async setSpeed(speed: number): Promise<void> {
    await this.updateSettings({ speed: Math.max(0.5, Math.min(2.0, speed)) });
  }

  // Accent selection
  async setAccent(accent: AccentType): Promise<void> {
    await this.updateSettings({ accent });
  }

  // Toggle auto-play
  async toggleAutoPlay(): Promise<void> {
    await this.updateSettings({ autoPlay: !this.settings.autoPlay });
  }
}

export const audioService = new AudioService(); 