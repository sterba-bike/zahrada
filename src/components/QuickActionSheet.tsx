import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
  onWriteNote: () => void;
  onRecordHarvest: () => void;
  onCompleteTask: () => void;
  onDiagnosePhoto: () => void;
}

export default function QuickActionSheet({
  visible,
  onClose,
  onPickPhoto,
  onWriteNote,
  onRecordHarvest,
  onCompleteTask,
  onDiagnosePhoto,
}: Props) {
  const action = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Rychlý záznam</Text>
          <SheetButton emoji="📷" label="Přidat fotku" onPress={() => action(onPickPhoto)} />
          <SheetButton emoji="📝" label="Napsat poznámku" onPress={() => action(onWriteNote)} />
          <SheetButton emoji="🧺" label="Zaznamenat sklizeň" onPress={() => action(onRecordHarvest)} />
          <SheetButton emoji="✅" label="Označit úkol hotový" onPress={() => action(onCompleteTask)} />
          <SheetButton emoji="🔍" label="Rozpoznat chorobu/škůdce" onPress={() => action(onDiagnosePhoto)} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetButton({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onPress}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  buttonPressed: { opacity: 0.7 },
  emoji: { fontSize: 20, marginRight: 12 },
  buttonLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
});
