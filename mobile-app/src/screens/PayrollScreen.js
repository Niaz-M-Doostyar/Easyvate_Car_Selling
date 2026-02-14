import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Text, IconButton, Menu, Chip, Button, Portal, Dialog } from 'react-native-paper';
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
      setRecords(Array.isArray(data) ? data : data.records || data.payrolls || []);
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
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
        onPress={() => navigation.navigate('PayrollForm', { record: item })}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>{item.Employee?.fullName || item.employeeName || 'Employee'}</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.month} {item.year} • {item.Employee?.position || ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '800', color: c.primary }}>{formatCurrency(item.netSalary || item.salary || 0)}</Text>
              <StatusChip label={item.status || 'Pending'} />
            </View>
          </View>

          {/* Breakdown */}
          <View style={[styles.breakdownRow, { backgroundColor: c.surfaceVariant, marginTop: 8 }]}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, fontSize: 10 }}>Base</Text>
              <Text variant="bodySmall" style={{ fontWeight: '700', color: c.onSurface }}>{formatCurrency(item.baseSalary || item.salary || 0)}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, fontSize: 10 }}>Bonus</Text>
              <Text variant="bodySmall" style={{ fontWeight: '700', color: '#4caf50' }}>+{formatCurrency(item.bonus || 0)}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, fontSize: 10 }}>Deduction</Text>
              <Text variant="bodySmall" style={{ fontWeight: '700', color: '#f44336' }}>-{formatCurrency(item.deductions || item.deduction || 0)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: -4 }}>
            {!isPaid && <IconButton icon="cash-check" size={18} iconColor="#4caf50" onPress={() => setPayDialog(item)} />}
            <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('PayrollForm', { record: item })} />
            <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </Card.Content>
      </Card>
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

      {statusFilter !== 'All' && <View style={{ paddingLeft: 16, paddingTop: 8 }}><Chip icon="filter" onClose={() => setStatusFilter('All')}>{statusFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No payroll records" icon="💰" />} />

      <ConfirmDialog visible={!!deleteId} title="Delete Payroll" message="Delete this payroll record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      <Portal>
        <Dialog visible={!!payDialog} onDismiss={() => setPayDialog(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Mark as Paid</Dialog.Title>
          <Dialog.Content>
            {payDialog && <Text variant="bodyMedium">Pay {formatCurrency(payDialog.netSalary || payDialog.salary || 0)} to {payDialog.Employee?.fullName || 'this employee'}?</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPayDialog(null)}>Cancel</Button>
            <Button mode="contained" onPress={handlePay} loading={paying}>Mark Paid</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  breakdownRow: { flexDirection: 'row', borderRadius: 8, paddingVertical: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
