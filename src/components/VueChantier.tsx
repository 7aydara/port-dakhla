/**
 * LA VUE REELLE DU CHANTIER, accouplee au schema.
 *
 * POURQUOI PAS UNE SUPERPOSITION.
 * Le survol filme est une vue OBLIQUE, prise d'assez bas ; le schema, lui, est
 * une vue en plan. Poser l'un sur l'autre laisserait croire que les traits du
 * schema designent ce qu'on voit sur la photographie, ce qui serait faux : les
 * deux geometries ne se correspondent pas. Sur un travail de geographie, c'est
 * une faute, pas un effet.
 *
 * Les deux sont donc ACCOUPLES : ils avancent ensemble, etape par etape. A
 * gauche le plan -- comment ca s'organise ; a droite le site reel -- a quoi ca
 * ressemble. La correspondance se fait par l'etape, pas par le pixel, et le
 * site le dit.
 */

import { useRef } from 'react';
import { useFrameSequence } from '../hooks/useFrameSequence';
import { useScrubCanvas } from '../hooks/useScrubCanvas';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MENTION_IMAGES } from '../content/sources';

const IMAGES = 60;

interface Proprietes {
  readonly etape: number;
  readonly nombreEtapes: number;
}

export function VueChantier({ etape, nombreEtapes }: Proprietes) {
  const toile = useRef<HTMLCanvasElement>(null);
  const mouvementReduit = useReducedMotion();
  const sequence = useFrameSequence({ dossier: 'chantier', nombre: IMAGES, voile: false });

  useScrubCanvas(toile, { sequence, etape, nombreEtapes, mouvementReduit });

  return (
    <figure className="chantier">
      <div className="chantier__cadre">
        {sequence.echec ? (
          <p className="chantier__repli">Vue aérienne indisponible.</p>
        ) : (
          <canvas
            ref={toile}
            className="chantier__toile"
            role="img"
            aria-label="Survol aérien du chantier du port : enrochements, terre-plein gagné sur la mer et viaduc sur piles."
          />
        )}
        <p className="chantier__etiquette">Le site réel, aujourd’hui</p>
      </div>
      <figcaption className="chantier__note">
        Vue oblique : elle ne se superpose pas au plan, elle l’accompagne.{' '}
        {MENTION_IMAGES}
      </figcaption>
    </figure>
  );
}
