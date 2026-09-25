import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { firebaseApp } from './config';

// Firebase AI Logic s GoogleAIBackend = bezplatná vrstva "Gemini Developer API".
// Appka se ověřuje stejnou (netajnou) konfigurací appky jako doteď u Firestore/Auth,
// žádný citlivý API klíč z Google AI Studia nikde v kódu není.
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export const visionModel = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
