/**
 * Mise en forme typographique francaise des donnees chiffrees.
 *
 * Les chiffres sont stockes comme des NOMBRES dans le contenu, jamais comme
 * des chaines deja formatees. Le formatage passe par Intl, qui produit les
 * bonnes espaces insecables fines (U+202F) et la virgule decimale francaise.
 * On evite ainsi toute divergence entre deux endroits du site qui citent la
 * meme donnee.
 */

const NOMBRE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/** Espace insecable fine, celle qui precede % et separe les milliers. */
export const FINE = ' ';
/** Espace insecable normale. */
export const INSECABLE = ' ';
/** Vrai signe moins (U+2212), pas un trait d'union. Pour les profondeurs. */
export const MOINS = '−';

/** 6700 -> "6 700"  (avec espace insecable fine) */
export function nombre(valeur: number): string {
  return NOMBRE.format(valeur);
}

/** 57.16 -> "57,16 %"  (virgule decimale, espace insecable fine avant %) */
export function pourcentage(valeur: number): string {
  return `${NOMBRE.format(valeur)}${FINE}%`;
}

/** 16 -> "-16 m" avec un vrai signe moins et une espace insecable. */
export function profondeur(metres: number): string {
  return `${MOINS}${NOMBRE.format(Math.abs(metres))}${INSECABLE}m`;
}

/** Une mesure completee de son unite, pour le corps de texte. */
export function mesure(valeur: number, unite: string): string {
  return `${NOMBRE.format(valeur)}${INSECABLE}${unite}`;
}
