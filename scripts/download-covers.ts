// Parse each /tmp/covers/<id>.json (logs precede the JSON), download first result.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";

const OUT = "/tmp/covers";
const IMG = "/home/z/my-project/public/games";

const files = readdirSync(OUT).filter((f) => f.endsWith(".json"));
const report: string[] = [];

for (const f of files) {
  const id = f.replace(".json", "");
  const raw = readFileSync(`${OUT}/${f}`, "utf8");
  const start = raw.indexOf("{");
  if (start < 0) { report.push(`${id}: NO JSON`); continue; }
  try {
    const json = JSON.parse(raw.slice(start));
    const results: { original_url?: string; original_width?: string; original_height?: string }[] = json.results ?? [];
    if (!results.length) { report.push(`${id}: EMPTY`); continue; }
    // prefer a landscape-ish image (capsules are landscape); keep original order otherwise
    const pick = results.find((r) => {
      const w = parseInt(r.original_width ?? "0", 10);
      const h = parseInt(r.original_height ?? "0", 10);
      return w >= h;
    }) ?? results[0];
    if (!pick?.original_url) { report.push(`${id}: NO URL`); continue; }
    const res = await fetch(pick.original_url);
    if (!res.ok) { report.push(`${id}: HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) { report.push(`${id}: TOO SMALL ${buf.length}B`); continue; }
    writeFileSync(`${IMG}/${id}.jpg`, buf);
    report.push(`${id}: OK ${(buf.length / 1024).toFixed(0)}KB ${pick.original_width ?? "?"}x${pick.original_height ?? "?"}`);
  } catch (e) {
    report.push(`${id}: PARSE ${(e as Error).message}`);
  }
}
console.log(report.join("\n"));
void statSync; void readFileSync;
