#!/usr/bin/env bash
# Saves the maps and the character sheet as PNGs in docs/art/, using scripts/art-sheet.html.
# Needs python3 and chromium. Run from the repo root: bash scripts/export-art.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/art
python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
sleep 1
shot() { # name, query, width, height
  chromium --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=3000 \
    --window-size="$3,$4" --screenshot="$PWD/docs/art/$1.png" "http://127.0.0.1:8765/scripts/art-sheet.html?$2" 2>/dev/null
  echo "docs/art/$1.png"
}
shot characters "sheet=characters" 1628 1680
for m in town lab garden hive field; do shot "map-$m" "sheet=map&map=$m" 1008 736; done
