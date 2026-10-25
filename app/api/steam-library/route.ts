import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function parseVdfValue(vdf: string, key: string): string[] {
  const re = new RegExp(`"${key}"\\s+"([^"]+)"`, 'gi');
  const results: string[] = [];
  let m;
  while ((m = re.exec(vdf)) !== null) {
    results.push(m[1].replace(/\\\\/g, '\\'));
  }
  return results;
}

function parseSingleValue(acf: string, key: string): string {
  const m = new RegExp(`"${key}"\\s+"([^"]+)"`, 'i').exec(acf);
  return m ? m[1] : '';
}

export async function GET() {
  try {
    // Common Steam install locations on Windows
    const steamRoots = [
      'C:\\Program Files (x86)\\Steam',
      'C:\\Program Files\\Steam',
      'D:\\Steam',
      'E:\\Steam',
    ];

    let steamRoot = steamRoots.find(p => fs.existsSync(p));
    if (!steamRoot) {
      return NextResponse.json({ ok: true, games: [], message: 'Steam not found' });
    }

    const vdfPath = path.join(steamRoot, 'steamapps', 'libraryfolders.vdf');
    if (!fs.existsSync(vdfPath)) {
      return NextResponse.json({ ok: true, games: [], message: 'libraryfolders.vdf not found' });
    }

    const vdfContent = fs.readFileSync(vdfPath, 'utf-8');

    // Collect all library paths (the root + any extra libraries)
    const libraryPaths: string[] = [steamRoot];
    const extraPaths = parseVdfValue(vdfContent, 'path');
    for (const p of extraPaths) {
      if (p !== steamRoot && !libraryPaths.includes(p)) {
        libraryPaths.push(p);
      }
    }

    const installed: { appId: number; name: string }[] = [];

    for (const libPath of libraryPaths) {
      const appsDir = path.join(libPath, 'steamapps');
      if (!fs.existsSync(appsDir)) continue;

      const files = fs.readdirSync(appsDir).filter(
        f => f.startsWith('appmanifest_') && f.endsWith('.acf')
      );

      for (const file of files) {
        try {
          const acf = fs.readFileSync(path.join(appsDir, file), 'utf-8');
          const appId = parseInt(parseSingleValue(acf, 'appid'), 10);
          const name = parseSingleValue(acf, 'name');
          if (appId && name) {
            installed.push({ appId, name });
          }
        } catch {
          // skip unreadable ACF
        }
      }
    }

    return NextResponse.json({ ok: true, games: installed });
  } catch (err) {
    return NextResponse.json({ ok: false, games: [], error: String(err) });
  }
}
