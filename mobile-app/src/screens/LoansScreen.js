import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Menu, Chip, Button, Portal, Dialog } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, LOAN_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function LoansScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [statusMenuVis, setStatusMenuVis] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [payId, setPayId] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/loans');
      setLoans(Array.isArray(data) ? data : data.loans || []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/loans/${deleteId}`); setLoans(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const handleMarkPaid = async () => {
    setPaying(true);
    try {
      await apiClient.put(`/loans/${payId}/pay`);
      setPayId(null); fetch();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setPaying(false);
  };

  const filtered = loans.filter(x => {
    const q = search.toLowerCase();
    const m = !search || [x.personName, x.description, x.loanType].filter(Boolean).some(f => f.toLowerCase().includes(q));
    return m && (typeFilter === 'All' || x.loanType === typeFilter) && (statusFilter === 'All' || x.status === statusFilter);
  });

  const totalActive = loans.filter(l => l.status !== 'Paid').reduce((s, l) => s + Number(l.amount || 0), 0);

  const renderItem = ({ item }) => {
    const isPaid = item.status === 'Paid';
    return (
      <Card style={[styles.card, { backgroundColor: c.surface, opacity: isPaid ? 0.7 : 1 }]} mode="elevated"
        onPress={() => navigation.navigate('LoanForm', { loan: item })}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }} numberOfLines={1}>{item.personName || 'Unknown'}</Text>
                <StatusChip label={item.loanType || 'Loan'} />
              </View>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }} numberOfLines={1}>{item.description || 'No description'}</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '800', color: isPaid ? '#4caf50' : '#f44336' }}>{formatCurrency(item.amount || 0)}</Text>
              <StatusChip label={item.status || 'Active'} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: -4 }}>
            {!isPaid && <IconButton icon="cash-check" size={18} iconColor="#4caf50" onPress={() => setPayId(item.id)} />}
            <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('LoanForm', { loan: item })} />
            <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenWrapper title="Loans & Debts" navigation={navigation}
      actions={
        <View style={{ flexDirection: 'row' }}>
          <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
            anchor={<IconButton icon="tag-outline" onPress={() => setMenuVisible(true)} />}>
            <Menu.Item title="All Types" onPress={() => { setTypeFilter('All'); setMenuVisible(false); }} />
            {LOAN_TYPES.map(t => <Menu.Item key={t} title={t} onPress={() => { setTypeFilter(t); setMenuVisible(false); }} />)}
          </Menu>
          <Menu visible={statusMenuVis} onDismiss={() => setStatusMenuVis(false)}
            anchor={<IconButton icon="filter-variant" onPress={() => setStatusMenuVis(true)} />}>
            <Menu.Item title="All Status" onPress={() => { setStatusFilter('All'); setStatusMenuVis(false); }} />
            {['Active', 'Paid', 'Overdue'].map(s => <Menu.Item key={s} title={s} onPress={() => { setStatusFilter(s); setStatusMenuVis(false); }} />)}
          </Menu>
        </View>
      }
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('LoanForm')} />}>

      {/* Total active */}
      <Card style={[styles.totalCard, { backgroundColor: '#ffebee', marginHorizontal: 16, marginTop: 12 }]}>
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
          <Text variant="bodyMedium" style={{ color: '#c62828', fontWeight: '600' }}>Active Loans Total</Text>
          <Text variant="titleMedium" style={{ fontWeight: '800', color: '#c62828' }}>{formatCurrency(totalActive)}</Text>
        </Card.Content>
      </Card>

      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search loans..." style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]} inputStyle={{ fontSize: 14 }} />
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 4, flexWrap: 'wrap' }}>
        {typeFilter !== 'All' && <Chip icon="tag" onClose={() => setTypeFilter('All')}>{typeFilter}</Chip>}
        {statusFilter !== 'All' && <Chip icon="filter" onClose={() => setStatusFilter('All')}>{statusFilter}</Chip>}
      </View>

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No loans found" icon="💳" />} />

      <ConfirmDialog visible={!!deleteId} title="Delete Loan" message="Delete this loan record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      <Portal>
        <Dialog visible={!!payId} onDismiss={() => setPayId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Mark as Paid</Dialog.Title>
          <Dialog.Content><Text>Mark this loan as fully paid?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPayId(null)}>Cancel</Button>
            <Button mode="contained" onPress={handleMarkPaid} loading={paying}>Mark Paid</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  searchbar: { borderRadius: 12, elevation: 0, height: 44 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  totalCard: { borderRadius: 12, elevation: 0 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
