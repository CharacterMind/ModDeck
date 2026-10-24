const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.log('No standalone server.js found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(serverPath, 'utf8');

if (content.includes('__HOSTNAME_PATCHED__')) {
  console.log('Already patched, skipping.');
  process.exit(0);
}

content = `// __HOSTNAME_PATCHED__\nprocess.env.HOSTNAME = '0.0.0.0';\n` + content;
fs.writeFileSync(serverPath, content);
console.log('Patched standalone/server.js: HOSTNAME defaults to 0.0.0.0');
