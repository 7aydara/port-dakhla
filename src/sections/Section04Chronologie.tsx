/**
 * SECTION 04 -- CHRONOLOGIE.
 *
 * Une frise horizontale portant les quinze dates a leur position REELLE dans
 * le temps (l'axe est proportionnel : on voit les cinq annees d'etudes, puis
 * l'acceleration de 2026). Les quatre dates cles sont plus hautes et nommees.
 *
 * Le detail ne s'affiche PAS en bulles empilees sur la frise -- a quinze dates
 * dont sept concentrees sur 2024-2026, elles se recouvriraient et deviendraient
 * illisibles au videoprojecteur. Il s'affiche dans un panneau sous la frise :
 *   - par defaut, les jalons du palier courant ;
 *   - au survol ou au focus clavier d'un jalon, celui-la.
 *
 * La jauge d'avancement progresse le long de la frise, avec un seul
 * pourcentage affiche -- le dernier atteint -- qui se deplace et grimpe.
 */

import { useState } from 'react';
import { EnteteSection } from '../components/CadreSection';
import { Cote } from '../components/Cote';
import { useEtape } from '../hooks/usePresentation';
import {
  FRISE_DEBUT,
  FRISE_FIN,
  JALONS,
  JAUGE_AVANCEMENT,
  type Jalon,
} from '../content/chronologie';

const INDEX = 4;

/** Position d'une annee sur la frise, en pourcentage. */
const place = (position: number) =>
  ((position - FRISE_DEBUT) / (FRISE_FIN - FRISE_DEBUT)) * 100;

const ANNEES = [2016, 2018, 2020, 2022, 2024, 2026, 2028];

export function Section04Chronologie() {
  const etape = useEtape();
  const [survole, setSurvole] = useState<string | null>(null);

  const atteints = JAUGE_AVANCEMENT.filter((p) =>
    JALONS.some((j) => j.position === p.position && j.etape <= etape),
  );
  const dernier = atteints.at(-1);
  const largeurJauge = dernier ? place(dernier.position) : 0;

  // Le panneau montre le jalon survole, sinon ceux du palier courant.
  const jalonSurvole = JALONS.find((j) => j.id === survole && j.etape <= etape);
  const affiches: readonly Jalon[] = jalonSurvole
    ? [jalonSurvole]
    : JALONS.filter((j) => j.etape === etape);

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps corps--frise">
        <div className="frise">
          <div className="frise__graduation" aria-hidden="true">
            {ANNEES.map((a) => (
              <span key={a} className="frise__annee" style={{ left: `${place(a)}%` }}>
                {a}
              </span>
            ))}
          </div>

          <div className="frise__rail">
            <div
              className="frise__avancement"
              style={{ width: `${largeurJauge}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={dernier?.pourcentage ?? 0}
              aria-label="Avancement des travaux"
            />

            {/* Les points d'avancement deja atteints : de simples reperes. */}
            {atteints.slice(0, -1).map((p) => (
              <span
                key={p.libelle}
                className="frise__point"
                style={{ left: `${place(p.position)}%` }}
                aria-hidden="true"
              />
            ))}

            {/* Un seul pourcentage affiche : le dernier atteint. Il se deplace
                le long de la frise et grimpe au fil des paliers. */}
            {dernier && (
              <span className="frise__curseur" style={{ left: `${largeurJauge}%` }}>
                <Cote valeur={dernier.pourcentage} format="pourcentage" nuance={dernier.nuance} />
                <span className="frise__curseur-date">{dernier.libelle}</span>
              </span>
            )}
          </div>

          {/* Les quinze jalons, a leur position reelle. */}
          <ul className="frise__jalons">
            {JALONS.map((j) => {
              const vu = j.etape <= etape;
              return (
                <li
                  key={j.id}
                  className="frise__jalon"
                  style={{ left: `${place(j.position)}%` }}
                  data-etat={vu ? (j.etape === etape ? 'encours' : 'acquis') : 'futur'}
                  data-cle={j.cle ? 'true' : undefined}
                >
                  <button
                    type="button"
                    className="frise__bouton"
                    disabled={!vu}
                    aria-describedby="frise-detail"
                    onMouseEnter={() => setSurvole(j.id)}
                    onMouseLeave={() => setSurvole((s) => (s === j.id ? null : s))}
                    onFocus={() => setSurvole(j.id)}
                    onBlur={() => setSurvole((s) => (s === j.id ? null : s))}
                    onClick={() => setSurvole((s) => (s === j.id ? null : j.id))}
                  >
                    <span className="frise__tige" aria-hidden="true" />
                    <span className="frise__date">{j.date}</span>
                    <span className="lecteur-seul">{j.evenement}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Le detail, sous la frise : jamais superpose, donc jamais illisible. */}
        <div className="frise-detail" id="frise-detail" aria-live="polite">
          {affiches.map((j) => (
            <article key={j.id} className="jalon" data-cle={j.cle ? 'true' : undefined}>
              <p className="jalon__date">{j.date}</p>
              <p className="jalon__evenement">{j.evenement}</p>
              {j.reserve && <p className="jalon__reserve">({j.reserve})</p>}
              {j.avancement !== undefined && (
                <Cote
                  valeur={j.avancement}
                  format="pourcentage"
                  nuance={j.nuance}
                  taille="grand"
                  millesime={j.date}
                />
              )}
            </article>
          ))}
        </div>

        <p className="frise__note">
          Quinze dates, de l’annonce à la mise en service. Les quatre dates
          mises en avant portent les bascules du projet&nbsp;; les autres
          s’ouvrent au survol ou au focus clavier.
        </p>
      </div>
    </div>
  );
}
