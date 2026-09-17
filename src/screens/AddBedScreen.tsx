import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { BedType } from '../types';
import { BED_TYPE_LABEL } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBed'>;

const TYPES: BedType[] = ['zeleninovy', 'bylinkovy', 'kvetinovy', 'jiny'];

export default function AddBedScreen({ navigation }: Props) {
  const { addBed } = useAppData();
  const [name, setName] = useState('');
  const [type, setType] = useState<BedType>('zeleninovy');
  const [submitted, setSubmitted] = useState(false);

  const handleCreate = async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    await addBed({ name: name.trim(), type, foundedAt: new Date().toISOString() });
    navigation.goBack();
  };

  return (
    <Screen>
      <SectionTitle>Nový záhon</SectionTitle>
      <TextField label="Název záhonu" required value={name} onChangeText={setName} placeholder="např. Záhon u plotu" />
      {submitted && !name.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyplňte prosím název záhonu.
        </Text>
      )}
      <Text style={styles.label}>Typ záhonu</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
              {BED_TYPE_LABEL[t]}
            </Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton title="Uložit záhon" onPress={handleCreate} />
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
