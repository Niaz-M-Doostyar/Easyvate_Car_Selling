import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Text, IconButton, Menu, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, LEDGER_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function LedgerScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, bRes] = await Promise.all([
        apiClient.get('/ledger/showroom'),
        apiClient.get('/ledger/showroom/balance').catch(() => ({ data: {} })),
      ]);
      const eData = eRes.data;
      setEntries(Array.isArray(eData?.data) ? eData.data : Array.isArray(eData) ? eData : []);
      setBalance(bRes.data);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/ledger/showroom/${deleteId}`); fetch(); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const filtered = entries.filter(x => typeFilter === 'All' || x.type === typeFilter);

  const isCredit = (entry) => {
    const creditTypes = ['Vehicle Sale', 'Capital Investment', 'Loan Received', 'Credit', 'Installment', 'Income'];
    return creditTypes.some(t => (entry.type || '').includes(t)) || Number(entry.amount || entry.credit || 0) > 0;
  };

  const renderItem = ({ item }) => {
    const credit = isCredit(item);
    const amt = Math.abs(Number(item.amount || item.credit || item.debit || 0));
    return (
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
        onPress={() => navigation.navigate('LedgerForm', { entry: item })}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.typeIcon, { backgroundColor: credit ? '#e8f5e9' : '#ffebee' }]}>
            <Text style={{ fontSize: 16 }}>{credit ? '📥' : '📤'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface, flex: 1 }} numberOfLines={1}>{item.type || item.description || 'Entry'}</Text>
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }} numberOfLines={1}>{item.description || item.notes || ''}</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.date || item.createdAt ? new Date(item.date || item.createdAt).toLocaleDateString() : ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '800', color: credit ? '#4caf50' : '#f44336' }}>
              {credit ? '+' : '-'}{formatCurrency(amt)}
            </Text>
          </View>
          <View style={{ marginLeft: -4, flexDirection: 'row' }}>
            <IconButton icon="pencil" size={16} onPress={() => navigation.navigate('LedgerForm', { entry: item })} />
            <IconButton icon="delete" size={16} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const showroomBal = Number(balance?.showroomBalance || balance?.balance || 0);
  const ownerBal = Number(balance?.ownerBalance || 0);

  return (
    <ScreenWrapper title="Showroom Ledger" navigation={navigation}
      actions={<Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
        anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item title="All" onPress={() => { setTypeFilter('All'); setMenuVisible(false); }} />
        {LEDGER_TYPES.map(t => <Menu.Item key={t} title={t} onPress={() => { setTypeFilter(t); setMenuVisible(false); }} />)}
      </Menu>}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('LedgerForm')} />}>

      {/* Balance summary */}
      {balance && (
        <View style={[styles.balanceRow, { paddingHorizontal: 16, paddingTop: 12 }]}>
          <Card style={[styles.balCard, { backgroundColor: '#e3f2fd' }]}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text variant="bodySmall" style={{ color: '#1565c0' }}>Showroom</Text>
              <Text variant="titleSmall" style={{ fontWeight: '800', color: '#1565c0' }}>{formatCurrency(showroomBal)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.balCard, { backgroundColor: '#e8f5e9' }]}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text variant="bodySmall" style={{ color: '#2e7d32' }}>Owner</Text>
              <Text variant="titleSmall" style={{ fontWeight: '800', color: '#2e7d32' }}>{formatCurrency(ownerBal)}</Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingTop: 8 }}><Chip icon="filter" onClose={() => setTypeFilter('All')}>{typeFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No ledger entries" icon="📒" />} />
      <ConfirmDialog visible={!!deleteId} title="Delete Entry" message="Delete this ledger entry?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  balanceRow: { flexDirection: 'row', gap: 8 },
  balCard: { flex: 1, borderRadius: 12, elevation: 0 },
  list: { padding: 16, paddingTop: 8, gap: 8, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  typeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
