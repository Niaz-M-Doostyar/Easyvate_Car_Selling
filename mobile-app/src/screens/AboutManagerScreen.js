import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Image, Alert, RefreshControl,
} from 'react-native';
import { Text, TextInput, Button, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';

const LANGS = [{ label: 'English', value: 'en' }, { label: 'Pashto', value: 'ps' }, { label: 'Dari', value: 'fa' }];

export default function AboutManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [lang, setLang] = useState('en');
  const [about, setAbout] = useState(null);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLogoId, setDeleteLogoId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/about/${lang}`);
      const abt = data.data || data || null;
      setAbout(abt);
      setLogos(data.logos || []);
      if (abt) setForm({ title: abt.title || '', subtitle: abt.subtitle || '', description: abt.description || '' });
      else setForm({ title: '', subtitle: '', description: '' });
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      if (about?.id) {
        await apiClient.put(`/about/${lang}/${about.id}`, form);
      } else {
        await apiClient.post(`/about/${lang}`, form);
      }
      Alert.alert('Saved', 'About content saved successfully.');
      fetch();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadLogos = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', multiple: true, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const fd = new FormData();
    result.assets.forEach(a => {
      fd.append('logos', { uri: a.uri, name: a.name || `logo-${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' });
    });
    try {
      await apiClient.post(`/about/${lang}/logos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetch();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  };

  const deleteLogo = async () => {
    try {
      await apiClient.delete(`/about/${lang}/logos/${deleteLogoId}`);
      setLogos(prev => prev.filter(l => l.id !== deleteLogoId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteLogoId(null);
  };

  return (
    <ScreenWrapper title="About Manager" navigation={navigation}>
      <ScrollView contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
      >
        {/* Language picker */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Language</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {LANGS.map(l => (
              <Chip key={l.value} selected={lang === l.value}
                onPress={() => setLang(l.value)}
                style={[styles.chip, lang === l.value && { backgroundColor: c.primary }]}
                textStyle={{ color: lang === l.value ? '#fff' : c.onSurface }}
              >{l.label}</Chip>
            ))}
          </View>
        </View>

        {loading ? <ActivityIndicator style={{ margin: 20 }} color={c.primary} /> : (
          <>
            <View style={[styles.section, { backgroundColor: c.card }]}>
              <Text style={[styles.sectionTitle, { color: c.onSurface }]}>About Content</Text>
              <TextInput label="Title" value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} mode="outlined" style={{ marginBottom: 10 }} />
              <TextInput label="Subtitle" value={form.subtitle} onChangeText={v => setForm(p => ({ ...p, subtitle: v }))} mode="outlined" style={{ marginBottom: 10 }} />
              <TextInput label="Description" value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} mode="outlined" multiline numberOfLines={5} style={{ marginBottom: 14 }} />
              <Button mode="contained" onPress={save} loading={saving} disabled={saving}>Save Content</Button>
            </View>

            <View style={[styles.section, { backgroundColor: c.card }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Brand Logos</Text>
                <Button mode="outlined" compact icon="upload" onPress={uploadLogos}>Upload</Button>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {logos.map(logo => (
                  <View key={logo.id} style={styles.logoItem}>
                    <Image source={{ uri: resolveAssetUrl(logo.path) }} style={styles.logoImg} resizeMode="contain" />
                    <IconButton icon="close-circle" size={18} iconColor={c.error} style={styles.logoDelete} onPress={() => setDeleteLogoId(logo.id)} />
                  </View>
                ))}
                {logos.length === 0 && <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }}>No logos uploaded yet</Text>}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteLogoId}
        title="Delete Logo"
        message="Remove this brand logo?"
        onConfirm={deleteLogo}
        onDismiss={() => setDeleteLogoId(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 14, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  chip: { borderRadius: 20 },
  logoItem: { position: 'relative', width: 72, height: 72, borderRadius: 10, backgroundColor: '#f0f0f0' },
  logoImg: { width: '100%', height: '100%', borderRadius: 10 },
  logoDelete: { position: 'absolute', top: -6, right: -6, margin: 0 },
});
