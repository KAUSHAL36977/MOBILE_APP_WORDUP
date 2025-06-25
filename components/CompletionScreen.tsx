import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { RefreshCw, Trophy, Heart, Brain } from 'lucide-react-native';
import { useEffect } from 'react';

interface CompletionScreenProps {
  onRequestNewSet: () => void;
  wordsCompleted: number;
  favoriteCount: number;
  knownCount: number;
}

export default function CompletionScreen({
  onRequestNewSet,
  wordsCompleted,
  favoriteCount,
  knownCount,
}: CompletionScreenProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Animate entrance
    scale.value = withSequence(
      withSpring(1.2, { duration: 600 }),
      withSpring(1, { duration: 300 })
    );
    opacity.value = withSpring(1, { duration: 800 });
    translateY.value = withSpring(0, { duration: 800 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.completionCard, containerStyle]}>
        {/* Trophy Animation */}
        <View style={styles.trophyContainer}>
          <View style={styles.trophyIcon}>
            <Trophy size={48} color="#FFD700" />
          </View>
          <Text style={styles.congratsText}>Congratulations! 🎉</Text>
          <Text style={styles.completionMessage}>
            You've completed all {wordsCompleted} words in this session!
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFE8E8' }]}>
              <Heart size={24} color="#B85450" />
            </View>
            <Text style={styles.statNumber}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
              <Brain size={24} color="#4A7C59" />
            </View>
            <Text style={styles.statNumber}>{knownCount}</Text>
            <Text style={styles.statLabel}>Known</Text>
          </View>
        </View>

        {/* Motivational Image */}
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400' }}
          style={styles.motivationalImage}
        />

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.newSetButton}
          onPress={onRequestNewSet}
          activeOpacity={0.8}
        >
          <RefreshCw size={24} color="#FFFFFF" />
          <Text style={styles.newSetButtonText}>Get New Word Set</Text>
        </TouchableOpacity>

        {/* Motivational Quote */}
        <Text style={styles.motivationalQuote}>
          "Every word you learn is a step towards expanding your world."
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
  },
  completionCard: {
    backgroundColor: '#F8F6FF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    width: '100%',
    maxWidth: 400,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  congratsText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#8B5FBF',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#5A4B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#A8A8C7',
  },
  motivationalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  newSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5FBF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  newSetButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  motivationalQuote: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B5FBF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});