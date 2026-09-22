import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamList, ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, VarietyTag, colors } from '../components/ui';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppData } from '../context/AppDataContext';
import { getSpeciesById } from '../data/seedPlants';
import { recommendNextPlanting, SAME_SPECIES_MIN_GAP_YEARS } from '../rules/cropRotation';
import { BED_TYPE_LABEL, DIFFICULTY_LABEL, formatDate, formatDateTime, taskPlacesLabel } from '../utils/format';
import { EARLINESS_LABEL, PlantingRecord } from '../types';

// Zaznamenat sklizeň (RecordHarvest) je globální obrazovka na kořenovém stacku,
// proto kombinovaný typ navigace stejně jako u Deníku.
type Props = CompositeScreenProps<
  NativeStackScreenProps<ZahradaStackParamList, 'BedDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function BedDetailScreen({ route, navigation }: Props) {
  const { bedId } = route.params;
  const { beds, trees, tasks, bedHistory, deletePlanting, deleteBed } = useAppData();
  const bed = beds.find((b) => b.id === bedId);
  const plantings = bedHistory(bedId).sort((a, b) => b.year - a.year);
  const bedTasks = tasks.filter((t) => t.bedIds.includes(bedId));
  const [toDelete, setToDelete] = useState<PlantingRecord | null>(null);
  const [confirmDeleteBed, setConfirmDeleteBed] = useState(false);

  const currentYear = new Date().getFullYear();
  const recommendation = useMemo(
    () => recommendNextPlanting(plantings, currentYear),
    [plantings, currentYear]
  );
  const avoidSpeciesNames = recommendation.avoidSpeciesIds
    .map((id) => getSpeciesById(id)?.name ?? id)
    .join(', ');

  if (!bed) {
    return (
      <Screen>
        <Text>Záhon nebyl nalezen.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{bed.name}</Text>
      <Text style={styles.meta}>
        {BED_TYPE_LABEL[bed.type]} · založeno {formatDate(bed.foundedAt)}
      </Text>
      {bed.lastEditedBy && (
        <Text style={styles.editedBy}>
          Naposledy upravil: {bed.lastEditedBy}
          {bed.lastEditedAt ? ` · ${formatDateTime(bed.lastEditedAt)}` : ''}
        </Text>
      )}

      <SectionTitle>Rostliny v záhonu</SectionTitle>
      {plantings.length === 0 ? (
        <EmptyState
          text="V tomto záhonu zatím nic neroste."
          buttonTitle="Přidat rostlinu"
          onPress={() => navigation.navigate('AddPlant', { bedId })}
        />
      ) : (
        <>
          {plantings.map((p) => {
            const species = getSpeciesById(p.speciesId);
            return (
              <Card key={p.id}>
                <View style={styles.rowBetween}>
                  <View style={styles.nameRow}>
                    <Text style={styles.itemName}>{species?.name ?? p.speciesId}</Text>
                    {p.variety && (
                      <VarietyTag
                        variety={p.variety + (p.varietyEarliness ? ` · ${EARLINESS_LABEL[p.varietyEarliness]}` : '')}
                      />
                    )}
                  </View>
                  <View style={styles.iconRow}>
                    <Pressable onPress={() => navigation.navigate('EditPlant', { plantingId: p.id })} hitSlop={8}>
                      <Text style={styles.deleteIcon}>✏️</Text>
                    </Pressable>
                    <Pressable onPress={() => setToDelete(p)} hitSlop={8}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.itemMeta}>
                  Osazeno {formatDate(p.plantedAt)} · {species ? DIFFICULTY_LABEL[species.difficultyGroup] : ''} ·{' '}
                  {p.status}
                </Text>
              </Card>
            );
          })}
          <Pressable onPress={() => navigation.navigate('AddPlant', { bedId })}>
            <Text style={styles.addLink}>+ Přidat další rostlinu</Text>
          </Pressable>
        </>
      )}

      <SectionTitle>🌱 Doporučení pro příští osetí</SectionTitle>
      <Card style={styles.recommendCard}>
        {recommendation.avoidGroups.length > 0 ? (
          <Text style={styles.recommendText}>
            Loni tu rostla plodina ze skupiny{' '}
            {recommendation.avoidGroups.map((g) => DIFFICULTY_LABEL[g]).join(', ')} - tuto skupinu letos
            raději vynechejte, půda si potřebuje odpočinout.
          </Text>
        ) : (
          <Text style={styles.recommendText}>
            Podle loňské historie tu není potřeba žádnou skupinu vynechávat.
          </Text>
        )}
        <Text style={styles.recommendText}>
          Vhodné skupiny pro letošek: {recommendation.recommendedGroups.map((g) => DIFFICULTY_LABEL[g]).join(', ')}.
        </Text>
        {recommendation.avoidSpeciesIds.length > 0 && (
          <Text style={styles.recommendText}>
            Nesázejte znovu: {avoidSpeciesNames} (byly tu v posledních {SAME_SPECIES_MIN_GAP_YEARS} letech).
          </Text>
        )}
        {recommendation.suggestedSpecies.length > 0 && (
          <>
            <Text style={styles.recommendLabel}>Tipy z encyklopedie:</Text>
            <View style={styles.chipRow}>
              {recommendation.suggestedSpecies.map((s) => (
                <View key={s.id} style={styles.suggestChip}>
                  <Text style={styles.suggestChipText}>{s.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>

      <SectionTitle>Úkoly u tohoto záhonu</SectionTitle>
      {bedTasks.length === 0 ? (
        <Text style={styles.mutedText}>Zatím žádné úkoly.</Text>
      ) : (
        bedTasks.map((t) => (
          <Card key={t.id}>
            <Text style={styles.itemName}>{t.title}</Text>
            <Text style={styles.itemMeta}>
              {formatDate(t.dueDate)} · {t.done ? `Splněno (${t.doneBy})` : 'Nesplněno'}
            </Text>
            {(t.bedIds.length > 1 || t.treeIds.length > 0) && (
              <Text style={styles.itemMeta}>{taskPlacesLabel(t, beds, trees)}</Text>
            )}
          </Card>
        ))
      )}

      <SectionTitle>Deník záhonu</SectionTitle>
      <Pressable
        onPress={() => navigation.navigate('Journal', { bedId, title: `Deník: ${bed.name}` })}
      >
        <Text style={styles.addLink}>Otevřít deník →</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('RecordHarvest', { bedId })}>
        <Text style={styles.addLink}>🧺 Zaznamenat sklizeň</Text>
      </Pressable>

      <Pressable onPress={() => setConfirmDeleteBed(true)} style={styles.deleteBedButton}>
        <Text style={styles.deleteBedText}>🗑️ Smazat záhon</Text>
      </Pressable>
      <View style={{ height: 24 }} />

      <ConfirmDialog
        visible={!!toDelete}
        title="Smazat rostlinu"
        message={`Opravdu smazat ${
          toDelete ? getSpeciesById(toDelete.speciesId)?.name ?? toDelete.speciesId : ''
        } z tohoto záhonu? Tuto akci nejde vrátit zpět.`}
        cancelText="Zrušit"
        confirmText="Smazat"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deletePlanting(toDelete.id);
          setToDelete(null);
        }}
      />

      <ConfirmDialog
        visible={confirmDeleteBed}
        title="Smazat záhon"
        message={`Opravdu smazat záhon ${bed.name}? Smažou se i všechny rostliny v něm, jejich navazující úkoly a deníkové záznamy. Tuto akci nejde vrátit zpět.`}
        cancelText="Zrušit"
        confirmText="Smazat"
        danger
        onCancel={() => setConfirmDeleteBed(false)}
        onConfirm={() => {
          setConfirmDeleteBed(false);
          deleteBed(bedId);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  editedBy: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteIcon: { fontSize: 18, marginLeft: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  mutedText: { color: colors.textMuted, marginBottom: 8 },
  deleteBedButton: { marginTop: 24, alignSelf: 'flex-start' },
  deleteBedText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  recommendCard: { backgroundColor: colors.primarySoft },
  recommendText: { fontSize: 14, color: colors.text, marginBottom: 8, lineHeight: 20 },
  recommendLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestChip: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestChipText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
});
