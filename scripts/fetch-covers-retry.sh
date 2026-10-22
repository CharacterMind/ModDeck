#!/bin/bash
# Retry failed cover searches, 3 concurrent, with one retry pass.
OUT=/tmp/covers
mkdir -p "$OUT"

declare -a GAMES=(
  "gym-simulator-24|Gym Simulator 24 video game official cover art"
  "gta-v|Grand Theft Auto V official box art cover"
  "bg3|Baldur's Gate 3 official video game cover art"
  "hogwarts-legacy|Hogwarts Legacy official video game cover art"
  "witcher-3|The Witcher 3 Wild Hunt official cover art"
  "palworld|Palworld video game official cover art"
  "starfield|Starfield Bethesda official game cover art"
  "diablo-iv|Diablo IV official game cover art"
)

ok() { rg -q '"success": true' "$OUT/$1.json" 2>/dev/null; }

run_one() {
  local pair="$1"
  local id="${pair%%|*}"
  local q="${pair#*|}"
  ok "$id" && { echo "cached $id"; return; }
  z-ai image-search -q "$q" --count 3 --gl us --no-rank > "$OUT/$id.json" 2>/dev/null
  ok "$id" && echo "done $id" || echo "FAIL $id"
}

chunk=(); count=0
for g in "${GAMES[@]}"; do
  chunk+=("$g"); count=$((count+1))
  if [ "$count" -eq 3 ]; then
    for c in "${chunk[@]}"; do run_one "$c" & done; wait; chunk=(); count=0
  fi
done
for c in "${chunk[@]}"; do run_one "$c" & done; wait

# serial retry pass for any stragglers
for g in "${GAMES[@]}"; do
  id="${g%%|*}"
  ok "$id" || { echo "retrying $id serially"; run_one "$g"; }
done
echo "--- RETRY PHASE COMPLETE ---"
