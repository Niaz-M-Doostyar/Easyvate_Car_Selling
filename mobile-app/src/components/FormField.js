import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

export default function FormField({ label, value, onChangeText, error, multiline, keyboardType, secureTextEntry, disabled, right, left, style, numberOfLines, placeholder }) {
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        label={label}
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
        placeholder={placeholder}
        mode="outlined"
        style={[styles.input, multiline && { minHeight: 80 }]}
        outlineStyle={{ borderRadius: 14, borderWidth: 1.5 }}
        outlineColor={c.border}
        activeOutlineColor={c.primary}
        placeholderTextColor={c.onSurfaceVariant + '80'}
        dense
      />
      {error ? <HelperText type="error" visible style={styles.helper}>{error}</HelperText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  input: { fontSize: 15 },
  helper: { marginTop: -2 },
});
