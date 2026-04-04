import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, StyleSheet, FlatList, Image, TouchableOpacity,
  RefreshControl, StatusBar, TextInput, Modal, ScrollView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import publicApiClient from '../api/publicClient';
import { resolveAssetUrl } from '../api/config';
import { formatCurrency } from '../utils/constants';

const PRIMARY = '#1b4965';
const DARK = '#0d1b2a';
const ACCENT = '#c8963e';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'year_desc', label: 'Year: Newest' },
  { key: 'year_asc', label: 'Year: Oldest' },
];

export default function PublicCarsScreen({ navigation, route }) {
  const initialSearch = route?.params?.initialSearch || '';
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  // React to search params passed from HomeScreen
  useEffect(() => {
    if (route?.params?.initialSearch) {
      setSearch(route.params.initialSearch);
    }
  }, [route?.params?.initialSearch]);
  const [activeSort, setActiveSort] = useState('newest');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const [filters, setFilters] = useState({
    brand: '', model: '', year: '', fuelType: '',
    transmission: '', color: '', steering: '', minPrice: '', maxPrice: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  const fetchVehicles = useCallback(async () => {
    setError(false);
    try {
      const { data } = await publicApiClient.get('/vehicles');
      setVehicles(data.vehicles || []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const brands = useMemo(() => [...new Set(vehicles.map(v => v.manufacturer).filter(Boolean))].sort(), [vehicles]);
  const years = useMemo(() => [...new Set(vehicles.map(v => String(v.year)).filter(Boolean))].sort((a, b) => b - a), [vehicles]);
  const fuelTypes = useMemo(() => [...new Set(vehicles.map(v => v.fuelType).filter(Boolean))].sort(), [vehicles]);
  const transmissions = useMemo(() => [...new Set(vehicles.map(v => v.transmission).filter(Boolean))].sort(), [vehicles]);
  const colors = useMemo(() => [...new Set(vehicles.map(v => v.color).filter(Boolean))].sort(), [vehicles]);
  const categories = useMemo(() => ['All', ...new Set(vehicles.map(v => v.category).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)), [vehicles]);

  const filteredAndSorted = useMemo(() => {
    let result = vehicles.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !q || [v.manufacturer, v.model, v.year, v.category, v.color, v.vehicleId]
        .filter(Boolean).some(f => String(f).toLowerCase().includes(q));
      const matchCategory = activeCategory === 'All' || v.category === activeCategory;
      const af = appliedFilters;
      const matchBrand = !af.brand || v.manufacturer === af.brand;
      const matchModel = !af.model || String(v.model).toLowerCase().includes(af.model.toLowerCase());
      const matchYear = !af.year || String(v.year) === af.year;
      const matchFuel = !af.fuelType || v.fuelType === af.fuelType;
      const matchTransmission = !af.transmission || v.transmission === af.transmission;
      const matchColor = !af.color || v.color === af.color;
      const matchSteering = !af.steering || v.steering === af.steering;
      const price = Number(v.sellingPrice) || 0;
      const matchMinPrice = !af.minPrice || price >= Number(af.minPrice);
      const matchMaxPrice = !af.maxPrice || price <= Number(af.maxPrice);
      return matchSearch && matchCategory && matchBrand && matchModel && matchYear && matchFuel && matchTransmission && matchColor && matchSteering && matchMinPrice && matchMaxPrice;
    });

    result = [...result].sort((a, b) => {
      if (activeSort === 'price_asc') return (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0);
      if (activeSort === 'price_desc') return (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0);
      if (activeSort === 'year_desc') return (Number(b.year) || 0) - (Number(a.year) || 0);
      if (activeSort === 'year_asc') return (Number(a.year) || 0) - (Number(b.year) || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return result;
  }, [vehicles, search, activeCategory, appliedFilters, activeSort]);

  const activeFilterCount = useMemo(() => Object.values(appliedFilters).filter(v => v).length, [appliedFilters]);

  const applyFilters = () => { setAppliedFilters({ ...filters }); setFilterVisible(false); };
  const resetFilters = () => {
    const empty = { brand: '', model: '', year: '', fuelType: '', transmission: '', color: '', steering: '', minPrice: '', maxPrice: '' };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const renderVehicle = ({ item }) => {
    const imgUri = resolveAssetUrl(item.mainImage || item.allImages?.[0] || item.images?.[0]);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CarDetail', { vehicleId: item.id })}
        activeOpacity={0.88}
      >
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
            <MaterialCommunityIcons name="car-side" size={36} color="#ccc" />
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.48)']} style={styles.cardImgOverlay}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#22c55e' : '#f59e0b' }]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.cardBrand} numberOfLines={1}>{item.manufacturer}</Text>
          <Text style={styles.cardName} numberOfLines={1}>{item.model} {item.year}</Text>
          <View style={styles.cardSpecRow}>
            <View style={styles.cardSpec}>
              <MaterialCommunityIcons name="speedometer" size={11} color="#888" />
              <Text style={styles.cardSpecText}>{item.transmission || 'Auto'}</Text>
            </View>
            <View style={styles.cardSpec}>
              <MaterialCommunityIcons name="gas-station" size={11} color="#888" />
              <Text style={styles.cardSpecText}>{item.fuelType || 'Petrol'}</Text>
            </View>
          </View>
          <View style={styles.cardSpecRow}>
            <View style={styles.cardSpec}>
              <MaterialCommunityIcons name="palette" size={11} color="#888" />
              <Text style={styles.cardSpecText}>{item.color || '–'}</Text>
            </View>
            <View style={styles.cardSpec}>
              <MaterialCommunityIcons name="steering" size={11} color="#888" />
              <Text style={styles.cardSpecText}>{item.steering || '–'}</Text>
            </View>
          </View>
          <Text style={styles.cardPrice}>{formatCurrency(item.sellingPrice)} AFN</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ label, options, field }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <TouchableOpacity
          style={[styles.filterChip, !filters[field] && styles.filterChipActive]}
          onPress={() => setFilters(p => ({ ...p, [field]: '' }))}
        >
          <Text style={[styles.filterChipText, !filters[field] && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterChip, filters[field] === opt && styles.filterChipActive]}
            onPress={() => setFilters(p => ({ ...p, [field]: p[field] === opt ? '' : opt }))}
          >
            <Text style={[styles.filterChipText, filters[field] === opt && styles.filterChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      {/* HEADER */}
      <LinearGradient colors={[DARK, PRIMARY]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Car Inventory</Text>
            <Text style={styles.headerSub}>{filteredAndSorted.length} of {vehicles.length} vehicles</Text>
          </View>
        </View>
        {/* SEARCH */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search brand, model, ID..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={17} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={[styles.filterBtn, activeFilterCount > 0 && { backgroundColor: ACCENT }]}
          >
            <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortVisible(true)} style={styles.sortBtn}>
            <MaterialCommunityIcons name="sort" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CATEGORY TABS */}
      <View style={styles.catRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ACTIVE FILTERS ROW */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {Object.entries(appliedFilters).filter(([, v]) => v).map(([k, v]) => (
              <TouchableOpacity
                key={k}
                style={styles.activeFilterChip}
                onPress={() => {
                  const newFilters = { ...appliedFilters, [k]: '' };
                  setFilters(newFilters);
                  setAppliedFilters(newFilters);
                }}
              >
                <Text style={styles.activeFilterChipText}>{v}</Text>
                <MaterialCommunityIcons name="close" size={12} color={PRIMARY} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={resetFilters} style={styles.clearFiltersBtn}>
              <Text style={styles.clearFiltersBtnText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorView}>
          <MaterialCommunityIcons name="wifi-off" size={52} color="#ccc" />
          <Text style={styles.errorText}>Could not load vehicles.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchVehicles(); }} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAndSorted}
          keyExtractor={i => String(i.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          renderItem={renderVehicle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVehicles(); }} colors={[PRIMARY]} tintColor={PRIMARY} />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <MaterialCommunityIcons name="car-off" size={52} color="#ccc" />
              <Text style={styles.emptyText}>No vehicles found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FILTER MODAL */}
      <Modal visible={filterVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Vehicles</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            <FilterChip label="Brand" options={brands} field="brand" />
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Model</Text>
              <TextInput
                style={styles.filterTextInput}
                placeholder="e.g. Corolla, Civic..."
                value={filters.model}
                onChangeText={v => setFilters(p => ({ ...p, model: v }))}
              />
            </View>
            <FilterChip label="Year" options={years} field="year" />
            <FilterChip label="Fuel Type" options={fuelTypes} field="fuelType" />
            <FilterChip label="Transmission" options={transmissions} field="transmission" />
            <FilterChip label="Color" options={colors} field="color" />
            <FilterChip label="Steering" options={['Left', 'Right']} field="steering" />
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Price Range (AFN)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.filterTextInput, { flex: 1 }]}
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChangeText={v => setFilters(p => ({ ...p, minPrice: v }))}
                  keyboardType="numeric"
                />
                <Text style={{ color: '#aaa', marginHorizontal: 8 }}>–</Text>
                <TextInput
                  style={[styles.filterTextInput, { flex: 1 }]}
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChangeText={v => setFilters(p => ({ ...p, maxPrice: v }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyFilters} style={styles.applyBtn}>
              <LinearGradient colors={[PRIMARY, DARK]} style={styles.applyBtnInner}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SORT MODAL */}
      <Modal visible={sortVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setSortVisible(false)}>
        <View style={styles.sortModalRoot}>
          <Text style={styles.modalTitle}>Sort By</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, activeSort === opt.key && styles.sortOptionActive]}
              onPress={() => { setActiveSort(opt.key); setSortVisible(false); }}
            >
              <Text style={[styles.sortOptionText, activeSort === opt.key && styles.sortOptionTextActive]}>{opt.label}</Text>
              {activeSort === opt.key && <MaterialCommunityIcons name="check" size={20} color={PRIMARY} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { paddingTop: Platform.OS === 'ios' ? 52 : 36, paddingBottom: 14, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 13, color: '#222', height: 44 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  filterBadge: { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { fontSize: 8, fontWeight: '800', color: ACCENT },
  sortBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  catRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb' },
  catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#555' },
  catChipTextActive: { color: '#fff' },
  activeFiltersRow: { paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  activeFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: PRIMARY + '10', borderRadius: 14, borderWidth: 1, borderColor: PRIMARY + '30' },
  activeFilterChipText: { fontSize: 11, color: PRIMARY, fontWeight: '600' },
  clearFiltersBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: '#fee2e2' },
  clearFiltersBtnText: { fontSize: 11, color: '#dc2626', fontWeight: '700' },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#999', marginTop: 12, textAlign: 'center', fontSize: 14 },
  retryBtn: { marginTop: 16, backgroundColor: PRIMARY, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 22 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  columnWrapper: { gap: 12, paddingHorizontal: 14 },
  list: { paddingTop: 14, paddingBottom: 30 },
  card: { flex: 1, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 4 },
  cardImg: { width: '100%', height: 120 },
  cardImgPlaceholder: { backgroundColor: '#e8ecf0', justifyContent: 'center', alignItems: 'center' },
  cardImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9 },
  statusBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardBody: { padding: 11 },
  cardBrand: { fontSize: 10, color: ACCENT, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardName: { fontSize: 14, fontWeight: '800', color: '#1a202c', marginTop: 2 },
  cardSpecRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  cardSpec: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardSpecText: { fontSize: 10, color: '#888' },
  cardPrice: { fontSize: 14, fontWeight: '900', color: PRIMARY, marginTop: 8 },
  emptyView: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: '#888', fontSize: 16, fontWeight: '700' },
  emptySubText: { color: '#aaa', fontSize: 13 },
  modalRoot: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingTop: Platform.OS === 'ios' ? 52 : 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a202c' },
  filterGroup: { marginTop: 20 },
  filterGroupLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  filterChipTextActive: { color: '#fff' },
  filterTextInput: { height: 44, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb', color: '#222' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  resetBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  resetBtnText: { color: '#666', fontWeight: '700', fontSize: 15 },
  applyBtn: { flex: 2, height: 50, borderRadius: 14, overflow: 'hidden' },
  applyBtnInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  sortModalRoot: { padding: 24, paddingTop: Platform.OS === 'ios' ? 40 : 24, backgroundColor: '#fff' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sortOptionActive: { backgroundColor: PRIMARY + '08' },
  sortOptionText: { fontSize: 15, color: '#555', fontWeight: '600' },
  sortOptionTextActive: { color: PRIMARY, fontWeight: '800' },
});
