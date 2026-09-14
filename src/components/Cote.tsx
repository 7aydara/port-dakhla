/**
 * PRINCIPE 1 : un chiffre n'est jamais du texte courant.
 *
 * Tout nombre affiche passe par ce composant. Il garantit :
 *   - la police Iosevka et les chiffres tabulaires ;
 *   - la typographie francaise (virgule decimale, espace insecable fine) ;
 *   - l'unite en plus petit et desaccentuee ;
 *   - un millesime attache -- un chiffre sans date ne veut rien dire.
 */

import { nombre, pourcentage, profondeur } from '../content/format';

type Taille = 'geant' | 'grand' | 'courant';

interface ProprietesCote {
  readonly valeur: number;
  readonly unite?: string;
  readonly taille?: Taille;
  /** Date ou precision attachee a la donnee. */
  readonly millesime?: string;
  /** « environ », « plus de ». Affiche avant le nombre, en petit. */
  readonly nuance?: string;
  /** Format special : profondeur (vrai signe moins) ou pourcentage. */
  readonly format?: 'brut' | 'profondeur' | 'pourcentage';
  readonly className?: string;
}

const CLASSES: Record<Taille, string> = {
  geant: 'cote cote--geant',
  grand: 'cote cote--grand',
  courant: 'cote',
};

export function Cote({
  valeur,
  unite,
  taille = 'courant',
  millesime,
  nuance,
  format = 'brut',
  className = '',
}: ProprietesCote) {
  const texte =
    format === 'profondeur'
      ? profondeur(valeur)
      : format === 'pourcentage'
        ? pourcentage(valeur)
        : nombre(valeur);

  // L'unite est deja incluse dans les formats profondeur et pourcentage.
  const uniteAffichee = format === 'brut' ? unite : undefined;

  return (
    <span className={`${CLASSES[taille]} ${className}`.trim()}>
      {nuance && <span className="cote__nuance">{nuance} </span>}
      {texte}
      {uniteAffichee && <span className="cote__unite">{uniteAffichee}</span>}
      {millesime && <span className="cote__millesime">{millesime}</span>}
    </span>
  );
}
