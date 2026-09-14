/**
 * CANVAS DE SCRUB.
 *
 * Dessine une sequence d'images preparee par useFrameSequence. L'index de
 * l'image vient de l'exterieur : au scroll en mode recit, par pas discrets en
 * mode presentation. Le composant lui-meme ne connait pas le mode -- il ne
 * fait que dessiner.
 *
 * Repli : si la sequence n'a pas pu etre chargee, on affiche l'image fixe
 * (poster) et le reste du site continue de fonctionner normalement.
 */

import { useEffect, useRef } from 'react';
import type { Sequence } from '../hooks/useFrameSequence';

interface ProprietesCanvas {
  readonly sequence: Sequence;
  /** Progression 0 -> 1 dans la sequence. */
  readonly progression: number;
  /** Image fixe de repli. */
  readonly poster: string;
  readonly alt: string;
}

export function CanvasSequence({ sequence, progression, poster, alt }: ProprietesCanvas) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const demande = useRef(0);

  // Le dessin passe par requestAnimationFrame : on ne dessine jamais plus
  // d'une fois par rafraichissement, meme si la progression change souvent.
  useEffect(() => {
    if (sequence.echec) return;
    cancelAnimationFrame(demande.current);
    const index = Math.round(progression * (sequence.nombre - 1));
    demande.current = requestAnimationFrame(() => {
      sequence.dessiner(canvas.current, index);
    });
    return () => cancelAnimationFrame(demande.current);
  }, [progression, sequence]);

  // Redessine quand la fenetre change de taille : le cadrage « cover » est
  // calcule a la main, il doit etre recalcule.
  useEffect(() => {
    if (sequence.echec) return;
    const surRedimension = () => {
      const index = Math.round(progression * (sequence.nombre - 1));
      sequence.dessiner(canvas.current, index);
    };
    window.addEventListener('resize', surRedimension);
    return () => window.removeEventListener('resize', surRedimension);
  }, [progression, sequence]);

  if (sequence.echec) {
    return <img src={poster} alt={alt} className="scrub__poster" />;
  }

  return (
    <>
      <canvas ref={canvas} className="scrub__canvas" role="img" aria-label={alt} />
      {!sequence.pret && (
        <div className="chargement" role="status">
          <span className="chargement__texte">Chargement de la séquence</span>
          <span className="chargement__jauge" aria-hidden="true">
            <span
              className="chargement__remplissage"
              style={{ transform: `scaleX(${sequence.progression})` }}
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
