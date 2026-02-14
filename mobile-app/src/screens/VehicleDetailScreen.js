import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Divider, DataTable, Chip, Button, SegmentedButtons } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import SummaryCard from '../components/SummaryCard';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

export default function VehicleDetailScreen({ navigation, route }) {
  const vehicle = route.params?.vehicle;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const [tab, setTab] = useState('info');
  const [costs, setCosts] = useState([]);
  const [sharing, setSharing] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!vehicle) return;
    apiClient.get(`/vehicles/${vehicle.id}/costs`).then(r => setCosts(r.data || [])).catch(() => {});
    apiClient.get(`/vehicles/${vehicle.id}/sharing`).then(r => setSharing(r.data || [])).catch(() => {});
    apiClient.get(`/vehicles/${vehicle.id}/history`).then(r => setHistory(r.data || [])).catch(() => {});
  }, [vehicle]);

  if (!vehicle) return null;

  const infoRows = [
    ['Vehicle ID', vehicle.vehicleId], ['Category', vehicle.category], ['Manufacturer', vehicle.manufacturer],
    ['Model', vehicle.model], ['Year', vehicle.year], ['Color', vehicle.color],
    ['Chassis/VIN', vehicle.chassisNumber], ['Engine Number', vehicle.engineNumber],
    ['Engine Type', vehicle.engineType], ['Fuel Type', vehicle.fuelType],
    ['Transmission', vehicle.transmission], ['Mileage', vehicle.mileage ? `${vehicle.mileage} km` : '—'],
    ['Plate No', vehicle.plateNo], ['License', vehicle.vehicleLicense],
    ['Steering', vehicle.steering], ['Monolithic/Cut', vehicle.monolithicCut],
    ['Status', vehicle.status],
  ];

  const tabs = [
    { value: 'info', label: 'Info' },
    { value: 'costs', label: 'Costs' },
    { value: 'ref', label: 'Reference' },
    { value: 'sharing', label: 'Partners' },
    { value: 'history', label: 'History' },
  ];

  return (
    <ScreenWrapper title={`${vehicle.manufacturer} ${vehicle.model}`} navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header card */}
        <Card style={[styles.headerCard, { backgroundColor: c.primaryContainer }]} mode="contained">
          <Card.Content style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: '800', color: c.primary }}>{vehicle.manufacturer} {vehicle.model}</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>{vehicle.year} • {vehicle.category} • {vehicle.color}</Text>
            </View>
            <StatusChip label={vehicle.status} />
          </Card.Content>
        </Card>

        {/* Price cards */}
        <View style={styles.priceRow}>
          <SummaryCard title="Total Cost" value={formatCurrency(vehicle.totalCostPKR || 0)} icon="cash-minus" color={c.error} style={{ flex: 1 }} />
          <SummaryCard title="Selling Price" value={formatCurrency(vehicle.sellingPrice || 0)} icon="cash-plus" color={c.success} style={{ flex: 1 }} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabRow}>
            {tabs.map(t => (
              <Chip key={t.value} selected={tab === t.value} onPress={() => setTab(t.value)}
                style={[styles.tab, tab === t.value && { backgroundColor: c.primary }]}
                textStyle={{ color: tab === t.value ? '#fff' : c.onSurface, fontWeight: '600', fontSize: 12 }}
              >{t.label}</Chip>
            ))}
          </View>
        </ScrollView>

        {tab === 'info' && (
          <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
            <Card.Content>
              {infoRows.map(([label, val], i) => (
                <View key={label} style={[styles.infoRow, i % 2 === 0 && { backgroundColor: c.surfaceVariant + '40' }]}>
                  <Text variant="labelMedium" style={{ color: c.onSurfaceVariant, flex: 1, fontWeight: '600' }}>{label}</Text>
                  <Text variant="bodyMedium" style={{ color: c.onSurface, flex: 1.2, textAlign: 'right' }}>{val || '—'}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {tab === 'costs' && (
          <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
            <Card.Title title="Cost Breakdown" titleVariant="titleSmall" />
            <Card.Content>
              {[
                ['Base Purchase', vehicle.basePurchasePrice, vehicle.baseCurrency],
                ['Transport to Dubai', vehicle.transportDubai, 'AFN'],
                ['Import to Afghanistan', vehicle.importAfghanistan, 'AFN'],
                ['Repair Cost', vehicle.repairCost, 'AFN'],
              ].map(([stage, amt, cur], i) => (
                <View key={stage} style={[styles.infoRow, i % 2 === 0 && { backgroundColor: c.surfaceVariant + '40' }]}>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, flex: 1 }}>{stage}</Text>
                  <Text variant="bodyMedium" style={{ color: c.onSurface, fontWeight: '600' }}>{formatCurrency(amt, cur)}</Text>
                </View>
              ))}
              <Divider style={{ marginVertical: 8 }} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={{ color: c.primary, fontWeight: '700', flex: 1 }}>Total Cost</Text>
                <Text variant="titleMedium" style={{ color: c.primary, fontWeight: '800' }}>{formatCurrency(vehicle.totalCostPKR)}</Text>
              </View>
              {costs.length > 0 && costs.map((cost, i) => (
                <View key={i} style={[styles.infoRow, { marginTop: 8 }]}>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{cost.description || cost.stage}</Text>
                  <Text variant="bodyMedium" style={{ color: c.onSurface }}>{formatCurrency(cost.amount, cost.currency)}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {tab === 'ref' && (
          <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
            <Card.Title title="Reference Person" titleVariant="titleSmall" />
            <Card.Content>
              {vehicle.refFullName ? (
                [['Name', vehicle.refFullName], ['Tazkira', vehicle.refTazkiraNumber], ['Phone', vehicle.refPhoneNumber], ['Address', vehicle.refAddress]].map(([l, v]) => (
                  <View key={l} style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: c.onSurfaceVariant, flex: 1 }}>{l}</Text>
                    <Text variant="bodyMedium" style={{ color: c.onSurface, flex: 1.5 }}>{v || '—'}</Text>
                  </View>
                ))
              ) : <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 }}>No reference person</Text>}
            </Card.Content>
          </Card>
        )}

        {tab === 'sharing' && (
          <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
            <Card.Title title="Sharing Partners" titleVariant="titleSmall" />
            <Card.Content>
              {sharing.length > 0 ? sharing.map((sp, i) => (
                <View key={i} style={[styles.infoRow, i % 2 === 0 && { backgroundColor: c.surfaceVariant + '40' }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>{sp.personName}</Text>
                    <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>{sp.phone}</Text>
                  </View>
                  <Text variant="bodyMedium" style={{ color: c.primary, fontWeight: '700' }}>{sp.sharePercentage}%</Text>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginLeft: 8 }}>{formatCurrency(sp.investmentAmount)}</Text>
                </View>
              )) : <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 }}>No sharing partners</Text>}
            </Card.Content>
          </Card>
        )}

        {tab === 'history' && (
          <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
            <Card.Title title="Edit History" titleVariant="titleSmall" />
            <Card.Content>
              {history.length > 0 ? history.map((h, i) => (
                <View key={i} style={[styles.historyRow, { borderLeftColor: c.primary }]}>
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>{new Date(h.createdAt).toLocaleString()}</Text>
                  <Text variant="bodySmall" style={{ color: c.onSurface }}>
                    <Text style={{ fontWeight: '700' }}>{h.fieldName}</Text>: {h.oldValue} → {h.newValue}
                  </Text>
                  {h.reason && <Text variant="labelSmall" style={{ color: c.primary }}>Reason: {h.reason}</Text>}
                </View>
              )) : <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 }}>No edit history</Text>}
            </Card.Content>
          </Card>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12 },
  headerCard: { borderRadius: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceRow: { flexDirection: 'row', gap: 12 },
  tabScroll: { marginBottom: 4 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingVertical: 4 },
  tab: { borderRadius: 20 },
  card: { borderRadius: 14, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6 },
  historyRow: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 6, marginBottom: 8 },
});
