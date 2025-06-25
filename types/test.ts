import { VocabularyWord } from './vocabulary';

export type QuestionType = 
  | 'definition_match'
  | 'word_match'
  | 'fill_blank'
  | 'synonym_antonym'
  | 'audio_pronunciation';

export interface TestQuestion {
  id: string;
  type: QuestionType;
  word: VocabularyWord;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TestSession {
  id: string;
  date: string;
  questions: TestQuestion[];
  userAnswers: Record<string, string>;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  streak: number;
  maxStreak: number;
}

export interface TestResult {
  sessionId: string;
  accuracy: number;
  timeTaken: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
  maxStreak: number;
  wordsToReview: string[];
  date: string;
}

export interface TestProgress {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  timeElapsed: number;
  isComplete: boolean;
} 