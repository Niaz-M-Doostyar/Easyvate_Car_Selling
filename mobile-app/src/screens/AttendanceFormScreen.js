import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Card } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { MONTHS } from '../utils/constants';
import { validateRequired } from '../utils/validation';
import apiClient from '../api/client';

export default function AttendanceFormScreen({ navigation, route }) {
  const editing = route.params?.record;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    month: MONTHS[new Date().getMonth()],
    year: String(new Date().getFullYear()),
    presentDays: '',
    absentDays: '',
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
        presentDays: String(editing.presentDays || ''),
        absentDays: String(editing.absentDays || ''),
        notes: editing.notes || '',
      });
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = 'Employee is required';
    if (!form.month) e.month = 'Month is required';
    if (!form.year) e.year = 'Year is required';
    if (!form.presentDays && form.presentDays !== '0') e.presentDays = 'Required';
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
        presentDays: Number(form.presentDays),
        absentDays: Number(form.absentDays || 0),
        year: Number(form.year),
      };
      if (editing) {
        await apiClient.put(`/attendance/${editing.id}`, payload);
      } else {
        await apiClient.post('/attendance', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const empOptions = employees.map(e => ({ label: `${e.fullName} - ${e.position || 'Employee'}`, value: String(e.id) }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const totalDays = (Number(form.presentDays) || 0) + (Number(form.absentDays) || 0);
  const pct = totalDays > 0 ? Math.round((Number(form.presentDays) || 0) / totalDays * 100) : 0;

  return (
    <ScreenWrapper title={editing ? 'Edit Attendance' : 'New Attendance'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Attendance Record</Text>

          <PickerField label="Employee *" value={form.employeeId ? empOptions.find(o => o.value === form.employeeId)?.label : ''}
            options={empOptions.map(o => o.label)}
            onSelect={v => { const opt = empOptions.find(o => o.label === v); if (opt) set('employeeId', opt.value); }}
            error={errors.employeeId} />

          <PickerField label="Month *" value={form.month} options={MONTHS} onSelect={v => set('month', v)} error={errors.month} />
          <PickerField label="Year *" value={form.year} options={yearOptions} onSelect={v => set('year', v)} error={errors.year} />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Days</Text>

          <FormField label="Present Days *" value={form.presentDays} onChangeText={v => set('presentDays', v)} keyboardType="numeric" error={errors.presentDays} />
          <FormField label="Absent Days" value={form.absentDays} onChangeText={v => set('absentDays', v)} keyboardType="numeric" />

          {/* Summary card */}
          <Card style={[styles.infoCard, { backgroundColor: c.surfaceVariant }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant }}>Total Days</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: c.onSurface }}>{totalDays}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant }}>Attendance Rate</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336' }}>{pct}%</Text>
              </View>
            </Card.Content>
          </Card>

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Record' : 'Save Record'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  infoCard: { borderRadius: 10, marginTop: 12 },
  btn: { marginTop: 20, borderRadius: 12, paddingVertical: 4 },
});
