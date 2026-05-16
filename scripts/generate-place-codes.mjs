/**
 * Downloads the full Italian municipality list from matteocontrini/comuni-json
 * and generates public/data/place-codes.json as a { "CITY_NAME": "BELFIORE_CODE" } map.
 *
 * Run once with: node scripts/generate-place-codes.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_URL =
  'https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json';

function normalizeName(value) {
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
}

const comuni = await response.json();

const placeCodeMap = {};
for (const comune of comuni) {
  const key = normalizeName(comune.nome);
  placeCodeMap[key] = comune.codiceCatastale;
}

// Sort keys alphabetically for readability
const sorted = Object.fromEntries(
  Object.entries(placeCodeMap).sort(([a], [b]) => a.localeCompare(b)),
);

const outDir = join(__dirname, '..', 'public', 'data');
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, 'place-codes.json');
writeFileSync(outPath, JSON.stringify(sorted, null, 2), 'utf-8');

console.log(`✓ Written ${Object.keys(sorted).length} entries to ${outPath}`);
