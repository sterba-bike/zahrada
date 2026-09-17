import { useRef } from 'react';

// react-native-web umí u Pressable za určitých okolností (dotyk + emulovaná myš)
// vyvolat onPress dvakrát za sebou. Bez pojistky by to u formulářů vedlo
// k duplicitně uloženým záznamům. Tahle pojistka platí i na nativní appce
// jako ochrana proti rychlému dvojitému ťuknutí.
export function useSingleSubmit<Args extends unknown[]>(
  fn: (...args: Args) => Promise<void> | void
): (...args: Args) => Promise<void> {
  const runningRef = useRef(false);
  return async (...args: Args) => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      await fn(...args);
    } finally {
      runningRef.current = false;
    }
  };
}
