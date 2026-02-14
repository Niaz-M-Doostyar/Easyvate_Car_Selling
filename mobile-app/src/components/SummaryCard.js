import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';

export default function SummaryCard({ title, value, icon, color, subtitle, style }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const iconColor = color || c.primary;

  return (
    <Card style={[styles.card, { backgroundColor: c.surface }, style]} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
          <MaterialCommunityIcons name={icon || 'chart-box'} size={24} color={iconColor} />
        </View>
        <View style={styles.textBox}>
          <Text variant="labelSmall" style={[styles.label, { color: c.onSurfaceVariant }]}>{title}</Text>
          <Text variant="titleMedium" style={[styles.value, { color: c.onSurface }]} numberOfLines={1}>{value}</Text>
          {subtitle ? <Text variant="labelSmall" style={{ color: c.onSurfaceVariant, marginTop: 1 }}>{subtitle}</Text> : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, elevation: 1 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  label: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 17, fontWeight: '700', marginTop: 2 },
});
