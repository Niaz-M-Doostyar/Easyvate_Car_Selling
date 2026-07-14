import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/ThemeContext';

export default function ScreenWrapper({ title, navigation, children, actions, fab, back }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.background} />
      <View style={[styles.headerShell, { paddingTop: insets.top, backgroundColor: c.background, borderBottomColor: c.border }]}> 
        <LinearGradient
          colors={isDark ? [c.surface, c.surface] : [c.primary + '08', c.background]}
          style={styles.headerGradient}
        >
          <Appbar.Header
            style={styles.header}
            statusBarHeight={0}
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
      </View>
      <View style={[styles.content, { paddingBottom: bottomInset }]}>{children}</View>
      {fab && React.cloneElement(fab, {
        style: [fab.props.style, { bottom: 16 + (Platform.OS === 'ios' ? insets.bottom : 0) }],
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerShell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerGradient: {},
  header: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  content: { flex: 1 },
});
