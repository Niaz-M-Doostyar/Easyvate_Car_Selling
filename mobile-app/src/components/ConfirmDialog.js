import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

export default function ConfirmDialog({ visible, title, message, onConfirm, onDismiss, confirmLabel, destructive }) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderRadius: 16 }}>
        <Dialog.Title>{title || 'Confirm'}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message || 'Are you sure?'}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            buttonColor={destructive ? '#d32f2f' : undefined}
            textColor={destructive ? '#fff' : undefined}
          >
            {confirmLabel || 'Confirm'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
