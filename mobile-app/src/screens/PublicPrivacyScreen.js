import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../components/LocalizedPaper';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const sectionKeys = [1, 2, 3, 5, 6, 7];

export default function PublicPrivacyScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const { t, fontFamily, textStyle } = useLanguage();
  const c = paperTheme.colors;

  return (
    <ScreenWrapper title="privacy_title" navigation={navigation} back>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: c.primary + '12' }]}> 
          <MaterialCommunityIcons name="shield-lock-outline" size={44} color={c.primary} />
          <Text style={[styles.updated, { color: c.primary, fontFamily, ...textStyle }]}>{t('privacy_last_updated')}</Text>
        </View>
        <Text style={[styles.intro, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>{t('privacy_intro')}</Text>
        {sectionKeys.map(number => (
          <View key={number} style={[styles.section, { backgroundColor: c.card }]}> 
            <Text style={[styles.title, { color: c.onSurface, fontFamily, ...textStyle }]}>{t(`privacy_section${number}_title`)}</Text>
            <Text style={[styles.body, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>{t(`privacy_section${number}_text`)}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 36 },
  hero: { borderRadius: 18, padding: 18, alignItems: 'center', gap: 10 },
  updated: { fontSize: 13, fontWeight: '700' },
  intro: { fontSize: 15, lineHeight: 24, paddingVertical: 4 },
  section: { borderRadius: 16, padding: 16, gap: 8 },
  title: { fontSize: 17, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 23 },
});
