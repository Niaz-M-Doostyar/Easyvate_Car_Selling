import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Divider, RadioButton, IconButton } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/constants';
import apiClient from '../api/client';

const CURRENCIES = ['AFN', 'USD', 'PKR'];

export default function CurrencyScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [rates, setRates] = useState({ usdToAfn: '', pkrToAfn: '', usdToPkr: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Exchange form
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
        apiClient.get('/currency').catch(() => ({ data: [] })),
      ]);
      const r = rRes.data?.rates || rRes.data || {};
      setRates({
        usdToAfn: String(r.usdToAfn || r.USD_AFN || ''),
        pkrToAfn: String(r.pkrToAfn || r.PKR_AFN || ''),
        usdToPkr: String(r.usdToPkr || r.USD_PKR || ''),
      });
      setHistory(Array.isArray(hRes.data) ? hRes.data : hRes.data?.exchanges || []);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); return unsub; }, [navigation, fetch]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleExchange = async () => {
    if (!amount || Number(amount) <= 0) { alert('Enter a valid amount'); return; }
    setExchanging(true);
    try {
      const { data } = await apiClient.post('/currency/exchange', {
        fromCurrency, toCurrency, amount: Number(amount),
      });
      setResult(data);
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Exchange failed'); }
    setExchanging(false);
  };

  const handleSaveRates = async () => {
    setSaving(true);
    try {
      await apiClient.put('/currency/rates', {
        usdToAfn: Number(rates.usdToAfn),
        pkrToAfn: Number(rates.pkrToAfn),
        usdToPkr: Number(rates.usdToPkr),
      });
      alert('Rates updated!');
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  return (
    <ScreenWrapper title="Currency Exchange" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[c.primary]} />}>

        {/* Rate Cards */}
        <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Current Rates</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Card style={[styles.rateCard, { backgroundColor: '#e3f2fd' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#1565c0' }}>USD → AFN</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#1565c0' }}>{rates.usdToAfn || '...'}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.rateCard, { backgroundColor: '#e8f5e9' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#2e7d32' }}>PKR → AFN</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#2e7d32' }}>{rates.pkrToAfn || '...'}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.rateCard, { backgroundColor: '#fff3e0' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#e65100' }}>USD → PKR</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#e65100' }}>{rates.usdToPkr || '...'}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Exchange Form */}
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Exchange Currency</Text>

            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>From</Text>
            <RadioButton.Group value={fromCurrency} onValueChange={v => { setFromCurrency(v); setResult(null); }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                {CURRENCIES.filter(cur => cur !== toCurrency).map(cur => (
                  <View key={cur} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value={cur} />
                    <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            <View style={{ alignItems: 'center', marginVertical: 4 }}>
              <IconButton icon="swap-vertical" size={24} onPress={handleSwap} style={{ backgroundColor: c.surfaceVariant }} />
            </View>

            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>To</Text>
            <RadioButton.Group value={toCurrency} onValueChange={v => { setToCurrency(v); setResult(null); }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                {CURRENCIES.filter(cur => cur !== fromCurrency).map(cur => (
                  <View key={cur} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value={cur} />
                    <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>{CURRENCY_SYMBOLS[cur]} {cur}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            <FormField label={`Amount (${fromCurrency})`} value={amount} onChangeText={v => { setAmount(v); setResult(null); }} keyboardType="numeric" />

            {result && (
              <Card style={[styles.resultCard, { backgroundColor: '#e8f5e9' }]}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text variant="bodySmall" style={{ color: '#2e7d32' }}>{CURRENCY_SYMBOLS[fromCurrency]} {Number(amount).toLocaleString()} =</Text>
                  <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#2e7d32' }}>
                    {CURRENCY_SYMBOLS[toCurrency]} {Number(result.convertedAmount || result.result || 0).toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#388e3c' }}>Rate: {result.rate || '—'}</Text>
                </Card.Content>
              </Card>
            )}

            <Button mode="contained" onPress={handleExchange} loading={exchanging} disabled={exchanging || !amount} style={{ marginTop: 12, borderRadius: 12 }}>
              Exchange
            </Button>
          </Card.Content>
        </Card>

        {/* Rate Settings */}
        <Divider style={{ marginVertical: 16 }} />
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Rate Settings</Text>
            <FormField label="USD to AFN" value={rates.usdToAfn} onChangeText={v => setRates(p => ({ ...p, usdToAfn: v }))} keyboardType="numeric" />
            <FormField label="PKR to AFN" value={rates.pkrToAfn} onChangeText={v => setRates(p => ({ ...p, pkrToAfn: v }))} keyboardType="numeric" />
            <FormField label="USD to PKR" value={rates.usdToPkr} onChangeText={v => setRates(p => ({ ...p, usdToPkr: v }))} keyboardType="numeric" />
            <Button mode="contained" onPress={handleSaveRates} loading={saving} disabled={saving} style={{ marginTop: 12, borderRadius: 12 }}>
              Save Rates
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Exchanges */}
        {history.length > 0 && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Recent Exchanges</Text>
            {history.slice(0, 10).map((h, i) => (
              <Card key={i} style={[styles.histCard, { backgroundColor: c.surface }]}>
                <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>
                      {CURRENCY_SYMBOLS[h.fromCurrency]} {Number(h.amount || 0).toLocaleString()} → {CURRENCY_SYMBOLS[h.toCurrency]} {Number(h.convertedAmount || 0).toLocaleString()}
                    </Text>
                    <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Rate: {h.rate} • {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  rateCard: { flex: 1, borderRadius: 12, elevation: 0 },
  card: { borderRadius: 12, elevation: 1 },
  resultCard: { borderRadius: 10, marginTop: 12, elevation: 0 },
  histCard: { borderRadius: 10, elevation: 1, marginBottom: 8 },
});
