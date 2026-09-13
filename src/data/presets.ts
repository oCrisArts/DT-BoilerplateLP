import type { Catalog, LoadedPreset, Module, Preset } from './preset-contract/types';
import { validateCatalog, validatePreset, validateModules } from './preset-contract/validate.mjs';
import catalogData from '../../public/data/presets/catalog.json';

export const catalog: Catalog = validateCatalog(catalogData);
export const presetNames = catalog.presets.map(p => p.name).join(', ').replace(/, ([^,]+)$/, ' and $1');

const base = `${import.meta.env.BASE_URL}data/presets/`;
async function read<T>(path: string): Promise<T> {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`Unable to load preset data: ${path} (${response.status})`);
  return response.json();
}
export async function loadCatalog(): Promise<Catalog> {
  return catalog;
}
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
