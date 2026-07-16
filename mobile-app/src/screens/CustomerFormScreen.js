import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, HelperText, Divider } from '../components/LocalizedPaper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { CUSTOMER_TYPES, AFGHAN_PROVINCES } from '../utils/constants';
import { validateRequired, validatePhone } from '../utils/validation';
import apiClient from '../api/client';

export default function CustomerFormScreen({ navigation, route }) {
  const editing = route.params?.customer;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    fullName: '', fatherName: '', phoneNumber: '', nationalIdNumber: '',
    customerType: 'Buyer', province: '', district: '', village: '',
    currentAddress: '', originalAddress: '', notes: '',
    balanceAFN: '0', balanceUSD: '0', balancePKR: '0', balanceAED: '0',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        fullName: editing.fullName || '',
        fatherName: editing.fatherName || '',
        phoneNumber: editing.phoneNumber || '',
        nationalIdNumber: editing.nationalIdNumber || '',
        customerType: editing.customerType || 'Buyer',
        province: editing.province || '',
        district: editing.district || '',
        village: editing.village || '',
        currentAddress: editing.currentAddress || editing.address || '',
        originalAddress: editing.originalAddress || editing.address || '',
        notes: editing.notes || '',
        balanceAFN: String(editing.balanceAFN || 0),
        balanceUSD: String(editing.balanceUSD || 0),
        balancePKR: String(editing.balancePKR || 0),
        balanceAED: String(editing.balanceAED || 0),
      });
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (validateRequired(form.fullName, 'Name')) e.fullName = 'Name is required';
    if (validateRequired(form.fatherName, 'Father name')) e.fatherName = 'Father name is required';
    if (form.phoneNumber && validatePhone(form.phoneNumber)) e.phoneNumber = 'Valid phone is required';
    if (validateRequired(form.province, 'Province')) e.province = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        balanceAFN: Number(form.balanceAFN) || 0,
        balanceUSD: Number(form.balanceUSD) || 0,
        balancePKR: Number(form.balancePKR) || 0,
        balanceAED: Number(form.balanceAED) || 0,
      };
      if (editing) {
        await apiClient.put(`/customers/${editing.id}`, payload);
      } else {
        await apiClient.post('/customers', payload);
      }
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <ScreenWrapper title={editing ? 'Edit Customer' : 'New Customer'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView contentContainerStyle={[styles.scroll, Platform.OS === 'ios' && { paddingBottom: Math.max(40, insets.bottom + 24) }]} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Personal Information</Text>

          <FormField label="Full Name *" value={form.fullName} onChangeText={v => set('fullName', v)} error={errors.fullName} />
          <FormField label="Father's Name *" value={form.fatherName} onChangeText={v => set('fatherName', v)} error={errors.fatherName} />
          <FormField label="Phone Number *" value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)} error={errors.phoneNumber} keyboardType="phone-pad" />
          <FormField label="National ID (Tazkira)" value={form.nationalIdNumber} onChangeText={v => set('nationalIdNumber', v)} />

          <PickerField label="Customer Type" value={form.customerType} options={CUSTOMER_TYPES} onSelect={v => set('customerType', v)} />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Location</Text>

          <PickerField label="Province *" value={form.province} options={AFGHAN_PROVINCES} onSelect={v => set('province', v)} error={errors.province} />
          <FormField label="District" value={form.district} onChangeText={v => set('district', v)} />
          <FormField label="Village" value={form.village} onChangeText={v => set('village', v)} />
          <FormField label="Current Address" value={form.currentAddress} onChangeText={v => set('currentAddress', v)} multiline numberOfLines={2} />
          <FormField label="Original Address" value={form.originalAddress} onChangeText={v => set('originalAddress', v)} multiline numberOfLines={2} />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Initial Balances</Text>
          <FormField label="AFN Balance" value={form.balanceAFN} onChangeText={v => set('balanceAFN', v)} keyboardType="numeric" />
          <FormField label="USD Balance" value={form.balanceUSD} onChangeText={v => set('balanceUSD', v)} keyboardType="numeric" />
          <FormField label="PKR Balance" value={form.balancePKR} onChangeText={v => set('balancePKR', v)} keyboardType="numeric" />
          <FormField label="AED Balance" value={form.balanceAED} onChangeText={v => set('balanceAED', v)} keyboardType="numeric" />

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Customer' : 'Create Customer'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  btn: { marginTop: 20, borderRadius: 12, paddingVertical: 4 },
});
