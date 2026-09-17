import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './ui';

export default function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={onPress}>
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  fabPressed: { opacity: 0.85 },
  plus: { color: 'white', fontSize: 30, fontWeight: '700', marginTop: -2 },
});
