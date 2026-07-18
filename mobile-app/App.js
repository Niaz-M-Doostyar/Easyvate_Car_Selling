import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// Keep the provider on the same Paper module entry used by LocalizedPaper.
// Mixing the package's CommonJS and ESM entries creates separate Portal
// contexts, causing dialogs to report that no Paper provider exists.
import { PaperProvider } from 'react-native-paper/lib/module/index';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { paperTheme, isDark } = useAppTheme();
  const { fontFamily, language } = useLanguage();
  const localizedTheme = {
    ...paperTheme,
    fonts: Object.fromEntries(Object.entries(paperTheme.fonts).map(([key, value]) => {
      const numericWeight = Number.parseInt(String(value.fontWeight), 10);
      const fontWeight = language === 'en' && numericWeight > 600 ? '600' : value.fontWeight;
      return [key, { ...value, fontFamily, fontWeight }];
    })),
  };

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
