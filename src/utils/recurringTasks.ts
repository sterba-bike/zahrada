import { RepeatInterval } from '../types';

// Appka u opakujícího se úkolu rovnou založí rozumný počet dalších výskytů
// dopředu (ne donekonečna - appka nemá vlastní server, který by je mohl
// průběžně dogenerovávat na pozadí). Počet je zvolený tak, aby pokryl zhruba
// půl roku až rok dopředu podle frekvence opakování.
const OCCURRENCE_COUNT: Record<RepeatInterval, number> = {
  denne: 60,
  tydne: 26,
  dvoutydne: 13,
  mesicne: 12,
};

function advance(date: Date, interval: RepeatInterval): Date {
  const next = new Date(date);
  switch (interval) {
    case 'denne':
      next.setDate(next.getDate() + 1);
      break;
    case 'tydne':
      next.setDate(next.getDate() + 7);
      break;
    case 'dvoutydne':
      next.setDate(next.getDate() + 14);
      break;
    case 'mesicne':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export function generateOccurrenceDates(firstDueDate: Date, interval: RepeatInterval): Date[] {
  const count = OCCURRENCE_COUNT[interval];
  const dates: Date[] = [firstDueDate];
  let current = firstDueDate;
  for (let i = 1; i < count; i++) {
    current = advance(current, interval);
    dates.push(current);
  }
  return dates;
}
