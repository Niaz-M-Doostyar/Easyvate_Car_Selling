import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text } from './LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ConfirmDialog({ visible, title, message, onConfirm, onDismiss, confirmLabel, destructive }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const iconColor = destructive ? c.error : c.primary;
  const { t, isRTL, fontFamily } = useLanguage();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: c.card }]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + '15' }]}>
            <MaterialCommunityIcons
              name={destructive ? 'alert-circle-outline' : 'help-circle-outline'}
              size={32}
              color={iconColor}
            />
          </View>
        </View>
        <Dialog.Title style={[styles.title, { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t(title || 'Confirm')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={[styles.message, { color: c.onSurfaceVariant, fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t(message || 'Are you sure?')}</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            onPress={onDismiss}
            mode="outlined"
            style={styles.cancelBtn}
            labelStyle={styles.btnLabel}
          >
            {t('Cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            buttonColor={destructive ? c.error : c.primary}
            textColor="#fff"
            style={styles.confirmBtn}
            labelStyle={styles.btnLabel}
          >
            {t(confirmLabel || 'Confirm')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 24, paddingTop: 8 },
  iconRow: { alignItems: 'center', paddingTop: 16 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  title: { textAlign: 'center', fontWeight: '700', fontSize: 18 },
  message: { textAlign: 'center', lineHeight: 20 },
  actions: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  cancelBtn: { flex: 1, borderRadius: 14 },
  confirmBtn: { flex: 1, borderRadius: 14 },
  btnLabel: { fontWeight: '700', fontSize: 14 },
});
