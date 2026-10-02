import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportTokens,prepareTokens,dtcgPath,nativeValue} from '../src/data/preset-contract/exports.mjs';
import {scopesFor,codeName,codeSyntax,category} from '../src/data/preset-contract/token-metadata.mjs';
import {completeFoundations} from './complete-foundations.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../public/data/presets/'+p,import.meta.url)));
const baseline=JSON.parse(readFileSync(new URL('./fixtures/foundations-baseline.json',import.meta.url)));
const leaf=(doc,t)=>dtcgPath(t).reduce((g,key)=>g[key],doc);
for(const entry of read('catalog.json').presets)test(entry.name+': paths, native values, aliases, metadata and five equivalent exports',async()=>{
  const preset=read(entry.path),modules=preset.modules.map(m=>read(entry.id+'/'+m.path)),tokens=modules.flatMap(m=>m.submodules.flatMap(g=>g.variables)),ids=new Map(tokens.map(t=>[t.id,t]));
  for(const old of baseline[entry.id]){
    const t=ids.get(old.id);assert.ok(t,old.id);
    for(const key of ['name','figmaName','type','unit','displayValue'])assert.equal(t[key],old[key],key+' '+old.id);
    assert.deepEqual(t.value,old.value);
    if(old.reference)assert.equal(t.reference,old.reference,'preserve existing alias');
  }
  const before=JSON.stringify({preset,modules});completeFoundations(preset,modules);assert.equal(JSON.stringify({preset,modules}),before);
  const prepared=prepareTokens(tokens),exports=exportTokens(prepared),doc=JSON.parse(exports.dtcg);
  const tw=await import('data:text/javascript;base64,'+Buffer.from(exports.tailwind).toString('base64'));
  assert.equal(Object.keys(tw.tokens).length,tokens.length);
  assert.doesNotMatch(exports.sass,/[{};]/);
  const cssLines=exports.css.split('\n').filter(s=>s.startsWith('  --'));assert.equal(cssLines.length,tokens.length);
  for(const t of prepared){
    const item=leaf(doc,t),meta=item.$extensions['org.starttokens'],name=codeName(t.figmaName),scopes=scopesFor(t);
    assert.equal(meta.path,t.figmaName);assert.deepEqual(meta.value,t.value);assert.equal(meta.unit,t.unit||null);
    assert.equal(tw.tokens[name],nativeValue(t));
    if(t.reference){assert.equal(item.$value,'{'+dtcgPath(ids.get(t.reference)).join('.')+'}');assert.ok(exports.css.includes('--'+name+': var(--'+codeName(ids.get(t.reference).figmaName)+');'));assert.ok(exports.scss.includes('$'+name+': $'+codeName(ids.get(t.reference).figmaName)+';'));}
    if(t.type==='COLOR')assert.deepEqual(scopes,['ALL_SCOPES']);
    if(t.type==='STRING')assert.ok(scopes.every(s=>['ALL_SCOPES','FONT_FAMILY','FONT_STYLE','TEXT_CONTENT'].includes(s)));
    assert.equal(codeSyntax(t).css,'var(--'+name+')');
    const c=category(t);if(c&&!['sizing','borderStyle'].includes(c))assert.ok(Object.hasOwn(tw.default.theme.extend[c],name));
  }
  assert.equal(Object.keys(tw.default.theme.extend).some(c=>!prepared.some(t=>category(t)===c)),false);
});
test('path syntax is deterministic and export rejects collisions and invalid aliases',()=>{
 const a={id:'a',module:'colors',submodule:'content',name:'Text',figmaName:'Colors/Content/Primary/Text',type:'COLOR',value:'#fff',displayValue:'#fff'};
 assert.equal(codeName(a.figmaName),'color-content-primary-text');
 assert.throws(()=>prepareTokens([a,a]),/Duplicate/);
 assert.throws(()=>prepareTokens([a,{...a,id:'b',figmaName:'Colors/Content/Primary text'}]),/Duplicate/);
 assert.throws(()=>prepareTokens([{...a,reference:'missing'}]),/Invalid alias/);
 assert.throws(()=>prepareTokens([{...a,reference:'a'}]),/Cyclic/);
});
test('StartToken includes all requested foundations; unsupported frameworks are not padded with invented scales',()=>{
 const p=read('starttoken/preset.json'),m=p.modules.map(m=>read('starttoken/'+m.path)),all=m.flatMap(m=>m.submodules.flatMap(g=>g.variables));
 for(const c of ['screens','spacing','borderRadius','borderWidth','borderStyle','opacity','letterSpacing'])assert.ok(all.some(t=>category(t)===c));
 assert.ok(all.some(t=>t.figmaName==='Layout/Space/0'&&t.value===0));
 assert.ok(all.some(t=>t.name==='radius-full'&&t.value===9999));
 assert.deepEqual(read('materialdesign/layout.json').submodules.map(g=>g.id),['radius']);
 assert.equal(read('tailwindcss/layout.json').submodules.find(g=>g.id==='spacing').variables.length,1);
});
