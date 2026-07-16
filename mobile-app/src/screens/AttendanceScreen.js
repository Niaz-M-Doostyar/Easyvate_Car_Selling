import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { FAB, Text, IconButton, Chip, TouchableRipple, Portal, Dialog, Button } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { MONTHS } from '../utils/constants';
import apiClient from '../api/client';

const TABS = ['Today', 'Monthly Summary', 'Records'];
const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Unpaid'];

export default function AttendanceScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [tab, setTab] = useState(0);

  // Today tab
  const [todayData, setTodayData] = useState([]);
  const [todayLoading, setTodayLoading] = useState(false);

  // Monthly summary tab
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [summaryData, setSummaryData] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Records tab
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [deleteId, setDeleteId] = useState(null);

  // Leave dialog
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ employeeId: '', startDate: '', endDate: '', leaveType: 'Casual' });
  const [leaveSaving, setLeaveSaving] = useState(false);

  // Work hours dialog
  const [workDialog, setWorkDialog] = useState(false);
  const [workHours, setWorkHours] = useState({ start: '08:00', end: '17:00' });
  const [workSaving, setWorkSaving] = useState(false);

  const fetchToday = useCallback(async () => {
    setTodayLoading(true);
    try {
      const { data } = await apiClient.get('/attendance/today');
      setTodayData(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {}
    setTodayLoading(false);
  }, []);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { data } = await apiClient.get('/attendance/monthly-summary', { params: { month, year } });
      setSummaryData(Array.isArray(data?.data) ? data.data : []);
      setTotalDays(data?.totalDays || 0);
    } catch (e) {}
    setSummaryLoading(false);
  }, [month, year]);

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const params = {};
      if (monthFilter) params.month = monthFilter;
      if (yearFilter) params.year = yearFilter;
      const { data } = await apiClient.get('/attendance', { params });
      setRecords(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {}
    setRecordsLoading(false);
  }, [monthFilter, yearFilter]);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/employees');
      setEmployees(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {}
  }, []);

  const fetchWorkHours = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/time-settings/work-hours');
      setWorkHours({ start: data.start || '08:00', end: data.end || '17:00' });
    } catch (e) {}
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      fetchToday();
      fetchSummary();
      fetchRecords();
      fetchEmployees();
      fetchWorkHours();
    });
    return unsub;
  }, [navigation, fetchToday, fetchSummary, fetchRecords, fetchEmployees, fetchWorkHours]);

  useEffect(() => { fetchSummary(); }, [month, year]);
  useEffect(() => { fetchRecords(); }, [monthFilter, yearFilter]);

  const handleDeleteRecord = async () => {
    try { await apiClient.delete(`/attendance/${deleteId}`); setRecords(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const handleSubmitLeave = async () => {
    if (!leaveForm.employeeId || !leaveForm.startDate || !leaveForm.endDate) {
      alert('Employee, start date and end date are required');
      return;
    }
    setLeaveSaving(true);
    try {
      await apiClient.post('/leaves', {
        employeeId: Number(leaveForm.employeeId),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        leaveType: leaveForm.leaveType,
      });
      setLeaveDialog(false);
      setLeaveForm({ employeeId: '', startDate: '', endDate: '', leaveType: 'Casual' });
      fetchToday();
      fetchSummary();
    } catch (e) { alert(e.response?.data?.error || 'Failed to add leave'); }
    setLeaveSaving(false);
  };

  const handleSaveWorkHours = async () => {
    setWorkSaving(true);
    try {
      await apiClient.put('/time-settings/work-hours', workHours);
      setWorkDialog(false);
      fetchToday();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setWorkSaving(false);
  };

  const empOptions = employees.map(e => ({ label: e.fullName, value: String(e.id) }));
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: String(i + 1) }));

  // ── Today tab ──────────────────────────────────────────────────────────────
  const renderToday = () => (
    <FlatList
      data={todayData}
      keyExtractor={i => String(i.employeeId)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={todayLoading} onRefresh={fetchToday} colors={[c.primary]} />}
      ListEmptyComponent={<EmptyState loading={todayLoading} message="No attendance data for today" icon="📅" />}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const pair = item.pairs?.[0];
        const hasIn = !!pair?.checkIn;
        const hasOut = !!pair?.checkOut;
        const statusColor = hasIn ? c.success : c.error;
        const statusLabel = hasIn ? (hasOut ? 'Present' : 'Checked In') : 'Absent';
        const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        return (
          <View style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
            <View style={styles.cardInner}>
              <LinearGradient colors={[statusColor + '20', statusColor + '08']} style={styles.cardIcon}>
                <MaterialCommunityIcons name={hasIn ? 'account-check-outline' : 'account-off-outline'} size={22} color={statusColor} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.employeeName}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <View style={[styles.timeBadge, { backgroundColor: c.success + '12' }]}>
                    <MaterialCommunityIcons name="login" size={12} color={c.success} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.success }}>{fmt(pair?.checkIn)}</Text>
                  </View>
                  <View style={[styles.timeBadge, { backgroundColor: c.error + '12' }]}>
                    <MaterialCommunityIcons name="logout" size={12} color={c.error} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.error }}>{fmt(pair?.checkOut)}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{statusLabel}</Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // ── Monthly Summary tab ────────────────────────────────────────────────────
  const renderSummary = () => (
    <FlatList
      data={summaryData}
      keyExtractor={i => String(i.employeeId)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={summaryLoading} onRefresh={fetchSummary} colors={[c.primary]} />}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <PickerField label="Month" value={MONTHS[Number(month) - 1]} options={MONTHS}
                onSelect={v => setMonth(String(MONTHS.indexOf(v) + 1))} />
            </View>
            <View style={{ flex: 1 }}>
              <PickerField label="Year" value={year} options={years} onSelect={setYear} />
            </View>
          </View>
          {totalDays > 0 && (
            <View style={[styles.summaryHeader, { backgroundColor: c.primary + '10' }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.primary }}>Total working days: {totalDays}</Text>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={<EmptyState loading={summaryLoading} message="No summary data" icon="📊" />}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const pct = totalDays > 0 ? Math.round((item.presentDays / totalDays) * 100) : 0;
        const pctColor = pct >= 80 ? c.success : pct >= 60 ? c.warning : c.error;
        return (
          <View style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
            <View style={styles.cardInner}>
              <LinearGradient colors={[pctColor + '20', pctColor + '08']} style={styles.cardIcon}>
                <MaterialCommunityIcons name="calendar-month-outline" size={22} color={pctColor} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.employeeName}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View style={[styles.countBadge, { backgroundColor: c.success + '12' }]}>
                    <MaterialCommunityIcons name="check" size={12} color={c.success} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.success }}>{item.presentDays}</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: c.error + '12' }]}>
                    <MaterialCommunityIcons name="close" size={12} color={c.error} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.error }}>{item.absentDays}</Text>
                  </View>
                  {item.leaveDays > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: c.warning + '12' }]}>
                      <MaterialCommunityIcons name="calendar-remove-outline" size={12} color={c.warning} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: c.warning }}>{item.leaveDays}</Text>
                    </View>
                  )}
                  <View style={[styles.countBadge, { backgroundColor: pctColor + '12' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: pctColor }}>{pct}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // ── Records tab ────────────────────────────────────────────────────────────
  const renderRecords = () => (
    <FlatList
      data={records}
      keyExtractor={i => String(i.id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={recordsLoading} onRefresh={fetchRecords} colors={[c.primary]} />}
      ListHeaderComponent={
        <View style={{ gap: 8, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {years.map(y => (
              <Chip key={y} selected={yearFilter === y} showSelectedCheck={false} onPress={() => setYearFilter(y)}
                style={{ backgroundColor: yearFilter === y ? c.primary : c.surfaceVariant, borderRadius: 20 }}
                textStyle={{ color: yearFilter === y ? '#fff' : c.onSurface, fontWeight: '600', fontSize: 13 }}>
                {y}
              </Chip>
            ))}
          </View>
          {monthFilter ? (
            <Chip icon="calendar" onClose={() => setMonthFilter('')}
              style={[styles.filterChip, { backgroundColor: c.primary + '12' }]}
              textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>
              {monthFilter}
            </Chip>
          ) : null}
        </View>
      }
      ListEmptyComponent={<EmptyState loading={recordsLoading} message="No attendance records" icon="📋" />}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const present = Number(item.presentDays || 0);
        const absent = Number(item.absentDays || 0);
        const total = present + absent;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        const pctColor = pct >= 80 ? c.success : pct >= 60 ? c.warning : c.error;
        return (
          <TouchableRipple onPress={() => navigation.navigate('AttendanceForm', { record: item })}
            style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]} borderless>
            <View style={styles.cardInner}>
              <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.cardIcon}>
                <MaterialCommunityIcons name="calendar-check-outline" size={22} color={c.primary} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: c.onSurface }]}>{item.Employee?.fullName || item.employeeName || 'Employee'}</Text>
                <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]}>{item.month} {item.year}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <View style={[styles.countBadge, { backgroundColor: c.success + '12' }]}>
                    <MaterialCommunityIcons name="check" size={12} color={c.success} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.success }}>{present}</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: c.error + '12' }]}>
                    <MaterialCommunityIcons name="close" size={12} color={c.error} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.error }}>{absent}</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: pctColor + '12' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: pctColor }}>{pct}%</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionsCol}>
                <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('AttendanceForm', { record: item })} style={styles.actionBtn} />
                <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
              </View>
            </View>
          </TouchableRipple>
        );
      }}
    />
  );

  return (
    <ScreenWrapper title="Attendance" navigation={navigation}
      actions={
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="calendar-remove-outline" iconColor={c.onSurface} onPress={() => setLeaveDialog(true)} />
          <IconButton icon="clock-outline" iconColor={c.onSurface} onPress={() => setWorkDialog(true)} />
        </View>
      }
      fab={tab === 2 ? <FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('AttendanceForm')} /> : null}>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: c.surfaceVariant }]}>
        {TABS.map((t, i) => (
          <TouchableRipple key={t} borderless style={[styles.tabItem, tab === i && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(i)}>
            <Text style={{ fontSize: 13, fontWeight: tab === i ? '700' : '500', color: tab === i ? c.primary : c.onSurfaceVariant }}>{t}</Text>
          </TouchableRipple>
        ))}
      </View>

      {tab === 0 && renderToday()}
      {tab === 1 && renderSummary()}
      {tab === 2 && renderRecords()}

      <ConfirmDialog visible={!!deleteId} title="Delete Record" message="Delete this attendance record?" onConfirm={handleDeleteRecord} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />

      {/* Leave dialog */}
      <Portal>
        <Dialog visible={leaveDialog} onDismiss={() => setLeaveDialog(false)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Add Leave</Dialog.Title>
          <Dialog.Content>
            <PickerField label="Employee *" value={leaveForm.employeeId ? empOptions.find(o => o.value === leaveForm.employeeId)?.label : ''}
              options={empOptions.map(o => o.label)}
              onSelect={v => { const opt = empOptions.find(o => o.label === v); if (opt) setLeaveForm(p => ({ ...p, employeeId: opt.value })); }} />
            <FormField label="Start Date *" value={leaveForm.startDate} onChangeText={v => setLeaveForm(p => ({ ...p, startDate: v }))} placeholder="YYYY-MM-DD" />
            <FormField label="End Date *" value={leaveForm.endDate} onChangeText={v => setLeaveForm(p => ({ ...p, endDate: v }))} placeholder="YYYY-MM-DD" />
            <PickerField label="Leave Type" value={leaveForm.leaveType} options={LEAVE_TYPES} onSelect={v => setLeaveForm(p => ({ ...p, leaveType: v }))} />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setLeaveDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSubmitLeave} loading={leaveSaving}>Add Leave</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Work hours dialog */}
      <Portal>
        <Dialog visible={workDialog} onDismiss={() => setWorkDialog(false)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={styles.dialogTitle}>Work Hours Settings</Dialog.Title>
          <Dialog.Content>
            <FormField label="Start Time (HH:MM)" value={workHours.start} onChangeText={v => setWorkHours(p => ({ ...p, start: v }))} placeholder="08:00" />
            <FormField label="End Time (HH:MM)" value={workHours.end} onChangeText={v => setWorkHours(p => ({ ...p, end: v }))} placeholder="17:00" />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setWorkDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSaveWorkHours} loading={workSaving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'transparent' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  summaryHeader: { borderRadius: 12, padding: 10, alignItems: 'center' },
  list: { padding: 16, paddingTop: 10, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  actionsCol: { marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
  dialog: { borderRadius: 24 },
  dialogTitle: { fontWeight: '700', fontSize: 18 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
});
