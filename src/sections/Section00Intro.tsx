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

import { useEffect, useRef, useState } from 'react';
import { CanvasSequence } from '../components/CanvasSequence';
import { useFrameSequence } from '../hooks/useFrameSequence';
import { useScrubCanvas } from '../hooks/useScrubCanvas';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useEtape, usePresentation, etatCouche } from '../hooks/usePresentation';
import { SECTIONS } from '../content/sections';
import { PROJET } from '../content/projet';
import { MENTION_IMAGES } from '../content/sources';
import { Cote } from '../components/Cote';

const IMAGES_INTRO = 72;
/** Delai au-dela duquel on rend la main quoi qu'il arrive. */
const ATTENTE_MAX = 2500;
const INDEX = 0;

export function Section00Intro() {
  const s = SECTIONS[INDEX];
  const etape = useEtape();
  const { etat } = usePresentation();
  const recit = etat.mode === 'recit';
  const mouvementReduit = useReducedMotion();

  const toile = useRef<HTMLCanvasElement>(null);
  const sequence = useFrameSequence({ dossier: 'hero', nombre: IMAGES_INTRO });

  /* La camera avance d'un mouvement franc par etape, en sortie douce, dans
     les DEUX modes. La toile ne se redessine que pendant ces mouvements :
     entre deux etapes, le defilement de la page ne lui coute rien. */
  useScrubCanvas(toile, {
    sequence,
    etape,
    nombreEtapes: s.etapes.length,
    mouvementReduit,
    // En recit, la camera se pose sur un cadrage choisi -- littoral et dunes
    // dans le meme plan -- plutot que de jouer une plongee que personne ne
    // pilote. La plongee reste au mode presentation, ou elle a un sens.
    fixe: recit ? 0.34 : undefined,
  });

  /* Le brief demande de precharger avant d'autoriser le scroll. On garde
     l'intention, pas la version litterale : attendre la sequence ENTIERE
     immobilisait la page 6,9 secondes. On n'attend plus que la premiere passe
     -- neuf images -- et une echeance rend la main quoi qu'il arrive, pour ne
     jamais verrouiller la page sur un chargement qui traine. */
  const [attenteEcoulee, setAttenteEcoulee] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAttenteEcoulee(true), ATTENTE_MAX);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const bloquer = recit && !sequence.pret && !sequence.echec && !attenteEcoulee;
    document.body.classList.toggle('chargement-en-cours', bloquer);
    return () => document.body.classList.remove('chargement-en-cours');
  }, [recit, sequence.pret, sequence.echec, attenteEcoulee]);

  const couche = (n: number) => etatCouche(n, etape);

  return (
    <div className={recit ? 'intro intro--piste' : 'intro'}>
      <div className="intro__collant">
        <div className="scrub">
          <CanvasSequence
            toile={toile}
            sequence={sequence}
            poster={`${import.meta.env.BASE_URL}frames/hero/poster.jpg`}
            alt="Vue aérienne de la côte saharienne : les dunes du Sahara tombent directement dans l’océan Atlantique."
          />
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
