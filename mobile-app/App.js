import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { paperTheme, isDark } = useAppTheme();
  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
