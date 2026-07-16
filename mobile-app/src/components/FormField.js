import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, HelperText } from './LocalizedPaper';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function FormField({ label, value, onChangeText, error, multiline, keyboardType, secureTextEntry, disabled, right, left, style, numberOfLines, placeholder }) {
  const { paperTheme, isDark } = useAppTheme();
  const { t, isRTL, fontFamily } = useLanguage();
  const c = paperTheme.colors;
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        label={t(label)}
        value={value != null ? String(value) : ''}
        onChangeText={onChangeText}
        error={!!error}
        multiline={multiline}
        numberOfLines={numberOfLines || (multiline ? 3 : 1)}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        disabled={disabled}
        right={right}
        left={left}
        placeholder={placeholder ? t(placeholder) : undefined}
        mode="outlined"
        style={[styles.input, multiline && styles.multiline, { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}
        outlineStyle={{ borderRadius: 14, borderWidth: 1.5 }}
        outlineColor={c.border}
        activeOutlineColor={c.primary}
        placeholderTextColor={c.onSurfaceVariant + '80'}
        textAlignVertical={multiline ? 'top' : 'center'}
        dense
      />
      {error ? <HelperText type="error" visible style={[styles.helper, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t(error)}</HelperText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  input: { fontSize: 15 },
  multiline: { minHeight: Platform.OS === 'ios' ? 90 : 80 },
  helper: { marginTop: -2 },
});
