import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Image
} from 'react-native';
import { vocabularyService } from '@/services/vocabularyService';
import { WordSession } from '@/types/vocabulary';
import { Calendar, BookOpen, Clock } from 'lucide-react-native';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<WordSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await vocabularyService.getAllSessions();
      const sortedSessions = allSessions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#8B5FBF" />
            <Text style={styles.loadingText}>Loading your history...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning History</Text>
        <Text style={styles.subtitle}>Track your vocabulary journey</Text>
      </View>

      {sessions.length > 0 ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.dateContainer}>
                  <View style={styles.calendarIcon}>
                    <Calendar size={20} color="#8B5FBF" />
                  </View>
                  <View style={styles.dateInfo}>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.date)}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#A8A8C7" />
                      <Text style={styles.sessionTime}>
                        {new Date(session.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge, 
                  session.completed ? styles.completedBadge : styles.incompleteBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    session.completed ? styles.completedText : styles.incompleteText
                  ]}>
                    {session.completed ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>

              <View style={styles.sessionContent}>
                <View style={styles.wordCount}>
                  <View style={styles.bookIcon}>
                    <BookOpen size={16} color="#A8D5BA" />
                  </View>
                  <Text style={styles.wordCountText}>
                    {session.words.length} words studied
                  </Text>
                </View>

                <View style={styles.wordPreview}>
                  {session.words.slice(0, 3).map((word, index) => (
                    <View key={word.id} style={styles.wordChip}>
                      <Text style={styles.wordChipText}>{word.word}</Text>
                    </View>
                  ))}
                  {session.words.length > 3 && (
                    <View style={styles.moreWordsChip}>
                      <Text style={styles.moreWordsText}>
                        +{session.words.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
              Start your first vocabulary session to see your learning history here.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCard: {
    backgroundColor: '#F8F6FF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5FBF',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8F6FF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#8B5FBF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#F8F6FF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8DEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#5A4B6B',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
    shadowColor: '#A8D5BA',
  },
  incompleteBadge: {
    backgroundColor: '#FFF4E6',
    shadowColor: '#FFD4A3',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  completedText: {
    color: '#4A7C59',
  },
  incompleteText: {
    color: '#B8860B',
  },
  sessionContent: {
    borderTopWidth: 1,
    borderTopColor: '#E8DEFF',
    paddingTop: 20,
  },
  wordCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  wordCountText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#5A4B6B',
  },
  wordPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    backgroundColor: '#E8DEFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  wordChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5FBF',
  },
  moreWordsChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#B8E6FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  moreWordsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7B8A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCard: {
    backgroundColor: '#F8F6FF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#8B5FBF',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
    textAlign: 'center',
    lineHeight: 24,
  },
});