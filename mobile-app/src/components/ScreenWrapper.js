import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Appbar, Text } from './LocalizedPaper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ScreenWrapper({ title, navigation, children, actions, fab, back }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const { t, fontFamily, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.root, { backgroundColor: c.background, direction: isRTL ? 'rtl' : 'ltr' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.background} />
      <SafeAreaView edges={['top']} style={[styles.headerShell, { backgroundColor: c.background, borderBottomColor: c.border }]}>
        <LinearGradient
          colors={isDark ? [c.surface, c.surface] : [c.primary + '08', c.background]}
          style={styles.headerGradient}
        >
          <Appbar.Header
            style={styles.header}
            statusBarHeight={0}
          >
            {back && navigation?.goBack ? (
              <Appbar.BackAction onPress={() => navigation.goBack()} icon={isRTL ? 'arrow-right' : 'arrow-left'} iconColor={c.onSurface} />
            ) : navigation?.openDrawer ? (
              <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} iconColor={c.onSurface} />
            ) : navigation?.goBack ? (
              <Appbar.BackAction onPress={() => navigation.goBack()} iconColor={c.onSurface} />
            ) : null}
            <Appbar.Content
              title={t(title)}
              titleStyle={[styles.title, { color: c.onSurface, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}
            />
            {actions}
          </Appbar.Header>
        </LinearGradient>
      </SafeAreaView>
      <View style={[styles.content, { paddingBottom: bottomInset, direction: isRTL ? 'rtl' : 'ltr' }]}>{children}</View>
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
