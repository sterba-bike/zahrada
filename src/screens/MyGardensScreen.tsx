import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ZahradaStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';

type Props = NativeStackScreenProps<ZahradaStackParamList, 'MyGardens'>;

export default function MyGardensScreen({ navigation }: Props) {
  const { gardens, activeGardenId, switchGarden } = useAppData();

  return (
    <Screen>
      <SectionTitle>Moje zahrady</SectionTitle>
      {gardens.map((g) => {
        const active = g.id === activeGardenId;
        return (
          <Card key={g.id} style={[styles.gardenCard, active && styles.gardenCardActive]}>
            <Pressable
              onPress={() => {
                if (!active) switchGarden(g.id);
                navigation.navigate('GardenDetail');
              }}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.gardenName}>{g.name}</Text>
                  <Text style={styles.gardenLocation}>{g.location}</Text>
                </View>
                {active && <Text style={styles.activeBadge}>Aktivní</Text>}
              </View>
            </Pressable>
            {g.shared ? (
              <Pressable
                onPress={() => {
                  if (!active) switchGarden(g.id);
                  navigation.navigate('ShareGarden');
                }}
              >
                <Text style={styles.sharedBadge}>👥 Sdíleno · zobrazit kód pozvánky</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  if (!active) switchGarden(g.id);
                  navigation.navigate('ShareGarden');
                }}
              >
                <Text style={styles.shareLink}>🔗 Sdílet tuto zahradu</Text>
              </Pressable>
            )}
          </Card>
        );
      })}

      <Pressable onPress={() => navigation.navigate('AddGarden')}>
        <Text style={styles.addLink}>+ Přidat další zahradu</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('JoinGarden')}>
        <Text style={styles.addLink}>+ Připojit se ke sdílené zahradě</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gardenCard: { borderWidth: 1.5, borderColor: colors.border },
  gardenCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gardenName: { fontSize: 16, fontWeight: '700', color: colors.text },
  gardenLocation: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  activeBadge: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  addLink: { color: colors.primary, fontWeight: '600', marginTop: 8 },
  sharedBadge: { color: colors.primaryDark, fontWeight: '600', fontSize: 13, marginTop: 10 },
  shareLink: { color: colors.primary, fontWeight: '600', fontSize: 13, marginTop: 10 },
});
