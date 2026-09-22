import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, Card, SectionTitle } from './ui';
import { useGardenForecast, useYearlyRain } from '../hooks/useWeather';
import { weatherIcon } from '../utils/weather';

const WEEKDAY_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const MONTH_SHORT = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

type Period = '7' | '30' | 'rok';

function shortDayLabel(iso: string): string {
  return WEEKDAY_SHORT[new Date(iso).getDay()];
}

function monthLabel(yyyymm: string): string {
  const month = Number(yyyymm.split('-')[1]);
  return MONTH_SHORT[month - 1] ?? yyyymm;
}

// Předpověď na týden dopředu + graf srážek s přepínáním období (spec sekce 3,
// "Moje zahrada (detail)": "Předpověď a graf srážek s přepínáním období (7 dní/30 dní/rok)").
export default function WeatherRainChart() {
  const { days, loading, error } = useGardenForecast();
  const [period, setPeriod] = useState<Period>('7');
  const { monthly, loading: yearlyLoading, error: yearlyError } = useYearlyRain(period === 'rok');

  const todayIso = new Date().toISOString().slice(0, 10);
  const forecastDays = (days ?? []).filter((d) => d.date >= todayIso).slice(0, 7);

  let bars: { label: string; mm: number }[] = [];
  if (period === 'rok') {
    bars = (monthly ?? []).map((m) => ({ label: monthLabel(m.month), mm: m.mm }));
  } else {
    const n = period === '7' ? 7 : 30;
    const past = (days ?? []).filter((d) => d.date <= todayIso).slice(-n);
    bars = past.map((d) => ({ label: shortDayLabel(d.date), mm: d.precipitationMm }));
  }
  const maxMm = Math.max(1, ...bars.map((b) => b.mm));
  const totalMm = bars.reduce((sum, b) => sum + b.mm, 0);

  return (
    <>
      <SectionTitle>Počasí a srážky</SectionTitle>
      {!days && loading ? (
        <Text style={styles.muted}>Načítám předpověď…</Text>
      ) : !days && error ? (
        <Text style={styles.muted}>Předpověď se nepodařilo načíst - appka potřebuje připojení k internetu.</Text>
      ) : (
        <>
          {forecastDays.length > 0 && (
            <Card>
              <View style={styles.forecastRow}>
                {forecastDays.map((d) => (
                  <View key={d.date} style={styles.forecastDay}>
                    <Text style={styles.forecastLabel}>{shortDayLabel(d.date)}</Text>
                    <Text style={styles.forecastIcon}>{weatherIcon(d.weatherCode)}</Text>
                    <Text style={styles.forecastTemp}>
                      {Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          <View style={styles.periodRow}>
            {(['7', '30', 'rok'] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.periodChip, period === p && styles.periodChipActive]}
              >
                <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>
                  {p === '7' ? '7 dní' : p === '30' ? '30 dní' : 'Rok'}
                </Text>
              </Pressable>
            ))}
          </View>

          {period === 'rok' && yearlyLoading && !monthly ? (
            <Text style={styles.muted}>Načítám historii srážek…</Text>
          ) : period === 'rok' && yearlyError && !monthly ? (
            <Text style={styles.muted}>Historii srážek se nepodařilo načíst.</Text>
          ) : bars.length === 0 ? (
            <Text style={styles.muted}>Zatím žádná data.</Text>
          ) : (
            <Card>
              <View style={styles.chartRow}>
                {bars.map((b, i) => (
                  <View key={i} style={styles.barWrap}>
                    <View style={[styles.bar, { height: 4 + (b.mm / maxMm) * 60 }]} />
                    {bars.length <= 12 && <Text style={styles.barLabel}>{b.label}</Text>}
                  </View>
                ))}
              </View>
              <Text style={styles.totalText}>Celkem za období: {totalMm.toFixed(0)} mm</Text>
            </Card>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted, marginBottom: 8 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between' },
  forecastDay: { alignItems: 'center', flex: 1 },
  forecastLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  forecastIcon: { fontSize: 18, marginVertical: 2 },
  forecastTemp: { fontSize: 11, color: colors.text },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodChipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  periodChipTextActive: { color: 'white' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', backgroundColor: colors.primary, borderRadius: 3, minHeight: 2 },
  barLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  totalText: { fontSize: 12, color: colors.textMuted, marginTop: 8, textAlign: 'right' },
});
