import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Divider, RadioButton, IconButton, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/constants';
import apiClient from '../api/client';

const CURRENCIES = ['AFN', 'USD', 'PKR'];
const RATE_COLORS = { 'USD → AFN': '#3b82f6', 'PKR → AFN': '#10b981', 'USD → PKR': '#f59e0b' };

export default function CurrencyScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [rates, setRates] = useState({ usdToAfn: '', pkrToAfn: '', usdToPkr: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('AFN');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [exchanging, setExchanging] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, hRes] = await Promise.all([
        apiClient.get('/currency/rates'),
        apiClient.get('/currency/exchanges').catch(() => ({ data: { data: [] } })),
      ]);
      const r = rRes.data?.data || rRes.data?.rates || rRes.data || {};
      setRates({
        usdToAfn: String(r['USD-AFN'] || r.usdToAfn || ''),
        pkrToAfn: String(r['PKR-AFN'] || r.pkrToAfn || ''),
        usdToPkr: String(r['USD-PKR'] || r.usdToPkr || ''),
      });
      const hData = hRes.data?.data || hRes.data;
      setHistory(Array.isArray(hData) ? hData : []);
    } catch (e) {
      // ignore — show whatever data was loaded
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleSwap = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); setResult(null); };

  const handleExchange = async () => {
    if (!amount || Number(amount) <= 0) { alert('Enter a valid amount'); return; }
    setExchanging(true);
    try {
      const { data } = await apiClient.post('/currency/exchange', { fromCurrency, toCurrency, amount: Number(amount) });
      setResult(data); fetch();
    } catch (e) { alert(e.response?.data?.error || 'Exchange failed'); }
    setExchanging(false);
  };

  const handleSaveRates = async () => {
    setSaving(true);
    try {
      await apiClient.put('/currency/rates', { usdToAfn: Number(rates.usdToAfn), pkrToAfn: Number(rates.pkrToAfn), usdToPkr: Number(rates.usdToPkr) });
      alert('Rates updated!');
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const rateCards = [
    { label: 'USD → AFN', value: rates.usdToAfn, color: RATE_COLORS['USD → AFN'], icon: 'currency-usd' },
    { label: 'PKR → AFN', value: rates.pkrToAfn, color: RATE_COLORS['PKR → AFN'], icon: 'currency-rupee' },
    { label: 'USD → PKR', value: rates.usdToPkr, color: RATE_COLORS['USD → PKR'], icon: 'swap-horizontal' },
  ];

  return (
    <ScreenWrapper title="Currency Exchange" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}
        showsVerticalScrollIndicator={false}>

        {/* Rate Cards */}
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Current Rates</Text>
        <View style={styles.rateRow}>
          {rateCards.map((rc, i) => (
            <View key={i} style={[styles.rateCard, { backgroundColor: rc.color + '10' }, paperTheme.shadows?.sm]}>
              <LinearGradient colors={[rc.color + '20', rc.color + '08']} style={styles.rateIcon}>
                <MaterialCommunityIcons name={rc.icon} size={18} color={rc.color} />
              </LinearGradient>
              <Text style={{ color: rc.color, fontSize: 10, fontWeight: '600', marginTop: 6 }}>{rc.label}</Text>
              <Text style={{ fontWeight: '800', color: rc.color, fontSize: 16 }}>{rc.value || '...'}</Text>
            </View>
          ))}
        </View>

        {/* Exchange Form */}
        <View style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>Exchange Currency</Text>

          <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>From</Text>
          <RadioButton.Group value={fromCurrency} onValueChange={v => { setFromCurrency(v); setResult(null); }}>
            <View style={styles.radioRow}>
              {CURRENCIES.filter(cur => cur !== toCurrency).map(cur => (
                <TouchableRipple key={cur} onPress={() => { setFromCurrency(cur); setResult(null); }} style={[styles.radioOption, { backgroundColor: fromCurrency === cur ? c.primary + '12' : 'transparent', borderColor: fromCurrency === cur ? c.primary : c.border }]} borderless>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <RadioButton value={cur} />
                    <Text style={{ fontWeight: '600', color: fromCurrency === cur ? c.primary : c.onSurface, fontSize: 14 }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </RadioButton.Group>

          <View style={{ alignItems: 'center', marginVertical: 6 }}>
            <IconButton icon="swap-vertical" size={24} onPress={handleSwap} style={[styles.swapBtn, { backgroundColor: c.surfaceVariant }]} />
          </View>

          <Text style={[styles.fieldLabel, { color: c.onSurfaceVariant }]}>To</Text>
          <RadioButton.Group value={toCurrency} onValueChange={v => { setToCurrency(v); setResult(null); }}>
            <View style={styles.radioRow}>
              {CURRENCIES.filter(cur => cur !== fromCurrency).map(cur => (
                <TouchableRipple key={cur} onPress={() => { setToCurrency(cur); setResult(null); }} style={[styles.radioOption, { backgroundColor: toCurrency === cur ? c.primary + '12' : 'transparent', borderColor: toCurrency === cur ? c.primary : c.border }]} borderless>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <RadioButton value={cur} />
                    <Text style={{ fontWeight: '600', color: toCurrency === cur ? c.primary : c.onSurface, fontSize: 14 }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </RadioButton.Group>

          <FormField label={`Amount (${fromCurrency})`} value={amount} onChangeText={v => { setAmount(v); setResult(null); }} keyboardType="numeric" />

          {result && (
            <View style={[styles.resultCard, { backgroundColor: c.success + '10' }, paperTheme.shadows?.sm]}>
              <Text style={{ color: c.success, fontSize: 12 }}>{CURRENCY_SYMBOLS[fromCurrency]} {Number(amount).toLocaleString()} =</Text>
              <Text style={{ fontWeight: '800', color: c.success, fontSize: 26 }}>
                {CURRENCY_SYMBOLS[toCurrency]} {Number(result.convertedAmount || result.result || 0).toLocaleString()}
              </Text>
              <Text style={{ color: c.success, fontSize: 11, fontWeight: '500' }}>Rate: {result.rate || '—'}</Text>
            </View>
          )}

          <Button mode="contained" onPress={handleExchange} loading={exchanging} disabled={exchanging || !amount}
            style={styles.actionButton} labelStyle={{ fontWeight: '700' }}>Exchange</Button>
        </View>

        {/* Rate Settings */}
        <View style={[styles.card, { backgroundColor: c.card, marginTop: 12 }, paperTheme.shadows?.sm]}>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>Rate Settings</Text>
          <FormField label="USD to AFN" value={rates.usdToAfn} onChangeText={v => setRates(p => ({ ...p, usdToAfn: v }))} keyboardType="numeric" />
          <FormField label="PKR to AFN" value={rates.pkrToAfn} onChangeText={v => setRates(p => ({ ...p, pkrToAfn: v }))} keyboardType="numeric" />
          <FormField label="USD to PKR" value={rates.usdToPkr} onChangeText={v => setRates(p => ({ ...p, usdToPkr: v }))} keyboardType="numeric" />
          <Button mode="contained" onPress={handleSaveRates} loading={saving} disabled={saving}
            style={styles.actionButton} labelStyle={{ fontWeight: '700' }}>Save Rates</Button>
        </View>

        {/* Recent Exchanges */}
        {history.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Recent Exchanges</Text>
            {history.slice(0, 10).map((h, i) => (
              <View key={i} style={[styles.histCard, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
                <View style={styles.histInner}>
                  <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={styles.histIcon}>
                    <MaterialCommunityIcons name="swap-horizontal" size={16} color={c.primary} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: c.onSurface, fontSize: 14 }}>
                      {CURRENCY_SYMBOLS[h.fromCurrency]} {Number(h.amount || 0).toLocaleString()} → {CURRENCY_SYMBOLS[h.toCurrency]} {Number(h.convertedAmount || 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: c.onSurfaceVariant, fontSize: 11 }}>Rate: {h.rate} • {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10, letterSpacing: -0.3 },
  rateRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  rateCard: { flex: 1, borderRadius: 16, alignItems: 'center', paddingVertical: 14 },
  rateIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, padding: 16, overflow: 'hidden' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, letterSpacing: -0.2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  radioRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  radioOption: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, paddingRight: 12, paddingVertical: 2 },
  swapBtn: { borderRadius: 12 },
  resultCard: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
  actionButton: { marginTop: 12, borderRadius: 14, height: 48, justifyContent: 'center' },
  histCard: { borderRadius: 14, marginBottom: 8, overflow: 'hidden' },
  histInner: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  histIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
