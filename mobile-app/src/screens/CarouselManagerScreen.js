import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Image, Alert, RefreshControl,
} from 'react-native';
import { Text, FAB, IconButton, TextInput, Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';
import { formatCurrency } from '../utils/constants';

const EMPTY_FORM = { title: '', model: '', price: '' };

export default function CarouselManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageAsset, setImageAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/carousel');
      setItems(data.data || data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setImageAsset(null); setDialogVisible(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title || '', model: item.model || '', price: String(item.price || '') });
    setImageAsset(null);
    setDialogVisible(true);
  };

  const pickImage = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.length > 0) setImageAsset(result.assets[0]);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.model.trim() || !form.price) {
      Alert.alert('Validation', 'Title, model and price are required.');
      return;
    }
    if (!editing && !imageAsset) {
      Alert.alert('Validation', 'Please select an image for the carousel slide.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('model', form.model.trim());
      fd.append('price', String(form.price));
      if (imageAsset) {
        fd.append('image', { uri: imageAsset.uri, name: imageAsset.name || `carousel-${Date.now()}.jpg`, type: imageAsset.mimeType || 'image/jpeg' });
      }
      if (editing) {
        await apiClient.put(`/carousel/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await apiClient.post('/carousel', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setDialogVisible(false);
      fetchItems();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/carousel/${deleteId}`);
      setItems(prev => prev.filter(i => i.id !== deleteId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteId(null);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      {item.image ? (
        <Image source={{ uri: resolveAssetUrl(item.image) }} style={styles.cardImg} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImg, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialCommunityIcons name="image-outline" size={32} color={c.onSurfaceVariant} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.title}</Text>
        <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>{item.model}</Text>
        <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13, marginTop: 4 }}>{formatCurrency(item.price)} AFN</Text>
      </View>
      <View style={styles.actions}>
        <IconButton icon="pencil-outline" size={18} iconColor={c.primary} onPress={() => openEdit(item)} />
        <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="Carousel Manager" navigation={navigation}>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchItems} colors={[c.primary]} />}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="image-multiple-outline" size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12 }}>No carousel slides yet</Text>
            </View>
          )
        }
      />

      <FAB icon="plus" label="Add Slide" style={[styles.fab, { backgroundColor: c.primary }]} onPress={openAdd} color="#fff" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>{editing ? 'Edit Slide' : 'New Carousel Slide'}</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <TextInput label="Title *" value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} mode="outlined" dense />
            <TextInput label="Vehicle Model *" value={form.model} onChangeText={v => setForm(p => ({ ...p, model: v }))} mode="outlined" dense />
            <TextInput label="Price (AFN) *" value={form.price} onChangeText={v => setForm(p => ({ ...p, price: v }))} mode="outlined" dense keyboardType="numeric" />
            <Button mode="outlined" icon="image" onPress={pickImage}>
              {imageAsset ? imageAsset.name : 'Select Image'}
            </Button>
            {editing?.image && !imageAsset && (
              <Text style={{ fontSize: 11, color: '#888' }}>Current image will be kept if no new one selected</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Slide"
        message="Are you sure you want to delete this carousel slide?"
        onConfirm={handleDelete}
        onDismiss={() => setDeleteId(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  cardImg: { width: 100, height: 80 },
  cardBody: { flex: 1, padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'column', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
