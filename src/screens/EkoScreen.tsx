import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, colors } from '../components/ui';
import { ARTICLES } from '../data/articles';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Eko'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TOPICS = ['Kompostování', 'Mulčování', 'Přírodní ochrana', 'Biodiverzita'];

export default function EkoScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.pageTitle}>Eko - znalostní centrum</Text>

      <SectionTitle>Témata</SectionTitle>
      <View style={styles.topicGrid}>
        {TOPICS.map((topic) => (
          <View key={topic} style={styles.topicTile}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>

      <SectionTitle>Doporučené články</SectionTitle>
      {ARTICLES.map((a) => (
        <Pressable key={a.id} onPress={() => navigation.navigate('ArticleDetail', { articleId: a.id })}>
          <Card>
            <Text style={styles.articleTitle}>{a.title}</Text>
            <Text style={styles.articleMeta}>
              {a.category} · {a.readMinutes} min čtení
            </Text>
          </Card>
        </Pressable>
      ))}

      <SectionTitle>Obchůdek</SectionTitle>
      <Card style={{ opacity: 0.6 }}>
        <Text style={styles.articleTitle}>Obchůdek (připravujeme)</Text>
        <Text style={styles.articleMeta}>Prodej přípravků a semínek bude dostupný v budoucí verzi.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicTile: {
    width: '47%',
    backgroundColor: '#EAF3E8',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  topicText: { fontWeight: '700', color: colors.primaryDark },
  articleTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  articleMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
