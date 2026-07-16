import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, ActivityIndicator, TouchableRipple, IconButton } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { CURRENCIES, formatCurrency } from '../utils/constants';
import apiClient from '../api/client';
import ResponsiveAmount from '../components/ResponsiveAmount';
import { toAFN, fromAFN } from '../utils/currency';
import { useLanguage } from '../contexts/LanguageContext';

const REPORT_TYPES = [
  { key: 'sales', label: 'Sales Report', icon: 'chart-bar', color: '#3b82f6', endpoint: '/reports/sales' },
  { key: 'vehicles', label: 'Vehicle Inventory', icon: 'car-side', color: '#8b5cf6', endpoint: '/reports/vehicles' },
  { key: 'financial', label: 'Financial Overview', icon: 'bank-outline', color: '#1e40af', endpoint: '/reports/financial' },
  { key: 'profit-loss', label: 'Profit & Loss', icon: 'chart-timeline-variant-shimmer', color: '#f59e0b', endpoint: '/reports/profit-loss' },
  { key: 'partnerships', label: 'Partnerships Report', icon: 'handshake-outline', color: '#7c3aed', endpoint: '/reports/partnerships' },
  { key: 'daily', label: 'Daily Report', icon: 'clipboard-text-outline', color: '#10b981', endpoint: '/reports/daily' },
  { key: 'monthly', label: 'Monthly Report', icon: 'calendar-month-outline', color: '#78716c', endpoint: '/reports/monthly' },
  { key: 'yearly', label: 'Yearly Report', icon: 'calendar-star', color: '#ef4444', endpoint: '/reports/yearly' },
];

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

const DATE_RANGE_REPORTS = ['sales', 'financial', 'profit-loss', 'partnerships', 'vehicles'];
const DAILY_REPORTS = ['daily'];
const MONTHLY_REPORTS = ['monthly'];
const YEARLY_REPORTS = ['yearly'];

function getPeriodDates(period) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (period === 'today') { const t = fmt(now); return { startDate: t, endDate: t }; }
  if (period === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    return { startDate: fmt(start), endDate: fmt(now) };
  }
  if (period === 'month') {
    return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: fmt(now) };
  }
  if (period === 'quarter') {
    const startMonth = Math.floor(now.getMonth() / 3) * 3;
    return { startDate: fmt(new Date(now.getFullYear(), startMonth, 1)), endDate: fmt(new Date(now.getFullYear(), startMonth + 3, 0)) };
  }
  if (period === 'year') {
    return { startDate: fmt(new Date(now.getFullYear(), 0, 1)), endDate: fmt(now) };
  }
  return {};
}

export default function ReportsScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const { isRTL } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyDate, setDailyDate] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; });
  const [monthlyYear, setMonthlyYear] = useState(String(new Date().getFullYear()));
  const [yearlyStart, setYearlyStart] = useState(String(new Date().getFullYear() - 2));
  const [yearlyEnd, setYearlyEnd] = useState(String(new Date().getFullYear()));
  const [displayCurrency, setDisplayCurrency] = useState('AFN');
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    apiClient.get('/currency/rates')
      .then(({ data }) => setExchangeRates(data?.data || data || {}))
      .catch(() => setExchangeRates({}));
  }, []);

  // Report summaries are normalised to AFN by the backend. Individual rows may
  // retain their original currency, so normalise them first before converting
  // to the currency selected by the user.
  const formatConverted = (amount, sourceCurrency = 'AFN') =>
    formatCurrency(fromAFN(toAFN(amount, sourceCurrency, exchangeRates), displayCurrency, exchangeRates), displayCurrency);

  const isAmountField = (key) => /amount|price|cost|revenue|income|expense|profit|commission|capital|balance|cash|salary|payment|withdrawal/i.test(key)
    && !/count|percentage|margin|year|month|id/i.test(key);

  const formatReportValue = (value, key, sourceCurrency = 'AFN') => {
    if (value === null || value === undefined) return '-';
    const numericValue = Number(value);
    if (isAmountField(key) && value !== '' && Number.isFinite(numericValue)) return formatConverted(numericValue, sourceCurrency);
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const getRowAmount = (row) => {
    if (row.amountInPKR !== undefined && row.amountInPKR !== null) {
      return { value: row.amountInPKR, currency: 'AFN' };
    }
    if (row.sellingPrice !== undefined && row.sellingPrice !== null) {
      return { value: row.sellingPrice, currency: row.paymentCurrency || 'AFN' };
    }
    if (row.totalCostOriginal !== undefined && row.totalCostOriginal !== null) {
      return { value: row.totalCostOriginal, currency: row.baseCurrency || 'AFN' };
    }
    const key = ['totalCapital', 'partnerInvestmentTotal', 'totalInvestment', 'totalRealizedProfit', 'realizedPartnerProfit', 'totalProfit', 'profit', 'income', 'netProfit', 'amount', 'total', 'salary', 'balance']
      .find(candidate => row[candidate] !== undefined && row[candidate] !== null);
    return key ? { value: row[key], currency: row.currency || 'AFN' } : null;
  };

  const buildParams = (report) => {
    if (DAILY_REPORTS.includes(report.key)) return { date: dailyDate };
    if (MONTHLY_REPORTS.includes(report.key)) return { year: monthlyYear };
    if (YEARLY_REPORTS.includes(report.key)) return { startYear: yearlyStart, endYear: yearlyEnd };
    if (period === 'custom') {
      const p = {};
      if (startDate) p.startDate = startDate;
      if (endDate) p.endDate = endDate;
      return p;
    }
    if (period === 'all') return {};
    return getPeriodDates(period);
  };

  const loadReport = async (report) => {
    setSelected(report);
    setLoading(true);
    setReportData(null);
    try {
      const { data } = await apiClient.get(report.endpoint, { params: buildParams(report) });
      setReportData(data);
    } catch (e) {
      setReportData({ error: typeof e.response?.data?.error === 'string' ? e.response.data.error : e.response?.data?.error?.message || e.message || 'Failed to load report' });
    }
    setLoading(false);
  };

  const renderReportGrid = () => (
      <View style={{ gap: 12 }}>
      <PickerField label="Display Currency" value={displayCurrency} options={CURRENCIES} onSelect={setDisplayCurrency} />
      {/* Period filter */}
      <View style={[styles.section, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.sectionIcon}>
            <MaterialCommunityIcons name="calendar-range" size={18} color={c.primary} />
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Period</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PERIODS.map(p => (
            <TouchableRipple key={p.key} borderless onPress={() => setPeriod(p.key)}
              style={[styles.periodChip, { backgroundColor: period === p.key ? c.primary : c.primary + '12' }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: period === p.key ? '#fff' : c.primary }}>{p.label}</Text>
            </TouchableRipple>
          ))}
        </View>
        {period === 'custom' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <View style={{ flex: 1 }}><FormField label="From" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><FormField label="To" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /></View>
          </View>
        )}
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
                    <ResponsiveAmount style={[styles.amountValue, { color: c.onSurface }]}>{formatReportValue(v, k)}</ResponsiveAmount>
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
                  <ResponsiveAmount style={[styles.amountValue, { color: c.onSurface }]}>{formatReportValue(nv, nk)}</ResponsiveAmount>
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
              {arr.slice(0, 20).map((row, i) => {
                const amount = getRowAmount(row);
                return (
                <View key={i}>
                  <View style={[styles.fieldRow, { paddingVertical: 8 }]}>
                    <Text style={{ color: c.onSurface, flex: 1, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
                      {row.name || row.fullName || row.personName || row.saleId || row.manufacturer || `#${i + 1}`}
                    </Text>
                    <ResponsiveAmount style={[styles.amountValue, { color: c.primary, fontSize: 13 }]}>
                      {amount ? formatConverted(amount.value, amount.currency) : formatReportValue(row.count || '', 'count')}
                    </ResponsiveAmount>
                  </View>
                  {i < Math.min(arr.length, 20) - 1 && <View style={[styles.divider, { backgroundColor: c.border }]} />}
                </View>
                );
              })}
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
              <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableRipple borderless onPress={() => { setSelected(null); setReportData(null); }} style={styles.backBtn}>
                  <MaterialCommunityIcons name={isRTL ? 'arrow-right' : 'arrow-left'} size={20} color={c.onSurface} />
                </TouchableRipple>
                <LinearGradient colors={[selected.color + '22', selected.color + '08']} style={styles.headerIcon}>
                  <MaterialCommunityIcons name={selected.icon} size={20} color={selected.color} />
                </LinearGradient>
                <Text style={{ fontSize: 16, fontWeight: '700', color: selected.color, flex: 1 }}>{selected.label}</Text>
                <IconButton icon="refresh" size={20} iconColor={c.onSurfaceVariant} onPress={() => loadReport(selected)} style={{ margin: 0, width: 36, height: 36 }} />
              </View>
              {DAILY_REPORTS.includes(selected.key) && (
                <View style={{ marginTop: 10 }}>
                  <FormField label="Date" value={dailyDate} onChangeText={setDailyDate} placeholder="YYYY-MM-DD" />
                </View>
              )}
              {MONTHLY_REPORTS.includes(selected.key) && (
                <View style={{ marginTop: 10 }}>
                  <FormField label="Year" value={monthlyYear} onChangeText={setMonthlyYear} placeholder="YYYY" keyboardType="numeric" />
                </View>
              )}
              {YEARLY_REPORTS.includes(selected.key) && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={{ flex: 1 }}><FormField label="Start Year" value={yearlyStart} onChangeText={setYearlyStart} placeholder="YYYY" keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><FormField label="End Year" value={yearlyEnd} onChangeText={setYearlyEnd} placeholder="YYYY" keyboardType="numeric" /></View>
                </View>
              )}
              <View style={{ marginTop: 10 }}>
                <PickerField label="Display Currency" value={displayCurrency} options={CURRENCIES} onSelect={setDisplayCurrency} />
              </View>
              {DATE_RANGE_REPORTS.includes(selected.key) && (
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {PERIODS.map(p => (
                      <TouchableRipple key={p.key} borderless onPress={() => setPeriod(p.key)}
                        style={[styles.periodChip, { backgroundColor: period === p.key ? c.primary : c.primary + '12' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: period === p.key ? '#fff' : c.primary }}>{p.label}</Text>
                      </TouchableRipple>
                    ))}
                  </View>
                  {period === 'custom' && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}><FormField label="From" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /></View>
                      <View style={{ flex: 1 }}><FormField label="To" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /></View>
                    </View>
                  )}
                </View>
              )}
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

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  section: { borderRadius: 16, padding: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportCard: { width: '47%', borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  reportCardInner: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 10 },
  reportIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  errorCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  amountValue: { maxWidth: '52%', fontSize: 14, fontWeight: '700' },
  divider: { height: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  periodChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
});
