import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

export default function ScreenWrapper({ title, navigation, children, actions, subtitle, fab, back }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Appbar.Header style={{ backgroundColor: c.surface, elevation: 2 }} statusBarHeight={44}>
        {back && navigation?.goBack ? (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        ) : navigation?.openDrawer ? (
          <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        ) : navigation?.goBack ? (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        ) : null}
        <Appbar.Content
          title={title}
          subtitle={subtitle}
          titleStyle={{ fontSize: 18, fontWeight: '700' }}
        />
        {actions}
      </Appbar.Header>
      <View style={styles.content}>{children}</View>
      {fab}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
