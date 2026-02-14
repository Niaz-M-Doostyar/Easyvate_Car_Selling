import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Menu, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, CUSTOMER_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function CustomersScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/customers');
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/customers/${deleteId}`); setCustomers(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const filtered = customers.filter(x => {
    const q = search.toLowerCase();
    const m = !search || [x.fullName, x.fatherName, x.phoneNumber, x.nationalIdNumber, x.province, x.district].filter(Boolean).some(f => f.toLowerCase().includes(q));
    return m && (typeFilter === 'All' || x.customerType === typeFilter);
  });

  const renderItem = ({ item }) => {
    const bal = Number(item.balance || 0);
    return (
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated" onPress={() => navigation.navigate('CustomerDetail', { customer: item })}>
        <Card.Content style={styles.row}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, flex: 1 }} numberOfLines={1}>{item.fullName}</Text>
              <StatusChip label={item.customerType || 'Buyer'} />
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>{item.fatherName} • {item.phoneNumber}</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.province}, {item.district}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: bal >= 0 ? c.success : c.error }}>{formatCurrency(Math.abs(bal))}</Text>
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="eye" size={18} onPress={() => navigation.navigate('CustomerDetail', { customer: item })} />
              <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('CustomerForm', { customer: item })} />
              <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenWrapper title="Customers" navigation={navigation}
      actions={<Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item title="All" onPress={() => { setTypeFilter('All'); setMenuVisible(false); }} />
        {CUSTOMER_TYPES.map(t => <Menu.Item key={t} title={t} onPress={() => { setTypeFilter(t); setMenuVisible(false); }} />)}
      </Menu>}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('CustomerForm')} />}
    >
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search customers..." style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]} inputStyle={{ fontSize: 14 }} />
      </View>
      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingBottom: 8 }}><Chip icon="filter" onClose={() => setTypeFilter('All')}>{typeFilter}</Chip></View>}
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No customers found" icon="👤" />} />
      <ConfirmDialog visible={!!deleteId} title="Delete Customer" message="Delete this customer and all related records?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchbar: { borderRadius: 12, elevation: 0, height: 44 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
