import type { Catalog, LoadedPreset, Module, Preset } from './preset-contract/types';
import { validateCatalog, validatePreset, validateModules } from './preset-contract/validate.mjs';

const base = `${import.meta.env.BASE_URL}data/presets/`;
async function read<T>(path: string): Promise<T> {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`Unable to load preset data: ${path} (${response.status})`);
  return response.json();
}

let cachedCatalog: Catalog | null = null;
export async function loadCatalog(): Promise<Catalog> {
  if (cachedCatalog) return cachedCatalog;
  const catalogData = await read<Catalog>('catalog.json');
  cachedCatalog = validateCatalog(catalogData);
  return cachedCatalog;
}

// Default catalog for initial render
export const catalog: Catalog = {
  schemaVersion: 1,
  defaultPreset: 'starttoken',
  presets: [
    { id: 'bootstrap', name: 'Bootstrap', path: 'bootstrap.json' },
    { id: 'tailwindcss', name: 'Tailwind CSS', path: 'tailwindcss.json' },
    { id: 'materialdesign', name: 'Material Design', path: 'materialdesign.json' },
    { id: 'bulma', name: 'Bulma', path: 'bulma.json' },
    { id: 'starttoken', name: 'StartToken', path: 'starttoken.json' }
  ]
};

export const presetNames = "Bootstrap, Tailwind CSS, Material Design, Bulma and StartToken";
const pending = new Map<string, Promise<LoadedPreset>>();
export async function loadPreset(id?: string): Promise<LoadedPreset> {
  const key = id ?? catalog.defaultPreset;
  if (!pending.has(key)) pending.set(key, fetchPreset(key).catch(error => { pending.delete(key); throw error; }));
  return pending.get(key)!;
}
async function fetchPreset(id: string): Promise<LoadedPreset> {
  const catalog = await loadCatalog();
  const entry = catalog.presets.find(p => p.id === (id ?? catalog.defaultPreset));
  if (!entry) throw new Error(`Unknown preset: ${id}`);
  const preset: Preset = validatePreset(await read<Preset>(entry.path), entry.id);
  const directory = entry.path.slice(0, entry.path.lastIndexOf('/') + 1);
  const modules = await Promise.all(preset.modules.map(m => read<Module>(directory + m.path)));
  return { preset, modules: validateModules(preset, modules) };
}
