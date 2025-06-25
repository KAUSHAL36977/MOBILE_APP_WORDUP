import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { PanGestureHandler, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { VocabularyWord } from '@/types/vocabulary';
import { Heart, Brain, Share2 } from 'lucide-react-native';

interface SwipeableCardProps {
  word: VocabularyWord;
  onSwipeLeft: (wordId: string) => void;
  onSwipeRight: (wordId: string) => void;
  onLongPress: (wordId: string) => void;
  index: number;
  totalCards: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;
const SWIPE_THRESHOLD = screenWidth * 0.3;

export default function SwipeableCard({
  word,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  index,
  totalCards,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const longPressRef = useRef(null);

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1; // Subtle vertical movement
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, screenWidth],
        [-30, 30],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        // Swipe left - Save to favorites
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipeLeft)(word.id);
      } else if (shouldSwipeRight) {
        // Swipe right - Mark as known
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipeRight)(word.id);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
      scale.value = withSpring(1);
    },
  });

  const longPressGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onEnd: () => {
      scale.value = withSpring(1);
      runOnJS(onLongPress)(word.id);
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [-screenWidth * 0.5, 0, screenWidth * 0.5];
    const outputRange = [0.8, 1, 0.8];
    const cardScale = interpolate(translateX.value, inputRange, outputRange, Extrapolate.CLAMP);

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value * cardScale },
      ],
      opacity: opacity.value,
    };
  });

  const leftIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Calculate card position for stacking effect
  const stackOffset = (totalCards - index - 1) * 8;
  const stackScale = 1 - (totalCards - index - 1) * 0.05;

  return (
    <View style={[styles.cardContainer, { 
      top: stackOffset, 
      transform: [{ scale: stackScale }],
      zIndex: index 
    }]}>
      <LongPressGestureHandler
        ref={longPressRef}
        onGestureEvent={longPressGestureHandler}
        minDurationMs={500}
      >
        <Animated.View>
          <PanGestureHandler
            onGestureEvent={panGestureHandler}
            simultaneousHandlers={longPressRef}
          >
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              {/* Swipe Indicators */}
              <Animated.View style={[styles.swipeIndicator, styles.leftIndicator, leftIndicatorStyle]}>
                <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.indicatorText}>FAVORITE</Text>
              </Animated.View>

              <Animated.View style={[styles.swipeIndicator, styles.rightIndicator, rightIndicatorStyle]}>
                <Brain size={32} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.indicatorText}>KNOWN</Text>
              </Animated.View>

              {/* Card Content */}
              <View style={styles.cardHeader}>
                <View style={styles.wordSection}>
                  <Text style={styles.word}>{word.word}</Text>
                  <Text style={styles.partOfSpeech}>({word.partOfSpeech})</Text>
                </View>
                <View style={styles.shareHint}>
                  <Share2 size={20} color="#A8A8C7" />
                  <Text style={styles.shareHintText}>Hold to share</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.definitionSection}>
                  <Text style={styles.sectionTitle}>Definition</Text>
                  <Text style={styles.definition}>{word.definition}</Text>
                </View>

                <View style={styles.exampleSection}>
                  <Text style={styles.sectionTitle}>Example</Text>
                  <Text style={styles.example}>"{word.example}"</Text>
                </View>

                <View style={styles.synonymsAntonyms}>
                  <View style={styles.synonymsSection}>
                    <Text style={styles.sectionTitle}>Synonyms</Text>
                    <View style={styles.tagContainer}>
                      {word.synonyms.slice(0, 2).map((synonym, idx) => (
                        <View key={idx} style={styles.synonymTag}>
                          <Text style={styles.synonymText}>{synonym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.antonymsSection}>
                    <Text style={styles.sectionTitle}>Antonyms</Text>
                    <View style={styles.tagContainer}>
                      {word.antonyms.slice(0, 2).map((antonym, idx) => (
                        <View key={idx} style={styles.antonymTag}>
                          <Text style={styles.antonymText}>{antonym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Gesture Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionItem}>
                  <View style={[styles.instructionIcon, { backgroundColor: '#FFE8E8' }]}>
                    <Heart size={16} color="#B85450" />
                  </View>
                  <Text style={styles.instructionText}>Swipe left to favorite</Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={[styles.instructionIcon, { backgroundColor: '#E8F5E8' }]}>
                    <Brain size={16} color="#4A7C59" />
                  </View>
                  <Text style={styles.instructionText}>Swipe right if known</Text>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </LongPressGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#F8F6FF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C8B5FF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 10,
  },
  leftIndicator: {
    left: 40,
    backgroundColor: '#B85450',
    transform: [{ translateY: -60 }],
  },
  rightIndicator: {
    right: 40,
    backgroundColor: '#4A7C59',
    transform: [{ translateY: -60 }],
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  wordSection: {
    flex: 1,
  },
  word: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#8B5FBF',
    marginBottom: 4,
  },
  partOfSpeech: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#A8D5BA',
  },
  shareHint: {
    alignItems: 'center',
    opacity: 0.6,
  },
  shareHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
    marginTop: 4,
  },
  cardBody: {
    flex: 1,
  },
  definitionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#8B5FBF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  definition: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5A4B6B',
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#E8DEFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exampleSection: {
    marginBottom: 20,
  },
  example: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7B8A',
    fontStyle: 'italic',
    lineHeight: 24,
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#B8E6FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  synonymsAntonyms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  synonymsSection: {
    flex: 1,
    marginRight: 12,
  },
  antonymsSection: {
    flex: 1,
    marginLeft: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#A8D5BA',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  synonymText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4A7C59',
  },
  antonymTag: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#FFB5B5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  antonymText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#B85450',
  },
  instructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8DEFF',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#A8A8C7',
  },
});