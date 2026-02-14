import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Card, Switch, SegmentedButtons, RadioButton, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { SALE_TYPES, VEHICLE_MANUFACTURERS, VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSION_TYPES, ENGINE_TYPES, AFGHAN_PROVINCES } from '../utils/constants';
import { validateRequired, validatePrice } from '../utils/validation';
import apiClient from '../api/client';

export default function SaleFormScreen({ navigation, route }) {
  const editing = route.params?.sale;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    saleType: 'Container One Key',
    vehicleId: '',
    customerId: '',
    saleDate: new Date().toISOString().split('T')[0],
    sellingPrice: '',
    downPayment: '',
    notes: '',
    note2: '',
    witnessName1: '',
    witnessName2: '',
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
    // Licensed car fields
    trafficTransferDate: '',
  });

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [vRes, cRes] = await Promise.all([
          apiClient.get('/vehicles'),
          apiClient.get('/customers'),
        ]);
        const vList = Array.isArray(vRes.data?.data) ? vRes.data.data : Array.isArray(vRes.data) ? vRes.data : [];
        setVehicles(vList.filter(v => ['Available', 'Reserved'].includes(v.status) || (editing && v.id === editing.vehicleId)));
        setCustomers(Array.isArray(cRes.data?.data) ? cRes.data.data : Array.isArray(cRes.data) ? cRes.data : []);
      } catch (e) { console.log(e); }
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
      // Auto-fill selling price when vehicle selected
      if (k === 'vehicleId') {
        const veh = vehicles.find(x => String(x.id) === String(v));
        if (veh && veh.sellingPrice) next.sellingPrice = String(veh.sellingPrice);
      }
      return next;
    });
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const remaining = Math.max(0, (Number(form.sellingPrice) || 0) - (Number(form.downPayment) || 0));

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = 'Vehicle is required';
    if (!form.customerId) e.customerId = 'Customer is required';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) e.sellingPrice = 'Valid price required';
    if (form.downPayment && validatePrice(form.downPayment)) e.downPayment = 'Valid price required';
    if (form.saleType === 'Exchange Car') {
      if (!form.exchVehicleManufacturer) e.exchVehicleManufacturer = 'Required';
      if (!form.exchVehicleModel) e.exchVehicleModel = 'Required';
      if (!form.exchVehicleYear) e.exchVehicleYear = 'Required';
      if (!form.exchVehicleChassis) e.exchVehicleChassis = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { setStep(0); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      // Convert numeric fields
      ['vehicleId', 'customerId', 'sellingPrice', 'downPayment', 'exchVehicleYear', 'exchVehicleMileage', 'priceDifference'].forEach(k => {
        if (payload[k]) payload[k] = Number(payload[k]);
      });
      if (editing) {
        await apiClient.put(`/sales/${editing.id}`, payload);
      } else {
        await apiClient.post('/sales', payload);
      }
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const vehicleOptions = vehicles.map(v => ({ label: `${v.manufacturer} ${v.model} (${v.year}) - ${v.status}`, value: String(v.id) }));
  const customerOptions = customers.map(cust => ({ label: cust.fullName, value: String(cust.id) }));

  const STEPS = form.saleType === 'Exchange Car' ? ['Sale Info', 'Seller', 'Exchange Vehicle', 'Notes'] :
    form.saleType === 'Licensed Car' ? ['Sale Info', 'Seller', 'License', 'Notes'] :
    ['Sale Info', 'Seller', 'Notes'];

  const renderStep0 = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Sale Type</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {SALE_TYPES.map(t => (
          <Chip key={t.value} selected={form.saleType === t.value} showSelectedCheck
            onPress={() => set('saleType', t.value)}
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
        }} error={errors.vehicleId} />

      <PickerField label="Customer *" value={form.customerId ? customerOptions.find(o => o.value === form.customerId)?.label : ''}
        options={customerOptions.map(o => o.label)}
        onSelect={(v) => {
          const opt = customerOptions.find(o => o.label === v);
          if (opt) set('customerId', opt.value);
        }} error={errors.customerId} />

      <FormField label="Sale Date" value={form.saleDate} onChangeText={v => set('saleDate', v)} placeholder="YYYY-MM-DD" />
      <FormField label="Selling Price (AFN) *" value={form.sellingPrice} onChangeText={v => set('sellingPrice', v)} keyboardType="numeric" error={errors.sellingPrice} />
      <FormField label="Down Payment (AFN) *" value={form.downPayment} onChangeText={v => set('downPayment', v)} keyboardType="numeric" error={errors.downPayment} />

      <Card style={[styles.infoCard, { backgroundColor: c.surfaceVariant }]}>
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant }}>Remaining Amount</Text>
          <Text variant="bodyMedium" style={{ fontWeight: '700', color: remaining > 0 ? '#ff9800' : '#4caf50' }}>
            ؋ {remaining.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderStep1 = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Seller Information</Text>
      <FormField label="Seller Name" value={form.sellerName} onChangeText={v => set('sellerName', v)} />
      <FormField label="Father's Name" value={form.sellerFatherName} onChangeText={v => set('sellerFatherName', v)} />
      <PickerField label="Province" value={form.sellerProvince} options={AFGHAN_PROVINCES} onSelect={v => set('sellerProvince', v)} />
      <FormField label="District" value={form.sellerDistrict} onChangeText={v => set('sellerDistrict', v)} />
      <FormField label="Village" value={form.sellerVillage} onChangeText={v => set('sellerVillage', v)} />
      <FormField label="Address" value={form.sellerAddress} onChangeText={v => set('sellerAddress', v)} multiline />
      <FormField label="ID Number (Tazkira)" value={form.sellerIdNumber} onChangeText={v => set('sellerIdNumber', v)} />
      <FormField label="Phone" value={form.sellerPhone} onChangeText={v => set('sellerPhone', v)} keyboardType="phone-pad" />
    </View>
  );

  const renderExchangeVehicle = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Exchange Vehicle</Text>
      <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 8 }}>This vehicle will be added to your inventory automatically.</Text>

      <PickerField label="Manufacturer *" value={form.exchVehicleManufacturer} options={VEHICLE_MANUFACTURERS} onSelect={v => set('exchVehicleManufacturer', v)} error={errors.exchVehicleManufacturer} />
      <FormField label="Model *" value={form.exchVehicleModel} onChangeText={v => set('exchVehicleModel', v)} error={errors.exchVehicleModel} />
      <FormField label="Year *" value={form.exchVehicleYear} onChangeText={v => set('exchVehicleYear', v)} keyboardType="numeric" error={errors.exchVehicleYear} />
      <PickerField label="Category" value={form.exchVehicleCategory} options={VEHICLE_CATEGORIES} onSelect={v => set('exchVehicleCategory', v)} />
      <FormField label="Color" value={form.exchVehicleColor} onChangeText={v => set('exchVehicleColor', v)} />
      <FormField label="Chassis No. *" value={form.exchVehicleChassis} onChangeText={v => set('exchVehicleChassis', v)} error={errors.exchVehicleChassis} />
      <FormField label="Engine No." value={form.exchVehicleEngine} onChangeText={v => set('exchVehicleEngine', v)} />
      <PickerField label="Engine Type" value={form.exchVehicleEngineType} options={ENGINE_TYPES} onSelect={v => set('exchVehicleEngineType', v)} />
      <PickerField label="Fuel Type" value={form.exchVehicleFuelType} options={FUEL_TYPES} onSelect={v => set('exchVehicleFuelType', v)} />
      <PickerField label="Transmission" value={form.exchVehicleTransmission} options={TRANSMISSION_TYPES} onSelect={v => set('exchVehicleTransmission', v)} />
      <FormField label="Plate No." value={form.exchVehiclePlateNo} onChangeText={v => set('exchVehiclePlateNo', v)} />
      <FormField label="License" value={form.exchVehicleLicense} onChangeText={v => set('exchVehicleLicense', v)} />
      <FormField label="Mileage (km)" value={form.exchVehicleMileage} onChangeText={v => set('exchVehicleMileage', v)} keyboardType="numeric" />
      <PickerField label="Steering" value={form.exchVehicleSteering} options={['Left', 'Right']} onSelect={v => set('exchVehicleSteering', v)} />
      <PickerField label="Body Type" value={form.exchVehicleMonolithicCut} options={['Monolithic', 'Cut']} onSelect={v => set('exchVehicleMonolithicCut', v)} />

      <Divider style={{ marginVertical: 12 }} />
      <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface }}>Price Difference</Text>
      <FormField label="Amount (AFN)" value={form.priceDifference} onChangeText={v => set('priceDifference', v)} keyboardType="numeric" />
      <PickerField label="Paid By" value={form.priceDifferencePaidBy} options={['Buyer', 'Seller']} onSelect={v => set('priceDifferencePaidBy', v)} />
    </View>
  );

  const renderLicensed = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Licensed Car Details</Text>
      <FormField label="Traffic Transfer Date" value={form.trafficTransferDate} onChangeText={v => set('trafficTransferDate', v)} placeholder="YYYY-MM-DD" />
    </View>
  );

  const renderNotes = () => (
    <View style={{ gap: 4 }}>
      <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 8, color: c.onSurface }}>Notes & Witnesses</Text>
      <FormField label="Note 1" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />
      <FormField label="Note 2" value={form.note2} onChangeText={v => set('note2', v)} multiline numberOfLines={3} />
      <Divider style={{ marginVertical: 12 }} />
      <FormField label="Witness 1" value={form.witnessName1} onChangeText={v => set('witnessName1', v)} />
      <FormField label="Witness 2" value={form.witnessName2} onChangeText={v => set('witnessName2', v)} />
    </View>
  );

  const getStepContent = () => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();
    if (form.saleType === 'Exchange Car') {
      if (step === 2) return renderExchangeVehicle();
      if (step === 3) return renderNotes();
    } else if (form.saleType === 'Licensed Car') {
      if (step === 2) return renderLicensed();
      if (step === 3) return renderNotes();
    } else {
      if (step === 2) return renderNotes();
    }
    return null;
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <ScreenWrapper title={editing ? 'Edit Sale' : 'New Sale'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Step indicator */}
        <View style={[styles.stepRow, { backgroundColor: c.surfaceVariant }]}>
          {STEPS.map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={[styles.stepDot, { backgroundColor: i <= step ? c.primary : c.outline }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{i + 1}</Text>
              </View>
              <Text variant="labelSmall" style={{ color: i <= step ? c.primary : c.onSurfaceVariant, fontSize: 9, marginTop: 2 }}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {getStepContent()}
        </ScrollView>

        <View style={[styles.btnRow, { backgroundColor: c.surface, borderTopColor: c.outlineVariant }]}>
          {step > 0 && <Button mode="outlined" onPress={() => setStep(step - 1)} style={{ flex: 1 }}>Back</Button>}
          {!isLastStep && <Button mode="contained" onPress={() => setStep(step + 1)} style={{ flex: 1 }}>Next</Button>}
          {isLastStep && <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={{ flex: 1 }} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Sale' : 'Create Sale'}
          </Button>}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  stepRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, gap: 4 },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoCard: { borderRadius: 10, marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
});
