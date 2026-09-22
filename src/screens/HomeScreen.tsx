import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { pickEcoTip } from '../rules/ecoTipRules';
import { taskPlacesLabel, formatDateTime } from '../utils/format';
import { useGardenForecast } from '../hooks/useWeather';
import { weatherIcon } from '../utils/weather';
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

function greetingForHour(hour: number): string {
  if (hour < 10) return 'Dobré ráno';
  if (hour < 18) return 'Dobré odpoledne';
  return 'Dobrý večer';
}

export default function HomeScreen({ navigation }: Props) {
  const { garden, plantings, tasks, beds, trees, profile, completeTask } = useAppData();
  const [sheetVisible, setSheetVisible] = useState(false);
  const { days: weatherDays, loading: weatherLoading, error: weatherError, stale: weatherStale, fetchedAt } =
    useGardenForecast();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.done && isSameDay(t.dueDate, today)),
    [tasks]
  );

  const ecoTip = useMemo(
    () => pickEcoTip({ today, garden, profile, plantings, weatherDays }),
    [garden, profile, plantings, weatherDays]
  );

  const todayWeather = weatherDays?.find((d) => d.date === todayIso);
  const tomorrowWeather = weatherDays?.find((d) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return d.date === t.toISOString().slice(0, 10);
  });
  const frostTomorrow = tomorrowWeather && tomorrowWeather.tempMin <= 0;

  // U zálivky připomene appka nedávný déšť - poslední 2 dny včetně dneška.
  const recentRainMm = weatherDays
    ? weatherDays.filter((d) => d.date <= todayIso).slice(-2).reduce((sum, d) => sum + d.precipitationMm, 0)
    : null;
  const recentlyRained = recentRainMm != null && recentRainMm >= 5;

  return (
    <Screen>
      <Text style={styles.greeting}>
        {greetingForHour(today.getHours())}
        {garden ? `, ${garden.name}` : ''} 👋
      </Text>
      <Text style={styles.date}>
        {today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      <Card style={styles.weatherCard}>
        <Text style={styles.weatherLabel}>Počasí dnes</Text>
        {todayWeather ? (
          <>
            <Text style={styles.weatherValue}>
              {weatherIcon(todayWeather.weatherCode)} {Math.round(todayWeather.tempMin)}° až{' '}
              {Math.round(todayWeather.tempMax)} °C
              {todayWeather.precipitationMm > 0 ? ` · srážky ${todayWeather.precipitationMm.toFixed(1)} mm` : ''}
            </Text>
            {weatherStale && fetchedAt && (
              <Text style={styles.weatherNote}>Starší data z {formatDateTime(fetchedAt)} (offline)</Text>
            )}
          </>
        ) : weatherLoading ? (
          <Text style={styles.weatherValue}>Načítám počasí…</Text>
        ) : weatherError ? (
          <Text style={styles.weatherValue}>
            🌤️ Počasí se nepodařilo načíst - appka potřebuje připojení k internetu.
          </Text>
        ) : (
          <Text style={styles.weatherValue}>🌤️ Počasí zatím není k dispozici.</Text>
        )}
      </Card>

      {frostTomorrow && (
        <Card style={styles.frostCard}>
          <Text style={styles.frostText}>
            ❄️ Na zítřek se čeká mráz (min. {Math.round(tomorrowWeather!.tempMin)} °C) - přikryjte citlivé
            sazenice.
          </Text>
        </Card>
      )}

      <SectionTitle>Úkoly na dnes</SectionTitle>
      {todayTasks.length === 0 ? (
        <EmptyState text="Na dnes nemáte žádný nesplněný úkol - užijte si volno! 🌤️" />
      ) : (
        todayTasks.map((t) => (
          <Card key={t.id}>
            <View style={styles.taskRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                {(t.bedIds.length > 0 || t.treeIds.length > 0) && (
                  <Text style={styles.taskPlaces}>{taskPlacesLabel(t, beds, trees)}</Text>
                )}
                {t.type === 'zaliti' && recentlyRained && (
                  <Text style={styles.rainNote}>🌧️ Nedávno pršelo, zalévání možná není nutné</Text>
                )}
              </View>
              <Pressable onPress={() => completeTask(t.id)} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Hotovo</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}

      <SectionTitle>Eko tip dne 🌿</SectionTitle>
      <Card style={styles.tipCard}>
        <Text style={styles.tipText}>{ecoTip.text}</Text>
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
  weatherCard: { backgroundColor: colors.primarySoft },
  weatherLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  weatherValue: { fontSize: 14, color: colors.text },
  weatherNote: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  frostCard: { backgroundColor: '#E3F0FA', borderColor: '#B8DDF2', marginTop: -4 },
  frostText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  rainNote: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  taskPlaces: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  doneButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doneButtonText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
  tipCard: { backgroundColor: colors.accentSoft, borderColor: '#F3DFA8' },
  tipText: { fontSize: 14, color: colors.text, lineHeight: 20 },
});
