import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Chip, Avatar } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

export default function EmployeesScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/employees');
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/employees/${deleteId}`); setEmployees(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const filtered = employees.filter(x => {
    const q = search.toLowerCase();
    return !search || [x.fullName, x.fatherName, x.position, x.phoneNumber].filter(Boolean).some(f => f.toLowerCase().includes(q));
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
      onPress={() => navigation.navigate('EmployeeForm', { employee: item })}>
      <Card.Content style={styles.row}>
        <Avatar.Text size={44} label={getInitials(item.fullName)}
          style={{ backgroundColor: c.primary }} labelStyle={{ fontSize: 16 }} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>{item.fullName}</Text>
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.position || 'Employee'} • {item.phoneNumber}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <StatusChip label={item.status || 'Active'} />
            <Text variant="bodySmall" style={{ color: c.primary, fontWeight: '600' }}>{formatCurrency(item.salary || 0, 'AFN')}/mo</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('EmployeeForm', { employee: item })} />
          <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScreenWrapper title="Employees" navigation={navigation}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('EmployeeForm')} />}>
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search employees..." style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]} inputStyle={{ fontSize: 14 }} />
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No employees found" icon="👷" />} />
      <ConfirmDialog visible={!!deleteId} title="Delete Employee" message="Delete this employee?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
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
