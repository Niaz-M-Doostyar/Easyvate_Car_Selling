import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';

export default function EmptyState({ loading, message, icon }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loaderBox, { backgroundColor: c.primary + '10' }]}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
        <Text style={[styles.loadingText, { color: c.onSurfaceVariant }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: c.surfaceVariant }]}>
        <Text style={styles.emoji}>{icon || '📋'}</Text>
      </View>
      <Text style={[styles.message, { color: c.onSurface }]}>{message || 'No data found'}</Text>
      <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>Pull down to refresh</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 280 },
  loaderBox: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emoji: { fontSize: 36 },
  message: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  hint: { fontSize: 13, fontWeight: '400', textAlign: 'center' },
});
