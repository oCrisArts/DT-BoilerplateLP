import test from 'node:test';
import { upgradeFoundations } from './upgrade-foundations.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { validateCatalog, validatePreset, validateModules } from '../src/data/preset-contract/validate.mjs';

const read = path => JSON.parse(readFileSync(new URL(`../public/data/presets/${path}`, import.meta.url), 'utf8'));
const catalog = read('catalog.json');
function load(id) {
  const entry = catalog.presets.find(p => p.id === id);
  const preset = read(entry.path);
  return { preset, modules: preset.modules.map(m => read(`${dirname(entry.path)}/${m.path}`)) };
}
test('every catalog entry satisfies the shared contract', () => {
  validateCatalog(catalog);
  for (const entry of catalog.presets) {
    const { preset, modules } = load(entry.id);
    validatePreset(preset, entry.id);
    validateModules(preset, modules);
  }
});
test('StartToken migration preserves every original field and token', () => {
  const expected = {
    colors: 'ca00a2b8fa8483b3948f7eed8be627f65e98bf6f01527c944f8bea60e273287e',
    typography: 'b02132f5ab88e6cff72bf15258aabf482fca04032500462058ba5491aa861488',
    layout: '35432375e54efbaf2693e7e9b4948e61578c9a4e895c2ba68e98e2afc310b7e6',
  };
  for (const module of load('starttoken').modules.filter(m=>m.module!=='iconography')) {
    const { schemaVersion, configuration, ...original } = structuredClone(module);
    const baseline=JSON.parse(readFileSync(new URL('./fixtures/foundations-baseline.json',import.meta.url),'utf8')).starttoken;
    original.submodules=original.submodules.map(g=>({...g,variables:g.variables.filter(v=>baseline.some(b=>b.id===v.id)).map(({tier,...v})=>v)})).filter(g=>g.variables.length);
    if(module.module==='typography'){
      // Reverse only the requested Family migration to keep the original scale fingerprint.
      const family=original.submodules.find(s=>s.id==='family');
      assert.deepEqual(family.variables.map(v=>[v.name,v.value]),[['font-family-primary','DM Sans'],['font-family-secondary','Sora']]);
      family.variables=family.variables.map((v,i)=>({...v,id:i?'typography.family.font-family-icon':'typography.family.font-family-sans',name:i?'font-family-icon':'font-family-sans',figmaName:i?'Typography/Family/font-family-icon':'Typography/Family/font-family-sans',value:i?'Material Symbols Outlined':v.value,displayValue:i?'Material Symbols Outlined':v.displayValue,icon:i?'shapes':v.icon}));
    }
    if(module.module==='colors'){
      for(const group of original.submodules){group.variables=group.variables.filter(v=>!/^colors.palette.white(?:-|$)/.test(v.id));for(const v of group.variables)for(const key of ['id','name','figmaName','reference'])if(typeof v[key]==='string')v[key]=v[key].replace(/black/gi,m=>m[0]==='B'?'Grayscale':'grayscale');}
    }
    assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), expected[module.module]);
  }
});
test('rejects invalid defaults, unsafe paths and unsupported schema versions', () => {
  assert.throws(() => validateCatalog({ ...catalog, defaultPreset: 'missing' }), /default preset/);
  const unsafe = structuredClone(catalog);
  unsafe.presets[0].path = '../outside.json';
  assert.throws(() => validateCatalog(unsafe), /unsafe path/);
  assert.throws(() => validateCatalog({ ...catalog, schemaVersion: 2 }), /schema/);
});
test('rejects duplicate IDs, missing aliases, cycles and incorrect capabilities', () => {
  for (const mutation of [
    ({ modules }) => { const group = modules[0].submodules[0]; group.variables.push(group.variables[0]); },
    ({ modules }) => { modules[0].submodules[0].variables[0].reference = 'missing'; },
    ({ modules }) => { const v = modules[0].submodules[0].variables[0]; v.reference = v.id; },
    ({ preset }) => { preset.capabilities.layout.breakpoints = !preset.capabilities.layout.breakpoints; },
    ({ modules }) => { modules[1].configuration.baseSize.default = 'missing'; },
  ]) {
    const data = load('starttoken');
    mutation(data);
    assert.throws(() => validateModules(data.preset, data.modules), /Invalid preset data/);
  }
});
test('framework fixtures retain upstream values and native units', () => {
  const values = id => Object.fromEntries(load(id).modules.flatMap(m => m.submodules.flatMap(g => g.variables)).map(v => [v.id, v]));
  const bs = values('bootstrap'), tw = values('tailwindcss'), bulma = values('bulma');
  assert.equal(bs['colors.theme.primary'].value, '#0d6efd');
  assert.equal(bs['layout.breakpoints.sm'].value, 576);
  assert.equal(bs['layout.radius.border-radius'].unit, 'rem');
  assert.equal(tw['colors.blue.--color-blue-500'].value, 'oklch(62.3% 0.214 259.815)');
  assert.equal(tw['layout.spacing.--spacing'].value, 0.25);
  assert.equal(tw['layout.breakpoints.sm'], undefined);
  assert.equal(tw['layout.breakpoints.--breakpoint-sm'].unit, 'rem');
  assert.equal(bulma['colors.roles.primary'].value, 'hsl(171, 100%, 41%)');
  assert.equal(bulma['layout.breakpoints.desktop'].value, 1024);
  assert.equal(bulma['layout.radius.radius-medium'].unit, 'em');
  assert.equal(bulma['typography.sizes.body-size'].unit, 'em');
});

test('StartToken foundations upgrade migrates legacy families and remains idempotent',()=>{
 const data=load('starttoken'),type=data.modules.find(m=>m.module==='typography');
 const original=structuredClone(type),family=type.submodules.find(s=>s.id==='family');
 family.variables[0]={...family.variables[0],id:'typography.family.font-family-sans',name:'font-family-sans',figmaName:'Typography/Family/font-family-sans'};
 family.variables[1]={...family.variables[1],id:'typography.family.font-family-icon',name:'font-family-icon',figmaName:'Typography/Family/font-family-icon',value:'Material Symbols Outlined',displayValue:'Material Symbols Outlined'};
 const once=upgradeFoundations(data.preset,data.modules);
 assert.deepEqual(once.modules.find(m=>m.module==='typography'),original);
 const twice=upgradeFoundations(once.preset,once.modules);
 assert.deepEqual(twice.modules.find(m=>m.module==='typography'),original);
});
