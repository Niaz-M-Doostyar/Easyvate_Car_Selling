import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Text, Searchbar, Divider, Portal, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';

export default function PickerField({ label, value, options, onSelect, error, displayValue, disabled, style, searchable }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  // options can be: string[] or { label, value }[]
  const normalizedOptions = options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
  const filtered = search
    ? normalizedOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOptions;

  const display = displayValue || (normalizedOptions.find(o => o.value === value)?.label) || '';

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity onPress={() => !disabled && setVisible(true)} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={display}
          error={!!error}
          mode="outlined"
          dense
          editable={false}
          disabled={disabled}
          right={<TextInput.Icon icon="chevron-down" />}
          outlineStyle={{ borderRadius: 10 }}
          style={styles.input}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {error ? <Text style={[styles.error, { color: c.error }]}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContent, { backgroundColor: c.surface }]} elevation={5}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" style={{ fontWeight: '700', flex: 1 }}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={c.onSurface} />
              </TouchableOpacity>
            </View>
            {(searchable !== false && normalizedOptions.length > 6) && (
              <Searchbar
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                style={[styles.search, { backgroundColor: c.surfaceVariant }]}
                inputStyle={{ fontSize: 14 }}
              />
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item, idx) => String(item.value ?? idx)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && { backgroundColor: c.primaryContainer }]}
                  onPress={() => { onSelect(item.value); setVisible(false); setSearch(''); }}
                >
                  <Text style={[styles.optionText, { color: c.onSurface }, item.value === value && { color: c.primary, fontWeight: '700' }]}>{item.label}</Text>
                  {item.value === value && <MaterialCommunityIcons name="check" size={20} color={c.primary} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <Divider />}
              style={{ maxHeight: 400 }}
            />
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  input: { fontSize: 14 },
  error: { fontSize: 12, marginTop: 2, marginLeft: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  search: { marginHorizontal: 12, marginBottom: 8, borderRadius: 10, elevation: 0 },
  option: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 15 },
});
