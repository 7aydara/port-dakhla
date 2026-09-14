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
  for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight', { delay: 0 });
  await p.waitForTimeout(250);
  const arrivee = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  ok(/6 \/ 6/.test(arrivee), `5 appuis en rafale -> etape 6/6 (obtenu « ${arrivee} », depart « ${depart.replace(/\s+/g,' ').trim()} »)`);

  // Toutes les couches du schema doivent etre acquises, aucune en attente.
  const couches = await p.evaluate(() => {
    const g = [...document.querySelectorAll('.schema__svg > g[data-etat]')];
    return g.map((x) => x.dataset.etat);
  });
  ok(!couches.includes('futur'), `les 6 couches du schema sont construites (${couches.join(',')})`);

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
  for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight', { delay: 0 });
  await p.waitForTimeout(220);
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(200);
  const retour = await p.evaluate(() => document.querySelector('.releve__sonde').textContent.replace(/\s+/g,' ').trim());
  ok(/5 \/ 6/.test(retour), `fleche gauche revient a l'etape 5/6 (obtenu « ${retour} »)`);

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
  for (let i = 0; i < 5; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); }
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
  ok(!r.etats.includes('futur'), `reduced-motion : les 6 couches sont bien atteintes (${r.etats.join(',')})`);
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
  const etapes = [5, 5, 4, 6, 6, 12, 4, 5, 2];
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

await nav.close();
console.log(echecs.length === 0 ? '\nTOUT PASSE' : `\n${echecs.length} ECHEC(S)`);
process.exit(echecs.length ? 1 : 0);
