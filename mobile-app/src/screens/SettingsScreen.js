import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text, Switch, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAppTheme, ACCENT_PRESETS } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function SettingsScreen({ navigation }) {
  const { paperTheme, isDark, setIsDark, accentKey, setAccentKey } = useAppTheme();
  const { user, logout } = useAuth();
  const c = paperTheme.colors;
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Owner';

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await apiClient.get('/settings/backup', { responseType: 'text' });
      const filename = `backup-${new Date().toISOString().slice(0, 10)}.sql`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, response.data, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Save Database Backup' });
      } else {
        Alert.alert('Backup Saved', `File saved to app documents.`);
      }
    } catch (e) {
      Alert.alert('Backup Failed', e.response?.data?.error || e.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert('Restore Database', 'This will overwrite the current database. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore', style: 'destructive', onPress: async () => {
          const r = await DocumentPicker.getDocumentAsync({ type: ['application/sql', 'text/plain', '*/*'], copyToCacheDirectory: true });
          if (r.canceled || !r.assets?.[0]) return;
          setRestoreLoading(true);
          try {
            const asset = r.assets[0];
            const fd = new FormData();
            fd.append('backup', { uri: asset.uri, name: asset.name || 'restore.sql', type: asset.mimeType || 'application/octet-stream' });
            await apiClient.post('/settings/restore', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('Success', 'Database restored successfully.');
          } catch (e) {
            Alert.alert('Restore Failed', e.response?.data?.error || e.message);
          } finally {
            setRestoreLoading(false);
          }
        },
      },
    ]);
  };

  const initials = (user?.fullName || user?.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const InfoRow = ({ icon, label, value, last }) => (
    <View>
      <View style={styles.infoRow}>
        <LinearGradient colors={[c.primary + '18', c.primary + '06']} style={styles.infoIcon}>
          <MaterialCommunityIcons name={icon} size={18} color={c.primary} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.onSurfaceVariant, fontWeight: '500' }}>{label}</Text>
          <Text style={{ fontSize: 14, color: c.onSurface, fontWeight: '600', marginTop: 1 }}>{value}</Text>
        </View>
      </View>
      {!last && <View style={[styles.divider, { backgroundColor: c.border }]} />}
    </View>
  );

  return (
    <ScreenWrapper title="Settings" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Header */}
        <LinearGradient colors={[c.primary, c.primary + 'cc']} style={[styles.headerCard, paperTheme.shadows?.md]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={{ fontSize: 22, color: c.primary, fontWeight: '800' }}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.headerName}>{user?.fullName || user?.username}</Text>
          <View style={styles.rolePill}>
            <MaterialCommunityIcons name="shield-check-outline" size={12} color="#fff" />
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{user?.role || 'User'}</Text>
          </View>
        </LinearGradient>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Appearance</Text>

          <View style={styles.toggleRow}>
            <LinearGradient colors={[c.primary + '18', c.primary + '06']} style={styles.toggleIcon}>
              <MaterialCommunityIcons name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'} size={20} color={c.primary} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.onSurface }}>Dark Mode</Text>
              <Text style={{ fontSize: 12, color: c.onSurfaceVariant, marginTop: 1 }}>Switch between light and dark</Text>
            </View>
            <Switch value={isDark} onValueChange={setIsDark} trackColor={{ false: c.border, true: c.primary + '60' }} thumbColor={isDark ? c.primary : '#f4f4f5'} />
          </View>

          <View style={[styles.divider, { backgroundColor: c.border, marginVertical: 14 }]} />

          <Text style={{ fontSize: 15, fontWeight: '600', color: c.onSurface, marginBottom: 10 }}>Accent Color</Text>
          <View style={styles.colorRow}>
            {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
              <Pressable key={key} style={{ alignItems: 'center' }} onPress={() => setAccentKey(key)}>
                <View style={[styles.colorDot, { backgroundColor: preset.primary }, accentKey === key && styles.colorSelected]}>
                  {accentKey === key && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                </View>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 9, marginTop: 4, fontWeight: accentKey === key ? '700' : '500' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>About</Text>
          <InfoRow icon="car-sports" label="App Name" value="Niazi Khpalwak Motor Puranchi" />
          <InfoRow icon="information-outline" label="Version" value="1.0.0" />
          <InfoRow icon="cellphone" label="Platform" value="React Native (Expo)" />
          <InfoRow icon="account-outline" label="Developer" value="Niaz Mohammad Doostyar" last />
        </View>

        {/* Database (Super Admin / Owner only) */}
        {isSuperAdmin && (
          <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Database</Text>
            <TouchableRipple onPress={handleBackup} disabled={backupLoading} borderless style={[styles.dbRow, { backgroundColor: c.primary + '10' }]}>
              <View style={styles.dbRowInner}>
                <LinearGradient colors={[c.primary + '22', c.primary + '08']} style={styles.dbIcon}>
                  {backupLoading ? <ActivityIndicator size="small" color={c.primary} /> : <MaterialCommunityIcons name="database-export-outline" size={20} color={c.primary} />}
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.onSurface }}>Create Backup</Text>
                  <Text style={{ fontSize: 11, color: c.onSurfaceVariant, marginTop: 1 }}>Export database as SQL file</Text>
                </View>
              </View>
            </TouchableRipple>
            <View style={[styles.divder, { backgroundColor: c.border, height: 1, marginVertical: 8 }]} />
            <TouchableRipple onPress={handleRestore} disabled={restoreLoading} borderless style={[styles.dbRow, { backgroundColor: c.error + '08' }]}>
              <View style={styles.dbRowInner}>
                <LinearGradient colors={[c.error + '22', c.error + '08']} style={styles.dbIcon}>
                  {restoreLoading ? <ActivityIndicator size="small" color={c.error} /> : <MaterialCommunityIcons name="database-import-outline" size={20} color={c.error} />}
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.onSurface }}>Restore Database</Text>
                  <Text style={{ fontSize: 11, color: c.onSurfaceVariant, marginTop: 1 }}>Import from SQL backup file</Text>
                </View>
              </View>
            </TouchableRipple>
          </View>
        )}

        {/* Logout */}
        <TouchableRipple onPress={logout} borderless style={[styles.logoutBtn, { backgroundColor: c.error + '10' }, paperTheme.shadows?.sm]}>
          <View style={styles.logoutInner}>
            <LinearGradient colors={[c.error + '25', c.error + '08']} style={styles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={20} color={c.error} />
            </LinearGradient>
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.error }}>Sign Out</Text>
          </View>
        </TouchableRipple>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  headerCard: { borderRadius: 20, padding: 28, alignItems: 'center' },
  avatarRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 12, letterSpacing: -0.3 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  section: { borderRadius: 16, padding: 18, overflow: 'hidden' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { borderRadius: 16, overflow: 'hidden' },
  logoutInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10 },
  logoutIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dbRow: { borderRadius: 12, overflow: 'hidden' },
  dbRowInner: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  dbIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  divder: {},
});
