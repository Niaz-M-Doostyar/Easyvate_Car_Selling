import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Divider, SegmentedButtons, IconButton } from '../components/LocalizedPaper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

const TABS = [
  { value: 'info', label: 'Info' },
  { value: 'ledger', label: 'Ledger' },
  { value: 'purchases', label: 'Purchases' },
];

export default function CustomerDetailScreen({ navigation, route }) {
  const customer = route.params?.customer;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('info');
  const [custData, setCustData] = useState(customer || {});
  const [ledger, setLedger] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [cRes, ledRes, purRes] = await Promise.all([
          apiClient.get(`/customers/${customer.id}`).catch(() => ({ data: customer })),
          apiClient.get(`/customers/${customer.id}/ledger`).catch(() => ({ data: [] })),
          apiClient.get(`/customers/${customer.id}/history`).catch(() => ({ data: [] })),
        ]);
        setCustData(cRes.data?.data || cRes.data || customer);
        setLedger(Array.isArray(ledRes.data?.data) ? ledRes.data.data : Array.isArray(ledRes.data) ? ledRes.data : []);
        setPurchases(Array.isArray(purRes.data?.sales) ? purRes.data.sales : Array.isArray(purRes.data?.data) ? purRes.data.data : Array.isArray(purRes.data) ? purRes.data : []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [customer]);

  if (!customer) return <EmptyState message="No customer data" />;

  const infoFields = [
    { l: 'Full Name', v: custData.fullName },
    { l: "Father's Name", v: custData.fatherName },
    { l: 'Phone', v: custData.phoneNumber },
    { l: 'National ID', v: custData.nationalIdNumber },
    { l: 'Type', v: custData.customerType },
    { l: 'Province', v: custData.province },
    { l: 'District', v: custData.district },
    { l: 'Village', v: custData.village },
    { l: 'Current Address', v: custData.currentAddress || custData.address },
    { l: 'Original Address', v: custData.originalAddress },
    { l: 'Notes', v: custData.notes },
  ].filter(f => f.v);

  const renderInfo = () => (
    <Card style={[styles.card, { backgroundColor: c.surface }]}>
      <Card.Content>
        {infoFields.map((f, i) => (
          <View key={i}>
            <View style={styles.fieldRow}>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, width: 110 }}>{f.l}</Text>
              <Text variant="bodyMedium" style={{ color: c.onSurface, fontWeight: '600', flex: 1 }}>{f.v}</Text>
            </View>
            {i < infoFields.length - 1 && <Divider style={{ marginVertical: 4 }} />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderLedger = () => (
    ledger.length === 0 ? <EmptyState loading={loading} message="No ledger entries" icon="📒" /> :
    <View style={{ gap: 8 }}>
      {ledger.map((e, i) => {
        const amt = Number(e.amount || 0);
        return (
          <Card key={i} style={[styles.card, { backgroundColor: c.surface }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{e.type || e.purpose || 'Entry'}</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: amt >= 0 ? '#4caf50' : '#f44336' }}>
                  {formatCurrency(Math.abs(amt), e.currency || 'AFN')}
                </Text>
              </View>
              {e.purpose && <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 4 }}>{e.purpose}</Text>}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
                  {e.date ? new Date(e.date).toLocaleDateString() : ''}
                </Text>
                {e.balance !== undefined && (
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
                    Bal: {formatCurrency(e.balance, e.currency || 'AFN')}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );

  const renderPurchases = () => (
    purchases.length === 0 ? <EmptyState loading={loading} message="No purchases" icon="🚗" /> :
    <View style={{ gap: 8 }}>
      {purchases.map((s, i) => (
        <Card key={i} style={[styles.card, { backgroundColor: c.surface }]} onPress={() => navigation.navigate('Sales', { screen: 'SaleDetail', params: { sale: s } })}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{s.vehicle?.manufacturer} {s.vehicle?.model}</Text>
              <StatusChip label={s.saleType || 'Sale'} />
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 4 }}>
              {formatCurrency(s.sellingPrice, s.paymentCurrency)} • {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : ''}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  return (
    <ScreenWrapper title="Customer Details" navigation={navigation} back
      actions={<IconButton icon="pencil" onPress={() => navigation.navigate('CustomerForm', { customer: custData })} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Card style={[styles.card, { backgroundColor: c.primary }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 24, color: '#fff' }}>👤</Text>
            </View>
            <Text variant="titleLarge" style={{ fontWeight: '700', color: '#fff', marginTop: 8 }}>{custData.fullName}</Text>
            <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>{custData.phoneNumber}</Text>
            <StatusChip label={custData.customerType || 'Buyer'} style={{ marginTop: 6 }} />
          </Card.Content>
        </Card>

        {/* Multi-Currency Balances */}
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content style={{ paddingVertical: 12 }}>
            <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8, textAlign: 'center' }}>Account Balances</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'AFN', val: Number(custData.balanceAFN || custData.balance || 0), cur: 'AFN' },
                { label: 'USD', val: Number(custData.balanceUSD || 0), cur: 'USD' },
                { label: 'PKR', val: Number(custData.balancePKR || 0), cur: 'PKR' },
                { label: 'AED', val: Number(custData.balanceAED || 0), cur: 'AED' },
              ].map((b, i) => (
                <View key={i} style={{ flex: 1, minWidth: '45%', alignItems: 'center', backgroundColor: c.surfaceVariant, padding: 8, borderRadius: 10 }}>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, fontSize: 10 }}>{b.label}</Text>
                  <Text variant="titleMedium" style={{ fontWeight: '800', color: b.val >= 0 ? '#4caf50' : '#f44336' }}>
                    {formatCurrency(Math.abs(b.val), b.cur)}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <SegmentedButtons value={tab} onValueChange={setTab} buttons={TABS} style={{ marginVertical: 8 }} />

        {tab === 'info' && renderInfo()}
        {tab === 'ledger' && renderLedger()}
        {tab === 'purchases' && renderPurchases()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 60 : 40, gap: 12 },
  card: { borderRadius: 12, elevation: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
