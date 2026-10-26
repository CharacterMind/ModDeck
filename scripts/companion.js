/**
 * ModDeck Companion — runs locally at http://127.0.0.1:27301
 * Handles: game detection, Steam launch, memory scan/freeze
 * Start: node scripts/companion.js
 */

'use strict';

const http = require('http');
const { exec } = require('child_process');

const PORT = 27301;
const VERSION = '1.0.0';

// ── State ─────────────────────────────────────────────────────────────────────
let syncedGames = [];           // { gameId, name } from /sync
let attached = null;            // { gameId, pid, name } when a game is open
let scanAddresses = [];         // current candidate addresses (as BigInt)
let frozenAddresses = [];       // addresses being frozen
let freezeTimer = null;
let frozenValue = null;

// ── PowerShell helpers ────────────────────────────────────────────────────────
function ps(script, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const oneliner = script.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
    exec(
      `powershell -NoProfile -NonInteractive -OutputFormat Text -Command "${oneliner.replace(/"/g, '\\"')}"`,
      { timeout: timeoutMs },
      (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout.trim());
      }
    );
  });
}

const WIN32_TYPES = `
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
public class W32 {
  public const int PROCESS_ALL_ACCESS = 0x1F0FFF;
  public const int MEM_COMMIT = 0x1000;
  public const int PAGE_READWRITE = 0x04;
  [DllImport("kernel32.dll")] public static extern IntPtr OpenProcess(int a,bool b,int pid);
  [DllImport("kernel32.dll")] public static extern bool ReadProcessMemory(IntPtr h,IntPtr addr,byte[] buf,int sz,out int r);
  [DllImport("kernel32.dll")] public static extern bool WriteProcessMemory(IntPtr h,IntPtr addr,byte[] buf,int sz,out int w);
  [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
  [StructLayout(LayoutKind.Sequential)]
  public struct MBI { public IntPtr Base; public IntPtr AllocBase; public uint AllocProt; public IntPtr Size; public uint State; public uint Protect; public uint Type; }
  [DllImport("kernel32.dll")] public static extern int VirtualQueryEx(IntPtr h,IntPtr addr,out MBI mbi,int sz);
  public static List<long> ScanFloat(int pid, float target) {
    var hits = new List<long>();
    var h = OpenProcess(PROCESS_ALL_ACCESS, false, pid);
    if (h == IntPtr.Zero) return hits;
    long addr = 0;
    int mbiSz = Marshal.SizeOf(typeof(MBI));
    while (addr < 0x7FFFFFFFFFFF) {
      MBI mbi;
      if (VirtualQueryEx(h,(IntPtr)addr,out mbi,mbiSz)==0) break;
      if (mbi.State==MEM_COMMIT && mbi.Protect==PAGE_READWRITE) {
        int sz=(int)mbi.Size; int read;
        if (sz>0 && sz<=0x800000) {
          var buf=new byte[sz];
          if (ReadProcessMemory(h,mbi.Base,buf,sz,out read) && read>=4) {
            for (int i=0;i<=read-4;i+=4) {
              float v=BitConverter.ToSingle(buf,i);
              if (Math.Abs(v-target)<(Math.Abs(target)*0.001f+0.01f)) hits.Add((long)mbi.Base+i);
              if (hits.Count>=2000) break;
            }
          }
        }
      }
      addr=(long)mbi.Base+(long)mbi.Size;
      if (hits.Count>=2000) break;
    }
    CloseHandle(h);
    return hits;
  }
  public static int WriteFloat(int pid, List<long> addrs, float value) {
    var h = OpenProcess(PROCESS_ALL_ACCESS, false, pid);
    if (h == IntPtr.Zero) return 0;
    int written = 0; int w;
    byte[] buf = BitConverter.GetBytes(value);
    foreach (var addr in addrs) { if (WriteProcessMemory(h,(IntPtr)addr,buf,4,out w) && w==4) written++; }
    CloseHandle(h);
    return written;
  }
  public static List<long> NarrowFloat(int pid, List<long> candidates, float target) {
    var hits = new List<long>();
    var h = OpenProcess(PROCESS_ALL_ACCESS, false, pid);
    if (h == IntPtr.Zero) return hits;
    int r; byte[] buf = new byte[4];
    foreach (var addr in candidates) {
      if (ReadProcessMemory(h,(IntPtr)addr,buf,4,out r) && r==4) {
        float v = BitConverter.ToSingle(buf,0);
        if (Math.Abs(v-target)<(Math.Abs(target)*0.001f+0.01f)) hits.Add(addr);
      }
    }
    CloseHandle(h);
    return hits;
  }
}
'@ -Language CSharp 2>$null
`;

async function scanFloat(pid, value) {
  const script = `${WIN32_TYPES} $hits = [W32]::ScanFloat(${pid}, [float]${value}); $hits -join ','`;
  const out = await ps(script, 30000);
  return out.split(',').filter(Boolean).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
}

async function narrowFloat(pid, candidates, value) {
  const addrList = candidates.slice(0, 2000).join(',');
  const script = `${WIN32_TYPES}
$cands = New-Object System.Collections.Generic.List[long]
@(${addrList}) | ForEach-Object { $cands.Add([long]$_) }
$hits = [W32]::NarrowFloat(${pid}, $cands, [float]${value})
$hits -join ','`;
  const out = await ps(script, 15000);
  return out.split(',').filter(Boolean).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
}

async function writeFloat(pid, addresses, value) {
  const addrList = addresses.slice(0, 50).join(',');
  const script = `${WIN32_TYPES}
$addrs = New-Object System.Collections.Generic.List[long]
@(${addrList}) | ForEach-Object { $addrs.Add([long]$_) }
[W32]::WriteFloat(${pid}, $addrs, [float]${value})`;
  const out = await ps(script, 10000);
  return parseInt(out, 10) || 0;
}

function startFreeze(pid, addresses, value) {
  stopFreeze();
  frozenAddresses = addresses.slice(0, 50);
  frozenValue = value;
  freezeTimer = setInterval(() => {
    if (!attached) { stopFreeze(); return; }
    writeFloat(pid, frozenAddresses, frozenValue).catch(() => {});
  }, 500);
}

function stopFreeze() {
  if (freezeTimer) { clearInterval(freezeTimer); freezeTimer = null; }
  frozenAddresses = [];
  frozenValue = null;
}

// ── Process detection ─────────────────────────────────────────────────────────
async function getProcesses() {
  const out = await ps(
    'Get-Process | Select-Object -Property Name,Id | ConvertTo-Json -Compress'
  ).catch(() => '[]');
  try {
    const arr = JSON.parse(out);
    return (Array.isArray(arr) ? arr : [arr]).map(p => ({
      name: (p.Name || '').toLowerCase(),
      pid: p.Id,
    }));
  } catch {
    return [];
  }
}

async function findProcess(processes) {
  const running = await getProcesses();
  for (const proc of processes) {
    const name = proc.toLowerCase().replace(/\.exe$/i, '');
    const found = running.find(r => r.name === name);
    if (found) return { pid: found.pid, name: proc };
  }
  return null;
}

async function launchViaSteam(steamAppId) {
  await ps(`Start-Process "steam://rungameid/${steamAppId}"`).catch(() => {});
}

// ── HTTP server ───────────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, data, status = 200) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  // GET /healthz
  if (req.method === 'GET' && url === '/healthz') {
    return json(res, {
      ok: true,
      version: VERSION,
      admin: true,
      attached: !!attached,
      attachedGameId: attached?.gameId ?? '',
      attachedPid: attached?.pid ?? 0,
      attachedName: attached?.name ?? '',
      frozen: frozenAddresses.length,
      installedCount: syncedGames.length,
    });
  }

  // POST /sync  { games: [{gameId, name}] }
  if (req.method === 'POST' && url === '/sync') {
    const body = await readBody(req);
    if (body.games) syncedGames = body.games;
    return json(res, { ok: true, installed: syncedGames.map(g => ({ gameId: g.gameId, source: 'steam', path: '' })) });
  }

  // POST /launch { gameId }
  if (req.method === 'POST' && url === '/launch') {
    const body = await readBody(req);
    const gameId = body.gameId;
    // Find steam app id from synced games by matching process list
    // We look in the web app's game catalog via the gameId
    // The UI sends the steamAppId via the companion's /sync call — but that's just gameId/name
    // For now, derive it from the hardcoded Steam IDs we know
    const STEAM_IDS = {
      'supermarket-simulator': 2670630,
      'supermarket-together': 1979840,
    };
    const appId = STEAM_IDS[gameId];
    if (!appId) return json(res, { ok: false, started: false, error: 'Unknown game' });
    await launchViaSteam(appId);
    return json(res, { ok: true, started: true, method: 'steam' });
  }

  // POST /attach { gameId, processes: string[], waitSeconds?: number }
  if (req.method === 'POST' && url === '/attach') {
    const body = await readBody(req);
    const waitMs = (body.waitSeconds ?? 10) * 1000;
    const deadline = Date.now() + waitMs;
    let found = null;
    while (!found && Date.now() < deadline) {
      found = await findProcess(body.processes);
      if (!found) await new Promise(r => setTimeout(r, 1500));
    }
    if (!found) return json(res, { found: false, error: 'Process not found' });
    attached = { gameId: body.gameId, pid: found.pid, name: found.name };
    scanAddresses = [];
    stopFreeze();
    return json(res, { found: true, pid: found.pid, name: found.name, attached: true });
  }

  // POST /detach
  if (req.method === 'POST' && url === '/detach') {
    stopFreeze();
    attached = null;
    scanAddresses = [];
    return json(res, { ok: true });
  }

  // POST /scan { op: 'first'|'next'|'write'|'undo'|'reset', value?, freeze?, type? }
  if (req.method === 'POST' && url === '/scan') {
    const body = await readBody(req);
    const { op, value, freeze } = body;

    if (!attached) return json(res, { ok: false, error: 'No process attached' });
    const pid = attached.pid;

    if (op === 'first') {
      scanAddresses = await scanFloat(pid, value).catch(() => []);
      const ready = scanAddresses.length > 0 && scanAddresses.length <= 10;
      return json(res, { ok: true, counts: { float: scanAddresses.length }, bestType: 'float', ready });
    }

    if (op === 'next') {
      if (!scanAddresses.length) return json(res, { ok: false, error: 'No scan in progress' });
      scanAddresses = await narrowFloat(pid, scanAddresses, value).catch(() => []);
      const ready = scanAddresses.length > 0 && scanAddresses.length <= 10;
      return json(res, { ok: true, counts: { float: scanAddresses.length }, bestType: 'float', ready });
    }

    if (op === 'write') {
      if (!scanAddresses.length) return json(res, { ok: false, error: 'No addresses to write' });
      const written = await writeFloat(pid, scanAddresses, value).catch(() => 0);
      if (freeze && written > 0) startFreeze(pid, scanAddresses, value);
      return json(res, { ok: written > 0, written });
    }

    if (op === 'undo') {
      stopFreeze();
      return json(res, { ok: true });
    }

    if (op === 'reset') {
      scanAddresses = [];
      stopFreeze();
      return json(res, { ok: true });
    }

    return json(res, { ok: false, error: 'Unknown op' }, 400);
  }

  json(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ModDeck Companion v${VERSION} listening on http://127.0.0.1:${PORT}`);
  console.log('Waiting for web UI to connect...');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Is another companion running?`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  stopFreeze();
  server.close();
  process.exit(0);
});
