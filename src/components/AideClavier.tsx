/**
 * AIDE CLAVIER.
 * Affichee a l'entree en mode presentation, et sur la touche ? ou H.
 * Se ferme sur n'importe quelle touche : un presentateur presse ne doit pas
 * avoir a chercher comment sortir.
 */

import { usePresentation } from '../hooks/usePresentation';

const RACCOURCIS: readonly { readonly touches: readonly string[]; readonly quoi: string }[] = [
  { touches: ['→', 'Espace'], quoi: 'Étape suivante' },
  { touches: ['←'], quoi: 'Étape précédente' },
  { touches: ['↓'], quoi: 'Section suivante' },
  { touches: ['↑'], quoi: 'Section précédente' },
  { touches: ['1', '…', '9'], quoi: 'Aller à une section — 1 = section 00, 9 = section 08' },
  { touches: ['N'], quoi: 'Afficher ou masquer les notes' },
  { touches: ['F'], quoi: 'Plein écran' },
  { touches: ['T'], quoi: 'Chronomètre de l’oral' },
  { touches: ['C'], quoi: 'Contraste renforcé (salle claire, vidéoprojecteur faible)' },
  { touches: ['P'], quoi: 'Basculer récit / présentation' },
  { touches: ['Échap'], quoi: 'Revenir au mode récit' },
];

export function AideClavier() {
  const c = usePresentation();
  if (!c.etat.aide) return null;

  return (
    <div className="aide-clavier" role="dialog" aria-modal="true" aria-label="Raccourcis clavier">
      <div>
        <p className="section__numero">Mode présentation</p>
        <h2 className="section__titre" style={{ marginBottom: '1.4rem' }}>
          Tout se pilote au clavier
        </h2>

        <div className="aide-clavier__grille">
          {RACCOURCIS.map((r) => (
            <p className="aide-clavier__ligne" key={r.quoi}>
              <span>
                {r.touches.map((t, i) => (
                  <span key={t}>
                    {i > 0 && <span className="aide-clavier__ou"> </span>}
                    <kbd>{t}</kbd>
                  </span>
                ))}
              </span>
              <span>{r.quoi}</span>
            </p>
          ))}
        </div>

        <p className="aide-clavier__sortie">
          Appuyez sur n’importe quelle touche pour commencer.
        </p>
        <p className="aide-clavier__version">
          version {__VERSION__} · construite le {__CONSTRUIT_LE__}
        </p>
      </div>
    </div>
  );
}
