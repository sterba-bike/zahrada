import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Screen, TextField, Card, SectionTitle, colors } from '../components/ui';
import { useAppData } from '../context/AppDataContext';
import { ExperienceLevel } from '../types';

const LEVELS: { key: ExperienceLevel; label: string }[] = [
  { key: 'zacatecnik', label: 'Začátečník' },
  { key: 'stredne_pokrocily', label: 'Středně pokročilý' },
  { key: 'pokrocily', label: 'Pokročilý' },
];

export default function ProfileScreen() {
  const { profile, updateProfile, garden } = useAppData();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  return (
    <Screen>
      <Text style={styles.pageTitle}>Profil</Text>

      <SectionTitle>Údaje</SectionTitle>
      <TextField label="Jméno" value={name} onChangeText={setName} onBlur={() => updateProfile({ name })} />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        onBlur={() => updateProfile({ email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <SectionTitle>Úroveň zkušenosti</SectionTitle>
      <View style={styles.levelRow}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.key}
            onPress={() => updateProfile({ experienceLevel: l.key })}
            style={[styles.chip, profile.experienceLevel === l.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, profile.experienceLevel === l.key && styles.chipTextActive]}>
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Plán</SectionTitle>
      <Card>
        <Text style={styles.planText}>Free plán</Text>
        <Text style={styles.planMeta}>Upgrade na Pro bude dostupný v budoucí verzi appky.</Text>
      </Card>

      <SectionTitle>Zahrada</SectionTitle>
      <Card>
        <Text style={styles.planText}>{garden?.name}</Text>
        <Text style={styles.planMeta}>{garden?.location}</Text>
      </Card>

      <SectionTitle>Soukromí a data</SectionTitle>
      <Card>
        <Text style={styles.planMeta}>
          GPS poloha zahrady se používá jen pro dotaz na počasí a nikdy se nezobrazuje veřejně.
          Možnost stažení nebo smazání dat (GDPR) bude doplněna v další verzi appky.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  planText: { fontSize: 15, fontWeight: '700', color: colors.text },
  planMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
