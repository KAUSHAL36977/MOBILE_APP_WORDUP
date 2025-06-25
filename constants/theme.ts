export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Primary colors
  primary: string;
  primaryVariant: string;
  primaryContainer: string;
  
  // Secondary colors
  secondary: string;
  secondaryVariant: string;
  secondaryContainer: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  outline: string;
  
  // Interactive colors
  ripple: string;
  overlay: string;
  
  // Special colors
  accent: string;
  accentVariant: string;
  accentContainer: string;
  
  // SRS specific colors
  srsLevel1: string;
  srsLevel2: string;
  srsLevel3: string;
  srsLevel4: string;
  srsLevel5: string;
  
  // Quality assessment colors
  qualityAgain: string;
  qualityHard: string;
  qualityGood: string;
  qualityEasy: string;
  qualityPerfect: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f8f9fa',
  surfaceElevated: '#ffffff',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#ffffff',
  
  // Primary colors
  primary: '#8B5FBF',
  primaryVariant: '#7E57C2',
  primaryContainer: '#E8DEFF',
  
  // Secondary colors
  secondary: '#2196F3',
  secondaryVariant: '#1976D2',
  secondaryContainer: '#E3F2FD',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider colors
  border: '#e0e0e0',
  divider: '#f0f0f0',
  outline: '#e0e0e0',
  
  // Interactive colors
  ripple: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Special colors
  accent: '#8B5FBF',
  accentVariant: '#7E57C2',
  accentContainer: '#E8DEFF',
  
  // SRS specific colors
  srsLevel1: '#FF6B6B',
  srsLevel2: '#FFA726',
  srsLevel3: '#66BB6A',
  srsLevel4: '#42A5F5',
  srsLevel5: '#7E57C2',
  
  // Quality assessment colors
  qualityAgain: '#FF6B6B',
  qualityHard: '#FFA726',
  qualityGood: '#66BB6A',
  qualityEasy: '#42A5F5',
  qualityPerfect: '#7E57C2',
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2d2d2d',
  surfaceElevated: '#2d2d2d',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  textInverse: '#1a1a1a',
  
  // Primary colors
  primary: '#BB86FC',
  primaryVariant: '#A66FFC',
  primaryContainer: '#3700B3',
  
  // Secondary colors
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  secondaryContainer: '#004D40',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider colors
  border: '#404040',
  divider: '#2d2d2d',
  outline: '#404040',
  
  // Interactive colors
  ripple: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Special colors
  accent: '#BB86FC',
  accentVariant: '#A66FFC',
  accentContainer: '#3700B3',
  
  // SRS specific colors
  srsLevel1: '#FF6B6B',
  srsLevel2: '#FFA726',
  srsLevel3: '#66BB6A',
  srsLevel4: '#42A5F5',
  srsLevel5: '#BB86FC',
  
  // Quality assessment colors
  qualityAgain: '#FF6B6B',
  qualityHard: '#FFA726',
  qualityGood: '#66BB6A',
  qualityEasy: '#42A5F5',
  qualityPerfect: '#BB86FC',
};

export const getTheme = (colorScheme: ColorScheme): ThemeColors => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

// Theme-aware color utilities
export const getContrastText = (backgroundColor: string, theme: ThemeColors): string => {
  // Simple contrast calculation - in a real app, you'd use a more sophisticated algorithm
  return backgroundColor === theme.surface ? theme.text : theme.textInverse;
};

export const getElevatedSurface = (theme: ThemeColors): string => {
  return theme.surfaceElevated;
};

export const getCardShadow = (theme: ThemeColors) => {
  if (theme.background === darkTheme.background) {
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    };
  } else {
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    };
  }
}; 