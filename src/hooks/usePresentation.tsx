/**
 * ETAT GLOBAL : { section, etape }.
 *
 * Un seul etat pour les deux modes. Le mode recit et le mode presentation
 * produisent tous les deux ce couple ; la logique d'animation, elle, n'existe
 * qu'une fois, dans les composants de section, qui lisent l'etape via
 * EtapeContext (voir CadreSection).
 *
 * Contrainte du brief : « une animation en cours ne doit jamais bloquer
 * l'appui suivant ». C'est pour cela que l'etat est change de facon purement
 * synchrone, sans file d'attente ni verrou : un appui = une transition d'etat,
 * immediatement. Le rattrapage visuel est traite separement (useRattrapage).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { SECTIONS } from '../content/sections';

export type Mode = 'recit' | 'presentation';

export interface Etat {
  readonly mode: Mode;
  readonly section: number;
  readonly etape: number;
  readonly notes: boolean;
  readonly aide: boolean;
  readonly chrono: boolean;
  /** Incremente a chaque changement d'etape : sert de declencheur au rattrapage. */
  readonly battement: number;
}

type Action =
  | { type: 'mode'; mode: Mode }
  | { type: 'etapeSuivante' }
  | { type: 'etapePrecedente' }
  | { type: 'sectionSuivante' }
  | { type: 'sectionPrecedente' }
  | { type: 'aller'; section: number; etape?: number }
  | { type: 'notes' }
  | { type: 'aide'; ouverte?: boolean }
  | { type: 'chrono' };

const DERNIERE = SECTIONS.length - 1;
const nbEtapes = (s: number) => SECTIONS[s]?.etapes.length ?? 1;
const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case 'mode':
      return { ...etat, mode: action.mode, aide: action.mode === 'presentation' };

    /* Avance d'une etape. En bout de section, passe a la suivante : le
       presentateur n'a jamais a changer de touche en cours d'expose. */
    case 'etapeSuivante': {
      if (etat.etape < nbEtapes(etat.section) - 1) {
        return { ...etat, etape: etat.etape + 1, battement: etat.battement + 1 };
      }
      if (etat.section < DERNIERE) {
        return { ...etat, section: etat.section + 1, etape: 0, battement: etat.battement + 1 };
      }
      return etat;
    }

    case 'etapePrecedente': {
      if (etat.etape > 0) {
        return { ...etat, etape: etat.etape - 1, battement: etat.battement + 1 };
      }
      if (etat.section > 0) {
        const s = etat.section - 1;
        return { ...etat, section: s, etape: nbEtapes(s) - 1, battement: etat.battement + 1 };
      }
      return etat;
    }

    /* Haut / bas : on change de section en se calant sur la premiere etape. */
    case 'sectionSuivante':
      return etat.section >= DERNIERE
        ? etat
        : { ...etat, section: etat.section + 1, etape: 0, battement: etat.battement + 1 };

    case 'sectionPrecedente':
      return etat.section <= 0
        ? etat
        : { ...etat, section: etat.section - 1, etape: 0, battement: etat.battement + 1 };

    case 'aller': {
      const s = borne(action.section, 0, DERNIERE);
      const e = borne(action.etape ?? 0, 0, nbEtapes(s) - 1);
      if (s === etat.section && e === etat.etape) return etat;
      return { ...etat, section: s, etape: e, battement: etat.battement + 1 };
    }

    case 'notes':
      return { ...etat, notes: !etat.notes };
    case 'aide':
      return { ...etat, aide: action.ouverte ?? !etat.aide };
    case 'chrono':
      return { ...etat, chrono: !etat.chrono };
  }
}

/** Le mode presentation s'active aussi par l'URL #/present. */
function modeInitial(): Mode {
  if (typeof window === 'undefined') return 'recit';
  return window.location.hash.replace(/^#\/?/, '') === 'present' ? 'presentation' : 'recit';
}

const ETAT_INITIAL: Etat = {
  mode: 'recit',
  section: 0,
  etape: 0,
  notes: true,
  aide: false,
  chrono: false,
  battement: 0,
};

export interface Commandes {
  readonly etat: Etat;
  readonly suivant: () => void;
  readonly precedent: () => void;
  readonly sectionSuivante: () => void;
  readonly sectionPrecedente: () => void;
  readonly aller: (section: number, etape?: number) => void;
  readonly basculerMode: () => void;
  readonly quitterPresentation: () => void;
  readonly basculerNotes: () => void;
  readonly basculerAide: (ouverte?: boolean) => void;
  readonly basculerChrono: () => void;
  /** Nombre d'etapes de la section courante. */
  readonly etapesSection: number;
  /** Etapes restantes dans la section courante, panneau de notes. */
  readonly restantes: number;
}

const Ctx = createContext<Commandes | null>(null);

export function FournisseurPresentation({ children }: { children: ReactNode }) {
  const [etat, envoyer] = useReducer(reducteur, ETAT_INITIAL, (init) => ({
    ...init,
    mode: modeInitial(),
    aide: modeInitial() === 'presentation',
  }));

  /* L'URL suit le mode, pour que le lien #/present soit partageable et que le
     bouton Precedent du navigateur revienne au mode recit. */
  useEffect(() => {
    const vise = etat.mode === 'presentation' ? '#/present' : '';
    const courant = window.location.hash;
    if (etat.mode === 'presentation' && courant !== vise) {
      window.history.replaceState(null, '', vise);
    } else if (etat.mode === 'recit' && courant === '#/present') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [etat.mode]);

  useEffect(() => {
    const surHash = () => envoyer({ type: 'mode', mode: modeInitial() });
    window.addEventListener('hashchange', surHash);
    return () => window.removeEventListener('hashchange', surHash);
  }, []);

  const commandes = useMemo<Commandes>(() => {
    const etapesSection = nbEtapes(etat.section);
    return {
      etat,
      etapesSection,
      restantes: etapesSection - 1 - etat.etape,
      suivant: () => envoyer({ type: 'etapeSuivante' }),
      precedent: () => envoyer({ type: 'etapePrecedente' }),
      sectionSuivante: () => envoyer({ type: 'sectionSuivante' }),
      sectionPrecedente: () => envoyer({ type: 'sectionPrecedente' }),
      aller: (section: number, etape?: number) => envoyer({ type: 'aller', section, etape }),
      basculerMode: () =>
        envoyer({ type: 'mode', mode: etat.mode === 'recit' ? 'presentation' : 'recit' }),
      quitterPresentation: () => envoyer({ type: 'mode', mode: 'recit' }),
      basculerNotes: () => envoyer({ type: 'notes' }),
      basculerAide: (ouverte?: boolean) => envoyer({ type: 'aide', ouverte }),
      basculerChrono: () => envoyer({ type: 'chrono' }),
    };
  }, [etat]);

  return <Ctx.Provider value={commandes}>{children}</Ctx.Provider>;
}

export function usePresentation(): Commandes {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePresentation doit être utilisé dans FournisseurPresentation');
  return c;
}

/** Contexte d'etape fourni par CadreSection : chaque section lit SON etape. */
export const EtapeContext = createContext<number>(0);
export const useEtape = () => useContext(EtapeContext);

/**
 * Etat d'une couche numerotee, a partir de l'etape courante.
 * C'est LA fonction qui traduit un index d'etape en etat visuel, partagee par
 * toutes les sections et par les deux modes.
 */
export type EtatCouche = 'futur' | 'encours' | 'acquis';
export function etatCouche(index: number, etape: number): EtatCouche {
  if (index > etape) return 'futur';
  if (index === etape) return 'encours';
  return 'acquis';
}

/** Raccourci : la couche est-elle visible ? */
export function useCouche(index: number): EtatCouche {
  const etape = useEtape();
  return etatCouche(index, etape);
}

export function useEstVisible(index: number): boolean {
  return useCouche(index) !== 'futur';
}

export function useNombreSections(): number {
  return SECTIONS.length;
}

export const useAller = () => {
  const { aller } = usePresentation();
  return useCallback((s: number, e?: number) => aller(s, e), [aller]);
};
