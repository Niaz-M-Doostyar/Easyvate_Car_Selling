import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, IconButton, Menu, Chip, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      setCustomers(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
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
    const balColor = bal >= 0 ? c.success : c.error;
    return (
      <TouchableRipple
        onPress={() => navigation.navigate('CustomerDetail', { customer: item })}
        style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
        borderless
      >
        <View style={styles.cardInner}>
          <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.cardIcon}>
            <MaterialCommunityIcons name="account-outline" size={22} color={c.primary} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>{item.fullName}</Text>
              <StatusChip label={item.customerType || 'Buyer'} />
            </View>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.fatherName} • {item.phoneNumber}</Text>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.province}, {item.district}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <View style={[styles.balBadge, { backgroundColor: balColor + '12' }]}>
                <MaterialCommunityIcons name={bal >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'} size={13} color={balColor} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: balColor }}>{formatCurrency(Math.abs(bal))}</Text>
              </View>
              <View style={styles.actionsRow}>
                <IconButton icon="eye-outline" size={18} iconColor={c.primary} onPress={() => navigation.navigate('CustomerDetail', { customer: item })} style={styles.actionBtn} />
                <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('CustomerForm', { customer: item })} style={styles.actionBtn} />
                <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
              </View>
            </View>
          </View>
        </View>
      </TouchableRipple>
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
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search customers..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput} iconColor={c.onSurfaceVariant} />
      </View>
      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingBottom: 6 }}><Chip icon="filter" onClose={() => setTypeFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{typeFilter}</Chip></View>}
      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No customers found" icon="👤" />}
        showsVerticalScrollIndicator={false} />
      <ConfirmDialog visible={!!deleteId} title="Delete Customer" message="Delete this customer and all related records?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  searchbar: { borderRadius: 16, elevation: 0, height: 48, borderWidth: 1 },
  searchInput: { fontSize: 14, marginLeft: -4 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 6, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  balBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  actionsRow: { flexDirection: 'row', marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
