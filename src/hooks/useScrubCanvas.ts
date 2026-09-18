/**
 * PILOTE DE LA TOILE D'INTRODUCTION.
 *
 * DECISION DE CONCEPTION, prise sur mesures.
 *
 * La premiere version collait l'image au defilement, image par image. Deux
 * problemes, l'un de performance et l'autre de fond.
 *
 * Performance : une toile plein ecran dont les pixels changent a chaque image
 * de defilement doit etre repeinte et retransmise au processeur graphique
 * soixante fois par seconde, a l'interieur d'un conteneur collant. Mesure
 * faite par ablation : masquer la toile faisait tomber les images perdues de
 * 20 % a 2 %. Plafonner la resolution et la cadence n'a fait que reduire le
 * cout, jamais le supprimer -- c'est le modele qui etait en cause.
 *
 * Fond : un survol aerien scrube sur trois hauteurs d'ecran est le geste le
 * plus commun du web actuel. Il ne sert pas le propos -- une classe de
 * geographie n'a pas besoin d'une demonstration de defilement.
 *
 * Ce qui sert le propos, c'est la PLONGEE : on descend de l'ocean vers la
 * cote. Elle est ici rendue par une suite de mouvements de camera francs, un
 * par etape, chacun interpole en sortie douce sur 850 ms. Le presentateur
 * appuie, la camera avance et se pose ; il parle sur une image stable.
 *
 * Consequence : la toile ne se redessine QUE pendant ces 850 ms, cinq fois en
 * tout. Entre deux etapes, le defilement de la page ne lui coute rien. Et le
 * mode recit et le mode presentation partagent enfin exactement le meme
 * mouvement, au lieu d'en avoir un chacun.
 */

import { useEffect, type RefObject } from 'react';
import type { Sequence } from './useFrameSequence';

interface Options {
  readonly sequence: Sequence;
  /** Etape courante : c'est elle, et elle seule, qui deplace la camera. */
  readonly etape: number;
  readonly nombreEtapes: number;
  readonly mouvementReduit: boolean;
}

/** Sortie douce : le mouvement part vite et se pose. */
const sortieDouce = (t: number) => 1 - (1 - t) ** 3;

const DUREE = 850;

export function useScrubCanvas(
  canvas: RefObject<HTMLCanvasElement>,
  { sequence, etape, nombreEtapes, mouvementReduit }: Options,
): void {
  useEffect(() => {
    const toile = canvas.current;
    if (!toile || sequence.echec) return;

    const derniereImage = Math.max(1, sequence.nombre - 1);
    const cible = nombreEtapes > 1 ? etape / (nombreEtapes - 1) : 0;

    // Position de depart : la ou la camera se trouvait deja. On la lit sur la
    // toile elle-meme, pour qu'un changement d'etape enchaine sans a-coup.
    const depuis = Number(toile.dataset.progression ?? '0');

    if (mouvementReduit) {
      toile.dataset.progression = String(cible);
      sequence.dessiner(toile, Math.round(cible * derniereImage));
      return;
    }

    let image = 0;
    let dessine = -1;
    const t0 = performance.now();

    const boucle = (t: number) => {
      const avance = Math.min(1, (t - t0) / DUREE);
      const valeur = depuis + (cible - depuis) * sortieDouce(avance);
      toile.dataset.progression = String(valeur);

      const index = Math.round(valeur * derniereImage);
      if (index !== dessine) {
        dessine = index;
        sequence.dessiner(toile, index);
      }
      // La boucle s'arrete des que le mouvement est fini : entre deux etapes,
      // la toile ne consomme rien du tout.
      if (avance < 1) image = requestAnimationFrame(boucle);
    };
    image = requestAnimationFrame(boucle);

    return () => cancelAnimationFrame(image);
  }, [canvas, sequence, etape, nombreEtapes, mouvementReduit]);

  // Redessine au redimensionnement : le cadrage « cover » est calcule a la main.
  useEffect(() => {
    const toile = canvas.current;
    if (!toile || sequence.echec) return;
    const surRedimension = () => {
      const valeur = Number(toile.dataset.progression ?? '0');
      sequence.dessiner(toile, Math.round(valeur * Math.max(1, sequence.nombre - 1)));
    };
    window.addEventListener('resize', surRedimension, { passive: true });
    return () => window.removeEventListener('resize', surRedimension);
  }, [canvas, sequence]);
}
