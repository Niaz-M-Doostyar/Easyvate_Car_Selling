import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Card, Text, Button, ProgressBar, Divider, Avatar, Surface, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import SummaryCard from '../components/SummaryCard';
import StatusChip from '../components/StatusChip';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

const W = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ vehicles: [], customers: [], sales: [], loans: [], balance: {}, employees: [] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes, sRes, lRes, bRes, eRes] = await Promise.all([
        apiClient.get('/vehicles').catch(() => ({ data: { vehicles: [] } })),
        apiClient.get('/customers').catch(() => ({ data: [] })),
        apiClient.get('/sales').catch(() => ({ data: { sales: [] } })),
        apiClient.get('/loans').catch(() => ({ data: { loans: [] } })),
        apiClient.get('/ledger/showroom/balance').catch(() => ({ data: {} })),
        apiClient.get('/employees').catch(() => ({ data: [] })),
      ]);
      setData({
        vehicles: vRes.data.vehicles || vRes.data || [],
        customers: Array.isArray(cRes.data) ? cRes.data : cRes.data.customers || [],
        sales: sRes.data.sales || sRes.data || [],
        loans: lRes.data.loans || lRes.data || [],
        balance: bRes.data || {},
        employees: Array.isArray(eRes.data) ? eRes.data : eRes.data.employees || [],
      });
    } catch (e) {
      console.log('Dashboard fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { vehicles, customers, sales, loans, balance, employees } = data;
  const totalRevenue = sales.reduce((s, x) => s + Number(x.sellingPrice || 0), 0);
  const totalProfit = sales.reduce((s, x) => s + Number(x.profit || 0), 0);
  const totalCommission = sales.reduce((s, x) => s + Number(x.commission || 0), 0);
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const openLoans = loans.filter(l => l.status === 'Open').length;
  const soldVehicles = vehicles.filter(v => v.status === 'Sold').length;

  const statusCounts = {};
  vehicles.forEach(v => { statusCounts[v.status] = (statusCounts[v.status] || 0) + 1; });
  const recentSales = [...sales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)).slice(0, 5);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = (user?.fullName || 'User').split(' ')[0];

  return (
    <ScreenWrapper title="Dashboard" navigation={navigation}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[c.primary]} />}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={[styles.greeting, { color: c.onSurface }]}>{greeting}, {firstName}!</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Here's your business overview</Text>
          </View>
          <MaterialCommunityIcons name="car-sport" size={36} color={c.primary} />
        </View>

        {/* KPI Cards */}
        <View style={styles.grid2}>
          <SummaryCard title="Revenue" value={formatCurrency(totalRevenue)} icon="trending-up" color={c.success} style={styles.gridItem} />
          <SummaryCard title="Total Sales" value={String(sales.length)} icon="cart-check" color={c.primary} style={styles.gridItem} />
        </View>
        <View style={styles.grid2}>
          <SummaryCard title="Vehicles" value={String(vehicles.length)} icon="car" color="#e65100" subtitle={`${availableVehicles} available`} style={styles.gridItem} />
          <SummaryCard title="Customers" value={String(customers.length)} icon="account-group" color="#7b1fa2" subtitle={`${openLoans} open loans`} style={styles.gridItem} />
        </View>

        {/* Financial Row */}
        <View style={styles.grid2}>
          <SummaryCard title="Showroom Balance" value={formatCurrency(balance.showroomBalance || 0)} icon="bank" color={c.primary} style={styles.gridItem} />
          <SummaryCard title="Owner Balance" value={formatCurrency(balance.ownerBalance || 0)} icon="account-cash" color={c.gold || '#c8963e'} style={styles.gridItem} />
        </View>
        <View style={styles.grid2}>
          <SummaryCard title="Total Profit" value={formatCurrency(totalProfit)} icon="chart-line" color={c.success} style={styles.gridItem} />
          <SummaryCard title="Commissions" value={formatCurrency(totalCommission)} icon="handshake" color="#e65100" style={styles.gridItem} />
        </View>

        {/* Recent Sales */}
        <Card style={[styles.sectionCard, { backgroundColor: c.surface }]} mode="elevated">
          <Card.Title title="Recent Sales" titleVariant="titleMedium" titleStyle={{ fontWeight: '700' }}
            right={() => <Button compact onPress={() => navigation.navigate('Sales')}>View All</Button>}
          />
          <Card.Content>
            {recentSales.length === 0 ? (
              <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 16 }}>No sales yet</Text>
            ) : recentSales.map((sale, i) => (
              <View key={sale.id || i}>
                <TouchableRipple onPress={() => navigation.navigate('Sales', { screen: 'SaleDetail', params: { saleId: sale.id }, initial: false })}>
                  <View style={styles.saleRow}>
                    <Avatar.Icon size={38} icon="car" style={{ backgroundColor: c.primaryContainer }} color={c.primary} />
                    <View style={styles.saleInfo}>
                      <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }} numberOfLines={1}>
                        {sale.Vehicle?.manufacturer || ''} {sale.Vehicle?.model || sale.saleId}
                      </Text>
                      <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>
                        {sale.Customer?.fullName || 'Customer'} • {new Date(sale.saleDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.success }}>{formatCurrency(sale.sellingPrice)}</Text>
                      <StatusChip label={Number(sale.remainingAmount || 0) > 0 ? 'Partial' : 'Paid'} />
                    </View>
                  </View>
                </TouchableRipple>
                {i < recentSales.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Inventory Status */}
        <Card style={[styles.sectionCard, { backgroundColor: c.surface }]} mode="elevated">
          <Card.Title title="Inventory Status" titleVariant="titleMedium" titleStyle={{ fontWeight: '700' }} />
          <Card.Content>
            {['Available', 'Sold', 'Reserved', 'Coming', 'Under Repair'].map(status => {
              const count = statusCounts[status] || 0;
              const pct = vehicles.length > 0 ? count / vehicles.length : 0;
              const statusColors = { Available: c.success, Sold: c.error, Reserved: '#ed6c02', Coming: c.info || '#0288d1', 'Under Repair': '#ed6c02' };
              return (
                <View key={status} style={styles.invRow}>
                  <View style={styles.invLabel}>
                    <Text variant="bodySmall" style={{ color: c.onSurface, fontWeight: '500' }}>{status}</Text>
                    <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>{count} ({Math.round(pct * 100)}%)</Text>
                  </View>
                  <ProgressBar progress={pct} color={statusColors[status]} style={styles.progressBar} />
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.sectionCard, { backgroundColor: c.surface }]} mode="elevated">
          <Card.Title title="Quick Actions" titleVariant="titleMedium" titleStyle={{ fontWeight: '700' }} />
          <Card.Content>
            <View style={styles.quickGrid}>
              {[
                { label: 'New Vehicle', icon: 'car-plus', screen: 'Vehicles', params: { screen: 'VehicleForm' } },
                { label: 'New Sale', icon: 'cart-plus', screen: 'Sales', params: { screen: 'SaleForm' } },
                { label: 'Add Customer', icon: 'account-plus', screen: 'Customers', params: { screen: 'CustomerForm' } },
                { label: 'Reports', icon: 'chart-bar', screen: 'Reports' },
              ].map(action => (
                <TouchableRipple
                  key={action.label}
                  onPress={() => navigation.navigate(action.screen, action.params)}
                  style={[styles.quickBtn, { backgroundColor: c.primaryContainer }]}
                  borderless
                >
                  <View style={styles.quickInner}>
                    <MaterialCommunityIcons name={action.icon} size={26} color={c.primary} />
                    <Text variant="labelSmall" style={{ color: c.primary, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>{action.label}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Bottom Stats */}
        <View style={styles.grid2}>
          <SummaryCard title="Employees" value={String(employees.length)} icon="account-tie" color="#1565c0" style={styles.gridItem} />
          <SummaryCard title="Open Loans" value={String(openLoans)} icon="bank-transfer" color="#ed6c02" style={styles.gridItem} />
        </View>
        <View style={styles.grid2}>
          <SummaryCard title="Sold" value={String(soldVehicles)} icon="car-off" color="#b71c1c" style={styles.gridItem} />
          <SummaryCard title="Available" value={String(availableVehicles)} icon="car-key" color="#2e7d32" style={styles.gridItem} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 4 },
  greeting: { fontWeight: '800' },
  grid2: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1 },
  sectionCard: { borderRadius: 14, elevation: 1 },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  saleInfo: { flex: 1 },
  invRow: { marginBottom: 12 },
  invLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressBar: { height: 8, borderRadius: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickBtn: { width: (W - 80) / 4, borderRadius: 12, padding: 2 },
  quickInner: { alignItems: 'center', paddingVertical: 12 },
});
