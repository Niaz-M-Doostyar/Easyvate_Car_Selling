import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Divider, Card, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';
import { useAppTheme } from '../contexts/ThemeContext';
import { USER_ROLES, ROLE_ACCESS } from '../utils/constants';
import apiClient from '../api/client';

export default function UserFormScreen({ navigation, route }) {
  const editing = route.params?.user;
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [form, setForm] = useState({
    fullName: '', username: '', password: '', role: 'Viewer',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        fullName: editing.fullName || '',
        username: editing.username || '',
        password: '',
        role: editing.role || 'Viewer',
      });
    }
  }, [editing]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.fullName) e.fullName = 'Name required';
    if (!form.username) e.username = 'Username required';
    if (!editing && (!form.password || form.password.length < 6)) e.password = 'Min 6 characters';
    if (!form.role) e.role = 'Role required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await apiClient.put(`/auth/users/${editing.id}`, payload);
      } else {
        await apiClient.post('/auth/register', payload);
      }
      navigation.goBack();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const rolePermissions = ROLE_ACCESS[form.role] || [];

  return (
    <ScreenWrapper title={editing ? 'Edit User' : 'New User'} navigation={navigation} back>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Account Details</Text>

          <FormField label="Full Name *" value={form.fullName} onChangeText={v => set('fullName', v)} error={errors.fullName} />
          <FormField label="Username *" value={form.username} onChangeText={v => set('username', v)} error={errors.username} autoCapitalize="none" />
          <FormField label={editing ? 'New Password (leave blank to keep)' : 'Password *'}
            value={form.password} onChangeText={v => set('password', v)} error={errors.password} secureTextEntry />

          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 12, color: c.onSurface }}>Role & Permissions</Text>

          <PickerField label="Role *" value={form.role} options={USER_ROLES} onSelect={v => set('role', v)} error={errors.role} />

          {/* Permission preview */}
          <Card style={[styles.permCard, { backgroundColor: c.surfaceVariant }]}>
            <Card.Content>
              <Text variant="bodySmall" style={{ fontWeight: '700', color: c.onSurfaceVariant, marginBottom: 8 }}>Access Preview</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {rolePermissions.length > 0 ? rolePermissions.map(p => (
                  <Chip key={p} style={{ backgroundColor: c.surface }} textStyle={{ fontSize: 10 }}>{p}</Chip>
                )) : <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Select a role to preview</Text>}
              </View>
            </Card.Content>
          </Card>

          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving} style={styles.btn} labelStyle={{ fontWeight: '700' }}>
            {editing ? 'Update User' : 'Create User'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  permCard: { borderRadius: 10, marginTop: 12 },
  btn: { marginTop: 20, borderRadius: 12, paddingVertical: 4 },
});
