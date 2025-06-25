import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import CategoryTabs from '@/components/CategoryTabs';
import WordCard from '@/components/WordCard';
import { useTheme } from '@/hooks/useTheme';
import { getCardShadow } from '@/constants/theme';
import { Category } from '@/types/vocabulary';

export default function BrowseScreen() {
  const { categoryWords, selectedCategory, loadCategoryWords, setSelectedCategory } = useAppStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const categories: Category[] = ['Science', 'Technology', 'Arts', 'Literature'];

  useEffect(() => {
    if (selectedCategory !== 'All') {
      loadCategoryWords(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategorySelect = async (category: Category) => {
    setIsLoading(true);
    setSelectedCategory(category);
    await loadCategoryWords(category);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Text style={[styles.title, { color: theme.text }]}>Browse Words</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Explore vocabulary by category
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory as Category}
          onCategorySelect={handleCategorySelect}
        />
      </View>

      {/* Words List */}
      <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading words...</Text>
          </View>
        ) : categoryWords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No words found</Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              {selectedCategory === 'All' 
                ? 'Select a category to browse words'
                : `No words available in ${selectedCategory} category`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.wordsGrid}>
            {categoryWords.map((word) => (
              <View key={word.id} style={[styles.wordCardContainer, { ...getCardShadow(theme) }]}>
                <WordCard word={word} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  wordsList: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  wordsGrid: {
    gap: 16,
  },
  wordCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
}); 