import { Platform, ColorSchemeName } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const theme = {
  colors: {
    ios: {
      light: {
        primary: '#007AFF',
        background: '#F2F2F7',
        surface: '#FFFFFF',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C6C6C8',
        destructive: '#FF3B30',
      },
      dark: {
        primary: '#0A84FF',
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        destructive: '#FF453A',
      },
    },
    android: {
      light: {
        primary: '#6750A4',
        background: '#FEF7FF',
        surface: '#F3EDF7',
        text: '#1D1B20',
        textSecondary: '#49454F',
        border: '#79747E',
        destructive: '#B3261E',
      },
      dark: {
        primary: '#D0BCFF',
        background: '#141218',
        surface: '#2B2930',
        text: '#E6E1E5',
        textSecondary: '#CAC4D0',
        border: '#938F99',
        destructive: '#F2B8B5',
      },
    },
  },
  typography: {
    ios: {
      fontFamily: 'System', // SF Pro
      largeTitle: 'text-3xl font-bold tracking-tight',
      header: 'text-xl font-semibold',
      body: 'text-base font-normal',
      caption: 'text-xs text-gray-500',
    },
    android: {
      fontFamily: 'Roboto',
      largeTitle: 'text-3xl font-medium tracking-normal',
      header: 'text-lg font-medium',
      body: 'text-base font-normal tracking-wide',
      caption: 'text-xs text-gray-600',
    },
  },
  spacing: {
    gutter: 16,
    cardRadius: isIOS ? 10 : 12,
    buttonRadius: isIOS ? 999 : 8, // Pill for iOS, M3 rounded for Android
  }
};

/**
 * Helper to get platform-specific Tailwind classes
 */
export const platformClasses = {
  container: isIOS ? 'bg-ios-background px-4' : 'bg-android-background px-4',
  card: isIOS
    ? 'bg-white rounded-[10px] p-4 shadow-sm'
    : 'bg-android-surface rounded-[12px] p-4 elevation-1',
  header: isIOS
    ? 'text-2xl font-bold py-4'
    : 'text-xl font-medium py-3',
  button: isIOS
    ? 'bg-ios-primary rounded-full py-3 px-6'
    : 'bg-android-primary rounded-[100px] py-2.5 px-6 elevation-2',
  buttonText: 'text-white font-semibold text-center',
  input: isIOS
    ? 'bg-white border-b border-gray-200 py-3 px-4'
    : 'bg-android-surface border border-gray-400 rounded-md py-3 px-4',
};
