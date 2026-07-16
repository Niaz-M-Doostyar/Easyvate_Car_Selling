import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Card, Switch, HelperText } from '../components/LocalizedPaper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../utils/constants';
import { validateRequired, validatePhone, validateEmail } from '../utils/validation';
import apiClient from '../api/client';

const emptyEmployee = {
  fullName: '', phoneNumber: '', email: '', role: '',
  tazkiraNumber: '', biometricId: '', joiningDate: '', address: '', status: 'Active', monthlySalary: '',
};

export default function EmployeeFormScreen({ navigation, route }) {
  const editing = route.params?.employee;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({ ...emptyEmployee });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        fullName: editing.fullName || '',
        phoneNumber: editing.phoneNumber || '',
        email: editing.email || '',
        role: editing.role || '',
        tazkiraNumber: editing.tazkiraNumber || '',
        biometricId: editing.biometricId || '',
        joiningDate: editing.joiningDate ? editing.joiningDate.split('T')[0] : '',
        address: editing.address || '',
        status: editing.status || 'Active',
        monthlySalary: String(editing.monthlySalary || ''),
      });
    }
  }, [editing]);

  const update = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'Phone is required';
    else if (validatePhone(form.phoneNumber)) errs.phoneNumber = 'Invalid phone';
    if (form.email && validateEmail(form.email)) errs.email = 'Invalid email';
    if (!form.role) errs.role = 'Role is required';
    if (!form.monthlySalary) errs.monthlySalary = 'Salary is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlySalary: Number(form.monthlySalary) || 0,
      };
      if (editing) {
        await apiClient.put(`/employees/${editing.id}`, payload);
      } else {
        await apiClient.post('/employees', payload);
      }
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper title={editing ? 'Edit Employee' : 'New Employee'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Personal Information</Text>
          <FormField label="Full Name *" value={form.fullName} onChangeText={v => update('fullName', v)} error={errors.fullName} />
          <View style={styles.row}>
            <FormField label="Phone Number *" value={form.phoneNumber} onChangeText={v => update('phoneNumber', v)} keyboardType="phone-pad" error={errors.phoneNumber} style={styles.half} />
            <FormField label="Email" value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" error={errors.email} style={styles.half} />
          </View>
          <FormField label="Tazkira Number" value={form.tazkiraNumber} onChangeText={v => update('tazkiraNumber', v)} />
          <FormField label="Biometric ID" value={form.biometricId} onChangeText={v => update('biometricId', v)} />
          <FormField label="Address" value={form.address} onChangeText={v => update('address', v)} multiline numberOfLines={3} />

          <Text variant="titleSmall" style={[styles.sectionTitle, { color: c.primary }]}>Employment Details</Text>
          <View style={styles.row}>
            <PickerField label="Role *" value={form.role} options={EMPLOYEE_ROLES} onSelect={v => update('role', v)} style={styles.half} error={errors.role} />
            <FormField label="Monthly Salary *" value={form.monthlySalary} onChangeText={v => update('monthlySalary', v)} keyboardType="numeric" error={errors.monthlySalary} style={styles.half} />
          </View>
          <View style={styles.row}>
            <FormField label="Joining Date" value={form.joiningDate} onChangeText={v => update('joiningDate', v)} placeholder="YYYY-MM-DD" style={styles.half} />
            <PickerField label="Status" value={form.status} options={EMPLOYEE_STATUSES} onSelect={v => update('status', v)} style={styles.half} />
          </View>

          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.saveBtn}>
            {editing ? 'Update Employee' : 'Create Employee'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  saveBtn: { marginTop: 24, borderRadius: 14, paddingVertical: 4 },
});