import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, IconButton, Menu, Chip, Button, Portal, Dialog, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      setLoans(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
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
      <TouchableRipple
        onPress={() => navigation.navigate('LoanForm', { loan: item })}
        style={[styles.card, { backgroundColor: c.card, opacity: isPaid ? 0.7 : 1 }, paperTheme.shadows?.sm]}
        borderless
      >
        <View style={styles.cardInner}>
          <LinearGradient
            colors={isPaid ? [c.success + '20', c.success + '08'] : [c.error + '20', c.error + '08']}
            style={styles.cardIcon}
          >
            <MaterialCommunityIcons name={isPaid ? 'check-circle-outline' : 'cash-clock'} size={22} color={isPaid ? c.success : c.error} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>{item.personName || 'Unknown'}</Text>
              <StatusChip label={item.loanType || 'Loan'} />
            </View>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]} numberOfLines={1}>{item.description || 'No description'}</Text>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: isPaid ? c.success : c.error }}>{formatCurrency(item.amount || 0)}</Text>
              <StatusChip label={item.status || 'Active'} />
            </View>
            <View style={styles.actionsRow}>
              {!isPaid && <IconButton icon="cash-check" size={18} iconColor={c.success} onPress={() => setPayId(item.id)} style={styles.actionBtn} />}
              <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('LoanForm', { loan: item })} style={styles.actionBtn} />
              <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
            </View>
          </View>
        </View>
      </TouchableRipple>
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
      <View style={[styles.totalCard, { backgroundColor: c.error + '10' }, paperTheme.shadows?.sm]}>
        <View style={styles.totalInner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LinearGradient colors={[c.error + '20', c.error + '08']} style={styles.totalIcon}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={c.error} />
            </LinearGradient>
            <Text style={{ color: c.error, fontWeight: '600', fontSize: 13 }}>Active Loans Total</Text>
          </View>
          <Text style={{ fontWeight: '800', color: c.error, fontSize: 17 }}>{formatCurrency(totalActive)}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search loans..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput} iconColor={c.onSurfaceVariant} />
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 4, flexWrap: 'wrap' }}>
        {typeFilter !== 'All' && <Chip icon="tag" onClose={() => setTypeFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{typeFilter}</Chip>}
        {statusFilter !== 'All' && <Chip icon="filter" onClose={() => setStatusFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{statusFilter}</Chip>}
      </View>

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No loans found" icon="💳" />}
        showsVerticalScrollIndicator={false} />

      <ConfirmDialog visible={!!deleteId} title="Delete Loan" message="Delete this loan record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      <Portal>
        <Dialog visible={!!payId} onDismiss={() => setPayId(null)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Mark as Paid</Dialog.Title>
          <Dialog.Content><Text style={{ color: c.onSurfaceVariant }}>Mark this loan as fully paid?</Text></Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setPayId(null)} style={styles.dialogBtn}>Cancel</Button>
            <Button mode="contained" onPress={handleMarkPaid} loading={paying} style={styles.dialogBtn}>Mark Paid</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2, marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  totalCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  totalInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  totalIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dialog: { borderRadius: 24 },
  dialogTitle: { fontWeight: '700', fontSize: 18 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  dialogBtn: { borderRadius: 14 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
