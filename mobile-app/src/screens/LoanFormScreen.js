import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, RadioButton } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { LOAN_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function LoanFormScreen({ navigation, route }) {
  const editing = route.params?.loan;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({
    personName: '', phoneNumber: '', loanType: 'Given',
    amount: '', currency: 'AFN',
    date: new Date().toISOString().split('T')[0],
    dueDate: '', description: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        personName: editing.personName || '',
        phoneNumber: editing.phoneNumber || '',
        loanType: editing.loanType || 'Given',
        amount: String(editing.amount || ''),
        currency: editing.currency || 'AFN',
        date: (editing.date || editing.createdAt || new Date().toISOString()).split('T')[0],
        dueDate: editing.dueDate ? editing.dueDate.split('T')[0] : '',
        description: editing.description || '',
        notes: editing.notes || '',
      });
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.personName) e.personName = 'Name required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.loanType) e.loanType = 'Type required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await apiClient.put(`/loans/${editing.id}`, payload);
      } else {
        await apiClient.post('/loans', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  return (
    <ScreenWrapper title={editing ? 'Edit Loan' : 'New Loan'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Loan Details</Text>

          <PickerField label="Loan Type *" value={form.loanType} options={LOAN_TYPES} onSelect={v => set('loanType', v)} error={errors.loanType} />
          <FormField label="Person Name *" value={form.personName} onChangeText={v => set('personName', v)} error={errors.personName} />
          <FormField label="Phone Number" value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)} keyboardType="phone-pad" />
          <FormField label="Amount *" value={form.amount} onChangeText={v => set('amount', v)} keyboardType="numeric" error={errors.amount} />

          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 8, marginBottom: 4 }}>Currency</Text>
          <RadioButton.Group value={form.currency} onValueChange={v => set('currency', v)}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {['AFN', 'USD', 'PKR'].map(cur => (
                <View key={cur} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <RadioButton value={cur} />
                  <Text variant="bodyMedium" style={{ color: c.onSurface }}>{cur}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>

          <FormField label="Date" value={form.date} onChangeText={v => set('date', v)} placeholder="YYYY-MM-DD" />
          <FormField label="Due Date" value={form.dueDate} onChangeText={v => set('dueDate', v)} placeholder="YYYY-MM-DD" />

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Description" value={form.description} onChangeText={v => set('description', v)} multiline numberOfLines={2} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Loan' : 'Create Loan'}
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
