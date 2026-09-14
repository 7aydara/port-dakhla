/**
 * COMPARATEUR AVANT / AUJOURD'HUI.
 *
 * Deux images du meme cadrage, separees par une poignee glissante.
 *
 * CLAVIER : l'element porte role="slider" et gere lui-meme les fleches gauche
 * et droite. Il porte aussi data-clavier-local, ce qui indique au pilotage
 * global de lui laisser les fleches HORIZONTALES quand il a le focus -- la
 * barre d'espace continue, elle, de faire avancer l'etape. Le presentateur
 * peut donc manipuler la poignee sans perdre le fil de l'expose.
 *
 * Les etapes de la section positionnent la poignee automatiquement ; des que
 * l'utilisateur y touche, sa position prend le dessus jusqu'a l'etape suivante.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ProprietesComparateur {
  readonly avant: string;
  readonly apres: string;
  readonly texteAvant: string;
  readonly texteApres: string;
  readonly descriptionAvant: string;
  readonly descriptionApres: string;
  /** Position imposee par l'etape courante, 0 -> 100. */
  readonly positionEtape: number;
  /** Change a chaque etape : reprend la main sur la position manuelle. */
  readonly cleEtape: number;
}

const PAS = 4;
const PAS_LARGE = 12;

export function Comparateur({
  avant,
  apres,
  texteAvant,
  texteApres,
  descriptionAvant,
  descriptionApres,
  positionEtape,
  cleEtape,
}: ProprietesComparateur) {
  const [position, setPosition] = useState(positionEtape);
  const cadre = useRef<HTMLDivElement>(null);
  const glisse = useRef(false);

  // Chaque changement d'etape reprend la main sur la position manuelle.
  useEffect(() => {
    setPosition(positionEtape);
  }, [cleEtape, positionEtape]);

  const borner = (v: number) => Math.min(100, Math.max(0, v));

  const depuisPointeur = useCallback((clientX: number) => {
    const r = cadre.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPosition(borner(((clientX - r.left) / r.width) * 100));
  }, []);

  function surPointeurBas(e: React.PointerEvent) {
    glisse.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    depuisPointeur(e.clientX);
  }
  function surPointeurDeplace(e: React.PointerEvent) {
    if (glisse.current) depuisPointeur(e.clientX);
  }
  function surPointeurHaut(e: React.PointerEvent) {
    glisse.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function surTouche(e: React.KeyboardEvent) {
    let suivante: number | null = null;
    switch (e.key) {
      case 'ArrowLeft': suivante = position - (e.shiftKey ? PAS_LARGE : PAS); break;
      case 'ArrowRight': suivante = position + (e.shiftKey ? PAS_LARGE : PAS); break;
      case 'Home': suivante = 0; break;
      case 'End': suivante = 100; break;
      default: return;
    }
    e.preventDefault();
    e.stopPropagation();
    setPosition(borner(suivante));
  }

  return (
    <div className="comparateur" data-clavier-local>
      <div
        ref={cadre}
        className="comparateur__cadre"
        onPointerDown={surPointeurBas}
        onPointerMove={surPointeurDeplace}
        onPointerUp={surPointeurHaut}
        onPointerCancel={surPointeurHaut}
      >
        {/* Image du dessous : l'etat actuel. */}
        <img src={apres} alt={descriptionApres} className="comparateur__image" draggable={false} />

        {/* Image du dessus, rognee a la position de la poignee : l'avant. */}
        <div
          className="comparateur__volet"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <img src={avant} alt="" className="comparateur__image" draggable={false} />
        </div>

        <p className="comparateur__etiquette comparateur__etiquette--gauche">{texteAvant}</p>
        <p className="comparateur__etiquette comparateur__etiquette--droite">{texteApres}</p>

        <div
          className="comparateur__poignee"
          style={{ left: `${position}%` }}
          role="slider"
          tabIndex={0}
          aria-label="Comparer l’état du site avant et pendant les travaux"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)} % de l’image « ${texteAvant} » visible`}
          onKeyDown={surTouche}
        >
          <span className="comparateur__trait" aria-hidden="true" />
          <span className="comparateur__prise" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 6 L4 12 L9 18 M15 6 L20 12 L15 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <p className="comparateur__mode-emploi">
        Faites glisser la poignée, ou donnez-lui le focus au clavier puis
        utilisez <kbd>←</kbd> <kbd>→</kbd>. La description complète des deux
        états est lue par les lecteurs d’écran.
      </p>
      <p className="lecteur-seul">
        Avant les travaux : {descriptionAvant}. Pendant les travaux :{' '}
        {descriptionApres}.
      </p>
    </div>
  );
}
