import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Divider, List, SegmentedButtons, Button, IconButton } from 'react-native-paper';
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
  const [tab, setTab] = useState('info');
  const [ledger, setLedger] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [ledRes, purRes] = await Promise.all([
          apiClient.get(`/ledger/customer/${customer.id}`).catch(() => ({ data: [] })),
          apiClient.get(`/sales?customerId=${customer.id}`).catch(() => ({ data: [] })),
        ]);
        setLedger(Array.isArray(ledRes.data) ? ledRes.data : ledRes.data?.entries || []);
        setPurchases(Array.isArray(purRes.data) ? purRes.data : purRes.data?.sales || []);
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    loadData();
  }, [customer]);

  if (!customer) return <EmptyState message="No customer data" />;

  const bal = Number(customer.balance || 0);

  const infoFields = [
    { l: 'Full Name', v: customer.fullName },
    { l: "Father's Name", v: customer.fatherName },
    { l: 'Phone', v: customer.phoneNumber },
    { l: 'National ID', v: customer.nationalIdNumber },
    { l: 'Type', v: customer.customerType },
    { l: 'Province', v: customer.province },
    { l: 'District', v: customer.district },
    { l: 'Village', v: customer.village },
    { l: 'Address', v: customer.address },
    { l: 'Notes', v: customer.notes },
    { l: 'Balance', v: formatCurrency(bal), color: bal >= 0 ? '#4caf50' : '#f44336' },
  ].filter(f => f.v);

  const renderInfo = () => (
    <Card style={[styles.card, { backgroundColor: c.surface }]}>
      <Card.Content>
        {infoFields.map((f, i) => (
          <View key={i}>
            <View style={styles.fieldRow}>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, width: 110 }}>{f.l}</Text>
              <Text variant="bodyMedium" style={{ color: f.color || c.onSurface, fontWeight: '600', flex: 1 }}>{f.v}</Text>
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
      {ledger.map((e, i) => (
        <Card key={i} style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{e.type || e.description || 'Entry'}</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: e.amount >= 0 ? '#4caf50' : '#f44336' }}>{formatCurrency(Math.abs(e.amount || 0))}</Text>
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{e.notes || e.description || ''}</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{e.date || e.createdAt ? new Date(e.date || e.createdAt).toLocaleDateString() : ''}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderPurchases = () => (
    purchases.length === 0 ? <EmptyState loading={loading} message="No purchases" icon="🚗" /> :
    <View style={{ gap: 8 }}>
      {purchases.map((s, i) => (
        <Card key={i} style={[styles.card, { backgroundColor: c.surface }]} onPress={() => navigation.navigate('SaleDetail', { sale: s })}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{s.Vehicle?.manufacturer} {s.Vehicle?.model}</Text>
              <StatusChip label={s.saleType || 'Sale'} />
            </View>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{formatCurrency(s.sellingPrice)} • {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : ''}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  return (
    <ScreenWrapper title="Customer Details" navigation={navigation} back
      actions={<IconButton icon="pencil" onPress={() => navigation.navigate('CustomerForm', { customer })} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Card style={[styles.card, { backgroundColor: c.primary }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 24, color: '#fff' }}>👤</Text>
            </View>
            <Text variant="titleLarge" style={{ fontWeight: '700', color: '#fff', marginTop: 8 }}>{customer.fullName}</Text>
            <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>{customer.phoneNumber}</Text>
            <StatusChip label={customer.customerType || 'Buyer'} style={{ marginTop: 6 }} />
          </Card.Content>
        </Card>

        {/* Balance */}
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Balance</Text>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: bal >= 0 ? '#4caf50' : '#f44336' }}>{formatCurrency(Math.abs(bal))}</Text>
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
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { borderRadius: 12, elevation: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
