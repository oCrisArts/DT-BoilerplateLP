// Shared by the canonical data build, plugin sync, and both readers.
const check = (condition, message) => { if (!condition) throw new Error(`Invalid preset data: ${message}`); };
const text = value => typeof value === 'string' && value.length > 0;
const unique = values => new Set(values).size === values.length;
export function assertPath(value) {
  check(text(value) && /^[a-zA-Z0-9_/-]+\.json$/.test(value) && !value.startsWith('/') && !value.includes('//'), `unsafe path ${value}`);
  return value;
}
export function validateCatalog(catalog) {
  check(catalog?.schemaVersion === 1 && Array.isArray(catalog.presets) && catalog.presets.length > 0, 'catalog schema');
  check(unique(catalog.presets.map(p => p.id)), 'duplicate preset ID');
  for (const entry of catalog.presets) {
    check(text(entry.id) && /^[a-z0-9-]+$/.test(entry.id) && text(entry.name), 'catalog entry');
    assertPath(entry.path);
  }
  check(catalog.presets.some(p => p.id === catalog.defaultPreset), 'missing default preset');
  return catalog;
}
export function validatePreset(preset, expectedId) {
  check(preset?.schemaVersion === 1 && preset.id === expectedId, 'preset identity');
  check(text(preset.metadata?.name) && text(preset.metadata?.version) && text(preset.metadata?.description) && Array.isArray(preset.metadata?.sources), 'metadata');
  for (const source of preset.metadata.sources) check(/^https:\/\//.test(source.url) && text(source.version), 'source provenance');
  check(Array.isArray(preset.modules) && unique(preset.modules.map(m => m.id)), 'module list');
  check(preset.modules.length === 3 && ['colors','typography','layout'].every(id => preset.modules.some(m => m.id === id)), 'required modules');
  for (const entry of preset.modules) assertPath(entry.path);
  check(Array.isArray(preset.capabilities?.colors?.groups), 'color capabilities');
  for (const [module, keys] of Object.entries({ typography: ['fontFamily','baseSize','typeScale','lineHeight'], layout: ['grid','breakpoints','spacing','radius','tokens'] })) {
    for (const key of keys) check(typeof preset.capabilities?.[module]?.[key] === 'boolean', `${module}.${key} capability`);
  }
  return preset;
}
export function validateModules(preset, modules) {
  check(modules.length === preset.modules.length, 'module count');
  const variables = new Map();
  for (const [index, module] of modules.entries()) {
    check(module?.schemaVersion === 1 && module.module === preset.modules[index].id, 'module identity');
    check(text(module.label) && text(module.tabIcon) && Array.isArray(module.submodules), 'module shape');
    check(unique(module.submodules.map(g => g.id)), 'duplicate group');
    for (const group of module.submodules) {
      check(text(group.id) && text(group.label) && text(group.icon) && Array.isArray(group.variables), 'group shape');
      for (const v of group.variables) {
        check(text(v.id) && !variables.has(v.id), `duplicate or missing variable ${v.id}`);
        check(v.module === module.module && v.submodule === group.id && text(v.name) && text(v.figmaName) && text(v.displayValue), `variable identity ${v.id}`);
        check(['COLOR','FLOAT','STRING'].includes(v.type), `variable type ${v.id}`);
        if (v.type === 'FLOAT') check(typeof v.value === 'number' && Number.isFinite(v.value), `numeric value ${v.id}`);
        if (v.type === 'STRING') check(typeof v.value === 'string', `string value ${v.id}`);
        if (v.type === 'COLOR') {
          const value = v.value;
          check(typeof value === 'string' ? /^(#[a-f\d]{3,8}|hsl\(.+\)|oklch\(.+\))$/i.test(value) : value && ['r','g','b','a'].every(k => typeof value[k] === 'number' && value[k] >= 0 && value[k] <= 1), `color value ${v.id}`);
        }
        variables.set(v.id, v);
      }
    }
  }
  for (const v of variables.values()) {
    if (v.reference) check(variables.has(v.reference) && variables.get(v.reference).type === v.type, `invalid alias ${v.id}`);
    const seen = new Set([v.id]);
    let target = v;
    while (target.reference) {
      check(!seen.has(target.reference), `cyclic alias ${v.id}`);
      seen.add(target.reference);
      target = variables.get(target.reference);
      check(target, `missing alias ${v.id}`);
    }
  }
  const colors = modules.find(m => m.module === 'colors');
  check(['grouped','scales'].includes(colors.configuration?.structure) && Array.isArray(colors.configuration?.colorFormats), 'color configuration');
  check(JSON.stringify(preset.capabilities.colors.groups) === JSON.stringify(colors.submodules.map(g => g.id)), 'color groups mismatch');
  const typography = modules.find(m => m.module === 'typography');
  const config = typography.configuration;
  const refs = new Set(typography.submodules.flatMap(g => g.variables.map(v => v.id)));
  for (const key of ['fontFamily','baseSize','lineHeight']) {
    check(config?.[key] && refs.has(config[key].default) && typeof config[key].customizable === 'boolean', `${key} configuration`);
    if (config[key].options) check(config[key].options.every(id => refs.has(id)), `${key} options`);
  }
  check(config.typeScale?.kind === 'explicit' && typeof config.typeScale.customizable === 'boolean' && Array.isArray(config.typeScale.steps) && config.typeScale.steps.length > 0 && config.typeScale.steps.every(id => refs.has(id)), 'type scale');
  const layout = modules.find(m => m.module === 'layout');
  check(['none','columns','responsive-columns'].includes(layout.configuration?.grid?.kind) && ['scale','multiplier'].includes(layout.configuration?.spacing?.kind), 'layout configuration');
  for (const [key, enabled] of Object.entries(preset.capabilities.layout)) {
    check(enabled === layout.submodules.some(g => (g.id === key || (key === 'spacing' && g.id === 'space')) && g.variables.length > 0), `layout capability ${key}`);
  }
  return modules;
}
