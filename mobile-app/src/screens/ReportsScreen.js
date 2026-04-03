import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, TouchableRipple, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

const REPORT_TYPES = [
  { key: 'sales', label: 'Sales Report', icon: 'chart-bar', color: '#3b82f6', endpoint: '/reports/sales' },
  { key: 'vehicles', label: 'Vehicle Inventory', icon: 'car-side', color: '#8b5cf6', endpoint: '/reports/vehicles' },
  { key: 'financial', label: 'Financial Overview', icon: 'bank-outline', color: '#1e40af', endpoint: '/reports/financial' },
  { key: 'profit-loss', label: 'Profit & Loss', icon: 'chart-timeline-variant-shimmer', color: '#f59e0b', endpoint: '/reports/profit-loss' },
  { key: 'customer-transactions', label: 'Customer Transactions', icon: 'account-group-outline', color: '#06b6d4', endpoint: '/reports/customer-transactions' },
  { key: 'commission', label: 'Commission Report', icon: 'diamond-stone', color: '#ec4899', endpoint: '/reports/commission' },
  { key: 'daily', label: 'Daily Report', icon: 'clipboard-text-outline', color: '#10b981', endpoint: '/reports/daily' },
  { key: 'monthly', label: 'Monthly Report', icon: 'calendar-month-outline', color: '#78716c', endpoint: '/reports/monthly' },
  { key: 'yearly', label: 'Yearly Report', icon: 'calendar-star', color: '#ef4444', endpoint: '/reports/yearly' },
  { key: 'balance-breakdown', label: 'Balance Breakdown', icon: 'wallet-outline', color: '#059669', endpoint: '/reports/balance-breakdown' },
];

export default function ReportsScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [selected, setSelected] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReport = async (report) => {
    setSelected(report);
    setLoading(true);
    setReportData(null);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await apiClient.get(report.endpoint, { params });
      setReportData(data);
    } catch (e) {
      setReportData({ error: typeof e.response?.data?.error === 'string' ? e.response.data.error : e.response?.data?.error?.message || e.message || 'Failed to load report' });
    }
    setLoading(false);
  };

  const renderReportGrid = () => (
    <View style={{ gap: 12 }}>
      {/* Date filters */}
      <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.sectionIcon}>
            <MaterialCommunityIcons name="calendar-range" size={18} color={c.primary} />
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Date Range (Optional)</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><FormField label="From" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /></View>
          <View style={{ flex: 1 }}><FormField label="To" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /></View>
        </View>
      </View>

      <View style={styles.grid}>
        {REPORT_TYPES.map(r => (
          <TouchableRipple key={r.key} borderless style={[styles.reportCard, { backgroundColor: c.card }, paperTheme.shadows?.sm]} onPress={() => loadReport(r)}>
            <View style={styles.reportCardInner}>
              <LinearGradient colors={[r.color + '22', r.color + '08']} style={styles.reportIcon}>
                <MaterialCommunityIcons name={r.icon} size={24} color={r.color} />
              </LinearGradient>
              <Text style={{ fontSize: 12, fontWeight: '700', color: r.color, textAlign: 'center', marginTop: 8, letterSpacing: -0.1 }}>{r.label}</Text>
            </View>
          </TouchableRipple>
        ))}
      </View>
    </View>
  );

  const renderReportData = () => {
    if (!reportData) return null;
    if (reportData.error) {
      return (
        <View style={[styles.section, { backgroundColor: c.error + '10' }, paperTheme.shadows?.sm]}>
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <LinearGradient colors={[c.error + '20', c.error + '08']} style={styles.errorCircle}>
              <MaterialCommunityIcons name="alert-circle-outline" size={28} color={c.error} />
            </LinearGradient>
            <Text style={{ color: c.error, marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{reportData.error}</Text>
          </View>
        </View>
      );
    }

    const data = reportData.report || reportData.summary || reportData;

    if (typeof data === 'object' && !Array.isArray(data)) {
      const skipKeys = ['success', 'error', 'statusCode', 'timestamp'];
      const entries = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && (typeof v !== 'object' || v === null));
      const nested = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && typeof v === 'object' && v !== null && !Array.isArray(v));
      const arrays = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && Array.isArray(v));

      return (
        <View style={{ gap: 12 }}>
          {entries.length > 0 && (
            <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <Text style={[styles.sectionTitle, { color: c.onSurface, marginBottom: 10 }]}>Summary</Text>
              {entries.map(([k, v], i) => (
                <View key={k}>
                  <View style={styles.fieldRow}>
                    <Text style={{ fontSize: 13, color: c.onSurfaceVariant, flex: 1 }}>{formatLabel(k)}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.onSurface }}>{formatValue(v)}</Text>
                  </View>
                  {i < entries.length - 1 && <View style={[styles.divider, { backgroundColor: c.border }]} />}
                </View>
              ))}
            </View>
          )}

          {nested.map(([k, v]) => (
            <View key={k} style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <Text style={[styles.sectionTitle, { color: c.onSurface, marginBottom: 10 }]}>{formatLabel(k)}</Text>
              {Object.entries(v).filter(([, val]) => typeof val !== 'object').map(([nk, nv]) => (
                <View key={nk} style={styles.fieldRow}>
                  <Text style={{ fontSize: 13, color: c.onSurfaceVariant, flex: 1 }}>{formatLabel(nk)}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.onSurface }}>{formatValue(nv)}</Text>
                </View>
              ))}
            </View>
          ))}

          {arrays.map(([k, arr]) => arr.length > 0 && (
            <View key={k} style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.sectionTitle, { color: c.onSurface, flex: 1 }]}>{formatLabel(k)}</Text>
                <View style={[styles.countBadge, { backgroundColor: c.primary + '15' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c.primary }}>{arr.length}</Text>
                </View>
              </View>
              {arr.slice(0, 20).map((row, i) => (
                <View key={i}>
                  <View style={[styles.fieldRow, { paddingVertical: 8 }]}>
                    <Text style={{ color: c.onSurface, flex: 1, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
                      {row.name || row.fullName || row.personName || row.saleId || row.manufacturer || `#${i + 1}`}
                    </Text>
                    <Text style={{ fontWeight: '700', color: c.primary, fontSize: 13 }}>
                      {formatValue(row.amount || row.total || row.profit || row.salary || row.count || row.balance || '')}
                    </Text>
                  </View>
                  {i < Math.min(arr.length, 20) - 1 && <View style={[styles.divider, { backgroundColor: c.border }]} />}
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }

    return <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', fontSize: 14 }}>No data available</Text>;
  };

  return (
    <ScreenWrapper title="Reports" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!selected ? renderReportGrid() : (
          <View style={{ gap: 12 }}>
            {/* Report header */}
            <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableRipple borderless onPress={() => { setSelected(null); setReportData(null); }} style={styles.backBtn}>
                  <MaterialCommunityIcons name="arrow-left" size={20} color={c.onSurface} />
                </TouchableRipple>
                <LinearGradient colors={[selected.color + '22', selected.color + '08']} style={styles.headerIcon}>
                  <MaterialCommunityIcons name={selected.icon} size={20} color={selected.color} />
                </LinearGradient>
                <Text style={{ fontSize: 16, fontWeight: '700', color: selected.color, flex: 1 }}>{selected.label}</Text>
                <IconButton icon="refresh" size={20} iconColor={c.onSurfaceVariant} onPress={() => loadReport(selected)} style={{ margin: 0, width: 36, height: 36 }} />
              </View>
            </View>
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text style={{ color: c.onSurfaceVariant, marginTop: 12, fontSize: 14 }}>Loading report...</Text>
              </View>
            ) : renderReportData()}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ');
}

function formatValue(val) {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'number') {
    if (val > 1000) return formatCurrency(val);
    return val.toLocaleString();
  }
  return String(val);
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  section: { borderRadius: 16, padding: 16, overflow: 'hidden' },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  reportCardInner: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 10 },
  reportIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  errorCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { height: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
});
