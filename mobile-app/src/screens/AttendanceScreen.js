import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, IconButton, Menu, Chip, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
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
    const pctColor = pct >= 80 ? c.success : pct >= 60 ? c.warning : c.error;

    return (
      <TouchableRipple
        onPress={() => navigation.navigate('AttendanceForm', { record: item })}
        style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
        borderless
      >
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
      {monthFilter ? <View style={{ paddingLeft: 16, paddingBottom: 6 }}><Chip icon="calendar" onClose={() => setMonthFilter('')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{monthFilter}</Chip></View> : null}

      <FlatList data={records} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No attendance records" icon="📋" />}
        showsVerticalScrollIndicator={false} />
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
          style={{ backgroundColor: selected === item ? colors.primary : colors.surfaceVariant, borderRadius: 20 }}
          textStyle={{ color: selected === item ? '#fff' : colors.onSurface, fontWeight: '600', fontSize: 13 }}>
          {item}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 6, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  actionsCol: { marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
