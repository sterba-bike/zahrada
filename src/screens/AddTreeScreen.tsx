import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, HelperNote, colors } from '../components/ui';
import { DateField } from '../components/DatePicker';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { EARLINESS_LABEL, EarlinessGroup, TreeCategory } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTree'>;

const EARLINESS_OPTIONS: EarlinessGroup[] = ['rana', 'polorana', 'pozdni'];

export default function AddTreeScreen({ navigation }: Props) {
  const { addTree } = useAppData();
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [earliness, setEarliness] = useState<EarlinessGroup | undefined>(undefined);
  const [category, setCategory] = useState<TreeCategory>('ovocny');
  const [rootstockType, setRootstockType] = useState('');
  const [location, setLocation] = useState('');
  const [plantedAt, setPlantedAt] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);

  const handleCreate = useSingleSubmit(async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    await addTree({
      name: name.trim(),
      variety: variety.trim() || undefined,
      varietyEarliness: earliness,
      category,
      rootstockType: rootstockType.trim() || undefined,
      location: location.trim() || undefined,
      plantedAt: plantedAt.toISOString(),
    });
    navigation.goBack();
  });

  return (
    <Screen>
      <SectionTitle>Nový strom / keř</SectionTitle>
      <TextField label="Název" required value={name} onChangeText={setName} placeholder="např. Jabloň" />
      {submitted && !name.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyplňte prosím název.
        </Text>
      )}
      <TextField
        label="Odrůda (volitelné)"
        value={variety}
        onChangeText={setVariety}
        placeholder="např. Golden Delicious, Idared"
      />
      <Text style={styles.label}>Ranost odrůdy (volitelné)</Text>
      <View style={styles.typeRow}>
        {EARLINESS_OPTIONS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEarliness(earliness === e ? undefined : e)}
            style={[styles.typeChip, earliness === e && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, earliness === e && styles.typeChipTextActive]}>
              {EARLINESS_LABEL[e]}
            </Text>
          </Pressable>
        ))}
      </View>
      <HelperNote>Odrůda i ranost se zatím píší/vybírají ručně - výběr ze seznamu odrůd appka nabídne v budoucí verzi.</HelperNote>
      <DateField label="Datum vysazení" required value={plantedAt} onChange={setPlantedAt} />
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
