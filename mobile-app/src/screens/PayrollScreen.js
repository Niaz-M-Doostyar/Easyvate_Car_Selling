import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, IconButton, Menu, Chip, Button, Portal, Dialog, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, MONTHS } from '../utils/constants';
import apiClient from '../api/client';

export default function PayrollScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [payDialog, setPayDialog] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/payroll');
      setRecords(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/payroll/${deleteId}`); setRecords(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await apiClient.put(`/payroll/${payDialog.id}/pay`);
      setPayDialog(null); fetch();
    } catch (e) { alert(e.response?.data?.error || 'Failed to pay'); }
    setPaying(false);
  };

  const filtered = records.filter(x => statusFilter === 'All' || x.status === statusFilter);

  const renderItem = ({ item }) => {
    const isPaid = item.status === 'Paid';
    return (
      <TouchableRipple
        onPress={() => navigation.navigate('PayrollForm', { record: item })}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.Employee?.fullName || item.employeeName || 'Employee'}</Text>
                <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.month} {item.year} • {item.Employee?.position || ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: c.primary }}>{formatCurrency(item.netSalary || item.salary || 0)}</Text>
                <StatusChip label={item.status || 'Pending'} />
              </View>
            </View>

            {/* Breakdown */}
            <View style={[styles.breakdownRow, { backgroundColor: c.surfaceVariant }]}>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Base</Text>
                <Text style={[styles.breakdownValue, { color: c.onSurface }]}>{formatCurrency(item.baseSalary || item.salary || 0)}</Text>
              </View>
              <View style={[styles.breakdownDivider, { backgroundColor: c.border }]} />
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Bonus</Text>
                <Text style={[styles.breakdownValue, { color: c.success }]}>+{formatCurrency(item.bonus || 0)}</Text>
              </View>
              <View style={[styles.breakdownDivider, { backgroundColor: c.border }]} />
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Deduction</Text>
                <Text style={[styles.breakdownValue, { color: c.error }]}>-{formatCurrency(item.deductions || item.deduction || 0)}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {!isPaid && <IconButton icon="cash-check" size={18} iconColor={c.success} onPress={() => setPayDialog(item)} style={styles.actionBtn} />}
              <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('PayrollForm', { record: item })} style={styles.actionBtn} />
              <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
            </View>
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <ScreenWrapper title="Payroll" navigation={navigation}
      actions={<Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
        anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}>
        <Menu.Item title="All" onPress={() => { setStatusFilter('All'); setMenuVisible(false); }} />
        {['Pending', 'Paid', 'Cancelled'].map(s => <Menu.Item key={s} title={s} onPress={() => { setStatusFilter(s); setMenuVisible(false); }} />)}
      </Menu>}
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('PayrollForm')} />}>

      {statusFilter !== 'All' && <View style={{ paddingLeft: 16, paddingTop: 8 }}><Chip icon="filter" onClose={() => setStatusFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{statusFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No payroll records" icon="💰" />}
        showsVerticalScrollIndicator={false} />

      <ConfirmDialog visible={!!deleteId} title="Delete Payroll" message="Delete this payroll record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      <Portal>
        <Dialog visible={!!payDialog} onDismiss={() => setPayDialog(null)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Mark as Paid</Dialog.Title>
          <Dialog.Content>
            {payDialog && <Text style={{ color: c.onSurfaceVariant, fontSize: 14 }}>Pay {formatCurrency(payDialog.netSalary || payDialog.salary || 0)} to {payDialog.Employee?.fullName || 'this employee'}?</Text>}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setPayDialog(null)} style={styles.dialogBtn}>Cancel</Button>
            <Button mode="contained" onPress={handlePay} loading={paying} style={styles.dialogBtn}>Mark Paid</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  breakdownRow: { flexDirection: 'row', borderRadius: 12, paddingVertical: 10, marginTop: 10 },
  breakdownItem: { alignItems: 'center', flex: 1 },
  breakdownLabel: { fontSize: 10, fontWeight: '600' },
  breakdownValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  breakdownDivider: { width: 1, marginVertical: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  dialog: { borderRadius: 24 },
  dialogTitle: { fontWeight: '700', fontSize: 18 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  dialogBtn: { borderRadius: 14 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
