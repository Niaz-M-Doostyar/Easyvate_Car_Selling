import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB, Card, Text, IconButton, Menu, Divider, Chip } from 'react-native-paper';
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
      setVehicles(data.vehicles || data || []);
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
    <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated" onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={styles.cardHeader}>
            <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, flex: 1 }} numberOfLines={1}>
              {item.manufacturer} {item.model}
            </Text>
            <StatusChip label={item.status} />
          </View>
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
            {item.vehicleId} • {item.year} • {item.category} • {item.color}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Cost: {formatCurrency(item.totalCostPKR || item.totalCost)}</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.success }}>
              {formatCurrency(item.sellingPrice)}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <IconButton icon="eye" size={20} onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })} />
          {item.status !== 'Sold' && (
            <>
              <IconButton icon="pencil" size={20} onPress={() => navigation.navigate('VehicleForm', { vehicle: item })} />
              <IconButton icon="delete" size={20} iconColor={c.error} onPress={() => setDeleteId(item.id)} />
            </>
          )}
        </View>
      </Card.Content>
    </Card>
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
          style={[styles.searchbar, { backgroundColor: c.surfaceVariant }]}
          inputStyle={{ fontSize: 14 }}
        />
      </View>
      {statusFilter !== 'All' && (
        <View style={styles.chipRow}>
          <Chip icon="filter" onClose={() => setStatusFilter('All')} style={{ marginLeft: 16 }}>{statusFilter}</Chip>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchVehicles} colors={[c.primary]} />}
        ListEmptyComponent={<EmptyState loading={loading} message="No vehicles found" icon="🚗" />}
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
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchbar: { borderRadius: 12, elevation: 0, height: 44 },
  chipRow: { paddingBottom: 8 },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 90 },
  card: { borderRadius: 12, elevation: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  cardLeft: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  actions: { flexDirection: 'column', alignItems: 'center', marginLeft: 4, marginTop: -8 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
