import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, TextField, PrimaryButton, HelperNote, colors } from '../components/ui';
import { DateField } from '../components/DatePicker';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { SEED_TREE_SPECIES } from '../data/seedTrees';
import { EARLINESS_LABEL, EarlinessGroup, TreeCategory } from '../types';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'EditTree'>;

const EARLINESS_OPTIONS: EarlinessGroup[] = ['rana', 'polorana', 'pozdni'];

export default function EditTreeScreen({ route, navigation }: Props) {
  const { treeId } = route.params;
  const { trees, updateTree } = useAppData();
  const tree = trees.find((t) => t.id === treeId);

  const [name, setName] = useState(tree?.name ?? '');
  const [variety, setVariety] = useState(tree?.variety ?? '');
  const [earliness, setEarliness] = useState<EarlinessGroup | undefined>(tree?.varietyEarliness);
  const [category, setCategory] = useState<TreeCategory>(tree?.category ?? 'ovocny');
  const [speciesId, setSpeciesId] = useState<string | undefined>(tree?.speciesId);
  const [rootstockType, setRootstockType] = useState(tree?.rootstockType ?? '');
  const [location, setLocation] = useState(tree?.location ?? '');
  const [plantedAt, setPlantedAt] = useState(new Date(tree?.plantedAt ?? Date.now()));
  const [status, setStatus] = useState(tree?.status ?? '');
  const [note, setNote] = useState(tree?.note ?? '');
  const [submitted, setSubmitted] = useState(false);

  const handleSave = useSingleSubmit(async () => {
    setSubmitted(true);
    if (!tree || !name.trim()) return;
    await updateTree(tree.id, {
      name: name.trim(),
      variety: variety.trim() || undefined,
      varietyEarliness: earliness,
      category,
      speciesId: category === 'ovocny' ? speciesId : undefined,
      rootstockType: rootstockType.trim() || undefined,
      location: location.trim() || undefined,
      plantedAt: plantedAt.toISOString(),
      status: status.trim() || undefined,
      note: note.trim() || undefined,
    });
    navigation.goBack();
  });

  if (!tree) {
    return (
      <Screen>
        <Text>Strom/keř nebyl nalezen.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
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
        <View style={styles.chipRow}>
          {EARLINESS_OPTIONS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEarliness(earliness === e ? undefined : e)}
              style={[styles.chip, earliness === e && styles.chipActive]}
            >
              <Text style={[styles.chipText, earliness === e && styles.chipTextActive]}>{EARLINESS_LABEL[e]}</Text>
            </Pressable>
          ))}
        </View>

        <DateField label="Datum vysazení" required value={plantedAt} onChange={setPlantedAt} />

        <Text style={styles.label}>Kategorie</Text>
        <View style={styles.chipRow}>
          {(['ovocny', 'okrasny'] as TreeCategory[]).map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c === 'ovocny' ? 'Ovocný' : 'Okrasný'}
              </Text>
            </Pressable>
          ))}
        </View>

        {category === 'ovocny' && (
          <>
            <Text style={styles.label}>Druh (volitelné)</Text>
            <View style={styles.chipRow}>
              {SEED_TREE_SPECIES.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSpeciesId(speciesId === s.id ? undefined : s.id)}
                  style={[styles.chip, speciesId === s.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, speciesId === s.id && styles.chipTextActive]}>{s.name}</Text>
                </Pressable>
              ))}
            </View>
            <HelperNote>
              Podle druhu appka umí občas upozornit na typickou sezónní chorobu/škůdce (např. kadeřavost broskvoně).
            </HelperNote>
          </>
        )}

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
        <TextField label="Stav (volitelné)" value={status} onChangeText={setStatus} placeholder="např. zdravý" />
        <TextField
          label="Poznámka (volitelné)"
          value={note}
          onChangeText={setNote}
          placeholder="např. napadení škůdcem, poznámka k péči"
          multiline
        />

        <PrimaryButton title="Uložit změny" onPress={handleSave} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
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
