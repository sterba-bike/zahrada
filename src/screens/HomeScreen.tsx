import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { getTipForToday } from '../data/ecoTips';
import Fab from '../components/Fab';
import QuickActionSheet from '../components/QuickActionSheet';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Domů'>,
  NativeStackScreenProps<RootStackParamList>
>;

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { garden, tasks, completeTask } = useAppData();
  const [sheetVisible, setSheetVisible] = useState(false);

  const today = new Date();
  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.done && isSameDay(t.dueDate, today)),
    [tasks]
  );

  return (
    <Screen>
      <Text style={styles.greeting}>Dobrý den{garden ? `, ${garden.name}` : ''} 👋</Text>
      <Text style={styles.date}>
        {today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      <Card style={styles.weatherCard}>
        <Text style={styles.weatherLabel}>Počasí dnes</Text>
        <Text style={styles.weatherValue}>🌤️ Zatím jednoduchý odhad - přesná předpověď přijde v příští verzi</Text>
      </Card>

      <SectionTitle>Úkoly na dnes</SectionTitle>
      {todayTasks.length === 0 ? (
        <EmptyState text="Na dnes nemáte žádný nesplněný úkol." />
      ) : (
        todayTasks.map((t) => (
          <Card key={t.id}>
            <View style={styles.taskRow}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Pressable onPress={() => completeTask(t.id)} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Hotovo</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}

      <SectionTitle>Eko tip dne 🌿</SectionTitle>
      <Card>
        <Text style={styles.tipText}>{getTipForToday()}</Text>
      </Card>

      <View style={{ height: 80 }} />

      <Fab onPress={() => setSheetVisible(true)} />
      <QuickActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPickPhoto={() => navigation.navigate('AddJournalEntry', { photoOnly: true })}
        onWriteNote={() => navigation.navigate('AddJournalEntry', {})}
        onRecordHarvest={() => navigation.navigate('RecordHarvest')}
        onCompleteTask={() => navigation.navigate('CompleteTask')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginBottom: 16, textTransform: 'capitalize' },
  weatherCard: { backgroundColor: '#EAF3E8' },
  weatherLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  weatherValue: { fontSize: 14, color: colors.text },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  doneButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  doneButtonText: { color: 'white', fontWeight: '700', fontSize: 12 },
  tipText: { fontSize: 14, color: colors.text, lineHeight: 20 },
});
