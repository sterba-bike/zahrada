import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import { DateField } from '../components/DatePicker';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordHarvest'>;

export default function RecordHarvestScreen({ route, navigation }: Props) {
  const { bedId, treeId } = route.params ?? {};
  const { garden, beds, trees, addHarvest } = useAppData();
  const place = bedId
    ? beds.find((b) => b.id === bedId)?.name
    : treeId
    ? trees.find((t) => t.id === treeId)?.name
    : undefined;
  const [cropName, setCropName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('kg');
  const [date, setDate] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const amountNum = parseFloat(amount.replace(',', '.'));
  const canSubmit = cropName.trim().length > 0 && amountNum > 0;

  const handleSave = useSingleSubmit(async () => {
    setSubmitted(true);
    if (!canSubmit || saved) return;
    await addHarvest({
      gardenId: garden?.id ?? '',
      bedId,
      treeId,
      cropName: cropName.trim(),
      amount: amountNum,
      unit: unit.trim() || 'kg',
      date: date.toISOString(),
    });
    setSaved(true);
    setTimeout(() => navigation.goBack(), 700);
  });

  return (
    <Screen>
      <SectionTitle>Zaznamenat sklizeň</SectionTitle>
      {place && <Text style={styles.placeLabel}>🧺 {place}</Text>}
      <TextField label="Plodina" required value={cropName} onChangeText={setCropName} placeholder="např. Rajče" />
      {submitted && !cropName.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyberte prosím plodinu.
        </Text>
      )}
      <TextField
        label="Množství"
        required
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="např. 2.5"
      />
      {submitted && !(amountNum > 0) && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Množství musí být větší než 0.
        </Text>
      )}
      <TextField label="Jednotka" value={unit} onChangeText={setUnit} placeholder="kg" />
      <DateField label="Datum" required value={date} onChange={setDate} />
      <PrimaryButton title="Uložit sklizeň" onPress={handleSave} disabled={saved} />
      {saved && (
        <Text style={{ color: '#8A5A00', textAlign: 'center', marginTop: 12, fontWeight: '700', fontSize: 15 }}>
          🌟 Skvěle, sklizeň je zapsaná!
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  placeLabel: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginBottom: 12 },
});
