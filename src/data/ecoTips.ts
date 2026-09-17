// Zjednodušená V1 verze eko-tipů (sekce 5.3 specifikace).
// Plnohodnotný pravidlový engine s prioritami je až pro V2 - tady stačí pár
// ručně napsaných sezónních tipů podle měsíce, jak spec pro V1 doporučuje.
export const SEASONAL_ECO_TIPS: string[] = [
  'Leden: zkontrolujte uskladněnou úrodu a vyřaďte plody se známkami hniloby.',
  'Únor: naplánujte osevní postup - nesázejte stejnou plodinu na stejné místo jako loni.',
  'Březen: začněte s předpěstováním sazenic a přidejte kompost do záhonů.',
  'Duben: mulčujte záhony - omezíte plevel i odpar vody.',
  'Květen: pozor na pozdní mrazíky, přikryjte citlivé sazenice netkanou textilií.',
  'Červen: podpořte biodiverzitu - nechte kousek zahrady kvést pro opylovače.',
  'Červenec: v suchu zalévejte časně ráno nebo večer, ne v poledním horku.',
  'Srpen: sklízejte průběžně, přezrálé plody lákají škůdce.',
  'Září: po sklizni zaseťte zelené hnojení, ochráníte půdu přes zimu.',
  'Říjen: shrabané listí nechte zkompostovat, poslouží jako mulč i úkryt pro užitečný hmyz.',
  'Listopad: zkontrolujte úkryty pro užitečné živočichy (ježky, slepýše) na zimu.',
  'Prosinec: naplánujte na příští sezónu střídání skupin náročnosti podle historie záhonů.',
];

export function getTipForToday(): string {
  const month = new Date().getMonth();
  return SEASONAL_ECO_TIPS[month];
}
