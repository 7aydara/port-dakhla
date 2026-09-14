/**
 * SEQUENCE D'IMAGES POUR LE CANVAS.
 *
 * POURQUOI PAS UNE BALISE <video> :
 * le currentTime d'un element video n'est pas fiable sur Safari ni sur iOS.
 * Le scrub saccade, se desynchronise du scroll et se cale sur les images cles
 * plutot que sur l'image demandee. On precharge donc une sequence d'images et
 * on dessine dans un <canvas>.
 *
 * STRATEGIE DE CHARGEMENT :
 *   1. On charge d'abord la sequence basse definition (640 px). Elle est
 *      legere, donc l'intro devient utilisable tres vite.
 *   2. Une fois qu'elle est complete, on charge la haute definition en tache
 *      de fond et on bascule image par image, sans interrompre la lecture.
 *
 * REPLI : si le chargement echoue, `echec` passe a vrai. L'appelant affiche
 * alors l'image fixe (poster.jpg) et le reste du site continue de fonctionner.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface OptionsSequence {
  /** Chemin sous public/frames/, par exemple 'hero'. */
  readonly dossier: string;
  /** Nombre d'images de la sequence. */
  readonly nombre: number;
  /** Charger aussi la haute definition apres la basse definition. */
  readonly hauteDefinition?: boolean;
}

export interface Sequence {
  /** Fraction chargee de la sequence utilisable, 0 -> 1. */
  readonly progression: number;
  /** Vrai des que la basse definition est complete : on peut scroller. */
  readonly pret: boolean;
  /** Vrai si la sequence n'a pas pu etre chargee. */
  readonly echec: boolean;
  /** Dessine l'image d'index donne, en « cover » calcule a la main. */
  readonly dessiner: (canvas: HTMLCanvasElement | null, index: number) => void;
  readonly nombre: number;
}

const BASE = import.meta.env.BASE_URL;
const PARALLELE = 8;

function chemin(dossier: string, qualite: 'sd' | 'hd', index: number): string {
  const n = String(index + 1).padStart(4, '0');
  return `${BASE}frames/${dossier}/${qualite}/${n}.webp`;
}

function charger(url: string): Promise<HTMLImageElement> {
  return new Promise((resoudre, rejeter) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resoudre(img);
    img.onerror = () => rejeter(new Error(url));
    img.src = url;
  });
}

export function useFrameSequence({
  dossier,
  nombre,
  hauteDefinition = true,
}: OptionsSequence): Sequence {
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [progression, setProgression] = useState(0);
  const [pret, setPret] = useState(false);
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    let annule = false;
    images.current = new Array(nombre).fill(null);
    setProgression(0);
    setPret(false);
    setEchec(false);

    /** Charge une qualite entiere, avec un plafond de requetes simultanees. */
    async function chargerQualite(qualite: 'sd' | 'hd', compter: boolean) {
      let suivant = 0;
      let faits = 0;
      let erreurs = 0;

      async function ouvrier() {
        while (!annule) {
          const i = suivant++;
          if (i >= nombre) return;
          try {
            const img = await charger(chemin(dossier, qualite, i));
            if (annule) return;
            images.current[i] = img;
          } catch {
            erreurs++;
          }
          faits++;
          if (compter && !annule) setProgression(faits / nombre);
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(PARALLELE, nombre) }, () => ouvrier()),
      );
      return erreurs;
    }

    (async () => {
      // 1. Basse definition : c'est elle qui debloque le scroll.
      const erreursSd = await chargerQualite('sd', true);
      if (annule) return;

      // Une sequence utilisable meme incomplete vaut mieux qu'un echec : on
      // ne declare l'echec que si presque rien n'est arrive.
      if ((erreursSd ?? 0) > nombre * 0.5) {
        setEchec(true);
        return;
      }
      setPret(true);

      // 2. Haute definition en tache de fond, sans bloquer quoi que ce soit.
      if (hauteDefinition) await chargerQualite('hd', false);
    })().catch(() => {
      if (!annule) setEchec(true);
    });

    return () => {
      annule = true;
    };
  }, [dossier, nombre, hauteDefinition]);

  /**
   * Dessine en « cover » calcule a la main : on cadre au plus juste sans
   * deformer, et on centre. object-fit ne s'applique pas a un canvas.
   */
  const dessiner = useCallback(
    (canvas: HTMLCanvasElement | null, index: number) => {
      if (!canvas) return;
      const i = Math.min(nombre - 1, Math.max(0, Math.round(index)));

      // Si l'image visee n'est pas encore la, on remonte vers la plus proche
      // deja chargee : le scrub reste fluide pendant le chargement.
      let img = images.current[i];
      if (!img) {
        for (let d = 1; d < nombre && !img; d++) {
          img = images.current[i - d] ?? images.current[i + d] ?? null;
        }
      }
      if (!img) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const largeur = Math.round(canvas.clientWidth * dpr);
      const hauteur = Math.round(canvas.clientHeight * dpr);
      if (largeur === 0 || hauteur === 0) return;
      if (canvas.width !== largeur || canvas.height !== hauteur) {
        canvas.width = largeur;
        canvas.height = hauteur;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const echelle = Math.max(largeur / img.naturalWidth, hauteur / img.naturalHeight);
      const l = img.naturalWidth * echelle;
      const h = img.naturalHeight * echelle;
      ctx.clearRect(0, 0, largeur, hauteur);
      ctx.drawImage(img, (largeur - l) / 2, (hauteur - h) / 2, l, h);
    },
    [nombre],
  );

  return { progression, pret, echec, dessiner, nombre };
}
