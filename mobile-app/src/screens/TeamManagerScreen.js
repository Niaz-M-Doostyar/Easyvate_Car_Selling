import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Image, Alert, RefreshControl,
} from 'react-native';
import { Text, FAB, IconButton, TextInput, Button, Dialog, Portal, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';

const LANGS = [{ label: 'English', value: 'en' }, { label: 'Pashto', value: 'ps' }, { label: 'Dari', value: 'fa' }];
const EMPTY = { name: '', position: '', description: '', facebook: '', instagram: '', x: '' };

export default function TeamManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [lang, setLang] = useState('en');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageAsset, setImageAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic | social

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/team/${lang}`);
      setMembers(data.data || data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImageAsset(null); setActiveTab('basic'); setDialogVisible(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name || '', position: m.position || '', description: m.description || '', facebook: m.facebook || '', instagram: m.instagram || '', x: m.x || '' });
    setImageAsset(null);
    setActiveTab('basic');
    setDialogVisible(true);
  };

  const pickImage = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (!r.canceled && r.assets?.[0]) setImageAsset(r.assets[0]);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.position.trim()) {
      Alert.alert('Validation', 'Name and position are required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imageAsset) fd.append('image', { uri: imageAsset.uri, name: imageAsset.name || `member-${Date.now()}.jpg`, type: imageAsset.mimeType || 'image/jpeg' });

      const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await apiClient.put(`/team/${lang}/${editing.id}`, fd, opts);
      } else {
        await apiClient.post(`/team/${lang}`, fd, opts);
      }
      setDialogVisible(false);
      fetchMembers();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/team/${lang}/${deleteId}`);
      setMembers(prev => prev.filter(m => m.id !== deleteId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteId(null);
  };

  const renderMember = ({ item }) => (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      {item.image ? (
        <Image source={{ uri: resolveAssetUrl(item.image) }} style={styles.avatar} resizeMode="cover" />
      ) : (
        <View style={[styles.avatar, { backgroundColor: c.primary + '15', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: c.primary, fontSize: 22, fontWeight: '800' }}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.name}</Text>
        <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>{item.position}</Text>
        {item.description ? <Text style={{ color: c.onSurfaceVariant, fontSize: 11, marginTop: 4 }} numberOfLines={2}>{item.description}</Text> : null}
      </View>
      <View>
        <IconButton icon="pencil-outline" size={18} iconColor={c.primary} onPress={() => openEdit(item)} />
        <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="Team Manager" navigation={navigation}>
      {/* Lang selector */}
      <View style={[styles.langBar, { backgroundColor: c.surface }]}>
        {LANGS.map(l => (
          <Chip key={l.value} selected={lang === l.value} onPress={() => setLang(l.value)}
            style={[styles.chip, lang === l.value && { backgroundColor: c.primary }]}
            textStyle={{ color: lang === l.value ? '#fff' : c.onSurface, fontSize: 12 }}
          >{l.label}</Chip>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={i => String(i.id)}
          renderItem={renderMember}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMembers} colors={[c.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12 }}>No team members for {lang.toUpperCase()}</Text>
            </View>
          }
        />
      )}

      <FAB icon="plus" label="Add Member" style={[styles.fab, { backgroundColor: c.primary }]} onPress={openAdd} color="#fff" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 16, maxHeight: '80%' }}>
          <Dialog.Title>{editing ? 'Edit Member' : 'New Team Member'}</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={{ gap: 8, paddingVertical: 8 }}>
              {/* Tab selector */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button compact mode={activeTab === 'basic' ? 'contained' : 'outlined'} onPress={() => setActiveTab('basic')}>Basic</Button>
                <Button compact mode={activeTab === 'social' ? 'contained' : 'outlined'} onPress={() => setActiveTab('social')}>Social</Button>
              </View>
              {activeTab === 'basic' ? (
                <>
                  <TextInput label="Name *" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} mode="outlined" dense />
                  <TextInput label="Position *" value={form.position} onChangeText={v => setForm(p => ({ ...p, position: v }))} mode="outlined" dense />
                  <TextInput label="Description" value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} mode="outlined" multiline numberOfLines={3} dense />
                  <Button mode="outlined" icon="image" onPress={pickImage}>
                    {imageAsset ? imageAsset.name : editing?.image ? 'Change Photo' : 'Select Photo'}
                  </Button>
                </>
              ) : (
                <>
                  <TextInput label="Facebook URL" value={form.facebook} onChangeText={v => setForm(p => ({ ...p, facebook: v }))} mode="outlined" dense />
                  <TextInput label="Instagram URL" value={form.instagram} onChangeText={v => setForm(p => ({ ...p, instagram: v }))} mode="outlined" dense />
                  <TextInput label="Twitter/X URL" value={form.x} onChangeText={v => setForm(p => ({ ...p, x: v }))} mode="outlined" dense />
                </>
              )}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog visible={!!deleteId} title="Delete Member" message="Remove this team member?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  langBar: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 8 },
  chip: { borderRadius: 20 },
  card: { flexDirection: 'row', borderRadius: 14, padding: 12, gap: 12, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
