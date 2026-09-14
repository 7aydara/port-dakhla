/**
 * Chronologie du projet : les quinze dates du dossier, dans l'ordre.
 * Les quatre dates marquees `cle: true` sont mises en avant sur la frise ;
 * les autres restent accessibles au survol, au clavier et a l'appui.
 *
 * `etape` regroupe les dates par palier de revelation (six paliers), pour que
 * le presentateur puisse parler d'une periode entiere a chaque appui.
 */

export interface Jalon {
  readonly id: string;
  /** Libelle affiche, tel qu'il doit se lire a l'ecran. */
  readonly date: string;
  /** Annee servant au placement proportionnel sur la frise (peut etre decimale). */
  readonly position: number;
  readonly evenement: string;
  readonly cle: boolean;
  readonly etape: number;
  /** Avancement des travaux annonce a cette date, en pourcentage. */
  readonly avancement?: number;
  /** Nuance a afficher devant l'avancement (« environ », « plus de »). */
  readonly nuance?: string;
  /** Reserve documentaire a afficher telle quelle. */
  readonly reserve?: string;
}

export const JALONS: readonly Jalon[] = [
  {
    id: 'discours-2015',
    date: '6 novembre 2015',
    position: 2015.85,
    evenement:
      "Discours royal à Laâyoune pour le 40ᵉ anniversaire de la Marche verte : lancement du nouveau modèle de développement des provinces du Sud.",
    cle: true,
    etape: 0,
  },
  {
    id: 'convention-2016',
    date: 'Février 2016',
    position: 2016.1,
    evenement:
      'Convention spécifique du port signée devant le Roi Mohammed VI.',
    reserve: 'jour exact non documenté',
    cle: false,
    etape: 0,
  },
  {
    id: 'etudes-2018',
    date: '18 septembre 2018',
    position: 2018.7,
    evenement: "Études de construction à 60 % d’avancement.",
    cle: false,
    etape: 1,
  },
  {
    id: 'appel-offres-2020',
    date: '11 décembre 2020',
    position: 2020.95,
    evenement:
      "Relance de l’appel d’offres avec présélection nᵒ 08/DPDPM/2020.",
    cle: false,
    etape: 1,
  },
  {
    id: 'plis-2021',
    date: '21 janvier 2021',
    position: 2021.05,
    evenement: 'Ouverture des plis à Rabat.',
    cle: false,
    etape: 1,
  },
  {
    id: 'marche-2021',
    date: '9 août 2021',
    position: 2021.6,
    evenement:
      'Marché attribué au groupement SGTM – Somagec Sud pour 12,4 milliards de dirhams. Démarrage du chantier.',
    cle: true,
    etape: 2,
  },
  {
    id: 'avancement-2024',
    date: 'Été 2024',
    position: 2024.5,
    evenement: "Le chantier atteint environ 20 % d’avancement.",
    avancement: 20,
    nuance: 'environ',
    cle: false,
    etape: 3,
  },
  {
    id: 'voie-express-2024',
    date: '27 novembre 2024',
    position: 2024.9,
    evenement:
      'Achèvement de la voie express Tiznit-Dakhla : 1 055 km pour 10 milliards de dirhams. Le port cesse d’être un point isolé.',
    cle: false,
    etape: 3,
  },
  {
    id: 'avancement-2025',
    date: 'Mi-2025',
    position: 2025.5,
    evenement: "Environ 40 % d’avancement.",
    avancement: 40,
    nuance: 'environ',
    cle: false,
    etape: 3,
  },
  {
    id: 'bassins-2026',
    date: '7 janvier 2026',
    position: 2026.02,
    evenement:
      "Ouvrages de protection des bassins achevés. Un objectif de 70 % est annoncé pour 2026.",
    cle: false,
    etape: 4,
  },
  {
    id: 'fevrier-2026',
    date: 'Février 2026',
    position: 2026.12,
    evenement: "53 % d’avancement.",
    avancement: 53,
    cle: false,
    etape: 4,
  },
  {
    id: 'avril-2026',
    date: 'Avril 2026',
    position: 2026.28,
    evenement: "57,16 % d’avancement.",
    avancement: 57.16,
    cle: false,
    etape: 4,
  },
  {
    id: 'juin-2026',
    date: '3 juin 2026',
    position: 2026.42,
    evenement:
      "Le ministère annonce plus de 60 % d’avancement des travaux.",
    avancement: 60,
    nuance: 'plus de',
    cle: true,
    etape: 4,
  },
  {
    id: 'fin-2028',
    date: 'Fin 2028',
    position: 2028.9,
    evenement: 'Achèvement prévu des travaux.',
    cle: false,
    etape: 5,
  },
  {
    id: 'service-2029',
    date: '2029',
    position: 2029.5,
    evenement: 'Mise en service prévue.',
    cle: true,
    etape: 5,
  },
];

/** Bornes de la frise, deduites des jalons. */
export const FRISE_DEBUT = 2015.4;
export const FRISE_FIN = 2029.9;

/** Nombre de paliers de revelation de la frise. */
export const PALIERS_FRISE = 6;

/**
 * Points de la jauge d'avancement, dans l'ordre. Repris tels quels du dossier.
 * La jauge progresse le long de la frise au fil des paliers.
 */
export const JAUGE_AVANCEMENT: readonly {
  readonly position: number;
  readonly pourcentage: number;
  readonly libelle: string;
  readonly nuance?: string;
}[] = [
  { position: 2024.5, pourcentage: 20, libelle: 'Été 2024', nuance: 'environ' },
  { position: 2025.5, pourcentage: 40, libelle: 'Mi-2025', nuance: 'environ' },
  { position: 2026.12, pourcentage: 53, libelle: 'Février 2026' },
  { position: 2026.28, pourcentage: 57.16, libelle: 'Avril 2026' },
  { position: 2026.42, pourcentage: 60, libelle: '3 juin 2026', nuance: 'plus de' },
];
