import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Share, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Button, Card, Divider, IconButton, Chip, TouchableRipple, ActivityIndicator } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/constants';
import { downloadAndSharePdf } from '../utils/pdf';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';
import { toAFN } from '../utils/currency';
import ResponsiveAmount from '../components/ResponsiveAmount';

const W = Dimensions.get('window').width;

export default function VehicleDetailScreen({ navigation, route }) {
  const vehicle = route.params?.vehicle;
  const { user } = useAuth();
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [deleteId, setDeleteId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    if (vehicle?.id) {
      loadDetail();
    } else {
      setLoading(false);
    }
  }, [vehicle]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [vRes, costsRes, historyRes, imagesRes, sharingRes, ratesRes] = await Promise.all([
        apiClient.get(`/vehicles/${vehicle.id}`).catch(() => ({ data: vehicle })),
        apiClient.get(`/vehicles/${vehicle.id}/costs`).catch(() => ({ data: [] })),
        apiClient.get(`/vehicles/${vehicle.id}/history`).catch(() => ({ data: [] })),
        apiClient.get(`/vehicles/${vehicle.id}/images`).catch(() => ({ data: [] })),
        apiClient.get(`/vehicles/${vehicle.id}/sharing`).catch(() => ({ data: [] })),
        apiClient.get('/currency/rates').catch(() => ({ data: {} })),
      ]);
      const vData = vRes.data?.data || vRes.data || vehicle;
      setData({
        ...vData,
        costs: Array.isArray(costsRes.data?.data) ? costsRes.data.data : Array.isArray(costsRes.data) ? costsRes.data : [],
        history: Array.isArray(historyRes.data?.data) ? historyRes.data.data : Array.isArray(historyRes.data) ? historyRes.data : [],
        images: Array.isArray(imagesRes.data?.data) ? imagesRes.data.data : Array.isArray(imagesRes.data) ? imagesRes.data : (vData.images || []),
        sharingPersons: Array.isArray(sharingRes.data?.data) ? sharingRes.data.data : Array.isArray(sharingRes.data) ? sharingRes.data : (vData.sharingPersons || []),
      });
      setExchangeRates(ratesRes.data?.data || ratesRes.data || {});
    } catch (e) {
      setData(vehicle);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/vehicles/${deleteId}`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to delete');
    }
    setDeleteId(null);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const vData = data || vehicle || {};
      await downloadAndSharePdf(`/vehicles/${vehicle.id}/pdf`, `vehicle-${vData.vehicleId || vehicle.id}.pdf`, 'Vehicle PDF');
      Alert.alert('Saved', 'Vehicle PDF is ready to share.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to download vehicle PDF');
    } finally {
      setDownloading(false);
    }
  };

  const v = data || vehicle || {};
  const sellingCurrency = v.sellingPriceCurrency || v.baseCurrency || 'AFN';

  const handleShare = async () => {
    try {
      const message = `${v.manufacturer} ${v.model} (${v.year})\nPrice: ${formatCurrency(v.sellingPrice, sellingCurrency)}\nStatus: ${v.status}\nChassis: ${v.chassisNumber}`;
      await Share.share({ message, title: 'Vehicle Details' });
    } catch (e) {}
  };

  const canWrite = user && ['Super Admin', 'Owner', 'Manager', 'Inventory & Sales'].includes(user.role);
  const coreCost = [v.basePurchasePrice, v.transportCostToDubai, v.importCostToAfghanistan, v.repairCost]
    .reduce((s, x) => s + (Number(x) || 0), 0);
  const images = v.images || [];
  const costs = v.costs || [];
  const coreStages = ['base purchase', 'base purchase price', 'transport to dubai', 'import to afghanistan', 'repair', 'repair cost'];
  const extraCosts = costs.filter(cost => !coreStages.includes(String(cost.stage || cost.type || '').trim().toLowerCase()));
  const extraCostAFN = extraCosts.reduce((sum, cost) => sum + (Number(cost.amountInPKR) || toAFN(cost.amount, cost.currency, exchangeRates)), 0);
  const calculatedCostAFN = toAFN(coreCost, v.baseCurrency || 'AFN', exchangeRates) + extraCostAFN;
  const totalCostAFN = Number(v.totalCostPKR) > 0 ? Number(v.totalCostPKR) : calculatedCostAFN;
  const sellingPriceAFN = toAFN(v.sellingPrice, sellingCurrency, exchangeRates);
  const profitAFN = sellingPriceAFN - totalCostAFN;
  const history = v.history || [];

  const tabs = [
    { key: 'info', label: 'Info', icon: 'information-outline' },
    { key: 'costs', label: 'Costs', icon: 'cash-multiple' },
    { key: 'images', label: 'Images', icon: 'image-multiple' },
    { key: 'sharing', label: 'Partners', icon: 'account-group-outline' },
    { key: 'reference', label: 'Reference', icon: 'account-outline' },
    { key: 'history', label: 'History', icon: 'clock-outline' },
  ];

  if (loading) {
    return (
      <ScreenWrapper title="Vehicle Detail" navigation={navigation} back>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={{ marginTop: 12, color: c.onSurfaceVariant }}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={`${v.manufacturer || ''} ${v.model || ''}`}
      navigation={navigation}
      back
      actions={
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <IconButton icon="share-variant" size={20} iconColor={c.onSurface} onPress={handleShare} />
          <IconButton icon={downloading ? 'loading' : 'file-pdf-box'} size={20} iconColor={c.onSurface} onPress={handleDownloadPDF} />
        </View>
      }
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <LinearGradient colors={[c.primary + '15', c.primary + '05']} style={styles.heroCard}>
          {/* Thumbnail image if available */}
          {images.length > 0 && resolveAssetUrl(images[0]?.path || images[0]?.imageUrl || images[0]?.url) && (
            <Image
              source={{ uri: resolveAssetUrl(images[0]?.path || images[0]?.imageUrl || images[0]?.url) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: c.onSurface }]}>{v.manufacturer} {v.model}</Text>
              <Text style={[styles.heroSub, { color: c.onSurfaceVariant }]}>{v.vehicleId} • {v.year} • {v.category}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <StatusChip label={v.status} />
                {v.steering && <StatusChip label={v.steering} />}
                {v.monolithicCut && <StatusChip label={v.monolithicCut} />}
              </View>
            </View>
            <View style={[styles.priceBadge, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.priceLabel, { color: c.primary }]}>Price</Text>
              <ResponsiveAmount style={[styles.priceVal, { color: c.primary }]}>{formatCurrency(v.sellingPrice, sellingCurrency)}</ResponsiveAmount>
              <Text style={{ fontSize: 10, color: c.onSurfaceVariant, marginTop: 2 }}>{sellingCurrency}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Mileage', value: v.mileage ? `${Number(v.mileage).toLocaleString()} km` : '-', icon: 'speedometer' },
            { label: 'Fuel', value: v.fuelType || '-', icon: 'gas-station' },
            { label: 'Trans.', value: v.transmission || '-', icon: 'car-shift-pattern' },
            { label: 'Profit', value: formatCurrency(profitAFN, 'AFN'), icon: 'trending-up', color: profitAFN >= 0 ? c.success : c.error },
          ].map((st, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <MaterialCommunityIcons name={st.icon} size={18} color={st.color || c.primary} />
              <ResponsiveAmount style={[styles.statVal, { color: c.onSurface, textAlign: 'center' }]}>{st.value}</ResponsiveAmount>
              <Text style={[styles.statLbl, { color: c.onSurfaceVariant }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: c.surfaceVariant }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, tab === t.key && { backgroundColor: c.primary }]}
                onPress={() => setTab(t.key)}
              >
                <MaterialCommunityIcons name={t.icon} size={14} color={tab === t.key ? '#fff' : c.onSurfaceVariant} />
                <Text style={[styles.tabText, { color: tab === t.key ? '#fff' : c.onSurfaceVariant }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ───── Info Tab ───── */}
        {tab === 'info' && (
          <Card style={[styles.card, { backgroundColor: c.card }]}>
            <Card.Content>
              <Text style={[styles.sectionHead, { color: c.primary }]}>Vehicle Identity</Text>
              {[
                { label: 'Vehicle ID', value: v.vehicleId },
                { label: 'Manufacturer', value: v.manufacturer },
                { label: 'Model', value: v.model },
                { label: 'Year', value: String(v.year || '-') },
                { label: 'Color', value: v.color },
                { label: 'Category', value: v.category },
                { label: 'Chassis / VIN', value: v.chassisNumber },
                { label: 'Engine Number', value: v.engineNumber },
                { label: 'Engine Type', value: v.engineType },
                { label: 'Fuel Type', value: v.fuelType },
                { label: 'Transmission', value: v.transmission },
                { label: 'Mileage', value: v.mileage ? `${Number(v.mileage).toLocaleString()} km` : null },
                { label: 'Plate No.', value: v.plateNo },
                { label: 'Vehicle License', value: v.vehicleLicense },
                { label: 'Steering', value: v.steering },
                { label: 'Body Type', value: v.monolithicCut },
                { label: 'Status', value: v.status },
              ].filter(r => r.value).map((row, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                  <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* ───── Costs Tab ───── */}
        {tab === 'costs' && (
          <View style={{ gap: 10 }}>
            {/* Summary card */}
            <Card style={[styles.card, { backgroundColor: c.card }]}>
              <Card.Content>
                <Text style={[styles.sectionHead, { color: c.primary }]}>Cost Breakdown</Text>
                {[
                  { label: 'Base Purchase Price', value: formatCurrency(v.basePurchasePrice, v.baseCurrency), icon: 'car-key' },
                  { label: 'Transport to Dubai', value: formatCurrency(v.transportCostToDubai, v.baseCurrency), icon: 'truck-delivery' },
                  { label: 'Import to Afghanistan', value: formatCurrency(v.importCostToAfghanistan, v.baseCurrency), icon: 'airplane-landing' },
                  { label: 'Repair Cost', value: formatCurrency(v.repairCost, v.baseCurrency), icon: 'tools' },
                ].map((row, i) => (
                  <View key={i} style={[styles.costRow, { borderBottomColor: c.border }]}>
                    <LinearGradient colors={[c.primary + '15', c.primary + '05']} style={styles.costIcon}>
                      <MaterialCommunityIcons name={row.icon} size={16} color={c.primary} />
                    </LinearGradient>
                    <Text style={[styles.infoLabel, { color: c.onSurfaceVariant, flex: 1 }]}>{row.label}</Text>
                    <ResponsiveAmount style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</ResponsiveAmount>
                  </View>
                ))}
                <View style={[styles.totalRow, { backgroundColor: c.primaryContainer, marginTop: 8 }]}>
                  <Text style={[styles.totalLabel, { color: c.primary }]}>Core Cost</Text>
                  <ResponsiveAmount style={[styles.totalVal, { color: c.primary }]}>{formatCurrency(coreCost, v.baseCurrency)}</ResponsiveAmount>
                </View>
                <View style={[styles.totalRow, { backgroundColor: c.primary + '10', marginTop: 6 }]}> 
                  <Text style={[styles.totalLabel, { color: c.primary }]}>Total Cost (AFN)</Text>
                  <ResponsiveAmount style={[styles.totalVal, { color: c.primary }]}>{formatCurrency(totalCostAFN, 'AFN')}</ResponsiveAmount>
                </View>
                <View style={[styles.totalRow, { backgroundColor: profitAFN >= 0 ? c.success + '18' : c.error + '18', marginTop: 6 }]}> 
                  <Text style={[styles.totalLabel, { color: profitAFN >= 0 ? c.success : c.error }]}>Expected Profit (AFN)</Text>
                  <ResponsiveAmount style={[styles.totalVal, { color: profitAFN >= 0 ? c.success : c.error }]}>{formatCurrency(profitAFN, 'AFN')}</ResponsiveAmount>
                </View>
              </Card.Content>
            </Card>

            {/* Additional cost entries from backend */}
            {extraCosts.length > 0 && (
              <Card style={[styles.card, { backgroundColor: c.card }]}>
                <Card.Content>
                  <Text style={[styles.sectionHead, { color: c.primary }]}>Additional Costs</Text>
                  {extraCosts.map((cost, i) => (
                    <View key={i} style={[styles.infoRow, { borderBottomColor: c.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.onSurface, fontWeight: '600', fontSize: 13 }}>{cost.description || cost.stage || cost.type || 'Cost'}</Text>
                        {cost.date && <Text style={{ color: c.onSurfaceVariant, fontSize: 11 }}>{new Date(cost.date).toLocaleDateString()}</Text>}
                      </View>
                      <ResponsiveAmount style={{ color: c.onSurface, fontWeight: '700', fontSize: 13, maxWidth: '48%' }}>{formatCurrency(cost.amount, cost.currency)}</ResponsiveAmount>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* ───── Images Tab ───── */}
        {tab === 'images' && (
          <View>
            {images.length === 0 ? (
              <EmptyState message="No images uploaded" icon="📷" />
            ) : (
              <View style={{ gap: 10 }}>
                {/* Main large image */}
                <View style={[styles.mainImageContainer, { backgroundColor: c.surfaceVariant }]}>
                  <Image
                    source={{ uri: resolveAssetUrl(images[selectedImage]?.path || images[selectedImage]?.imageUrl || images[selectedImage]?.url) }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                  {images.length > 1 && (
                    <View style={styles.imageCounter}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{selectedImage + 1}/{images.length}</Text>
                    </View>
                  )}
                </View>
                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                    {images.map((img, i) => (
                      <TouchableOpacity key={i} onPress={() => setSelectedImage(i)}>
                        <Image
                          source={{ uri: resolveAssetUrl(img.path || img.imageUrl || img.url) }}
                          style={[styles.thumbnail, selectedImage === i && { borderColor: c.primary, borderWidth: 2.5 }]}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        )}

        {/* ───── Partners Tab ───── */}
        {tab === 'sharing' && (
          v.sharingPersons?.length > 0 ? (
            <View style={{ gap: 10 }}>
              {v.sharingPersons.map((p, i) => (
                <Card key={i} style={[styles.card, { backgroundColor: c.card }]}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontWeight: '700', color: c.primary, fontSize: 15 }}>{p.personName || p.customer?.fullName || `Partner ${i+1}`}</Text>
                      <Chip compact style={{ backgroundColor: c.primary + '15' }} textStyle={{ color: c.primary, fontSize: 11 }}>
                        {p.sharePercentage || p.percentage}%
                      </Chip>
                    </View>
                    {[
                      { label: 'Investment', value: formatCurrency(p.investmentAmount, p.investmentCurrency) },
                      { label: 'Currency', value: p.investmentCurrency || '-' },
                      { label: 'Phone', value: p.phoneNumber || p.phone || p.customer?.phoneNumber },
                    ].filter(r => r.value && r.value !== '-').map((row, j) => (
                      <View key={j} style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                        <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : <EmptyState message="No sharing partners" icon="🤝" />
        )}

        {/* ───── Reference Tab ───── */}
        {tab === 'reference' && (
          (v.referencePerson?.fullName || v.refFullName) ? (
            <Card style={[styles.card, { backgroundColor: c.card }]}>
              <Card.Content>
                <Text style={[styles.sectionHead, { color: c.primary }]}>Reference Person</Text>
                {[
                  { label: 'Full Name', value: v.referencePerson?.fullName || v.refFullName },
                  { label: 'Tazkira', value: v.referencePerson?.tazkiraNumber || v.refTazkiraNumber },
                  { label: 'Phone', value: v.referencePerson?.phoneNumber || v.refPhoneNumber },
                  { label: 'Address', value: v.referencePerson?.address || v.refAddress },
                ].filter(r => r.value).map((row, i) => (
                  <View key={i} style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                    <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ) : <EmptyState message="No reference person" icon="👤" />
        )}

        {/* ───── History Tab ───── */}
        {tab === 'history' && (
          <Card style={[styles.card, { backgroundColor: c.card }]}>
            <Card.Content>
              <Text style={[styles.sectionHead, { color: c.primary }]}>Edit History</Text>
              {history.length === 0 ? (
                <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 }}>No edit history recorded</Text>
              ) : history.map((h, i) => (
                <View key={i} style={[styles.historyItem, { borderBottomColor: c.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <LinearGradient colors={[c.primary + '20', c.primary + '08']} style={{ width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="pencil-outline" size={14} color={c.primary} />
                      </LinearGradient>
                      <Text style={{ fontWeight: '700', color: c.onSurface, fontSize: 13 }}>{h.editedByUser?.fullName || h.editedBy || 'Unknown'}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: c.onSurfaceVariant }}>{h.editedAt ? new Date(h.editedAt).toLocaleString() : ''}</Text>
                  </View>
                  {h.reason && <Text style={{ fontSize: 12, color: c.primary, fontWeight: '600', marginTop: 2 }}>Reason: {h.reason}</Text>}
                  {h.changes && typeof h.changes === 'object' && (
                    <View style={{ marginTop: 4 }}>
                      {Object.entries(h.changes).slice(0, 5).map(([field, change], fi) => (
                        <Text key={fi} style={{ fontSize: 11, color: c.onSurfaceVariant }}>
                          {field}: {JSON.stringify(change?.from ?? '-')} → {JSON.stringify(change?.to ?? change)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        {canWrite && v.status !== 'Sold' && (
          <View style={styles.actionRow}>
            <Button mode="contained" onPress={() => navigation.navigate('VehicleForm', { vehicle: v })} style={{ flex: 1 }}>
              Edit Vehicle
            </Button>
            <Button mode="outlined" onPress={() => setDeleteId(v.id)} style={{ flex: 1 }} textColor={c.error}>
              Delete
            </Button>
          </View>
        )}
        {v.status === 'Sold' && (
          <View style={[styles.soldBadge, { backgroundColor: c.error + '12' }]}>
            <MaterialCommunityIcons name="lock" size={16} color={c.error} />
            <Text style={{ color: c.error, fontWeight: '700', fontSize: 13 }}>This vehicle has been sold and is locked.</Text>
          </View>
        )}
        <View style={{ height: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20 }} />
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This cannot be undone."
        onConfirm={handleDelete}
        onDismiss={() => setDeleteId(null)}
        destructive
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e8ecf0', overflow: 'hidden' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.12, borderRadius: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, marginTop: 2 },
  priceBadge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  priceLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  priceVal: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 11, fontWeight: '800' },
  statLbl: { fontSize: 9, fontWeight: '600' },
  tabBar: { borderRadius: 12, paddingVertical: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginHorizontal: 3 },
  tabText: { fontSize: 11, fontWeight: '700' },
  card: { borderRadius: 16, overflow: 'hidden' },
  sectionHead: { fontWeight: '800', fontSize: 15, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  infoVal: { fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  costIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12 },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalVal: { fontSize: 16, fontWeight: '900' },
  mainImageContainer: { borderRadius: 16, overflow: 'hidden', height: W * 0.6, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imageCounter: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  thumbnail: { width: 72, height: 72, borderRadius: 10 },
  historyItem: { paddingVertical: 12, borderBottomWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  soldBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14 },
});
