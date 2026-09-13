import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog, validatePreset, validateModules } from '../src/data/preset-contract/validate.mjs';

const root = fileURLToPath(new URL('../public/data/presets/', import.meta.url));
const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const catalog = validateCatalog(read('catalog.json'));
for (const entry of catalog.presets) {
  const preset = validatePreset(read(entry.path), entry.id);
  const modules = validateModules(preset, preset.modules.map(m => read(join(dirname(entry.path), m.path))));
  const count = modules.flatMap(m => m.submodules.flatMap(g => g.variables)).length;
  console.log(`${entry.id}: ${modules.length} modules, ${count} variables validated.`);
}
