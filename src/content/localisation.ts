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

/**
 * Reperes sur la carte REGIONALE (media/carte-region.webp), en pourcentages.
 * Releves au pixel sur la carte d'origine, ou N'Tireft et Dakhla sont toutes
 * deux nommees, puis convertis au cadrage exporte.
 */
export const MARQUEURS_REGION = {
  ntireft: { x: 47.64, y: 21.81 },
  dakhla: { x: 25.09, y: 53.98 },
} as const;

/**
 * Echelle de cette carte. La distance Dakhla / N'Tireft mesure 366 px sur la
 * carte d'origine ; le dossier la donne pour 40 km, soit 110 m par pixel.
 * VERIFICATION CROISEE : a cette echelle, la presqu'ile de Dakhla mesure une
 * trentaine de kilometres, ce qui correspond a sa longueur reelle. Le chiffre
 * du dossier tient.
 */
export const ECHELLE_REGION = {
  metresParPixel: 110,
  /** Largeur d'une regle de 10 km, en pourcentage de la largeur de l'image. */
  dixKmEnPourcent: 8.28,
} as const;

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
/**
 * Reserve de geographie, que la carte regionale rend maintenant VISIBLE :
 * El Argoub (العرݣوب) y figure au sud-est de Dakhla, de l'autre cote de la
 * baie, alors que le site est au nord. Les deux enonces du dossier peuvent se
 * concilier si la commune s'etend vers le nord, mais le point merite d'etre
 * signale plutot que tranche.
 */
export const RESERVE_COMMUNE =
  'Le dossier situe le site dans la commune rurale d’El Argoub — visible au sud-est de Dakhla sur la carte — et à 40 km au nord de la ville. Le port est bien au nord, à N’Tireft ; le rattachement communal reste à vérifier.';
