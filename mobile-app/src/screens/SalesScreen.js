import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput as RNTextInput } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Menu, Chip, ProgressBar, Button, Portal, Dialog } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, SALE_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function SalesScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
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
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
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
    const veh = x.Vehicle ? `${x.Vehicle.manufacturer} ${x.Vehicle.model}` : '';
    const cust = x.Customer?.fullName || '';
    const m = !search || [x.saleId, veh, cust].some(f => f?.toLowerCase().includes(q));
    return m && (typeFilter === 'All' || x.saleType === typeFilter);
  });

  const getPaymentColor = (remaining) => {
    if (remaining <= 0) return '#4caf50';
    return '#ff9800';
  };

  const renderItem = ({ item }) => {
    const remaining = Number(item.remainingAmount || 0);
    const total = Number(item.sellingPrice || 1);
    const paid = total - remaining;
    const progress = Math.min(paid / total, 1);
    const veh = item.Vehicle ? `${item.Vehicle.manufacturer} ${item.Vehicle.model} (${item.Vehicle.year})` : 'N/A';

    return (
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
        onPress={() => navigation.navigate('SaleDetail', { sale: item })}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="labelSmall" style={{ color: c.primary, fontWeight: '700' }}>{item.saleId || '-'}</Text>
                <StatusChip label={item.saleType || 'Sale'} />
              </View>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginTop: 4 }} numberOfLines={1}>{veh}</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.Customer?.fullName || 'N/A'} • {item.saleDate ? new Date(item.saleDate).toLocaleDateString() : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '800', color: c.onSurface }}>{formatCurrency(item.sellingPrice)}</Text>
              <Chip style={{ marginTop: 4, backgroundColor: remaining <= 0 ? '#e8f5e9' : '#fff3e0' }}
                textStyle={{ fontSize: 10, fontWeight: '700', color: getPaymentColor(remaining) }}>
                {remaining <= 0 ? '✓ Paid' : `${formatCurrency(remaining)} left`}
              </Chip>
            </View>
          </View>

          {/* Payment progress bar */}
          <ProgressBar progress={progress} color={getPaymentColor(remaining)} style={{ marginTop: 8, borderRadius: 4, height: 4 }} />

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: -4 }}>
            <IconButton icon="eye" size={18} onPress={() => navigation.navigate('SaleDetail', { sale: item })} />
            {remaining > 0 && <IconButton icon="cash" size={18} iconColor="#4caf50" onPress={() => { setPayDialog(item); setPayAmount(String(remaining)); }} />}
            <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('SaleForm', { sale: item })} />
            <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </Card.Content>
      </Card>
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
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search sales..." style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]} inputStyle={{ fontSize: 14 }} />
      </View>
      {typeFilter !== 'All' && <View style={{ paddingLeft: 16, paddingBottom: 8 }}><Chip icon="filter" onClose={() => setTypeFilter('All')}>{typeFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No sales found" icon="🚗" />} />

      <ConfirmDialog visible={!!deleteId} title="Delete Sale" message="This will un-sell the vehicle and delete all related records (commissions, ledger entries, etc.)" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      {/* Payment Dialog */}
      <Portal>
        <Dialog visible={!!payDialog} onDismiss={() => setPayDialog(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Record Payment</Dialog.Title>
          <Dialog.Content>
            {payDialog && (
              <View style={{ gap: 8 }}>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
                  Remaining: {formatCurrency(payDialog.remainingAmount)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(payDialog.remainingAmount))}>Full</Button>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(Math.round(payDialog.remainingAmount / 2)))}>½</Button>
                  <Button compact mode="outlined" onPress={() => setPayAmount(String(Math.round(payDialog.remainingAmount / 3)))}>⅓</Button>
                </View>
                <View style={{ borderWidth: 1, borderColor: c.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>Amount (AFN)</Text>
                  <Text variant="headlineSmall" style={{ fontWeight: '700', color: c.primary }}
                    onPress={() => {}}
                  >{payAmount || '0'}</Text>
                </View>
                {/* Simple amount input - using native TextInput to avoid Paper styling issues */}
                <View style={{ borderWidth: 1, borderColor: c.outline, borderRadius: 8, padding: 12 }}>
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Enter Amount</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.onSurface, marginRight: 4 }}>؋</Text>
                    <View style={{ flex: 1 }}>
                      <RNTextInput
                        value={payAmount}
                        onChangeText={setPayAmount}
                        keyboardType="numeric"
                        style={{ fontSize: 16, fontWeight: '700', color: c.onSurface, padding: 0 }}
                        placeholder="0"
                        placeholderTextColor={c.onSurfaceVariant}
                      />
                    </View>
                  </View>
                </View>
                <View style={{ borderWidth: 1, borderColor: c.outline, borderRadius: 8, padding: 12, marginTop: 4 }}>
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Note (optional)</Text>
                  {React.createElement(require('react-native').TextInput, {
                    value: payNote,
                    onChangeText: setPayNote,
                    style: { fontSize: 14, color: c.onSurface, padding: 0 },
                    placeholder: 'Payment note...',
                    placeholderTextColor: c.onSurfaceVariant,
                  })}
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPayDialog(null)}>Cancel</Button>
            <Button mode="contained" onPress={handlePay} loading={paying} disabled={paying}>Pay</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchbar: { borderRadius: 12, elevation: 0, height: 44 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
