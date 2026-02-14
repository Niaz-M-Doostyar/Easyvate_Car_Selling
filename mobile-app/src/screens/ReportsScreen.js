import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

const REPORT_TYPES = [
  { key: 'sales', label: 'Sales Report', icon: '📊', color: '#1565c0', endpoint: '/reports/sales' },
  { key: 'vehicles', label: 'Vehicle Inventory', icon: '🚗', color: '#6a1b9a', endpoint: '/reports/vehicles' },
  { key: 'financial', label: 'Financial Overview', icon: '🏦', color: '#283593', endpoint: '/reports/financial' },
  { key: 'profit-loss', label: 'Profit & Loss', icon: '📈', color: '#e65100', endpoint: '/reports/profit-loss' },
  { key: 'customer-transactions', label: 'Customer Transactions', icon: '👥', color: '#00838f', endpoint: '/reports/customer-transactions' },
  { key: 'commission', label: 'Commission Report', icon: '💎', color: '#ad1457', endpoint: '/reports/commission' },
  { key: 'daily', label: 'Daily Report', icon: '📋', color: '#2e7d32', endpoint: '/reports/daily' },
  { key: 'monthly', label: 'Monthly Report', icon: '📅', color: '#4e342e', endpoint: '/reports/monthly' },
  { key: 'yearly', label: 'Yearly Report', icon: '📆', color: '#bf360c', endpoint: '/reports/yearly' },
  { key: 'balance-breakdown', label: 'Balance Breakdown', icon: '💰', color: '#1b5e20', endpoint: '/reports/balance-breakdown' },
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
      // Keep the full response structure (may include data, summary, etc.)
      setReportData(data);
    } catch (e) {
      console.log(e.message);
      setReportData({ error: typeof e.response?.data?.error === 'string' ? e.response.data.error : e.response?.data?.error?.message || e.message || 'Failed to load report' });
    }
    setLoading(false);
  };

  const renderReportGrid = () => (
    <View style={{ gap: 10 }}>
      {/* Date filters */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>Date Range (Optional)</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><FormField label="From" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><FormField label="To" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /></View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.grid}>
        {REPORT_TYPES.map(r => (
          <Card key={r.key} style={[styles.reportCard, { backgroundColor: r.color + '12' }]}
            onPress={() => loadReport(r)}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ fontSize: 28 }}>{r.icon}</Text>
              <Text variant="bodySmall" style={{ fontWeight: '700', color: r.color, textAlign: 'center', marginTop: 6 }}>{r.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderReportData = () => {
    if (!reportData) return null;
    if (reportData.error) {
      return (
        <Card style={[styles.card, { backgroundColor: '#ffebee' }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 32 }}>⚠️</Text>
            <Text variant="bodyMedium" style={{ color: '#c62828', marginTop: 8 }}>{reportData.error}</Text>
          </Card.Content>
        </Card>
      );
    }

    // Render different formats based on data structure
    const data = reportData.report || reportData.summary || reportData;

    // Key-value pairs (skip internal keys like 'success')
    if (typeof data === 'object' && !Array.isArray(data)) {
      const skipKeys = ['success', 'error', 'statusCode', 'timestamp'];
      const entries = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && (typeof v !== 'object' || v === null));
      const nested = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && typeof v === 'object' && v !== null && !Array.isArray(v));
      const arrays = Object.entries(data).filter(([k, v]) => !skipKeys.includes(k) && Array.isArray(v));

      return (
        <View style={{ gap: 12 }}>
          {/* Summary KPIs */}
          {entries.length > 0 && (
            <Card style={[styles.card, { backgroundColor: c.surface }]}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>Summary</Text>
                {entries.map(([k, v], i) => (
                  <View key={k}>
                    <View style={styles.fieldRow}>
                      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, flex: 1 }}>{formatLabel(k)}</Text>
                      <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>{formatValue(v)}</Text>
                    </View>
                    {i < entries.length - 1 && <Divider style={{ marginVertical: 2 }} />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Nested objects */}
          {nested.map(([k, v]) => (
            <Card key={k} style={[styles.card, { backgroundColor: c.surface }]}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>{formatLabel(k)}</Text>
                {Object.entries(v).filter(([, val]) => typeof val !== 'object').map(([nk, nv], i) => (
                  <View key={nk} style={styles.fieldRow}>
                    <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, flex: 1 }}>{formatLabel(nk)}</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>{formatValue(nv)}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}

          {/* Arrays as tables */}
          {arrays.map(([k, arr]) => arr.length > 0 && (
            <Card key={k} style={[styles.card, { backgroundColor: c.surface }]}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>{formatLabel(k)} ({arr.length})</Text>
                {arr.slice(0, 20).map((row, i) => (
                  <View key={i}>
                    <View style={[styles.fieldRow, { paddingVertical: 4 }]}>
                      <Text variant="bodySmall" style={{ color: c.onSurface, flex: 1 }} numberOfLines={1}>
                        {row.name || row.fullName || row.personName || row.saleId || row.manufacturer || `#${i + 1}`}
                      </Text>
                      <Text variant="bodySmall" style={{ fontWeight: '600', color: c.primary }}>
                        {formatValue(row.amount || row.total || row.profit || row.salary || row.count || row.balance || '')}
                      </Text>
                    </View>
                    {i < Math.min(arr.length, 20) - 1 && <Divider />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
        </View>
      );
    }

    return <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>No data available</Text>;
  };

  return (
    <ScreenWrapper title="Reports" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!selected ? renderReportGrid() : (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Button icon="arrow-left" onPress={() => { setSelected(null); setReportData(null); }}>Back</Button>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: selected.color, flex: 1 }}>{selected.icon} {selected.label}</Text>
              <Button onPress={() => loadReport(selected)}>Refresh</Button>
            </View>
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={c.primary} />
                <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, marginTop: 12 }}>Loading report...</Text>
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
  card: { borderRadius: 12, elevation: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportCard: { width: '47%', borderRadius: 12, elevation: 0 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
});
