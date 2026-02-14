import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const ACCENT_COLORS = {
  default: { primary: '#0f3460', secondary: '#c8963e', gradient: ['#0f3460', '#1a5276'] },
  blue: { primary: '#1565c0', secondary: '#42a5f5', gradient: ['#0d47a1', '#1976d2'] },
  purple: { primary: '#6a1b9a', secondary: '#ba68c8', gradient: ['#4a148c', '#7b1fa2'] },
  green: { primary: '#1b5e20', secondary: '#4caf50', gradient: ['#1b5e20', '#2e7d32'] },
  orange: { primary: '#bf360c', secondary: '#ff7043', gradient: ['#bf360c', '#e64a19'] },
  pink: { primary: '#ad1457', secondary: '#f06292', gradient: ['#880e4f', '#c2185b'] },
  red: { primary: '#b71c1c', secondary: '#ef5350', gradient: ['#7f0000', '#c62828'] },
  teal: { primary: '#004d40', secondary: '#26a69a', gradient: ['#004d40', '#00695c'] },
  cyan: { primary: '#006064', secondary: '#00bcd4', gradient: ['#006064', '#00838f'] },
  amber: { primary: '#e65100', secondary: '#ffb300', gradient: ['#e65100', '#f57c00'] },
  indigo: { primary: '#1a237e', secondary: '#5c6bc0', gradient: ['#0d1b60', '#283593'] },
  emerald: { primary: '#064e3b', secondary: '#34d399', gradient: ['#064e3b', '#047857'] },
  slate: { primary: '#1e293b', secondary: '#64748b', gradient: ['#0f172a', '#1e293b'] },
};

// Premium shadow system
const SHADOWS = Platform.select({
  ios: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
    xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 },
    colored: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 }),
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
    xl: { elevation: 12 },
    colored: () => ({ elevation: 6 }),
  },
});

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
const RADII = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 100 };

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [accentKey, setAccentKey] = useState('default');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.multiGet(['theme_dark', 'theme_accent']);
      if (stored[0][1] !== null) setIsDark(stored[0][1] === 'true');
      else setIsDark(systemScheme === 'dark');
      if (stored[1][1]) setAccentKey(stored[1][1]);
    })();
  }, [systemScheme]);

  const toggleDark = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme_dark', String(next));
  };

  const setAccent = async (key) => {
    setAccentKey(key);
    await AsyncStorage.setItem('theme_accent', key);
  };

  const colors = ACCENT_COLORS[accentKey] || ACCENT_COLORS.default;

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        secondary: colors.secondary,
        primaryContainer: isDark ? colors.primary + '25' : colors.primary + '0D',
        secondaryContainer: isDark ? colors.secondary + '25' : colors.secondary + '12',
        surface: isDark ? '#1a1a2e' : '#ffffff',
        surfaceVariant: isDark ? '#222240' : '#f0f2f8',
        background: isDark ? '#0f0f1e' : '#f5f7fb',
        onSurface: isDark ? '#e8eaf6' : '#1a1a2e',
        onSurfaceVariant: isDark ? '#9e9eb8' : '#6b7280',
        onBackground: isDark ? '#e8eaf6' : '#1a1a2e',
        outline: isDark ? '#3a3a5c' : '#e2e5f0',
        elevation: {
          level0: isDark ? '#0f0f1e' : '#f5f7fb',
          level1: isDark ? '#1a1a2e' : '#ffffff',
          level2: isDark ? '#222240' : '#f8f9fc',
          level3: isDark ? '#2a2a48' : '#f0f2f8',
          level4: isDark ? '#323258' : '#e8eaf0',
          level5: isDark ? '#3a3a60' : '#e0e2e8',
        },
        card: isDark ? '#1a1a2e' : '#ffffff',
        cardAlt: isDark ? '#222240' : '#f8f9fd',
        border: isDark ? '#2a2a48' : '#e8eaf0',
        success: '#10b981',
        successBg: isDark ? '#10b98118' : '#10b98110',
        error: '#ef4444',
        errorBg: isDark ? '#ef444418' : '#ef444410',
        warning: '#f59e0b',
        warningBg: isDark ? '#f59e0b18' : '#f59e0b10',
        info: '#3b82f6',
        infoBg: isDark ? '#3b82f618' : '#3b82f610',
        gold: '#d4a843',
        goldBg: isDark ? '#d4a84318' : '#d4a84310',
        gradient: colors.gradient,
        shimmer: isDark ? '#ffffff08' : '#00000005',
      },
      roundness: 14,
      shadows: SHADOWS,
      spacing: SPACING,
      radii: RADII,
    };
  }, [isDark, colors]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark: toggleDark, accentKey, setAccentKey: setAccent, paperTheme, colors, ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const ACCENT_PRESETS = ACCENT_COLORS;

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be inside ThemeProvider');
  return ctx;
};
