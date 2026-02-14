import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, IconButton, Menu, Chip, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
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
    const iconColor = credit ? c.success : c.error;
    return (
      <TouchableRipple
        onPress={() => navigation.navigate('LedgerForm', { entry: item })}
        style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
        borderless
      >
        <View style={styles.cardInner}>
          <LinearGradient colors={[iconColor + '20', iconColor + '08']} style={styles.cardIcon}>
            <MaterialCommunityIcons name={credit ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'} size={22} color={iconColor} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>{item.type || item.description || 'Entry'}</Text>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]} numberOfLines={1}>{item.description || item.notes || ''}</Text>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.date || item.createdAt ? new Date(item.date || item.createdAt).toLocaleDateString() : ''}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: iconColor }}>
              {credit ? '+' : '-'}{formatCurrency(amt)}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="pencil-outline" size={16} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('LedgerForm', { entry: item })} style={styles.actionBtn} />
              <IconButton icon="trash-can-outline" size={16} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
            </View>
          </View>
        </View>
      </TouchableRipple>
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
          <View style={[styles.balCard, { backgroundColor: c.info + '10' }, paperTheme.shadows?.sm]}>
            <LinearGradient colors={[c.info + '20', c.info + '08']} style={styles.balIcon}>
              <MaterialCommunityIcons name="store-outline" size={18} color={c.info} />
            </LinearGradient>
            <Text style={{ color: c.info, fontSize: 11, fontWeight: '600', marginTop: 6 }}>Showroom</Text>
            <Text style={{ fontWeight: '800', color: c.info, fontSize: 15 }}>{formatCurrency(showroomBal)}</Text>
          </View>
          <View style={[styles.balCard, { backgroundColor: c.success + '10' }, paperTheme.shadows?.sm]}>
            <LinearGradient colors={[c.success + '20', c.success + '08']} style={styles.balIcon}>
              <MaterialCommunityIcons name="account-outline" size={18} color={c.success} />
            </LinearGradient>
            <Text style={{ color: c.success, fontSize: 11, fontWeight: '600', marginTop: 6 }}>Owner</Text>
            <Text style={{ fontWeight: '800', color: c.success, fontSize: 15 }}>{formatCurrency(ownerBal)}</Text>
          </View>
        </View>
      )}

      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingTop: 8 }}><Chip icon="filter" onClose={() => setTypeFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{typeFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No ledger entries" icon="📒" />}
        showsVerticalScrollIndicator={false} />
      <ConfirmDialog visible={!!deleteId} title="Delete Entry" message="Delete this ledger entry?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  balanceRow: { flexDirection: 'row', gap: 10 },
  balCard: { flex: 1, borderRadius: 16, alignItems: 'center', paddingVertical: 14 },
  balIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 1, fontWeight: '400' },
  actionBtn: { margin: 0, width: 30, height: 30 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
