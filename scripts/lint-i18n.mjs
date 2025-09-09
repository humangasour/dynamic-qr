import fs from 'node:fs';
import path from 'node:path';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = true;
    }
  }
  return out;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) files.push(p);
  }
  return files;
}

function collectUses(file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  const uses = [];
  let ns;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m1 = line.match(/\buseTranslations\(\s*'([^']*)'?\s*\)/);
    const m2 = line.match(/\bgetTranslations\(\s*'([^']*)'?\s*\)/);
    const m3 = line.match(/\bgetTranslations\(\s*\)/);
    if (m1) ns = m1[1];
    else if (m2) ns = m2[1];
    else if (m3) ns = undefined;

    const tcall = line.match(/\bt\(\s*'([^']+)'/);
    if (tcall) uses.push({ file, line: i + 1, ns, key: tcall[1] });
    const trich = line.match(/\bt\.rich\(\s*'([^']+)'/);
    if (trich) uses.push({ file, line: i + 1, ns, key: trich[1] });
  }
  return uses;
}

function main() {
  const messagesPath = path.join(process.cwd(), 'src', 'i18n', 'messages', 'en.json');
  if (!fs.existsSync(messagesPath)) {
    console.error('i18n: messages file not found at', messagesPath);
    process.exit(1);
  }

  const flat = flatten(readJson(messagesPath));
  const files = walk(path.join(process.cwd(), 'src'));
  const uses = files.flatMap(collectUses);

  const missing = [];
  for (const u of uses) {
    const fullKey = u.ns ? `${u.ns}.${u.key}` : u.key;
    if (!flat[fullKey]) missing.push({ ...u, fullKey });
  }

  if (missing.length) {
    console.error(`\nnext-intl lint (custom): ${missing.length} missing translation key(s) found:`);
    for (const u of missing) {
      console.error(` - ${u.file}:${u.line} -> ${u.fullKey}`);
    }
    process.exit(2);
  }

  console.log('next-intl lint (custom): OK');
}

main();
