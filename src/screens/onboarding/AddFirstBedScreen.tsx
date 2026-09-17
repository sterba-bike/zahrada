import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen, TextField, PrimaryButton, SecondaryButton, SectionTitle, colors } from '../../components/ui';
import { useAppData } from '../../context/AppDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFirstBed'>;

export default function AddFirstBedScreen({ navigation }: Props) {
  const { addBed } = useAppData();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const finish = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

  const handleCreate = async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    await addBed({
      name: name.trim(),
      type: 'zeleninovy',
      foundedAt: new Date().toISOString(),
    });
    finish();
  };

  return (
    <Screen>
      <SectionTitle>Přidat první záhon</SectionTitle>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Volitelné - záhon můžete přidat i později v Moje zahrada.
      </Text>
      <TextField label="Název záhonu" value={name} onChangeText={setName} placeholder="např. Záhon u plotu" />
      {submitted && !name.trim() && (
        <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>
          Vyplňte prosím název záhonu, nebo krok přeskočte.
        </Text>
      )}
      <PrimaryButton title="Vytvořit záhon a dokončit" onPress={handleCreate} />
      <SecondaryButton title="Přeskočit" onPress={finish} />
    </Screen>
  );
}
