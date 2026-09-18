/**
 * ETAPE PILOTEE PAR LE SCROLL (mode recit).
 *
 * L'ancienne version renvoyait une progression CONTINUE et la stockait dans un
 * etat React. Chaque image de defilement declenchait donc un re-rendu de toute
 * la section : mesure faite, environ 18 mutations du DOM par image, 13 images
 * par seconde, 89 % de frames perdues.
 *
 * Or les sections n'ont pas besoin d'une progression continue : elles ont
 * besoin d'un NUMERO D'ETAPE, un entier. Ce hook ne reveille donc React que
 * lorsque cet entier change -- au plus une fois par etape, contre soixante
 * fois par seconde auparavant.
 *
 * L'intro, qui a besoin d'une valeur continue pour son canvas, ne passe pas
 * par ici : elle lit la position de defilement en imperatif (useScrubCanvas).
 *
 * Choix assume : pas de GSAP ScrollTrigger. Le site est pilote par un index
 * d'etape, pas par une tete de lecture ; brancher un index discret sur une
 * timeline reviendrait a lui disputer son playhead a chaque appui.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Marges de course : la premiere etape reste lisible avant l'arrivee de la
 *  suivante, et la derniere ne disparait pas aussitot. */
const DEBUT = 0.12;
const AMPLITUDE = 0.62;

function etapeVisee(noeud: HTMLElement, nombreEtapes: number): number {
  if (nombreEtapes <= 1) return 0;
  const r = noeud.getBoundingClientRect();
  const h = window.innerHeight;
  const course = r.height + h;
  const parcouru = h - r.top;
  const brut = Math.min(1, Math.max(0, parcouru / course));
  const utile = Math.min(1, Math.max(0, (brut - DEBUT) / AMPLITUDE));
  return Math.min(nombreEtapes - 1, Math.floor(utile * nombreEtapes));
}

export function useEtapeAuScroll(
  cible: RefObject<HTMLElement | null>,
  nombreEtapes: number,
  actif = true,
): number {
  const [etape, setEtape] = useState(0);
  const derniere = useRef(0);

  useEffect(() => {
    const noeud = cible.current;
    if (!noeud || !actif) return;

    let visible = false;
    let planifie = 0;

    const evaluer = () => {
      planifie = 0;
      const e = etapeVisee(noeud, nombreEtapes);
      // Le seul point ou React est reveille.
      if (e !== derniere.current) {
        derniere.current = e;
        setEtape(e);
      }
    };

    // Un ecouteur passif suffit : on ne cherche pas une valeur continue, juste
    // le moment ou l'entier change. Pas de boucle rAF permanente.
    const surScroll = () => {
      if (!visible || planifie) return;
      planifie = requestAnimationFrame(evaluer);
    };

    const observateur = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) surScroll();
        else {
          // Valeur de bord : section depassee = toutes les etapes acquises.
          const r = noeud.getBoundingClientRect();
          const e2 = r.top > 0 ? 0 : nombreEtapes - 1;
          if (e2 !== derniere.current) { derniere.current = e2; setEtape(e2); }
        }
      },
      { threshold: 0 },
    );
    observateur.observe(noeud);

    window.addEventListener('scroll', surScroll, { passive: true });
    window.addEventListener('resize', surScroll, { passive: true });
    surScroll();

    return () => {
      observateur.disconnect();
      window.removeEventListener('scroll', surScroll);
      window.removeEventListener('resize', surScroll);
      cancelAnimationFrame(planifie);
    };
  }, [cible, nombreEtapes, actif]);

  return etape;
}
