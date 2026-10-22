/**
 * ModDeck — fetch official Steam art for every game.
 * 1. Resolve app IDs via storesearch API (best-name match)
 * 2. Download library_600x900.jpg  -> public/games/v2/<id>.jpg        (portrait cover)
 * 3. Download capsule_616x353.jpg  -> public/games/v2/<id>-wide.jpg   (wide banner; fallbacks: header.jpg, library_hero.jpg)
 * Validates JPEG magic bytes + size, prints summary table.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const OUT_DIR = join(ROOT, "public/games/v2");
mkdirSync(OUT_DIR, { recursive: true });

/** [localId, steamSearchTerm] — localId matches games.ts `id` fields */
const GAMES = [
  ["supermarket-together", "Supermarket Together"],
  ["supermarket-simulator", "Supermarket Simulator"],
  ["mall-simulator", "Mall Simulator"],
  ["planet-crafter", "The Planet Crafter"],
  ["gym-simulator-24", "Gym Simulator 24"],
  ["satisfactory", "Satisfactory"],
  ["poppy-playtime", "Poppy Playtime"],
  ["tcg-card-shop-simulator", "TCG Card Shop Simulator"],
  ["the-forest", "The Forest"],
  ["7-days-to-die", "7 Days to Die"],
  ["gta-v", "Grand Theft Auto V"],
  ["cyberpunk-2077", "Cyberpunk 2077"],
  ["elden-ring", "Elden Ring"],
  ["rdr2", "Red Dead Redemption 2"],
  ["hogwarts-legacy", "Hogwarts Legacy"],
  ["bg3", "Baldur's Gate 3"],
  ["witcher-3", "The Witcher 3"],
  ["starfield", "Starfield"],
  ["fallout-4", "Fallout 4"],
  ["spider-man", "Marvel's Spider-Man Remastered"],
  ["diablo-iv", "Diablo IV"],
  ["palworld", "Palworld"],
];

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchAppId(term) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=en`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`search HTTP ${res.status}`);
  const data = await res.json();
  const items = (data.items ?? []).filter((it) => it.type === "app");
  if (!items.length) return null;
  const target = norm(term);
  // exact normalized name match wins; otherwise first result
  const exact = items.find((it) => norm(it.name) === target);
  return exact ?? items[0];
}

async function downloadJpeg(url, dest) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: "follow" });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  // JPEG magic: FF D8 FF, and > 8 KB to reject error pages
  if (buf.length < 8192 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return false;
  writeFileSync(dest, buf);
  return true;
}

const appBase = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}`;

const rows = [];
for (const [localId, term] of GAMES) {
  try {
    const hit = await searchAppId(term);
    if (!hit) {
      rows.push({ localId, term, appId: "-", name: "NO MATCH", cover: "FAIL", wide: "FAIL" });
      continue;
    }
    // portrait cover: official Steam library art
    let cover = await downloadJpeg(`${appBase(hit.id)}/library_600x900.jpg`, join(OUT_DIR, `${localId}.jpg`));
    // wide banner: logo capsule first, then header, then hero
    let wide =
      (await downloadJpeg(`${appBase(hit.id)}/capsule_616x353.jpg`, join(OUT_DIR, `${localId}-wide.jpg`))) ||
      (await downloadJpeg(`${appBase(hit.id)}/header.jpg`, join(OUT_DIR, `${localId}-wide.jpg`))) ||
      (await downloadJpeg(`${appBase(hit.id)}/library_hero.jpg`, join(OUT_DIR, `${localId}-wide.jpg`)));
    rows.push({ localId, term, appId: hit.id, name: hit.name, cover: cover ? "OK" : "FAIL", wide: wide ? "OK" : "FAIL" });
    console.log(`${cover && wide ? "✓" : "✗"} ${term} -> app ${hit.id} (${hit.name}) cover:${cover ? "OK" : "FAIL"} wide:${wide ? "OK" : "FAIL"}`);
  } catch (err) {
    rows.push({ localId, term, appId: "ERR", name: String(err.message ?? err), cover: "FAIL", wide: "FAIL" });
    console.error(`✗ ${term} -> ${err.message ?? err}`);
  }
  await sleep(350); // be polite to the API
}

console.log("\n=== SUMMARY ===");
const fails = rows.filter((r) => r.cover === "FAIL" || r.wide === "FAIL");
console.log(`${rows.length - fails.length}/${rows.length} games fully updated`);
if (fails.length) {
  console.log("FAILURES:");
  fails.forEach((r) => console.log(` - ${r.term} (${r.appId} ${r.name}): cover=${r.cover} wide=${r.wide}`));
}

// app-id map for games.ts provenance comment
console.log("\n=== APP ID MAP ===");
rows.forEach((r) => console.log(`${r.localId}: ${r.appId} // ${r.name}`));
