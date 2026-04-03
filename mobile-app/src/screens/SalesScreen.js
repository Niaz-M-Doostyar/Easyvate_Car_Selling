import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput as RNTextInput } from 'react-native';
import { Searchbar, FAB, Text, IconButton, Menu, Chip, ProgressBar, Button, Portal, Dialog, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, SALE_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function SalesScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const { canWrite } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [payDialog, setPayDialog] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paying, setPaying] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/sales');
      setSales(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/sales/${deleteId}`); setSales(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const handlePay = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { alert('Enter a valid amount'); return; }
    setPaying(true);
    try {
      await apiClient.post(`/sales/${payDialog.id}/payments`, { amount: amt, note: payNote, currency: 'AFN' });
      setPayDialog(null); setPayAmount(''); setPayNote('');
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Payment failed'); }
    setPaying(false);
  };

  const filtered = sales.filter(x => {
    const q = search.toLowerCase();
    const veh = x.vehicle ? `${x.vehicle.manufacturer} ${x.vehicle.model}` : '';
    const cust = x.customer?.fullName || '';
    const m = !search || [x.saleId, veh, cust].some(f => f?.toLowerCase().includes(q));
    return m && (typeFilter === 'All' || x.saleType === typeFilter);
  });

  const renderItem = ({ item }) => {
    const remaining = Number(item.remainingAmount || 0);
    const total = Number(item.sellingPrice || 1);
    const paid = total - remaining;
    const progress = Math.min(paid / total, 1);
    const veh = item.vehicle ? `${item.vehicle.manufacturer} ${item.vehicle.model} (${item.vehicle.year})` : (item.vehicleId ? `Vehicle #${item.vehicleId}` : 'N/A');
    const isPaid = remaining <= 0;

    return (
      <TouchableRipple
        onPress={() => navigation.navigate('SaleDetail', { sale: item })}
        style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
        borderless
      >
        <View style={styles.cardInner}>
          <LinearGradient
            colors={isPaid ? [c.success + '20', c.success + '08'] : [c.warning + '20', c.warning + '08']}
            style={styles.cardIcon}
          >
            <MaterialCommunityIcons name={isPaid ? 'check-circle-outline' : 'clock-outline'} size={22} color={isPaid ? c.success : c.warning} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.saleId, { color: c.primary }]}>{item.saleId || '-'}</Text>
              <StatusChip label={item.saleType || 'Sale'} />
            </View>
            <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>{veh}</Text>
            <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.customer?.fullName || item.buyerName || 'N/A'} • {item.saleDate ? new Date(item.saleDate).toLocaleDateString() : ''}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <Text style={[styles.priceText, { color: c.onSurface }]}>{formatCurrency(item.sellingPrice)}</Text>
              <View style={[styles.payBadge, { backgroundColor: isPaid ? c.success + '12' : c.warning + '12' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: isPaid ? c.success : c.warning }}>
                  {isPaid ? '✓ Paid' : `${formatCurrency(remaining)} left`}
                </Text>
              </View>
            </View>
            <ProgressBar progress={progress} color={isPaid ? c.success : c.warning} style={styles.progress} />
            <View style={styles.actionsRow}>
              <IconButton icon="eye-outline" size={18} iconColor={c.primary} onPress={() => navigation.navigate('SaleDetail', { sale: item })} style={styles.actionBtn} />
              {remaining > 0 && canWrite('Sales') && <IconButton icon="cash" size={18} iconColor={c.success} onPress={() => { setPayDialog(item); setPayAmount(String(remaining)); }} style={styles.actionBtn} />}
              {canWrite('Sales') && <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('SaleForm', { sale: item })} style={styles.actionBtn} />}
              {canWrite('Sales') && <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />}
            </View>
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <ScreenWrapper title="Sales" navigation={navigation}
      actions={<Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
        anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item title="All" onPress={() => { setTypeFilter('All'); setMenuVisible(false); }} />
        {SALE_TYPES.map(t => <Menu.Item key={t.value} title={t.label} onPress={() => { setTypeFilter(t.value); setMenuVisible(false); }} />)}
      </Menu>}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('SaleForm')} />}
    >
      <View style={styles.filterRow}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search sales..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput} iconColor={c.onSurfaceVariant} />
      </View>
      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingBottom: 6 }}><Chip icon="filter" onClose={() => setTypeFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{typeFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No sales found" icon="🚗" />}
        showsVerticalScrollIndicator={false} />

      <ConfirmDialog visible={!!deleteId} title="Delete Sale" message="This will un-sell the vehicle and delete all related records." onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      <Portal>
        <Dialog visible={!!payDialog} onDismiss={() => setPayDialog(null)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Record Payment</Dialog.Title>
          <Dialog.Content>
            {payDialog && (
              <View style={{ gap: 12 }}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>Remaining: {formatCurrency(payDialog.remainingAmount)}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(payDialog.remainingAmount))} style={styles.presetBtn}>Full</Button>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(Math.round(payDialog.remainingAmount / 2)))} style={styles.presetBtn}>½</Button>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(Math.round(payDialog.remainingAmount / 3)))} style={styles.presetBtn}>⅓</Button>
                </View>
                <View style={[styles.inputBox, { borderColor: c.border }]}>
                  <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>Amount (AFN)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.onSurface, marginRight: 4 }}>؋</Text>
                    <RNTextInput value={payAmount} onChangeText={setPayAmount} keyboardType="numeric"
                      style={{ flex: 1, fontSize: 18, fontWeight: '800', color: c.onSurface, padding: 0 }}
                      placeholder="0" placeholderTextColor={c.onSurfaceVariant + '60'} />
                  </View>
                </View>
                <View style={[styles.inputBox, { borderColor: c.border }]}>
                  <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>Note (optional)</Text>
                  <RNTextInput value={payNote} onChangeText={setPayNote}
                    style={{ fontSize: 14, color: c.onSurface, padding: 0 }}
                    placeholder="Payment note..." placeholderTextColor={c.onSurfaceVariant + '60'} />
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setPayDialog(null)} style={styles.dialogBtn}>Cancel</Button>
            <Button mode="contained" onPress={handlePay} loading={paying} disabled={paying} style={styles.dialogBtn}>Pay</Button>
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
  saleId: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginTop: 3, letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  priceText: { fontSize: 16, fontWeight: '800' },
  payBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  progress: { height: 4, borderRadius: 2, marginTop: 8, backgroundColor: '#00000008' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2, marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
  dialog: { borderRadius: 24 },
  dialogTitle: { fontWeight: '700', fontSize: 18 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  dialogBtn: { borderRadius: 14 },
  presetBtn: { borderRadius: 12 },
  inputBox: { borderWidth: 1.5, borderRadius: 14, padding: 12 },
});
