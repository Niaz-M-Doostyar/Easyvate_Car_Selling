import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, SegmentedButtons, ProgressBar, Button, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, SALE_TYPES } from '../utils/constants';
import apiClient from '../api/client';

const TABS = [
  { value: 'sale', label: 'Sale' },
  { value: 'seller', label: 'Seller' },
  { value: 'profit', label: 'Profit' },
  { value: 'commission', label: 'Comm.' },
  { value: 'payments', label: 'Pay' },
];

export default function SaleDetailScreen({ navigation, route }) {
  const sale = route.params?.sale;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [tab, setTab] = useState('sale');
  const [detail, setDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sale) return;
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.all([
          apiClient.get(`/sales/${sale.id}`),
          apiClient.get(`/sales/${sale.id}/payments`).catch(() => ({ data: { payments: [] } })),
        ]);
        setDetail(sRes.data?.data || sRes.data);
        const pData = pRes.data;
        setPayments(Array.isArray(pData?.data) ? pData.data : Array.isArray(pData) ? pData : []);
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    load();
  }, [sale]);

  if (!sale) return <EmptyState message="No sale data" />;

  const s = detail || sale;
  const remaining = Number(s.remainingAmount || 0);
  const total = Number(s.sellingPrice || 1);
  const paid = total - remaining;
  const progress = Math.min(paid / total, 1);
  const saleTypeObj = SALE_TYPES.find(t => t.value === s.saleType) || {};
  const veh = s.Vehicle || {};
  const cust = s.Customer || {};

  const Field = ({ label, value, color }) => value ? (
    <View style={styles.fieldRow}>
      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, width: 120 }}>{label}</Text>
      <Text variant="bodyMedium" style={{ color: color || c.onSurface, fontWeight: '500', flex: 1 }}>{String(value)}</Text>
    </View>
  ) : null;

  const renderSale = () => (
    <View style={{ gap: 12 }}>
      {/* Sale Type Badge */}
      <Card style={[styles.card, { backgroundColor: (saleTypeObj.color || c.primary) + '15' }]}>
        <Card.Content style={{ alignItems: 'center', paddingVertical: 12 }}>
          <StatusChip label={s.saleType || 'Sale'} />
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: c.onSurface, marginTop: 4 }}>{s.saleId || '-'}</Text>
        </Card.Content>
      </Card>

      {/* Payment progress */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Payment Status</Text>
            <Chip style={{ backgroundColor: remaining <= 0 ? '#e8f5e9' : '#fff3e0' }}
              textStyle={{ fontSize: 10, fontWeight: '700', color: remaining <= 0 ? '#4caf50' : '#ff9800' }}>
              {remaining <= 0 ? '✓ Fully Paid' : `${formatCurrency(remaining)} remaining`}
            </Chip>
          </View>
          <ProgressBar progress={progress} color={remaining <= 0 ? '#4caf50' : '#ff9800'} style={{ borderRadius: 4, height: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Paid: {formatCurrency(paid)}</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Total: {formatCurrency(total)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Key fields */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Field label="Vehicle" value={`${veh.manufacturer || ''} ${veh.model || ''} (${veh.year || ''})`} />
          <Divider style={{ marginVertical: 4 }} />
          <Field label="Customer" value={cust.fullName} />
          <Divider style={{ marginVertical: 4 }} />
          <Field label="Sale Date" value={s.saleDate ? new Date(s.saleDate).toLocaleDateString() : '-'} />
          <Divider style={{ marginVertical: 4 }} />
          <Field label="Selling Price" value={formatCurrency(s.sellingPrice)} color={c.primary} />
          <Divider style={{ marginVertical: 4 }} />
          <Field label="Down Payment" value={formatCurrency(s.downPayment)} />
          <Divider style={{ marginVertical: 4 }} />
          <Field label="Remaining" value={formatCurrency(remaining)} color={remaining > 0 ? '#ff9800' : '#4caf50'} />
          {s.notes && <><Divider style={{ marginVertical: 4 }} /><Field label="Notes" value={s.notes} /></>}
          {s.note2 && <><Divider style={{ marginVertical: 4 }} /><Field label="Note 2" value={s.note2} /></>}
          {s.witnessName1 && <><Divider style={{ marginVertical: 4 }} /><Field label="Witness 1" value={s.witnessName1} /></>}
          {s.witnessName2 && <><Divider style={{ marginVertical: 4 }} /><Field label="Witness 2" value={s.witnessName2} /></>}
          {s.saleType === 'Licensed Car' && s.trafficTransferDate && <><Divider style={{ marginVertical: 4 }} /><Field label="Traffic Transfer" value={new Date(s.trafficTransferDate).toLocaleDateString()} /></>}
        </Card.Content>
      </Card>
    </View>
  );

  const renderSeller = () => (
    <View style={{ gap: 12 }}>
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>Seller Info</Text>
          <Field label="Name" value={s.sellerName} />
          <Field label="Father" value={s.sellerFatherName} />
          <Field label="Province" value={s.sellerProvince} />
          <Field label="District" value={s.sellerDistrict} />
          <Field label="Village" value={s.sellerVillage} />
          <Field label="Address" value={s.sellerAddress} />
          <Field label="ID Number" value={s.sellerIdNumber} />
          <Field label="Phone" value={s.sellerPhone} />
        </Card.Content>
      </Card>

      {s.saleType === 'Exchange Car' && (
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 8 }}>Exchange Vehicle</Text>
            <Field label="Manufacturer" value={s.exchVehicleManufacturer} />
            <Field label="Model" value={s.exchVehicleModel} />
            <Field label="Year" value={s.exchVehicleYear} />
            <Field label="Category" value={s.exchVehicleCategory} />
            <Field label="Color" value={s.exchVehicleColor} />
            <Field label="Chassis" value={s.exchVehicleChassis} />
            <Field label="Engine" value={s.exchVehicleEngine} />
            <Field label="Engine Type" value={s.exchVehicleEngineType} />
            <Field label="Fuel" value={s.exchVehicleFuelType} />
            <Field label="Transmission" value={s.exchVehicleTransmission} />
            <Field label="Plate No." value={s.exchVehiclePlateNo} />
            <Field label="Mileage" value={s.exchVehicleMileage ? `${s.exchVehicleMileage} km` : null} />
            <Field label="Steering" value={s.exchVehicleSteering} />
            <Field label="Body" value={s.exchVehicleMonolithicCut} />
            <Divider style={{ marginVertical: 8 }} />
            <Field label="Price Diff." value={s.priceDifference ? formatCurrency(s.priceDifference) : null} />
            <Field label="Paid By" value={s.priceDifferencePaidBy} />
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderProfit = () => {
    const totalCost = Number(veh.totalCostPKR || veh.totalCost || 0);
    const profit = Number(s.profit || (total - totalCost));
    const commission = Number(s.commission || s.totalSharedAmount || 0);
    const ownerShare = Number(s.ownerShare || (profit - commission));

    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Card style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#1565c0' }}>Total Cost</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#1565c0' }}>{formatCurrency(totalCost)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#2e7d32' }}>Profit</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#2e7d32' }}>{formatCurrency(profit)}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Card style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#e65100' }}>Commission</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#e65100' }}>{formatCurrency(commission)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="bodySmall" style={{ color: '#6a1b9a' }}>Owner Share</Text>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: '#6a1b9a' }}>{formatCurrency(ownerShare)}</Text>
            </Card.Content>
          </Card>
        </View>
        <Card style={[styles.statCard, { backgroundColor: c.primary + '15' }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: c.primary }}>Selling Price</Text>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: c.primary }}>{formatCurrency(total)}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderCommission = () => {
    const commissions = s.CommissionDistributions || s.commissions || [];
    const profit = Number(s.profit || 0);
    const commission = Number(s.commission || s.totalSharedAmount || 0);
    const ownerPct = commissions.length > 0 ? (100 - commissions.reduce((sum, x) => sum + Number(x.sharePercentage || 0), 0)) : 100;
    const ownerAmt = profit - commission;

    return commissions.length === 0 ? (
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 32 }}>👤</Text>
          <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, marginTop: 8 }}>Owner receives 100% of profit</Text>
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#4caf50', marginTop: 4 }}>{formatCurrency(profit)}</Text>
        </Card.Content>
      </Card>
    ) : (
      <View style={{ gap: 8 }}>
        {commissions.map((cd, i) => (
          <Card key={i} style={[styles.card, { backgroundColor: c.surface }]}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{cd.personName || 'Partner'}</Text>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{cd.sharePercentage}% share</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.primary }}>{formatCurrency(cd.amount)}</Text>
                <StatusChip label={cd.status || 'Pending'} />
              </View>
            </Card.Content>
          </Card>
        ))}
        {/* Owner row */}
        <Card style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
          <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: '#2e7d32' }}>Owner</Text>
              <Text variant="bodySmall" style={{ color: '#388e3c' }}>{ownerPct.toFixed(1)}% share</Text>
            </View>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: '#2e7d32' }}>{formatCurrency(ownerAmt)}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderPayments = () => (
    <View style={{ gap: 12 }}>
      {/* Summary */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: '#2e7d32' }}>Total Paid</Text>
            <Text variant="titleSmall" style={{ fontWeight: '800', color: '#2e7d32' }}>{formatCurrency(paid)}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: remaining > 0 ? '#fff3e0' : '#e8f5e9' }]}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: remaining > 0 ? '#e65100' : '#2e7d32' }}>Remaining</Text>
            <Text variant="titleSmall" style={{ fontWeight: '800', color: remaining > 0 ? '#e65100' : '#2e7d32' }}>{formatCurrency(remaining)}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Payment list */}
      {payments.length === 0 ? <EmptyState loading={loading} message="No payments recorded" icon="💰" /> :
        payments.map((p, i) => (
          <Card key={i} style={[styles.card, { backgroundColor: c.surface }]}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>#{i + 1} {p.type || 'Payment'}</Text>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{p.date ? new Date(p.date).toLocaleDateString() : ''}</Text>
                {p.note && <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{p.note}</Text>}
              </View>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: '#4caf50' }}>{formatCurrency(Math.abs(p.amount || p.credit || 0))}</Text>
            </Card.Content>
          </Card>
        ))
      }
    </View>
  );

  return (
    <ScreenWrapper title="Sale Details" navigation={navigation} back>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <SegmentedButtons value={tab} onValueChange={setTab} buttons={TABS}
            style={{ minWidth: 500 }} />
        </ScrollView>

        {tab === 'sale' && renderSale()}
        {tab === 'seller' && renderSeller()}
        {tab === 'profit' && renderProfit()}
        {tab === 'commission' && renderCommission()}
        {tab === 'payments' && renderPayments()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 12, elevation: 1 },
  statCard: { flex: 1, borderRadius: 12, elevation: 0 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6 },
});
