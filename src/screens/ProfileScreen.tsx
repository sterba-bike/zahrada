import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Screen, TextField, Card, SecondaryButton, SectionTitle, colors } from '../components/ui';
import ConfirmDialog from '../components/ConfirmDialog';
import AccountSection from '../components/AccountSection';
import { useAppData } from '../context/AppDataContext';
import { useSingleSubmit } from '../utils/useSingleSubmit';
import { saveAndShareJson } from '../utils/exportFile';
import { ExperienceLevel } from '../types';

const LEVELS: { key: ExperienceLevel; label: string }[] = [
  { key: 'zacatecnik', label: 'Začátečník' },
  { key: 'stredne_pokrocily', label: 'Středně pokročilý' },
  { key: 'pokrocily', label: 'Pokročilý' },
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profil'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, updateProfile, garden, exportMyData, deleteMyData } = useAppData();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = useSingleSubmit(async () => {
    setExporting(true);
    setExportMessage(null);
    try {
      const data = await exportMyData();
      await saveAndShareJson('moje-zahrada-data.json', data);
    } catch {
      setExportMessage('Stažení dat se nepodařilo. Zkontrolujte připojení k internetu a zkuste to znovu.');
    } finally {
      setExporting(false);
    }
  });

  const handleDelete = useSingleSubmit(async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyData();
      navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/requires-recent-login') {
        setDeleteError(
          'Appka z bezpečnostních důvodů potřebuje čerstvé přihlášení - odhlaste se prosím a znovu se přihlaste, pak to zkuste znovu.'
        );
      } else {
        setDeleteError('Smazání dat se nepodařilo. Zkontrolujte připojení k internetu a zkuste to znovu.');
      }
    } finally {
      setDeleting(false);
    }
  });

  return (
    <Screen>
      <Text style={styles.pageTitle}>Profil</Text>

      <SectionTitle>Údaje</SectionTitle>
      <TextField label="Jméno" value={name} onChangeText={setName} onBlur={() => updateProfile({ name })} />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        onBlur={() => updateProfile({ email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <SectionTitle>Úroveň zkušenosti</SectionTitle>
      <View style={styles.levelRow}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.key}
            onPress={() => updateProfile({ experienceLevel: l.key })}
            style={[styles.chip, profile.experienceLevel === l.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, profile.experienceLevel === l.key && styles.chipTextActive]}>
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Plán</SectionTitle>
      <Card>
        <Text style={styles.planText}>Free plán</Text>
        <Text style={styles.planMeta}>Upgrade na Pro bude dostupný v budoucí verzi appky.</Text>
      </Card>

      <SectionTitle>Zahrada</SectionTitle>
      <Card>
        <Text style={styles.planText}>{garden?.name}</Text>
        <Text style={styles.planMeta}>{garden?.location}</Text>
      </Card>

      <SectionTitle>Sdílení a účet</SectionTitle>
      <AccountSection />

      <SectionTitle>Soukromí a data</SectionTitle>
      <Card>
        <Text style={styles.planMeta}>
          GPS poloha zahrady se používá jen pro dotaz na počasí a nikdy se nezobrazuje veřejně.
        </Text>

        <Text style={styles.gdprLabel}>Stažení dat</Text>
        <Text style={styles.planMeta}>
          Stáhne soubor se všemi vašimi daty - zahrady, záhony, stromy, úkoly, deník, sklizně i rozpoznání z fotky.
        </Text>
        <SecondaryButton
          title={exporting ? 'Připravuji soubor...' : 'Stáhnout má data'}
          onPress={handleExport}
        />
        {exportMessage && <Text style={styles.errorText}>{exportMessage}</Text>}

        <Text style={[styles.gdprLabel, { marginTop: 18 }]}>Smazání dat</Text>
        <Text style={styles.planMeta}>
          Trvale smaže všechna vaše lokální data a (jste-li přihlášeni) i přihlašovací účet. Ve sdílených
          zahradách appka smaže jen vaše vlastní členství - obsah ostatních členů zůstane zachovaný.
        </Text>
        <Pressable
          onPress={() => setConfirmDelete(true)}
          style={styles.deleteButton}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Mažu data...' : 'Smazat všechna má data'}
          </Text>
        </Pressable>
        {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}
      </Card>

      <ConfirmDialog
        visible={confirmDelete}
        title="Smazat všechna má data"
        message="Opravdu chcete trvale smazat všechna svoje data v appce? Tuto akci nejde vrátit zpět."
        cancelText="Zrušit"
        confirmText="Smazat natrvalo"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
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
  planText: { fontSize: 15, fontWeight: '700', color: colors.text },
  planMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  gdprLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 2 },
  errorText: { fontSize: 13, color: colors.danger, marginTop: 8 },
  deleteButton: { marginTop: 10, alignSelf: 'flex-start' },
  deleteButtonText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
