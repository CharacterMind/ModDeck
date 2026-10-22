#!/bin/bash
# Fetch real cover art for every ModDeck game via z-ai image-search.
# Resumable: skips ids whose search JSON already exists.

OUT=/tmp/covers
IMG=/home/z/my-project/public/games
mkdir -p "$OUT" "$IMG"

declare -a GAMES=(
  "supermarket-together|Supermarket Together co-op supermarket video game official cover art"
  "supermarket-simulator|Supermarket Simulator Steam video game official cover art"
  "mall-simulator|Mall Simulator Steam video game official cover art"
  "planet-crafter|The Planet Crafter survival video game official cover art"
  "gym-simulator-24|Gym Simulator 24 video game official cover art"
  "gta-v|Grand Theft Auto V official box art cover"
  "cyberpunk-2077|Cyberpunk 2077 official video game cover art"
  "elden-ring|Elden Ring official video game cover art"
  "rdr2|Red Dead Redemption 2 official box art cover"
  "hogwarts-legacy|Hogwarts Legacy official video game cover art"
  "bg3|Baldur's Gate 3 official video game cover art"
  "witcher-3|The Witcher 3 Wild Hunt official cover art"
  "starfield|Starfield Bethesda official game cover art"
  "fallout-4|Fallout 4 official video game cover art"
  "spider-man|Marvel's Spider-Man Remastered official game cover art"
  "diablo-iv|Diablo IV official game cover art"
  "palworld|Palworld video game official cover art"
)

run_one() {
  local pair="$1"
  local id="${pair%%|*}"
  local q="${pair#*|}"
  if [ -s "$OUT/$id.json" ]; then echo "skip $id (cached)"; return; fi
  z-ai image-search -q "$q" --count 3 --gl us --no-rank > "$OUT/$id.json" 2>/dev/null \
    && echo "done $id" || echo "FAIL $id"
}

# parallel in chunks of 6
chunk=()
count=0
for g in "${GAMES[@]}"; do
  chunk+=("$g")
  count=$((count+1))
  if [ "$count" -eq 6 ]; then
    for c in "${chunk[@]}"; do run_one "$c" & done
    wait
    chunk=(); count=0
  fi
done
for c in "${chunk[@]}"; do run_one "$c" & done
wait

echo "--- SEARCH PHASE COMPLETE ---"
