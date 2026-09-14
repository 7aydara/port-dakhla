/**
 * Objectifs et defis.
 *
 * NOTE EDITORIALE — le brief annonce « six objectifs, cinq defis », mais la
 * liste factuelle fournie en contient SIX : inegalites territoriales,
 * mobilites, emploi des jeunes, eau, littoral, peche. Les six sont conserves.
 * Retirer le sixieme reviendrait a supprimer un contenu fourni.
 *
 * Les defis sont classes selon les trois piliers du developpement durable.
 * Ce classement n'est pas decoratif : il fait apparaitre que les defis se
 * concentrent sur le pilier environnemental, ce qui prepare directement les
 * limites de la conclusion.
 */

export type Pilier = 'social' | 'economique' | 'environnemental';

export const PILIERS: Readonly<Record<Pilier, { readonly nom: string; readonly glose: string }>> = {
  social: {
    nom: 'Social',
    glose: 'Répartir les effets du projet entre les habitants et les territoires',
  },
  economique: {
    nom: 'Économique',
    glose: 'Produire de la richesse localement et durablement',
  },
  environnemental: {
    nom: 'Environnemental',
    glose: 'Ne pas épuiser le milieu qui rend le projet possible',
  },
};

export interface Objectif {
  readonly id: string;
  readonly titre: string;
  readonly detail: string;
}

export const OBJECTIFS: readonly Objectif[] = [
  {
    id: 'activites',
    titre: 'Développer les activités économiques régionales',
    detail: 'Pêche, industrie, énergie, mines et tourisme.',
  },
  {
    id: 'halieutique',
    titre: 'Valoriser la ressource halieutique sur place',
    detail: 'Transformer le poisson bord à quai plutôt que l’expédier brut.',
  },
  {
    id: 'logistique',
    titre: 'Améliorer les transports et la logistique',
    detail: 'Donner une infrastructure portuaire à toute la façade atlantique sud.',
  },
  {
    id: 'entreprises',
    titre: 'Attirer des entreprises',
    detail: 'La zone industrielle et logistique sert d’argument d’implantation.',
  },
  {
    id: 'inegalites',
    titre: 'Réduire les inégalités territoriales',
    detail: 'Désenclaver les provinces du Sud et les relier au reste du pays.',
  },
  {
    id: 'sahel',
    titre: 'Ouvrir le Maroc sur le Sahel',
    detail: 'Dans le cadre de l’Initiative royale atlantique.',
  },
];

export interface Defi {
  readonly id: string;
  readonly titre: string;
  readonly detail: string;
  readonly pilier: Pilier;
  /** Pilier secondaire : la plupart des defis en relevent de deux. */
  readonly aussi?: Pilier;
}

export const DEFIS: readonly Defi[] = [
  {
    id: 'inegalites',
    titre: 'Inégalités territoriales',
    detail: 'Entre un nord industrialisé et des provinces du Sud longtemps périphériques.',
    pilier: 'social',
    aussi: 'economique',
  },
  {
    id: 'emploi',
    titre: 'Emploi des jeunes',
    detail: 'La région doit retenir sa jeunesse, pas seulement employer des rotations venues d’ailleurs.',
    pilier: 'social',
  },
  {
    id: 'mobilites',
    titre: 'Mobilités et désenclavement',
    detail: 'Un port sans route utile ne dessert personne : la voie express en est la condition.',
    pilier: 'economique',
    aussi: 'social',
  },
  {
    id: 'eau',
    titre: 'Gestion de l’eau en milieu désertique',
    detail: 'L’approvisionnement passe par le dessalement, lui-même consommateur d’énergie.',
    pilier: 'environnemental',
  },
  {
    id: 'littoral',
    titre: 'Protection du littoral',
    detail: 'Sédimentation, ensablement et équilibre de la baie de Dakhla.',
    pilier: 'environnemental',
  },
  {
    id: 'peche',
    titre: 'Gestion durable de la pêche',
    detail: 'Augmenter les capacités de débarquement, c’est aussi augmenter le risque de surpêche.',
    pilier: 'environnemental',
    aussi: 'economique',
  },
];
