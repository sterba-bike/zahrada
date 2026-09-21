import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ui';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText: string;
  onCancel?: () => void;
  onConfirm: () => void;
  danger?: boolean;
}

// React Native Web nemá vlastní implementaci Alert.alert s víc tlačítky (na webu
// se nic nezobrazí), proto pro potvrzení s víc tlačítky používáme vlastní modál,
// který funguje stejně na webu i v nativní appce. Bez cancelText/onCancel funguje
// jako jednoduché informativní oznámení s jedním tlačítkem.
export default function ConfirmDialog({
  visible,
  title,
  message,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  danger,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel ?? onConfirm}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            {cancelText && onCancel && (
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, danger ? styles.dangerButton : styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  message: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 18 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  cancelButton: { backgroundColor: colors.bg },
  confirmButton: { backgroundColor: colors.primary },
  dangerButton: { backgroundColor: colors.danger },
  cancelText: { color: colors.text, fontWeight: '600' },
  confirmText: { color: 'white', fontWeight: '700' },
});
