import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

export default function EmptyState({ loading, message, icon }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.text, { color: c.onSurfaceVariant }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>{icon || '📋'}</Text>
      <Text style={[styles.text, { color: c.onSurfaceVariant }]}>{message || 'No data found'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 200 },
  text: { marginTop: 12, fontSize: 15, textAlign: 'center' },
});
