import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { FAB, Text, IconButton, Menu, Chip, Button, Portal, Dialog, ActivityIndicator, TouchableRipple } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
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
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1));
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [payDialog, setPayDialog] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  // Generate payroll
  const [genDialog, setGenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [genForm, setGenForm] = useState({ employeeId: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), commission: '0', deductions: '0', notes: '' });
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/payroll');
      setRecords(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  useEffect(() => {
    apiClient.get('/employees').then(({ data }) => {
      setEmployees(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!genForm.employeeId || !genForm.month || !genForm.year) { setPreview(null); return; }
    const t = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const { data } = await apiClient.post('/payroll/calculate', {
          employeeId: Number(genForm.employeeId), month: Number(genForm.month), year: Number(genForm.year),
        });
        setPreview(data?.data || null);
      } catch (e) { setPreview(null); }
      setPreviewLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [genForm.employeeId, genForm.month, genForm.year]);

  const handleGenerate = async () => {
    if (!genForm.employeeId) { alert('Select an employee'); return; }
    setGenerating(true);
    try {
      await apiClient.post('/payroll/generate', {
        employeeId: Number(genForm.employeeId), month: Number(genForm.month), year: Number(genForm.year),
        commission: Number(genForm.commission || 0), deductions: Number(genForm.deductions || 0), notes: genForm.notes,
      });
      setGenDialog(false);
      setGenForm({ employeeId: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), commission: '0', deductions: '0', notes: '' });
      setPreview(null);
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Failed to generate'); }
    setGenerating(false);
  };

  const handleBulkGenerate = async () => {
    const m = Number(monthFilter);
    const y = Number(yearFilter);
    setBulkGenerating(true);
    try {
      const { data } = await apiClient.post('/payroll/generate-bulk', { month: m, year: y });
      alert(`Generated ${data?.data?.generated || 0} payroll records for ${MONTHS[m - 1]} ${y}`);
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Failed to generate bulk'); }
    setBulkGenerating(false);
  };

  const handleDelete = async () => {
    try { await apiClient.delete(`/payroll/${deleteId}`); setRecords(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      alert('Enter a valid amount');
      return;
    }
    setPaying(true);
    try {
      await apiClient.post(`/payroll/${payDialog.id}/pay`, { amount: Number(payAmount) });
      setPayDialog(null);
      setPayAmount('');
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Failed to pay'); }
    setPaying(false);
  };

  const filtered = records.filter(x => (
    Number(x.month) === Number(monthFilter)
    && Number(x.year) === Number(yearFilter)
    && (statusFilter === 'All' || x.status === statusFilter)
  ));

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
                <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{MONTHS[Number(item.month) - 1] || item.month} {item.year} • {item.Employee?.position || ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: c.primary }}>{formatCurrency(item.netSalary || item.salary || 0, 'AFN')}</Text>
                <StatusChip label={item.status || 'Pending'} />
              </View>
            </View>

            {/* Breakdown */}
            <View style={[styles.breakdownRow, { backgroundColor: c.surfaceVariant }]}>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Base</Text>
                <Text style={[styles.breakdownValue, { color: c.onSurface }]}>{formatCurrency(item.baseSalary || item.salary || 0, 'AFN')}</Text>
              </View>
              <View style={[styles.breakdownDivider, { backgroundColor: c.border }]} />
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Bonus</Text>
                <Text style={[styles.breakdownValue, { color: c.success }]}>+{formatCurrency(item.bonus || 0, 'AFN')}</Text>
              </View>
              <View style={[styles.breakdownDivider, { backgroundColor: c.border }]} />
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: c.onSurfaceVariant }]}>Deduction</Text>
                <Text style={[styles.breakdownValue, { color: c.error }]}>-{formatCurrency(item.deductions || item.deduction || 0, 'AFN')}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {!isPaid && <IconButton icon="cash-check" size={18} iconColor={c.success} onPress={() => {
                setPayDialog(item);
                setPayAmount(String(Number(item.netSalary || item.salary || 0) - Number(item.paidAmount || 0)));
              }} style={styles.actionBtn} />}
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
      actions={
        <View style={{ flexDirection: 'row' }}>
          <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
            anchor={<IconButton icon="filter-variant" iconColor={c.onSurface} onPress={() => setMenuVisible(true)} />}>
            <Menu.Item title="All statuses" onPress={() => { setStatusFilter('All'); setMenuVisible(false); }} />
            {['Pending', 'Partial', 'Paid'].map(s => <Menu.Item key={s} title={s} onPress={() => { setStatusFilter(s); setMenuVisible(false); }} />)}
          </Menu>
          <IconButton icon="account-multiple-plus-outline" iconColor={c.onSurface} onPress={handleBulkGenerate} disabled={bulkGenerating} />
          <IconButton icon="receipt" iconColor={c.onSurface} onPress={() => setGenDialog(true)} />
        </View>
      }
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('PayrollForm')} />}>

      <View style={styles.periodFilters}>
        <PickerField
          label="Month"
          value={MONTHS[Number(monthFilter) - 1]}
          options={MONTHS}
          onSelect={value => setMonthFilter(String(MONTHS.indexOf(value) + 1))}
          style={styles.periodFilter}
        />
        <PickerField
          label="Year"
          value={yearFilter}
          options={Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))}
          onSelect={setYearFilter}
          style={styles.periodFilter}
        />
      </View>
      {statusFilter !== 'All' && <View style={{ paddingHorizontal: 16 }}><Chip icon="filter" onClose={() => setStatusFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{statusFilter}</Chip></View>}

      <FlatList data={filtered} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No payroll records" icon="💰" />}
        showsVerticalScrollIndicator={false} />

      <ConfirmDialog visible={!!deleteId} title="Delete Payroll" message="Delete this payroll record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      {/* Generate Payroll Dialog */}
      <Portal>
        <Dialog visible={genDialog} onDismiss={() => setGenDialog(false)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Generate Payroll</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 480 }}>
            <View style={{ gap: 4, paddingVertical: 8 }}>
              <PickerField label="Employee *"
                value={genForm.employeeId ? employees.find(e => String(e.id) === genForm.employeeId)?.fullName : ''}
                options={employees.map(e => e.fullName)}
                onSelect={v => { const emp = employees.find(e => e.fullName === v); if (emp) setGenForm(p => ({ ...p, employeeId: String(emp.id) })); }} />
              <PickerField label="Month" value={MONTHS[Number(genForm.month) - 1]} options={MONTHS}
                onSelect={v => setGenForm(p => ({ ...p, month: String(MONTHS.indexOf(v) + 1) }))} />
              <PickerField label="Year" value={genForm.year}
                options={Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))}
                onSelect={v => setGenForm(p => ({ ...p, year: v }))} />
              <FormField label="Commission" value={genForm.commission} onChangeText={v => setGenForm(p => ({ ...p, commission: v }))} keyboardType="numeric" />
              <FormField label="Deductions" value={genForm.deductions} onChangeText={v => setGenForm(p => ({ ...p, deductions: v }))} keyboardType="numeric" />
              <FormField label="Notes" value={genForm.notes} onChangeText={v => setGenForm(p => ({ ...p, notes: v }))} />
              {previewLoading && <ActivityIndicator size="small" color={c.primary} style={{ marginTop: 8 }} />}
              {preview && !previewLoading && (
                <View style={[styles.previewCard, { backgroundColor: c.primary + '10' }]}>
                  <Text style={{ fontWeight: '700', color: c.primary, marginBottom: 6 }}>Preview</Text>
                  {[['Base Salary', preview.baseSalary], ['Present Days', preview.presentDays], ['Absent Days', preview.absentDays], ['Deductions', preview.deductions], ['Net Salary', preview.netSalary]].map(([label, val]) => (
                    <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ fontSize: 12, color: c.onSurfaceVariant }}>{label}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: label === 'Net Salary' ? c.primary : c.onSurface }}>{typeof val === 'number' && val > 100 ? formatCurrency(val, 'AFN') : val}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setGenDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleGenerate} loading={generating}>Generate</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={!!payDialog} onDismiss={() => setPayDialog(null)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Record Payroll Payment</Dialog.Title>
          <Dialog.Content>
            {payDialog && (
              <View style={{ gap: 10 }}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>
                  Employee: {payDialog.Employee?.fullName || payDialog.employeeName}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>
                  Month: {payDialog.month} {payDialog.year}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>
                  Total Salary: {formatCurrency(payDialog.netSalary || payDialog.salary || 0, 'AFN')}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>
                  Paid Amount: {formatCurrency(payDialog.paidAmount || 0, 'AFN')}
                </Text>
                <FormField label="Payment Amount (AFN) *" value={payAmount} onChangeText={setPayAmount} keyboardType="numeric" />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setPayDialog(null)} style={styles.dialogBtn}>Cancel</Button>
            <Button mode="contained" onPress={handlePay} loading={paying} style={styles.dialogBtn}>Record Payment</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  periodFilters: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  periodFilter: { flex: 1 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
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
  previewCard: { borderRadius: 12, padding: 12, marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
