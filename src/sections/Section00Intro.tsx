/**
 * SECTION 00 -- INTRO SCRUBEE.
 *
 * Plein ecran. Une sequence d'images extraite d'une video aerienne est dessinee
 * dans un <canvas> ; la progression pilote l'index de l'image. On plonge depuis
 * l'ocean vers la cote saharienne.
 *
 * Mode recit        : la progression vient du scroll (section haute + interieur
 *                     colle en haut).
 * Mode presentation : chaque appui fait defiler un bloc d'images, ce qui produit
 *                     le meme effet sans dependre du scroll.
 *
 * prefers-reduced-motion : on se cale directement sur l'image finale de chaque
 * etape, sans balayage. La sequence des etapes reste complete.
 */

import { useEffect, useRef } from 'react';
import { CanvasSequence } from '../components/CanvasSequence';
import { useFrameSequence } from '../hooks/useFrameSequence';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useEtape, usePresentation, etatCouche } from '../hooks/usePresentation';
import { SECTIONS } from '../content/sections';
import { PRESENTATEURS, ORDRE_PRESENTATEURS } from '../content/presentateurs';
import { PROJET } from '../content/projet';
import { MENTION_IMAGES } from '../content/sources';
import { Cote } from '../components/Cote';

const IMAGES_INTRO = 152;
const INDEX = 0;

export function Section00Intro() {
  const s = SECTIONS[INDEX];
  const etape = useEtape();
  const { etat } = usePresentation();
  const recit = etat.mode === 'recit';
  const mouvementReduit = useReducedMotion();

  const piste = useRef<HTMLDivElement>(null);
  const progressionScroll = useScrollProgress(piste, { depuis: 'haut', actif: recit });

  const sequence = useFrameSequence({ dossier: 'hero', nombre: IMAGES_INTRO });

  // Mode presentation : chaque etape correspond a un bloc d'images.
  const progression = recit
    ? mouvementReduit
      ? Math.min(1, etape / Math.max(1, s.etapes.length - 1))
      : progressionScroll
    : etape / Math.max(1, s.etapes.length - 1);

  /* Le brief demande de precharger avant d'autoriser le scroll. On bloque donc
     le defilement tant que la sequence basse definition n'est pas complete --
     et on le debloque aussi en cas d'echec, pour ne jamais laisser la page
     verrouillee sur un chargement rate. */
  useEffect(() => {
    const bloquer = recit && !sequence.pret && !sequence.echec;
    document.body.classList.toggle('chargement-en-cours', bloquer);
    return () => document.body.classList.remove('chargement-en-cours');
  }, [recit, sequence.pret, sequence.echec]);

  const couche = (n: number) => etatCouche(n, etape);

  return (
    <div ref={piste} className={recit ? 'intro intro--piste' : 'intro'}>
      <div className="intro__collant">
        <div className="scrub">
          <CanvasSequence
            sequence={sequence}
            progression={progression}
            poster={`${import.meta.env.BASE_URL}frames/hero/poster.jpg`}
            alt="Vue aérienne de la côte saharienne : les dunes du Sahara tombent directement dans l’océan Atlantique."
          />
          <div className="scrub__voile" aria-hidden="true" />
        </div>

        <div className="intro__texte">
          <p className="intro__sur-titre" data-etat={couche(0)}>
            Géographie · Aménagement du territoire
          </p>

          <h1 className="intro__titre" data-etat={couche(0)}>
            Le port
            <br />
            Dakhla&nbsp;Atlantique
          </h1>

          <p className="intro__lieu" data-etat={couche(1)}>
            Site de {PROJET.site}, {PROJET.commune}, région {PROJET.region}.
            <br />
            <Cote valeur={PROJET.distanceDakhlaKm} unite="km" /> au nord de la
            ville de Dakhla, {PROJET.implantation}.
          </p>

          <ul className="intro__noms" data-etat={couche(2)}>
            {ORDRE_PRESENTATEURS.map((p) => (
              <li key={p} style={{ ['--presentateur' as string]: PRESENTATEURS[p].jeton }}>
                {PRESENTATEURS[p].nom}
              </li>
            ))}
          </ul>

          <p className="intro__question" data-etat={couche(3)}>
            Ce projet constitue-t-il un aménagement durable du territoire
            marocain&nbsp;?
          </p>

          <p className="intro__invite" data-etat={couche(4)}>
            {recit ? (
              <>
                Faites défiler pour descendre. Appuyez sur <kbd>P</kbd> pour
                passer en mode présentation.
              </>
            ) : (
              <>
                <kbd>→</kbd> pour avancer · <kbd>?</kbd> pour l’aide
              </>
            )}
          </p>
        </div>

        <p className="intro__mention">{MENTION_IMAGES}</p>
      </div>
    </div>
  );
}
