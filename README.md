# Le port Dakhla Atlantique

Site interactif d'une seule page, en français, pour un exposé de géographie
présenté en classe par **Zayd**, **Fahd** et **Rayan**.

Deux modes d'usage, le même contenu :

- **Mode récit** — on scrolle, l'histoire se déroule. Pour réviser, et pour
  partager le lien.
- **Mode présentation** — le scroll est neutralisé, le clavier fait avancer
  chaque étape. C'est le mode de l'oral. Il s'active par l'URL `#/present` ou
  par la touche <kbd>P</kbd>.

---

## Démarrer

```bash
npm install
npm run dev          # développement
npm run build        # production -> dist/
npx serve dist       # sert dist/, fonctionne wifi coupé
```

### Vérifier que tout tient

```bash
npx serve dist &     # sur le port 5055
npm run verif        # 26 contrôles automatisés dans un navigateur réel
```

`npm run verif` contrôle les critères d'acceptation un par un : absence totale
de requête réseau, parcours intégral au clavier, aucune étape sautée en appuis
rapides, rattrapage instantané des animations, `prefers-reduced-motion`,
focus visible, absence de débordement en 1024×768 / 1920×1080 / 390×844,
**la conformité de tous les chiffres affichés au dossier de référence**, et
**le contraste WCAG de chaque nœud de texte** sur les huit sections de contenu.

---

## Performance

L'introduction a été refaite après mesure. Voici ce qu'elle valait, et ce
qu'elle vaut.

| | Avant | Après |
|---|---|---|
| Attente avant de pouvoir défiler | **6,9 s** | 2,2 s |
| Fluidité dans l'intro | **13 i/s**, 89 % d'images perdues | **60 i/s**, 1 % |
| 95ᵉ centile du temps par image | 150 ms | **17 ms** |
| Poids du site | 9,5 Mo | **6,7 Mo** |
| Requêtes | 317 | 68 |

### Ce qui n'allait pas, dans l'ordre où ça a été trouvé

**1. React re-rendait tout l'arbre à chaque image de défilement.** Le hook de
scroll poussait une progression continue dans un état React : 706 mutations du
DOM pour 40 images. Or une section n'a pas besoin d'une progression continue,
elle a besoin d'un **numéro d'étape**, un entier. `useEtapeAuScroll` ne réveille
donc React que lorsque cet entier change.

*Ce n'était pas le canvas :* un `drawImage` coûte 0,02 ms et le premier
décodage d'une image 0,1 ms. Les deux ont été mesurés avant d'accuser qui que
ce soit.

**2. `backdrop-filter`.** Un flou d'arrière-plan sur la colonne fixe, au-dessus
d'un contenu qui défile, oblige le navigateur à refaire le flou à chaque image.
Test A/B sur la même page : 95ᵉ centile de 100 ms → 16,8 ms, images perdues de
31 % → 2 %. Supprimé partout.

**3. Le modèle du scrub lui-même.** Coller l'image au défilement oblige à
repeindre et retransmettre une toile plein écran soixante fois par seconde.
Plafonner la résolution et la cadence réduisait le coût sans jamais le
supprimer. L'introduction avance désormais par **mouvements de caméra francs**,
un par étape, interpolés en sortie douce sur 850 ms — dans les deux modes.
Entre deux étapes, la toile ne consomme rien.

C'est aussi un meilleur parti pris : un survol aérien scrubé sur trois hauteurs
d'écran est le geste le plus commun du web actuel, et il ne sert pas le propos.
Ce qui le sert, c'est la plongée — et elle se lit mieux en mouvements posés,
pendant lesquels le présentateur parle sur une image stable.

**4. Deux couches plein écran superposées.** Le voile de lisibilité était une
`div` par-dessus la toile. Il est maintenant peint *dans* la toile : une couche
au lieu de deux.

**5. Les deux définitions étaient chargées.** Basse puis haute : 304 requêtes
pour 72 images utiles. Une seule échelle est désormais choisie au montage selon
l'écran et la connexion.

**6. Le préchargement bloquait tout.** Le brief demandait de précharger avant
d'autoriser le défilement ; attendre la séquence entière immobilisait la page
près de sept secondes. On n'attend plus que la première passe — neuf images —
et une échéance rend la main quoi qu'il arrive. Les passes suivantes se
chargent en **temps mort** (`requestIdleCallback`), pour ne jamais concurrencer
le défilement.

### Le système de durées

Un unique 1,4 s pour toutes les animations rendait l'ensemble poussif. Trois
durées, trois usages :

| Jeton | Durée | Usage |
|---|---|---|
| `--t-revele` | 0,42 s | un bloc, un chiffre, une carte qui apparaît |
| `--t-trace` | 1,2 s | le dessin des ouvrages du schéma, suivi à l'oral |
| `--t-camera` | 0,85 s | recadrage de carte, mouvement de l'introduction |

### Deux garde-fous

`npm run verif` contrôle désormais qu'aucun `backdrop-filter` n'est appliqué
(vérifié sur le style **calculé**, pas dans la feuille de style) et que le
défilement de l'introduction reste sous 20 % d'images perdues — médiane de
trois passages, parce qu'un seul varie trop pour être un test.

---

## La palette

Elle n'est pas choisie sur un moodboard : elle est **prélevée dans la carte
officielle du Royaume** utilisée en section 02. Les trois couleurs dominantes
de ce fond de carte sont reprises telles quelles, et le reste en découle. Le
site et la carte appartiennent ainsi au même monde — celui de la cartographie
institutionnelle marocaine — au lieu de se juxtaposer.

| Jeton | Hex | Rôle | Contraste sur le champ |
|---|---|---|---|
| `--champ` | `#E6ECF7` | fond de page (le bleu du panneau de la carte) | — |
| `--papier` | `#F7F9FD` | surfaces surélevées | — |
| `--azur` | `#B3C9E8` | bandes de profondeur | — |
| `--trame` | `#2C4770` | isobathes, filets, graduations | 7,90:1 |
| `--encre` | `#0F2038` | tout le texte | **13,79:1** |
| `--carmin` | `#BC0A22` | **le carmin exact de la carte**, prélevé au pixel : les ouvrages construits et les chiffres clés | 5,52:1 |
| `--or` | `#7D5F08` | l'or de l'écusson, assombri. Étape en cours et focus clavier | 5,04:1 |
| `--vert` | `#1A6B5A` | troisième teinte de graphique (les trois quais) | 5,02:1 |

Le carmin est la couleur du territoire sur la carte ; ici, celle de ce que le
pays y construit.

La borne basse du dégradé de fond est calée sur le contraste, pas sur le goût :
plus soutenue, le carmin y passait sous 4,5:1 pour du texte courant.

Deux exceptions au fond clair, toutes deux justifiées : le **panneau de notes**
reste sombre pour se détacher quel que soit ce qu'il recouvre, et le **titre de
l'intro** est en clair parce qu'il est posé sur une photographie.

La touche <kbd>C</kbd> ne fonctionne pas comme un thème sombre : sur fond clair,
renforcer le contraste veut dire **éclaircir le fond et approfondir l'encre**.

Deux contrôles automatisés protègent cette palette : le calcul de contraste
WCAG sur chaque nœud de texte, et une vérification statique qu'aucun `var(--x)`
ne pointe vers un jeton inexistant.

---

## Déploiement

Le dépôt contient un `vercel.json` **et** un `netlify.toml` : ni l'un ni l'autre
hébergeur n'a quoi que ce soit à deviner. Les deux disent la même chose.

| Réglage | Valeur |
|---|---|
| Build command | `npm run build` |
| Output / publish directory | `dist` |
| Install command | `npm ci` |
| Node | 22 (`engines` dans `package.json`, lu par Vercel) |

Les deux fichiers posent aussi les en-têtes de cache : le site pèse 6,7 Mo,
dont l'essentiel en séquence d'images. Sans eux, chaque visite les retélécharge.

**Le piège à éviter.** Ce qu'il faut publier, c'est `dist/`, jamais la racine
du dépôt. La racine contient un `index.html` de développement qui pointe sur
`/src/main.tsx` — un navigateur ne sait pas exécuter du TypeScript, donc la
page reste **blanche**, sans message d'erreur. C'est le symptôme d'un
hébergeur qui sert le dépôt au lieu de le construire.

Si le site est déjà déployé avec de mauvais réglages, les modifier dans
l'interface ne suffit pas : il faut relancer un déploiement. Sur Netlify,
*Trigger deploy → Clear cache and deploy site* ; sur Vercel, *Deployments → …
→ Redeploy*, sans cocher « Use existing Build Cache ».

**Sans passer par git** : `npm run build`, puis glisser le contenu de `dist/`
sur app.netlify.com/drop, ou `npx vercel deploy --prebuilt` côté Vercel.

Aucune redirection attrape-tout n'est configurée, et c'est volontaire : le
site n'a qu'une seule URL — la navigation se fait par fragment (`#/present`),
côté navigateur. Une règle `/* → /index.html 200` renverrait la page HTML à la
place des fichiers absents, ce qui casserait le repli de la section 02 pour
`media/carte-maroc.jpg`.

---

## Fonctionnement hors ligne

Le wifi de l'établissement n'est pas fiable, donc **aucun appel réseau au
runtime** : pas de CDN, pas de Google Fonts, rien.

- Les polices sont vendorisées dans `public/fonts/` et commitées
  (`npm run fonts`).
- Les séquences d'images et les photos sont dans `public/`.
- Les liens vers les sources sont cliquables mais jamais chargés par le site.

La seule requête qui peut échouer est `media/carte-maroc.jpg`, volontairement
absente : son absence déclenche l'emplacement réservé (voir plus bas).

---

## Commandes du mode présentation

| Touche | Effet |
|---|---|
| <kbd>→</kbd> <kbd>Espace</kbd> | Étape suivante |
| <kbd>←</kbd> | Étape précédente |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Section suivante / précédente, à la première étape |
| <kbd>1</kbd>…<kbd>9</kbd> | Saut direct — <kbd>1</kbd> = section 00, <kbd>9</kbd> = section 08 |
| <kbd>N</kbd> | Panneau de notes du présentateur |
| <kbd>F</kbd> | Plein écran |
| <kbd>T</kbd> | Chronomètre de l'oral |
| <kbd>C</kbd> | Contraste renforcé — salle claire ou vidéoprojecteur fatigué |
| <kbd>P</kbd> | Basculer récit / présentation |
| <kbd>Échap</kbd> | Revenir au mode récit |
| <kbd>?</kbd> | Rappel des raccourcis |

Le numéro de raccourci de chaque section est affiché dans la colonne de relevé,
à gauche : les sections sont numérotées 00 à 08, les touches vont de 1 à 9.

Une touche maintenue **n'enchaîne pas** les étapes : une pression = une étape.
En revanche, des pressions rapides ne sautent jamais d'étape, et une animation
en cours se termine instantanément dès l'appui suivant.

---

## Architecture

```
src/
  content/     contenu éditorial, séparé du code, entièrement typé
  sections/    un composant par section
  components/  composants partagés (canvas, comparateur, schéma du port)
  hooks/       useStepper, useScrollProgress, useFrameSequence, useRattrapage
  styles/      jetons, mise en page, schéma, sections
public/
  frames/      séquences d'images du canvas (hd + sd)
  media/       photos et cartes
  fonts/       polices locales
scripts/
  extract-frames.sh   extraction des images depuis assets-source/
  vendor-fonts.sh     vendorisation et sous-ensemblage des polices
  verification.mjs    contrôles d'acceptation
```

### Le moteur d'étapes

L'état global tient en un couple `{ section, étape }`. Les deux modes le
produisent — le clavier directement, le scroll via `progressionVersEtape()` —
puis la suite du code est identique. **La logique d'animation n'est écrite
qu'une seule fois**, dans les composants de section, qui lisent leur étape via
`EtapeContext`.

Chaque section déclare ses étapes dans `src/content/sections.ts`, avec pour
chacune **qui parle et ce qu'il dit**. Le nombre d'étapes se déduit de cette
liste : le script oral et l'animation ne peuvent donc pas se désynchroniser.

### Pourquoi pas GSAP

Le brief laissait le choix. Le site n'en utilise pas, pour une raison
d'architecture plutôt que de poids.

GSAP est piloté par une tête de lecture : une timeline possède son propre
temps. Or le brief décrit un modèle piloté par l'état — « chaque section
déclare un nombre d'étapes et une fonction qui applique l'état correspondant
à l'index ». Brancher un index discret externe sur une timeline GSAP revient à
lui disputer la propriété de son playhead à chaque appui, et cela se paie
précisément sur la contrainte la plus dure : « si on appuie pendant une
animation, elle se termine instantanément ».

En modèle état → CSS, cette contrainte tient en trois lignes, et
`prefers-reduced-motion` devient une media query au lieu d'un branchement dans
chaque tween. ScrollTrigger n'aurait servi qu'au scrub de l'intro, soit une
soixantaine de lignes d'`IntersectionObserver` déjà nécessaires par ailleurs.

### Le rattrapage instantané

Une couche qui passe de « en cours » à « acquise » ne change pas de valeurs CSS
cibles : sa transition continuerait sa course. `src/hooks/useRattrapage.ts`
l'annule explicitement en posant `transition: none` puis en forçant un reflow.
Baisser `transition-duration` ne suffirait pas — d'après la spécification, une
transition déjà lancée ignore les changements des propriétés `transition-*`.

---

## Les médias

Les vidéos brutes vivent dans `assets-source/`. Pour régénérer les images :

```bash
npm i -D ffmpeg-static
FFMPEG=$(node -p "require('ffmpeg-static')") npm run frames
```

Poids mesurés : environ 41 Ko par image en 1280 px, 28 Ko en 1024 px, 13 Ko en
640 px. Le site complet pèse **9,6 Mo**, largement sous la limite de 25 Mo.

Le **survol du chantier** (60 images, 2 Mo) alimente la vue réelle de la
section 03.

### Pourquoi le plan et la photo ne sont pas superposés

Le survol filmé est une vue **oblique**, prise d'assez bas ; le schéma est une
vue **en plan**. Poser l'un sur l'autre laisserait croire que les traits du
schéma désignent ce qu'on voit sur la photographie — ce qui serait faux, les
deux géométries ne se correspondent pas. Sur un travail de géographie, c'est
une faute, pas un effet.

Les deux sont donc **accouplés** : ils avancent ensemble, étape par étape. À
gauche le plan, comment ça s'organise ; à droite le site réel, à quoi ça
ressemble. La correspondance se fait par l'étape, pas par le pixel, et la
figure le dit.

### Honnêteté des images

Les séquences aériennes sont des **images d'illustration**. Elles ne
documentent pas l'état réel du chantier de Ntirift à une date donnée, et le
site le dit à l'écran.

La vidéo `transformation.mp4` va jusqu'à montrer un port **achevé** —
portiques, parc de stockage, navire à quai. Cet état n'existera pas avant
2029. Le comparateur de la section 06 utilise donc l'image 0 (côte vierge) et
l'image 110 (travaux en cours), **jamais** les dernières. Les afficher comme
« aujourd'hui » serait une donnée inventée.

### Fichiers encore attendus

| Fichier | Contenu attendu |
|---|---|
| `public/media/carte-maroc.jpg` | Carte du Maroc entier, nord en haut, façade atlantique dégagée, ~1600 px de large |

Tant qu'il manque, la section 02 affiche un cadre portant le nom exact du
fichier, et le schéma de principe de la côte porte l'information à sa place.
Déposer le fichier suffit à l'activer.

---

## Les données

Tous les chiffres proviennent du dossier de référence listé dans
`src/content/sources.ts`. **Aucun n'est estimé.** Quand une donnée manque, elle
reste un `TODO` visible plutôt qu'un chiffre approché :

- la longueur du **poste pétrolier** n'est pas documentée : la légende affiche
  la réserve, pas une valeur ;
- le **pôle de réparation navale** n'a pas de profondeur documentée,
  contrairement au port de commerce (−16 m) et au port de pêche (−12 m) : rien
  n'est affiché plutôt qu'une extrapolation ;
- le **rattachement communal** reste à vérifier : la carte régionale montre
  El Argoub au sud-est de Dakhla, alors que le port est au nord, à N'Tireft.
  Les deux énoncés du dossier peuvent se concilier si la commune s'étend vers
  le nord ; le point est signalé, pas tranché.

### Le chiffre des 40 km, vérifié

La distance Dakhla / N'Tireft mesure 366 px sur la carte régionale. Le dossier
la donne pour 40 km, soit 110 m par pixel. **Vérification croisée** : à cette
échelle, la presqu'île de Dakhla mesure une trentaine de kilomètres, ce qui
correspond à sa longueur réelle. Le chiffre du dossier tient, et l'échelle
graphique de la figure en découle.

### Deux écarts par rapport au brief, assumés

1. Le brief annonce « six objectifs, **cinq** défis », mais sa liste factuelle
   en contient **six** (inégalités, mobilités, emploi, eau, littoral, pêche).
   Les six sont conservés — en retirer un supprimerait un contenu fourni.
2. Le brief situe le site à la fois dans la « commune rurale d'El Argoub » et
   « à 40 km au **nord** de Dakhla, sur la côte atlantique ouverte ». El Argoub
   est généralement décrite au sud-est de Dakhla, côté baie. Les deux énoncés
   peuvent se concilier, mais le point mérite vérification : il est signalé à
   l'écran, pas tranché.

---

## Accessibilité

- Focus visible sur tous les éléments tabulables, sans exception.
- Le comparateur avant/après se manipule au clavier (<kbd>←</kbd> <kbd>→</kbd>,
  <kbd>Maj</kbd> pour un pas large), et son contenu est décrit pour les
  lecteurs d'écran.
- `prefers-reduced-motion: reduce` donne l'expérience **complète** : les états
  finaux sont atteints immédiatement, la séquence des étapes reste entière.
- Contraste WCAG vérifié par le calcul sur chaque nœud de texte : 4,5:1 pour le
  texte courant, 3:1 pour le gros texte. Aucune exception.
- Sur les sections longues, l'élément dont le présentateur est en train de
  parler est automatiquement ramené dans le champ — sans jamais faire défiler
  l'en-tête de section, qui reste son repère.
- Lien d'évitement en première tabulation.
- Le schéma du port porte un `<title>` et une `<desc>` qui décrivent les six
  couches.
