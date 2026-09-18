/**
 * SURFACE DE DESSIN.
 *
 * Ce composant ne dessine rien lui-meme et ne connait pas le scroll : il
 * expose une toile, un indicateur de chargement discret et l'image fixe de
 * repli. Le dessin est pilote en imperatif par useScrubCanvas, hors de React,
 * pour qu'aucun mouvement ne declenche de re-rendu.
 */

import type { RefObject } from 'react';
import type { Sequence } from '../hooks/useFrameSequence';

interface ProprietesCanvas {
  readonly toile: RefObject<HTMLCanvasElement>;
  readonly sequence: Sequence;
  readonly poster: string;
  readonly alt: string;
}

export function CanvasSequence({ toile, sequence, poster, alt }: ProprietesCanvas) {
  // Repli : si la sequence n'a pas pu etre chargee, on affiche l'image fixe
  // et le reste du site continue de fonctionner normalement.
  if (sequence.echec) {
    return <img src={poster} alt={alt} className="scrub__poster" />;
  }

  return (
    <>
      <canvas ref={toile} className="scrub__canvas" role="img" aria-label={alt} />
      {!sequence.pret && (
        <div className="chargement" role="status">
          <span className="chargement__texte">Chargement</span>
          <span className="chargement__jauge" aria-hidden="true">
            <span
              className="chargement__remplissage"
              style={{ transform: `scaleX(${Math.max(0.04, sequence.progression)})` }}
            />
          </span>
          <span className="lecteur-seul">
            {Math.round(sequence.progression * 100)} pour cent chargés
          </span>
        </div>
      )}
    </>
  );
}
