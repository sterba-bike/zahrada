// @ts-expect-error - getReactNativePersistence existuje v RN buildu balíčku
// (Metro ho díky "react-native" export podmínce správně najde), ale TypeScriptu
// se ho z typů balíčku firebase/auth nepodařilo spolehlivě rozpoznat.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from './config';

// Nativní appka (iOS/Android) - přihlášení appka pamatuje mezi spuštěními
// přes AsyncStorage. Metro pro tenhle soubor automaticky vezme tuhle verzi
// (ne .web.ts) při buildu pro telefon.
export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
