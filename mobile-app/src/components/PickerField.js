import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { TextInput, Text, Searchbar, Divider, Surface } from './LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function PickerField({ label, value, options, onSelect, error, displayValue, disabled, style, searchable }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { paperTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const c = paperTheme.colors;
  const { t, isRTL, fontFamily } = useLanguage();

  // options can be: string[] or { label, value }[]
  const normalizedOptions = options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
  const filtered = search
    ? normalizedOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOptions;

  const display = displayValue || (normalizedOptions.find(o => o.value === value)?.label) || '';

  // Bottom padding: respect home indicator on iOS, keyboard spacing on Android
  const sheetBottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) + 8 : 24;
  const maxListHeight = Dimensions.get('window').height * 0.5;

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity onPress={() => !disabled && setVisible(true)} activeOpacity={0.7}>
        <TextInput
          label={t(label)}
          value={t(display)}
          error={!!error}
          mode="outlined"
          dense
          editable={false}
          disabled={disabled}
          {...(isRTL
            ? { left: <TextInput.Icon icon="chevron-down" /> }
            : { right: <TextInput.Icon icon="chevron-down" /> })}
          outlineStyle={{ borderRadius: 10 }}
          style={[styles.input, { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {error ? <Text style={[styles.error, { color: c.error, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t(error)}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={[styles.modalOverlay, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <Surface style={[styles.modalContent, { backgroundColor: c.surface, paddingBottom: sheetBottomPadding, direction: isRTL ? 'rtl' : 'ltr' }]} elevation={5}>
            {Platform.OS === 'ios' && <View style={styles.dragHandle} />}
            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text variant="titleMedium" style={{ fontWeight: '700', flex: 1, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{t(label)}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
                <MaterialCommunityIcons name="close" size={24} color={c.onSurface} />
              </TouchableOpacity>
            </View>
            {(searchable !== false && normalizedOptions.length > 6) && (
              <Searchbar
                value={search}
                onChangeText={setSearch}
                placeholder={t('Search...')}
                style={[styles.search, { backgroundColor: c.surfaceVariant }]}
                inputStyle={{ fontSize: 14, fontFamily, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }}
              />
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item, idx) => String(item.value ?? idx)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, isRTL && { flexDirection: 'row-reverse' }, item.value === value && { backgroundColor: c.primaryContainer }]}
                  onPress={() => { onSelect(item.value); setVisible(false); setSearch(''); }}
                >
                  <Text style={[styles.optionText, { color: c.onSurface, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, item.value === value && { color: c.primary, fontWeight: '700' }]}>{t(item.label)}</Text>
                  {item.value === value && <MaterialCommunityIcons name="check" size={20} color={c.primary} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <Divider />}
              style={{ maxHeight: maxListHeight }}
              keyboardShouldPersistTaps="handled"
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
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginTop: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  search: { marginHorizontal: 12, marginBottom: 8, borderRadius: 10, elevation: 0 },
  option: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 15 },
});
