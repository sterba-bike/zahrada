import { getAuth } from 'firebase/auth';
import { firebaseApp } from './config';

// Webová appka (testovací odkaz i budoucí web nasazení) - prohlížeč si
// přihlášení pamatuje sám. Metro pro web build automaticky vezme tenhle
// soubor (kvůli příponě .web.ts) místo auth.ts.
export const auth = getAuth(firebaseApp);
