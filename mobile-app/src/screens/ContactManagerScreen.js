import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, ScrollView } from 'react-native';
import { Text, FAB, IconButton, TextInput, Button, Dialog, Portal, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';

const LANGS = [{ label: 'English', value: 'en' }, { label: 'Pashto', value: 'ps' }, { label: 'Dari', value: 'fa' }];
const EMPTY = { branchName: '', email: '', phone: '', address: '', weekdays: '', friday: '', facebook: '', instagram: '', x: '', youtube: '' };

export default function ContactManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [lang, setLang] = useState('en');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/contact/${lang}`);
      setContacts(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setActiveTab('info'); setDialogVisible(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      branchName: item.branchName || '', email: item.email || '', phone: item.phone || '',
      address: item.address || '', weekdays: item.weekdays || '', friday: item.friday || '',
      facebook: item.facebook || '', instagram: item.instagram || '', x: item.x || '', youtube: item.youtube || '',
    });
    setActiveTab('info');
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!form.phone.trim() && !form.email.trim()) {
      Alert.alert('Validation', 'At least phone or email is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await apiClient.put(`/contact/${lang}/${editing.id}`, payload);
      } else {
        await apiClient.post(`/contact/${lang}`, payload);
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
      await apiClient.delete(`/contact/${lang}/${deleteId}`);
      setContacts(prev => prev.filter(t => t.id !== deleteId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteId(null);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={{ flex: 1 }}>
        {item.branchName ? <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.branchName}</Text> : null}
        {item.phone ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone-outline" size={14} color={c.primary} />
            <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginLeft: 4 }}>{item.phone}</Text>
          </View>
        ) : null}
        {item.email ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={14} color={c.primary} />
            <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginLeft: 4 }}>{item.email}</Text>
          </View>
        ) : null}
        {item.address ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={c.primary} />
            <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginLeft: 4 }} numberOfLines={1}>{item.address}</Text>
          </View>
        ) : null}
      </View>
      <View>
        <IconButton icon="pencil-outline" size={18} iconColor={c.primary} onPress={() => openEdit(item)} />
        <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="Contact Manager" navigation={navigation}>
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
          data={contacts}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[c.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="phone-settings-outline" size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12 }}>No contact entries for {lang.toUpperCase()}</Text>
            </View>
          }
        />
      )}

      <FAB icon="plus" label="Add Branch" style={[styles.fab, { backgroundColor: c.primary }]} onPress={openAdd} color="#fff" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 16, maxHeight: '85%' }}>
          <Dialog.Title>{editing ? 'Edit Contact' : 'New Contact'}</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={{ gap: 4, paddingVertical: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Button compact mode={activeTab === 'info' ? 'contained' : 'outlined'} onPress={() => setActiveTab('info')}>Info</Button>
                <Button compact mode={activeTab === 'hours' ? 'contained' : 'outlined'} onPress={() => setActiveTab('hours')}>Hours</Button>
                <Button compact mode={activeTab === 'social' ? 'contained' : 'outlined'} onPress={() => setActiveTab('social')}>Social</Button>
              </View>
              {activeTab === 'info' && (
                <>
                  <TextInput label="Branch Name" value={form.branchName} onChangeText={v => setForm(p => ({ ...p, branchName: v }))} mode="outlined" dense />
                  <TextInput label="Phone" value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} mode="outlined" keyboardType="phone-pad" dense />
                  <TextInput label="Email" value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} mode="outlined" keyboardType="email-address" dense />
                  <TextInput label="Address" value={form.address} onChangeText={v => setForm(p => ({ ...p, address: v }))} mode="outlined" multiline numberOfLines={2} dense />
                </>
              )}
              {activeTab === 'hours' && (
                <>
                  <TextInput label="Weekdays Hours (e.g. 9am - 6pm)" value={form.weekdays} onChangeText={v => setForm(p => ({ ...p, weekdays: v }))} mode="outlined" dense />
                  <TextInput label="Friday Hours (e.g. 2pm - 6pm)" value={form.friday} onChangeText={v => setForm(p => ({ ...p, friday: v }))} mode="outlined" dense />
                </>
              )}
              {activeTab === 'social' && (
                <>
                  <TextInput label="Facebook URL" value={form.facebook} onChangeText={v => setForm(p => ({ ...p, facebook: v }))} mode="outlined" dense />
                  <TextInput label="Instagram URL" value={form.instagram} onChangeText={v => setForm(p => ({ ...p, instagram: v }))} mode="outlined" dense />
                  <TextInput label="Twitter/X URL" value={form.x} onChangeText={v => setForm(p => ({ ...p, x: v }))} mode="outlined" dense />
                  <TextInput label="YouTube URL" value={form.youtube} onChangeText={v => setForm(p => ({ ...p, youtube: v }))} mode="outlined" dense />
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

      <ConfirmDialog visible={!!deleteId} title="Delete Contact" message="Remove this contact entry?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  langBar: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 8 },
  chip: { borderRadius: 20 },
  card: { flexDirection: 'row', borderRadius: 14, padding: 12, gap: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
