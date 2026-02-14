import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../contexts/ThemeContext';

export default function SummaryCard({ title, value, icon, color, subtitle, style, onPress }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const iconColor = color || c.primary;

  return (
    <View style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.md, style]}>
      <View style={styles.content}>
        <LinearGradient
          colors={[iconColor + '20', iconColor + '08']}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={icon || 'chart-box'} size={22} color={iconColor} />
        </LinearGradient>
        <View style={styles.textBox}>
          <Text style={[styles.label, { color: c.onSurfaceVariant }]}>{title}</Text>
          <Text style={[styles.value, { color: c.onSurface }]} numberOfLines={1}>{value}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={[styles.accent, { backgroundColor: iconColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', position: 'relative' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingVertical: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: 18, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  accent: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
});
