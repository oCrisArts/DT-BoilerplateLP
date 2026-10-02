import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateIconLibrary, validateModules } from '../src/data/preset-contract/validate.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../public/data/'+path,import.meta.url),'utf8'));
test('six versioned official libraries have verified checksums, variants and searchable SVGs',()=>{
  const catalog=read('icons/catalog.json');
  assert.deepEqual(catalog.libraries.map(l=>l.id),['bootstrap-icons','material-symbols','lucide','phosphor','font-awesome','remix-icon']);
  for(const entry of catalog.libraries){
    const bytes=readFileSync(new URL('../public/data/icons/'+entry.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
    const library=validateIconLibrary(JSON.parse(bytes));assert.equal(library.version,entry.version);
    assert.ok(library.icons.length>=240);for(const variant of library.variants)assert.ok(library.icons.some(i=>i.variant===variant));
  }
});
test('SVG validator rejects executable content and external assets',()=>{
  const source=read('icons/bootstrap-icons.json');
  for(const svg of ['<svg><script>alert(1)</script></svg>','<svg onload="x()"></svg>','<svg><use href="https://example.com/a.svg"/></svg>'])assert.throws(()=>validateIconLibrary({...source,icons:[{name:'unsafe',svg,tags:[]}]}),/unsafe/);
});
test('font roles reference native tokens and supported controls only; icon sizes preserve framework differences',()=>{
  const roles={starttoken:['primary','secondary'],bootstrap:['primary','monospace'],tailwindcss:['primary','secondary','monospace'],materialdesign:['primary','secondary'],bulma:['primary','monospace']};
  for(const [id,expected] of Object.entries(roles)){
    const preset=read(`presets/${id}/preset.json`),modules=preset.modules.map(m=>read(`presets/${id}/${m.path}`));validateModules(preset,modules);
    const type=modules.find(m=>m.module==='typography');assert.deepEqual(Object.keys(type.configuration.fontRoles),expected);
    const icon=modules.find(m=>m.module==='iconography');assert.ok(icon.configuration.scale.steps.every(id=>icon.submodules.some(g=>g.variables.some(v=>v.id===id))));
    assert.ok(!icon.submodules.flatMap(s=>s.variables).some(v=>typeof v.value==='string'&&v.value.includes('<svg')));
  }
  const colors=read('presets/starttoken/colors.json').submodules.flatMap(s=>s.variables);
  assert.ok(!JSON.stringify(colors).toLowerCase().includes('grayscale'));
  const black=colors.filter(v=>/^colors.palette.black(?:-|$)/.test(v.id)),white=colors.filter(v=>/^colors.palette.white(?:-|$)/.test(v.id));
  assert.equal(black.length,white.length);assert.ok(black.length>=10);
  black.forEach((v,i)=>['r','g','b'].forEach(c=>assert.ok(Math.abs(v.value[c]+white[i].value[c]-1)<.0001)));
});
