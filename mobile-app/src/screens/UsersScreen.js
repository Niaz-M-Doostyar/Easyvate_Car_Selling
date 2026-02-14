import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Avatar, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

const ROLE_COLORS = {
  'Super Admin': '#c62828', 'Owner': '#1565c0', 'Manager': '#2e7d32', 'Accountant': '#e65100',
  'Financial': '#6a1b9a', 'Inventory & Sales': '#00838f', 'Sales': '#4e342e', 'Viewer': '#546e7a',
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
    return (
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
        onPress={() => navigation.navigate('UserForm', { user: item })}>
        <Card.Content style={styles.row}>
          <Avatar.Text size={44} label={getInitials(item.fullName || item.username)}
            style={{ backgroundColor: ROLE_COLORS[item.role] || c.primary }} labelStyle={{ fontSize: 16 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>{item.fullName || item.username}</Text>
              {isSelf && <Chip style={{ height: 20 }} textStyle={{ fontSize: 9, lineHeight: 12 }}>You</Chip>}
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>@{item.username}</Text>
            <Chip style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: (ROLE_COLORS[item.role] || '#666') + '20' }}
              textStyle={{ fontSize: 10, fontWeight: '700', color: ROLE_COLORS[item.role] || '#666' }}>
              {item.role || 'Viewer'}
            </Chip>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('UserForm', { user: item })} />
            {!isSelf && <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenWrapper title="Users & Roles" navigation={navigation}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('UserForm')} />}>
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search users..." style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]} inputStyle={{ fontSize: 14 }} />
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No users found" icon="👤" />} />
      <ConfirmDialog visible={!!deleteId} title="Delete User" message="Delete this user account?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchbar: { borderRadius: 12, elevation: 0, height: 44 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
