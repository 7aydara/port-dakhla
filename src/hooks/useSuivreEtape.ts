/**
 * SUIVI DE L'ETAPE COURANTE.
 *
 * Sur un videoprojecteur en 1024x768, une section longue deborde : l'element
 * dont le presentateur est justement en train de parler peut se retrouver sous
 * la ligne de flottaison. Ce hook ramene toujours dans le champ l'element
 * marque `data-suivre` qui porte l'etat « encours ».
 *
 * Le defilement se fait dans le conteneur defilant le plus proche (le .corps
 * de la section en mode presentation), jamais dans la page : l'entete de
 * section doit rester visible.
 */

import { useEffect, type RefObject } from 'react';

export function useSuivreEtape(
  conteneur: RefObject<HTMLElement | null>,
  etape: number,
): void {
  useEffect(() => {
    const noeud = conteneur.current;
    if (!noeud) return;

    const actif = noeud.querySelector<HTMLElement>('[data-suivre][data-etat="encours"]');
    if (!actif) return;

    // On attend une frame : l'element vient peut-etre d'apparaitre, sa
    // position n'est pas encore stabilisee.
    const id = requestAnimationFrame(() => {
      actif.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [conteneur, etape]);
}
