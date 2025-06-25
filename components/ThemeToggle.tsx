import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = false,
}) => {
  const { colorScheme, toggleTheme, theme } = useTheme();
  const animatedValue = new Animated.Value(colorScheme === 'dark' ? 1 : 0);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: colorScheme === 'dark' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [colorScheme]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 24, iconSize: 16 };
      case 'large':
        return { width: 60, height: 32, iconSize: 20 };
      default:
        return { width: 50, height: 28, iconSize: 18 };
    }
  };

  const { width, height, iconSize } = getSize();

  const toggleWidth = width - 4;
  const toggleHeight = height - 4;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {colorScheme === 'dark' ? 'Dark' : 'Light'}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.toggle,
          {
            width,
            height,
            backgroundColor: colorScheme === 'dark' ? theme.primary : theme.border,
          },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleHandle,
            {
              width: toggleHeight,
              height: toggleHeight,
              backgroundColor: theme.surface,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, toggleWidth - toggleHeight + 2],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.toggleIcon,
              {
                fontSize: iconSize,
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            🌙
          </Animated.Text>
          <Animated.Text
            style={[
              styles.toggleIcon,
              {
                fontSize: iconSize,
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            ☀️
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
  },
  toggleHandle: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleIcon: {
    position: 'absolute',
  },
}); 