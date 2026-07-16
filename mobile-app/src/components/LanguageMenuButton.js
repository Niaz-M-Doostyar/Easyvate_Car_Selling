import React, { useState } from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';
import { Text } from './LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageMenuButton({ light = false, onBeforeChange, style }) {
  const [visible, setVisible] = useState(false);
  const { languages, language, setLanguage, t, fontFamily, isRTL } = useLanguage();
  const active = languages.find(item => item.code === language);
  const choose = (code) => {
    setVisible(false);
    if (code === language) return;
    onBeforeChange?.();
    setTimeout(() => setLanguage(code), onBeforeChange ? 260 : 0);
  };
  return (
    <View style={style}>
      <Pressable accessibilityLabel={t('Language')} onPress={() => setVisible(true)} style={[styles.button, light ? styles.lightButton : styles.darkButton]}>
        <MaterialCommunityIcons name="translate" size={19} color={light ? '#fff' : '#0f3460'} />
        <Text style={[styles.code, { color: light ? '#fff' : '#0f3460' }]}>{active?.code === 'prs' ? 'دری' : active?.code?.toUpperCase()}</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.menu, isRTL ? { left: 16 } : { right: 16 }]}>
            <Text style={[styles.title, { fontFamily }]}>{t('Language')}</Text>
            {languages.map(item => (
              <Pressable key={item.code} onPress={() => choose(item.code)} style={[styles.option, language === item.code && styles.selected]}>
                <Text style={[styles.native, { fontFamily, writingDirection: item.rtl ? 'rtl' : 'ltr' }]}>{item.nativeLabel}</Text>
                <Text style={[styles.label, { fontFamily }]}>{item.label}</Text>
                {language === item.code && <MaterialCommunityIcons name="check" size={18} color="#0f3460" />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: 58, height: 38, borderRadius: 20, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1 },
  lightButton: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)' },
  darkButton: { backgroundColor: '#fff', borderColor: '#dbe4ec' },
  code: { fontSize: 11, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)' },
  menu: { position: 'absolute', top: 76, width: 220, borderRadius: 18, padding: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  title: { color: '#64748b', fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 7 },
  option: { minHeight: 48, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  selected: { backgroundColor: '#eaf1f7' },
  native: { flex: 1, color: '#102a43', fontSize: 15, fontWeight: '800' },
  label: { color: '#64748b', fontSize: 11 },
});
