/**
 * Sources. Toutes les donnees chiffrees du site proviennent de cette liste.
 * Les liens sont cliquables ; ils ne sont PAS charges par le site
 * (contrainte hors ligne) -- ils s'ouvrent dans un nouvel onglet si le
 * spectateur dispose d'une connexion.
 */

export interface Source {
  readonly id: string;
  readonly organe: string;
  readonly date: string;
  readonly titre: string;
  readonly url: string;
}

export const SOURCES: readonly Source[] = [
  {
    id: 'medias24-2026-06',
    organe: 'Médias24',
    date: '4 juin 2026',
    titre: "Port Dakhla Atlantique : les travaux franchissent le cap des 60 % d’avancement",
    url: 'https://medias24.com/2026/06/04/port-dakhla-atlantique-les-travaux-franchissent-le-cap-des-60-davancement-1691915/',
  },
  {
    id: 'ledesk-2026-06',
    organe: 'Le Desk',
    date: '4 juin 2026',
    titre: 'Le chantier du port Dakhla Atlantique a dépassé les 60 % de réalisation',
    url: 'https://ledesk.ma/encontinu/le-chantier-du-port-dakhla-atlantique-a-depasse-les-60-de-realisation/',
  },
  {
    id: 'telquel-2026-01',
    organe: 'TelQuel',
    date: '7 janvier 2026',
    titre: "En 2026, le taux d’avancement des travaux devrait atteindre 70 %",
    url: 'https://telquel.ma/2026/01/07/en-2026-le-taux-davancement-des-travaux-du-port-dakhla-atlantique-devrait-atteindre-70_1969008',
  },
  {
    id: 'medias24-2021-08',
    organe: 'Médias24',
    date: '9 août 2021',
    titre: 'Le nouveau port sera construit par le groupement SGTM – Somagec Sud',
    url: 'https://medias24.com/2021/08/09/dakhla-atlantique-le-nouveau-port-sera-construit-par-le-groupement-sgtm-somagec-sud/',
  },
  {
    id: 'medias24-2020-12',
    organe: 'Médias24',
    date: '11 décembre 2020',
    titre: "La présélection des candidats pour la construction relancée",
    url: 'https://www.medias24.com/2020/12/11/port-dakhla-atlantique-la-preselection-des-candidats-pour-la-construction-relancee/',
  },
  {
    id: 'medias24-2024-11',
    organe: 'Médias24',
    date: '27 novembre 2024',
    titre: 'La voie express Tiznit-Dakhla désormais achevée',
    url: 'https://medias24.com/2024/11/27/la-voie-express-tiznit-dakhla-desormais-achevee/',
  },
  {
    id: 'snrt-2025-11',
    organe: 'SNRT News',
    date: '7 novembre 2025',
    titre: 'Construction du port de Dakhla Atlantique : digues, quais et hydrogène vert pour un hub',
    url: 'https://snrtnews.com/fr/article/construction-du-port-de-dakhla-atlantique-digues-quais-et-hydrogene-vert-pour-un-hub',
  },
  {
    id: 'carte-maroc24',
    organe: 'Maroc24',
    date: 'fond de carte',
    titre: 'Carte du Royaume du Maroc — fond de carte utilisé en section 02',
    url: 'https://maroc24.com',
  },
  {
    id: 'tme',
    organe: 'TME Ingénierie',
    date: 'fiche projet',
    titre: 'Dakhla Atlantic Port',
    url: 'https://www.tme.ma/en/projet/dakhla-atlantic-port/',
  },
];

/**
 * Mention obligatoire sur les images. Les sequences aeriennes du site sont des
 * images d'ILLUSTRATION : elles ne documentent pas l'etat reel du chantier de
 * Ntirift a une date donnee.
 */
export const MENTION_IMAGES =
  "Images d’illustration. Elles ne constituent pas un relevé photographique daté du chantier de Ntirift.";
