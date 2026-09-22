import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EkoStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, colors } from '../components/ui';
import { ARTICLES } from '../data/articles';

type Props = NativeStackScreenProps<EkoStackParamList, 'EkoHome'>;

const TOPICS: { label: string; emoji: string }[] = [
  { label: 'Kompostování', emoji: '🍂' },
  { label: 'Mulčování', emoji: '🌾' },
  { label: 'Přírodní ochrana', emoji: '🐞' },
  { label: 'Biodiverzita', emoji: '🦋' },
  { label: 'Hospodaření s vodou', emoji: '💧' },
  { label: 'Osevní postup', emoji: '🔄' },
  { label: 'Přírodní hnojiva', emoji: '🌿' },
  { label: 'Ochrana před mrazem', emoji: '❄️' },
  { label: 'Založení záhonu', emoji: '🧑‍🌾' },
];

export default function EkoScreen({ navigation }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const filteredArticles = useMemo(
    () => (selectedTopic ? ARTICLES.filter((a) => a.category === selectedTopic) : ARTICLES),
    [selectedTopic]
  );

  return (
    <Screen>
      <Text style={styles.pageTitle}>Eko - znalostní centrum</Text>

      <SectionTitle>Témata</SectionTitle>
      <View style={styles.topicGrid}>
        {TOPICS.map((topic, i) => {
          const active = selectedTopic === topic.label;
          return (
            <Pressable
              key={topic.label}
              onPress={() => setSelectedTopic(active ? null : topic.label)}
              style={[
                styles.topicTile,
                i % 2 === 1 && styles.topicTileAlt,
                active && styles.topicTileActive,
              ]}
            >
              <Text style={styles.topicEmoji}>{topic.emoji}</Text>
              <Text style={[styles.topicText, active && styles.topicTextActive]}>{topic.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>
        {selectedTopic ? `Články: ${selectedTopic}` : 'Doporučené články'}
      </SectionTitle>
      {selectedTopic && (
        <Pressable onPress={() => setSelectedTopic(null)}>
          <Text style={styles.resetLink}>← Zobrazit všechna témata</Text>
        </Pressable>
      )}
      {filteredArticles.map((a) => (
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
  topicTileActive: { backgroundColor: colors.primary },
  topicEmoji: { fontSize: 22, marginBottom: 6 },
  topicText: { fontWeight: '700', color: colors.primaryDark },
  topicTextActive: { color: 'white' },
  resetLink: { color: colors.primary, fontWeight: '600', marginBottom: 8 },
  articleTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  articleMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
