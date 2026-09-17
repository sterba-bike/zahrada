import React, { useState } from 'react';
import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, TextField, PrimaryButton, SecondaryButton, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddJournalEntry'>;

type Target = { kind: 'bed' | 'tree'; id: string; name: string };

export default function AddJournalEntryScreen({ route, navigation }: Props) {
  const { bedId, treeId, photoOnly } = route.params ?? {};
  const { beds, trees, addJournalEntry } = useAppData();

  const lockedTarget: Target | null = bedId
    ? { kind: 'bed', id: bedId, name: beds.find((b) => b.id === bedId)?.name ?? '' }
    : treeId
    ? { kind: 'tree', id: treeId, name: trees.find((t) => t.id === treeId)?.name ?? '' }
    : null;

  const [target, setTarget] = useState<Target | null>(lockedTarget);
  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const canSubmit = !!target && (photoOnly ? !!photoUri : text.trim().length > 0 || !!photoUri);

  const handleSave = async () => {
    setSubmitted(true);
    if (!canSubmit || !target) return;
    await addJournalEntry({
      bedId: target.kind === 'bed' ? target.id : undefined,
      treeId: target.kind === 'tree' ? target.id : undefined,
      date: new Date().toISOString(),
      text: text.trim(),
      photoUri,
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <SectionTitle>{photoOnly ? 'Přidat fotku' : 'Napsat poznámku'}</SectionTitle>

      {!lockedTarget && (
        <>
          <Text style={styles.label}>Kam záznam patří?</Text>
          <View style={styles.targetList}>
            {beds.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => setTarget({ kind: 'bed', id: b.id, name: b.name })}
                style={[styles.chip, target?.id === b.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, target?.id === b.id && styles.chipTextActive]}>🪴 {b.name}</Text>
              </Pressable>
            ))}
            {trees.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTarget({ kind: 'tree', id: t.id, name: t.name })}
                style={[styles.chip, target?.id === t.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, target?.id === t.id && styles.chipTextActive]}>🌳 {t.name}</Text>
              </Pressable>
            ))}
          </View>
          {submitted && !target && (
            <Text style={{ color: colors.danger, marginBottom: 10, fontSize: 13 }}>
              Vyberte prosím záhon nebo strom/keř.
            </Text>
          )}
        </>
      )}

      {!photoOnly && (
        <TextField
          label="Text poznámky"
          required
          value={text}
          onChangeText={setText}
          placeholder="Co se dnes u rostliny dělo..."
          multiline
        />
      )}

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <SecondaryButton title="Vybrat fotku" onPress={pickPhoto} />
      )}
      {submitted && photoOnly && !photoUri && (
        <Text style={{ color: colors.danger, marginTop: 8, fontSize: 13 }}>Vyberte prosím fotku.</Text>
      )}

      <PrimaryButton title="Uložit záznam" onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  targetList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  preview: { width: '100%', height: 200, borderRadius: 12, marginVertical: 12 },
});
