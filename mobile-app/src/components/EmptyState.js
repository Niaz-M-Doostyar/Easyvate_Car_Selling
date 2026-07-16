import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from './LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function EmptyState({ loading, message, icon }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const { t, isRTL, fontFamily } = useLanguage();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loaderBox, { backgroundColor: c.primary + '10' }]}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
        <Text style={[styles.loadingText, { color: c.onSurfaceVariant, fontFamily }]}>{t('Loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: c.surfaceVariant }]}>
        <Text style={styles.emoji}>{icon || '📋'}</Text>
      </View>
      <Text style={[styles.message, { color: c.onSurface, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t(message || 'No data found')}</Text>
      <Text style={[styles.hint, { color: c.onSurfaceVariant, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('Pull down to refresh')}</Text>
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
