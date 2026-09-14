/**
 * PANNEAU DE NOTES (touche N).
 *
 * En surimpression translucide, en bas de l'ecran -- pas sur un second ecran :
 * la classe n'aura qu'un videoprojecteur en recopie, donc le presentateur voit
 * exactement ce que voient les eleves.
 *
 * Affiche pour l'etape en cours : qui parle (avec sa couleur), le texte a dire,
 * et le nombre d'etapes restantes dans la section.
 */

import { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '../content/sections';
import { PRESENTATEURS } from '../content/presentateurs';
import { usePresentation } from '../hooks/usePresentation';

/** Chronometre de l'oral (touche T). Demarre au premier changement d'etape. */
function useChronometre(actif: boolean, depart: number) {
  const [secondes, setSecondes] = useState(0);
  useEffect(() => {
    if (!actif) return;
    const t = setInterval(() => setSecondes(Math.round((Date.now() - depart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [actif, depart]);
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PanneauNotes() {
  const c = usePresentation();
  const { section, etape, notes, mode, chrono } = c.etat;
  const depart = useRef(Date.now());
  const temps = useChronometre(chrono, depart.current);

  if (mode !== 'presentation' || !notes) return null;

  const courante = SECTIONS[section]?.etapes[etape];
  if (!courante) return null;
  const qui = PRESENTATEURS[courante.par];

  return (
    <aside
      className="notes"
      aria-live="polite"
      aria-label="Notes du présentateur"
      style={{ ['--presentateur' as string]: qui.jeton }}
    >
      <p className="notes__qui">{qui.nom}</p>
      <p className="notes__texte">{courante.note}</p>
      <p className="notes__compteur">
        <span>
          Étape <b>{etape + 1}</b>/{c.etapesSection}
          {c.restantes > 0 && ` · ${c.restantes} restante${c.restantes > 1 ? 's' : ''}`}
        </span>
        <span>
          {chrono && <b>{temps} </b>}
          <kbd>N</kbd> masquer · <kbd>?</kbd> aide
        </span>
      </p>
    </aside>
  );
}
