import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const BASE = 'http://localhost:5055/';

const echecs = [];
const ok = (c, m) => { console.log(`${c ? '  OK  ' : ' ECHEC'}  ${m}`); if (!c) echecs.push(m); };

// Le conteneur fournit Chromium a un emplacement fixe ; on l'utilise
// directement plutot que de laisser Playwright en telecharger un autre.
const EXE = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';
const nav = await chromium.launch(
  existsSync(EXE) ? { executablePath: EXE } : {},
);

/* ---- 0. AUCUNE VARIABLE DE PALETTE MORTE ------------------------------- */
/* Controle statique, avant meme d'ouvrir un navigateur. Un `var(--x)` qui
   pointe vers un jeton inexistant ne casse rien visiblement : la couleur
   disparait, simplement. C'est arrive lors du passage a la palette pastel,
   ou les fichiers .ts n'avaient pas ete renommes avec le reste. */
{
  const { readFileSync, readdirSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');

  const fichiers = [];
  (function parcours(d) {
    for (const e of readdirSync(d)) {
      const chemin = join(d, e);
      if (statSync(chemin).isDirectory()) parcours(chemin);
      else if (/\.(ts|tsx|css)$/.test(e)) fichiers.push(chemin);
    }
  })('src');

  const definis = new Set();
  const utilises = new Map();
  for (const f of fichiers) {
    const src = readFileSync(f, 'utf8');
    // Une declaration peut suivre un `{` ou un `;` sur la meme ligne :
    // `.pilier[data-pilier='social'] { --teinte-pilier: var(--zayd); }`
    for (const m of src.matchAll(/(?:^|[{;])\s*(--[a-z0-9-]+)\s*:/gm)) definis.add(m[1]);
    for (const m of src.matchAll(/var\((--[a-z0-9-]+)/g)) {
      if (!utilises.has(m[1])) utilises.set(m[1], f);
    }
  }
  // Les variables posees depuis le JS ou en style inline ne sont pas declarees
  // en CSS : on les autorise explicitement.
  const horsCss = new Set(['--presentateur', '--teinte', '--contre']);
  const mortes = [...utilises].filter(([v]) => !definis.has(v) && !horsCss.has(v));

  ok(
    mortes.length === 0,
    `jetons de palette : ${utilises.size} utilisés, ${mortes.length} sans définition${mortes.length ? ' -> ' + mortes.map(([v, f]) => `${v} (${f})`).join(', ') : ''}`,
  );
}

/* ---- 1. AUCUNE REQUETE RESEAU EXTERNE ---------------------------------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
  const externes = [];
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) {
      externes.push(u);
      return route.abort();
    }
    route.continue();
  });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  // On parcourt tout le site pour declencher tous les chargements possibles.
  await p.keyboard.press('p');
  await p.waitForTimeout(400);
  await p.keyboard.press('Escape');
  for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(45); }
  await p.waitForTimeout(1500);
  ok(externes.length === 0, `aucune requete reseau externe (${externes.length} detectee(s)) ${externes.slice(0,3).join(' ')}`);
  await ctx.close();
}

/* ---- 2. MODE PRESENTATION : PARCOURS 100 % CLAVIER --------------------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  const erreurs = [];
  p.on('pageerror', (e) => erreurs.push(String(e)));
  // Seul 404 tolere : le fond de carte non encore fourni, dont l'absence
  // declenche volontairement l'emplacement reserve (voir CarteLocalisation).
  const ATTENDU_404 = ['media/carte-maroc.jpg'];
  p.on('response', (r) => {
    if (r.status() >= 400 && !ATTENDU_404.some((f) => r.url().includes(f))) {
      erreurs.push(`${r.status()} ${r.url()}`);
    }
  });

  await p.goto(BASE + '#/present', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  await p.keyboard.press('Space'); // ferme l'aide

  const total = await p.evaluate(() => Number(document.body.dataset.x || 0) || null);
  const lu = async () => p.evaluate(() => {
    const s = document.querySelector('.releve__station[aria-current="true"] .releve__numero')?.textContent;
    const j = document.querySelector('.releve__sonde')?.textContent?.replace(/\s+/g, ' ').trim();
    return { s, j };
  });

  // On parcourt les 49 etapes une par une, sans jamais toucher la souris.
  const vus = [];
  for (let i = 0; i < 70; i++) {
    vus.push(await lu());
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(60);
  }
  const fin = await lu();
  ok(fin.s === '08', `parcours integral au clavier jusqu'a la section 08 (arrive a ${fin.s})`);
  ok(erreurs.length === 0, `aucune erreur JS pendant le parcours (${erreurs.length})`);

  /* ---- 3. APPUIS TRES RAPIDES : AUCUNE ETAPE SAUTEE ------------------- */
  await p.keyboard.press('Home');
  await p.waitForTimeout(300);
  await p.keyboard.press('4'); // touche 4 -> section 03 (le schema), 6 etapes
  await p.waitForTimeout(300);
  const depart = await p.evaluate(() => document.querySelector('.releve__sonde').textContent);
  // Cinq appuis en rafale, sans aucune pause : on doit passer de 1/6 a 6/6.
  for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight', { delay: 0 });
  await p.waitForTimeout(250);
  const arrivee = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  ok(/7 \/ 7/.test(arrivee), `6 appuis en rafale -> etape 7/7 (obtenu « ${arrivee} », depart « ${depart.replace(/\s+/g,' ').trim()} »)`);

  // Toutes les couches du schema doivent etre acquises, aucune en attente.
  const couches = await p.evaluate(() => {
    const g = [...document.querySelectorAll('.schema__svg > g[data-etat]')];
    return g.map((x) => x.dataset.etat);
  });
  ok(!couches.includes('futur'), `les 7 couches du schema sont construites (${couches.join(',')})`);

  /* ---- 3 bis. RATTRAPAGE INSTANTANE ---------------------------------- */
  await p.keyboard.press('Home');
  await p.waitForTimeout(250);
  await p.keyboard.press('4');
  await p.waitForTimeout(250);
  // Trois appuis en rafale, puis on regarde TOUT DE SUITE : les traces des
  // couches depassees doivent etre acheves, pas a mi-chemin.
  for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight', { delay: 0 });
  await p.waitForTimeout(90);
  const rattrapage = await p.evaluate(() => {
    const acquis = [...document.querySelectorAll('[data-etat="acquis"] [data-anime]')];
    return acquis.map((el) => parseFloat(getComputedStyle(el).strokeDashoffset) || 0);
  });
  const enRetard = rattrapage.filter((v) => Math.abs(v) > 0.001);
  ok(
    rattrapage.length > 0 && enRetard.length === 0,
    `rattrapage instantane : ${rattrapage.length} traces depasses, ${enRetard.length} encore en cours 90 ms apres la rafale`,
  );

  /* ---- 4. RETOUR ARRIERE --------------------------------------------- */
  // On repart d'un etat connu : section 03, derniere etape.
  await p.keyboard.press('4');
  await p.waitForTimeout(220);
  for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight', { delay: 0 });
  await p.waitForTimeout(220);
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(200);
  const retour = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  ok(/6 \/ 7/.test(retour), `fleche gauche revient a l'etape 6/7 (obtenu « ${retour} »)`);

  /* ---- 5. SAUT DIRECT 1..9 ------------------------------------------- */
  await p.keyboard.press('8');
  await p.waitForTimeout(200);
  const saut = await p.evaluate(() => document.querySelector('.releve__station[aria-current="true"] .releve__numero')?.textContent);
  ok(saut === '07', `touche 8 -> section 07 (obtenu ${saut})`);

  /* ---- 6. NOTES, CONTRASTE ------------------------------------------- */
  const notesVisible = async () => p.evaluate(() => Boolean(document.querySelector('.notes')));
  ok(await notesVisible(), 'le panneau de notes est affiche en mode presentation');
  await p.keyboard.press('n');
  await p.waitForTimeout(150);
  ok(!(await notesVisible()), 'la touche N masque le panneau de notes');
  await p.keyboard.press('n');
  await p.waitForTimeout(150);

  await p.keyboard.press('c');
  await p.waitForTimeout(150);
  const contraste = await p.evaluate(() => document.documentElement.dataset.contraste);
  ok(contraste === 'fort', `la touche C active le contraste renforce (${contraste})`);
  await p.keyboard.press('c');

  /* ---- 7. LE COMPARATEUR SE MANIPULE AU CLAVIER ---------------------- */
  await p.keyboard.press('7'); // touche 7 -> section 06, le comparateur
  await p.waitForTimeout(400);
  await p.locator('.comparateur__poignee').focus();
  const avant = await p.evaluate(() => Number(document.querySelector('.comparateur__poignee').getAttribute('aria-valuenow')));
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(150);
  const apres = await p.evaluate(() => Number(document.querySelector('.comparateur__poignee').getAttribute('aria-valuenow')));
  ok(apres === avant - 8, `les fleches deplacent la poignee du comparateur (${avant} -> ${apres})`);

  // ... et l'espace continue de faire avancer l'etape meme avec le focus dessus.
  const etapeAvant = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  await p.keyboard.press('Space');
  await p.waitForTimeout(200);
  const etapeApres = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  ok(etapeAvant !== etapeApres, `l'espace avance l'etape meme avec le focus sur le comparateur (${etapeAvant} -> ${etapeApres})`);

  /* ---- 8. ECHAP REVIENT AU MODE RECIT -------------------------------- */
  await p.keyboard.press('Escape');
  await p.waitForTimeout(250);
  const mode = await p.evaluate(() => document.querySelector('.appli')?.dataset.mode);
  ok(mode === 'recit', `Echap revient au mode recit (${mode})`);

  await ctx.close();
}

/* ---- 9. FOCUS CLAVIER VISIBLE PARTOUT ---------------------------------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  let sansContour = 0, testes = 0;
  for (let i = 0; i < 25; i++) {
    await p.keyboard.press('Tab');
    const r = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const s = getComputedStyle(a);
      return { tag: a.tagName, outline: s.outlineStyle, w: s.outlineWidth };
    });
    if (!r) continue;
    testes++;
    if (r.outline === 'none' || parseFloat(r.w) === 0) sansContour++;
  }
  ok(sansContour === 0, `focus visible sur les ${testes} elements tabules (${sansContour} sans contour)`);
  await ctx.close();
}

/* ---- 10. PREFERS-REDUCED-MOTION : EXPERIENCE COMPLETE ------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE + '#/present', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1000);
  await p.keyboard.press('Space');
  await p.keyboard.press('4');
  await p.waitForTimeout(200);
  for (let i = 0; i < 6; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); }
  await p.waitForTimeout(120);
  const r = await p.evaluate(() => {
    const g = [...document.querySelectorAll('.schema__svg > g[data-etat]')];
    const d = document.querySelector('.schema__digue');
    return {
      etats: g.map((x) => x.dataset.etat),
      duree: getComputedStyle(d).transitionDuration,
      dash: getComputedStyle(d).strokeDashoffset,
    };
  });
  ok(!r.etats.includes('futur'), `reduced-motion : les 7 couches sont bien atteintes (${r.etats.join(',')})`);
  ok(parseFloat(r.duree) <= 0.002, `reduced-motion : transitions neutralisees (${r.duree})`);
  ok(parseFloat(r.dash) === 0, `reduced-motion : le trace des digues est a son etat final (dashoffset ${r.dash})`);
  await ctx.close();
}

/* ---- 11. 1024x768 ET 1920x1080 : PAS DE DEBORDEMENT -------------------- */
for (const vp of [{ width: 1024, height: 768 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
  const ctx = await nav.newContext({ viewport: vp });
  const p = await ctx.newPage();
  await p.goto(BASE + '#/present', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1000);
  await p.keyboard.press('Space');
  let debordements = 0;
  for (let s = 1; s <= 9; s++) {
    await p.keyboard.press(String(s <= 9 ? s : 1));
    await p.waitForTimeout(220);
    const d = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (d > 2) debordements++;
  }
  ok(debordements === 0, `${vp.width}x${vp.height} : aucun debordement horizontal (${debordements}/9 sections)`);
  await ctx.close();
}

/* ---- 12. AUCUN CHIFFRE AFFICHE NE DIFFERE DU DOSSIER ------------------- */
/* On releve TOUS les nombres rendus par le composant <Cote> sur les neuf
   sections, et on verifie que chacun figure dans la liste des valeurs
   autorisees -- celles de la section 7 du brief, et elles seules. */
{
  const FINE = '\u202F';   // espace insecable fine (separateur de milliers)
  const MOINS = '\u2212';  // vrai signe moins
  const AUTORISES = new Set([
    // Le projet
    `13`, `12,4`, `1${FINE}650`, `40`,
    `${MOINS}16`, `${MOINS}12`,
    // Les ouvrages
    `6${FINE}700`, `1${FINE}200`, `660`, `1${FINE}800`, `200`, `7`,
    // Avancements
    `85,4`, `44`, `20`, `40`, `53`, `57,16`, `60`,
    // Chantier et trafic
    `1${FINE}800`, `2,2`, `950${FINE}000`,
  ]);

  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '#/present', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  await p.keyboard.press('Space');

  const releves = new Set();
  const etapes = [5, 5, 4, 7, 6, 12, 4, 5, 2];
  for (let s = 0; s < 9; s++) {
    await p.keyboard.press(String(s + 1));
    await p.waitForTimeout(200);
    for (let e = 0; e < etapes[s]; e++) {
      const vus = await p.evaluate(() =>
        [...document.querySelectorAll('.cote')].map((el) => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll('.cote__unite, .cote__millesime, .cote__nuance')
            .forEach((n) => n.remove());
          return clone.textContent.trim();
        }),
      );
      vus.forEach((v) => releves.add(v));
      await p.keyboard.press('ArrowRight');
      await p.waitForTimeout(45);
    }
  }

  // Une cote peut porter son unite dans le format (« -16 m », « 44 % ») :
  // on isole la partie numerique pour la comparer.
  const normalise = (v) => v.replace(/\s*(m|%|km|ha)$/u, '').replace(/\u00A0/g, '').trim();
  const inconnus = [...releves].map(normalise).filter((v) => v && !AUTORISES.has(v));

  ok(
    inconnus.length === 0,
    `chiffres affiches : ${releves.size} releves, ${inconnus.length} hors dossier${inconnus.length ? ' -> ' + inconnus.join(' | ') : ''}`,
  );
  await ctx.close();
}

/* ---- 13. CONTRASTE DU TEXTE (WCAG) ------------------------------------ */
/* La palette est claire et pastel : c'est precisement le reglage ou le texte
   devient illisible au fond d'une salle. On mesure donc les couleurs REELLEMENT
   calculees par le navigateur, sur chaque section, et on verifie les seuils.
   La section 00 est exclue : son texte est pose sur une photographie, pas sur
   un fond uni, et repond a ses propres regles. */
{
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '#/present', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  await p.keyboard.press('Space');

  const mesure = () =>
    p.evaluate(() => {
      const lin = (c) => {
        c /= 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      /* Les couleurs sont resolues PAR LE NAVIGATEUR, via un canvas 1x1 :
         un fond declare en color-mix() se calcule en oklab(), qu'aucun
         parseur naif ne sait lire. On peint, on relit les octets sRGB. */
      const cv = document.createElement('canvas');
      cv.width = cv.height = 1;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      const versRgb = (couleur) => {
        cx.clearRect(0, 0, 1, 1);
        cx.fillStyle = '#000';
        cx.fillStyle = couleur;
        cx.fillRect(0, 0, 1, 1);
        const d = cx.getImageData(0, 0, 1, 1).data;
        return { rgb: [d[0], d[1], d[2]], a: d[3] / 255 };
      };
      const rgb = (v) => versRgb(v).rgb;
      /* Remonte jusqu'au premier ancetre au fond reellement opaque. */
      const fond = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          if (!bg) continue;
          const r = versRgb(bg);
          if (r.a > 0.92) return r.rgb;
        }
        return [255, 255, 255];
      };
      const contraste = (a, b) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };

      const resultats = [];
      const noeuds = document.querySelectorAll(
        '.section:not([data-section="intro"]) p, .section:not([data-section="intro"]) h2,' +
          '.section:not([data-section="intro"]) h3, .section:not([data-section="intro"]) h4,' +
          '.section:not([data-section="intro"]) h5, .section:not([data-section="intro"]) li,' +
          '.section:not([data-section="intro"]) dt, .section:not([data-section="intro"]) dd,' +
          '.section:not([data-section="intro"]) a, .section:not([data-section="intro"]) span.cote',
      );
      for (const el of noeuds) {
        const txt = el.textContent.trim();
        if (!txt) continue;
        const st = getComputedStyle(el);
        if (st.visibility === 'hidden' || Number(st.opacity) < 0.5) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const px = parseFloat(st.fontSize);
        const gras = Number(st.fontWeight) >= 700;
        // Seuil WCAG : 3:1 pour du gros texte (>=24 px, ou >=18.66 px en gras).
        const grosTexte = px >= 24 || (gras && px >= 18.66);
        const seuil = grosTexte ? 3 : 4.5;
        const c = contraste(rgb(st.color), fond(el));
        if (c < seuil) {
          resultats.push({
            texte: txt.slice(0, 42),
            ratio: Math.round(c * 100) / 100,
            seuil,
            px: Math.round(px),
            classe: el.className.toString().slice(0, 30),
          });
        }
      }
      return resultats;
    });

  const fautifs = [];
  for (let s = 1; s < 9; s++) {
    await p.keyboard.press(String(s + 1));
    await p.waitForTimeout(260);
    const r = await mesure();
    r.forEach((x) => fautifs.push(`s0${s} « ${x.texte} » ${x.ratio}:1 < ${x.seuil} (${x.classe})`));
  }

  ok(
    fautifs.length === 0,
    `contraste WCAG du texte sur les 8 sections de contenu${fautifs.length ? ' -> ' + fautifs.slice(0, 6).join(' | ') : ' : tout au-dessus du seuil'}`,
  );
  await ctx.close();
}

/* ---- 14. GARDE-FOUS DE PERFORMANCE ------------------------------------- */
/* Deux regressions ont reellement coute cher sur ce projet. Elles sont
   desormais testees, parce qu'aucune des deux ne se voit dans une capture
   d'ecran : elles ne se voient qu'en bougeant. */
{
  const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'load' });
  await p.waitForFunction(
    () => performance.getEntriesByType('resource').filter((r) => r.name.includes('/frames/')).length >= 60,
    { timeout: 120000 },
  );
  await p.waitForTimeout(1200);

  // (a) backdrop-filter REELLEMENT APPLIQUE. On interroge le style calcule de
  //     chaque element plutot que la feuille de style : Tailwind publie une
  //     classe utilitaire .backdrop-filter que personne n'emploie, et la
  //     chercher dans le CSS livre donnait un faux positif.
  //     Mesure A/B faite sur ce site : un flou d'arriere-plan sur la colonne
  //     fixe faisait passer le 95e centile de 16,8 ms a 100 ms et perdre 31 %
  //     des images pendant le defilement.
  const flous = await p.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((el) => {
        const s2 = getComputedStyle(el);
        const v = s2.backdropFilter || s2.webkitBackdropFilter;
        return v && v !== 'none';
      })
      .map((el) => el.className.toString().slice(0, 40) || el.tagName)
      .slice(0, 5),
  );
  ok(flous.length === 0, `aucun backdrop-filter applique${flous.length ? ' -> ' + flous.join(', ') : ''}`);

  // (b) Fluidite reelle du defilement dans l'introduction, la ou se trouve la
  //     toile. Seuil large : on cherche une regression de modele, pas a
  //     mesurer la machine.
  /* Trois passages, mediane retenue. Un seul passage sur cette machine varie
     de 5 % a 21 % : mesurer une seule fois donnerait un test qui echoue au
     hasard, ce qui est pire que pas de test du tout. */
  const passages = [];
  for (let essai = 0; essai < 3; essai++) {
    const m = await p.evaluate(async () => {
      const frames = [];
      let precedent = performance.now();
      let actif = true;
      const boucle = (t) => { frames.push(t - precedent); precedent = t; if (actif) requestAnimationFrame(boucle); };
      requestAnimationFrame(boucle);
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
      frames.length = 0;
      let y = 0;
      for (let i = 0; i < 110; i++) {
        y += 22;
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
      }
      actif = false;
      const f = frames.slice(3).sort((a, b) => a - b);
      return {
        p95: Math.round(f[Math.floor(f.length * 0.95)]),
        part: Math.round((f.filter((x) => x > 33).length / f.length) * 100),
      };
    });
    passages.push(m);
  }
  passages.sort((a, b) => a.part - b.part);
  const median = passages[1];
  const detail = passages.map((m) => `${m.part} %`).join(' / ');

  ok(
    median.part <= 20 && median.p95 <= 120,
    `defilement de l'intro : ${detail} -> mediane ${median.part} %, 95e centile ${median.p95} ms ` +
      `(seuils : 20 % et 120 ms ; avant correction : 89 % et 150 ms)`,
  );
  await ctx.close();
}

/* ---- 15. AUCUN NOM DE PRESENTATEUR A L'ECRAN --------------------------- */
/* Qui lit quoi ne regarde que les trois presentateurs. L'afficher devant la
   classe revient a montrer ses fiches. Les noms n'ont le droit d'exister que
   dans le panneau de notes, qui se masque d'une touche. */
{
  const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 } });
  const p = await ctx.newPage();
  const NOMS = ['Zayd', 'Fahd', 'Rayan'];

  const fautes = [];

  // (a) En mode recit : nulle part, le panneau de notes n'existant pas.
  await p.goto(BASE, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const enRecit = await p.evaluate((noms) => {
    const t = document.body.innerText;
    return noms.filter((n) => new RegExp(`\\b${n}\\b`).test(t));
  }, NOMS);
  enRecit.forEach((n) => fautes.push(`mode recit : « ${n} »`));

  // (b) En mode presentation : uniquement dans le panneau de notes.
  await p.goto(BASE + '#/present', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  await p.keyboard.press('Space');
  const etapes = [5, 5, 4, 7, 6, 12, 4, 5, 2];
  for (let s = 0; s < 9; s++) {
    await p.keyboard.press(String(s + 1));
    await p.waitForTimeout(160);
    for (let e = 0; e < etapes[s]; e++) {
      const hors = await p.evaluate((noms) => {
        // On lit la page SANS le panneau de notes.
        const notes = document.querySelector('.notes');
        const marque = notes ? notes.innerText : '';
        let t = document.body.innerText;
        if (marque) t = t.split(marque).join(' ');
        return noms.filter((n) => new RegExp(`\\b${n}\\b`).test(t));
      }, NOMS);
      hors.forEach((n) => {
        const cle = `presentation s0${s} : « ${n} »`;
        if (!fautes.includes(cle)) fautes.push(cle);
      });
      await p.keyboard.press('ArrowRight');
      await p.waitForTimeout(40);
    }
  }

  ok(
    fautes.length === 0,
    `aucun nom de presentateur hors du panneau de notes${fautes.length ? ' -> ' + fautes.slice(0, 5).join(', ') : ''}`,
  );
  await ctx.close();
}

await nav.close();
console.log(echecs.length === 0 ? '\nTOUT PASSE' : `\n${echecs.length} ECHEC(S)`);
process.exit(echecs.length ? 1 : 0);
