import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { BED_TYPE_LABEL, formatDate } from '../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Zahrada'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function GardenDetailScreen({ navigation }: Props) {
  const { garden, beds, trees } = useAppData();

  return (
    <Screen>
      <Text style={styles.gardenName}>{garden?.name}</Text>
      <Text style={styles.gardenLocation}>{garden?.location}</Text>

      <SectionTitle>Záhony</SectionTitle>
      {beds.length === 0 ? (
        <EmptyState
          text="Zatím tu nemáte žádný záhon."
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
          text="Zatím tu nemáte žádný strom ani keř."
          buttonTitle="Přidat strom/keř"
          onPress={() => navigation.navigate('AddTree')}
        />
      ) : (
        <>
          {trees.map((tree) => (
            <Pressable key={tree.id} onPress={() => navigation.navigate('TreeDetail', { treeId: tree.id })}>
              <Card>
                <Text style={styles.itemName}>{tree.name}</Text>
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
  gardenName: { fontSize: 24, fontWeight: '800', color: colors.text },
  gardenLocation: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
});
