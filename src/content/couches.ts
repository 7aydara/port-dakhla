/**
 * Les six couches de construction du schema (section 03).
 * Chaque couche porte sa dimension REELLE et son millesime : c'est ce
 * qu'affiche la legende quand le trace se dessine.
 */

import { AVANCEMENT_REMBLAI, AVANCEMENT_VIADUC, POSTE_PETROLIER } from './projet';
import { pourcentage } from './format';

export interface Couche {
  readonly cle: string;
  readonly nom: string;
  /** Valeur chiffree principale. Absente quand la couche n'en porte pas. */
  readonly valeur?: number;
  readonly unite?: string;
  readonly format?: 'brut' | 'profondeur' | 'pourcentage';
  readonly nuance?: string;
  /** Millesime ou etat d'avancement, affiche sous la cote. */
  readonly millesime: string;
  readonly note: string;
  /** Jeton CSS de la teinte utilisee dans le schema, pour la pastille. */
  readonly teinte: string;
  /** Cotes secondaires (les trois quais). */
  readonly details?: readonly {
    readonly nom: string;
    /** Absente quand le dossier ne documente pas de dimension. */
    readonly valeur?: number;
    readonly unite?: string;
    /** Affiche a la place de la cote quand la dimension manque. */
    readonly note?: string;
    readonly teinte: string;
  }[];
}

export const COUCHES: readonly Couche[] = [
  {
    cle: 'fonds',
    nom: 'Fonds et trait de côte',
    valeur: 16,
    format: 'profondeur',
    millesime: 'études achevées à 60 % en 2018',
    note: 'Les isobathes relient les points de même profondeur. Tout le tracé du port découle de la position du −16 m.',
    teinte: 'var(--trame)',
  },
  {
    cle: 'digues',
    nom: 'Digues de protection',
    valeur: 6700,
    unite: 'm',
    millesime: 'ouvrages de protection des bassins achevés en janvier 2026',
    note: 'Elles cassent la houle atlantique et créent le plan d’eau abrité. C’est le premier ouvrage construit.',
    teinte: 'var(--carmin)',
  },
  {
    cle: 'viaduc',
    nom: 'Viaduc maritime',
    valeur: 1200,
    unite: 'm',
    // Valeur reprise de projet.ts : jamais reecrite en dur ici.
    millesime: `achevé à ${pourcentage(AVANCEMENT_VIADUC.pourcentage)} en ${AVANCEMENT_VIADUC.date}`,
    note: 'Il relie la terre au port construit au large. Sans lui, le port-îlot reste inaccessible.',
    teinte: 'var(--encre)',
  },
  {
    cle: 'remblai',
    nom: 'Terre-plein et port-îlot',
    valeur: AVANCEMENT_REMBLAI.pourcentage,
    format: 'pourcentage',
    millesime: `remblai principal, ${AVANCEMENT_REMBLAI.date}`,
    note: 'La surface est gagnée sur la mer par remblai. C’est elle qui portera les quais et les terminaux.',
    teinte: 'var(--carmin)',
  },
  {
    cle: 'quais',
    nom: 'Les quais',
    millesime: 'trois usages, trois profondeurs',
    note: 'Chaque quai correspond à une composante du port : commerce, pêche, réparation navale.',
    teinte: 'var(--or)',
    details: [
      { nom: 'Commerce, −16 m', valeur: 660, unite: 'm', teinte: 'var(--or)' },
      { nom: 'Pêche, −12 m', valeur: 1800, unite: 'm', teinte: 'var(--trame)' },
      { nom: 'Réparation navale', valeur: 200, unite: 'm', teinte: 'var(--vert)' },
      // Le dossier mentionne un poste petrolier sans lui donner de dimension.
      // On l'affiche donc SANS cote, plutot que de l'omettre ou de l'estimer.
      { nom: 'Poste pétrolier', note: POSTE_PETROLIER.note, teinte: 'var(--encre-40)' },
    ],
  },
  {
    cle: 'zone',
    nom: 'Zone industrielle et logistique',
    valeur: 1650,
    unite: 'ha',
    millesime: 'en arrière du port',
    note: 'Sans elle, le port ne serait qu’un lieu de transit. C’est ici que la valeur ajoutée doit rester dans la région.',
    teinte: 'var(--carmin)',
    details: [
      { nom: 'Route de raccordement à la RN 1', valeur: 7, unite: 'km', teinte: 'var(--encre-40)' },
    ],
  },
  {
    cle: 'fonctionnement',
    nom: 'Comment le port fonctionne',
    millesime: 'la chaîne complète, de la passe à la RN 1',
    note: 'C’est cette chaîne qui distingue un port d’un simple point de débarquement.',
    teinte: 'var(--or)',
    details: [
      { nom: '① Les navires entrent par la passe', note: 'entre les deux digues', teinte: 'var(--or)' },
      { nom: '② Le viaduc ramène à terre', note: 'depuis le port-îlot', teinte: 'var(--or)' },
      { nom: '③ La route rejoint la RN 1', note: 'via la zone industrielle', teinte: 'var(--or)' },
    ],
  },
];
