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
  {
    id: 'hospodareni-s-vodou',
    title: 'Jak v zahradě šetřit vodou',
    category: 'Hospodaření s vodou',
    readMinutes: 4,
    content:
      'Dešťovku jímejte do sudu pod okapem - je pro rostliny lepší než tvrdá vodovodní voda. Zalévejte časně ráno nebo večer, ať voda rychle nevypaří, a raději méně často, zato vydatně - rostliny tak zakoření hlouběji a lépe snáší sucho. Mulč kolem rostlin odpar dál omezí.',
  },
  {
    id: 'osevni-postup',
    title: 'Proč střídat plodiny na záhonu (osevní postup)',
    category: 'Osevní postup',
    readMinutes: 5,
    content:
      'Stejná plodina na stejném místě rok co rok vyčerpává z půdy pořád ty samé živiny a hromadí si tam "svoje" choroby a škůdce. Appka proto hlídá dvě věci: aby se stejný druh nevracel na stejný záhon dřív než za cca 3 roky, a aby se po náročné plodině (hodně čerpá živiny) nesázela zase jiná náročná - půda si mezitím potřebuje odpočinout, ideálně u luskovin, které naopak půdu obohacují dusíkem.',
  },
  {
    id: 'prirodni-hnojiva',
    title: 'Přírodní hnojiva z vlastní zahrady',
    category: 'Přírodní hnojiva',
    readMinutes: 4,
    content:
      'Kopřivový macerát (kopřivy zalité vodou a nechané kvasit cca týden) je výborné tekuté hnojivo bohaté na dusík - naředěný 1:10 se dá zalévat přímo k rostlinám. Kompost zapracovaný do půdy na jaře dodá živiny pomalu a dlouhodobě. Popel z dřeva (v malém množství) obohatí půdu o draslík a vápník.',
  },
  {
    id: 'ochrana-pred-mrazem',
    title: 'Jak chránit rostliny před pozdními mrazíky',
    category: 'Ochrana před mrazem',
    readMinutes: 3,
    content:
      'Pozdní jarní mrazíky dokážou zničit i sazenice, které už vypadaly bezpečně zakořeněné. Přes noc je přikryjte netkanou textilií nebo i jen starým prostěradlem - vzduchová mezera pod látkou funguje jako izolace. U citlivějších druhů (rajčata, okurky, cukety) je bezpečnější počkat s výsadbou ven, až riziko mrazíků skutečně pomine.',
  },
  {
    id: 'zalozeni-zahonu',
    title: 'Jak ekologicky založit nový záhon (bez rytí)',
    category: 'Založení záhonu',
    readMinutes: 5,
    content:
      'Místo pracného přerývání trávníku zkuste metodu "no-dig": plochu zakryjte kartonem nebo silnější vrstvou novin, na to naneste 10-15 cm kompostu nebo zahradnické zeminy a rovnou sázejte nebo sejte. Karton pod vrstvou postupně shnije a nadzemní vrstva zůstane kyprá, plná žížal a mikroorganismů - bez namáhavého kopání a s menším množstvím plevele.',
  },
];

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
