import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

export default function FormField({ label, value, onChangeText, error, multiline, keyboardType, secureTextEntry, disabled, right, left, style, numberOfLines, placeholder }) {
  const { paperTheme } = useAppTheme();
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
        outlineStyle={{ borderRadius: 10 }}
        dense
      />
      {error ? <HelperText type="error" visible>{error}</HelperText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  input: { fontSize: 14 },
});
