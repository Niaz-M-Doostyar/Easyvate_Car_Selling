import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { paperTheme, isDark } = useAppTheme();
  const { fontFamily } = useLanguage();
  const localizedTheme = { ...paperTheme, fonts: Object.fromEntries(Object.entries(paperTheme.fonts).map(([key, value]) => [key, { ...value, fontFamily }])) };

  return (
    <PaperProvider theme={localizedTheme}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <RootNavigator />
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider><AuthProvider><AppContent /></AuthProvider></LanguageProvider>
    </ThemeProvider>
  );
}
