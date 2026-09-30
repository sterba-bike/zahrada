import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Jemný, neinteraktivní podklad appky s motivy zahrady (listy, zelenina, slunečnice).
// "subtle" jede na pozadí všech obrazovek (velmi nenápadné, ať neruší čitelnost),
// "hero" je výraznější varianta pro úvodní obrazovku.
type Motif = { emoji: string; top: `${number}%`; left: `${number}%`; size: number; opacity: number; rotate: string };

const SUBTLE_MOTIFS: Motif[] = [
  { emoji: '🌿', top: '4%', left: '8%', size: 34, opacity: 0.05, rotate: '-12deg' },
  { emoji: '🍃', top: '12%', left: '84%', size: 28, opacity: 0.05, rotate: '18deg' },
  { emoji: '🌱', top: '28%', left: '4%', size: 30, opacity: 0.045, rotate: '8deg' },
  { emoji: '🥕', top: '44%', left: '88%', size: 26, opacity: 0.045, rotate: '-6deg' },
  { emoji: '🍅', top: '60%', left: '8%', size: 28, opacity: 0.05, rotate: '10deg' },
  { emoji: '🌻', top: '76%', left: '82%', size: 32, opacity: 0.05, rotate: '-16deg' },
  { emoji: '🍀', top: '90%', left: '22%', size: 24, opacity: 0.045, rotate: '20deg' },
  { emoji: '🌾', top: '20%', left: '50%', size: 26, opacity: 0.04, rotate: '-4deg' },
];

const HERO_MOTIFS: Motif[] = [
  { emoji: '🌿', top: '2%', left: '4%', size: 60, opacity: 0.16, rotate: '-14deg' },
  { emoji: '🍃', top: '8%', left: '78%', size: 50, opacity: 0.16, rotate: '20deg' },
  { emoji: '🌻', top: '66%', left: '80%', size: 64, opacity: 0.18, rotate: '-10deg' },
  { emoji: '🥕', top: '72%', left: '6%', size: 48, opacity: 0.16, rotate: '12deg' },
  { emoji: '🍅', top: '44%', left: '90%', size: 42, opacity: 0.14, rotate: '-8deg' },
  { emoji: '🌾', top: '50%', left: '2%', size: 46, opacity: 0.14, rotate: '10deg' },
  { emoji: '🍀', top: '86%', left: '42%', size: 40, opacity: 0.14, rotate: '-20deg' },
];

export default function GardenBackground({ variant = 'subtle' }: { variant?: 'subtle' | 'hero' }) {
  const motifs = variant === 'hero' ? HERO_MOTIFS : SUBTLE_MOTIFS;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {motifs.map((m, i) => (
        <Text
          key={i}
          style={[
            styles.motif,
            { top: m.top, left: m.left, fontSize: m.size, opacity: m.opacity, transform: [{ rotate: m.rotate }] },
          ]}
        >
          {m.emoji}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  motif: { position: 'absolute' },
});
