import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { AFGHAN_PROVINCES } from '../utils/constants';
import { validateRequired, validatePhone } from '../utils/validation';
import apiClient from '../api/client';

const POSITIONS = ['Sales Manager', 'Sales Agent', 'Accountant', 'Mechanic', 'Driver', 'Security', 'Cleaner', 'Manager', 'Other'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

export default function EmployeeFormScreen({ navigation, route }) {
  const editing = route.params?.employee;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({
    fullName: '', fatherName: '', phoneNumber: '', nationalIdNumber: '',
    position: '', salary: '', status: 'Active',
    province: '', district: '', village: '', address: '',
    hireDate: new Date().toISOString().split('T')[0], notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      const f = {};
      Object.keys(form).forEach(k => { if (editing[k] != null) f[k] = String(editing[k]); });
      setForm(prev => ({ ...prev, ...f }));
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!validateRequired(form.fullName)) e.fullName = 'Name required';
    if (!validateRequired(form.fatherName)) e.fatherName = 'Father name required';
    if (!validatePhone(form.phoneNumber)) e.phoneNumber = 'Valid phone required';
    if (!validateRequired(form.position)) e.position = 'Position required';
    if (!form.salary || Number(form.salary) <= 0) e.salary = 'Valid salary required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (editing) {
        await apiClient.put(`/employees/${editing.id}`, payload);
      } else {
        await apiClient.post('/employees', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  return (
    <ScreenWrapper title={editing ? 'Edit Employee' : 'New Employee'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Personal Information</Text>
          <FormField label="Full Name *" value={form.fullName} onChangeText={v => set('fullName', v)} error={errors.fullName} />
          <FormField label="Father's Name *" value={form.fatherName} onChangeText={v => set('fatherName', v)} error={errors.fatherName} />
          <FormField label="Phone Number *" value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)} error={errors.phoneNumber} keyboardType="phone-pad" />
          <FormField label="National ID (Tazkira)" value={form.nationalIdNumber} onChangeText={v => set('nationalIdNumber', v)} />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Employment Details</Text>
          <PickerField label="Position *" value={form.position} options={POSITIONS} onSelect={v => set('position', v)} error={errors.position} />
          <FormField label="Monthly Salary (AFN) *" value={form.salary} onChangeText={v => set('salary', v)} keyboardType="numeric" error={errors.salary} left="؋" />
          <PickerField label="Status" value={form.status} options={STATUSES} onSelect={v => set('status', v)} />
          <FormField label="Hire Date" value={form.hireDate} onChangeText={v => set('hireDate', v)} placeholder="YYYY-MM-DD" />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Location</Text>
          <PickerField label="Province" value={form.province} options={AFGHAN_PROVINCES} onSelect={v => set('province', v)} />
          <FormField label="District" value={form.district} onChangeText={v => set('district', v)} />
          <FormField label="Village" value={form.village} onChangeText={v => set('village', v)} />
          <FormField label="Address" value={form.address} onChangeText={v => set('address', v)} multiline />

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Employee' : 'Create Employee'}
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
