import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { VocabularyWord } from '@/types/vocabulary';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';

interface WordCardProps {
  word: VocabularyWord;
}

export default function WordCard({ word }: WordCardProps) {
  const { markWordAsFavorite, markWordAsKnown, speakWord } = useAppStore();
  const { theme } = useTheme();

  const handleFavorite = async () => {
    try {
      await markWordAsFavorite(word.id);
      Alert.alert('Success', 'Word added to favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add to favorites');
    }
  };

  const handleKnown = async () => {
    try {
      await markWordAsKnown(word.id);
      Alert.alert('Success', 'Word marked as known!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as known');
    }
  };

  const handleSpeak = () => {
    speakWord(word.word);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Word Header */}
      <View style={styles.wordHeader}>
        <View style={styles.wordInfo}>
          <Text style={[styles.word, { color: theme.text }]}>{word.word}</Text>
          <Text style={[styles.partOfSpeech, { color: theme.textSecondary }]}>{word.partOfSpeech}</Text>
        </View>
        <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
          <Text style={styles.speakIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Definition */}
      <Text style={[styles.definition, { color: theme.text }]}>{word.definition}</Text>

      {/* Example */}
      <Text style={[styles.example, { color: theme.textSecondary }]}>
        "{word.example}"
      </Text>

      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: theme.primaryContainer }]}>
        <Text style={[styles.categoryText, { color: theme.primary }]}>{word.category}</Text>
      </View>

      {/* SRS Level */}
      <View style={styles.srsInfo}>
        <Text style={[styles.srsLevelText, { color: theme.textSecondary }]}>
          SRS Level: {word.srsLevel}
        </Text>
        <View style={[styles.srsProgressBar, { backgroundColor: theme.divider }]}>
          <View
            style={[
              styles.srsProgressFill,
              {
                width: `${(word.srsLevel / 10) * 100}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surfaceVariant }]}
          onPress={handleFavorite}
        >
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>Favorite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surfaceVariant }]}
          onPress={handleKnown}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>Known</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wordInfo: {
    flex: 1,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partOfSpeech: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  speakButton: {
    padding: 8,
  },
  speakIcon: {
    fontSize: 20,
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  srsInfo: {
    marginBottom: 16,
  },
  srsLevelText: {
    fontSize: 12,
    marginBottom: 4,
  },
  srsProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  srsProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});