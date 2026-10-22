/**
 * Fetch official Steam art for all ModDeck games — v2, name-verified.
 *  - portrait  <id>.jpg        <- library_600x900.jpg  (Steam library cover)
 *  - landscape <id>-wide.jpg   <- capsule_616x353.jpg  (Steam capsule banner)
 * For EVERY game: storesearch -> keep only results whose store name matches the
 * expected title (normalized) -> download from that appid. No blind seed trust.
 */
import { writeFile, mkdir } from "node:fs/promises";

const OUT = "/home/z/my-project/public/games/v3";
const HDRS = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36" };

const GAMES = {
  "supermarket-together":       "Supermarket Together",
  "supermarket-simulator":      "Supermarket Simulator",
  "mall-simulator":             "Mall Simulator",
  "planet-crafter":             "The Planet Crafter",
  "gym-simulator-24":           "Gym Simulator 24",
  satisfactory:                 "Satisfactory",
  "poppy-playtime":             "Poppy Playtime",
  "tcg-card-shop-simulator":    "TCG Card Shop Simulator",
  "the-forest":                 "The Forest",
  "7-days-to-die":              "7 Days to Die",
  "gta-v":                      "Grand Theft Auto V",
  "cyberpunk-2077":             "Cyberpunk 2077",
  "elden-ring":                 "ELDEN RING",
  rdr2:                         "Red Dead Redemption 2",
  "hogwarts-legacy":            "Hogwarts Legacy",
  bg3:                          "Baldur's Gate 3",
  "witcher-3":                  "The Witcher 3: Wild Hunt",
  starfield:                    "Starfield",
  "fallout-4":                  "Fallout 4",
  "spider-man":                 "Marvel's Spider-Man Remastered",
  "diablo-iv":                  "Diablo IV",
  palworld:                     "Palworld",
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

async function searchApp(query) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&cc=us&l=en`;
  const res = await fetch(url, { headers: HDRS });
  if (!res.ok) throw new Error(`storesearch HTTP ${res.status}`);
  const data = await res.json();
  const items = data.items ?? [];
  const target = norm(query);
  // exact normalized name first, then "title contained in store name" (e.g. The Witcher 3: Wild Hunt)
  const exact = items.filter((i) => norm(i.name) === target);
  const contains = items.filter((i) => norm(i.name).includes(target) && norm(i.name) !== target);
  const pick = (exact.length ? exact : contains).sort((a, b) => norm(a.name).length - norm(b.name).length)[0];
  if (!pick) throw new Error(`no name-matched store result for "${query}" (got: ${items.slice(0, 3).map((i) => i.name).join(" | ") || "none"})`);
  return { appid: pick.id, name: pick.name, exact: exact.length > 0 };
}

async function fetchFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: HDRS });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 3000) return { buf, file: url.split("/").pop() };
      }
    } catch { /* try next */ }
  }
  throw new Error(`all ${urls.length} sources failed`);
}

const hosts = [
  "https://cdn.cloudflare.steamstatic.com/steam/apps",
  "https://cdn.akamai.steamstatic.com/steam/apps",
];
const urlsFor = (appid, file) => hosts.map((h) => `${h}/${appid}/${file}`);

const report = [];
await mkdir(OUT, { recursive: true });

for (const [id, title] of Object.entries(GAMES)) {
  try {
    const hit = await searchApp(title);
    const portrait = await fetchFirst(urlsFor(hit.appid, "library_600x900.jpg")
      .concat(urlsFor(hit.appid, "library_600x900_2x.jpg"))
      .concat(urlsFor(hit.appid, "capsule_616x353.jpg")));
    const wide = await fetchFirst(urlsFor(hit.appid, "capsule_616x353.jpg")
      .concat(urlsFor(hit.appid, "header.jpg")));
    await writeFile(`${OUT}/${id}.jpg`, portrait.buf);
    await writeFile(`${OUT}/${id}-wide.jpg`, wide.buf);
    report.push(`OK   ${id.padEnd(26)} appid=${String(hit.appid).padEnd(8)} ${hit.exact ? "EXACT" : "CONTAINS"} "${hit.name}" | ${portrait.file} ${Math.round(portrait.buf.length / 1024)}KB`);
  } catch (err) {
    report.push(`FAIL ${id.padEnd(26)} ${err.message}`);
  }
}
console.log(report.join("\n"));
const fails = report.filter((r) => r.startsWith("FAIL"));
console.log(`\n${report.length - fails.length}/${report.length} games updated`);
if (fails.length) process.exitCode = 1;
