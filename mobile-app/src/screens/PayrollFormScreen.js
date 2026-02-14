import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Card } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { MONTHS, formatCurrency } from '../utils/constants';
import apiClient from '../api/client';

export default function PayrollFormScreen({ navigation, route }) {
  const editing = route.params?.record;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    month: MONTHS[new Date().getMonth()],
    year: String(new Date().getFullYear()),
    baseSalary: '',
    bonus: '0',
    deductions: '0',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/employees').then(({ data }) => {
      setEmployees(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        employeeId: String(editing.employeeId || editing.EmployeeId || ''),
        month: editing.month || MONTHS[new Date().getMonth()],
        year: String(editing.year || new Date().getFullYear()),
        baseSalary: String(editing.baseSalary || editing.salary || ''),
        bonus: String(editing.bonus || '0'),
        deductions: String(editing.deductions || editing.deduction || '0'),
        notes: editing.notes || '',
      });
    }
  }, [editing]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: undefined }));
    // Auto-fill salary when employee selected
    if (k === 'employeeId') {
      const emp = employees.find(e => String(e.id) === String(v));
      if (emp && emp.salary) setForm(p => ({ ...p, [k]: v, baseSalary: String(emp.salary) }));
    }
  };

  const netSalary = (Number(form.baseSalary) || 0) + (Number(form.bonus) || 0) - (Number(form.deductions) || 0);

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = 'Employee required';
    if (!form.baseSalary || Number(form.baseSalary) <= 0) e.baseSalary = 'Valid salary required';
    if (!form.month) e.month = 'Month required';
    if (!form.year) e.year = 'Year required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        employeeId: Number(form.employeeId),
        baseSalary: Number(form.baseSalary),
        bonus: Number(form.bonus || 0),
        deductions: Number(form.deductions || 0),
        year: Number(form.year),
      };
      if (editing) {
        await apiClient.put(`/payroll/${editing.id}`, payload);
      } else {
        await apiClient.post('/payroll', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const empOptions = employees.map(e => ({ label: `${e.fullName} - ${formatCurrency(e.salary || 0)}/mo`, value: String(e.id) }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <ScreenWrapper title={editing ? 'Edit Payroll' : 'New Payroll'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Payroll Details</Text>

          <PickerField label="Employee *" value={form.employeeId ? empOptions.find(o => o.value === form.employeeId)?.label : ''}
            options={empOptions.map(o => o.label)}
            onSelect={v => { const opt = empOptions.find(o => o.label === v); if (opt) set('employeeId', opt.value); }}
            error={errors.employeeId} />

          <PickerField label="Month *" value={form.month} options={MONTHS} onSelect={v => set('month', v)} error={errors.month} />
          <PickerField label="Year *" value={form.year} options={yearOptions} onSelect={v => set('year', v)} error={errors.year} />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Salary Breakdown</Text>

          <FormField label="Base Salary (AFN) *" value={form.baseSalary} onChangeText={v => set('baseSalary', v)} keyboardType="numeric" error={errors.baseSalary} />
          <FormField label="Bonus (AFN)" value={form.bonus} onChangeText={v => set('bonus', v)} keyboardType="numeric" />
          <FormField label="Deductions (AFN)" value={form.deductions} onChangeText={v => set('deductions', v)} keyboardType="numeric" />

          <Card style={[styles.summaryCard, { backgroundColor: c.primary + '15' }]}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: c.primary }}>Net Salary</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '800', color: c.primary }}>{formatCurrency(netSalary)}</Text>
            </Card.Content>
          </Card>

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Payroll' : 'Create Payroll'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  summaryCard: { borderRadius: 10, marginTop: 12 },
  btn: { marginTop: 20, borderRadius: 12, paddingVertical: 4 },
});
