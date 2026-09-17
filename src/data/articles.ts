import { Article } from '../types';

// Pár ručně napsaných článků pro V1 - plnohodnotné znalostní centrum je rozšiřováno ve V2.
export const ARTICLES: Article[] = [
  {
    id: 'kompostovani-zaklady',
    title: 'Základy kompostování na zahradě',
    category: 'Kompostování',
    readMinutes: 4,
    content:
      'Kompost vzniká střídáním "zelené" (tráva, zbytky zeleniny) a "hnědé" (suché listí, karton) vrstvy. Hromadu občas provzdušněte přeházením - urychlí to rozklad a zabrání zápachu. Hotový kompost poznáte podle tmavé barvy a vůně po lesní půdě.',
  },
  {
    id: 'mulcovani',
    title: 'Proč a jak mulčovat záhony',
    category: 'Mulčování',
    readMinutes: 3,
    content:
      'Mulč (posečená tráva, sláma, listí) omezuje odpar vody, potlačuje plevel a postupně obohacuje půdu. Vrstvu 5-10 cm nanášejte kolem rostlin, ne přímo na stonky, aby nedošlo k hnilobě.',
  },
  {
    id: 'prirodni-ochrana',
    title: 'Přírodní ochrana proti škůdcům',
    category: 'Přírodní ochrana',
    readMinutes: 5,
    content:
      'Než sáhnete po chemii, zkuste podpořit přirozené predátory - slunéčka na mšice, ježky na slimáky. Smíšená výsadba (companion planting) a pravidelná kontrola rostlin pomohou zachytit problém včas.',
  },
  {
    id: 'biodiverzita',
    title: 'Jak podpořit biodiverzitu na malé zahradě',
    category: 'Biodiverzita',
    readMinutes: 4,
    content:
      'I malý kousek neposečené trávy, hromada klestí nebo hmyzí hotel dokážou přilákat opylovače a užitečný hmyz. Rozmanitost rostlin (i plevelů) podporuje odolnější ekosystém zahrady.',
  },
];

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
