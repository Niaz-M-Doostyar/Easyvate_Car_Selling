import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Button, Text, Card, Switch, IconButton, Divider, HelperText } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { VEHICLE_MANUFACTURERS, VEHICLE_CATEGORIES, VEHICLE_STATUSES, FUEL_TYPES, TRANSMISSION_TYPES, ENGINE_TYPES, STEERING_TYPES, MONOLITHIC_CUT, CURRENCIES } from '../utils/constants';
import apiClient from '../api/client';

const emptyVehicle = {
  manufacturer: '', model: '', year: '', category: '', color: '', chassisNumber: '', engineNumber: '',
  engineType: '', fuelType: '', transmission: '', mileage: '', plateNo: '', vehicleLicense: '',
  steering: '', monolithicCut: '', status: 'Available',
  basePurchasePrice: '', baseCurrency: 'USD', transportCostToDubai: '', importCostToAfghanistan: '', repairCost: '',
  sellingPrice: '',
};

const emptyRef = { refFullName: '', refTazkiraNumber: '', refPhoneNumber: '', refAddress: '' };

export default function VehicleFormScreen({ navigation, route }) {
  const editing = route.params?.vehicle;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({ ...emptyVehicle });
  const [ref, setRef] = useState({ ...emptyRef });
  const [hasRef, setHasRef] = useState(false);
  const [partners, setPartners] = useState([]);
  const [hasPartners, setHasPartners] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        manufacturer: editing.manufacturer || '', model: editing.model || '', year: String(editing.year || ''),
        category: editing.category || '', color: editing.color || '', chassisNumber: editing.chassisNumber || '',
        engineNumber: editing.engineNumber || '', engineType: editing.engineType || '', fuelType: editing.fuelType || '',
        transmission: editing.transmission || '', mileage: String(editing.mileage || ''), plateNo: editing.plateNo || '',
        vehicleLicense: editing.vehicleLicense || '', steering: editing.steering || '', monolithicCut: editing.monolithicCut || '',
        status: editing.status || 'Available', basePurchasePrice: String(editing.basePurchasePrice || ''),
        baseCurrency: editing.baseCurrency || 'USD', transportCostToDubai: String(editing.transportCostToDubai || ''),
        importCostToAfghanistan: String(editing.importCostToAfghanistan || ''), repairCost: String(editing.repairCost || ''),
        sellingPrice: String(editing.sellingPrice || ''),
      });
      if (editing.refFullName) {
        setHasRef(true);
        setRef({ refFullName: editing.refFullName || '', refTazkiraNumber: editing.refTazkiraNumber || '', refPhoneNumber: editing.refPhoneNumber || '', refAddress: editing.refAddress || '' });
      }
    }
  }, [editing]);

  const updateForm = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const totalCost = [form.basePurchasePrice, form.transportCostToDubai, form.importCostToAfghanistan, form.repairCost]
    .reduce((s, v) => s + (Number(v) || 0), 0);

  const validate = () => {
    const errs = {};
    if (!form.manufacturer) errs.manufacturer = 'Required';
    if (!form.basePurchasePrice) errs.basePurchasePrice = 'Required';
    if (!form.sellingPrice) errs.sellingPrice = 'Required';
    if (editing && !editReason.trim()) errs.editReason = 'Edit reason is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year) || null,
        mileage: Number(form.mileage) || null,
        basePurchasePrice: Number(form.basePurchasePrice) || 0,
        transportCostToDubai: Number(form.transportCostToDubai) || 0,
        importCostToAfghanistan: Number(form.importCostToAfghanistan) || 0,
        repairCost: Number(form.repairCost) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        totalCostAFN: totalCost,
        ...(hasRef ? ref : {}),
        sharingPersons: hasPartners ? partners : [],
      };

      if (editing) {
        payload.editReason = editReason;
        await apiClient.put(`/vehicles/${editing.id}`, payload);
      } else {
        await apiClient.post('/vehicles', payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const addPartner = () => setPartners(p => [...p, { personName: '', sharePercentage: '', investmentAmount: '', phone: '' }]);
  const updatePartner = (idx, key, val) => {
    setPartners(p => { const n = [...p]; n[idx] = { ...n[idx], [key]: val }; return n; });
  };
  const removePartner = (idx) => setPartners(p => p.filter((_, i) => i !== idx));

  const steps = ['Vehicle Details', 'Reference Person', 'Partnership'];

  return (
    <ScreenWrapper title={editing ? 'Edit Vehicle' : 'New Vehicle'} navigation={navigation}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Step indicator */}
        <View style={[styles.stepRow, { borderBottomColor: c.border }]}>
          {steps.map((s, i) => (
            <View key={i} style={[styles.stepItem, i === step && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}>
              <Text onPress={() => setStep(i)} style={[styles.stepText, { color: i === step ? c.primary : c.onSurfaceVariant }]}>{i + 1}. {s}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Vehicle Identity</Text>
              <PickerField label="Manufacturer *" value={form.manufacturer} options={VEHICLE_MANUFACTURERS} onSelect={v => updateForm('manufacturer', v)} error={errors.manufacturer} />
              <View style={styles.row}>
                <FormField label="Model" value={form.model} onChangeText={v => updateForm('model', v)} style={styles.half} />
                <FormField label="Year" value={form.year} onChangeText={v => updateForm('year', v)} keyboardType="numeric" style={styles.half} />
              </View>
              <View style={styles.row}>
                <PickerField label="Category" value={form.category} options={VEHICLE_CATEGORIES} onSelect={v => updateForm('category', v)} style={styles.half} />
                <FormField label="Color" value={form.color} onChangeText={v => updateForm('color', v)} style={styles.half} />
              </View>
              <FormField label="Chassis / VIN" value={form.chassisNumber} onChangeText={v => updateForm('chassisNumber', v)} />
              <FormField label="Engine Number" value={form.engineNumber} onChangeText={v => updateForm('engineNumber', v)} />

              <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Specifications</Text>
              <View style={styles.row}>
                <PickerField label="Engine Type" value={form.engineType} options={ENGINE_TYPES} onSelect={v => updateForm('engineType', v)} style={styles.half} />
                <PickerField label="Fuel Type" value={form.fuelType} options={FUEL_TYPES} onSelect={v => updateForm('fuelType', v)} style={styles.half} />
              </View>
              <View style={styles.row}>
                <PickerField label="Transmission" value={form.transmission} options={TRANSMISSION_TYPES} onSelect={v => updateForm('transmission', v)} style={styles.half} />
                <FormField label="Mileage (km)" value={form.mileage} onChangeText={v => updateForm('mileage', v)} keyboardType="numeric" style={styles.half} />
              </View>
              <View style={styles.row}>
                <FormField label="Plate No" value={form.plateNo} onChangeText={v => updateForm('plateNo', v)} style={styles.half} />
                <FormField label="Vehicle License" value={form.vehicleLicense} onChangeText={v => updateForm('vehicleLicense', v)} style={styles.half} />
              </View>
              <View style={styles.row}>
                <PickerField label="Steering" value={form.steering} options={STEERING_TYPES} onSelect={v => updateForm('steering', v)} style={styles.half} />
                <PickerField label="Monolithic/Cut" value={form.monolithicCut} options={MONOLITHIC_CUT} onSelect={v => updateForm('monolithicCut', v)} style={styles.half} />
              </View>
              <PickerField label="Status" value={form.status} options={VEHICLE_STATUSES} onSelect={v => updateForm('status', v)} />

              <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Buying Stages & Costs</Text>
              <View style={styles.row}>
                <FormField label="Base Purchase Price *" value={form.basePurchasePrice} onChangeText={v => updateForm('basePurchasePrice', v)} keyboardType="numeric" error={errors.basePurchasePrice} style={styles.half} />
                <PickerField label="Base Currency" value={form.baseCurrency} options={CURRENCIES} onSelect={v => updateForm('baseCurrency', v)} style={styles.half} />
              </View>
              <View style={styles.row}>
                <FormField label="Transport to Dubai" value={form.transportCostToDubai} onChangeText={v => updateForm('transportCostToDubai', v)} keyboardType="numeric" style={styles.half} />
                <FormField label="Import to Afghanistan" value={form.importCostToAfghanistan} onChangeText={v => updateForm('importCostToAfghanistan', v)} keyboardType="numeric" style={styles.half} />
              </View>
              <FormField label="Repair Cost" value={form.repairCost} onChangeText={v => updateForm('repairCost', v)} keyboardType="numeric" />
              <FormField label="Total Cost (auto)" value={String(totalCost)} disabled />
              <FormField label="Selling Price *" value={form.sellingPrice} onChangeText={v => updateForm('sellingPrice', v)} keyboardType="numeric" error={errors.sellingPrice} />

              {editing && (
                <>
                  <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.error }]}>Edit Reason</Text>
                  <FormField label="Reason for edit *" value={editReason} onChangeText={setEditReason} error={errors.editReason} multiline />
                </>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <View style={styles.switchRow}>
                <Text variant="bodyMedium" style={{ color: c.onSurface, flex: 1 }}>Add Reference Person</Text>
                <Switch value={hasRef} onValueChange={setHasRef} color={c.primary} />
              </View>
              {hasRef && (
                <>
                  <FormField label="Full Name" value={ref.refFullName} onChangeText={v => setRef(p => ({ ...p, refFullName: v }))} />
                  <FormField label="Tazkira Number" value={ref.refTazkiraNumber} onChangeText={v => setRef(p => ({ ...p, refTazkiraNumber: v }))} />
                  <FormField label="Phone Number" value={ref.refPhoneNumber} onChangeText={v => setRef(p => ({ ...p, refPhoneNumber: v }))} keyboardType="phone-pad" />
                  <FormField label="Address" value={ref.refAddress} onChangeText={v => setRef(p => ({ ...p, refAddress: v }))} multiline />
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.switchRow}>
                <Text variant="bodyMedium" style={{ color: c.onSurface, flex: 1 }}>Add Sharing Partners</Text>
                <Switch value={hasPartners} onValueChange={setHasPartners} color={c.primary} />
              </View>
              {hasPartners && (
                <>
                  {partners.map((p, idx) => (
                    <Card key={idx} style={[styles.partnerCard, { backgroundColor: c.surfaceVariant }]} mode="contained">
                      <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text variant="titleSmall" style={{ fontWeight: '700', color: c.primary }}>Partner {idx + 1}</Text>
                          <IconButton icon="close" size={20} onPress={() => removePartner(idx)} iconColor={c.error} />
                        </View>
                        <FormField label="Person Name" value={p.personName} onChangeText={v => updatePartner(idx, 'personName', v)} />
                        <View style={styles.row}>
                          <FormField label="Share %" value={p.sharePercentage} onChangeText={v => updatePartner(idx, 'sharePercentage', v)} keyboardType="numeric" style={styles.half} />
                          <FormField label="Investment" value={p.investmentAmount} onChangeText={v => updatePartner(idx, 'investmentAmount', v)} keyboardType="numeric" style={styles.half} />
                        </View>
                        <FormField label="Phone" value={p.phone} onChangeText={v => updatePartner(idx, 'phone', v)} keyboardType="phone-pad" />
                      </Card.Content>
                    </Card>
                  ))}
                  <Button icon="plus" mode="outlined" onPress={addPartner} style={{ marginTop: 8, borderRadius: 10 }}>Add Partner</Button>
                  {partners.length > 0 && (
                    <Card style={[styles.summaryCard, { backgroundColor: c.primaryContainer }]} mode="contained">
                      <Card.Content>
                        <Text variant="bodySmall" style={{ color: c.primary }}>
                          Total Share: {partners.reduce((s, p) => s + (Number(p.sharePercentage) || 0), 0)}% •
                          Owner: {100 - partners.reduce((s, p) => s + (Number(p.sharePercentage) || 0), 0)}%
                        </Text>
                      </Card.Content>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {step > 0 && <Button mode="outlined" onPress={() => setStep(step - 1)} style={styles.navBtn}>Previous</Button>}
            <View style={{ flex: 1 }} />
            {step < 2 ? (
              <Button mode="contained" onPress={() => setStep(step + 1)} style={styles.navBtn}>Next</Button>
            ) : (
              <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.navBtn}>
                {editing ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  stepItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  stepText: { fontSize: 12, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16-4, paddingHorizontal: 4 },
  partnerCard: { borderRadius: 12, marginBottom: 12 },
  summaryCard: { borderRadius: 10, marginTop: 8 },
  navRow: { flexDirection: 'row', marginTop: 24, gap: 12 },
  navBtn: { borderRadius: 10 },
});
