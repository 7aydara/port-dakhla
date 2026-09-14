/**
 * SECTION 01 -- PRESENTER LE PROJET.
 * Les trois composantes apparaissent une par une, une par appui, puis
 * l'investissement et la zone industrielle.
 */

import { EnteteSection } from '../components/CadreSection';
import { Cote } from '../components/Cote';
import { useEtape, etatCouche } from '../hooks/usePresentation';
import { COMPOSANTES, PROJET, TRAFIC } from '../content/projet';
import { profondeur } from '../content/format';

const INDEX = 1;

export function Section01Projet() {
  const etape = useEtape();
  const couche = (n: number) => etatCouche(n, etape);

  return (
    <div className="contenu">
      <EnteteSection index={INDEX} />

      <div className="corps">
        <div className="composantes">
          {COMPOSANTES.map((c, i) => (
            <article key={c.cle} className="composante" data-etat={couche(i + 1)}>
              <p className="composante__rang" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </p>
              <div className="composante__corps">
                <h3 className="composante__nom">{c.nom}</h3>
                {/* Le pole de reparation navale n'a pas de profondeur
                    documentee : on n'en invente pas une, on n'affiche rien. */}
                {c.profondeurM !== undefined && (
                  <p className="composante__profondeur">
                    <Cote valeur={c.profondeurM} format="profondeur" taille="grand" />
                    <span className="composante__glose">de tirant d’eau</span>
                  </p>
                )}
                <p className="composante__texte">{c.description}</p>
                <p className="composante__quai">
                  <span className="en-mer">Quai</span> ·{' '}
                  <Cote valeur={c.quaiM} unite="m" />
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="bandeau-chiffres" data-etat={couche(4)}>
          <p className="bandeau-chiffres__item">
            <Cote valeur={PROJET.investissementMilliardsDh} taille="geant" nuance="près de" />
            <span className="bandeau-chiffres__glose">
              milliards de dirhams d’investissement
            </span>
          </p>
          <p className="bandeau-chiffres__item">
            <Cote valeur={PROJET.zoneIndustrielleHa} unite="ha" taille="geant" />
            <span className="bandeau-chiffres__glose">
              de zone industrielle et logistique, en arrière du port
            </span>
          </p>
          {/* Trafic attendu a la mise en service. C'est la raison d'etre
              chiffree de l'ouvrage : sans elle, les dimensions ne disent rien. */}
          <div className="trafic">
            <p className="trafic__titre">Trafic attendu, par an</p>
            <ul className="trafic__liste">
              {TRAFIC.map((t) => (
                <li key={t.cle}>
                  <Cote valeur={t.valeur} taille="grand" />
                  <span className="trafic__unite">{t.unite}</span>
                  <span className="trafic__glose">{t.libelle}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="bandeau-chiffres__texte">
            Maîtrise d’ouvrage&nbsp;: {PROJET.maitreOuvrage}. Travaux confiés au
            groupement {PROJET.groupement}. Les profondeurs de{' '}
            {profondeur(16)} et {profondeur(12)} sont ce qui distingue ce port de
            tous les équipements existants de la façade atlantique sud.
          </p>
        </div>
      </div>
    </div>
  );
}
