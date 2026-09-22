import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, TextField, PrimaryButton, colors } from '../components/ui';
import { DateField } from '../components/DatePicker';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { getSpeciesById } from '../data/seedPlants';
import { EARLINESS_LABEL, EarlinessGroup } from '../types';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'EditPlant'>;

const EARLINESS_OPTIONS: EarlinessGroup[] = ['rana', 'polorana', 'pozdni'];
const STATUS_OPTIONS = ['roste', 'kvete', 'sklizeno', 'odstraněno'];

export default function EditPlantScreen({ route, navigation }: Props) {
  const { plantingId } = route.params;
  const { plantings, updatePlanting } = useAppData();
  const planting = plantings.find((p) => p.id === plantingId);
  const species = planting ? getSpeciesById(planting.speciesId) : undefined;

  const [plantedDate, setPlantedDate] = useState(new Date(planting?.plantedAt ?? Date.now()));
  const [variety, setVariety] = useState(planting?.variety ?? '');
  const [earliness, setEarliness] = useState<EarlinessGroup | undefined>(planting?.varietyEarliness);
  const [status, setStatus] = useState(planting?.status ?? 'roste');
  const [note, setNote] = useState(planting?.note ?? '');

  const handleSave = useSingleSubmit(async () => {
    if (!planting) return;
    await updatePlanting(planting.id, {
      plantedAt: plantedDate.toISOString(),
      year: plantedDate.getFullYear(),
      status: status.trim() || 'roste',
      variety: variety.trim() || undefined,
      varietyEarliness: earliness,
      note: note.trim() || undefined,
    });
    navigation.goBack();
  });

  if (!planting) {
    return (
      <Screen>
        <Text>Rostlina nebyla nalezena.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{species?.name ?? planting.speciesId}</Text>
      <Card style={{ marginTop: 12 }}>
        <TextField
          label="Odrůda (volitelné)"
          value={variety}
          onChangeText={setVariety}
          placeholder="konkrétní odrůda"
        />
        <Text style={styles.smallLabel}>Ranost odrůdy (volitelné)</Text>
        <View style={styles.chipRow}>
          {EARLINESS_OPTIONS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEarliness(earliness === e ? undefined : e)}
              style={[styles.smallChip, earliness === e && styles.chipActive]}
            >
              <Text style={[styles.chipText, earliness === e && styles.chipTextActive]}>
                {EARLINESS_LABEL[e]}
              </Text>
            </Pressable>
          ))}
        </View>

        <DateField label="Datum vysazení" required value={plantedDate} onChange={setPlantedDate} />

        <Text style={styles.smallLabel}>Stav</Text>
        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.smallChip, status === s && styles.chipActive]}
            >
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <TextField label="Vlastní stav (volitelné)" value={status} onChangeText={setStatus} />

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
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  smallLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: 'white' },
});
