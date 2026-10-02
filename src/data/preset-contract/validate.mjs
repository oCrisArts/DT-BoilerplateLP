import {codeName,scopesFor} from './token-metadata.mjs';
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
  check(JSON.stringify(preset.modules.map(m=>m.id)) === JSON.stringify(['colors','typography','iconography','layout']), 'required modules');
  for (const entry of preset.modules) assertPath(entry.path);
  check(Array.isArray(preset.capabilities?.colors?.groups), 'color capabilities');
  for (const [module, keys] of Object.entries({ typography: ['fontFamily','baseSize','typeScale','lineHeight'], iconography: ['library','delivery','scale','colorBehavior'], layout: ['grid','breakpoints','spacing','radius','tokens'] })) {
    for (const key of keys) check(typeof preset.capabilities?.[module]?.[key] === 'boolean', `${module}.${key} capability`);
  }
  for(const key of ['borderWidth','borderStyle','opacity'])if(preset.capabilities.layout[key]!==undefined)check(typeof preset.capabilities.layout[key]==='boolean','layout.'+key+' capability');
  if(preset.capabilities.typography.letterSpacing!==undefined)check(typeof preset.capabilities.typography.letterSpacing==='boolean','letterSpacing capability');
  return preset;
}
export function validateModules(preset, modules) {
  check(modules.length === preset.modules.length, 'module count');
  const variables = new Map();
  const paths = new Set();
  const codeNames = new Set();
  for (const [index, module] of modules.entries()) {
    check(module?.schemaVersion === 1 && module.module === preset.modules[index].id, 'module identity');
    check(text(module.label) && text(module.tabIcon) && Array.isArray(module.submodules), 'module shape');
    check(unique(module.submodules.map(g => g.id)), 'duplicate group');
    for (const group of module.submodules) {
      check(text(group.id) && text(group.label) && text(group.icon) && Array.isArray(group.variables), 'group shape');
      for (const v of group.variables) {
        check(text(v.id) && !variables.has(v.id), `duplicate or missing variable ${v.id}`);
        check(v.module === module.module && v.submodule === group.id && text(v.name) && text(v.figmaName) && text(v.displayValue), `variable identity ${v.id}`);
        check(!paths.has(v.figmaName), `duplicate variable path ${v.figmaName}`); paths.add(v.figmaName);
        check(['COLOR','FLOAT','STRING'].includes(v.type), `variable type ${v.id}`);
        if (v.type === 'FLOAT') check(typeof v.value === 'number' && Number.isFinite(v.value), `numeric value ${v.id}`);
        if (v.type === 'STRING') check(typeof v.value === 'string', `string value ${v.id}`);
        if (v.type === 'COLOR') {
          const value = v.value;
          check(typeof value === 'string' ? /^(#[a-f\d]{3,8}|hsl\(.+\)|oklch\(.+\))$/i.test(value) : value && ['r','g','b','a'].every(k => typeof value[k] === 'number' && value[k] >= 0 && value[k] <= 1), `color value ${v.id}`);
        }
        check(!v.tier || ['primitive','semantic','component'].includes(v.tier), 'token tier '+v.id);
        const code=codeName(v.figmaName);check(code && !codeNames.has(code),'duplicate code syntax '+v.figmaName);codeNames.add(code);
        if(v.type==='COLOR')check(JSON.stringify(scopesFor(v))==='["ALL_SCOPES"]','unrestricted color scopes');
        variables.set(v.id, v);
      }
    }
  }
  for (const v of variables.values()) {
    if (v.reference) check(variables.has(v.reference) && variables.get(v.reference).type === v.type, `invalid alias ${v.id}`);
    if(v.reference)check(v.unit===variables.get(v.reference).unit,'alias unit mismatch '+v.id);
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
  if(preset.capabilities.typography.letterSpacing!==undefined)check(preset.capabilities.typography.letterSpacing===typography.submodules.some(g=>g.variables.some(v=>/tracking|letter-spacing/.test(v.name))),'letterSpacing capability mismatch');
  const config = typography.configuration;
  const refs = new Set(typography.submodules.flatMap(g => g.variables.map(v => v.id)));
  for (const key of ['fontFamily','baseSize','lineHeight']) {
    check(config?.[key] && refs.has(config[key].default) && typeof config[key].customizable === 'boolean', `${key} configuration`);
    if (config[key].options) check(config[key].options.every(id => refs.has(id)), `${key} options`);
  }
  check(config.typeScale?.kind === 'explicit' && typeof config.typeScale.customizable === 'boolean' && Array.isArray(config.typeScale.steps) && config.typeScale.steps.length > 0 && config.typeScale.steps.every(id => refs.has(id)), 'type scale');
  check(Number.isFinite(config.typeScale.referenceRatio) && config.typeScale.referenceRatio > 1, 'type scale reference ratio');
  check(config.fontRoles?.primary && unique(Object.values(config.fontRoles).map(r=>r.token)), 'font roles');
  for (const [role, item] of Object.entries(config.fontRoles)) check(['primary','secondary','monospace'].includes(role) && text(item.label) && refs.has(item.token) && variables.get(item.token).type === 'STRING' && typeof item.customizable === 'boolean', `font role ${role}`);
  const icons = modules.find(m=>m.module==='iconography'), ic = icons.configuration;
  const iconRefs = new Set(icons.submodules.flatMap(g=>g.variables.map(v=>v.id)));
  for (const key of ['library','delivery','nativeSize','baseSize','colorBehavior',...(ic.verticalAlign?['verticalAlign']:[])]) check(iconRefs.has(ic[key]), `iconography ${key}`);
  check(variables.get(ic.baseSize).type === 'FLOAT' && variables.get(ic.baseSize).value > 0, 'icon base size');
  check(['spacing','proportional'].includes(ic.scale?.kind) && ic.scale.baseValue > 0 && Array.isArray(ic.scale.steps) && ic.scale.steps.length > 0 && unique(ic.scale.steps) && ic.scale.steps.every(id=>iconRefs.has(id) && variables.get(id).type==='FLOAT' && variables.get(id).value>0), 'icon scale');
  const layout = modules.find(m => m.module === 'layout');
  check(['none','columns','responsive-columns'].includes(layout.configuration?.grid?.kind) && ['scale','multiplier'].includes(layout.configuration?.spacing?.kind), 'layout configuration');
  for (const [key, enabled] of Object.entries(preset.capabilities.layout)) {
    check(enabled === layout.submodules.some(g => (g.id === key || (key === 'spacing' && g.id === 'space')) && g.variables.length > 0), `layout capability ${key}`);
  }
  return modules;
}

export function validateIconLibrary(library) {
  check(library?.schemaVersion === 1 && text(library.id) && text(library.name) && text(library.provider) && text(library.version), 'icon library identity');
  check(Array.isArray(library.delivery) && library.delivery.length > 0 && library.delivery.every(text) && library.defaultSize > 0 && text(library.nativeSize), 'icon library delivery');
  check(Array.isArray(library.variants) && library.variants.length > 0 && unique(library.variants), 'icon variants');
  check(/^https:\/\//.test(library.source?.url) && text(library.source.integrity) && text(library.source.license), 'icon provenance');
  check(Array.isArray(library.icons) && library.icons.length > 0 && unique(library.icons.map(i=>`${i.variant||''}/${i.name}`)), 'icon entries');
  for (const icon of library.icons) {
    check(text(icon.name) && Array.isArray(icon.tags) && icon.tags.every(text) && (!icon.variant || library.variants.includes(icon.variant)), 'icon metadata');
    check(text(icon.svg) && /<svg\b/.test(icon.svg) && /<\/svg>/.test(icon.svg) && !/<(?:script|foreignObject|iframe|image|use)\b|\bon\w+\s*=|(?:href|src)\s*=|javascript:|<!ENTITY/i.test(icon.svg), `unsafe icon SVG ${icon.name}`);
  }
  for (const property of Object.values(library.properties||{})) check(Array.isArray(property.values) && property.values.includes(property.default), 'icon property');
  return library;
}
