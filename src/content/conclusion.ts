/**
 * Conclusion : la problematique, deux arguments, deux limites.
 * La repartition orale suit le brief -- Zayd prend le premier argument,
 * Fahd le second, Rayan les limites et les remerciements.
 */

import type { Presentateur } from './presentateurs';

export const PROBLEMATIQUE =
  'Ce projet constitue-t-il un aménagement durable du territoire marocain ?';

export interface Bloc {
  readonly id: string;
  readonly sens: 'pour' | 'limite';
  readonly titre: string;
  readonly texte: string;
  readonly par: Presentateur;
}

export const BLOCS: readonly Bloc[] = [
  {
    id: 'pour-planification',
    sens: 'pour',
    titre: 'Une planification à long terme qui réduit les inégalités',
    texte:
      "Le port n’est pas un équipement isolé : il s’inscrit dans un modèle de développement annoncé en 2015, avec la voie express, la zone industrielle et le raccordement routier. Cette cohérence relève du pilier social du développement durable.",
    par: 'zayd',
  },
  {
    id: 'pour-transformation',
    sens: 'pour',
    titre: 'La transformation locale plutôt que l’exportation brute',
    texte:
      "Valoriser le poisson bord à quai retient la valeur ajoutée dans la région, au lieu de l’expédier ailleurs. Le projet s’accompagne de dessalement et d’énergies renouvelables.",
    par: 'fahd',
  },
  {
    id: 'limite-littoral',
    sens: 'limite',
    titre: 'Un chantier lourd en mer modifie durablement le littoral',
    texte:
      "Digues, remblais et terre-plein déplacent les sédiments. Les risques de sédimentation et d’ensablement sont réels et engagent le littoral bien au-delà de la durée du chantier.",
    par: 'rayan',
  },
  {
    id: 'limite-gestion',
    sens: 'limite',
    titre: 'La durabilité réelle dépendra de la gestion, pas de l’ouvrage',
    texte:
      "Dans une région désertique fragile, tout se jouera sur la gestion de la pêche et celle de l’eau. L’infrastructure crée la possibilité ; elle ne garantit pas la durabilité.",
    par: 'rayan',
  },
];

export const REMERCIEMENTS = 'Merci de votre attention.';
