import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Konfigurace webové appky z Firebase konzole (Project settings > Your apps).
// Tohle NENÍ tajný klíč - je běžné a bezpečné mít ho přímo v appce (i veřejně
// na GitHubu). Skutečné zabezpečení dat dělají Firestore bezpečnostní pravidla
// nastavená ve Firebase konzoli, ne tajnost téhle konfigurace.
const firebaseConfig = {
  apiKey: 'AIzaSyB-stPuaAyTflYYB7rGXqWS38LK5p9H8Yc',
  authDomain: 'moje-zahrada.firebaseapp.com',
  projectId: 'moje-zahrada',
  storageBucket: 'moje-zahrada.firebasestorage.app',
  messagingSenderId: '836703712618',
  appId: '1:836703712618:web:9ca342562277e4d8dee113',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
