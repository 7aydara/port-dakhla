/**
 * LOCALISATION A DEUX ECHELLES.
 *
 * Une image de carte + une transformation CSS qui recadre progressivement,
 * plus un marqueur SVG positionne en coordonnees RELATIVES (pourcentages de
 * l'image). C'est plus robuste qu'une librairie cartographique et ca marche
 * hors ligne.
 *
 * Tant que le fond de carte n'est pas fourni, on affiche un repere visible
 * avec le nom du fichier attendu -- pas une image generique -- et le schema
 * de principe de la cote, qui lui repose uniquement sur des faits du dossier.
 */

import { useState } from 'react';
import { EmplacementMedia } from './EmplacementMedia';
import { CADRAGES, MARQUEUR_DAKHLA, MARQUEUR_SITE } from '../content/localisation';

interface ProprietesCarte {
  /** Index du cadrage courant (0 = Maroc, 1 = region, 2 = site). */
  readonly cadrage: number;
  /** Le marqueur est-il visible ? */
  readonly marqueur: boolean;
}

export function CarteLocalisation({ cadrage, marqueur }: ProprietesCarte) {
  const [absente, setAbsente] = useState(false);
  const c = CADRAGES[Math.min(cadrage, CADRAGES.length - 1)];

  if (absente) {
    return (
      <div className="carte carte--absente">
        {/* Un fichier absent ne doit pas occuper la moitie de l'ecran : le
            repère reste visible mais discret, et c'est le schema de principe
            de la cote qui porte l'information. */}
        <EmplacementMedia
          fichier="media/carte-maroc.webp"
          attendu="Carte du Maroc entier, nord en haut, façade atlantique bien dégagée. Largeur conseillée : 1600 px."
          ratio="21 / 6"
        />
        <p className="carte__note">
          En attendant ce fichier, le schéma de principe ci-dessous porte
          l’information : le port n’est pas dans la baie de Dakhla, il est sur
          la côte atlantique ouverte, à {MARQUEUR_SITE.distanceKm} km au nord de
          la ville.
        </p>
      </div>
    );
  }

  return (
    <figure className="carte">
      <div className="carte__hublot">
        <div
          className="carte__mobile"
          style={{
            transform: `scale(${c.zoom})`,
            transformOrigin: `${c.origineX}% ${c.origineY}%`,
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}media/carte-maroc.webp`}
            alt="Carte du Royaume du Maroc. La région de Dakhla-Oued Eddahab occupe l’extrême sud de la façade atlantique."
            className="carte__image"
            onError={() => setAbsente(true)}
          />

          {/* Les reperes sont des elements HTML positionnes en pourcentages,
              pas un SVG etire : un cercle dans un viewBox mis a l'echelle de
              facon non uniforme devient une ellipse. Le contre-cadrage
              scale(1/zoom) leur garde une taille constante a l'ecran quel que
              soit le niveau de zoom. */}
          <span
            className="carte__repere carte__repere--ville"
            style={{
              left: `${MARQUEUR_DAKHLA.x}%`,
              top: `${MARQUEUR_DAKHLA.y}%`,
              ['--contre' as string]: String(1 / c.zoom),
            }}
          >
            <span className="carte__nom">Dakhla</span>
          </span>

          <span
            className="carte__repere carte__repere--site"
            data-etat={marqueur ? 'encours' : 'futur'}
            style={{
              left: `${MARQUEUR_SITE.x}%`,
              top: `${MARQUEUR_SITE.y}%`,
              ['--contre' as string]: String(1 / c.zoom),
            }}
          >
            <span className="carte__nom carte__nom--site">Ntirift</span>
          </span>
        </div>
      </div>

      <figcaption className="carte__legende">
        {c.libelle}
        {MARQUEUR_SITE.aVerifier && (
          <span className="carte__todo">
            {' '}TODO — coordonnées exactes du site de Ntirift non documentées
            dans les sources fournies ; le repère suit la règle du dossier
            ({MARQUEUR_SITE.distanceKm} km au nord de Dakhla, côte ouverte).
          </span>
        )}
      </figcaption>
    </figure>
  );
}
