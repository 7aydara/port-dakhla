/**
 * SECTION 02 -- LOCALISER A DEUX ECHELLES.
 * La carte se recadre progressivement : Maroc, region, site. Le schema de
 * principe de la cote porte le point de geographie decisif -- le port est HORS
 * de la baie de Dakhla.
 */

import { EnteteSection } from '../components/CadreSection';
import { CarteLocalisation } from '../components/CarteLocalisation';
import { SchemaCote } from '../components/SchemaCote';
import { Cote } from '../components/Cote';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { PROJET } from '../content/projet';
import { RESERVE_COMMUNE } from '../content/localisation';

const INDEX = 2;

export function Section02Localiser() {
  const etape = useEtape();
  const couche = (n: number) => etatCouche(n, etape);

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps">
        <div className="localisation">
          <CarteLocalisation cadrage={Math.min(etape, 2)} marqueur={etape >= 2} />

          <div className="localisation__colonne">
            <SchemaCote marqueur={etape >= 2} />

            <div className="cartouche" data-etat={couche(3)}>
              <p className="cartouche__titre">Pourquoi là, et pas à Dakhla</p>
              <p>
                La baie abrite la ville mais reste peu profonde. Pour atteindre les{' '}
                <Cote valeur={16} format="profondeur" /> nécessaires aux grands
                navires, il faut sortir de la baie — donc accepter la houle de
                l’Atlantique, et la contrer par{' '}
                <Cote valeur={6700} unite="m" /> de digues.
              </p>
              <p className="localisation__reserve">{RESERVE_COMMUNE}</p>
            </div>

            <dl className="fiche" data-etat={couche(3)}>
              <div className="fiche__ligne">
                <dt>Site</dt>
                <dd>{PROJET.site}</dd>
              </div>
              <div className="fiche__ligne">
                <dt>Commune</dt>
                <dd>{PROJET.commune}</dd>
              </div>
              <div className="fiche__ligne">
                <dt>Région</dt>
                <dd>{PROJET.region}</dd>
              </div>
              <div className="fiche__ligne">
                <dt>Distance</dt>
                <dd>
                  <Cote valeur={PROJET.distanceDakhlaKm} unite="km" /> au nord de
                  Dakhla
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
