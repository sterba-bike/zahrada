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

const TOPICS: { label: string; emoji: string }[] = [
  { label: 'Kompostování', emoji: '🍂' },
  { label: 'Mulčování', emoji: '🌾' },
  { label: 'Přírodní ochrana', emoji: '🐞' },
  { label: 'Biodiverzita', emoji: '🦋' },
];

export default function EkoScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.pageTitle}>Eko - znalostní centrum</Text>

      <SectionTitle>Témata</SectionTitle>
      <View style={styles.topicGrid}>
        {TOPICS.map((topic, i) => (
          <View
            key={topic.label}
            style={[styles.topicTile, i % 2 === 1 && styles.topicTileAlt]}
          >
            <Text style={styles.topicEmoji}>{topic.emoji}</Text>
            <Text style={styles.topicText}>{topic.label}</Text>
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
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  topicTileAlt: { backgroundColor: colors.accentSoft },
  topicEmoji: { fontSize: 22, marginBottom: 6 },
  topicText: { fontWeight: '700', color: colors.primaryDark },
  articleTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  articleMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
