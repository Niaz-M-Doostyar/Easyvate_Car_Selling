import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform } from 'react-native';
import { Card, Text, Button, ProgressBar, Divider, Avatar, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { paperTheme, isDark } = useAppTheme();
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
        vehicles: Array.isArray(vRes.data?.data) ? vRes.data.data : Array.isArray(vRes.data) ? vRes.data : [],
        customers: Array.isArray(cRes.data?.data) ? cRes.data.data : Array.isArray(cRes.data) ? cRes.data : [],
        sales: Array.isArray(sRes.data?.data) ? sRes.data.data : Array.isArray(sRes.data) ? sRes.data : [],
        loans: Array.isArray(lRes.data?.data) ? lRes.data.data : Array.isArray(lRes.data) ? lRes.data : [],
        balance: bRes.data || {},
        employees: Array.isArray(eRes.data?.data) ? eRes.data.data : Array.isArray(eRes.data) ? eRes.data : [],
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
  const openLoans = loans.filter(l => l.status === 'Active').length;
  const soldVehicles = vehicles.filter(v => v.status === 'Sold').length;

  const statusCounts = {};
  vehicles.forEach(v => { statusCounts[v.status] = (statusCounts[v.status] || 0) + 1; });
  const recentSales = [...sales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)).slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = (user?.fullName || 'User').split(' ')[0];

  return (
    <ScreenWrapper title="Dashboard" navigation={navigation}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[c.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Greeting Card */}
        <LinearGradient
          colors={c.gradient || [c.primary, c.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.greetingCard}
        >
          <View style={styles.greetingOverlay}>
            <View style={styles.greetingCircle1} />
            <View style={styles.greetingCircle2} />
          </View>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingLabel}>{greeting}</Text>
              <Text style={styles.greetingName}>{firstName}!</Text>
              <Text style={styles.greetingSub}>Here's your business overview</Text>
            </View>
            <View style={styles.greetingIcon}>
              <MaterialCommunityIcons name="car-sports" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          {/* Quick stats inside greeting */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatVal}>{sales.length}</Text>
              <Text style={styles.quickStatLabel}>Sales</Text>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatVal}>{vehicles.length}</Text>
              <Text style={styles.quickStatLabel}>Vehicles</Text>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatVal}>{customers.length}</Text>
              <Text style={styles.quickStatLabel}>Customers</Text>
            </View>
          </View>
        </LinearGradient>

        {/* KPI Cards */}
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Financial Overview</Text>
        <View style={styles.grid2}>
          <SummaryCard title="Revenue" value={formatCurrency(totalRevenue)} icon="trending-up" color={c.success} style={styles.gridItem} />
          <SummaryCard title="Profit" value={formatCurrency(totalProfit)} icon="chart-line" color="#8b5cf6" style={styles.gridItem} />
        </View>
        <View style={styles.grid2}>
          <SummaryCard title="Showroom" value={formatCurrency(balance.showroomBalance || 0)} icon="bank" color={c.primary} style={styles.gridItem} />
          <SummaryCard title="Owner" value={formatCurrency(balance.ownerBalance || 0)} icon="account-cash" color={c.gold || '#d4a843'} style={styles.gridItem} />
        </View>

        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Inventory</Text>
        <View style={styles.grid2}>
          <SummaryCard title="Available" value={String(availableVehicles)} icon="car-key" color={c.success} style={styles.gridItem} />
          <SummaryCard title="Commissions" value={formatCurrency(totalCommission)} icon="handshake" color="#e65100" style={styles.gridItem} />
        </View>

        {/* Recent Sales */}
        <View style={[styles.sectionCard, { backgroundColor: c.card }, paperTheme.shadows?.md]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionCardTitle, { color: c.onSurface }]}>Recent Sales</Text>
            <Button compact onPress={() => navigation.navigate('Sales')} labelStyle={styles.viewAllLabel}>View All</Button>
          </View>
          {recentSales.length === 0 ? (
            <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>No sales yet</Text>
          ) : recentSales.map((sale, i) => (
            <View key={sale.id || i}>
              <TouchableRipple
                onPress={() => navigation.navigate('Sales', { screen: 'SaleDetail', params: { saleId: sale.id }, initial: false })}
                style={styles.saleRow}
              >
                <View style={styles.saleRowInner}>
                  <LinearGradient
                    colors={[c.primary + '20', c.primary + '08']}
                    style={styles.saleAvatar}
                  >
                    <MaterialCommunityIcons name="car" size={20} color={c.primary} />
                  </LinearGradient>
                  <View style={styles.saleInfo}>
                    <Text style={[styles.saleName, { color: c.onSurface }]} numberOfLines={1}>
                      {sale.Vehicle?.manufacturer || ''} {sale.Vehicle?.model || sale.saleId}
                    </Text>
                    <Text style={[styles.saleMeta, { color: c.onSurfaceVariant }]}>
                      {sale.Customer?.fullName || 'Customer'} • {new Date(sale.saleDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[styles.salePrice, { color: c.success }]}>{formatCurrency(sale.sellingPrice)}</Text>
                    <StatusChip label={Number(sale.remainingAmount || 0) > 0 ? 'Partial' : 'Paid'} />
                  </View>
                </View>
              </TouchableRipple>
              {i < recentSales.length - 1 && <Divider style={{ marginHorizontal: 16 }} />}
            </View>
          ))}
        </View>

        {/* Inventory Status */}
        <View style={[styles.sectionCard, { backgroundColor: c.card }, paperTheme.shadows?.md]}>
          <Text style={[styles.sectionCardTitle, { color: c.onSurface, padding: 16, paddingBottom: 8 }]}>Inventory Status</Text>
          <View style={{ padding: 16, paddingTop: 4, gap: 14 }}>
            {['Available', 'Sold', 'Reserved', 'Coming', 'Under Repair'].map(status => {
              const count = statusCounts[status] || 0;
              const pct = vehicles.length > 0 ? count / vehicles.length : 0;
              const statusColors = { Available: c.success, Sold: c.error, Reserved: '#f59e0b', Coming: c.info || '#3b82f6', 'Under Repair': '#f59e0b' };
              return (
                <View key={status}>
                  <View style={styles.invLabel}>
                    <View style={styles.invLabelLeft}>
                      <View style={[styles.invDot, { backgroundColor: statusColors[status] }]} />
                      <Text style={[styles.invText, { color: c.onSurface }]}>{status}</Text>
                    </View>
                    <Text style={[styles.invCount, { color: c.onSurfaceVariant }]}>{count} ({Math.round(pct * 100)}%)</Text>
                  </View>
                  <ProgressBar progress={pct} color={statusColors[status]} style={styles.progressBar} />
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'New Vehicle', icon: 'plus-circle-outline', screen: 'Vehicles', params: { screen: 'VehicleForm' }, color: c.primary },
            { label: 'New Sale', icon: 'cart-plus', screen: 'Sales', params: { screen: 'SaleForm' }, color: c.success },
            { label: 'Customer', icon: 'account-plus-outline', screen: 'Customers', params: { screen: 'CustomerForm' }, color: '#8b5cf6' },
            { label: 'Reports', icon: 'chart-bar', screen: 'Reports', color: '#e65100' },
          ].map(action => (
            <TouchableRipple
              key={action.label}
              onPress={() => navigation.navigate(action.screen, action.params)}
              style={[styles.quickBtn, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
              borderless
            >
              <View style={styles.quickInner}>
                <LinearGradient
                  colors={[action.color + '20', action.color + '08']}
                  style={styles.quickIcon}
                >
                  <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
                </LinearGradient>
                <Text style={[styles.quickLabel, { color: c.onSurface }]}>{action.label}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>

        {/* Bottom Stats */}
        <View style={styles.grid2}>
          <SummaryCard title="Employees" value={String(employees.length)} icon="account-tie" color="#3b82f6" style={styles.gridItem} />
          <SummaryCard title="Open Loans" value={String(openLoans)} icon="bank-transfer" color="#f59e0b" style={styles.gridItem} />
        </View>
        <View style={styles.grid2}>
          <SummaryCard title="Sold" value={String(soldVehicles)} icon="car-off" color={c.error} style={styles.gridItem} />
          <SummaryCard title="Available" value={String(availableVehicles)} icon="car-key" color={c.success} style={styles.gridItem} />
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Greeting card
  greetingCard: { borderRadius: 20, padding: 20, overflow: 'hidden', position: 'relative' },
  greetingOverlay: { ...StyleSheet.absoluteFillObject },
  greetingCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', top: -20, right: -20 },
  greetingCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -10, left: 20 },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  greetingLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  greetingName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginTop: 2 },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: '400' },
  greetingIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  quickStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 12 },
  quickStatItem: { flex: 1, alignItems: 'center' },
  quickStatVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  quickStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '500' },
  quickStatDivider: { width: 1, height: '80%', alignSelf: 'center' },

  // Section styling
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3, marginTop: 4, marginBottom: -2, marginLeft: 4 },
  sectionCard: { borderRadius: 18, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionCardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  viewAllLabel: { fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },

  // Sale rows
  saleRow: { paddingHorizontal: 16, paddingVertical: 10 },
  saleRowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saleAvatar: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saleInfo: { flex: 1 },
  saleName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  saleMeta: { fontSize: 11, fontWeight: '400', marginTop: 2 },
  salePrice: { fontSize: 14, fontWeight: '800' },

  // Inventory
  invLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  invLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invDot: { width: 8, height: 8, borderRadius: 4 },
  invText: { fontSize: 13, fontWeight: '600' },
  invCount: { fontSize: 12, fontWeight: '500' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: '#00000008' },

  // Quick Actions
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  quickInner: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Grids
  grid2: { flexDirection: 'row', gap: 10 },
  gridItem: { flex: 1 },
});
