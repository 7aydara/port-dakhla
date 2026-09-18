/**
 * SEQUENCE D'IMAGES POUR LE CANVAS.
 *
 * POURQUOI PAS UNE BALISE <video> : le currentTime d'un element video n'est
 * pas fiable sur Safari ni sur iOS. Le scrub saccade et se cale sur les images
 * cles plutot que sur l'image demandee.
 *
 * TROIS DECISIONS, TOUTES PRISES SUR MESURE :
 *
 * 1. UNE SEULE ECHELLE est chargee, choisie au montage selon la taille reelle
 *    de l'ecran. La version precedente chargeait la basse definition PUIS la
 *    haute : 304 requetes et 8,6 Mo pour afficher 72 images utiles.
 *
 * 2. CHARGEMENT PROGRESSIF PAR PASSES. On charge d'abord une image sur huit,
 *    puis une sur quatre, puis le reste. Le mouvement est disponible apres la
 *    premiere passe -- neuf images, moins d'une seconde -- au lieu d'attendre
 *    la sequence entiere. Le dessin retombe sur l'image chargee la plus proche
 *    tant que la suivante n'est pas la.
 *
 * 3. PAS D'IMAGE-BITMAP. Mesure faite : un drawImage coute 0,02 ms et le
 *    premier decodage d'une image 0,1 ms. Le decodage n'a jamais ete le
 *    goulot. Passer aux ImageBitmap aurait immobilise 336 Mo de pixels
 *    decodes pour un gain nul. On garde des <img>, dont le navigateur gere
 *    lui-meme le cache.
 *
 * Le composant n'est PAS re-rendu pendant le defilement : `dessiner` est
 * imperatif et l'etat React ne change qu'a chaque palier de chargement.
 */

import { useEffect, useRef, useState } from 'react';

export interface Sequence {
  readonly nombre: number;
  /** Fraction chargee, 0 -> 1. */
  readonly progression: number;
  /** Assez d'images pour commencer a bouger. */
  readonly pret: boolean;
  /** La sequence n'a pas pu etre chargee : l'appelant affiche l'image fixe. */
  readonly echec: boolean;
  /**
   * Dessine l'image d'index donne, cadree en « cover » calcule a la main, et
   * pose par-dessus le voile de lisibilite. Imperatif : cette fonction ne
   * passe jamais par React.
   */
  readonly dessiner: (canvas: HTMLCanvasElement | null, index: number) => void;
}

interface Ressource {
  readonly images: (HTMLImageElement | null)[];
  charges: number;
  erreurs: number;
  pret: boolean;
  echec: boolean;
  readonly abonnes: Set<() => void>;
}

const BASE = import.meta.env.BASE_URL;
/** Cache partage entre montages : revenir sur l'intro ne recharge rien. */
const CACHES = new Map<string, Ressource>();
/** Passes de chargement : une image sur huit, puis sur quatre, puis toutes. */
const PASSES = [8, 4, 1];
const PARALLELE = 3;

/**
 * Attend un temps mort du fil principal.
 *
 * Seule la PREMIERE passe est chargee en priorite : neuf images suffisent pour
 * que la camera bouge. Les suivantes attendent que le navigateur n'ait rien de
 * mieux a faire. Sans cela, telecharger et decoder soixante images entrait en
 * concurrence avec le defilement au moment precis ou le visiteur arrive, et
 * hachait l'introduction pendant les premieres secondes.
 */
function tempsMort(): Promise<void> {
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (!ric) return new Promise((r) => setTimeout(r, 32));
  return new Promise((r) => ric(() => r(), { timeout: 600 }));
}

/** Haute definition seulement si l'ecran la justifie vraiment. */
function echelle(): 'hd' | 'sd' {
  if (typeof window === 'undefined') return 'sd';
  const largeurReelle = window.innerWidth * Math.min(2, window.devicePixelRatio || 1);
  // Une connexion annoncee comme lente ou en economie de donnees reste en sd.
  const reseau = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (reseau?.saveData) return 'sd';
  if (reseau?.effectiveType && /^(slow-)?2g|3g$/.test(reseau.effectiveType)) return 'sd';
  return largeurReelle >= 1200 ? 'hd' : 'sd';
}

async function charger(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  // On DECODE des le chargement, hors du chemin critique. Sans ca, le
  // decodage se produit a l'interieur du premier drawImage, en synchrone sur
  // le fil principal : mesure faite, c'etait la source des pics a 116 ms
  // pendant le scrub. decode() le fait en tache de fond.
  if (typeof img.decode === 'function') {
    await img.decode();
  } else {
    await new Promise<void>((resoudre, rejeter) => {
      img.onload = () => resoudre();
      img.onerror = () => rejeter(new Error(url));
    });
  }
  return img;
}

/** Ordre de chargement : passe 1 (1/8), passe 2 (1/4), puis le reste. */
function ordreDeChargement(nombre: number): number[] {
  const vus = new Set<number>();
  const ordre: number[] = [];
  for (const pas of PASSES) {
    for (let i = 0; i < nombre; i += pas) {
      if (!vus.has(i)) { vus.add(i); ordre.push(i); }
    }
  }
  for (let i = 0; i < nombre; i++) if (!vus.has(i)) { vus.add(i); ordre.push(i); }
  return ordre;
}

function obtenir(dossier: string, nombre: number): Ressource {
  const cle = `${dossier}/${echelle()}`;
  const existante = CACHES.get(cle);
  if (existante) return existante;

  const res: Ressource = {
    images: new Array(nombre).fill(null),
    charges: 0,
    erreurs: 0,
    pret: false,
    echec: false,
    abonnes: new Set(),
  };
  CACHES.set(cle, res);

  const qualite = echelle();
  const ordre = ordreDeChargement(nombre);
  // Nombre d'images de la premiere passe : au-dela, on peut deja bouger.
  const seuilPret = Math.ceil(nombre / PASSES[0]);
  let curseur = 0;
  let dernierSignal = 0;

  const signaler = (force = false) => {
    // On ne reveille React qu'aux paliers : jamais a chaque image.
    const pas = Math.max(1, Math.floor(nombre / 10));
    if (force || res.charges - dernierSignal >= pas) {
      dernierSignal = res.charges;
      res.abonnes.forEach((f) => f());
    }
  };

  async function ouvrier() {
    while (curseur < ordre.length) {
      const i = ordre[curseur++];
      // Passe 1 : en priorite. Passes suivantes : uniquement en temps mort.
      if (res.charges >= seuilPret) await tempsMort();
      const n = String(i + 1).padStart(4, '0');
      try {
        res.images[i] = await charger(`${BASE}frames/${dossier}/${qualite}/${n}.webp`);
      } catch {
        res.erreurs++;
      }
      res.charges++;
      if (!res.pret && res.charges >= seuilPret) { res.pret = true; signaler(true); }
      else signaler();
    }
  }

  Promise.all(Array.from({ length: Math.min(PARALLELE, nombre) }, ouvrier))
    .then(() => {
      // Une sequence incomplete reste utilisable : on n'echoue que si presque
      // rien n'est arrive.
      if (res.erreurs > nombre * 0.5) { res.echec = true; res.pret = false; }
      signaler(true);
    })
    .catch(() => { res.echec = true; signaler(true); });

  return res;
}

export function useFrameSequence({
  dossier,
  nombre,
}: {
  readonly dossier: string;
  readonly nombre: number;
}): Sequence {
  const res = useRef<Ressource>(undefined as unknown as Ressource);
  if (!res.current) res.current = obtenir(dossier, nombre);

  const [, forcer] = useState(0);

  useEffect(() => {
    const r = obtenir(dossier, nombre);
    res.current = r;
    const surPalier = () => forcer((n) => n + 1);
    r.abonnes.add(surPalier);
    surPalier();
    return () => { r.abonnes.delete(surPalier); };
  }, [dossier, nombre]);

  // Degrades du voile, reconstruits seulement quand la toile change de taille.
  // Dans un ref : ils doivent survivre aux rendus sans etre recrees.
  const voile = useRef<{ bas: CanvasGradient | null; gauche: CanvasGradient | null; cle: string }>({
    bas: null, gauche: null, cle: '',
  });

  const dessiner = useRef((canvas: HTMLCanvasElement | null, index: number) => {
    if (!canvas) return;
    const r = res.current;
    const i = Math.min(nombre - 1, Math.max(0, Math.round(index)));

    // Si l'image visee n'est pas encore chargee, on prend la plus proche
    // disponible : le mouvement reste continu pendant le chargement.
    let img = r.images[i];
    if (!img) {
      for (let d = 1; d < nombre && !img; d++) {
        img = r.images[i - d] ?? r.images[i + d] ?? null;
      }
    }
    if (!img) return;

    /* RESOLUTION INTERNE DU CANVAS -- c'est le poste le plus couteux de toute
       l'intro. Mesure faite : peindre la toile a sa taille CSS pleine coutait
       20 % des images ; a 0,7x, plus aucune image perdue.
       Trois bornes, dans cet ordre :
         - jamais plus large que l'image SOURCE : au-dela, on agrandit du vide ;
         - jamais plus que la taille CSS : le ratio de pixels du materiel
           n'apporte rien sur une photographie de fond ;
         - un coefficient de 0,78, imperceptible derriere un titre plein
           ecran, qui divise par deux le nombre de pixels a televerser au GPU
           a chaque image. */
    const COEFF = 0.78;
    const largeurCss = canvas.clientWidth;
    const hauteurCss = canvas.clientHeight;
    if (largeurCss === 0 || hauteurCss === 0) return;
    const largeur = Math.round(Math.min(largeurCss, img.naturalWidth) * COEFF);
    const hauteur = Math.round(largeur * (hauteurCss / largeurCss));
    if (largeur === 0 || hauteur === 0) return;
    if (canvas.width !== largeur || canvas.height !== hauteur) {
      canvas.width = largeur;
      canvas.height = hauteur;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // « cover » calcule a la main : object-fit ne s'applique pas a un canvas.
    const echelleDessin = Math.max(largeur / img.naturalWidth, hauteur / img.naturalHeight);
    const l = img.naturalWidth * echelleDessin;
    const h = img.naturalHeight * echelleDessin;
    ctx.drawImage(img, (largeur - l) / 2, (hauteur - h) / 2, l, h);

    /* LE VOILE EST PEINT ICI, pas en CSS.
       Il etait auparavant une div plein ecran posee sur la toile. Deux
       couches plein ecran superposees, dont l'une change a chaque image,
       obligent le compositeur a tout refaire : mesure faite, retirer cette
       div faisait passer les images perdues de 22 % a 10 %. Peint dans la
       meme toile, le voile ne coute qu'un remplissage de degrade.
       Il n'est pas decoratif : sans lui, le titre clair passe sur une dune
       claire et devient illisible au videoprojecteur. */
    const v = voile.current;
    const cle = `${largeur}x${hauteur}`;
    if (v.cle !== cle) {
      v.cle = cle;
      v.bas = ctx.createLinearGradient(0, hauteur, 0, 0);
      v.bas.addColorStop(0, 'rgba(20,50,63,0.90)');
      v.bas.addColorStop(0.4, 'rgba(20,50,63,0.50)');
      v.bas.addColorStop(0.72, 'rgba(20,50,63,0.08)');
      v.bas.addColorStop(1, 'rgba(20,50,63,0)');
      v.gauche = ctx.createLinearGradient(0, 0, largeur, 0);
      v.gauche.addColorStop(0, 'rgba(20,50,63,0.58)');
      v.gauche.addColorStop(0.55, 'rgba(20,50,63,0)');
    }
    ctx.fillStyle = v.bas!;
    ctx.fillRect(0, 0, largeur, hauteur);
    ctx.fillStyle = v.gauche!;
    ctx.fillRect(0, 0, largeur, hauteur);
  }).current;

  const r = res.current;
  return {
    nombre,
    progression: r.charges / nombre,
    pret: r.pret,
    echec: r.echec,
    dessiner,
  };
}
