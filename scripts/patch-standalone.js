const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const serverPath = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.log('No standalone server.js found, skipping patch.');
  process.exit(0);
}

// 1. Force HOSTNAME=0.0.0.0 so the server binds to all interfaces.
//    Render containers have HOSTNAME already set to the pod name, so
//    we must overwrite it unconditionally before Next.js reads it.
let content = fs.readFileSync(serverPath, 'utf8');
if (!content.includes('__HOSTNAME_PATCHED__')) {
  content = `// __HOSTNAME_PATCHED__\nprocess.env.HOSTNAME = '0.0.0.0';\n` + content;
  fs.writeFileSync(serverPath, content);
  console.log('Patched standalone/server.js: forced HOSTNAME=0.0.0.0');
}

// 2. Copy .next/static -> .next/standalone/.next/static
//    (client-side JS/CSS bundles; not included in standalone output by default)
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const staticSrc = path.join(root, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
copyDir(staticSrc, staticDest);
console.log('Copied .next/static -> standalone/.next/static');

// 3. Copy public/ -> .next/standalone/public/
const publicSrc = path.join(root, 'public');
const publicDest = path.join(standaloneDir, 'public');
copyDir(publicSrc, publicDest);
console.log('Copied public/ -> standalone/public/');
