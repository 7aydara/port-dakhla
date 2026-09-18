/**
 * SECTION 03 -- LA CONSTRUCTION DU PORT.
 * Piece maitresse. Six couches, une par appui. A chaque couche, une legende
 * apparait sur le cote avec la dimension reelle et l'annee.
 */

import { useEffect, useRef } from 'react';
import { EnteteSection } from '../components/CadreSection';
import { SchemaPort } from '../components/SchemaPort';
import { VueChantier } from '../components/VueChantier';
import { Cote } from '../components/Cote';
import { useEtape, etatCouche, usePresentation } from '../hooks/usePresentation';
import { COUCHES } from '../content/couches';
import { CHANTIER } from '../content/projet';
import { nombre } from '../content/format';

const INDEX = 3;

export function Section03Construction() {
  const etape = useEtape();
  const { etat } = usePresentation();
  const recit = etat.mode === 'recit';
  const colonne = useRef<HTMLDivElement>(null);

  /* La legende de la couche en cours se ramene toujours dans le champ. Sans
     ca, sur un videoprojecteur en 1024x768, les deux dernieres legendes
     restent hors de vue au moment meme ou le presentateur en parle. */
  useEffect(() => {
    const liste = colonne.current;
    // En recit, rien ne defile tout seul : on lit de haut en bas.
    if (!liste || recit) return;
    // Uniquement si la colonne defile pour elle-meme : sinon scrollIntoView
    // ferait defiler toute la section et sortirait le schema du champ.
    if (liste.scrollHeight <= liste.clientHeight + 2) return;
    const active = liste.querySelector<HTMLElement>('[data-etat="encours"]');
    if (!active) return;
    const haut = active.offsetTop - liste.offsetTop;
    liste.scrollTo({
      top: Math.max(0, haut - liste.clientHeight / 2 + active.offsetHeight / 2),
      behavior: 'smooth',
    });
  }, [etape, recit]);

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps">
        <div className="schema-scene">
          <SchemaPort />

          <div className="colonne-droite">
            {/* Le plan a gauche, le site reel a droite. Ils avancent ensemble :
                la correspondance se fait par l'etape, pas par le pixel. */}
            <VueChantier etape={etape} nombreEtapes={COUCHES.length} />

            <div className="legendes" ref={colonne} data-mode={etat.mode}>
            {COUCHES.map((c, i) => {
              const etat = etatCouche(i, etape);
              return (
                <article key={c.cle} className="legende" data-etat={etat}>
                  <span className="legende__pastille" style={{ ['--teinte' as string]: c.teinte }} aria-hidden="true" />
                  <div>
                    <h3 className="legende__nom">{c.nom}</h3>

                    {c.valeur !== undefined && (
                      <Cote
                        valeur={c.valeur}
                        unite={c.unite}
                        format={c.format ?? 'brut'}
                        nuance={c.nuance}
                        taille="grand"
                        millesime={c.millesime}
                        className="legende__cote"
                      />
                    )}

                    {c.details && (
                      <ul className="legende__details">
                        {c.details.map((d) => (
                          <li key={d.nom}>
                            <span className="legende__puce" style={{ ['--teinte' as string]: d.teinte }} aria-hidden="true" />
                            <span className="en-mer">{d.nom}</span>
                            {/* Sans dimension documentee, on affiche la
                                reserve, jamais un chiffre estime. */}
                            {d.valeur !== undefined ? (
                              <Cote valeur={d.valeur} unite={d.unite} />
                            ) : (
                              <span className="legende__reserve">{d.note}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {c.valeur === undefined && !c.details && (
                      <p className="cote__millesime">{c.millesime}</p>
                    )}

                    <p className="legende__note">{c.note}</p>
                  </div>
                </article>
              );
            })}

            <p className="legendes__pied" data-etat={etatCouche(5, etape)}>
              Sur le chantier&nbsp;: {CHANTIER.ouvriersMention}{' '}
              <Cote valeur={CHANTIER.ouvriers} /> ouvriers, en rotation{' '}
              {CHANTIER.rotation}. Le remblai principal atteignait{' '}
              {nombre(44)}&nbsp;% en juin 2026.
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
