import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from './LocalizedPaper';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector({ compact = false, dark = false, onBeforeChange }) {
  const { languages, language, setLanguage, t, fontFamily, isRTL } = useLanguage();
  const selectLanguage = (code) => {
    if (code === language) return;
    if (onBeforeChange) {
      onBeforeChange();
      setTimeout(() => setLanguage(code), 260);
    } else {
      setLanguage(code);
    }
  };
  return <View style={[styles.wrap, compact && styles.compact]} accessibilityLabel={t('Select language')}>
    {!compact && <Text style={[styles.label, { fontFamily }, !dark && styles.lightLabel]}>{t('Language')}</Text>}
    <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>{languages.map(item => <Pressable key={item.code} onPress={() => selectLanguage(item.code)} style={[styles.item, !dark && styles.lightItem, language === item.code && (dark ? styles.active : styles.lightActive)]}><Text style={[styles.itemText, { fontFamily, writingDirection: item.rtl ? 'rtl' : 'ltr' }, !dark && styles.lightText, language === item.code && styles.activeText]}>{item.nativeLabel}</Text><Text style={[styles.sub, { fontFamily }, !dark && styles.lightText, language === item.code && styles.activeText]}>{item.label}</Text></Pressable>)}</View>
  </View>;
}
const styles = StyleSheet.create({ wrap: { marginTop: 14 }, compact: { marginTop: 0 }, label: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 }, lightLabel: { color: '#6b7280' }, row: { flexDirection: 'row', justifyContent: 'center', gap: 8 }, item: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 7, alignItems: 'center', minWidth: 70 }, lightItem: { borderColor: '#d1d5db' }, active: { backgroundColor: '#fff', borderColor: '#fff' }, lightActive: { backgroundColor: '#0f3460', borderColor: '#0f3460' }, itemText: { color: '#fff', fontSize: 14, fontWeight: '800' }, sub: { color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 1 }, lightText: { color: '#374151' }, activeText: { color: '#fff' } });
