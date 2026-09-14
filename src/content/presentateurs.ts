/**
 * Les trois presentateurs. Chacun a une couleur, constante sur tout le site :
 * dans le panneau de notes, dans la repartition orale, dans la conclusion.
 */

export type Presentateur = 'zayd' | 'fahd' | 'rayan';

export interface FichePresentateur {
  readonly nom: string;
  /** Nom du jeton CSS qui porte sa couleur (defini dans tokens.css). */
  readonly jeton: string;
  /** Ce dont il a la charge a l'oral, tel que fixe dans le brief. */
  readonly charge: string;
}

export const PRESENTATEURS: Readonly<Record<Presentateur, FichePresentateur>> = {
  zayd: {
    nom: 'Zayd',
    jeton: 'var(--zayd)',
    charge: 'Introduction, localisation, défis, premier argument de conclusion',
  },
  fahd: {
    nom: 'Fahd',
    jeton: 'var(--fahd)',
    charge: 'Le projet, la construction, objectifs, deuxième argument',
  },
  rayan: {
    nom: 'Rayan',
    jeton: 'var(--rayan)',
    charge: 'Chronologie, avant/après, chiffres, limites et remerciements',
  },
};

export const ORDRE_PRESENTATEURS: readonly Presentateur[] = ['zayd', 'fahd', 'rayan'];
