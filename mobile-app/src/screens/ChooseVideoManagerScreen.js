import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, Modal } from 'react-native';
import { Text, FAB, IconButton, TextInput, Button, Dialog, Portal, ActivityIndicator, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as DocumentPicker from 'expo-document-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';

export default function ChooseVideoManagerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [order, setOrder] = useState('1');
  const [videoAsset, setVideoAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const previewPlayer = useVideoPlayer(previewUrl, (player) => {
    if (previewUrl) player.play();
  });

  useEffect(() => {
    if (previewUrl && previewPlayer) {
      previewPlayer.replace({ uri: previewUrl });
      previewPlayer.play();
    }
  }, [previewUrl]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/choose-video');
      setVideos(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setOrder('1'); setVideoAsset(null); setDialogVisible(true); };
  const openEdit = (item) => { setEditing(item); setOrder(String(item.order || 1)); setVideoAsset(null); setDialogVisible(true); };

  const pickVideo = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'video/*', copyToCacheDirectory: true });
    if (!r.canceled && r.assets?.[0]) setVideoAsset(r.assets[0]);
  };

  const handleSave = async () => {
    if (!editing && !videoAsset) {
      Alert.alert('Validation', 'Please select a video file.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('order', order);
      if (videoAsset) {
        fd.append('video', { uri: videoAsset.uri, name: videoAsset.name || `video-${Date.now()}.mp4`, type: videoAsset.mimeType || 'video/mp4' });
      }
      const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await apiClient.put(`/choose-video/${editing.id}`, fd, opts);
      } else {
        await apiClient.post('/choose-video', fd, opts);
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
      await apiClient.delete(`/choose-video/${deleteId}`);
      setVideos(prev => prev.filter(v => v.id !== deleteId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setDeleteId(null);
  };

  const renderItem = ({ item }) => {
    const filename = item.videoPath ? item.videoPath.split('/').pop() : 'Video';
    const videoUrl = resolveAssetUrl(item.videoPath);
    return (
      <TouchableRipple onPress={() => setPreviewUrl(videoUrl)} style={[styles.card, { backgroundColor: c.card }]} borderless>
        <View style={styles.cardInner}>
          <View style={[styles.videoThumb, { backgroundColor: c.primary + '15' }]}>
            <MaterialCommunityIcons name="play-circle-outline" size={36} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>{filename}</Text>
            <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }}>Order: {item.order}</Text>
            <Text style={{ color: c.primary, fontSize: 11, marginTop: 2, fontWeight: '600' }}>Tap to preview video</Text>
          </View>
          <View>
            <IconButton icon="pencil-outline" size={18} iconColor={c.primary} onPress={() => openEdit(item)} />
            <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <ScreenWrapper title="Choose Video" navigation={navigation}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[c.primary]} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="video-outline" size={48} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12 }}>No videos uploaded yet</Text>
            </View>
          }
        />
      )}

      <FAB icon="plus" label="Add Video" style={[styles.fab, { backgroundColor: c.primary }]} onPress={openAdd} color="#fff" />

      {/* VIDEO PREVIEW MODAL */}
      <Modal visible={!!previewUrl} animationType="slide" onRequestClose={() => setPreviewUrl(null)}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          <IconButton
            icon="close-circle"
            size={32}
            iconColor="#fff"
            style={{ position: 'absolute', top: 48, right: 12, zIndex: 10 }}
            onPress={() => setPreviewUrl(null)}
          />
          {previewUrl && (
            <VideoView
              player={previewPlayer}
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              contentFit="contain"
              nativeControls
              allowsFullscreen
            />
          )}
        </View>
      </Modal>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>{editing ? 'Edit Video' : 'Upload Video'}</Dialog.Title>
          <Dialog.Content>
            <View style={{ gap: 10 }}>
              <TextInput label="Display Order" value={order} onChangeText={setOrder} mode="outlined" keyboardType="numeric" dense />
              <Button mode="outlined" icon="video-plus" onPress={pickVideo}>
                {videoAsset ? videoAsset.name : editing?.videoPath ? 'Change Video' : 'Select Video File *'}
              </Button>
              {!editing && !videoAsset && (
                <Text style={{ color: '#f59e0b', fontSize: 11, marginTop: 2 }}>* Required for new video</Text>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog visible={!!deleteId} title="Delete Video" message="Remove this video?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  videoThumb: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
