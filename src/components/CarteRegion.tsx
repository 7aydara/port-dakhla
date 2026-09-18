/**
 * LA CARTE DE LA REGION -- carte reelle, plus schema dessine a la main.
 *
 * Elle remplace le schema de principe que j'avais trace : celui-ci approchait
 * la relation spatiale, celle-ci la montre. N'Tireft y est nommee, au nord de
 * Dakhla, sur la cote atlantique ouverte ; Dakhla est sur sa presqu'ile, qui
 * ferme la baie. C'est exactement ce que dit le dossier, et on le VOIT.
 *
 * POSITIONS MESUREES, pas estimees : les deux reperes ont ete releves au pixel
 * sur la carte d'origine, puis convertis en pourcentages du cadrage.
 * L'echelle en decoule -- la distance Dakhla / N'Tireft valant 40 km d'apres
 * le dossier, un pixel vaut 110 m. Verification croisee : a cette echelle, la
 * presqu'ile de Dakhla mesure une trentaine de kilometres, ce qui correspond.
 * Le chiffre du dossier tient.
 */

import { MARQUEURS_REGION, ECHELLE_REGION } from '../content/localisation';
import { PROJET } from '../content/projet';

interface Proprietes {
  /** Le repere du site est-il visible ? */
  readonly site: boolean;
}

export function CarteRegion({ site }: Proprietes) {
  const { ntireft, dakhla } = MARQUEURS_REGION;

  return (
    <figure className="region">
      <div className="region__cadre">
        <img
          src={`${import.meta.env.BASE_URL}media/carte-region.webp`}
          alt="Carte de la région de Dakhla. N'Tireft se trouve sur la côte atlantique ouverte, au nord ; la ville de Dakhla est installée sur la presqu’île qui ferme la baie, au sud-ouest."
          className="region__image"
        />

        {/* Cotation entre les deux points : c'est elle qui porte les 40 km. */}
        <svg className="region__cotation" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line
            x1={dakhla.x} y1={dakhla.y} x2={ntireft.x} y2={ntireft.y}
            className="region__trait"
            vectorEffect="non-scaling-stroke"
            data-etat={site ? 'encours' : 'futur'}
          />
        </svg>

        {/* Pas de libelle : la carte ecrit deja « Dakhla » juste a cote. */}
        <span
          className="region__repere region__repere--ville"
          style={{ left: `${dakhla.x}%`, top: `${dakhla.y}%` }}
        />

        <span
          className="region__repere region__repere--site"
          data-etat={site ? 'encours' : 'futur'}
          style={{ left: `${ntireft.x}%`, top: `${ntireft.y}%` }}
        >
          <span className="region__nom region__nom--site">le port</span>
        </span>

        <span
          className="region__distance"
          data-etat={site ? 'encours' : 'futur'}
          style={{
            left: `${(dakhla.x + ntireft.x) / 2}%`,
            top: `${(dakhla.y + ntireft.y) / 2}%`,
          }}
        >
          ≈ {PROJET.distanceDakhlaKm} km
        </span>

        {/* Echelle graphique, deduite de la distance mesuree. */}
        <span className="region__echelle" aria-hidden="true">
          <span className="region__regle" style={{ width: `${ECHELLE_REGION.dixKmEnPourcent}%` }} />
          <span className="region__regle-texte">10 km</span>
        </span>
      </div>

      <figcaption className="region__legende">
        La ville tient dans sa baie ; le port se construit <b>hors de la baie</b>,
        sur la côte ouverte. Fond de carte&nbsp;: © les contributeurs
        d’OpenStreetMap.
      </figcaption>
    </figure>
  );
}
