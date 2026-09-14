/**
 * PILOTAGE CLAVIER.
 *
 * Trois exigences du brief, traitees ici :
 *
 * 1. « Une touche = une etape. Pas de double declenchement. »
 *    -> un seul ecouteur, sur keydown uniquement (jamais keypress), et les
 *       repetitions automatiques (touche maintenue) sont ignorees. Un
 *       presentateur qui s'appuie sur la barre d'espace n'enchaine pas
 *       quinze etapes.
 *
 * 2. « Pas d'etape sautee si on appuie vite. »
 *    -> aucun anti-rebond, aucun verrou, aucune file. Chaque appui envoie
 *       immediatement son action au reducteur, qui les applique en sequence.
 *       Rien ne peut etre perdu.
 *
 * 3. « Pas de dependance a la souris pendant l'oral. »
 *    -> toutes les commandes sont ici, et les elements interactifs qui ont
 *       besoin des fleches (le comparateur) portent data-clavier-local : on
 *       leur laisse alors la main sur les fleches horizontales uniquement.
 */

import { useEffect } from 'react';
import { usePresentation } from './usePresentation';
import { SECTIONS } from '../content/sections';

/** Le champ a-t-il besoin du clavier pour lui-meme ? */
function saisieEnCours(cible: EventTarget | null): boolean {
  if (!(cible instanceof HTMLElement)) return false;
  const t = cible.tagName;
  return (
    t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || cible.isContentEditable
  );
}

/** L'element gere-t-il lui-meme les fleches horizontales ? */
function clavierLocal(cible: EventTarget | null): boolean {
  return cible instanceof HTMLElement && cible.closest('[data-clavier-local]') !== null;
}

export function useClavier(basculerPleinEcran: () => void) {
  const c = usePresentation();

  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      // Un raccourci systeme ou navigateur n'est jamais intercepte.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (saisieEnCours(e.target)) return;
      // Repetition automatique : ignoree (exigence 1).
      if (e.repeat) return;

      const presentation = c.etat.mode === 'presentation';

      // L'aide se ferme sur n'importe quelle touche, et la touche est consommee.
      if (c.etat.aide && e.key !== 'F5') {
        e.preventDefault();
        c.basculerAide(false);
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Spacebar':
        case 'PageDown':
          if (e.key === 'ArrowRight' && clavierLocal(e.target)) return;
          e.preventDefault();
          c.suivant();
          return;

        case 'ArrowLeft':
        case 'PageUp':
          if (e.key === 'ArrowLeft' && clavierLocal(e.target)) return;
          e.preventDefault();
          c.precedent();
          return;

        case 'ArrowDown':
          if (!presentation) return; // en mode recit, le scroll reste au scroll
          e.preventDefault();
          c.sectionSuivante();
          return;

        case 'ArrowUp':
          if (!presentation) return;
          e.preventDefault();
          c.sectionPrecedente();
          return;

        case 'Home':
          e.preventDefault();
          c.aller(0, 0);
          return;

        case 'End':
          e.preventDefault();
          c.aller(SECTIONS.length - 1, 0);
          return;

        case 'Escape':
          if (presentation) {
            e.preventDefault();
            c.quitterPresentation();
          }
          return;
      }

      const t = e.key.toLowerCase();

      // 1 a 9 : saut direct a une section.
      if (t >= '1' && t <= '9') {
        const index = Number(t) - 1;
        if (index < SECTIONS.length) {
          e.preventDefault();
          c.aller(index, 0);
        }
        return;
      }

      switch (t) {
        case 'p':
          e.preventDefault();
          c.basculerMode();
          return;
        case 'n':
          e.preventDefault();
          c.basculerNotes();
          return;
        case 'f':
          e.preventDefault();
          basculerPleinEcran();
          return;
        case 'c':
          // Assurance materielle : remonte le contraste si la salle est claire
          // ou le videoprojecteur fatigue.
          e.preventDefault();
          document.documentElement.dataset.contraste =
            document.documentElement.dataset.contraste === 'fort' ? '' : 'fort';
          return;
        case 't':
          e.preventDefault();
          c.basculerChrono();
          return;
        case '?':
        case 'h':
          e.preventDefault();
          c.basculerAide();
          return;
      }
    }

    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [c, basculerPleinEcran]);
}
