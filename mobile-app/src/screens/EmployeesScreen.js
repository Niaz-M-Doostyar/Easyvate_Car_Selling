import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, IconButton, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      setEmployees(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
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
    <TouchableRipple
      onPress={() => navigation.navigate('EmployeeForm', { employee: item })}
      style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
      borderless
    >
      <View style={styles.cardInner}>
        <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.avatar}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.primary }}>{getInitials(item.fullName)}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.fullName}</Text>
          <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.position || 'Employee'} • {item.phoneNumber}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <StatusChip label={item.status || 'Active'} />
            <View style={[styles.salaryBadge, { backgroundColor: c.primary + '12' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: c.primary }}>{formatCurrency(item.salary || 0, 'AFN')}/mo</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionsCol}>
          <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('EmployeeForm', { employee: item })} style={styles.actionBtn} />
          <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
        </View>
      </View>
    </TouchableRipple>
  );

  return (
    <ScreenWrapper title="Employees" navigation={navigation}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('EmployeeForm')} />}>
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search employees..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput} iconColor={c.onSurfaceVariant} />
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No employees found" icon="👷" />}
        showsVerticalScrollIndicator={false} />
      <ConfirmDialog visible={!!deleteId} title="Delete Employee" message="Delete this employee?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
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
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  salaryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  actionsCol: { marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
