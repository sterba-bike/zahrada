import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, PrimaryButton, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'ShareGarden'>;

export default function ShareGardenScreen({ navigation }: Props) {
  const { garden, members } = useAppData();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!garden) {
    return (
      <Screen>
        <Text>Zahrada nebyla nalezena.</Text>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <SectionTitle>Sdílet zahradu</SectionTitle>
        <Card>
          <Text style={styles.text}>
            Pro sdílení zahrady se musíš nejdřív přihlásit (nebo si vytvořit účet) - najdeš to v Profilu.
          </Text>
          <Pressable onPress={() => navigation.getParent()?.navigate('Profil' as never)}>
            <Text style={styles.link}>Přejít do Profilu →</Text>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  if (garden.shared) {
    return (
      <Screen>
        <SectionTitle>Sdílená zahrada</SectionTitle>
        <Card>
          <Text style={styles.text}>
            Tuhle zahradu vidí i sdílí s tebou i další lidé, kteří se připojí přes kód níže. Kdokoliv v ní
            přidá/upraví záhon, strom, úkol, deník nebo sklizeň, uvidí to hned i ostatní.
          </Text>
          <Text style={styles.codeLabel}>Kód pozvánky</Text>
          <Text style={styles.code} selectable>
            {garden.inviteCode}
          </Text>
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(garden.inviteCode ?? '');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={styles.copyButton}
          >
            <Text style={styles.copyButtonText}>{copied ? '✓ Zkopírováno' : '📋 Zkopírovat kód'}</Text>
          </Pressable>
        </Card>

        <SectionTitle>Členové ({members.length})</SectionTitle>
        {members.map((m) => (
          <Card key={m.uid}>
            <Text style={styles.memberEmail}>{m.email}</Text>
            <Text style={styles.memberRole}>{m.role === 'vlastnik' ? 'Vlastník' : 'Člen'}</Text>
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle>Sdílet zahradu</SectionTitle>
      <Card>
        <Text style={styles.text}>
          Sdílením se "{garden.name}" nahraje do cloudu (vč. záhonů, úkolů, deníku a sklizně). Vygeneruje se
          kód pozvánky, který můžeš poslat další osobě (přes SMS, WhatsApp, e-mail...) - po zadání kódu a
          přihlášení uvidí stejnou zahradu na svém telefonu.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <ShareButton navigation={navigation} setError={setError} />
      </Card>
    </Screen>
  );
}

function ShareButton({
  navigation,
  setError,
}: {
  navigation: Props['navigation'];
  setError: (e: string | null) => void;
}) {
  const { shareGarden } = useAppData();
  const [submitting, setSubmitting] = useState(false);

  const handlePress = useSingleSubmit(async () => {
    setError(null);
    setSubmitting(true);
    try {
      await shareGarden();
    } catch (err) {
      setError('Sdílení se nepodařilo - zkontroluj připojení k internetu a zkus to znovu.');
    } finally {
      setSubmitting(false);
    }
  });

  return <PrimaryButton title="Sdílet tuto zahradu" onPress={handlePress} disabled={submitting} />;
}

const styles = StyleSheet.create({
  text: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 },
  link: { color: colors.primary, fontWeight: '600' },
  error: { color: colors.danger, marginBottom: 10, fontSize: 13 },
  codeLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: 4 },
  code: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 6,
    marginVertical: 8,
  },
  copyButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  copyButtonText: { color: colors.primaryDark, fontWeight: '700' },
  memberEmail: { fontSize: 14, fontWeight: '700', color: colors.text },
  memberRole: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
