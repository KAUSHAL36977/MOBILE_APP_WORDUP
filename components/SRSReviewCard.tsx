import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { VocabularyWord } from '@/types/vocabulary';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface SRSReviewCardProps {
  word: VocabularyWord;
  onComplete: (quality: number) => void;
  onSkip: () => void;
}

const { width } = Dimensions.get('window');

export const SRSReviewCard: React.FC<SRSReviewCardProps> = ({
  word,
  onComplete,
  onSkip,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const { speakWord } = useAppStore();
  const { theme } = useTheme();
  
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  const qualityOptions = [
    { value: 0, label: 'Again', color: theme.qualityAgain, emoji: '😵' },
    { value: 1, label: 'Hard', color: theme.qualityHard, emoji: '😰' },
    { value: 2, label: 'Good', color: theme.qualityGood, emoji: '😊' },
    { value: 3, label: 'Easy', color: theme.qualityEasy, emoji: '😎' },
    { value: 4, label: 'Perfect', color: theme.qualityPerfect, emoji: '🤩' },
  ];

  const handleShowAnswer = () => {
    setShowAnswer(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleQualitySelect = async (quality: number) => {
    setSelectedQuality(quality);
    
    // Haptic feedback
    if (quality >= 3) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (quality >= 2) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Animate card out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 2,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete(quality);
    });
  };

  const handleSpeak = () => {
    speakWord(word.word);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [0, 0, -width],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          ...getCardShadow(theme),
        }
      ]}>
        {/* Word Section */}
        <View style={styles.wordSection}>
          <Text style={[styles.word, { color: theme.text }]}>{word.word}</Text>
          <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.partOfSpeech, { color: theme.textSecondary }]}>{word.partOfSpeech}</Text>

        {/* SRS Level Indicator */}
        <View style={styles.srsLevelContainer}>
          <Text style={[styles.srsLevelText, { color: theme.textSecondary }]}>Level {word.srsLevel}</Text>
          <View style={[styles.srsProgressBar, { backgroundColor: theme.divider }]}>
            <View 
              style={[
                styles.srsProgress, 
                { 
                  width: `${(word.srsLevel / 10) * 100}%`,
                  backgroundColor: theme.success,
                }
              ]} 
            />
          </View>
        </View>

        {/* Question */}
        <Text style={[styles.question, { color: theme.text }]}>
          Do you remember the meaning of this word?
        </Text>

        {!showAnswer ? (
          <TouchableOpacity 
            style={[styles.showAnswerButton, { backgroundColor: theme.primary }]} 
            onPress={handleShowAnswer}
          >
            <Text style={[styles.showAnswerText, { color: theme.textInverse }]}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View
            style={[
              styles.answerSection,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.definition, { color: theme.text }]}>{word.definition}</Text>
            <Text style={[styles.example, { color: theme.textSecondary }]}>{word.example}</Text>

            {/* Quality Selection */}
            <View style={styles.qualityContainer}>
              <Text style={[styles.qualityQuestion, { color: theme.text }]}>How well did you know it?</Text>
              <View style={styles.qualityOptions}>
                {qualityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityButton,
                      {
                        backgroundColor: option.color,
                        opacity: selectedQuality === option.value ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => handleQualitySelect(option.value)}
                    disabled={selectedQuality !== null}
                  >
                    <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                    <Text style={styles.qualityLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  wordSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
  },
  speakButton: {
    padding: 8,
  },
  speakIcon: {
    fontSize: 24,
  },
  partOfSpeech: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  srsLevelContainer: {
    marginBottom: 20,
  },
  srsLevelText: {
    fontSize: 14,
    marginBottom: 4,
  },
  srsProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  srsProgress: {
    height: '100%',
    borderRadius: 2,
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  showAnswerButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  showAnswerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  answerSection: {
    marginTop: 20,
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qualityContainer: {
    marginBottom: 20,
  },
  qualityQuestion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  qualityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  qualityEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 14,
  },
}); 