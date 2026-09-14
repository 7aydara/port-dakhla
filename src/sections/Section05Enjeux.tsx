/**
 * SECTION 05 -- OBJECTIFS ET DEFIS.
 *
 * Pas de grille de cartes identiques. La structure dit quelque chose du
 * contenu : les objectifs sont une LISTE NUMEROTEE qui s'allonge (une
 * programmation, un plan), tandis que les defis sont ranges sous les trois
 * piliers du developpement durable -- et la repartition, deliberement
 * asymetrique, montre que l'essentiel des defis est environnemental. C'est ce
 * desequilibre qui prepare les limites de la conclusion.
 *
 * Etapes : 0-5 les six objectifs, 6-11 les six defis.
 */

import { useRef } from 'react';
import { EnteteSection } from '../components/CadreSection';
import { useSuivreEtape } from '../hooks/useSuivreEtape';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { DEFIS, OBJECTIFS, PILIERS, type Pilier } from '../content/objectifs';

const INDEX = 5;
const PREMIER_DEFI = OBJECTIFS.length; // etape a laquelle les defis commencent
const ORDRE_PILIERS: readonly Pilier[] = ['social', 'economique', 'environnemental'];

export function Section05Enjeux() {
  const etape = useEtape();
  const auxDefis = etape >= PREMIER_DEFI;
  const corps = useRef<HTMLDivElement>(null);
  useSuivreEtape(corps, etape);

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps" ref={corps}>
        <div className="enjeux" data-volet={auxDefis ? 'defis' : 'objectifs'}>
          {/* ---- Les objectifs : une programmation qui s'allonge ------------- */}
          <section className="enjeux__volet" aria-label="Objectifs annoncés">
            <h3 className="enjeux__titre">
              Six objectifs annoncés
            </h3>
            <ol className="objectifs">
              {OBJECTIFS.map((o, i) => (
                <li key={o.id} className="objectif" data-suivre data-etat={etatCouche(i, etape)}>
                  <span className="objectif__rang" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="objectif__titre">{o.titre}</h4>
                    <p className="objectif__detail">{o.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---- Les defis, ranges sous les trois piliers -------------------- */}
          <section className="enjeux__volet" aria-label="Défis à relever">
            <h3 className="enjeux__titre">
              Six défis, trois piliers
            </h3>

            <div className="piliers">
              {ORDRE_PILIERS.map((p) => {
                const defis = DEFIS.filter((d) => d.pilier === p);
                return (
                  <section key={p} className="pilier" data-pilier={p}>
                    <header className="pilier__entete">
                      <h4 className="pilier__nom">{PILIERS[p].nom}</h4>
                      <p className="pilier__glose">{PILIERS[p].glose}</p>
                      <span className="pilier__compte" aria-hidden="true">
                        {defis.length}
                      </span>
                    </header>

                    <ul className="pilier__liste">
                      {defis.map((d) => {
                        const rang = PREMIER_DEFI + DEFIS.indexOf(d);
                        return (
                          <li key={d.id} className="defi" data-suivre data-etat={etatCouche(rang, etape)}>
                            <h5 className="defi__titre">{d.titre}</h5>
                            <p className="defi__detail">{d.detail}</p>
                            {d.aussi && (
                              <p className="defi__aussi">
                                relève aussi du pilier {PILIERS[d.aussi].nom.toLowerCase()}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>

            <p className="enjeux__lecture" data-suivre data-etat={etatCouche(DEFIS.length + PREMIER_DEFI - 1, etape)}>
              La moitié des défis relèvent du pilier environnemental. C’est
              exactement là que se jouera la durabilité du projet.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
