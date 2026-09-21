import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EkoStackParamList } from '../navigation/types';
import { Screen, colors } from '../components/ui';
import { getArticleById } from '../data/articles';

type Props = NativeStackScreenProps<EkoStackParamList, 'ArticleDetail'>;

export default function ArticleDetailScreen({ route }: Props) {
  const article = getArticleById(route.params.articleId);
  if (!article) {
    return (
      <Screen>
        <Text>Článek nebyl nalezen.</Text>
      </Screen>
    );
  }
  return (
    <Screen>
      <Text style={styles.category}>{article.category}</Text>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.meta}>{article.readMinutes} min čtení</Text>
      <Text style={styles.content}>{article.content}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  category: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  content: { fontSize: 15, color: colors.text, lineHeight: 22 },
});
