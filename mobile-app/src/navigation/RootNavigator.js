import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import PublicCarDetailScreen from '../screens/PublicCarDetailScreen';
import PublicTabNavigator from './PublicTabNavigator';
import AppDrawer from './AppDrawer';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { paperTheme, isDark } = useAppTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  const baseNavTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseNavTheme,
    dark: isDark,
    colors: {
      ...baseNavTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.border,
      notification: paperTheme.colors.error,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={AppDrawer} />
        ) : (
          <>
            <Stack.Screen name="PublicTabs" component={PublicTabNavigator} />
            <Stack.Screen name="CarDetail" component={PublicCarDetailScreen} options={{ animationTypeForReplace: 'push' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'push' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
