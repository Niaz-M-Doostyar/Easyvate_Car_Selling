import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../contexts/ThemeContext';

export default function ScreenWrapper({ title, navigation, children, actions, fab, back }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <LinearGradient
        colors={isDark ? [c.surface, c.surface] : [c.primary + '08', c.background]}
        style={styles.headerGradient}
      >
        <Appbar.Header
          style={styles.header}
          statusBarHeight={Platform.OS === 'ios' ? 50 : StatusBar.currentHeight}
        >
          {back && navigation?.goBack ? (
            <Appbar.BackAction onPress={() => navigation.goBack()} iconColor={c.onSurface} />
          ) : navigation?.openDrawer ? (
            <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} iconColor={c.onSurface} />
          ) : navigation?.goBack ? (
            <Appbar.BackAction onPress={() => navigation.goBack()} iconColor={c.onSurface} />
          ) : null}
          <Appbar.Content
            title={title}
            titleStyle={[styles.title, { color: c.onSurface }]}
          />
          {actions}
        </Appbar.Header>
      </LinearGradient>
      <View style={styles.content}>{children}</View>
      {fab}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerGradient: {},
  header: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  content: { flex: 1 },
});
