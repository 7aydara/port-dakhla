/**
 * MANIFESTE DES SECTIONS
 *
 * C'est la source unique du decoupage. Chaque section declare ses etapes ;
 * le nombre d'etapes N'EST PAS ecrit deux fois : il se deduit de la longueur
 * de `etapes`. Le moteur d'etapes (useStepper) et le mode recit (pilote par le
 * scroll) lisent tous les deux ce meme manifeste, donc le script oral et
 * l'animation ne peuvent pas se desynchroniser.
 *
 * Chaque etape porte QUI parle et CE QU'IL DIT : c'est ce que le panneau de
 * notes (touche N) affiche pendant l'oral.
 */

import type { Presentateur } from './presentateurs';

export interface Etape {
  /** Qui prend la parole sur cette etape. */
  readonly par: Presentateur;
  /** Ce qu'il dit. Redige pour etre lu en un souffle, pas recite mot a mot. */
  readonly note: string;
}

export interface Section {
  readonly id: string;
  /** Numero affiche, toujours sur deux chiffres. */
  readonly numero: string;
  readonly titre: string;
  /** Libelle court pour la colonne de releve. */
  readonly court: string;
  readonly chapo?: string;
  readonly etapes: readonly Etape[];
}

export const SECTIONS: readonly Section[] = [
  {
    id: 'intro',
    numero: '00',
    titre: 'Le port Dakhla Atlantique',
    court: 'Introduction',
    chapo:
      'Un port en eau profonde en construction sur la côte saharienne, à quarante kilomètres au nord de Dakhla.',
    etapes: [
      {
        par: 'zayd',
        note: "Bonjour. Nous allons vous présenter le port Dakhla Atlantique, un port en eau profonde actuellement en construction sur la côte atlantique du Sahara marocain.",
      },
      {
        par: 'zayd',
        note: "Ce que vous voyez, c’est la côte de la région de Dakhla-Oued Eddahab : le désert qui tombe directement dans l’Atlantique. Aucun port en eau profonde sur des centaines de kilomètres.",
      },
      {
        par: 'zayd',
        note: "Nous sommes trois à présenter : Zayd, Fahd et Rayan. Chacun prend une partie.",
      },
      {
        par: 'zayd',
        note: "La question qui guide tout notre exposé est celle-ci : ce projet constitue-t-il un aménagement durable du territoire marocain ?",
      },
      {
        par: 'zayd',
        note: "Nous verrons d’abord ce qu’est le projet et où il se situe, puis comment il se construit, sa chronologie, ses objectifs et ses défis, et enfin ce qu’il change déjà sur le terrain.",
      },
    ],
  },
  {
    id: 'projet',
    numero: '01',
    titre: 'Ce que le Maroc construit à Ntirift',
    court: 'Le projet',
    chapo:
      'Trois ports en un seul ouvrage, plus une zone industrielle en arrière du littoral.',
    etapes: [
      {
        par: 'fahd',
        note: "Le port Dakhla Atlantique n’est pas un port, c’est trois ports réunis sur un même site, plus une zone industrielle.",
      },
      {
        par: 'fahd',
        note: "D’abord un port de commerce à moins seize mètres. Cette profondeur est décisive : elle permet d’accueillir de grands navires, ce que la baie de Dakhla ne permet pas.",
      },
      {
        par: 'fahd',
        note: "Ensuite un port de pêche, côtière et hauturière, à moins douze mètres. L’idée est que le poisson soit transformé sur place, bord à quai, au lieu d’être expédié brut vers le nord.",
      },
      {
        par: 'fahd',
        note: "Enfin un pôle de réparation navale, pour que les armateurs n’aient plus à remonter jusqu’à Agadir ou Las Palmas.",
      },
      {
        par: 'fahd',
        note: "Le tout représente près de treize milliards de dirhams, sous maîtrise d’ouvrage du ministère de l’Équipement et de l’Eau, avec une zone industrielle et logistique de mille six cent cinquante hectares. À la mise en service, on attend deux virgule deux millions de tonnes de marchandises et neuf cent cinquante mille tonnes de produits de la mer par an.",
      },
    ],
  },
  {
    id: 'localiser',
    numero: '02',
    titre: 'Où, exactement',
    court: 'Localisation',
    chapo: 'Du Maroc à la région, de la région au site.',
    etapes: [
      {
        par: 'zayd',
        note: "Situons-nous. Voici le Maroc : la région de Dakhla-Oued Eddahab est tout au sud, sur la façade atlantique.",
      },
      {
        par: 'zayd',
        note: "On se rapproche. La ville de Dakhla est installée sur une presqu’île, à l’abri dans sa baie. C’est justement le problème : la baie est peu profonde.",
      },
      {
        par: 'zayd',
        note: "Le port ne se construit donc pas à Dakhla, mais à quarante kilomètres au nord, sur le site de Ntirift, en pleine côte atlantique ouverte.",
      },
      {
        par: 'zayd',
        note: "Ce choix est capital : on sort de la baie pour trouver la profondeur, mais on s’expose en échange à la houle de l’Atlantique. D’où les six kilomètres sept cents de digues.",
      },
    ],
  },
  {
    id: 'construction',
    numero: '03',
    titre: 'Comment on construit un port dans l’océan',
    court: 'La construction',
    chapo:
      'Six couches successives, du relevé des fonds à la zone logistique. Schéma de principe, non à l’échelle.',
    etapes: [
      {
        par: 'fahd',
        note: "Avant toute chose, on relève les fonds. Les isobathes, ces lignes bleues, relient les points de même profondeur. On cherche le moins seize mètres le plus près possible de la côte.",
      },
      {
        par: 'fahd',
        note: "Première étape du chantier : les digues de protection. Six mille sept cents mètres d’enrochements pour casser la houle atlantique et créer un plan d’eau calme.",
      },
      {
        par: 'fahd',
        note: "Ensuite le viaduc maritime : mille deux cents mètres qui relient la terre au port construit au large. En juin 2026, il était achevé à quatre-vingt-cinq virgule quatre pour cent.",
      },
      {
        par: 'fahd',
        note: "Puis le remblai : on gagne de la surface sur la mer pour créer le terre-plein et le port-îlot. En juin 2026, le remblai principal était à quarante-quatre pour cent.",
      },
      {
        par: 'fahd',
        note: "Sur ce terre-plein, on installe les quais : six cent soixante mètres pour le commerce, mille huit cents pour la pêche, deux cents pour la réparation navale.",
      },
      {
        par: 'fahd',
        note: "Enfin, en arrière du port, la zone industrielle et logistique : mille six cent cinquante hectares destinés à accueillir les entreprises. Sans elle, le port ne serait qu’un lieu de transit.",
      },
      {
        par: 'fahd',
        note: "Une fois l’ensemble construit, voilà comment il fonctionne : les navires entrent par la passe, entre les deux digues ; ils déchargent aux quais du port-îlot ; le viaduc ramène tout à terre ; et la route rejoint la nationale 1. C’est cette chaîne complète qui fait la différence avec un simple point de débarquement.",
      },
    ],
  },
  {
    id: 'chronologie',
    numero: '04',
    titre: 'Onze ans, de l’annonce à la mise en service',
    court: 'Chronologie',
    chapo: 'Quinze dates, et une jauge d’avancement qui progresse le long de la frise.',
    etapes: [
      {
        par: 'rayan',
        note: "Tout part du 6 novembre 2015 : le discours royal de Laâyoune, pour le quarantième anniversaire de la Marche verte, lance le nouveau modèle de développement des provinces du Sud. La convention du port est signée en février 2016.",
      },
      {
        par: 'rayan',
        note: "Suivent cinq années d’études et de procédures : les études sont à soixante pour cent en 2018, l’appel d’offres est relancé fin 2020, les plis sont ouverts à Rabat en janvier 2021.",
      },
      {
        par: 'rayan',
        note: "Le 9 août 2021, le marché est attribué au groupement SGTM-Somagec Sud pour douze virgule quatre milliards de dirhams. Le chantier démarre.",
      },
      {
        par: 'rayan',
        note: "Le chantier monte en puissance : environ vingt pour cent à l’été 2024, environ quarante pour cent à la mi-2025. Entre les deux, en novembre 2024, la voie express Tiznit-Dakhla est achevée — mille cinquante-cinq kilomètres.",
      },
      {
        par: 'rayan',
        note: "2026 est l’année de l’accélération : cinquante-trois pour cent en février, cinquante-sept virgule seize en avril, et plus de soixante pour cent annoncés le 3 juin. L’objectif affiché pour l’année est de soixante-dix pour cent.",
      },
      {
        par: 'rayan',
        note: "L’achèvement des travaux est prévu fin 2028, pour une mise en service en 2029.",
      },
    ],
  },
  {
    id: 'enjeux',
    numero: '05',
    titre: 'Ce qu’on en attend, ce qui reste à tenir',
    court: 'Objectifs et défis',
    chapo:
      'Six objectifs annoncés. Six défis, répartis selon les trois piliers du développement durable.',
    etapes: [
      { par: 'fahd', note: "Premier objectif : développer les activités économiques de la région — la pêche, l’industrie, l’énergie, les mines et le tourisme." },
      { par: 'fahd', note: "Deuxième : valoriser la ressource halieutique sur place, bord à quai, au lieu de l’exporter brute." },
      { par: 'fahd', note: "Troisième : améliorer les transports et la logistique de toute la façade atlantique sud." },
      { par: 'fahd', note: "Quatrième : attirer des entreprises grâce à la zone industrielle et logistique." },
      { par: 'fahd', note: "Cinquième : réduire les inégalités territoriales et désenclaver les provinces du Sud." },
      { par: 'fahd', note: "Sixième : ouvrir le Maroc sur le Sahel, dans le cadre de l’Initiative royale atlantique." },
      { par: 'zayd', note: "Face à ces objectifs, six défis. Je les classe selon les trois piliers du développement durable, et vous allez voir que la répartition n’est pas équilibrée." },
      { par: 'zayd', note: "Pilier social : les inégalités territoriales entre le nord industrialisé et les provinces du Sud, et l’emploi des jeunes de la région." },
      { par: 'zayd', note: "Pilier économique : les mobilités et le désenclavement. Un port sans route utile ne dessert personne." },
      { par: 'zayd', note: "Pilier environnemental, premier défi : l’eau. En milieu désertique, l’approvisionnement passe par le dessalement, qui consomme beaucoup d’énergie." },
      { par: 'zayd', note: "Deuxième défi environnemental : la protection du littoral. Les digues et les remblais modifient les courants, avec des risques de sédimentation et d’ensablement pour la baie de Dakhla." },
      { par: 'zayd', note: "Troisième : la pêche. Augmenter les capacités de débarquement, c’est aussi augmenter le risque de surpêche. Vous le voyez : la moitié des défis sont environnementaux." },
    ],
  },
  {
    id: 'avant-apres',
    numero: '06',
    titre: 'Le même cadrage, avant et pendant',
    court: 'Avant / aujourd’hui',
    chapo: 'Déplacez la poignée. Au clavier, les flèches gauche et droite.',
    etapes: [
      {
        par: 'rayan',
        note: "Voici la côte avant le chantier. Du sable, des dunes, la houle. Aucune installation. C’est l’état du site avant 2021.",
      },
      {
        par: 'rayan',
        note: "Je déplace la poignée. Même cadrage, même angle — seul le terrain a changé.",
      },
      {
        par: 'rayan',
        note: "On voit les digues en enrochements qui dessinent le plan d’eau abrité, le terre-plein gagné sur la mer, et le viaduc qui traverse. Plus de mille huit cents ouvriers travaillent ici en rotation vingt-quatre heures sur vingt-quatre.",
      },
      {
        par: 'rayan',
        note: "C’est l’image la plus parlante de notre exposé : en cinq ans, une plage déserte est devenue un chantier portuaire visible depuis l’espace.",
      },
    ],
  },
  {
    id: 'conclusion',
    numero: '07',
    titre: 'Un aménagement durable ?',
    court: 'Conclusion',
    etapes: [
      {
        par: 'zayd',
        note: "Revenons à notre question de départ : ce projet constitue-t-il un aménagement durable du territoire marocain ?",
      },
      {
        par: 'zayd',
        note: "Premier argument pour : c’est une planification à long terme. Le port n’est pas isolé — il vient avec la voie express, la zone industrielle, le raccordement routier. Cette cohérence relève du pilier social, parce qu’elle réduit les inégalités nord-sud.",
      },
      {
        par: 'fahd',
        note: "Deuxième argument : la transformation locale plutôt que l’exportation brute. On garde la valeur ajoutée sur place, et le projet s’accompagne de dessalement et d’énergies renouvelables.",
      },
      {
        par: 'rayan',
        note: "Première limite : un chantier lourd en mer modifie durablement le littoral. Digues et remblais déplacent les sédiments, avec des risques de sédimentation bien au-delà de la durée du chantier.",
      },
      {
        par: 'rayan',
        note: "Deuxième limite, et c’est notre conclusion : la durabilité réelle ne dépendra pas de l’ouvrage, mais de la gestion. Celle de la pêche, celle de l’eau. L’infrastructure crée la possibilité ; elle ne garantit rien.",
      },
    ],
  },
  {
    id: 'sources',
    numero: '08',
    titre: 'Sources',
    court: 'Sources',
    etapes: [
      {
        par: 'rayan',
        note: "Voici nos sources : la presse marocaine — Médias24, Le Desk, TelQuel, SNRT News — et la fiche projet de TME Ingénierie. Toutes nos données chiffrées en proviennent.",
      },
      {
        par: 'rayan',
        note: "Merci de votre attention. Nous sommes prêts à répondre à vos questions.",
      },
    ],
  },
];

/** Nombre d'etapes d'une section. Jamais code en dur ailleurs. */
export function nombreEtapes(index: number): number {
  return SECTIONS[index]?.etapes.length ?? 1;
}

/** Total des etapes de tout le site, pour le compteur global. */
export const TOTAL_ETAPES = SECTIONS.reduce((n, s) => n + s.etapes.length, 0);
