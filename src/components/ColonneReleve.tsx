/**
 * LA COLONNE DE RELEVE.
 *
 * Les neuf sections y figurent comme des stations de sonde le long d'un profil.
 * Pastille creuse = a venir, pleine sable = acquise, magenta = station courante.
 * Chaque station est un bouton : la navigation reste entierement au clavier.
 */

import { SECTIONS } from '../content/sections';
import { usePresentation } from '../hooks/usePresentation';

export function ColonneReleve() {
  const c = usePresentation();
  const { section, etape, mode } = c.etat;

  function allerA(index: number) {
    c.aller(index, 0);
    if (mode === 'recit') {
      document
        .getElementById(`section-${SECTIONS[index].id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav className="releve" aria-label="Sommaire">
      <p className="releve__entete">Relevé</p>

      <ol className="releve__liste">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="releve__station"
              aria-current={i === section ? 'true' : undefined}
              data-station={i < section ? 'acquise' : i === section ? 'courante' : 'venir'}
              onClick={() => allerA(i)}
              /* Les sections sont numerotees 00 a 08 mais les raccourcis vont
                 de 1 a 9 : on affiche donc la touche, on ne la fait pas
                 deviner a quelqu'un qui presente devant une classe. */
              aria-keyshortcuts={i < 9 ? String(i + 1) : undefined}
              title={i < 9 ? `${s.numero} — ${s.court} (touche ${i + 1})` : `${s.numero} — ${s.court}`}
            >
              <span className="releve__numero">{s.numero}</span>
              <span className="releve__pastille" aria-hidden="true" />
              <span className="releve__libelle">{s.court}</span>
              {i < 9 && (
                <span className="releve__touche" aria-hidden="true">
                  {i + 1}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div className="releve__pied">
        <p className="releve__sonde">
          Étape <b>{etape + 1}</b> / {c.etapesSection}
        </p>
        <div
          className="jauge"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={c.etapesSection}
          aria-valuenow={etape + 1}
          aria-label="Avancement dans la section"
        >
          <div
            className="jauge__remplissage"
            style={{ transform: `scaleX(${(etape + 1) / c.etapesSection})` }}
          />
        </div>
      </div>
    </nav>
  );
}
