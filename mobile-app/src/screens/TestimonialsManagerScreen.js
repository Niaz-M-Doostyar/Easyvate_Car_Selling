import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { Text, FAB, IconButton, TextInput, Button, Dialog, Portal, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';

const LANGS = [{ label: 'English', value: 'en' }, { label: 'Pashto', value: 'ps' }, { label: 'Dari', value: 'fa' }];
const EMPTY = { name: '', year: '', rating: '5', title: '', message: '' };
const RATINGS = [1, 2, 3, 4, 5];

export default function TestimonialsManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [lang, setLang] = useState('en');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/testimonial/${lang}`);
      setTestimonials(data.data || data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialogVisible(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name || '', year: String(t.year || new Date().getFullYear()), rating: String(t.rating || 5), title: t.title || '', message: t.message || '' });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      Alert.alert('Validation', 'Name and message are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, rating: parseInt(form.rating, 10), year: parseInt(form.year || new Date().getFullYear(), 10) };
      if (editing) {
        await apiClient.put(`/testimonial/${lang}/${editing.id}`, payload);
      } else {
        await apiClient.post(`/testimonial/${lang}`, payload);
      }
      setDialogVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/testimonial/${lang}/${deleteId}`);
      setTestimonials(prev => prev.filter(t => t.id !== deleteId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteId(null);
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <MaterialCommunityIcons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color="#f5a623" />
  ));

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.name}</Text>
          <Text style={{ color: '#999', fontSize: 11 }}>• {item.year}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>{renderStars(item.rating || 5)}</View>
        {item.title ? <Text style={{ color: c.primary, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>{item.title}</Text> : null}
        <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }} numberOfLines={2}>{item.message}</Text>
      </View>
      <View>
        <IconButton icon="pencil-outline" size={18} iconColor={c.primary} onPress={() => openEdit(item)} />
        <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="Testimonials" navigation={navigation}>
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
          data={testimonials}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[c.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="star-outline" size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12 }}>No testimonials for {lang.toUpperCase()}</Text>
            </View>
          }
        />
      )}

      <FAB icon="plus" label="Add" style={[styles.fab, { backgroundColor: c.primary }]} onPress={openAdd} color="#fff" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 16, maxHeight: '80%' }}>
          <Dialog.Title>{editing ? 'Edit Testimonial' : 'New Testimonial'}</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={{ gap: 8, paddingVertical: 8 }}>
              <TextInput label="Customer Name *" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} mode="outlined" dense />
              <TextInput label="Year" value={String(form.year)} onChangeText={v => setForm(p => ({ ...p, year: v }))} mode="outlined" keyboardType="numeric" dense />
              <Text style={{ color: c.onSurface, marginTop: 4, marginBottom: 2, fontSize: 13 }}>Rating</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {RATINGS.map(r => (
                  <Chip key={r} selected={String(r) === String(form.rating)} onPress={() => setForm(p => ({ ...p, rating: String(r) }))}
                    style={String(r) === String(form.rating) ? { backgroundColor: '#f5a623' } : {}}
                    textStyle={{ color: String(r) === String(form.rating) ? '#fff' : c.onSurface }}
                  >{r}★</Chip>
                ))}
              </View>
              <TextInput label="Title" value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} mode="outlined" dense />
              <TextInput label="Message *" value={form.message} onChangeText={v => setForm(p => ({ ...p, message: v }))} mode="outlined" multiline numberOfLines={3} dense />
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog visible={!!deleteId} title="Delete Testimonial" message="Remove this testimonial?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  langBar: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 8 },
  chip: { borderRadius: 20 },
  card: { flexDirection: 'row', borderRadius: 14, padding: 12, gap: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
