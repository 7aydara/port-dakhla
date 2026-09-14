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
npm run verif        # 24 contrôles automatisés dans un navigateur réel
```

`npm run verif` contrôle les critères d'acceptation un par un : absence totale
de requête réseau, parcours intégral au clavier, aucune étape sautée en appuis
rapides, rattrapage instantané des animations, `prefers-reduced-motion`,
focus visible, absence de débordement en 1024×768 / 1920×1080 / 390×844,
**la conformité de tous les chiffres affichés au dossier de référence**, et
**le contraste WCAG de chaque nœud de texte** sur les huit sections de contenu.

---

## La palette

Beige et bleu ciel pastel. Les pastels sont dans les **fonds** et les
remplissages ; le texte et les accents sont des versions **profondes** des
mêmes teintes. C'est ce qui rend une palette pastel lisible : sans ça, du
pastel sur du pastel devient illisible au fond d'une salle de classe.

| Jeton | Hex | Rôle | Contraste sur le beige |
|---|---|---|---|
| `--sable` | `#F0E6D4` | fond de page | — |
| `--creme` | `#FBF6EC` | surfaces surélevées | — |
| `--ciel` | `#A9CFE4` | bleu ciel pastel, bandes de profondeur | — |
| `--sonde` | `#2F6E8A` | isobathes, filets, **et les chiffres** | 4,57:1 |
| `--encre` | `#14323F` | tout le texte | **10,90:1** |
| `--ocre` | `#8F4A1A` | ouvrages construits : digues, terre-plein | 5,37:1 |
| `--corail` | `#AE4034` | étape en cours et focus clavier, ~2 % de la surface | 4,74:1 |

Deux exceptions au fond clair, toutes deux justifiées : le **panneau de notes**
reste sombre pour se détacher quel que soit ce qu'il recouvre, et le **titre de
l'intro** est en clair parce qu'il est posé sur une photographie, pas sur le
beige.

La touche <kbd>C</kbd> ne fonctionne pas comme un thème sombre : sur fond clair,
renforcer le contraste veut dire **éclaircir le fond et approfondir l'encre**.

Deux contrôles automatisés protègent cette palette : le calcul de contraste
WCAG sur chaque nœud de texte, et une vérification statique qu'aucun `var(--x)`
ne pointe vers un jeton inexistant — une couleur qui disparaît silencieusement
ne casse rien de visible, et c'est précisément ce qui est arrivé pendant le
passage au pastel.

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

Le script sait aussi produire la séquence du **survol du chantier** (200 images,
8,4 Mo), mais elle n'est ni générée par défaut ni commitée : aucune des neuf
sections décrites dans le brief ne l'utilise. Pour la produire :

```bash
CHANTIER=1 FFMPEG=$(node -p "require('ffmpeg-static')") npm run frames
```

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
- les **coordonnées exactes du site** ne sont pas documentées : le marqueur
  suit la règle du dossier (40 km au nord de Dakhla, côte ouverte, hors baie)
  et l'indique à l'écran.

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
