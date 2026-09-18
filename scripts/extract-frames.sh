#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Extrait les sequences d'images des videos sources vers public/frames/.
#
# POURQUOI DES IMAGES ET PAS UNE BALISE <video> :
# le currentTime d'un element video n'est pas fiable sur Safari et iOS. Le
# scrub saccade et se desynchronise du scroll. On prechauffe donc une
# sequence d'images webp et on la dessine dans un <canvas>.
#
# Sorties :
#   public/frames/hero/hd/0001.webp .. (1280 px)  -- intro plein ecran
#   public/frames/hero/sd/0001.webp .. ( 640 px)  -- repli basse definition
#   public/frames/chantier/hd/ (1024 px) et /sd/ (640 px)
#   public/frames/hero/poster.jpg  -- image fixe si le prechargement echoue
#   public/media/avant.webp / aujourdhui.webp -- comparateur section 6
#
# Prerequis : ffmpeg sur le PATH, ou variable FFMPEG pointant sur le binaire.
#   npm install ffmpeg-static && FFMPEG=$(node -p "require('ffmpeg-static')")
# Usage : npm run frames
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."

FFMPEG="${FFMPEG:-ffmpeg}"
command -v "$FFMPEG" >/dev/null 2>&1 || [ -x "$FFMPEG" ] || {
  echo "ffmpeg introuvable. Installer ffmpeg, ou :" >&2
  echo "  npm i -D ffmpeg-static && FFMPEG=\$(node -p \"require('ffmpeg-static')\") npm run frames" >&2
  exit 1
}

SRC=assets-source
OUT=public/frames

# Les sources sont en 1280x720. Toute largeur superieure ne ferait
# qu'agrandir du vide : on plafonne a 1280.
sequence() { # nom  fichier  fps  largeur  qualite  sousdossier
  local nom="$1" fichier="$2" fps="$3" largeur="$4" qualite="$5" sous="$6"
  local dir="$OUT/$nom/$sous"
  [ -e "$SRC/$fichier" ] || { echo "  source absente : $SRC/$fichier -- ignoree"; return; }
  rm -rf "$dir"; mkdir -p "$dir"
  "$FFMPEG" -y -loglevel error -i "$SRC/$fichier" \
    -vf "fps=$fps,scale=$largeur:-2:flags=lanczos" \
    -c:v libwebp -quality "$qualite" -compression_level 6 -preset picture \
    "$dir/%04d.webp"
  local n; n=$(find "$dir" -name '*.webp' | wc -l)
  printf "  %-10s %-3s images  %-5s px  %s\n" "$nom/$sous" "$n" "$largeur" "$(du -sh "$dir" | cut -f1)"
}

# 72 images, pas 152. Sur les ~2000 px de scroll de l'intro, cela fait une
# image tous les 27 px : la difference avec 152 est imperceptible, mais le
# poids est divise par deux et chaque image peut etre PLUS grande et de
# meilleure qualite. Le navigateur ne charge qu'UNE des deux echelles,
# choisie au runtime selon la taille de l'ecran -- jamais les deux.
echo "Sequence d'intro (survol de la cote saharienne)"
sequence hero hero.mp4 9 1440 74 hd
sequence hero hero.mp4 9  960 70 sd

# Survol du chantier : la vue reelle du site, accouplee au schema en
# section 03. Soixante images suffisent -- le panneau est deux fois plus petit
# que l'intro et la camera avance par etapes, pas au fil du defilement.
echo "Survol du chantier (vue reelle, section 03)"
sequence chantier chantier.mp4 6 1100 72 hd
sequence chantier chantier.mp4 6  700 66 sd

echo "Images fixes"
# Repli de l'intro : si le prechargement des images echoue, on affiche celle-ci.
[ -e "$SRC/hero.mp4" ] && "$FFMPEG" -y -loglevel error -i "$SRC/hero.mp4" \
  -vf "select='eq(n\,0)',scale=1280:-2" -frames:v 1 -q:v 4 "$OUT/hero/poster.jpg" \
  && echo "  hero/poster.jpg  $(du -h "$OUT/hero/poster.jpg" | cut -f1)"

# Comparateur section 6. Meme cadrage, deux etats du meme plan.
#   AVANT      = image 0 : la cote vierge, avant tout amenagement.
#   AUJOURDHUI = image 110 : digues, viaduc et terre-plein en travaux.
# On n'utilise PAS les dernieres images de transformation.mp4 : elles montrent
# un port ACHEVE (portiques, parc de stockage), etat qui n'existera pas avant
# 2029. L'afficher comme "aujourd'hui" serait une donnee inventee.
mkdir -p public/media
if [ -e "$SRC/transformation.mp4" ]; then
  "$FFMPEG" -y -loglevel error -i "$SRC/transformation.mp4" \
    -vf "select='eq(n\,0)',scale=1280:-2" -frames:v 1 -c:v libwebp -quality 78 \
    public/media/comparateur-avant.webp
  "$FFMPEG" -y -loglevel error -i "$SRC/transformation.mp4" \
    -vf "select='eq(n\,110)',scale=1280:-2" -frames:v 1 -c:v libwebp -quality 78 \
    public/media/comparateur-aujourdhui.webp
  # Etat projete a la mise en service (2029). Etiquete comme projection,
  # jamais comme photographie d'aujourd'hui.
  "$FFMPEG" -y -loglevel error -i "$SRC/transformation.mp4" \
    -vf "select='eq(n\,236)',scale=1280:-2" -frames:v 1 -c:v libwebp -quality 78 \
    public/media/projection-2029.webp
  for f in comparateur-avant comparateur-aujourdhui projection-2029; do
    echo "  media/$f.webp  $(du -h "public/media/$f.webp" | cut -f1)"
  done
fi

echo
echo "Poids total des medias : $(du -sh public/frames public/media | awk '{s=$1; print}' | tr '\n' ' ')"
echo "Total public/ : $(du -sh public | cut -f1)"
