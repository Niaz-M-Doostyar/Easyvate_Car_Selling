import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Chip, Card } from '../components/LocalizedPaper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { SALE_TYPES, VEHICLE_MANUFACTURERS, VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSION_TYPES, ENGINE_TYPES, CURRENCIES } from '../utils/constants';
import apiClient from '../api/client';

export default function SaleFormScreen({ navigation, route }) {
  const editing = route.params?.sale;
  const readOnly = Boolean(editing);
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();

  const [vehicles, setVehicles] = useState([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    saleType: 'Container One Key',
    vehicleId: '',
    saleDate: new Date().toISOString().split('T')[0],
    sellingPrice: '',
    downPayment: '',
    remainingAmount: '',
    notes: '',
    witnessName1: '',
    witnessName2: '',
    paymentCurrency: 'AFN',
    // Buyer info
    buyerName: '', buyerFatherName: '', buyerProvince: '', buyerDistrict: '',
    buyerVillage: '', buyerAddress: '', buyerIdNumber: '', buyerPhone: '',
    // Seller info
    sellerName: '', sellerFatherName: '', sellerProvince: '', sellerDistrict: '',
    sellerVillage: '', sellerAddress: '', sellerIdNumber: '', sellerPhone: '',
    // Exchange car fields
    exchVehicleManufacturer: '', exchVehicleModel: '', exchVehicleYear: '',
    exchVehicleCategory: '', exchVehicleColor: '', exchVehiclePlateNo: '',
    exchVehicleLicense: '', exchVehicleMileage: '', exchVehicleChassis: '',
    exchVehicleEngine: '', exchVehicleEngineType: '', exchVehicleFuelType: '',
    exchVehicleTransmission: '', exchVehicleSteering: 'Left', exchVehicleMonolithicCut: 'Monolithic',
    priceDifference: '', priceDifferencePaidBy: 'Buyer',
    exchangeVehicleCost: '', exchangeVehicleCostCurrency: 'AFN',
    // Licensed car fields
    trafficTransferDate: '',
    licensePersonName: '',
  });

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const vRes = await apiClient.get('/vehicles');
        const vList = Array.isArray(vRes.data?.data) ? vRes.data.data : Array.isArray(vRes.data) ? vRes.data : [];
        setVehicles(vList.filter(v => ['Available', 'Reserved'].includes(v.status) || (editing && v.id === editing.vehicleId)));
      } catch (e) {
        // ignore — dropdowns may be empty
      }
    };
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (editing) {
      const f = {};
      Object.keys(form).forEach(k => {
        if (editing[k] != null) f[k] = String(editing[k]);
      });
      setForm(prev => ({ ...prev, ...f }));
    }
  }, [editing]);

  const set = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Auto-fill selling price and total cost when vehicle selected
      if (k === 'vehicleId') {
        const veh = vehicles.find(x => String(x.id) === String(v));
        if (veh) {
          if (veh.sellingPrice) next.sellingPrice = String(veh.sellingPrice);
          if (veh.sellingPriceCurrency) next.paymentCurrency = veh.sellingPriceCurrency;
        }
      }
      return next;
    });
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const remaining = Math.max(0, (Number(form.sellingPrice) || 0) - (Number(form.downPayment) || 0));
  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = 'Vehicle is required';
    if (!form.buyerName.trim()) e.buyerName = 'Buyer name is required';
    if (!form.sellingPrice || !Number.isFinite(Number(form.sellingPrice)) || Number(form.sellingPrice) <= 0) {
      e.sellingPrice = 'Selling price must be a positive number';
    }
    if (!form.downPayment || !Number.isFinite(Number(form.downPayment)) || Number(form.downPayment) <= 0) {
      e.downPayment = 'Down payment must be a positive number';
    }
    if (form.saleType === 'Exchange Car') {
      if (!form.exchVehicleManufacturer) e.exchVehicleManufacturer = 'Required';
      if (!form.exchVehicleModel) e.exchVehicleModel = 'Required';
      if (!form.exchVehicleYear) e.exchVehicleYear = 'Year is required';
      else if (!Number.isFinite(Number(form.exchVehicleYear)) || Number(form.exchVehicleYear) < 1900 || Number(form.exchVehicleYear) > new Date().getFullYear() + 2) {
        e.exchVehicleYear = `Year must be between 1900 and ${new Date().getFullYear() + 2}`;
      }
      if (!form.exchVehicleChassis) e.exchVehicleChassis = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (editing) {
      setSaving(true);
      try {
        await apiClient.put(`/sales/${editing.id}`, { notes: form.notes });
        navigation.goBack();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to update note');
      } finally { setSaving(false); }
      return;
    }
    if (!validate()) {
      if (!form.buyerName.trim()) setStep(2);
      else if (form.saleType === 'Exchange Car' && (!form.exchVehicleManufacturer || !form.exchVehicleModel || !form.exchVehicleYear || !form.exchVehicleChassis)) setStep(3);
      else setStep(0);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      // Convert numeric fields
      ['vehicleId', 'sellingPrice', 'downPayment', 'exchVehicleYear', 'exchVehicleMileage', 'priceDifference'].forEach(k => {
        if (payload[k]) payload[k] = Number(payload[k]);
      });
      payload.remainingAmount = remaining;
      if (payload.exchangeVehicleCost) payload.exchangeVehicleCost = Number(payload.exchangeVehicleCost);
      await apiClient.post('/sales', payload);
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const vehicleOptions = vehicles.map(v => ({ label: `${v.manufacturer} ${v.model} (${v.year}) - ${v.status}`, value: String(v.id) }));
  const selectedVehicle = vehicles.find(v => String(v.id) === String(form.vehicleId));
  // Keep the same section order as webadmin: transaction, seller, buyer,
  // conditional exchange/license details, then notes and witnesses.
  const STEPS = ['Sale Form'];

  const renderBuyerInfo = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Buyer Information</Text>
      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 8 }}>Details of the person buying the vehicle.</Text>
      <FormField label="Full Name *" value={form.buyerName} onChangeText={v => set('buyerName', v)} error={errors.buyerName} disabled={readOnly} />
      <FormField label="Father's Name" value={form.buyerFatherName} onChangeText={v => set('buyerFatherName', v)} disabled={readOnly} />
      <FormField label="Province" value={form.buyerProvince} onChangeText={v => set('buyerProvince', v)} disabled={readOnly} />
      <FormField label="District" value={form.buyerDistrict} onChangeText={v => set('buyerDistrict', v)} disabled={readOnly} />
      <FormField label="Village" value={form.buyerVillage} onChangeText={v => set('buyerVillage', v)} disabled={readOnly} />
      <FormField label="Address" value={form.buyerAddress} onChangeText={v => set('buyerAddress', v)} multiline disabled={readOnly} />
      <FormField label="ID Number (Tazkira)" value={form.buyerIdNumber} onChangeText={v => set('buyerIdNumber', v)} disabled={readOnly} />
      <FormField label="Phone Number" value={form.buyerPhone} onChangeText={v => set('buyerPhone', v)} keyboardType="phone-pad" disabled={readOnly} />
    </View>
  );

  const renderSaleInfo = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Sale Information</Text>
      <Text variant="titleSmall" style={{ fontWeight: '600', marginBottom: 6, color: c.primary }}>Sale Type</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {SALE_TYPES.map(t => (
          <Chip key={t.value} selected={form.saleType === t.value} showSelectedCheck
            onPress={() => !readOnly && set('saleType', t.value)}
            style={{ backgroundColor: form.saleType === t.value ? t.color + '20' : c.surfaceVariant }}
            textStyle={{ color: form.saleType === t.value ? t.color : c.onSurface }}>
            {t.label}
          </Chip>
        ))}
      </View>

      <PickerField label="Vehicle *" value={vehicleOptions.find(o => o.value === form.vehicleId)?.label || ''} options={vehicleOptions.map(o => o.label)}
        onSelect={(v) => {
          const opt = vehicleOptions.find(o => o.label === v);
          if (opt) set('vehicleId', opt.value);
        }} error={errors.vehicleId} disabled={readOnly} />

      {selectedVehicle && (
        <Card mode="outlined" style={{ marginVertical: 8 }}>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: c.onSurfaceVariant, marginBottom: 8 }}>Selected Vehicle</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[['Type', selectedVehicle.category], ['Color', selectedVehicle.color], ['Engine', selectedVehicle.engineNumber], ['Chassis', selectedVehicle.chassisNumber], ['Plate', selectedVehicle.plateNo]].map(([label, value]) => (
                <View key={label} style={{ width: '30%' }}><Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>{label}</Text><Text variant="bodySmall">{value || '-'}</Text></View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <FormField label="Sale Date" value={form.saleDate} onChangeText={v => set('saleDate', v)} placeholder="YYYY-MM-DD" disabled={readOnly} />
    </View>
  );

  const renderStep1 = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Seller / Exchanger Information</Text>
      <FormField label="Seller Name" value={form.sellerName} onChangeText={v => set('sellerName', v)} disabled={readOnly} />
      <FormField label="Father's Name" value={form.sellerFatherName} onChangeText={v => set('sellerFatherName', v)} disabled={readOnly} />
      <FormField label="Province" value={form.sellerProvince} onChangeText={v => set('sellerProvince', v)} disabled={readOnly} />
      <FormField label="District" value={form.sellerDistrict} onChangeText={v => set('sellerDistrict', v)} disabled={readOnly} />
      <FormField label="Village" value={form.sellerVillage} onChangeText={v => set('sellerVillage', v)} disabled={readOnly} />
      <FormField label="Address" value={form.sellerAddress} onChangeText={v => set('sellerAddress', v)} multiline disabled={readOnly} />
      <FormField label="ID Number (Tazkira)" value={form.sellerIdNumber} onChangeText={v => set('sellerIdNumber', v)} disabled={readOnly} />
      <FormField label="Phone" value={form.sellerPhone} onChangeText={v => set('sellerPhone', v)} keyboardType="phone-pad" disabled={readOnly} />
    </View>
  );
  const renderLicensed = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Licensed Car Details</Text>
      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 8 }}>Traffic transfer and license information.</Text>
      <FormField label="Traffic Transfer Date" value={form.trafficTransferDate} onChangeText={v => set('trafficTransferDate', v)} placeholder="YYYY-MM-DD" disabled={readOnly} />
      <FormField label="License Person Name" value={form.licensePersonName} onChangeText={v => set('licensePersonName', v)} disabled={readOnly} />
    </View>
  );

  const renderExchangeVehicle = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Exchange Vehicle</Text>
      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 8 }}>This vehicle will be added to your inventory automatically.</Text>

      <PickerField label="Manufacturer *" value={form.exchVehicleManufacturer} options={VEHICLE_MANUFACTURERS} onSelect={v => set('exchVehicleManufacturer', v)} error={errors.exchVehicleManufacturer} disabled={readOnly} />
      <FormField label="Model *" value={form.exchVehicleModel} onChangeText={v => set('exchVehicleModel', v)} error={errors.exchVehicleModel} disabled={readOnly} />
      <FormField label="Year *" value={form.exchVehicleYear} onChangeText={v => set('exchVehicleYear', v)} keyboardType="numeric" error={errors.exchVehicleYear} disabled={readOnly} />
      <PickerField label="Category" value={form.exchVehicleCategory} options={VEHICLE_CATEGORIES} onSelect={v => set('exchVehicleCategory', v)} disabled={readOnly} />
      <FormField label="Color" value={form.exchVehicleColor} onChangeText={v => set('exchVehicleColor', v)} disabled={readOnly} />
      <FormField label="Chassis No. *" value={form.exchVehicleChassis} onChangeText={v => set('exchVehicleChassis', v)} error={errors.exchVehicleChassis} disabled={readOnly} />
      <FormField label="Engine No." value={form.exchVehicleEngine} onChangeText={v => set('exchVehicleEngine', v)} disabled={readOnly} />
      <PickerField label="Engine Type" value={form.exchVehicleEngineType} options={ENGINE_TYPES} onSelect={v => set('exchVehicleEngineType', v)} disabled={readOnly} />
      <PickerField label="Fuel Type" value={form.exchVehicleFuelType} options={FUEL_TYPES} onSelect={v => set('exchVehicleFuelType', v)} disabled={readOnly} />
      <PickerField label="Transmission" value={form.exchVehicleTransmission} options={TRANSMISSION_TYPES} onSelect={v => set('exchVehicleTransmission', v)} disabled={readOnly} />
      <FormField label="Plate No." value={form.exchVehiclePlateNo} onChangeText={v => set('exchVehiclePlateNo', v)} disabled={readOnly} />
      <FormField label="License" value={form.exchVehicleLicense} onChangeText={v => set('exchVehicleLicense', v)} disabled={readOnly} />
      <FormField label="Mileage (km)" value={form.exchVehicleMileage} onChangeText={v => set('exchVehicleMileage', v)} keyboardType="numeric" disabled={readOnly} />
      <PickerField label="Steering" value={form.exchVehicleSteering} options={['Left', 'Right']} onSelect={v => set('exchVehicleSteering', v)} disabled={readOnly} />
      <PickerField label="Body Type" value={form.exchVehicleMonolithicCut} options={['Monolithic', 'Cut']} onSelect={v => set('exchVehicleMonolithicCut', v)} disabled={readOnly} />

      <Divider style={{ marginVertical: 12 }} />
      <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>Price Difference</Text>
      <FormField label="Amount (AFN)" value={form.priceDifference} onChangeText={v => set('priceDifference', v)} keyboardType="numeric" disabled={readOnly} />
      <PickerField label="Paid By" value={form.priceDifferencePaidBy} options={['Buyer', 'Seller']} onSelect={v => set('priceDifferencePaidBy', v)} disabled={readOnly} />
      <View style={styles.row}>
        <FormField label="Exchange Vehicle Cost" value={form.exchangeVehicleCost} onChangeText={v => set('exchangeVehicleCost', v)} keyboardType="numeric" style={styles.half} disabled={readOnly} />
        <PickerField label="Cost Currency" value={form.exchangeVehicleCostCurrency} options={CURRENCIES} onSelect={v => set('exchangeVehicleCostCurrency', v)} style={styles.half} disabled={readOnly} />
      </View>
    </View>
  );



  const renderNotes = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Payment Information</Text>
      <FormField label="Currency" value={form.paymentCurrency} disabled />
      <FormField label="Selling Price *" value={form.sellingPrice} onChangeText={v => set('sellingPrice', v)} keyboardType="numeric" error={errors.sellingPrice} disabled={readOnly} />
      <FormField label="Down Payment *" value={form.downPayment} onChangeText={v => set('downPayment', v)} keyboardType="numeric" error={errors.downPayment} disabled={readOnly} />
      <FormField label="Remaining" value={String(remaining)} disabled />
      <Divider style={{ marginVertical: 12 }} />
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Notes & Witnesses</Text>
      <FormField label="Note" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />
      <FormField label="Witness" value={form.witnessName1} onChangeText={v => set('witnessName1', v)} disabled={readOnly} />
      <FormField label="Witness" value={form.witnessName2} onChangeText={v => set('witnessName2', v)} disabled={readOnly} />
    </View>
  );

  const getStepContent = () => {
    return <>
      {renderSaleInfo()}
      <Divider style={{ marginVertical: 18 }} />
      {renderStep1()}
      <Divider style={{ marginVertical: 18 }} />
      {renderBuyerInfo()}
      {form.saleType === 'Exchange Car' && <><Divider style={{ marginVertical: 18 }} />{renderExchangeVehicle()}</>}
      {form.saleType === 'Licensed Car' && <><Divider style={{ marginVertical: 18 }} />{renderLicensed()}</>}
      <Divider style={{ marginVertical: 18 }} />
      {renderNotes()}
    </>;
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <ScreenWrapper title={editing ? 'Edit Sale' : 'New Sale'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {getStepContent()}
        </ScrollView>

        <View style={[styles.btnRow, { backgroundColor: c.surface, borderTopColor: c.outlineVariant, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={{ flex: 1 }} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Sale' : 'Create Sale'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  stepRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, gap: 4 },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
});
