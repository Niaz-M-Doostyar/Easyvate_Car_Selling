import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const ACCENT_COLORS = {
  default: { primary: '#1b4965', secondary: '#c8963e' },
  blue: { primary: '#1565c0', secondary: '#42a5f5' },
  purple: { primary: '#7b1fa2', secondary: '#ce93d8' },
  green: { primary: '#2e7d32', secondary: '#66bb6a' },
  orange: { primary: '#e65100', secondary: '#ff9800' },
  pink: { primary: '#c2185b', secondary: '#f48fb1' },
  red: { primary: '#b71c1c', secondary: '#ef5350' },
  teal: { primary: '#00695c', secondary: '#26a69a' },
  cyan: { primary: '#00838f', secondary: '#00bcd4' },
  amber: { primary: '#ff8f00', secondary: '#ffca28' },
  indigo: { primary: '#283593', secondary: '#7986cb' },
  emerald: { primary: '#0d5c3e', secondary: '#34d399' },
  slate: { primary: '#334155', secondary: '#94a3b8' },
};

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
        primaryContainer: isDark ? '#1a3150' : '#e3effb',
        secondaryContainer: isDark ? '#3a2a10' : '#fff3e0',
        surface: isDark ? '#121212' : '#ffffff',
        surfaceVariant: isDark ? '#1e1e1e' : '#f5f5f5',
        background: isDark ? '#0a0a0a' : '#fafafa',
        elevation: {
          level0: isDark ? '#12121200' : '#ffffff00',
          level1: isDark ? '#1e1e1e' : '#ffffff',
          level2: isDark ? '#232323' : '#f5f5f5',
          level3: isDark ? '#2a2a2a' : '#eeeeee',
          level4: isDark ? '#2f2f2f' : '#e0e0e0',
          level5: isDark ? '#353535' : '#d6d6d6',
        },
        card: isDark ? '#1e1e1e' : '#ffffff',
        border: isDark ? '#333' : '#e0e0e0',
        success: '#2e7d32',
        error: '#d32f2f',
        warning: '#ed6c02',
        info: '#0288d1',
        gold: '#c8963e',
      },
      roundness: 12,
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
