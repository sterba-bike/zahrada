import { TreeSpecies } from '../types';

// Encyklopedie ovocných dřevin pro sezónní upozornění na typické choroby/škůdce
// (viz src/rules/ecoTipRules.ts, pravidlo "seasonal-care-reminder"). Appka je
// nabídne jen u stromu/keře, kterému appka nepovinně přiřadíte druh
// (viz Tree.speciesId) - jinak zůstane appka bez tohoto konkrétního upozornění,
// nic se tím nerozbije.
export const SEED_TREE_SPECIES: TreeSpecies[] = [
  {
    id: 'broskev',
    name: 'Broskev/broskvoň',
    careReminders: [
      {
        months: [1, 2],
        text:
          'Broskvoně: čas na ošetření proti kadeřavosti broskvoně - ještě před rašením pupenů (únor-začátek března) postřikejte měděným přípravkem nebo přesličkovým vývarem.',
      },
    ],
  },
  {
    id: 'meruňka',
    name: 'Meruňka',
    careReminders: [
      {
        months: [2, 3],
        text:
          'Meruňky: v době květu a hned po odkvětu hrozí monilióza (hnědnutí a usychání květů a větviček) - odstraňte napadené části a zajistěte prostupné, provzdušněné koruny.',
      },
    ],
  },
  {
    id: 'jablon',
    name: 'Jabloň',
    careReminders: [
      {
        months: [3, 4],
        text:
          'Jabloně: v období rašení a kvetení hrozí strupovitost jabloně (tmavé skvrny na listech a plodech) - pomáhá prostupná koruna a jarní postřik přesličkovým vývarem.',
      },
      {
        months: [5, 6],
        text:
          'Jabloně: začíná nálet obaleče jablečného (larvy poškozují plody) - pomohou feromonové lapáky a sběr napadených padavek ze země.',
      },
    ],
  },
  {
    id: 'hrusen',
    name: 'Hrušeň',
    careReminders: [
      {
        months: [3, 4],
        text:
          'Hrušně: v období rašení hrozí strupovitost hrušně (skvrny na listech a plodech) - odstraňte spadané listí z podzimu, které chorobu přenáší.',
      },
    ],
  },
  {
    id: 'svestka',
    name: 'Švestka/slivoň',
    careReminders: [
      {
        months: [2, 3],
        text:
          'Švestky: v době květu hrozí monilióza (usychání květů) - odstraňujte a pálte napadené větvičky, nekompostujte je.',
      },
      {
        months: [4, 5],
        text: 'Švestky: pozor na puchrovitost švestky (nafouklé, zdeformované plody) - napadené plody hned odstraňte, ať se nákaza nešíří.',
      },
    ],
  },
  {
    id: 'tresen',
    name: 'Třešeň',
    careReminders: [
      {
        months: [4, 5],
        text:
          'Třešně: v době dozrávání hrozí vrtule třešňová (červi v plodech) - pomohou žluté lepové desky zavěšené do koruny od konce dubna.',
      },
    ],
  },
  {
    id: 'visen',
    name: 'Višeň',
    careReminders: [
      {
        months: [4, 5],
        text:
          'Višně: stejně jako u třešní hrozí v době dozrávání vrtule třešňová - pomohou žluté lepové desky v koruně.',
      },
    ],
  },
  {
    id: 'reva',
    name: 'Réva vinná',
    careReminders: [
      {
        months: [5, 6, 7],
        text:
          'Réva: ve vlhkém a teplém počasí hrozí padlí a plíseň révová - prosvětlujte listovou stěnu kolem hroznů, ať rychle osychá.',
      },
    ],
  },
  {
    id: 'rybiz',
    name: 'Rybíz',
    careReminders: [
      {
        months: [3, 4],
        text:
          'Rybíz: na jaře sledujte puchýřovitě zduřelé listy - jde o mšici rybízovou, napadené listy odstraňte, dřív než se přemnoží.',
      },
    ],
  },
  {
    id: 'angrest',
    name: 'Angrešt',
    careReminders: [
      {
        months: [4, 5],
        text:
          'Angrešt: hrozí americké padlí angreštové (bílý povlak na výhoncích a plodech) - na jaře prořeďte keř, ať dovnitř proudí vzduch.',
      },
    ],
  },
  {
    id: 'malinik',
    name: 'Maliník',
    careReminders: [
      {
        months: [4, 5],
        text: 'Maliník: sledujte dřepčíka maliníkového a šedou hnilobu plodů - sklízejte průběžně, přezrálé plody nenechávejte na keři.',
      },
    ],
  },
  {
    id: 'ostruzinik',
    name: 'Ostružiník',
    careReminders: [
      {
        months: [4, 5],
        text: 'Ostružiník: stejně jako u maliníku hrozí šedá hniloba plodů - sklízejte průběžně a odstraňte přezrálé plody.',
      },
    ],
  },
  {
    id: 'orech',
    name: 'Ořešák vlašský',
    careReminders: [
      {
        months: [4, 5],
        text:
          'Ořešák: ve vlhkém jarním počasí hrozí bakteriální spála ořešáku (černé skvrny na listech a plodech) - odstraňte a zlikvidujte silně napadené větvičky.',
      },
    ],
  },
];

export function getTreeSpeciesById(id: string): TreeSpecies | undefined {
  return SEED_TREE_SPECIES.find((s) => s.id === id);
}
