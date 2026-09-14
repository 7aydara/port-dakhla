/**
 * RATTRAPAGE INSTANTANE.
 *
 * Exigence du brief : « si on appuie pendant une animation, elle se termine
 * instantanement et la suivante demarre ».
 *
 * Le probleme : une couche qui passe de « en cours » a « acquise » ne change
 * pas de valeurs CSS cibles (les deux etats sont opacite 1, sans decalage).
 * Sa transition en cours continuerait donc tranquillement sa course. Il faut
 * l'annuler explicitement.
 *
 * La seule methode fiable dans tous les navigateurs est de poser
 * `transition: none` en style inline, de forcer un reflow -- ce qui fige
 * l'element a sa valeur cible -- puis de retirer le style a la frame suivante.
 * Poser seulement transition-duration a 0s ne suffit pas : d'apres la
 * specification, une transition deja lancee ignore les changements des
 * proprietes transition-*.
 */

import { useLayoutEffect, type RefObject } from 'react';

export function useRattrapage(
  conteneur: RefObject<HTMLElement | null>,
  battement: number,
): void {
  useLayoutEffect(() => {
    const noeud = conteneur.current;
    if (!noeud) return;

    // Seules les couches deja depassees sautent a leur etat final.
    // La couche en cours, elle, doit s'animer normalement.
    // On vise la couche elle-meme ET tous ses descendants : un trace SVG anime
    // son stroke-dashoffset sur un <path> enfant du <g> qui porte data-etat,
    // et couper la transition du parent ne couperait pas celle de l'enfant.
    const acquises = noeud.querySelectorAll<HTMLElement | SVGElement>(
      '[data-etat="acquis"], [data-etat="acquis"] *',
    );
    if (acquises.length === 0) return;

    acquises.forEach((el) => {
      el.style.setProperty('transition', 'none');
    });

    // Reflow : le navigateur applique immediatement les valeurs cibles.
    void noeud.offsetHeight;

    const id = requestAnimationFrame(() => {
      acquises.forEach((el) => {
        el.style.removeProperty('transition');
      });
    });
    return () => cancelAnimationFrame(id);
  }, [conteneur, battement]);
}
