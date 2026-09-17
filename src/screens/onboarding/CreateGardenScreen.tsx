import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen, TextField, PrimaryButton, SectionTitle, colors } from '../../components/ui';
import { useAppData } from '../../context/AppDataContext';
import { useSingleSubmit } from '../../utils/useSingleSubmit';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGarden'>;

export default function CreateGardenScreen({ navigation }: Props) {
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
    const garden = await createGarden({
      name: name.trim(),
      location: location.trim(),
      elevation: elevation.trim() || undefined,
      orientation: orientation.trim() || undefined,
    });
    navigation.replace('AddFirstBed', { gardenId: garden.id });
  });

  return (
    <Screen>
      <SectionTitle>Založení první zahrady</SectionTitle>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Název a lokalita jsou povinné - GPS polohu appka používá jen pro dotaz na počasí, nikdy
        ji nezobrazuje veřejně.
      </Text>
      <TextField label="Název zahrady" required value={name} onChangeText={setName} placeholder="např. Domov" />
      {submitted && !name.trim() && <ErrorText text="Vyplňte prosím název zahrady." />}
      <TextField
        label="Lokalita"
        required
        value={location}
        onChangeText={setLocation}
        placeholder="např. Brno-venkov"
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
      <PrimaryButton title="Pokračovat" onPress={handleSubmit} />
    </Screen>
  );
}

function ErrorText({ text }: { text: string }) {
  return <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>{text}</Text>;
}
