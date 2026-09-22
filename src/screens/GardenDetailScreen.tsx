import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamList, ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, VarietyTag, colors } from '../components/ui';
import WeatherRainChart from '../components/WeatherRainChart';
import { useAppData } from '../context/AppDataContext';
import { BED_TYPE_LABEL, formatDate } from '../utils/format';

// Zaznamenat sklizeň (RecordHarvest) je globální obrazovka na kořenovém stacku,
// proto kombinovaný typ navigace stejně jako u Deníku.
type Props = CompositeScreenProps<
  NativeStackScreenProps<ZahradaStackParamList, 'GardenDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function GardenDetailScreen({ navigation }: Props) {
  const { garden, gardens, beds, trees } = useAppData();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={styles.gardenName}>{garden?.name}</Text>
        <Pressable onPress={() => navigation.navigate('MyGardens')} style={styles.switchButton}>
          <Text style={styles.switchButtonText}>🔀 Zahrady{gardens.length > 1 ? ` (${gardens.length})` : ''}</Text>
        </Pressable>
      </View>
      <Text style={styles.gardenLocation}>{garden?.location}</Text>
      <View style={styles.linkRow}>
        <Pressable onPress={() => navigation.navigate('HarvestOverview')}>
          <Text style={styles.addLink}>🧺 Přehled sklizně →</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('RecordHarvest')}>
          <Text style={styles.addLink}>+ Zaznamenat sklizeň</Text>
        </Pressable>
      </View>

      <WeatherRainChart />

      <SectionTitle>Záhony</SectionTitle>
      {beds.length === 0 ? (
        <EmptyState
          text="Zatím tu nemáte žádný záhon - založte první a pojďme na to! 🌱"
          buttonTitle="Přidat záhon"
          onPress={() => navigation.navigate('AddBed')}
        />
      ) : (
        <>
          {beds.map((bed) => (
            <Pressable key={bed.id} onPress={() => navigation.navigate('BedDetail', { bedId: bed.id })}>
              <Card>
                <Text style={styles.itemName}>{bed.name}</Text>
                <Text style={styles.itemMeta}>
                  {BED_TYPE_LABEL[bed.type]} · založeno {formatDate(bed.foundedAt)}
                </Text>
              </Card>
            </Pressable>
          ))}
          <Pressable onPress={() => navigation.navigate('AddBed')}>
            <Text style={styles.addLink}>+ Přidat další záhon</Text>
          </Pressable>
        </>
      )}

      <SectionTitle>Stromy a keře</SectionTitle>
      {trees.length === 0 ? (
        <EmptyState
          text="Zatím tu nemáte žádný strom ani keř. 🌳"
          buttonTitle="Přidat strom/keř"
          onPress={() => navigation.navigate('AddTree')}
        />
      ) : (
        <>
          {trees.map((tree) => (
            <Pressable key={tree.id} onPress={() => navigation.navigate('TreeDetail', { treeId: tree.id })}>
              <Card>
                <View style={styles.nameRow}>
                  <Text style={styles.itemName}>{tree.name}</Text>
                  {tree.variety && <VarietyTag variety={tree.variety} />}
                </View>
                <Text style={styles.itemMeta}>
                  {tree.category === 'ovocny' ? 'Ovocný' : 'Okrasný'} · vysazeno {formatDate(tree.plantedAt)}
                </Text>
              </Card>
            </Pressable>
          ))}
          <Pressable onPress={() => navigation.navigate('AddTree')}>
            <Text style={styles.addLink}>+ Přidat další strom/keř</Text>
          </Pressable>
        </>
      )}
      <View style={{ height: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gardenName: { fontSize: 24, fontWeight: '800', color: colors.text, flexShrink: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  switchButton: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  switchButtonText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  gardenLocation: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
});
