import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen, PrimaryButton, colors } from '../../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>🌱</Text>
        </View>
        <Text style={styles.title}>Ekozahrádka</Text>
        <Text style={styles.subtitle}>
          Appka pro ekologické zahradničení. Evidence zahrady, kalendář prací, znalosti a
          doporučení na jednom místě - funguje i bez signálu.
        </Text>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton title="Založit první zahradu" onPress={() => navigation.navigate('CreateGarden')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12 },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  bottom: { padding: 16 },
});
