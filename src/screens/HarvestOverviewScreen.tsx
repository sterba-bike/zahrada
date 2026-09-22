import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { harvestYear } from '../utils/format';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'HarvestOverview'>;

interface CropTotal {
  cropName: string;
  unit: string;
  amount: number;
}

export default function HarvestOverviewScreen({}: Props) {
  const { garden, harvests } = useAppData();
  const gardenHarvests = harvests.filter((h) => h.gardenId === garden?.id);

  const bySeason = useMemo(() => {
    const years = new Map<number, Map<string, CropTotal>>();
    for (const h of gardenHarvests) {
      const year = harvestYear(h.date);
      if (!years.has(year)) years.set(year, new Map());
      const crops = years.get(year)!;
      const key = `${h.cropName.trim().toLowerCase()}__${h.unit.trim().toLowerCase()}`;
      const existing = crops.get(key);
      if (existing) {
        existing.amount += h.amount;
      } else {
        crops.set(key, { cropName: h.cropName.trim(), unit: h.unit.trim(), amount: h.amount });
      }
    }
    return Array.from(years.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, crops]) => ({
        year,
        crops: Array.from(crops.values()).sort((a, b) => a.cropName.localeCompare(b.cropName, 'cs')),
      }));
  }, [gardenHarvests]);

  return (
    <Screen>
      <Text style={styles.title}>Přehled sklizně</Text>
      {bySeason.length === 0 ? (
        <EmptyState text="Zatím tu není žádná zaznamenaná sklizeň. Přidejte ji přes Rychlý záznam. 🧺" />
      ) : (
        bySeason.map(({ year, crops }) => (
          <React.Fragment key={year}>
            <SectionTitle>{year}</SectionTitle>
            {crops.map((c) => (
              <Card key={`${c.cropName}-${c.unit}`} style={styles.cropRow}>
                <Text style={styles.cropName}>{c.cropName}</Text>
                <Text style={styles.cropAmount}>
                  {Number.isInteger(c.amount) ? c.amount : c.amount.toFixed(2).replace(/\.?0+$/, '')} {c.unit}
                </Text>
              </Card>
            ))}
          </React.Fragment>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  cropRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cropName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cropAmount: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
});
