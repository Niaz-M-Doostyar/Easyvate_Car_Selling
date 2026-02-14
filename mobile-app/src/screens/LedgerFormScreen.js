import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, RadioButton } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { LEDGER_TYPES } from '../utils/constants';
import apiClient from '../api/client';

export default function LedgerFormScreen({ navigation, route }) {
  const editing = route.params?.entry;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({
    type: 'Capital Investment',
    description: '', amount: '', currency: 'AFN',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type || 'Capital Investment',
        description: editing.description || '',
        amount: String(Math.abs(editing.amount || editing.credit || editing.debit || 0)),
        currency: editing.currency || 'AFN',
        date: (editing.date || editing.createdAt || new Date().toISOString()).split('T')[0],
        notes: editing.notes || '',
      });
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Type required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.description) e.description = 'Description required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await apiClient.put(`/ledger/showroom/${editing.id}`, payload);
      } else {
        await apiClient.post('/ledger/showroom', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  return (
    <ScreenWrapper title={editing ? 'Edit Entry' : 'New Entry'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Ledger Entry</Text>

          <PickerField label="Entry Type *" value={form.type} options={LEDGER_TYPES} onSelect={v => set('type', v)} error={errors.type} />
          <FormField label="Description *" value={form.description} onChangeText={v => set('description', v)} error={errors.description} />
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

          <Divider style={{ marginVertical: 16 }} />
          <FormField label="Notes" value={form.notes} onChangeText={v => set('notes', v)} multiline numberOfLines={3} />

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update Entry' : 'Create Entry'}
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
