/**
 * EMPLACEMENT RESERVE pour une photo ou une carte non encore fournie.
 *
 * Le brief demande « un cadre avec le nom du fichier attendu, pas une image
 * generique ». Ce composant affiche donc exactement ce qu'il faut deposer et
 * ou, sous forme de repere de chantier -- visible, mais pas honteux si le
 * fichier manque encore le jour de l'oral.
 */

interface ProprietesEmplacement {
  /** Chemin attendu, relatif a public/. */
  readonly fichier: string;
  /** Ce que l'image doit montrer. */
  readonly attendu: string;
  /** Rapport largeur/hauteur, en CSS (« 16 / 9 »). */
  readonly ratio?: string;
}

export function EmplacementMedia({
  fichier,
  attendu,
  ratio = '16 / 9',
}: ProprietesEmplacement) {
  return (
    <div className="emplacement" style={{ aspectRatio: ratio }} role="img" aria-label={`Emplacement réservé : ${attendu}`}>
      <div className="emplacement__mire" aria-hidden="true" />
      <div className="emplacement__texte">
        <span className="emplacement__etiquette">Fichier attendu</span>
        <code className="emplacement__chemin">public/{fichier}</code>
        <p className="emplacement__attendu">{attendu}</p>
      </div>
    </div>
  );
}
