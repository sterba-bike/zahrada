import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Card, TextField, PrimaryButton, colors } from './ui';
import { useAuth } from '../context/AuthContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';

// Chybové kódy Firebase Authentication přeložené do srozumitelné češtiny -
// appka jinak ukazuje jen anglický technický text.
const AUTH_ERROR_LABEL: Record<string, string> = {
  'auth/invalid-email': 'Zadejte prosím platnou e-mailovou adresu.',
  'auth/missing-password': 'Zadejte prosím heslo.',
  'auth/weak-password': 'Heslo musí mít aspoň 6 znaků.',
  'auth/email-already-in-use': 'Tenhle e-mail už má založený účet - zkuste se přihlásit.',
  'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
  'auth/wrong-password': 'Nesprávný e-mail nebo heslo.',
  'auth/user-not-found': 'Účet s tímhle e-mailem neexistuje - zkuste se registrovat.',
  'auth/too-many-requests': 'Příliš mnoho pokusů, zkuste to za chvíli znovu.',
  'auth/network-request-failed': 'Appka se nedostala k internetu - zkontrolujte připojení.',
};

function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  return AUTH_ERROR_LABEL[code] ?? 'Něco se nepovedlo, zkuste to prosím znovu.';
}

export default function AccountSection() {
  const { user, authLoading, signIn, signUp, signOutUser } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useSingleSubmit(async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Vyplňte prosím e-mail i heslo.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      setPassword('');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  });

  if (authLoading) {
    return (
      <Card>
        <Text style={styles.meta}>Načítám…</Text>
      </Card>
    );
  }

  if (user) {
    return (
      <Card>
        <Text style={styles.title}>Přihlášen(a) jako</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.meta}>
          Účet zatím slouží k budoucímu sdílení zahrady s dalšími lidmi - appka bez něj dál funguje
          úplně stejně, jen lokálně v telefonu.
        </Text>
        <Pressable onPress={() => signOutUser()} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Odhlásit se</Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.modeRow}>
        <Pressable onPress={() => setMode('signIn')} style={[styles.modeChip, mode === 'signIn' && styles.modeChipActive]}>
          <Text style={[styles.modeChipText, mode === 'signIn' && styles.modeChipTextActive]}>Přihlásit se</Text>
        </Pressable>
        <Pressable onPress={() => setMode('signUp')} style={[styles.modeChip, mode === 'signUp' && styles.modeChipActive]}>
          <Text style={[styles.modeChipText, mode === 'signUp' && styles.modeChipTextActive]}>Vytvořit účet</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Účet je zatím potřeba jen pro budoucí sdílení zahrady - jinak appka pracuje offline bez přihlášení.</Text>

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextField label="Heslo" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        title={mode === 'signIn' ? 'Přihlásit se' : 'Vytvořit účet'}
        onPress={handleSubmit}
        disabled={submitting}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  email: { fontSize: 15, color: colors.primaryDark, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 12, lineHeight: 17 },
  error: { color: colors.danger, marginTop: -10, marginBottom: 10, fontSize: 13 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeChipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  modeChipTextActive: { color: 'white' },
  signOutButton: { alignSelf: 'flex-start', marginTop: 4 },
  signOutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
