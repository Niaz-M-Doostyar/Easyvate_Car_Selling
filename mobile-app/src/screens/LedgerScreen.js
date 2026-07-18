import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { FAB, Text, IconButton, Menu, Chip, TouchableRipple } from '../components/LocalizedPaper';
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
    } catch (e) {
    } finally {
      setLoading(false);
    }
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
              {credit ? '+' : '-'}{formatCurrency(amt, item.currency || 'AFN')}
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
  const ownerProfit = Number(balance?.ownerProfit || 0);
  const totalIncome = Number(balance?.totalIncome || 0);
  const totalExpenses = Number(balance?.totalExpenses || 0);
  const totalCommission = Number(balance?.totalCommission || 0);
  const totalOwnerWithdrawal = Number(balance?.totalOwnerWithdrawal || 0);

  // Income by currency (Vehicle Sale entries)
  const incomeByCurrency = entries.reduce((acc, e) => {
    if (e.type === 'Vehicle Sale') {
      const cur = e.currency || 'AFN';
      acc[cur] = (acc[cur] || 0) + (parseFloat(e.amount) || 0);
    }
    return acc;
  }, { AFN: 0, USD: 0, PKR: 0, AED: 0 });

  // Net wallet balance per currency
  const creditTypes = ['Showroom Balance', 'Vehicle Sale', 'Commission', 'Currency Exchange'];
  const debitTypes = ['Expense', 'Vehicle Purchase', 'Owner Withdrawal'];
  const walletByCurrency = entries.reduce((acc, e) => {
    const cur = e.currency || 'AFN';
    const amt = parseFloat(e.amount) || 0;
    if (creditTypes.includes(e.type)) acc[cur] = (acc[cur] || 0) + amt;
    else if (debitTypes.includes(e.type)) acc[cur] = (acc[cur] || 0) - amt;
    return acc;
  }, { AFN: 0, USD: 0, PKR: 0, AED: 0 });

  return (
    <ScreenWrapper title="Showroom Ledger" navigation={navigation}
      actions={<Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
        anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item title="All" onPress={() => { setTypeFilter('All'); setMenuVisible(false); }} />
        {LEDGER_TYPES.map(t => <Menu.Item key={t} title={t} onPress={() => { setTypeFilter(t); setMenuVisible(false); }} />)}
      </Menu>}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('LedgerForm')} />}>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No ledger entries" icon="📒" />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {balance && (
              <View style={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 8 }}>
                <View style={[styles.balanceRow]}>
                  <View style={[styles.balCard, { backgroundColor: c.primary + '10' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="store-outline" size={18} color={c.primary} />
                    </LinearGradient>
                    <Text style={{ color: c.primary, fontSize: 10, fontWeight: '600', marginTop: 6 }}>Showroom Bal</Text>
                    <Text style={{ fontWeight: '800', color: c.primary, fontSize: 13 }}>{formatCurrency(showroomBal, 'AFN')}</Text>
                  </View>
                  <View style={[styles.balCard, { backgroundColor: c.success + '10' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={[c.success + '20', c.success + '08']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="account-cash" size={18} color={c.success} />
                    </LinearGradient>
                    <Text style={{ color: c.success, fontSize: 10, fontWeight: '600', marginTop: 6 }}>Owner Profit</Text>
                    <Text style={{ fontWeight: '800', color: c.success, fontSize: 13 }}>{formatCurrency(ownerProfit, 'AFN')}</Text>
                  </View>
                  <View style={[styles.balCard, { backgroundColor: c.error + '10' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={[c.error + '20', c.error + '08']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="trending-down" size={18} color={c.error} />
                    </LinearGradient>
                    <Text style={{ color: c.error, fontSize: 10, fontWeight: '600', marginTop: 6 }}>Expenses</Text>
                    <Text style={{ fontWeight: '800', color: c.error, fontSize: 13 }}>{formatCurrency(totalExpenses, 'AFN')}</Text>
                  </View>
                </View>
                <View style={[styles.balanceRow, { marginTop: 8 }]}>
                  <View style={[styles.balCard, { backgroundColor: (c.info || '#3b82f6') + '10' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={[(c.info || '#3b82f6') + '20', (c.info || '#3b82f6') + '08']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="trending-up" size={18} color={c.info || '#3b82f6'} />
                    </LinearGradient>
                    <Text style={{ color: c.info || '#3b82f6', fontSize: 10, fontWeight: '600', marginTop: 6 }}>Income</Text>
                    <Text style={{ fontWeight: '800', color: c.info || '#3b82f6', fontSize: 13 }}>{formatCurrency(totalIncome, 'AFN')}</Text>
                  </View>
                  <View style={[styles.balCard, { backgroundColor: '#f59e0b10' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={['#f59e0b20', '#f59e0b08']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="handshake" size={18} color="#f59e0b" />
                    </LinearGradient>
                    <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '600', marginTop: 6 }}>Commission</Text>
                    <Text style={{ fontWeight: '800', color: '#f59e0b', fontSize: 13 }}>{formatCurrency(totalCommission, 'AFN')}</Text>
                  </View>
                  <View style={[styles.balCard, { backgroundColor: '#8b5cf610' }, paperTheme.shadows?.sm]}>
                    <LinearGradient colors={['#8b5cf620', '#8b5cf608']} style={styles.balIcon}>
                      <MaterialCommunityIcons name="account-arrow-up" size={18} color="#8b5cf6" />
                    </LinearGradient>
                    <Text style={{ color: '#8b5cf6', fontSize: 10, fontWeight: '600', marginTop: 6 }}>Withdrawal</Text>
                    <Text style={{ fontWeight: '800', color: '#8b5cf6', fontSize: 13 }}>{formatCurrency(totalOwnerWithdrawal, 'AFN')}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant, marginTop: 12, marginBottom: 6, paddingHorizontal: 0 }}>Income by Currency</Text>
                <View style={styles.balanceRow}>
                  {[['AFN', c.primary], ['USD', c.success], ['PKR', '#f59e0b'], ['AED', c.info || '#3b82f6']].map(([cur, color]) => (
                    <View key={cur} style={[styles.miniCard, { backgroundColor: color + '10' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{cur}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color }}>{formatCurrency(incomeByCurrency[cur] || 0, cur)}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant, marginTop: 10, marginBottom: 6 }}>Wallet Balance by Currency</Text>
                <View style={styles.balanceRow}>
                  {[['AFN', c.primary], ['USD', c.success], ['PKR', '#f59e0b'], ['AED', c.info || '#3b82f6']].map(([cur, color]) => {
                    const val = walletByCurrency[cur] || 0;
                    const col = val >= 0 ? color : c.error;
                    return (
                      <View key={cur} style={[styles.miniCard, { backgroundColor: col + '10' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: col }}>{cur}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: col }}>{formatCurrency(val, cur)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {typeFilter !== 'All' && <View style={{ paddingBottom: 6 }}><Chip icon="filter" onClose={() => setTypeFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{typeFilter}</Chip></View>}
          </>
        }
      />
      <ConfirmDialog visible={!!deleteId} title="Delete Entry" message="Delete this ledger entry?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  balanceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  balCard: { width: '48%', borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
  balIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  miniCard: { width: '48%', borderRadius: 10, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 1, fontWeight: '400' },
  actionBtn: { margin: 0, width: 30, height: 30 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
