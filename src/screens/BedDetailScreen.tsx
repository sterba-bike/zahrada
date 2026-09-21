import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, VarietyTag, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { getSpeciesById } from '../data/seedPlants';
import { BED_TYPE_LABEL, DIFFICULTY_LABEL, formatDate, formatDateTime, taskPlacesLabel } from '../utils/format';
import { EARLINESS_LABEL } from '../types';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'BedDetail'>;

export default function BedDetailScreen({ route, navigation }: Props) {
  const { bedId } = route.params;
  const { beds, trees, tasks, bedHistory } = useAppData();
  const bed = beds.find((b) => b.id === bedId);
  const plantings = bedHistory(bedId).sort((a, b) => b.year - a.year);
  const bedTasks = tasks.filter((t) => t.bedIds.includes(bedId));

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
                <View style={styles.nameRow}>
                  <Text style={styles.itemName}>{species?.name ?? p.speciesId}</Text>
                  {p.variety && (
                    <VarietyTag
                      variety={p.variety + (p.varietyEarliness ? ` · ${EARLINESS_LABEL[p.varietyEarliness]}` : '')}
                    />
                  )}
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
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  editedBy: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  mutedText: { color: colors.textMuted, marginBottom: 8 },
});
