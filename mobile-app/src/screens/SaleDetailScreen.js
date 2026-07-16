import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Share, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Divider, IconButton, Portal, Dialog, Chip, TouchableRipple, ActivityIndicator } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, CURRENCIES } from '../utils/constants';
import { downloadAndSharePdf } from '../utils/pdf';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';

const W = Dimensions.get('window').width;

export default function SaleDetailScreen({ navigation, route }) {
  const saleParam = route.params?.sale;
  const saleIdParam = route.params?.saleId;
  const { user } = useAuth();
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [deleteId, setDeleteId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Installment payment dialog
  const [payDialog, setPayDialog] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', currency: 'AFN', date: new Date().toISOString().split('T')[0], note: '' });
  const [paying, setPaying] = useState(false);

  const targetId = saleIdParam || saleParam?.id;

  useEffect(() => {
    if (targetId) {
      loadDetail();
    } else {
      setLoading(false);
    }
  }, [targetId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        apiClient.get(`/sales/${targetId}`).catch(() => ({ data: saleParam })),
        apiClient.get(`/sales/${targetId}/payments`).catch(() => ({ data: {} })),
      ]);
      const sData = sRes.data?.data || sRes.data || saleParam;
      setData(sData);
      const pData = pRes.data;
      setPayments(Array.isArray(pData?.data) ? pData.data : Array.isArray(pData) ? pData : []);
      if (pData?.summary) setPaymentSummary(pData.summary);
    } catch (e) {
      setData(saleParam);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/sales/${deleteId}`);
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed');
    }
    setDeleteId(null);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const sData = data || saleParam || {};
      await downloadAndSharePdf(`/sales/${targetId}/invoice`, `invoice-${sData.saleId || targetId}.pdf`, 'Invoice PDF');
      Alert.alert('Saved', 'Invoice PDF is ready to share.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const sData = data || saleParam || {};
      const message = `Sale: ${sData.saleId}\nVehicle: ${sData.vehicle?.manufacturer} ${sData.vehicle?.model}\nBuyer: ${sData.customer?.fullName || sData.buyerName}\nPrice: ${formatCurrency(sData.sellingPrice, sData.paymentCurrency)}`;
      await Share.share({ message, title: 'Sale Details' });
    } catch (e) {}
  };

  const handleRecordPayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      Alert.alert('Error', 'Enter a valid payment amount');
      return;
    }
    setPaying(true);
    try {
      await apiClient.post(`/sales/${targetId}/payments`, {
        amount: Number(payForm.amount),
        currency: payForm.currency,
        date: payForm.date,
        note: payForm.note,
      });
      setPayDialog(false);
      setPayForm({ amount: '', currency: 'AFN', date: new Date().toISOString().split('T')[0], note: '' });
      loadDetail();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to record payment');
    } finally {
      setPaying(false);
    }
  };

  const canWrite = user && !['Viewer'].includes(user.role);
  const s = data || saleParam || {};
  const remaining = Number(s.remainingAmount || 0);
  const isPaid = remaining <= 0;

  const tabs = [
    { key: 'info', label: 'Info', icon: 'information-outline' },
    { key: 'payments', label: 'Payments', icon: 'cash-multiple' },
    ...(s.saleType === 'Exchange Car' ? [{ key: 'exchange', label: 'Exchange', icon: 'car-arrow-right' }] : []),
  ];

  if (loading) {
    return (
      <ScreenWrapper title="Sale Detail" navigation={navigation} back>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={{ marginTop: 12, color: c.onSurfaceVariant }}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={s.saleId || 'Sale Detail'}
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
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: c.onSurface }]}>{s.vehicle?.manufacturer} {s.vehicle?.model}</Text>
              <Text style={[styles.heroSub, { color: c.onSurfaceVariant }]}>{s.saleId} • {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : ''}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <StatusChip label={s.saleType || 'Sale'} />
                <StatusChip label={isPaid ? 'Paid' : (Number(s.downPayment) > 0 ? 'Partial' : 'Pending')} />
              </View>
            </View>
            <View style={[styles.priceBadge, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.priceLabel, { color: c.primary }]}>Price</Text>
              <Text style={[styles.priceVal, { color: c.primary }]}>{formatCurrency(s.sellingPrice, s.paymentCurrency)}</Text>
              {s.paymentCurrency && s.paymentCurrency !== 'AFN' && (
                <Text style={{ fontSize: 9, color: c.onSurfaceVariant, marginTop: 2 }}>{s.paymentCurrency}</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Down Payment', value: formatCurrency(s.downPayment, s.paymentCurrency), icon: 'cash', color: c.success },
            { label: 'Remaining', value: formatCurrency(remaining, s.paymentCurrency), icon: 'clock-outline', color: remaining > 0 ? c.error : c.success },
            { label: 'Profit', value: formatCurrency(s.profit, s.paymentCurrency), icon: 'trending-up', color: '#8b5cf6' },
            { label: 'Commission', value: formatCurrency(s.commission, s.paymentCurrency), icon: 'handshake', color: '#e65100' },
          ].map((st, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: c.card }, paperTheme.shadows?.sm]}>
              <MaterialCommunityIcons name={st.icon} size={18} color={st.color || c.primary} />
              <Text style={[styles.statVal, { color: c.onSurface }]}>{st.value}</Text>
              <Text style={[styles.statLbl, { color: c.onSurfaceVariant }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Profit Summary */}
        {(s.ownerShare !== undefined || s.totalCost !== undefined) && (
          <View style={[styles.profitCard, { backgroundColor: c.cardAlt || c.surfaceVariant }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Total Cost</Text>
                <Text style={{ color: c.onSurface, fontWeight: '800', fontSize: 14 }}>{formatCurrency(s.totalCost, s.paymentCurrency)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: c.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Owner Share</Text>
                <Text style={{ color: c.success, fontWeight: '800', fontSize: 14 }}>{formatCurrency(s.ownerShare, s.paymentCurrency)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: c.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Sold By</Text>
                <Text style={{ color: c.onSurface, fontWeight: '700', fontSize: 12 }} numberOfLines={1}>{s.soldByUser?.fullName || 'Staff'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: c.surfaceVariant }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, tab === t.key && { backgroundColor: c.primary }]}
                onPress={() => setTab(t.key)}
              >
                <MaterialCommunityIcons name={t.icon} size={16} color={tab === t.key ? '#fff' : c.onSurfaceVariant} />
                <Text style={[styles.tabText, { color: tab === t.key ? '#fff' : c.onSurfaceVariant }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ───── Info Tab ───── */}
        {tab === 'info' && (
          <Card style={[styles.card, { backgroundColor: c.card }]}>
            <Card.Content>
              <Text style={[styles.sectionHead, { color: c.primary }]}>Buyer Information</Text>
              {[
                { label: 'Name', value: s.buyerName || s.customer?.fullName || '-' },
                { label: "Father's Name", value: s.buyerFatherName || '-' },
                { label: 'Phone', value: s.buyerPhone || s.customer?.phoneNumber || '-' },
                { label: 'Province', value: s.buyerProvince || '-' },
                { label: 'District', value: s.buyerDistrict || '-' },
                { label: 'Village', value: s.buyerVillage || '-' },
                { label: 'Address', value: s.buyerAddress || '-' },
                { label: 'Tazkira', value: s.buyerIdNumber || '-' },
              ].map((row, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                  <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                </View>
              ))}

              <Divider style={{ marginVertical: 16 }} />
              <Text style={[styles.sectionHead, { color: c.primary }]}>Seller Information</Text>
              {[
                { label: 'Name', value: s.sellerName || '-' },
                { label: "Father's Name", value: s.sellerFatherName || '-' },
                { label: 'Phone', value: s.sellerPhone || '-' },
                { label: 'Province', value: s.sellerProvince || '-' },
                { label: 'Address', value: s.sellerAddress || '-' },
                { label: 'Tazkira', value: s.sellerIdNumber || '-' },
              ].filter(r => r.value !== '-').map((row, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                  <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                </View>
              ))}

              {s.saleType === 'Licensed Car' && s.trafficTransferDate && (
                <>
                  <Divider style={{ marginVertical: 16 }} />
                  <Text style={[styles.sectionHead, { color: c.primary }]}>Licensed Car Details</Text>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Transfer Date</Text>
                    <Text style={[styles.infoVal, { color: c.onSurface }]}>{s.trafficTransferDate}</Text>
                  </View>
                  {s.licensePersonName && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>License Person</Text>
                      <Text style={[styles.infoVal, { color: c.onSurface }]}>{s.licensePersonName}</Text>
                    </View>
                  )}
                </>
              )}

              {(s.witnessName1 || s.witnessName2) && (
                <>
                  <Divider style={{ marginVertical: 16 }} />
                  <Text style={[styles.sectionHead, { color: c.primary }]}>Witnesses</Text>
                  {s.witnessName1 && <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Witness 1</Text><Text style={[styles.infoVal, { color: c.onSurface }]}>{s.witnessName1}</Text></View>}
                  {s.witnessName2 && <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Witness 2</Text><Text style={[styles.infoVal, { color: c.onSurface }]}>{s.witnessName2}</Text></View>}
                </>
              )}

              {(s.notes || s.note2) && (
                <>
                  <Divider style={{ marginVertical: 16 }} />
                  <Text style={[styles.sectionHead, { color: c.primary }]}>Notes</Text>
                  {s.notes && <Text style={{ color: c.onSurface, fontSize: 13, lineHeight: 20 }}>{s.notes}</Text>}
                  {s.note2 && <Text style={{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 8, lineHeight: 20 }}>{s.note2}</Text>}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* ───── Payments Tab ───── */}
        {tab === 'payments' && (
          <View style={{ gap: 12 }}>
            {/* Payment summary */}
            <Card style={[styles.card, { backgroundColor: c.card }]}>
              <Card.Content>
                <Text style={[styles.sectionHead, { color: c.primary }]}>Payment Summary</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Total Price</Text>
                    <Text style={{ color: c.onSurface, fontWeight: '800', fontSize: 14 }}>{formatCurrency(paymentSummary?.sellingPrice ?? s.sellingPrice, s.paymentCurrency || 'AFN')}</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: c.border }} />
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Paid</Text>
                    <Text style={{ color: c.success, fontWeight: '800', fontSize: 14 }}>{formatCurrency(paymentSummary?.paidAmount ?? s.paidAmount, s.paymentCurrency || 'AFN')}</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: c.border }} />
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: c.onSurfaceVariant, fontSize: 11, fontWeight: '600' }}>Remaining</Text>
                    <Text style={{ color: remaining > 0 ? c.error : c.success, fontWeight: '800', fontSize: 14 }}>{formatCurrency(paymentSummary?.remainingAmount ?? remaining, s.paymentCurrency || 'AFN')}</Text>
                  </View>
                </View>
                <StatusChip label={paymentSummary?.paymentStatus || s.paymentStatus || (isPaid ? 'Paid' : 'Partial')} style={{ alignSelf: 'center' }} />
              </Card.Content>
            </Card>

            {/* Record new installment */}
            {canWrite && !isPaid && (
              <Button
                mode="contained"
                icon="cash-plus"
                onPress={() => setPayDialog(true)}
                style={{ borderRadius: 14, marginHorizontal: 0 }}
                labelStyle={{ fontWeight: '700' }}
              >
                Record Installment Payment
              </Button>
            )}

            {/* Payment history list */}
            <Card style={[styles.card, { backgroundColor: c.card }]}>
              <Card.Content>
                <Text style={[styles.sectionHead, { color: c.primary, marginBottom: 8 }]}>Payment History</Text>
                {payments.length === 0 ? (
                  <Text style={{ color: c.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 }}>No payments recorded</Text>
                ) : (
                  payments.map((p, i) => {
                    // Payment amount is stored in its entered currency. The
                    // CustomerLedger running balance is stored as AFN.
                    const storedCurrency = String(p.currency || '').trim().toUpperCase();
                    // Older sales created the initial down-payment ledger row
                    // as AFN even though the sale amount was entered in the
                    // sale currency. Keep those legacy rows visually correct;
                    // newly-created rows now carry the proper backend currency.
                    const isLegacyDownPayment = p.type === 'Received' && /down payment/i.test(p.purpose || '') && storedCurrency === 'AFN';
                    const paymentCurrency = isLegacyDownPayment
                      ? String(s.paymentCurrency || 'AFN').trim().toUpperCase()
                      : (storedCurrency || String(s.paymentCurrency || 'AFN').trim().toUpperCase());
                    return (
                    <View key={i} style={[styles.paymentRow, { borderBottomColor: c.border }]}>
                      <LinearGradient
                        colors={[c.success + '20', c.success + '08']}
                        style={{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <MaterialCommunityIcons name="cash-check" size={18} color={c.success} />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontWeight: '700', color: c.onSurface }}>
                          {formatCurrency(p.amount, paymentCurrency)}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.onSurfaceVariant }}>
                          {p.date || p.paymentDate ? new Date(p.date || p.paymentDate).toLocaleDateString() : ''}
                          {p.type ? ` • ${p.type}` : ''}
                        </Text>
                        {p.purpose && <Text style={{ fontSize: 11, color: c.onSurfaceVariant, marginTop: 1 }}>{p.purpose}</Text>}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 11, color: c.onSurfaceVariant }}>Ledger Balance (AFN)</Text>
                        <Text style={{ fontWeight: '700', fontSize: 12, color: Number(p.balance || 0) >= 0 ? c.success : c.error }}>
                          {formatCurrency(Math.abs(Number(p.balance || 0)), 'AFN')}
                        </Text>
                      </View>
                    </View>
                    );
                  })
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* ───── Exchange Vehicle Tab ───── */}
        {tab === 'exchange' && s.saleType === 'Exchange Car' && (
          <Card style={[styles.card, { backgroundColor: c.card }]}>
            <Card.Content>
              <Text style={[styles.sectionHead, { color: c.primary }]}>Exchange Vehicle Details</Text>
              {[
                { label: 'Manufacturer', value: s.exchVehicleManufacturer },
                { label: 'Model', value: s.exchVehicleModel },
                { label: 'Year', value: s.exchVehicleYear },
                { label: 'Category', value: s.exchVehicleCategory },
                { label: 'Color', value: s.exchVehicleColor },
                { label: 'Chassis', value: s.exchVehicleChassis },
                { label: 'Engine No.', value: s.exchVehicleEngine },
                { label: 'Fuel Type', value: s.exchVehicleFuelType },
                { label: 'Transmission', value: s.exchVehicleTransmission },
                { label: 'Mileage', value: s.exchVehicleMileage ? `${s.exchVehicleMileage} km` : null },
                { label: 'Plate No.', value: s.exchVehiclePlateNo },
                { label: 'License', value: s.exchVehicleLicense },
                { label: 'Steering', value: s.exchVehicleSteering },
                { label: 'Body Type', value: s.exchVehicleMonolithicCut },
                { label: 'Price Difference', value: s.priceDifference ? formatCurrency(s.priceDifference, s.paymentCurrency) : null },
                { label: 'Paid By', value: s.priceDifferencePaidBy },
              ].filter(r => r.value).map((row, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>{row.label}</Text>
                  <Text style={[styles.infoVal, { color: c.onSurface }]}>{row.value}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        {canWrite && (
          <View style={styles.actionRow}>
            <Button mode="contained" onPress={() => navigation.navigate('SaleForm', { sale: s })} style={{ flex: 1 }}>
              Edit Notes
            </Button>
            <Button mode="outlined" onPress={() => setDeleteId(s.id)} style={{ flex: 1 }} textColor={c.error}>
              Delete
            </Button>
          </View>
        )}
        <View style={{ height: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20 }} />
      </ScrollView>

      {/* Record Installment Dialog */}
      <Portal>
        <Dialog visible={payDialog} onDismiss={() => setPayDialog(false)} style={[styles.dialog, { backgroundColor: c.card }]}>
          <Dialog.Title style={{ fontWeight: '700', fontSize: 18 }}>Record Installment</Dialog.Title>
          <Dialog.Content>
            <FormField
              label="Amount *"
              value={payForm.amount}
              onChangeText={v => setPayForm(p => ({ ...p, amount: v }))}
              keyboardType="numeric"
            />
            <PickerField
              label="Currency"
              value={payForm.currency}
              options={CURRENCIES}
              onSelect={v => setPayForm(p => ({ ...p, currency: v }))}
            />
            <FormField
              label="Date"
              value={payForm.date}
              onChangeText={v => setPayForm(p => ({ ...p, date: v }))}
              placeholder="YYYY-MM-DD"
            />
            <FormField
              label="Note (optional)"
              value={payForm.note}
              onChangeText={v => setPayForm(p => ({ ...p, note: v }))}
              multiline
              numberOfLines={2}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
            <Button onPress={() => setPayDialog(false)} style={{ borderRadius: 12 }}>Cancel</Button>
            <Button mode="contained" onPress={handleRecordPayment} loading={paying} disabled={paying} style={{ borderRadius: 12 }}>
              Record
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Sale"
        message="This will un-sell the vehicle and delete all related records. This cannot be undone."
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
  heroCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e8ecf0' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 2 },
  priceBadge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  priceLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  priceVal: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 11, fontWeight: '800' },
  statLbl: { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  profitCard: { borderRadius: 14, padding: 14, flexDirection: 'row' },
  tabBar: { borderRadius: 12, paddingVertical: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginHorizontal: 4 },
  tabText: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  infoVal: { fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  dialog: { borderRadius: 24 },
  sectionHead: { fontWeight: '800', color: '#1565c0', marginBottom: 12, fontSize: 16 },
});
