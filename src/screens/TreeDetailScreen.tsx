import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamList, ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, VarietyTag, colors } from '../components/ui';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAppData } from '../context/AppDataContext';
import { formatDate, formatDateTime, taskPlacesLabel } from '../utils/format';
import { EARLINESS_LABEL } from '../types';

// Zaznamenat sklizeň (RecordHarvest) je globální obrazovka na kořenovém stacku,
// proto kombinovaný typ navigace stejně jako u Deníku.
type Props = CompositeScreenProps<
  NativeStackScreenProps<ZahradaStackParamList, 'TreeDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function TreeDetailScreen({ route, navigation }: Props) {
  const { treeId } = route.params;
  const { beds, trees, tasks, photoDiagnoses, deleteTree } = useAppData();
  const tree = trees.find((t) => t.id === treeId);
  const treeTasks = tasks.filter((t) => t.treeIds.includes(treeId));
  const treeDiagnoses = photoDiagnoses.filter((d) => d.treeId === treeId);
  const [confirmDeleteTree, setConfirmDeleteTree] = useState(false);

  if (!tree) {
    return (
      <Screen>
        <Text>Strom/keř nebyl nalezen.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.nameRow}>
        <Text style={styles.title}>{tree.name}</Text>
        {tree.variety && (
          <VarietyTag
            variety={tree.variety + (tree.varietyEarliness ? ` · ${EARLINESS_LABEL[tree.varietyEarliness]}` : '')}
          />
        )}
      </View>
      <Text style={styles.meta}>
        {tree.category === 'ovocny' ? 'Ovocný' : 'Okrasný'} · vysazeno {formatDate(tree.plantedAt)}
      </Text>
      {tree.rootstockType && <Text style={styles.meta}>Podnož: {tree.rootstockType}</Text>}
      {tree.location && <Text style={styles.meta}>Umístění: {tree.location}</Text>}
      {tree.status && <Text style={styles.meta}>Stav: {tree.status}</Text>}
      {tree.note && (
        <Card style={{ marginTop: 12 }}>
          <Text style={styles.itemMeta}>{tree.note}</Text>
        </Card>
      )}
      {tree.lastEditedBy && (
        <Text style={styles.editedBy}>
          Naposledy upravil: {tree.lastEditedBy}
          {tree.lastEditedAt ? ` · ${formatDateTime(tree.lastEditedAt)}` : ''}
        </Text>
      )}

      <SectionTitle>Úkoly</SectionTitle>
      {treeTasks.length === 0 ? (
        <Text style={styles.mutedText}>Zatím žádné úkoly.</Text>
      ) : (
        treeTasks.map((t) => (
          <Card key={t.id}>
            <Text style={styles.itemName}>{t.title}</Text>
            <Text style={styles.itemMeta}>
              {formatDate(t.dueDate)} · {t.done ? `Splněno (${t.doneBy})` : 'Nesplněno'}
            </Text>
            {(t.bedIds.length > 0 || t.treeIds.length > 1) && (
              <Text style={styles.itemMeta}>{taskPlacesLabel(t, beds, trees)}</Text>
            )}
          </Card>
        ))
      )}

      <SectionTitle>🔍 Rozpoznání chorob/škůdců</SectionTitle>
      {treeDiagnoses.length === 0 ? (
        <Text style={styles.mutedText}>Zatím žádný odhad z fotky.</Text>
      ) : (
        treeDiagnoses.map((d) => (
          <Card key={d.id}>
            <Text style={styles.itemName}>{d.diagnosis}</Text>
            <Text style={styles.itemMeta}>
              {d.confidencePercent}% jistota · {formatDate(d.date)}
            </Text>
          </Card>
        ))
      )}
      <Pressable onPress={() => navigation.navigate('DiagnosePhoto', { treeId })}>
        <Text style={styles.addLink}>🔍 Rozpoznat chorobu/škůdce</Text>
      </Pressable>

      <SectionTitle>Deník</SectionTitle>
      <Pressable
        onPress={() => navigation.navigate('Journal', { treeId, title: `Deník: ${tree.name}` })}
      >
        <Text style={styles.addLink}>Otevřít deník →</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('RecordHarvest', { treeId })}>
        <Text style={styles.addLink}>🧺 Zaznamenat sklizeň</Text>
      </Pressable>

      <Pressable onPress={() => setConfirmDeleteTree(true)} style={styles.deleteTreeButton}>
        <Text style={styles.deleteTreeText}>🗑️ Smazat strom/keř</Text>
      </Pressable>
      <View style={{ height: 24 }} />

      <ConfirmDialog
        visible={confirmDeleteTree}
        title="Smazat strom/keř"
        message={`Opravdu smazat ${tree.name}? Smažou se i jeho navazující úkoly a deníkové záznamy. Tuto akci nejde vrátit zpět.`}
        cancelText="Zrušit"
        confirmText="Smazat"
        danger
        onCancel={() => setConfirmDeleteTree(false)}
        onConfirm={() => {
          setConfirmDeleteTree(false);
          deleteTree(treeId);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  editedBy: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  mutedText: { color: colors.textMuted, marginBottom: 8 },
  deleteTreeButton: { marginTop: 24, alignSelf: 'flex-start' },
  deleteTreeText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
