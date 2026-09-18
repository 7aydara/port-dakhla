/**
 * CADRE DE SECTION.
 *
 * C'est ici que les deux modes convergent. Une section ne sait pas si elle est
 * pilotee au scroll ou au clavier : elle recoit une etape via EtapeContext et
 * s'affiche en consequence. La logique d'animation n'est donc ecrite qu'une
 * seule fois, dans les sections elles-memes.
 *
 *   mode recit        -> l'etape vient de la position de scroll de CETTE section
 *   mode presentation -> l'etape vient de l'etat global
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { EtapeContext, usePresentation } from '../hooks/usePresentation';
import { useRattrapage } from '../hooks/useRattrapage';
import { SECTIONS } from '../content/sections';

interface ProprietesCadre {
  readonly index: number;
  readonly children: ReactNode;
  /** Section sans fond ni entete standard (l'intro plein ecran). */
  readonly nu?: boolean;
}

export function CadreSection({ index, children, nu = false }: ProprietesCadre) {
  const c = usePresentation();
  const section = SECTIONS[index];
  const total = section.etapes.length;
  const recit = c.etat.mode === 'recit';
  const cadre = useRef<HTMLElement>(null);

  /* En mode recit, TOUT est visible : la page est un document, pas une scene.
     Reveler au scroll donnait des ecrans a moitie vides -- deux titres et du
     blanc -- pendant la plus grande partie de la lecture. Le devoilement pas
     a pas ne sert que l'oral, ou il a un sens : le presentateur parle sur ce
     qui vient d'apparaitre. */
  const etape = recit
    ? total - 1
    : index === c.etat.section
      ? c.etat.etape
      : index < c.etat.section
        ? total - 1
        : 0;

  // Le rattrapage se declenche sur tout changement d'etape, quel que soit le
  // mode : au scroll rapide aussi, les couches depassees sautent a leur etat.
  useRattrapage(cadre, etape + (recit ? 0 : c.etat.battement));

  /* Scrollspy : en mode recit, la section qui occupe le centre du viewport
     devient la section courante de la colonne de releve. rootMargin retire
     45 % en haut et en bas, il ne reste qu'une bande centrale : une seule
     section peut la remplir a la fois, donc aucune concurrence. */
  const centre = useRef(false);
  useEffect(() => {
    const noeud = cadre.current;
    if (!noeud || !recit) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        centre.current = e.isIntersecting;
        if (e.isIntersecting) c.aller(index, 0);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    obs.observe(noeud);
    return () => obs.disconnect();
  }, [recit, index, c]);



  return (
    <EtapeContext.Provider value={etape}>
      <section
        ref={cadre}
        id={`section-${section.id}`}
        className={nu ? 'section section--nu' : 'section'}
        aria-label={`${section.numero} — ${section.titre}`}
        data-section={section.id}
      >
        {children}
      </section>
    </EtapeContext.Provider>
  );
}

/** Entete standard : numero, titre, chapo. Absent de l'intro. */
export function EnteteSection({ index }: { readonly index: number }) {
  const s = SECTIONS[index];
  return (
    <header className="section__entete">
      <p className="section__numero">
        {s.numero} <span aria-hidden="true">──</span>{' '}
        <span className="lecteur-seul">Section </span>
      </p>
      <h2 className="section__titre">{s.titre}</h2>
      {s.chapo && <p className="section__chapo">{s.chapo}</p>}
    </header>
  );
}
