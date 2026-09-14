#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Vendorise les polices dans public/fonts/ pour un fonctionnement HORS LIGNE.
# Les .woff2 produits sont COMMITES dans le depot : aucune requete reseau
# au runtime, aucun CDN, aucun Google Fonts.
#
# Deux familles, toutes deux sous licence OFL :
#   - Atkinson Hyperlegible : texte courant. Dessinee par le Braille Institute
#     pour la lisibilite a distance et en basse vision -- choix motive par la
#     projection devant une classe, pas par le gout.
#   - Iosevka : chiffres, cotes, legendes, schema. Monospace etroite a
#     chiffres tabulaires par construction.
#
# Iosevka pese 1 Mo par graisse chez Fontsource (enorme jeu de ligatures et de
# symboles). Comme elle ne sert QUE aux chiffres et aux libelles courts, on la
# sous-ensemble avec pyftsubset -> environ 25 Ko par graisse.
#
# Prerequis : npm install, puis  pip install fonttools brotli
# Usage     : npm run fonts
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=public/fonts
mkdir -p "$DEST"
manquants=0

# Jeu de caracteres conserve pour Iosevka.
# Latin de base + lettres accentuees francaises + ponctuation + signes
# techniques : U+2212 vrai moins (pour "-16 m"), U+00B0 degre, U+00B7 point
# median, U+00A0/U+202F espaces insecables, U+2013/U+2014 tirets,
# U+00AB/U+00BB guillemets francais, U+2192 fleche, U+203A chevron simple.
UNICODES='U+0020-007E,U+00A0,U+00A7,U+00AB,U+00B0,U+00B7,U+00BB,U+00C0-00FF,U+0152-0153,U+0178,U+2013,U+2014,U+2018-201A,U+201C-201E,U+2026,U+202F,U+2039-203A,U+2192,U+2212,U+2248'

copie() { # paquet fichier  -- copie telle quelle
  local src="node_modules/$1/files/$2"
  if [ -e "$src" ]; then cp -f "$src" "$DEST/"
  else echo "  ABSENT : $2"; manquants=$((manquants + 1)); fi
}

sousensemble() { # paquet fichier  -- copie en sous-ensemblant
  local src="node_modules/$1/files/$2"
  if [ ! -e "$src" ]; then echo "  ABSENT : $2"; manquants=$((manquants + 1)); return; fi
  python3 -m fontTools.subset "$src" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,tnum,zero' \
    --flavor=woff2 \
    --output-file="$DEST/$2" \
    --no-hinting --desubroutinize >/dev/null
}

echo "Atkinson Hyperlegible (texte courant, copie integrale -- deja legere)"
copie @fontsource/atkinson-hyperlegible atkinson-hyperlegible-latin-400-normal.woff2
copie @fontsource/atkinson-hyperlegible atkinson-hyperlegible-latin-400-italic.woff2
copie @fontsource/atkinson-hyperlegible atkinson-hyperlegible-latin-700-normal.woff2

echo "Iosevka (chiffres et cotes, sous-ensemblee)"
sousensemble @fontsource/iosevka iosevka-latin-400-normal.woff2
sousensemble @fontsource/iosevka iosevka-latin-400-italic.woff2
sousensemble @fontsource/iosevka iosevka-latin-500-normal.woff2
sousensemble @fontsource/iosevka iosevka-latin-700-normal.woff2

if [ "$manquants" -gt 0 ]; then
  echo "$manquants fichier(s) manquant(s) -- lancer 'npm install' d'abord." >&2
  exit 1
fi

echo
echo "Polices vendorisees dans $DEST :"
ls -1sh "$DEST" | tail -n +2
echo "Total polices : $(du -sh "$DEST" | cut -f1)"
