import { useState, useEffect, createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme, ThemeColors, getTheme } from '@/constants/theme';

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeContextType {
  colorScheme: ColorScheme;
  theme: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeProvider = () => {
  const systemColorScheme = useColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setColorScheme(savedTheme);
      } else {
        // Use system theme if no saved preference
        setColorScheme(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setColorScheme(systemColorScheme || 'light');
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTheme = async (theme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (theme: ColorScheme) => {
    setColorScheme(theme);
    saveTheme(theme);
  };

  const theme = getTheme(colorScheme);

  return {
    colorScheme,
    theme,
    toggleTheme,
    setTheme,
    isLoaded,
  };
};

export { ThemeContext }; 