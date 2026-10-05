import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors } from './ui';

// Appka funguje offline (lokální data vždy fungují), ale uživatel by to měl
// vidět - trvalý pruh nahoře appky, dokud appka nemá připojení (sekce 7
// specifikace). Appka tím nic neblokuje, jen informuje.
export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetInfo();

  // Appka vědomě nepoužívá "isInternetReachable" (ten dělá navíc pravidelný
  // ping na vnější server, aby ověřil opravdovou dostupnost internetu) -
  // stačí appce vědět, že je zařízení připojené k síti, ať pruh zbytečně
  // nezůstane viset kvůli tomu, že se nepovedlo doptat zrovna třeba Googlu.
  // null = appka to ještě nezjistila (hned po startu) - appka v tu chvíli
  // nic neukazuje, ať zbytečně nebliká při každém otevření appky.
  if (isConnected !== false) return null;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
      <Text style={styles.text}>📴 Jste offline - data se uloží, jakmile se připojíte</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.warning,
    paddingBottom: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: 'white', fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
