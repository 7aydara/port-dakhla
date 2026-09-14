/**
 * SECTION 07 -- CONCLUSION.
 * La problematique, puis deux arguments et deux limites, reveles un par un.
 * Chaque bloc porte le nom de celui qui le presente : la repartition orale est
 * lisible a l'ecran, ce qui evite les flottements le jour de l'oral.
 */

import { useRef } from 'react';
import { EnteteSection } from '../components/CadreSection';
import { useSuivreEtape } from '../hooks/useSuivreEtape';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { BLOCS, PROBLEMATIQUE } from '../content/conclusion';
import { PRESENTATEURS } from '../content/presentateurs';

const INDEX = 7;

export function Section07Conclusion() {
  const etape = useEtape();
  const corps = useRef<HTMLDivElement>(null);
  useSuivreEtape(corps, etape);

  const pour = BLOCS.filter((b) => b.sens === 'pour');
  const limites = BLOCS.filter((b) => b.sens === 'limite');

  /** L'index d'etape d'un bloc : 0 = la question, puis les blocs dans l'ordre. */
  const rang = (id: string) => BLOCS.findIndex((b) => b.id === id) + 1;

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps" ref={corps}>
        <p className="problematique" data-etat={etatCouche(0, etape)}>
          {PROBLEMATIQUE}
        </p>

        <div className="balance">
          <section className="balance__plateau" data-sens="pour" aria-label="Arguments pour">
            <h3 className="balance__titre">Ce qui plaide pour</h3>
            {pour.map((b) => (
              <article key={b.id} className="argument" data-suivre data-etat={etatCouche(rang(b.id), etape)}>
                <p
                  className="argument__par"
                  style={{ ['--presentateur' as string]: PRESENTATEURS[b.par].jeton }}
                >
                  {PRESENTATEURS[b.par].nom}
                </p>
                <h4 className="argument__titre">{b.titre}</h4>
                <p className="argument__texte">{b.texte}</p>
              </article>
            ))}
          </section>

          <section className="balance__plateau" data-sens="limite" aria-label="Limites">
            <h3 className="balance__titre">Ce qui reste en suspens</h3>
            {limites.map((b) => (
              <article key={b.id} className="argument" data-suivre data-etat={etatCouche(rang(b.id), etape)}>
                <p
                  className="argument__par"
                  style={{ ['--presentateur' as string]: PRESENTATEURS[b.par].jeton }}
                >
                  {PRESENTATEURS[b.par].nom}
                </p>
                <h4 className="argument__titre">{b.titre}</h4>
                <p className="argument__texte">{b.texte}</p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
