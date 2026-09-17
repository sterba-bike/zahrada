import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { SEED_PLANT_SPECIES } from '../data/seedPlants';
import { checkCropRotation, checkCompanionPlanting } from '../rules/cropRotation';
import { DIFFICULTY_LABEL } from '../utils/format';
import { PlantSpecies } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPlant'>;

export default function AddPlantScreen({ route, navigation }: Props) {
  const { bedId } = route.params;
  const { bedHistory, addPlanting } = useAppData();
  const [selected, setSelected] = useState<PlantSpecies | null>(null);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [warning, setWarning] = useState<{ species: PlantSpecies; year: number; message: string } | null>(
    null
  );

  const history = bedHistory(bedId);
  const currentlyGrowingIds = useMemo(
    () => Array.from(new Set(history.map((p) => p.speciesId))),
    [history]
  );

  const commitPlanting = useSingleSubmit(async (species: PlantSpecies, yearNum: number) => {
    await addPlanting({
      bedId,
      speciesId: species.id,
      plantedAt: new Date().toISOString(),
      year: yearNum,
      status: 'roste',
    });
    navigation.goBack();
  });

  const handleAdd = () => {
    if (!selected) return;
    const yearNum = parseInt(year, 10) || new Date().getFullYear();

    const rotationWarnings = checkCropRotation(history, selected, yearNum);
    const companionWarnings = checkCompanionPlanting(selected, currentlyGrowingIds);

    const allMessages = [
      ...rotationWarnings.map((w) => w.message),
      ...companionWarnings.map(
        (w) => `${selected.name} a ${w.otherSpeciesName} si nesvědčí: ${w.reason}`
      ),
    ];

    if (allMessages.length === 0) {
      commitPlanting(selected, yearNum);
      return;
    }

    setWarning({ species: selected, year: yearNum, message: allMessages.join('\n\n') });
  };

  return (
    <Screen>
      <SectionTitle>Vybrat rostlinu</SectionTitle>
      <View style={styles.grid}>
        {SEED_PLANT_SPECIES.map((sp) => (
          <Pressable
            key={sp.id}
            onPress={() => setSelected(sp)}
            style={[styles.chip, selected?.id === sp.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, selected?.id === sp.id && styles.chipTextActive]}>
              {sp.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {selected && (
        <Card style={{ marginTop: 16 }}>
          <Text style={styles.detailTitle}>{selected.name}</Text>
          <Text style={styles.detailMeta}>{DIFFICULTY_LABEL[selected.difficultyGroup]}</Text>
          <Text style={styles.detailMeta}>Světlo: {selected.lightNeeds}</Text>
          <Text style={styles.detailMeta}>Voda: {selected.waterNeeds}</Text>
          <TextField label="Rok osazení" required value={year} onChangeText={setYear} keyboardType="number-pad" />
          <PrimaryButton title="Přidat rostlinu do záhonu" onPress={handleAdd} />
        </Card>
      )}

      <ConfirmDialog
        visible={!!warning}
        title="Upozornění před přidáním"
        message={warning?.message ?? ''}
        cancelText="Zrušit"
        confirmText="Přesto přidat"
        onCancel={() => setWarning(null)}
        onConfirm={() => {
          if (warning) commitPlanting(warning.species, warning.year);
          setWarning(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  detailMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
});
