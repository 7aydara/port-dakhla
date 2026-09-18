/**
 * Localisation : cadrages successifs et position du marqueur.
 *
 * Le marqueur est place en coordonnees RELATIVES (pourcentages de l'image de
 * carte), pour qu'il suive la carte a tous les niveaux de zoom.
 *
 * POSITION ETABLIE PAR MESURE, pas a l'estime.
 * La latitude a ete calee sur les deux extremites du territoire figurant sur
 * la carte fournie -- Cap Spartel au nord (35,92 N) et Cap Blanc au sud
 * (20,80 N) -- puis interpolee. Le resultat a ete verifie a l'oeil : le point
 * calcule pour Dakhla tombe exactement sur la presqu'ile de Dakhla, qui est
 * un repere indiscutable du trait de cote. Le site, a 40 km au nord, tombe
 * bien sur la cote atlantique ouverte, hors de la baie -- ce que dit le
 * dossier.
 */

export interface Cadrage {
  readonly zoom: number;
  /** Origine de la transformation, en pourcentages de l'image. */
  readonly origineX: number;
  readonly origineY: number;
  readonly libelle: string;
}

/** Position relative du site sur la carte, en pourcentages. */
export const MARQUEUR_SITE = {
  x: 15.91,
  y: 72.95,
  distanceKm: 40,
  /** La position est desormais mesuree et verifiee : plus de reserve. */
  aVerifier: false,
} as const;

/** Position relative de la ville de Dakhla, pour situer le site par rapport a elle. */
export const MARQUEUR_DAKHLA = { x: 13.83, y: 75.08 } as const;

export const CADRAGES: readonly Cadrage[] = [
  { zoom: 1, origineX: 50, origineY: 50, libelle: 'Le Maroc et sa façade atlantique.' },
  {
    zoom: 2.4,
    origineX: MARQUEUR_SITE.x,
    origineY: MARQUEUR_SITE.y,
    libelle: 'La région de Dakhla-Oued Eddahab, à l’extrême sud de la façade atlantique.',
  },
  {
    zoom: 5.5,
    origineX: MARQUEUR_SITE.x,
    origineY: MARQUEUR_SITE.y,
    libelle:
      'Le site de Ntirift, sur la côte atlantique ouverte, au nord de la ville de Dakhla.',
  },
];

/**
 * Reserve de geographie a lever.
 * Le dossier situe le site « commune rurale d'El Argoub » ET « a environ 40 km
 * au nord de la ville de Dakhla, sur la cote atlantique ouverte ». El Argoub
 * est generalement decrite au sud-est de Dakhla, cote baie. Les deux enonces
 * peuvent se concilier si la commune s'etend vers le nord ; la verification
 * n'appartient pas au code, elle est signalee, pas tranchee.
 */
export const RESERVE_COMMUNE =
  'Le dossier situe le site dans la commune rurale d’El Argoub et à 40 km au nord de Dakhla. Le repère est porté ici selon la règle « 40 km au nord, côte ouverte, hors baie ».';
