import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Button, Text, Card, Switch, IconButton, Divider, HelperText } from '../components/LocalizedPaper';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { VEHICLE_MANUFACTURERS, VEHICLE_CATEGORIES, VEHICLE_STATUSES, FUEL_TYPES, TRANSMISSION_TYPES, ENGINE_TYPES, STEERING_TYPES, MONOLITHIC_CUT, CURRENCIES, formatCurrency } from '../utils/constants';
import { convertCurrency } from '../utils/currency';
import apiClient from '../api/client';
import { resolveAssetUrl } from '../api/config';

const emptyVehicle = {
  manufacturer: '', model: '', year: '', category: '', color: '', chassisNumber: '', engineNumber: '',
  engineType: '', fuelType: '', transmission: '', mileage: '', plateNo: '', vehicleLicense: '',
  steering: '', monolithicCut: '', status: 'Available',
  basePurchasePrice: '', baseCurrency: 'USD', transportDubai: '', importAfghanistan: '', repairCost: '',
  sellingPrice: '', sellingPriceCurrency: 'AFN',
};

const emptyRef = { fullName: '', tazkiraNumber: '', phoneNumber: '', address: '' };

export default function VehicleFormScreen({ navigation, route }) {
  const editing = route.params?.vehicle;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({ ...emptyVehicle });
  const [ref, setRef] = useState({ ...emptyRef });
  const [hasRef, setHasRef] = useState(false);
  const [partners, setPartners] = useState([]);
  const [hasPartners, setHasPartners] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [images, setImages] = useState([]); // { uri, name, type }
  const [uploadingImages, setUploadingImages] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState({ manufacturer: [], category: [], engineType: [], transmission: [] });
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    Promise.all([
      apiClient.get('/customers').catch(() => ({ data: [] })),
      apiClient.get('/vehicles/dropdown-options').catch(() => ({ data: { data: {} } })),
      apiClient.get('/currency/rates').catch(() => ({ data: {} })),
    ]).then(([customerRes, optionRes, ratesRes]) => {
      const list = Array.isArray(customerRes.data?.data) ? customerRes.data.data : Array.isArray(customerRes.data) ? customerRes.data : [];
      setCustomers(list);
      setDropdownOptions(optionRes.data?.data || {});
      setExchangeRates(ratesRes.data?.data || ratesRes.data || {});
    });
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        manufacturer: editing.manufacturer || '', model: editing.model || '', year: String(editing.year || ''),
        category: editing.category || '', color: editing.color || '', chassisNumber: editing.chassisNumber || '',
        engineNumber: editing.engineNumber || '', engineType: editing.engineType || '', fuelType: editing.fuelType || '',
        transmission: editing.transmission || '', mileage: String(editing.mileage || ''), plateNo: editing.plateNo || '',
        vehicleLicense: editing.vehicleLicense || '', steering: editing.steering || '', monolithicCut: editing.monolithicCut || '',
        status: editing.status || 'Available', basePurchasePrice: String(editing.basePurchasePrice || ''),
        baseCurrency: editing.baseCurrency || 'USD', transportDubai: String(editing.transportCostToDubai || ''),
        importAfghanistan: String(editing.importCostToAfghanistan || ''), repairCost: String(editing.repairCost || ''),
        sellingPrice: String(editing.sellingPrice || ''), sellingPriceCurrency: editing.sellingPriceCurrency || 'AFN',
      });
      if (editing.referencePerson?.fullName || editing.refFullName) {
        setHasRef(true);
        const rp = editing.referencePerson || {};
        setRef({
          fullName: rp.fullName || editing.refFullName || '',
          tazkiraNumber: rp.tazkiraNumber || editing.refTazkiraNumber || '',
          phoneNumber: rp.phoneNumber || editing.refPhoneNumber || '',
          address: rp.address || editing.refAddress || '',
        });
      }
      if (editing.sharingPersons && editing.sharingPersons.length > 0) {
        setHasPartners(true);
        setPartners(editing.sharingPersons.map(p => ({
          personName: p.personName || p.customer?.fullName || '',
          sharePercentage: String(p.sharePercentage || p.percentage || ''),
          investmentAmount: String(p.investmentAmount || ''),
          investmentCurrency: p.investmentCurrency || editing.baseCurrency || 'USD',
          phone: p.phoneNumber || p.phone || p.customer?.phoneNumber || '',
          customerId: p.customerId ? String(p.customerId) : '',
        })));
      }
      // Match webadmin edit behavior: show the vehicle's already-uploaded
      // gallery while allowing new selections to be added in the same save.
      apiClient.get(`/vehicles/${editing.id}/images`).then(res => {
        const existing = Array.isArray(res.data?.data) ? res.data.data : [];
        setImages(existing.map(img => ({
          id: img.id,
          existing: true,
          uri: resolveAssetUrl(img.imagePath || img.path || img.url || img.imageUrl),
          name: img.fileName || `image-${img.id}.jpg`,
          type: img.mimeType || 'image/jpeg',
        })).filter(img => img.uri));
      }).catch(() => {});
    }
  }, [editing]);

  const updateForm = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const totalCost = [form.basePurchasePrice, form.transportDubai, form.importAfghanistan, form.repairCost]
    .reduce((s, v) => s + (Number(v) || 0), 0);
  const sellingPriceInBase = convertCurrency(form.sellingPrice, form.sellingPriceCurrency, form.baseCurrency, exchangeRates);
  const expectedProfit = sellingPriceInBase - totalCost;

  const validate = () => {
    const errs = {};
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.year || !Number.isFinite(Number(form.year)) || Number(form.year) < 1900 || Number(form.year) > new Date().getFullYear() + 5) {
      errs.year = `Year must be between 1900 and ${new Date().getFullYear() + 5}`;
    }
    if (!form.chassisNumber.trim()) errs.chassisNumber = 'Chassis number is required';
    if (!form.basePurchasePrice || !Number.isFinite(Number(form.basePurchasePrice)) || Number(form.basePurchasePrice) <= 0) {
      errs.basePurchasePrice = 'Purchase price must be a positive number';
    }
    if (!form.sellingPrice || !Number.isFinite(Number(form.sellingPrice)) || Number(form.sellingPrice) <= 0) {
      errs.sellingPrice = 'Selling price must be a positive number';
    }
    if (hasRef && !ref.fullName.trim()) errs.refFullName = 'Reference person name is required';

    if (hasPartners && partners.length > 0) {
      partners.forEach((p, index) => {
        if (!p.customerId || Number(p.sharePercentage) <= 0 || totalCost <= 0) return;
        const customer = customers.find(item => String(item.id) === String(p.customerId));
        if (!customer) {
          errs[`sharing_${index}_balance`] = 'Linked customer could not be found';
          return;
        }
        const currency = (p.investmentCurrency || form.baseCurrency || 'AFN').toUpperCase();
        const balance = Number(customer[`balance${currency}`] || 0);
        const requiredInvestment = (Number(p.sharePercentage) / 100) * totalCost;
        if (requiredInvestment > balance) {
          errs[`sharing_${index}_balance`] = `Customer balance is ${formatCurrency(balance, currency)}; ${formatCurrency(requiredInvestment, currency)} is required`;
        }
      });

      const usesInvestment = partners.some(p => Number(p.investmentAmount) > 0);
      if (usesInvestment) {
        const totalInvestment = partners.reduce((sum, p) => sum + (Number(p.investmentAmount) || 0), 0);
        if (totalInvestment > totalCost + 0.01) errs.sharingTotal = 'Total partner investment cannot exceed the vehicle total cost';
        partners.forEach((p, index) => {
          if (!p.personName.trim() && !p.customerId) errs[`sharing_${index}_name`] = 'Partner is required';
          if (!p.investmentAmount || Number(p.investmentAmount) <= 0) errs[`sharing_${index}_investment`] = 'A positive investment is required';
        });
      } else {
        const totalPercentage = partners.reduce((sum, p) => sum + (Number(p.sharePercentage) || 0), 0);
        if (totalPercentage > 100) errs.sharingTotal = 'Total partner percentage cannot exceed 100%';
        partners.forEach((p, index) => {
          if (!p.personName.trim() && !p.customerId) errs[`sharing_${index}_name`] = 'Partner is required';
          if (!p.sharePercentage || Number(p.sharePercentage) <= 0) errs[`sharing_${index}_pct`] = 'A positive share percentage is required';
        });
      }
    }
    if (editing && !editReason.trim()) errs.editReason = 'Edit reason is required';
    setErrors(errs);
    return errs;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const identityFields = ['manufacturer', 'model', 'year', 'chassisNumber', 'basePurchasePrice', 'sellingPrice', 'editReason'];
      if (identityFields.some(field => validationErrors[field])) setStep(0);
      else if (validationErrors.refFullName) setStep(1);
      else if (validationErrors.sharingTotal || Object.keys(validationErrors).some(key => key.startsWith('sharing_'))) setStep(2);
      else setStep(0);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year) || null,
        mileage: Number(form.mileage) || null,
        totalCostOriginal: totalCost,
        basePurchasePrice: Number(form.basePurchasePrice) || 0,
        transportCostToDubai: Number(form.transportDubai) || 0,
        importCostToAfghanistan: Number(form.importAfghanistan) || 0,
        repairCost: Number(form.repairCost) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        sellingPriceCurrency: form.sellingPriceCurrency || 'AFN',
        ...(hasRef && ref.fullName ? { referencePerson: ref } : { referencePerson: null }),
        sharingPersons: hasPartners ? partners.map(p => ({
          personName: p.personName,
          percentage: Number(p.investmentAmount) > 0 && totalCost > 0
            ? (convertCurrency(p.investmentAmount, p.investmentCurrency || form.baseCurrency, form.baseCurrency, exchangeRates) / totalCost) * 100
            : Number(p.sharePercentage) || 0,
          investmentAmount: Number(p.investmentAmount) || 0,
          investmentCurrency: p.investmentCurrency || 'USD',
          phoneNumber: p.phone,
          calculationMethod: Number(p.investmentAmount) > 0 ? 'Investment' : 'Percentage',
          customerId: p.customerId ? Number(p.customerId) : null,
        })) : [],
      };

      if (editing) {
        payload.editReason = editReason;
        await apiClient.put(`/vehicles/${editing.id}`, payload);
        await uploadImages(editing.id);
      } else {
        const res = await apiClient.post('/vehicles', payload);
        const newId = res.data?.data?.id || res.data?.id;
        if (newId) await uploadImages(newId);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const addPartner = () => setPartners(p => [...p, { personName: '', sharePercentage: '', investmentAmount: '', investmentCurrency: form.baseCurrency, phone: '', customerId: '' }]);
  const updatePartner = (idx, key, val) => {
    setPartners(p => { const n = [...p]; n[idx] = { ...n[idx], [key]: val }; return n; });
    setErrors(current => ({
      ...current,
      [`sharing_${idx}_name`]: key === 'personName' || key === 'customerId' ? null : current[`sharing_${idx}_name`],
      [`sharing_${idx}_pct`]: key === 'sharePercentage' ? null : current[`sharing_${idx}_pct`],
      [`sharing_${idx}_investment`]: key === 'investmentAmount' ? null : current[`sharing_${idx}_investment`],
      [`sharing_${idx}_balance`]: key === 'sharePercentage' || key === 'customerId' || key === 'investmentCurrency' ? null : current[`sharing_${idx}_balance`],
      sharingTotal: key === 'sharePercentage' || key === 'investmentAmount' ? null : current.sharingTotal,
    }));
  };
  const removePartner = (idx) => setPartners(p => p.filter((_, i) => i !== idx));

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImages(prev => [
        ...prev,
        ...result.assets.map(a => ({ uri: a.uri, name: a.fileName || `photo_${Date.now()}.jpg`, type: a.mimeType || 'image/jpeg' }))
      ]);
    }
  };

  const removeImage = async (img, index) => {
    if (img.existing && img.id) {
      try { await apiClient.delete(`/vehicles/images/${img.id}`); }
      catch (e) { Alert.alert('Error', e.response?.data?.error || 'Could not delete image'); return; }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (vehicleId) => {
    const newImages = images.filter(img => !img.existing);
    if (newImages.length === 0) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      newImages.forEach(img => formData.append('images', { uri: img.uri, name: img.name, type: img.type }));
      await apiClient.post(`/vehicles/${vehicleId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch (e) {
      Alert.alert('Warning', 'Vehicle saved but image upload failed: ' + (e.response?.data?.error || e.message));
    }
    setUploadingImages(false);
  };

  const steps = ['Vehicle Details', 'Reference Person', 'Partnership', 'Images'];

  return (
    <ScreenWrapper title={editing ? 'Edit Vehicle' : 'New Vehicle'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
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
              <PickerField label="Manufacturer *" value={form.manufacturer} options={[...new Set([...VEHICLE_MANUFACTURERS, ...(dropdownOptions.manufacturer || [])])]} onSelect={v => updateForm('manufacturer', v)} error={errors.manufacturer} />
              <View style={styles.row}>
                <FormField label="Model *" value={form.model} onChangeText={v => updateForm('model', v)} error={errors.model} style={styles.half} />
                <FormField label="Year *" value={form.year} onChangeText={v => updateForm('year', v)} keyboardType="numeric" error={errors.year} style={styles.half} />
              </View>
              <View style={styles.row}>
                <PickerField label="Category" value={form.category} options={[...new Set([...VEHICLE_CATEGORIES, ...(dropdownOptions.category || [])])]} onSelect={v => updateForm('category', v)} style={styles.half} />
                <FormField label="Color" value={form.color} onChangeText={v => updateForm('color', v)} style={styles.half} />
              </View>
              <FormField label="Chassis / VIN *" value={form.chassisNumber} onChangeText={v => updateForm('chassisNumber', v)} error={errors.chassisNumber} />
              <FormField label="Engine Number" value={form.engineNumber} onChangeText={v => updateForm('engineNumber', v)} />

              <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Specifications</Text>
              <View style={styles.row}>
                <PickerField label="Engine Type" value={form.engineType} options={[...new Set([...ENGINE_TYPES, ...(dropdownOptions.engineType || [])])]} onSelect={v => updateForm('engineType', v)} style={styles.half} />
                <PickerField label="Fuel Type" value={form.fuelType} options={FUEL_TYPES} onSelect={v => updateForm('fuelType', v)} style={styles.half} />
              </View>
              <View style={styles.row}>
                <PickerField label="Transmission" value={form.transmission} options={[...new Set([...TRANSMISSION_TYPES, ...(dropdownOptions.transmission || [])])]} onSelect={v => updateForm('transmission', v)} style={styles.half} />
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
                <PickerField label="Base Currency" value={form.baseCurrency} options={CURRENCIES} onSelect={v => {
                  updateForm('baseCurrency', v);
                  setPartners(list => list.map(partner => ({ ...partner, investmentCurrency: v })));
                }} style={styles.half} />
              </View>
              <View style={styles.row}>
                <FormField label="Transport to Dubai" value={form.transportDubai} onChangeText={v => updateForm('transportDubai', v)} keyboardType="numeric" style={styles.half} />
                <FormField label="Import to Afghanistan" value={form.importAfghanistan} onChangeText={v => updateForm('importAfghanistan', v)} keyboardType="numeric" style={styles.half} />
              </View>
              <FormField label="Repair Cost" value={form.repairCost} onChangeText={v => updateForm('repairCost', v)} keyboardType="numeric" />
              <FormField label="Total Cost (auto)" value={formatCurrency(totalCost, form.baseCurrency)} disabled />
              <View style={styles.row}>
                <FormField label="Selling Price *" value={form.sellingPrice} onChangeText={v => updateForm('sellingPrice', v)} keyboardType="numeric" error={errors.sellingPrice} style={styles.half} />
                <PickerField label="Selling Currency" value={form.sellingPriceCurrency} options={CURRENCIES} onSelect={v => updateForm('sellingPriceCurrency', v)} style={styles.half} />
              </View>
              <FormField label="Expected Profit" value={formatCurrency(expectedProfit, form.baseCurrency)} disabled />

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
                  <FormField label="Full Name *" value={ref.fullName} onChangeText={v => { setRef(p => ({ ...p, fullName: v })); setErrors(p => ({ ...p, refFullName: null })); }} error={errors.refFullName} />
                  <FormField label="Tazkira Number" value={ref.tazkiraNumber} onChangeText={v => setRef(p => ({ ...p, tazkiraNumber: v }))} />
                  <FormField label="Phone Number" value={ref.phoneNumber} onChangeText={v => setRef(p => ({ ...p, phoneNumber: v }))} keyboardType="phone-pad" />
                  <FormField label="Address" value={ref.address} onChangeText={v => setRef(p => ({ ...p, address: v }))} multiline />
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
                        <PickerField
                          label="Linked Customer (Optional)"
                          value={p.customerId ? (customers.find(c => String(c.id) === String(p.customerId))?.fullName || '') : ''}
                          options={customers.map(c => c.fullName)}
                          onSelect={v => {
                            const found = customers.find(c => c.fullName === v);
                            if (found) {
                              updatePartner(idx, 'customerId', String(found.id));
                              updatePartner(idx, 'personName', found.fullName);
                              if (found.phoneNumber) updatePartner(idx, 'phone', found.phoneNumber);
                            }
                          }}
                        />
                        <FormField label="Person Name *" value={p.personName} onChangeText={v => updatePartner(idx, 'personName', v)} error={errors[`sharing_${idx}_name`]} />
                        <View style={styles.row}>
                          <FormField label="Share %" value={p.sharePercentage} onChangeText={v => updatePartner(idx, 'sharePercentage', v)} keyboardType="numeric" error={errors[`sharing_${idx}_pct`]} style={styles.half} />
                          <FormField label="Investment" value={p.investmentAmount} onChangeText={v => updatePartner(idx, 'investmentAmount', v)} keyboardType="numeric" error={errors[`sharing_${idx}_investment`]} style={styles.half} />
                        </View>
                        <PickerField
                          label="Investment Currency"
                          value={p.investmentCurrency || form.baseCurrency}
                          options={CURRENCIES}
                          onSelect={v => updatePartner(idx, 'investmentCurrency', v)}
                        />
                        {!!errors[`sharing_${idx}_balance`] && <HelperText type="error" visible>{errors[`sharing_${idx}_balance`]}</HelperText>}
                        <FormField label="Phone" value={p.phone} onChangeText={v => updatePartner(idx, 'phone', v)} keyboardType="phone-pad" />
                      </Card.Content>
                    </Card>
                  ))}
                  <Button icon="plus" mode="outlined" onPress={addPartner} style={{ marginTop: 8, borderRadius: 10 }}>Add Partner</Button>
                  {!!errors.sharingTotal && <HelperText type="error" visible>{errors.sharingTotal}</HelperText>}
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

          {step === 3 && (
            <>
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Vehicle Images</Text>
              <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginBottom: 12 }}>Select photos from your gallery. Max 500KB each recommended.</Text>
              <Button icon="image-plus" mode="outlined" onPress={pickImages} style={{ borderRadius: 10, marginBottom: 12 }}>Pick Images</Button>
              {images.length > 0 && (
                <View style={styles.imageGrid}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.imageThumb}>
                      <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                      <IconButton icon="close-circle" size={18} iconColor={c.error}
                        style={styles.thumbRemove} onPress={() => removeImage(img, i)} />
                    </View>
                  ))}
                </View>
              )}
              {images.length === 0 && (
                <View style={[styles.emptyImages, { backgroundColor: c.surfaceVariant }]}>
                  <Text style={{ color: c.onSurfaceVariant, fontSize: 13 }}>No images selected</Text>
                </View>
              )}
            </>
          )}

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {step > 0 && <Button mode="outlined" onPress={() => setStep(step - 1)} style={styles.navBtn}>Previous</Button>}
            <View style={{ flex: 1 }} />
            {step < 3 ? (
              <Button mode="contained" onPress={() => setStep(step + 1)} style={styles.navBtn}>Next</Button>
            ) : (
              <Button mode="contained" onPress={handleSave} loading={saving || uploadingImages} disabled={saving || uploadingImages} style={styles.navBtn}>
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
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumb: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 90, height: 90 },
  thumbRemove: { position: 'absolute', top: -4, right: -4, margin: 0 },
  emptyImages: { borderRadius: 12, padding: 24, alignItems: 'center' },
});
