import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { TaskType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

const TYPES: { key: TaskType; label: string }[] = [
  { key: 'zaliti', label: 'Zálivka' },
  { key: 'hnojeni', label: 'Hnojení' },
  { key: 'sklizen', label: 'Sklizeň' },
  { key: 'orez', label: 'Řez' },
  { key: 'ochrana', label: 'Ochrana' },
  { key: 'jine', label: 'Jiné' },
];

export default function AddTaskScreen({ navigation }: Props) {
  const { garden, beds, trees, addTask } = useAppData();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('zaliti');
  const [dueDate, setDueDate] = useState(new Date().toLocaleDateString('cs-CZ'));
  const [bedIds, setBedIds] = useState<string[]>([]);
  const [treeIds, setTreeIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleBed = (id: string) =>
    setBedIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  const toggleTree = (id: string) =>
    setTreeIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const parseDate = (value: string): string => {
    const parts = value.split('.').map((p) => p.trim());
    if (parts.length === 3) {
      const [d, m, y] = parts;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
    return new Date().toISOString();
  };

  const handleSave = useSingleSubmit(async () => {
    setSubmitted(true);
    if (!title.trim()) return;
    await addTask({
      gardenId: garden?.id ?? '',
      bedIds,
      treeIds,
      title: title.trim(),
      type,
      dueDate: parseDate(dueDate),
    });
    navigation.goBack();
  });

  return (
    <Screen>
      <SectionTitle>Nový úkol</SectionTitle>
      <TextField label="Název úkolu" required value={title} onChangeText={setTitle} placeholder="např. Zalít rajčata" />
      {submitted && !title.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyplňte prosím název úkolu.
        </Text>
      )}
      <Text style={styles.label}>Typ úkolu</Text>
      <View style={styles.chipRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setType(t.key)}
            style={[styles.chip, type === t.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <TextField label="Termín" value={dueDate} onChangeText={setDueDate} placeholder="d.m.rrrr" />

      {(beds.length > 0 || trees.length > 0) && (
        <>
          <Text style={styles.label}>Vázat na záhony nebo stromy/keře (volitelné, lze víc)</Text>
          <View style={styles.chipRow}>
            {beds.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => toggleBed(b.id)}
                style={[styles.chip, bedIds.includes(b.id) && styles.chipActive]}
              >
                <Text style={[styles.chipText, bedIds.includes(b.id) && styles.chipTextActive]}>
                  🪴 {b.name}
                </Text>
              </Pressable>
            ))}
            {trees.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => toggleTree(t.id)}
                style={[styles.chip, treeIds.includes(t.id) && styles.chipActive]}
              >
                <Text style={[styles.chipText, treeIds.includes(t.id) && styles.chipTextActive]}>
                  🌳 {t.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <PrimaryButton title="Uložit úkol" onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: 'white' },
});
