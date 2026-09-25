import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card, PrimaryButton, SecondaryButton, SectionTitle, HelperNote, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { diagnosePhoto, DiagnosisResult } from '../utils/diagnosis';
import { useSingleSubmit } from '../utils/useSingleSubmit';

type Props = NativeStackScreenProps<RootStackParamList, 'DiagnosePhoto'>;

type Target = { kind: 'bed' | 'tree'; id: string; name: string };
type Recommendation = 'eko' | 'standard';

export default function DiagnosePhotoScreen({ route, navigation }: Props) {
  const { bedId, treeId } = route.params ?? {};
  const { beds, trees, addPhotoDiagnosis } = useAppData();

  const lockedTarget: Target | null = bedId
    ? { kind: 'bed', id: bedId, name: beds.find((b) => b.id === bedId)?.name ?? '' }
    : treeId
    ? { kind: 'tree', id: treeId, name: trees.find((t) => t.id === treeId)?.name ?? '' }
    : null;

  const [target, setTarget] = useState<Target | null>(lockedTarget);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [base64, setBase64] = useState<string | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation>('eko');
  const [saved, setSaved] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!pickResult.canceled && pickResult.assets?.[0]) {
      const asset = pickResult.assets[0];
      setPhotoUri(asset.uri);
      setBase64(asset.base64 ?? undefined);
      setMimeType(asset.mimeType ?? 'image/jpeg');
      setResult(null);
      setError(null);
      setSaved(false);
    }
  };

  const handleRecognize = useSingleSubmit(async () => {
    if (!base64) return;
    setLoading(true);
    setError(null);
    try {
      const diagnosis = await diagnosePhoto(base64, mimeType);
      setResult(diagnosis);
      setRecommendation('eko');
    } catch {
      setError('Rozpoznání se nepodařilo. Zkontrolujte připojení k internetu a zkuste to znovu.');
    } finally {
      setLoading(false);
    }
  });

  const handleSave = useSingleSubmit(async () => {
    if (!result || !photoUri) return;
    await addPhotoDiagnosis({
      bedId: target?.kind === 'bed' ? target.id : undefined,
      treeId: target?.kind === 'tree' ? target.id : undefined,
      photoUri,
      diagnosis: result.diagnosis,
      confidencePercent: result.confidencePercent,
      source: 'Gemini AI (odhad)',
      ecoRecommendation: result.ecoRecommendation,
      standardRecommendation: result.standardRecommendation,
      verifiedBySpecialist: false,
    });
    setSaved(true);
    navigation.goBack();
  });

  return (
    <Screen>
      <SectionTitle>🔍 Rozpoznat chorobu/škůdce</SectionTitle>
      <HelperNote>
        Appka na základě fotky odhadne možnou chorobu nebo škůdce. Vždy jde jen o odhad s
        procentem jistoty, ne o jistou diagnózu - u nejasných nebo vážných případů se poraďte i s
        odborníkem.
      </HelperNote>

      {!lockedTarget && (
        <>
          <Text style={styles.label}>Kam záznam patří? (nepovinné)</Text>
          <View style={styles.targetList}>
            {beds.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => setTarget(target?.id === b.id ? null : { kind: 'bed', id: b.id, name: b.name })}
                style={[styles.chip, target?.id === b.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, target?.id === b.id && styles.chipTextActive]}>🪴 {b.name}</Text>
              </Pressable>
            ))}
            {trees.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTarget(target?.id === t.id ? null : { kind: 'tree', id: t.id, name: t.name })}
                style={[styles.chip, target?.id === t.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, target?.id === t.id && styles.chipTextActive]}>🌳 {t.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <SecondaryButton title="Vybrat fotku" onPress={pickPhoto} />
      )}

      {photoUri && !result && (
        <PrimaryButton title={loading ? 'Rozpoznávám...' : 'Rozpoznat'} onPress={handleRecognize} disabled={loading} />
      )}
      {loading && <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />}

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <SecondaryButton title="Zkusit znovu" onPress={handleRecognize} />
        </Card>
      )}

      {result && (
        <>
          <SectionTitle>Výsledek odhadu</SectionTitle>
          <Card style={styles.resultCard}>
            <Text style={styles.diagnosisText}>{result.diagnosis}</Text>
            <View style={styles.confidenceRow}>
              <View style={styles.confidenceBarBg}>
                <View style={[styles.confidenceBarFill, { width: `${result.confidencePercent}%` }]} />
              </View>
              <Text style={styles.confidenceLabel}>{result.confidencePercent}% jistota</Text>
            </View>
            <Text style={styles.confidenceHint}>
              Jde o odhad umělé inteligence z fotky, ne o jistou diagnózu.
            </Text>
          </Card>

          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setRecommendation('eko')}
              style={[styles.toggleButton, recommendation === 'eko' && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, recommendation === 'eko' && styles.toggleTextActive]}>
                🌿 Ekologické
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRecommendation('standard')}
              style={[styles.toggleButton, recommendation === 'standard' && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, recommendation === 'standard' && styles.toggleTextActive]}>
                🧪 Standardní (chemie)
              </Text>
            </Pressable>
          </View>

          {recommendation === 'eko' ? (
            <Card style={styles.recommendCard}>
              <Text style={styles.recommendText}>{result.ecoRecommendation}</Text>
            </Card>
          ) : (
            <Card style={styles.warningCard}>
              <Text style={styles.warningLabel}>
                ⚠️ Rychlejší, ale méně šetrná alternativa - zvažte dopad na okolní rostliny, hmyz a půdu.
              </Text>
              <Text style={styles.recommendText}>{result.standardRecommendation}</Text>
            </Card>
          )}

          <PrimaryButton title="Uložit záznam" onPress={handleSave} disabled={saved} />
        </>
      )}
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
  preview: { width: '100%', height: 220, borderRadius: 12, marginVertical: 12 },
  errorCard: { backgroundColor: colors.accentSoft, marginTop: 12 },
  errorText: { color: colors.danger, marginBottom: 8, fontSize: 14 },
  resultCard: { marginTop: 4 },
  diagnosisText: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confidenceBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  confidenceBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  confidenceLabel: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  confidenceHint: { fontSize: 12, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 4 },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  toggleButtonActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  toggleText: { fontWeight: '600', color: colors.textMuted, fontSize: 13 },
  toggleTextActive: { color: colors.primaryDark },
  recommendCard: { backgroundColor: colors.primarySoft },
  recommendText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  warningCard: { backgroundColor: colors.accentSoft },
  warningLabel: { fontSize: 13, fontWeight: '700', color: colors.warning, marginBottom: 8 },
});
