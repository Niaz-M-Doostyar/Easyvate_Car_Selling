import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, IconButton, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

const ROLE_COLORS = {
  'Super Admin': '#ef4444', 'Owner': '#3b82f6', 'Manager': '#10b981', 'Accountant': '#f59e0b',
  'Financial': '#8b5cf6', 'Inventory & Sales': '#06b6d4', 'Sales': '#78716c', 'Viewer': '#64748b',
};

export default function UsersScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/auth/users');
      setUsers(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/auth/users/${deleteId}`); setUsers(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const filtered = users.filter(x => {
    const q = search.toLowerCase();
    return !search || [x.username, x.fullName, x.role].filter(Boolean).some(f => f.toLowerCase().includes(q));
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }) => {
    const isSelf = currentUser?.id === item.id;
    const roleColor = ROLE_COLORS[item.role] || '#64748b';
    return (
      <TouchableRipple
        onPress={() => navigation.navigate('UserForm', { user: item })}
        style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
        borderless
      >
        <View style={styles.cardInner}>
          <LinearGradient colors={[roleColor + '25', roleColor + '0a']} style={styles.avatar}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: roleColor }}>{getInitials(item.fullName || item.username)}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.fullName || item.username}</Text>
              {isSelf && (
                <View style={[styles.youBadge, { backgroundColor: c.primary + '15' }]}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: c.primary }}>You</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>@{item.username}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={12} color={roleColor} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: roleColor }}>{item.role || 'Viewer'}</Text>
            </View>
          </View>
          <View style={styles.actionsCol}>
            <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('UserForm', { user: item })} style={styles.actionBtn} />
            {!isSelf && <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />}
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <ScreenWrapper title="Users & Roles" navigation={navigation}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('UserForm')} />}>
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search users..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput} iconColor={c.onSurfaceVariant} />
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No users found" icon="👤" />}
        showsVerticalScrollIndicator={false} />
      <ConfirmDialog visible={!!deleteId} title="Delete User" message="Delete this user account?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  searchbar: { borderRadius: 16, elevation: 0, height: 48, borderWidth: 1 },
  searchInput: { fontSize: 14, marginLeft: -4 },
  list: { padding: 16, paddingTop: 6, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 1, fontWeight: '400' },
  youBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  actionsCol: { marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
