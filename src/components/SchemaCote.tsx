/**
 * SCHEMA DE PRINCIPE DE LA COTE.
 *
 * Il ne repose que sur des faits du dossier : il existe une baie de Dakhla, la
 * ville y est installee, et le port se construit a environ 40 km au NORD, sur
 * la cote atlantique ouverte -- pas dans la baie. C'est precisement le point de
 * geographie de la section, et une erreur de localisation coute cher.
 *
 * Aucune coordonnee n'est affichee : le schema montre une RELATION spatiale,
 * pas une position absolue.
 */

import { MARQUEUR_SITE } from '../content/localisation';
import { PROJET } from '../content/projet';

interface ProprietesSchemaCote {
  readonly marqueur: boolean;
}

export function SchemaCote({ marqueur }: ProprietesSchemaCote) {
  return (
    <figure className="schema-cote">
      <svg viewBox="0 0 520 420" role="img" aria-labelledby="cote-titre" className="schema-cote__svg">
        <title id="cote-titre">
          Schéma de principe : la ville de Dakhla est installée dans sa baie ; le
          site portuaire de Ntirift se trouve environ {MARQUEUR_SITE.distanceKm}{' '}
          kilomètres plus au nord, sur la côte atlantique ouverte.
        </title>

        {/* Terre a droite, ocean a gauche. */}
        <path
          d="M 300,0 C 286,60 292,110 300,150 C 250,168 210,196 214,232 C 218,272 268,288 322,276 C 352,268 360,300 352,340 C 344,382 358,404 372,420 L 520,420 L 520,0 Z"
          className="schema-cote__terre"
        />
        <path
          d="M 300,0 C 286,60 292,110 300,150 C 250,168 210,196 214,232 C 218,272 268,288 322,276 C 352,268 360,300 352,340 C 344,382 358,404 372,420"
          className="schema-cote__trait"
        />

        <text x="96" y="60" className="schema-cote__mer">OCÉAN</text>
        <text x="96" y="84" className="schema-cote__mer">ATLANTIQUE</text>

        {/* La baie : c'est elle qui explique tout le projet. */}
        <text x="268" y="228" className="schema-cote__nom">baie de Dakhla</text>
        <circle cx="316" cy="252" r="5" className="schema-cote__ville" />
        <text x="330" y="257" className="schema-cote__nom schema-cote__nom--terre">
          Dakhla
        </text>

        {/* Le site, au nord, sur la cote ouverte. */}
        <g data-etat={marqueur ? 'encours' : 'futur'}>
          <circle cx="296" cy="104" r="6.5" className="schema-cote__site" />
          <circle cx="296" cy="104" r="14" className="schema-cote__site-halo" />
          <text x="314" y="100" className="schema-cote__nom schema-cote__nom--site">
            {PROJET.site}
          </text>
          <text x="314" y="120" className="schema-cote__nom schema-cote__nom--site">
            port Dakhla Atlantique
          </text>

          {/* La distance, cotee comme sur un plan. */}
          <line x1="248" y1="104" x2="248" y2="252" className="schema-cote__cotation" />
          <line x1="240" y1="104" x2="256" y2="104" className="schema-cote__cotation" />
          <line x1="240" y1="252" x2="256" y2="252" className="schema-cote__cotation" />
          <text x="238" y="182" textAnchor="end" className="schema-cote__distance">
            ≈ {MARQUEUR_SITE.distanceKm} km
          </text>
          <text x="238" y="202" textAnchor="end" className="schema-cote__distance schema-cote__distance--petit">
            vers le nord
          </text>
        </g>

        <g transform="translate(468, 44)" aria-hidden="true">
          <path d="M 0,-22 L 6,8 L 0,2 L -6,8 Z" className="schema-cote__nord" />
          <text x="0" y="26" textAnchor="middle" className="schema-cote__nord-lettre">N</text>
        </g>
      </svg>
      <figcaption className="schema__legende-figure">
        Schéma de principe, non à l’échelle. Il montre une relation spatiale —
        le port est hors de la baie — et non des positions exactes.
      </figcaption>
    </figure>
  );
}
