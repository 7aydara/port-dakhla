/**
 * Localisation : cadrages successifs et position du marqueur.
 *
 * Le marqueur est place en coordonnees RELATIVES (pourcentages de l'image de
 * carte), pour qu'il suive la carte a tous les niveaux de zoom.
 *
 * ATTENTION -- les coordonnees exactes du site de Ntirift ne figurent pas dans
 * les sources fournies. Elles ne sont donc PAS inventees : le marqueur suit la
 * regle explicite du dossier (environ 40 km au nord de la ville de Dakhla, sur
 * la cote atlantique ouverte, hors de la baie) et reste signale comme a
 * verifier tant qu'une source ne l'aura pas confirme.
 */

export interface Cadrage {
  readonly zoom: number;
  /** Origine de la transformation, en pourcentages de l'image. */
  readonly origineX: number;
  readonly origineY: number;
  readonly libelle: string;
}

export const CADRAGES: readonly Cadrage[] = [
  { zoom: 1, origineX: 50, origineY: 50, libelle: 'Le Maroc et sa façade atlantique.' },
  {
    zoom: 2.6,
    origineX: 24,
    origineY: 80,
    libelle: 'La région de Dakhla-Oued Eddahab, à l’extrême sud de la façade atlantique.',
  },
  {
    zoom: 6.5,
    origineX: 22,
    origineY: 82,
    libelle:
      'Le site de Ntirift, sur la côte atlantique ouverte, au nord de la ville de Dakhla.',
  },
];

export const MARQUEUR_SITE = {
  /** Coordonnees relatives sur l'image de carte, en pourcentages. */
  x: 22,
  y: 81.5,
  distanceKm: 40,
  /** Tant que la position n'est pas confirmee par une source, on l'affiche. */
  aVerifier: true,
} as const;

/**
 * Reserve de geographie a lever.
 * Le dossier situe le site « commune rurale d'El Argoub » ET « a environ 40 km
 * au nord de la ville de Dakhla, sur la cote atlantique ouverte ». El Argoub
 * est generalement decrite au sud-est de Dakhla, cote baie. Les deux enonces
 * peuvent se concilier si la commune s'etend vers le nord, mais la
 * verification n'appartient pas au code : elle est signalee, pas tranchee.
 */
export const RESERVE_COMMUNE =
  'Le dossier situe le site dans la commune rurale d’El Argoub et à 40 km au nord de Dakhla. Position portée ici selon la règle « 40 km au nord, côte ouverte, hors baie ».';
