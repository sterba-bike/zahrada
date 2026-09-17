import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card, EmptyState, PrimaryButton, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

export default function JournalScreen({ route, navigation }: Props) {
  const { bedId, treeId, title } = route.params;
  const { journal } = useAppData();
  const entries = journal
    .filter((e) => (bedId ? e.bedId === bedId : e.treeId === treeId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      {entries.length === 0 ? (
        <EmptyState text="Zatím tu není žádný záznam." />
      ) : (
        entries.map((e) => (
          <Card key={e.id}>
            <Text style={styles.entryDate}>{formatDateTime(e.date)}</Text>
            {e.text ? <Text style={styles.entryText}>{e.text}</Text> : null}
            {e.photoUri ? <Image source={{ uri: e.photoUri }} style={styles.entryPhoto} /> : null}
            <Text style={styles.entryAuthor}>Zapsal(a) {e.lastEditedBy}</Text>
          </Card>
        ))
      )}
      <View style={{ marginTop: 12 }}>
        <PrimaryButton
          title="+ Přidat záznam"
          onPress={() => navigation.navigate('AddJournalEntry', { bedId, treeId })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 12 },
  entryDate: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  entryText: { fontSize: 15, color: colors.text, marginBottom: 8 },
  entryPhoto: { width: '100%', height: 180, borderRadius: 10, marginBottom: 8 },
  entryAuthor: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
});
