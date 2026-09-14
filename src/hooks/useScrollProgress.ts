/**
 * PROGRESSION AU SCROLL.
 *
 * Remplace ScrollTrigger. Argument du choix : ScrollTrigger n'aurait servi
 * qu'a une seule chose ici -- le scrub du canvas de l'intro. Le reste du site
 * est pilote par un index d'etape, pas par une tete de lecture. Brancher un
 * index discret externe sur une timeline GSAP revient a lui disputer la
 * propriete de son playhead a chaque appui, ce qui se paie precisement sur la
 * contrainte « l'animation en cours se termine instantanement ».
 *
 * Ici : un IntersectionObserver decide QUAND mesurer, un rAF mesure. Aucune
 * mesure n'a lieu quand l'element est hors champ.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface OptionsProgression {
  /** Progression 0 quand le haut de l'element atteint le bas du viewport. */
  readonly depuis?: 'entree' | 'haut';
  /** Desactive la mesure (mode presentation). */
  readonly actif?: boolean;
}

/**
 * Renvoie 0 -> 1 selon l'avancee de l'element dans le viewport.
 * 0 = l'element commence a traverser, 1 = il a fini de traverser.
 */
export function useScrollProgress(
  cible: RefObject<HTMLElement | null>,
  { depuis = 'entree', actif = true }: OptionsProgression = {},
): number {
  const [progression, setProgression] = useState(0);
  const brut = useRef(0);

  useEffect(() => {
    const noeud = cible.current;
    if (!noeud || !actif) return;

    let visible = false;
    let image = 0;

    const mesurer = () => {
      const r = noeud.getBoundingClientRect();
      const h = window.innerHeight;

      // 'entree' : la course va de « le haut entre par le bas » a
      // « le bas sort par le haut ». 'haut' : la course va de « le haut de
      // l'element touche le haut du viewport » a « son bas le touche ».
      const course = depuis === 'entree' ? r.height + h : Math.max(1, r.height - h);
      const parcouru = depuis === 'entree' ? h - r.top : -r.top;

      const p = Math.min(1, Math.max(0, parcouru / course));
      if (Math.abs(p - brut.current) > 0.0008) {
        brut.current = p;
        setProgression(p);
      }
      if (visible) image = requestAnimationFrame(mesurer);
    };

    const observateur = new IntersectionObserver(
      ([entree]) => {
        visible = entree.isIntersecting;
        cancelAnimationFrame(image);
        if (visible) {
          image = requestAnimationFrame(mesurer);
        } else {
          // Fige la valeur de bord : 0 si l'element est en dessous, 1 au-dessus.
          const r = noeud.getBoundingClientRect();
          const p = r.top > 0 ? 0 : 1;
          brut.current = p;
          setProgression(p);
        }
      },
      { threshold: 0 },
    );

    observateur.observe(noeud);
    return () => {
      observateur.disconnect();
      cancelAnimationFrame(image);
    };
  }, [cible, depuis, actif]);

  return progression;
}

/**
 * Traduit une progression continue en index d'etape discret.
 * Les deux modes convergent ici : le clavier produit l'index directement,
 * le scroll le produit via cette fonction. La suite du code est identique.
 */
export function progressionVersEtape(progression: number, nombreEtapes: number): number {
  if (nombreEtapes <= 1) return 0;
  // Une marge en debut et en fin de course : la premiere etape reste lisible
  // avant que la deuxieme n'arrive, et la derniere ne disparait pas aussitot.
  const utile = Math.min(1, Math.max(0, (progression - 0.12) / 0.62));
  return Math.min(nombreEtapes - 1, Math.floor(utile * nombreEtapes));
}
