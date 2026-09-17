import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { TreeCategory } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTree'>;

export default function AddTreeScreen({ navigation }: Props) {
  const { addTree } = useAppData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TreeCategory>('ovocny');
  const [rootstockType, setRootstockType] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCreate = async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    await addTree({
      name: name.trim(),
      category,
      rootstockType: rootstockType.trim() || undefined,
      location: location.trim() || undefined,
      plantedAt: new Date().toISOString(),
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <SectionTitle>Nový strom / keř</SectionTitle>
      <TextField label="Název" required value={name} onChangeText={setName} placeholder="např. Jabloň Golden" />
      {submitted && !name.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyplňte prosím název.
        </Text>
      )}
      <Text style={styles.label}>Kategorie</Text>
      <View style={styles.typeRow}>
        {(['ovocny', 'okrasny'] as TreeCategory[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.typeChip, category === c && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, category === c && styles.typeChipTextActive]}>
              {c === 'ovocny' ? 'Ovocný' : 'Okrasný'}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextField
        label="Typ podnože (volitelné)"
        value={rootstockType}
        onChangeText={setRootstockType}
        placeholder="např. slabě rostoucí M9"
      />
      <TextField
        label="Umístění (volitelné)"
        value={location}
        onChangeText={setLocation}
        placeholder="např. u plotu"
      />
      <PrimaryButton title="Uložit" onPress={handleCreate} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { color: colors.text, fontWeight: '600' },
  typeChipTextActive: { color: 'white' },
});
