/**
 * ASSEMBLAGE.
 *
 * Mode recit        : toutes les sections sont empilees, le scroll les traverse.
 * Mode presentation : une seule section est montee a la fois, plein ecran.
 *
 * Dans les deux cas ce sont LES MEMES composants de section, qui lisent leur
 * etape via EtapeContext. La logique d'animation n'est ecrite qu'une fois.
 */

import { useEffect, type ReactNode } from 'react';
import { FournisseurPresentation, usePresentation } from './hooks/usePresentation';
import { useClavier } from './hooks/useClavier';
import { usePleinEcran } from './hooks/usePleinEcran';
import { CadreSection } from './components/CadreSection';
import { ColonneReleve } from './components/ColonneReleve';
import { PanneauNotes } from './components/PanneauNotes';
import { AideClavier } from './components/AideClavier';
import { SECTIONS } from './content/sections';

import { Section00Intro } from './sections/Section00Intro';
import { Section01Projet } from './sections/Section01Projet';
import { Section02Localiser } from './sections/Section02Localiser';
import { Section03Construction } from './sections/Section03Construction';
import { Section04Chronologie } from './sections/Section04Chronologie';
import { Section05Enjeux } from './sections/Section05Enjeux';
import { Section06AvantApres } from './sections/Section06AvantApres';
import { Section07Conclusion } from './sections/Section07Conclusion';
import { Section08Sources } from './sections/Section08Sources';

const VUES: readonly (() => ReactNode)[] = [
  Section00Intro,
  Section01Projet,
  Section02Localiser,
  Section03Construction,
  Section04Chronologie,
  Section05Enjeux,
  Section06AvantApres,
  Section07Conclusion,
  Section08Sources,
];

function Corps() {
  const c = usePresentation();
  const { basculer } = usePleinEcran();
  useClavier(basculer);

  const presentation = c.etat.mode === 'presentation';

  /* PRINCIPE 3 : la profondeur est la navigation. Le fond gagne une bande
     d'isobathe a chaque section. C'est une metaphore de navigation, pas une
     donnee : aucun chiffre de profondeur n'y est associe. */
  useEffect(() => {
    const p = SECTIONS.length > 1 ? c.etat.section / (SECTIONS.length - 1) : 0;
    document.documentElement.style.setProperty('--profondeur', String(p));
  }, [c.etat.section]);

  /* En mode presentation, le scroll du document est neutralise : c'est le
     clavier qui fait avancer. */
  useEffect(() => {
    document.documentElement.classList.toggle('presentation', presentation);
    return () => document.documentElement.classList.remove('presentation');
  }, [presentation]);

  const indices = presentation ? [c.etat.section] : SECTIONS.map((_, i) => i);

  return (
    <>
      <a className="evitement" href="#contenu-principal">
        Aller au contenu
      </a>

      <div className="appli" data-mode={c.etat.mode}>
        <ColonneReleve />

        <main className="planche" id="contenu-principal">
          {indices.map((i) => {
            const Vue = VUES[i];
            return (
              <CadreSection key={SECTIONS[i].id} index={i} nu={i === 0}>
                <Vue />
              </CadreSection>
            );
          })}
        </main>
      </div>

      <PanneauNotes />
      <AideClavier />

      {!presentation && (
        <button type="button" className="bouton-presentation" onClick={c.basculerMode}>
          Mode présentation <kbd>P</kbd>
        </button>
      )}
    </>
  );
}

export default function App() {
  return (
    <FournisseurPresentation>
      <Corps />
    </FournisseurPresentation>
  );
}
