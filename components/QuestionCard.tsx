import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { TestQuestion } from '@/types/test';
import { Book, Lightbulb, Edit3, Zap } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface QuestionCardProps {
  question: TestQuestion;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

export default function QuestionCard({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  isCorrect,
}: QuestionCardProps) {
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const [showExplanation, setShowExplanation] = useState(false);

  const getQuestionIcon = () => {
    switch (question.type) {
      case 'definition_match':
        return <Book size={24} color="#8B5FBF" />;
      case 'word_match':
        return <Lightbulb size={24} color="#8B5FBF" />;
      case 'fill_blank':
        return <Edit3 size={24} color="#8B5FBF" />;
      case 'synonym_antonym':
        return <Zap size={24} color="#8B5FBF" />;
      default:
        return <Book size={24} color="#8B5FBF" />;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'definition_match':
        return 'Definition Match';
      case 'word_match':
        return 'Word Match';
      case 'fill_blank':
        return 'Fill in the Blank';
      case 'synonym_antonym':
        return 'Synonym/Antonym';
      default:
        return 'Question';
    }
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    cardScale.value = withSpring(0.95, { damping: 15 }, () => {
      cardScale.value = withSpring(1, { damping: 15 });
    });
    
    onAnswer(answer);
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });

  const explanationStyle = useAnimatedStyle(() => {
    const opacity = withTiming(showExplanation ? 1 : 0, { duration: 300 });
    const translateY = withSpring(showExplanation ? 0 : 20, { damping: 15 });
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const getAnswerButtonStyle = (option: string) => {
    if (!isAnswered) return styles.answerButton;
    
    if (option === question.correctAnswer) {
      return [styles.answerButton, styles.correctAnswer];
    }
    
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return [styles.answerButton, styles.incorrectAnswer];
    }
    
    return [styles.answerButton, styles.disabledAnswer];
  };

  const getAnswerButtonTextStyle = (option: string) => {
    if (!isAnswered) return styles.answerButtonText;
    
    if (option === question.correctAnswer) {
      return [styles.answerButtonText, styles.correctAnswerText];
    }
    
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return [styles.answerButtonText, styles.incorrectAnswerText];
    }
    
    return [styles.answerButtonText, styles.disabledAnswerText];
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {getQuestionIcon()}
          <Text style={styles.typeLabel}>{getQuestionTypeLabel()}</Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <Animated.View
            key={index}
            style={getAnswerButtonStyle(option)}
            onTouchEnd={() => handleAnswer(option)}
          >
            <Text style={getAnswerButtonTextStyle(option)}>
              {option}
            </Text>
          </Animated.View>
        ))}
      </View>

      {isAnswered && question.explanation && (
        <Animated.View style={[styles.explanationContainer, explanationStyle]}>
          <View style={styles.explanationHeader}>
            <Text style={styles.explanationTitle}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: '#8B5FBF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5FBF',
    marginLeft: 8,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  correctAnswerText: {
    color: '#155724',
    fontWeight: '600',
  },
  incorrectAnswer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  incorrectAnswerText: {
    color: '#721c24',
    fontWeight: '600',
  },
  disabledAnswer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  disabledAnswerText: {
    color: '#6c757d',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f6ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5FBF',
  },
  explanationHeader: {
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  explanationText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
}); 