/**
 * SECTION 08 -- SOURCES. Sobre.
 * Les liens sont cliquables mais ne sont jamais charges par le site : la
 * contrainte hors ligne interdit toute requete au runtime.
 */

import { EnteteSection } from '../components/CadreSection';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { SOURCES } from '../content/sources';
import { LEXIQUE } from '../content/lexique';
import { REMERCIEMENTS } from '../content/conclusion';

const INDEX = 8;

export function Section08Sources() {
  const etape = useEtape();

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps">
        <div className="sources" data-etat={etatCouche(0, etape)}>
          <ol className="sources__liste">
            {SOURCES.map((s) => (
              <li key={s.id} className="source">
                <p className="source__organe">
                  {s.organe} <span className="source__date">· {s.date}</span>
                </p>
                <a href={s.url} target="_blank" rel="noreferrer noopener" className="source__lien">
                  {s.titre}
                </a>
                <p className="source__url">{s.url}</p>
              </li>
            ))}
          </ol>

          <aside className="lexique">
            <h3 className="cartouche__titre">Lexique</h3>
            <dl className="lexique__liste">
              {LEXIQUE.map((t) => (
                <div key={t.mot} className="lexique__entree">
                  <dt>{t.mot}</dt>
                  <dd>{t.definition}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <footer className="fin" data-etat={etatCouche(1, etape)}>
          <p className="fin__merci">{REMERCIEMENTS}</p>
          </footer>
      </div>
    </div>
  );
}
