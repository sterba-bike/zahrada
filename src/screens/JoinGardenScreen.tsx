import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, TextField, PrimaryButton, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'JoinGarden'>;

export default function JoinGardenScreen({ navigation }: Props) {
  const { joinGarden } = useAppData();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = useSingleSubmit(async () => {
    setError(null);
    if (!code.trim()) {
      setError('Zadejte prosím kód pozvánky.');
      return;
    }
    setSubmitting(true);
    try {
      await joinGarden(code.trim());
      navigation.navigate('GardenDetail');
    } catch (err) {
      const message = (err as Error)?.message;
      setError(
        message === 'invite_code_not_found'
          ? 'Tenhle kód pozvánky appka nenašla - zkontrolujte, jestli je opsaný správně.'
          : 'Připojení se nepovedlo - zkontrolujte připojení k internetu a zkuste to znovu.'
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!user) {
    return (
      <Screen>
        <SectionTitle>Připojit se ke sdílené zahradě</SectionTitle>
        <Card>
          <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 }}>
            Pro připojení ke sdílené zahradě se musíte nejdřív přihlásit (nebo si vytvořit účet) - najdete
            to v Profilu.
          </Text>
          <Pressable onPress={() => navigation.getParent()?.navigate('Profil' as never)}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Přejít do Profilu →</Text>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle>Připojit se ke sdílené zahradě</SectionTitle>
      <Card>
        <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 }}>
          Zadejte kód pozvánky, který jste dostali od vlastníka zahrady.
        </Text>
        <TextField
          label="Kód pozvánky"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          placeholder="např. AB12CD"
        />
        {error && <Text style={{ color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 }}>{error}</Text>}
        <PrimaryButton title="Připojit se" onPress={handleJoin} disabled={submitting} />
      </Card>
    </Screen>
  );
}
