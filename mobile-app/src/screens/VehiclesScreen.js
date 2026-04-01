import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Text, IconButton, Menu, Chip, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency, VEHICLE_STATUSES } from '../utils/constants';
import apiClient from '../api/client';

export default function VehiclesScreen({ navigation }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/vehicles');
      setVehicles(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Fetch vehicles error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchVehicles);
    return unsub;
  }, [navigation, fetchVehicles]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/vehicles/${deleteId}`);
      setVehicles(prev => prev.filter(v => v.id !== deleteId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete');
    }
    setDeleteId(null);
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = !search || [v.vehicleId, v.manufacturer, v.model, v.category, v.chassisNumber]
      .filter(Boolean).some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderVehicle = ({ item }) => (
    <TouchableRipple
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
      style={[styles.card, { backgroundColor: c.card }, paperTheme.shadows?.sm]}
      borderless
    >
      <View style={styles.cardInner}>
        {/* Vehicle icon */}
        <LinearGradient
          colors={[c.primary + '20', c.primary + '08']}
          style={styles.cardIcon}
        >
          <MaterialCommunityIcons name="car-side" size={22} color={c.primary} />
        </LinearGradient>
        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]} numberOfLines={1}>
              {item.manufacturer} {item.model}
            </Text>
            <StatusChip label={item.status} />
          </View>
          <Text style={[styles.cardMeta, { color: c.onSurfaceVariant }]} numberOfLines={1}>
            {item.vehicleId} • {item.year} • {item.category} • {item.color}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.costText, { color: c.onSurfaceVariant }]}>Cost: {formatCurrency(item.totalCostAFN || item.totalCost)}</Text>
            <Text style={[styles.priceText, { color: c.success }]}>{formatCurrency(item.sellingPrice)}</Text>
          </View>
        </View>
        {/* Actions */}
        <View style={styles.actions}>
          <IconButton icon="eye-outline" size={18} iconColor={c.primary} onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })} style={styles.actionBtn} />
          {item.status !== 'Sold' && (
            <>
              <IconButton icon="pencil-outline" size={18} iconColor={c.onSurfaceVariant} onPress={() => navigation.navigate('VehicleForm', { vehicle: item })} style={styles.actionBtn} />
              <IconButton icon="trash-can-outline" size={18} iconColor={c.error} onPress={() => setDeleteId(item.id)} style={styles.actionBtn} />
            </>
          )}
        </View>
      </View>
    </TouchableRipple>
  );

  return (
    <ScreenWrapper
      title="Vehicles"
      navigation={navigation}
      actions={
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="filter-variant" onPress={() => setMenuVisible(true)} />}
        >
          <Menu.Item title="All" onPress={() => { setStatusFilter('All'); setMenuVisible(false); }} />
          {VEHICLE_STATUSES.map(s => (
            <Menu.Item key={s} title={s} onPress={() => { setStatusFilter(s); setMenuVisible(false); }} />
          ))}
        </Menu>
      }
      fab={
        <FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff"
          onPress={() => navigation.navigate('VehicleForm')} />
      }
    >
      <View style={styles.filterRow}>
        <Searchbar
          value={search}
          onChangeText={setSearch}
          placeholder="Search vehicles..."
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}
          inputStyle={styles.searchInput}
          iconColor={c.onSurfaceVariant}
          placeholderTextColor={c.onSurfaceVariant + '80'}
        />
      </View>
      {statusFilter !== 'All' && (
        <View style={styles.chipRow}>
          <Chip icon="filter" onClose={() => setStatusFilter('All')} style={[styles.filterChip, { backgroundColor: c.primary + '12' }]} textStyle={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>{statusFilter}</Chip>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchVehicles} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No vehicles found" icon="🚗" />}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        onConfirm={handleDelete}
        onDismiss={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  searchbar: { borderRadius: 16, elevation: 0, height: 48, borderWidth: 1 },
  searchInput: { fontSize: 14, marginLeft: -4 },
  chipRow: { paddingBottom: 6, paddingHorizontal: 16 },
  filterChip: { alignSelf: 'flex-start', borderRadius: 20 },
  list: { padding: 16, paddingTop: 6, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, marginTop: 3, fontWeight: '400' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  costText: { fontSize: 12, fontWeight: '500' },
  priceText: { fontSize: 15, fontWeight: '800' },
  actions: { marginTop: -4, marginRight: -8 },
  actionBtn: { margin: 0, width: 34, height: 34 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16, elevation: 4 },
});
