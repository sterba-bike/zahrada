import React from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card, SectionTitle, EmptyState, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { formatDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteTask'>;

export default function CompleteTaskScreen({ navigation }: Props) {
  const { tasks, completeTask } = useAppData();
  const open = tasks.filter((t) => !t.done);

  const handleComplete = async (id: string) => {
    await completeTask(id);
    navigation.goBack();
  };

  return (
    <Screen>
      <SectionTitle>Označit úkol hotový</SectionTitle>
      {open.length === 0 ? (
        <EmptyState text="Všechny úkoly jsou splněné." />
      ) : (
        open.map((t) => (
          <Pressable key={t.id} onPress={() => handleComplete(t.id)}>
            <Card>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{t.title}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                Termín: {formatDate(t.dueDate)}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
