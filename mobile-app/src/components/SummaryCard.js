import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from './LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ResponsiveAmount from './ResponsiveAmount';

export default function SummaryCard({ title, value, icon, color, subtitle, style, onPress }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const iconColor = color || c.primary;
  const { t, isRTL, fontFamily } = useLanguage();

  return (
    <View style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.md, style]}>
      <View style={styles.innerClip}>
        <View style={[styles.content, isRTL && { flexDirection: 'row-reverse' }]}>
          <LinearGradient
            colors={[iconColor + '20', iconColor + '08']}
            style={styles.iconBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name={icon || 'chart-box'} size={22} color={iconColor} />
          </LinearGradient>
          <View style={styles.textBox}>
            <Text style={[styles.label, { color: c.onSurfaceVariant, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t(title)}</Text>
            <ResponsiveAmount style={[styles.value, { color: c.onSurface, textAlign: isRTL ? 'right' : 'left' }]}>{value}</ResponsiveAmount>
            {subtitle ? <Text style={[styles.subtitle, { color: c.onSurfaceVariant, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t(subtitle)}</Text> : null}
          </View>
        </View>
        <View style={[styles.accent, { backgroundColor: iconColor }, isRTL && styles.accentRTL]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible', position: 'relative' },
  innerClip: { borderRadius: 16, overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingVertical: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: 18, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  accent: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  accentRTL: { left: undefined, right: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
});
