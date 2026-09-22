import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'AddGarden'>;

export default function AddGardenScreen({ navigation }: Props) {
  const { createGarden } = useAppData();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [elevation, setElevation] = useState('');
  const [orientation, setOrientation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0 && location.trim().length > 0;

  const handleSubmit = useSingleSubmit(async () => {
    setSubmitted(true);
    if (!canSubmit) return;
    await createGarden({
      name: name.trim(),
      location: location.trim(),
      elevation: elevation.trim() || undefined,
      orientation: orientation.trim() || undefined,
    });
    navigation.navigate('GardenDetail');
  });

  return (
    <Screen>
      <SectionTitle>Přidat další zahradu</SectionTitle>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Nová zahrada se rovnou stane aktivní - kdykoli mezi zahradami přepnete přes název nahoře
        v detailu zahrady.
      </Text>
      <TextField label="Název zahrady" required value={name} onChangeText={setName} placeholder="např. Chalupa" />
      {submitted && !name.trim() && <ErrorText text="Vyplňte prosím název zahrady." />}
      <TextField
        label="Lokalita"
        required
        value={location}
        onChangeText={setLocation}
        placeholder="např. Krkonoše"
      />
      {submitted && !location.trim() && <ErrorText text="Vyplňte prosím lokalitu." />}
      <TextField
        label="Nadmořská výška (volitelné)"
        value={elevation}
        onChangeText={setElevation}
        placeholder="např. 320 m"
      />
      <TextField
        label="Orientace pozemku (volitelné)"
        value={orientation}
        onChangeText={setOrientation}
        placeholder="např. jih"
      />
      <PrimaryButton title="Založit zahradu" onPress={handleSubmit} />
    </Screen>
  );
}

function ErrorText({ text }: { text: string }) {
  return <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>{text}</Text>;
}
