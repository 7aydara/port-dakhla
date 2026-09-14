/**
 * SECTION 06 -- AVANT / AUJOURD'HUI.
 *
 * Le moment le plus parlant de la presentation : on lui laisse toute la place.
 *
 * HONNETETE DES IMAGES : l'image « aujourd'hui » montre le chantier EN COURS.
 * Les vues de port acheve qui existent dans la video source ne sont pas
 * utilisees ici -- le port ne sera pas acheve avant fin 2028. Les afficher
 * comme etat actuel serait une donnee inventee.
 */

import { EnteteSection } from '../components/CadreSection';
import { Comparateur } from '../components/Comparateur';
import { Cote } from '../components/Cote';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { CHANTIER } from '../content/projet';
import { MENTION_IMAGES } from '../content/sources';

const INDEX = 6;
const BASE = import.meta.env.BASE_URL;

/** Position de la poignee imposee par chaque etape. */
const POSITIONS = [100, 55, 12, 40];

export function Section06AvantApres() {
  const etape = useEtape();
  const couche = (n: number) => etatCouche(n, etape);

  return (
    <div className="contenu contenu--large">
      <EnteteSection index={INDEX} />

      <div className="corps">
        <Comparateur
          avant={`${BASE}media/comparateur-avant.webp`}
          apres={`${BASE}media/comparateur-aujourdhui.webp`}
          texteAvant="Avant les travaux"
          texteApres="Pendant les travaux"
          descriptionAvant="une plage rectiligne du Sahara atlantique, sans aucune installation : dunes, sable et déferlantes"
          descriptionApres="le même cadrage : deux digues en enrochements dessinent un plan d’eau abrité, un terre-plein a été gagné sur la mer, et un viaduc sur piles traverse la baie artificielle"
          positionEtape={POSITIONS[Math.min(etape, POSITIONS.length - 1)]}
          cleEtape={etape}
        />

        <div className="avant-apres__lecture">
          <p className="cartouche" data-etat={couche(2)}>
            <span className="cartouche__titre">Ce qui a changé</span>
            Les digues en enrochements dessinent le plan d’eau abrité. Le
            terre-plein est gagné sur la mer. Le viaduc traverse, sur piles.{' '}
            {CHANTIER.ouvriersMention} <Cote valeur={CHANTIER.ouvriers} /> ouvriers
            travaillent ici en rotation {CHANTIER.rotation}.
          </p>

          <p className="cartouche" data-etat={couche(3)}>
            <span className="cartouche__titre">Ce que ça dit</span>
            En cinq ans, une plage déserte est devenue un chantier portuaire
            visible depuis l’espace. C’est la définition même d’un aménagement du
            territoire&nbsp;: une décision politique qui change la forme d’une côte.
          </p>
        </div>

        <p className="mention">{MENTION_IMAGES}</p>
      </div>
    </div>
  );
}
