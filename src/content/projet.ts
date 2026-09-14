/**
 * Donnees factuelles du projet.
 *
 * REGLE ABSOLUE : aucun chiffre de ce fichier n'est invente. Tout provient du
 * dossier fourni (voir sources.ts). Une donnee manquante reste un TODO visible,
 * elle n'est jamais comblee par approximation.
 */

export interface Composante {
  readonly cle: string;
  readonly nom: string;
  /**
   * Profondeur, en metres. ABSENTE quand le dossier n'en donne pas : c'est le
   * cas du pole de reparation navale. Ne pas l'extrapoler depuis le port de
   * peche voisin -- ce serait une donnee inventee.
   */
  readonly profondeurM?: number;
  readonly description: string;
  /** Longueur de quai associee, en metres. */
  readonly quaiM: number;
}

export const COMPOSANTES: readonly Composante[] = [
  {
    cle: 'commerce',
    nom: 'Port de commerce',
    profondeurM: 16,
    description:
      "Un tirant d’eau de seize mètres permet d’accueillir des navires porte-conteneurs et vraquiers de grande taille, ce que la baie de Dakhla ne permet pas.",
    quaiM: 660,
  },
  {
    cle: 'peche',
    nom: 'Port de pêche côtière et hauturière',
    profondeurM: 12,
    description:
      "La flotte côtière et la flotte hauturière débarquent au même endroit, ce qui rend possible la transformation du poisson bord à quai plutôt que son transport vers le nord.",
    quaiM: 1800,
  },
  {
    cle: 'reparation',
    nom: 'Pôle de réparation navale',
    // Pas de profondeur : non documentee dans les sources fournies.
    description:
      "Un chantier de réparation évite aux armateurs de remonter jusqu’à Agadir ou Las Palmas pour entretenir leurs navires.",
    quaiM: 200,
  },
];

/** Identite du projet. */
export const PROJET = {
  nom: 'Port Dakhla Atlantique',
  site: 'Ntirift',
  commune: "commune rurale d’El Argoub",
  region: 'Dakhla-Oued Eddahab',
  /** Distance au nord de la ville de Dakhla, en kilometres. */
  distanceDakhlaKm: 40,
  orientation: 'au nord',
  implantation: "sur la côte atlantique ouverte, et non dans la baie de Dakhla",
  investissementMilliardsDh: 13,
  maitreOuvrage: "ministère de l’Équipement et de l’Eau",
  groupement: 'SGTM – Somagec Sud',
  montantMarcheMilliardsDh: 12.4,
  zoneIndustrielleHa: 1650,
} as const;

/*
 * Les dimensions des ouvrages ne sont PAS listees ici : elles vivent dans
 * couches.ts, qui les affiche dans la legende du schema. Une seule source par
 * donnee -- deux listes finiraient par diverger.
 */

/** Avancements ponctuels releves en juin 2026. */
export const AVANCEMENT_VIADUC = { pourcentage: 85.4, date: 'juin 2026' } as const;
export const AVANCEMENT_REMBLAI = { pourcentage: 44, date: 'juin 2026' } as const;

/** Effectif du chantier. */
export const CHANTIER = {
  ouvriers: 1800,
  ouvriersMention: 'plus de',
  rotation: '24 h/24',
} as const;

/** Trafic attendu a la mise en service. */
export const TRAFIC = [
  { cle: 'marchandises', libelle: 'de marchandises par an', valeur: 2.2, unite: 'millions de tonnes' },
  { cle: 'peche', libelle: 'de produits de la mer par an', valeur: 950000, unite: 'tonnes' },
] as const;

/**
 * Un poste petrolier est mentionne dans le dossier, sans dimension associee.
 * TODO : longueur du poste petrolier non documentee dans les sources fournies.
 * Ne pas l'estimer -- la reclamer ou la laisser absente.
 */
export const POSTE_PETROLIER = {
  present: true,
  longueurM: null,
  note: 'TODO — longueur non documentée dans les sources fournies',
} as const;
