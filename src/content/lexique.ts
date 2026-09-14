/**
 * Lexique. Les termes techniques employes dans le site, definis pour une
 * classe de geographie. Affiche en fin de section 3 et accessible au clavier.
 */

export interface Terme {
  readonly mot: string;
  readonly definition: string;
}

export const LEXIQUE: readonly Terme[] = [
  {
    mot: 'Isobathe',
    definition:
      'Ligne qui relie tous les points de même profondeur sous la mer. L’équivalent sous-marin d’une courbe de niveau.',
  },
  {
    mot: 'Bathymétrie',
    definition: 'La mesure des profondeurs marines, et la carte qui en résulte.',
  },
  {
    mot: 'Port en eau profonde',
    definition:
      'Port dont les fonds permettent d’accueillir des navires à fort tirant d’eau sans dragage permanent.',
  },
  {
    mot: 'Digue',
    definition:
      'Ouvrage massif qui casse la houle et abrite le plan d’eau où manœuvrent les navires.',
  },
  {
    mot: 'Terre-plein',
    definition:
      'Surface plane gagnée sur la mer par remblai, sur laquelle on installe les quais et les terminaux.',
  },
  {
    mot: 'Port-îlot',
    definition:
      'Port construit au large, séparé de la côte, et relié à la terre par un ouvrage — ici un viaduc.',
  },
  {
    mot: 'Pêche hauturière',
    definition:
      'Pêche pratiquée au large, sur plusieurs jours, par opposition à la pêche côtière qui rentre au port chaque jour.',
  },
  {
    mot: 'Halieutique',
    definition: 'Qui concerne la pêche et les ressources vivantes de la mer.',
  },
  {
    mot: 'Désenclavement',
    definition:
      'Action de relier un territoire isolé au reste du pays par des infrastructures de transport.',
  },
  {
    mot: 'Dessalement',
    definition:
      'Production d’eau douce à partir d’eau de mer. Solution courante en milieu désertique, mais coûteuse en énergie.',
  },
  {
    mot: 'Ensablement',
    definition:
      'Accumulation de sable qui réduit la profondeur d’un chenal ou d’un bassin et peut le rendre impraticable.',
  },
  {
    mot: 'Enrochement',
    definition:
      'Empilement de blocs rocheux qui protège le pied d’une digue ou d’un remblai contre l’attaque des vagues.',
  },
];
