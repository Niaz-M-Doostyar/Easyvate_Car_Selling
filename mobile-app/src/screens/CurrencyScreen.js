import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert } from 'react-native';
import { Text, Button, Divider, RadioButton, IconButton, TouchableRipple } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/constants';
import apiClient from '../api/client';

const CURRENCIES = ['AFN', 'USD', 'PKR', 'AED'];
const RATE_COLORS = { 
  'USD → AFN': '#3b82f6', 
  'PKR → AFN': '#10b981', 
  'AED → AFN': '#8b5cf6',
  'USD → PKR': '#f59e0b',
  'AED → PKR': '#e65100'
};

export default function CurrencyScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [rates, setRates] = useState({});
  const [dbRates, setDbRates] = useState({ USD: '', PKR: '', AED: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('AFN');
  const [amount, setAmount] = useState('');
  const [exchangeRateInput, setExchangeRateInput] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [exchanging, setExchanging] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, hRes, sRes] = await Promise.all([
        apiClient.get('/currency/rates'),
        apiClient.get('/currency/exchanges').catch(() => ({ data: { data: [] } })),
        apiClient.get('/currency/settings').catch(() => ({ data: { data: [] } })),
      ]);
      setRates(rRes.data?.data || rRes.data || {});
      setHistory(Array.isArray(hRes.data?.data) ? hRes.data.data : Array.isArray(hRes.data) ? hRes.data : []);
      
      const dbSettings = sRes.data?.data || sRes.data || [];
      const updatedDbRates = { USD: '', PKR: '', AED: '' };
      dbSettings.forEach(s => {
        if (updatedDbRates[s.currency] !== undefined) {
          updatedDbRates[s.currency] = String(s.rateToAFN || '');
        }
      });
      setDbRates(updatedDbRates);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  useEffect(() => {
    const key = `${fromCurrency}-${toCurrency}`;
    if (rates[key]) {
      setExchangeRateInput(String(rates[key]));
    } else {
      setExchangeRateInput('');
    }
    setResult(null);
  }, [fromCurrency, toCurrency, rates]);

  const handleSwap = () => { 
    setFromCurrency(toCurrency); 
    setToCurrency(fromCurrency); 
    setResult(null); 
  };

  const handleExchange = async () => {
    if (!amount || Number(amount) <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    if (!exchangeRateInput || Number(exchangeRateInput) <= 0) { Alert.alert('Error', 'Enter a valid exchange rate'); return; }
    setExchanging(true);
    try {
      const { data } = await apiClient.post('/currency/exchange', { 
        fromCurrency, 
        toCurrency, 
        fromAmount: Number(amount),
        exchangeRate: Number(exchangeRateInput),
        notes,
      });
      setResult(data?.data || data);
      setNotes('');
      fetch();
    } catch (e) { 
      Alert.alert('Error', e.response?.data?.error?.message || e.response?.data?.error || 'Exchange failed'); 
    }
    setExchanging(false);
  };

  const handleSaveRates = async () => {
    setSaving(true);
    try {
      await Promise.all([
        apiClient.put('/currency/settings/USD', { rateToAFN: Number(dbRates.USD) }),
        apiClient.put('/currency/settings/PKR', { rateToAFN: Number(dbRates.PKR) }),
        apiClient.put('/currency/settings/AED', { rateToAFN: Number(dbRates.AED) }),
      ]);
      Alert.alert('Success', 'Rates updated successfully!');
      fetch();
    } catch (e) { 
      Alert.alert('Error', e.response?.data?.error?.message || e.response?.data?.error || 'Failed to save rates'); 
    }
    setSaving(false);
  };

  const handleDeleteExchange = async (id) => {
    try {
      await apiClient.delete(`/currency/exchanges/${id}`);
      setHistory(p => p.filter(h => h.id !== id));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const rateCards = [
    { label: 'USD → AFN', value: rates['USD-AFN'], color: RATE_COLORS['USD → AFN'], icon: 'currency-usd' },
    { label: 'PKR → AFN', value: rates['PKR-AFN'], color: RATE_COLORS['PKR → AFN'], icon: 'currency-rupee' },
    { label: 'AED → AFN', value: rates['AED-AFN'], color: RATE_COLORS['AED → AFN'], icon: 'currency-usd' },
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
              <Text style={{ fontWeight: '800', color: rc.color, fontSize: 15 }}>
                {rc.value ? Number(rc.value).toFixed(4) : '...'}
              </Text>
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
                    <Text style={{ fontWeight: '600', color: fromCurrency === cur ? c.primary : c.onSurface, fontSize: 13 }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
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
                    <Text style={{ fontWeight: '600', color: toCurrency === cur ? c.primary : c.onSurface, fontSize: 13 }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </RadioButton.Group>

          <FormField label={`Amount (${fromCurrency})`} value={amount} onChangeText={v => { setAmount(v); setResult(null); }} keyboardType="numeric" />
          <FormField label="Exchange Rate" value={exchangeRateInput} onChangeText={v => { setExchangeRateInput(v); setResult(null); }} keyboardType="numeric" />
          <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} />

          {result && (
            <View style={[styles.resultCard, { backgroundColor: c.success + '10' }, paperTheme.shadows?.sm]}>
              <Text style={{ color: c.success, fontSize: 12 }}>{CURRENCY_SYMBOLS[fromCurrency]} {Number(amount).toLocaleString()} =</Text>
              <Text style={{ fontWeight: '800', color: c.success, fontSize: 24 }}>
                {CURRENCY_SYMBOLS[toCurrency]} {Number(result.toAmount || 0).toLocaleString()}
              </Text>
              <Text style={{ color: c.success, fontSize: 11, fontWeight: '500' }}>Rate: {result.exchangeRate || '—'}</Text>
            </View>
          )}

          <Button mode="contained" onPress={handleExchange} loading={exchanging} disabled={exchanging || !amount || !exchangeRateInput}
            style={styles.actionButton} labelStyle={{ fontWeight: '700' }}>Exchange</Button>
        </View>

        {/* Rate Settings */}
        <View style={[styles.card, { backgroundColor: c.card, marginTop: 12 }, paperTheme.shadows?.sm]}>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>Rate Settings (to AFN)</Text>
          <FormField label="USD to AFN" value={dbRates.USD} onChangeText={v => setDbRates(p => ({ ...p, USD: v }))} keyboardType="numeric" />
          <FormField label="PKR to AFN" value={dbRates.PKR} onChangeText={v => setDbRates(p => ({ ...p, PKR: v }))} keyboardType="numeric" />
          <FormField label="AED to AFN" value={dbRates.AED} onChangeText={v => setDbRates(p => ({ ...p, AED: v }))} keyboardType="numeric" />
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
                    <Text style={{ fontWeight: '700', color: c.onSurface, fontSize: 13 }}>
                      {CURRENCY_SYMBOLS[h.fromCurrency]} {Number(h.fromAmount || 0).toLocaleString()} → {CURRENCY_SYMBOLS[h.toCurrency]} {Number(h.toAmount || 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: c.onSurfaceVariant, fontSize: 11 }}>Rate: {h.exchangeRate} • {h.date || h.createdAt ? new Date(h.date || h.createdAt).toLocaleDateString() : ''}</Text>
                    {h.notes ? <Text style={{ color: c.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>{h.notes}</Text> : null}
                  </View>
                  <IconButton icon="trash-can-outline" size={16} iconColor={c.error} onPress={() => handleDeleteExchange(h.id)} style={{ margin: 0, width: 30, height: 30 }} />
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
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, letterSpacing: -0.3 },
  rateRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rateCard: { flex: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
  rateIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, padding: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, letterSpacing: -0.2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  radioRow: { flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  radioOption: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingRight: 10, paddingVertical: 1 },
  swapBtn: { borderRadius: 12 },
  resultCard: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
  actionButton: { marginTop: 12, borderRadius: 14, height: 48, justifyContent: 'center' },
  histCard: { borderRadius: 14, marginBottom: 8, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  histInner: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  histIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
