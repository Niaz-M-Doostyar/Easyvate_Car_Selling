import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Text, IconButton, Menu, Chip, SegmentedButtons } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { MONTHS } from '../utils/constants';
import apiClient from '../api/client';

export default function AttendanceScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (monthFilter) params.month = monthFilter;
      if (yearFilter) params.year = yearFilter;
      const { data } = await apiClient.get('/attendance', { params });
      setRecords(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, [monthFilter, yearFilter]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);
  useEffect(() => { fetch(); }, [monthFilter, yearFilter]);

  const handleDelete = async () => {
    try { await apiClient.delete(`/attendance/${deleteId}`); setRecords(p => p.filter(x => x.id !== deleteId)); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setDeleteId(null);
  };

  const renderItem = ({ item }) => {
    const present = Number(item.presentDays || 0);
    const absent = Number(item.absentDays || 0);
    const total = present + absent;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
      <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated"
        onPress={() => navigation.navigate('AttendanceForm', { record: item })}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>{item.Employee?.fullName || item.employeeName || 'Employee'}</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{item.month} {item.year}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip style={{ backgroundColor: '#e8f5e9' }} textStyle={{ fontSize: 11, color: '#2e7d32', fontWeight: '700' }}>✓ {present}</Chip>
                <Chip style={{ backgroundColor: '#ffebee' }} textStyle={{ fontSize: 11, color: '#c62828', fontWeight: '700' }}>✕ {absent}</Chip>
              </View>
              <Text variant="bodySmall" style={{ color: pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336', fontWeight: '700', marginTop: 4 }}>{pct}% attendance</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: -4 }}>
            <IconButton icon="pencil" size={18} onPress={() => navigation.navigate('AttendanceForm', { record: item })} />
            <IconButton icon="delete" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <ScreenWrapper title="Attendance" navigation={navigation}
      actions={
        <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="calendar-filter" onPress={() => setMenuVisible(true)} />}>
          <Menu.Item title="All Months" onPress={() => { setMonthFilter(''); setMenuVisible(false); }} />
          {MONTHS.map(m => <Menu.Item key={m} title={m} onPress={() => { setMonthFilter(m); setMenuVisible(false); }} />)}
        </Menu>
      }
      fab={<FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff" onPress={() => navigation.navigate('AttendanceForm')} />}>

      <View style={styles.filterRow}>
        <ScrollableChips items={years} selected={yearFilter} onSelect={setYearFilter} colors={c} />
      </View>
      {monthFilter ? <View style={{ paddingLeft: 16, paddingBottom: 8 }}><Chip icon="calendar" onClose={() => setMonthFilter('')}>{monthFilter}</Chip></View> : null}

      <FlatList data={records} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No attendance records" icon="📋" />} />
      <ConfirmDialog visible={!!deleteId} title="Delete Record" message="Delete this attendance record?" onConfirm={handleDelete} onDismiss={() => setDeleteId(null)} confirmLabel="Delete" destructive />
    </ScreenWrapper>
  );
}

function ScrollableChips({ items, selected, onSelect, colors }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {items.map(item => (
        <Chip key={item} selected={selected === item} showSelectedCheck={false}
          onPress={() => onSelect(item)}
          style={{ backgroundColor: selected === item ? colors.primary : colors.surfaceVariant }}
          textStyle={{ color: selected === item ? '#fff' : colors.onSurface, fontWeight: '600' }}>
          {item}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
