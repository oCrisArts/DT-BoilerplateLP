// Material Web token snapshots are Apache-2.0, copyright Google LLC.
// Only the public $supported-tokens lists are imported. No values are invented.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog, validatePreset, validateModules } from '../src/data/preset-contract/validate.mjs';

export const MATERIAL_VERSION = '2.5.0';
export const MATERIAL_COMMIT = 'b4de401eb665ec63474f39319a4ba8f2145974cc';
const scriptDir = dirname(fileURLToPath(import.meta.url));
export const canonicalDirectory = () => resolve(process.env.PRESET_SOURCE_DIR || join(scriptDir, '../public/data/presets'));
const source = path => readFileSync(join(scriptDir, 'materialdesign-source', path), 'utf8');
const versioned = name => source(`tokens/versions/v0_192/_${name}.scss`);
export function supportedTokens(name) {
  const list = source(`tokens/_${name}.scss`).match(/\$supported-tokens:\s*\(([\s\S]*?)\);/);
  if (!list) throw Error(`Missing supported tokens: ${name}`);
  return [...list[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
}
function expression(text, key) {
  const match = text.match(new RegExp(`'${key}':\\s*(map\\.get\\([^)]*\\)|if\\(\\$exclude-hardcoded-values,\\s*null,\\s*(?:\\([^)]*\\)|[^)]*)\\))`));
  if (!match) throw Error(`Unsupported upstream expression for ${key}`);
  return match[1];
}
function scalar(text, key) {
  const raw = expression(text,key).match(/if\(\$exclude-hardcoded-values,\s*null,\s*([\s\S]*)\)$/)?.[1].trim();
  if (!raw) throw Error(`Expected scalar for ${key}`);
  const numeric = raw.match(/^(-?[\d.]+)(px|rem)?$/);
  if (numeric) return { type:'FLOAT', value:Number(numeric[1]), ...(numeric[2] ? {unit:numeric[2]} : {}), displayValue:raw };
  if (/^#[\da-f]+$/i.test(raw)) return { type:'COLOR', value:raw, displayValue:raw, preview:raw };
  if (/^\([A-Za-z ]+\)$/.test(raw)) return { type:'STRING', value:raw.slice(1,-1), displayValue:raw.slice(1,-1) };
  throw Error(`Unsupported scalar ${key}: ${raw}`);
}
const title = name => name[0].toUpperCase()+name.slice(1);
const refId = name => `typography.family.--md-ref-typeface-${name}`;
function variable(module, group, namespace, token, data, label = title(group)) {
  const name = `--${namespace}-${token}`;
  return { id:`${module}.${group}.${name}`, module, submodule:group, name, figmaName:`${title(module)}/${label}/${name}`, ...data };
}
function moduleData(module, label, icon, groups, configuration) {
  return { schemaVersion:1, module, label, tabIcon:icon, submodules:groups, configuration };
}
export function buildMaterialDesignPreset() {
  const colorGroups = ['primary','secondary','tertiary','error','surface','inverse','outline','utility'];
  const colors = colorGroups.map(id=>({id,label:title(id),icon:'palette',variables:[]}));
  const light = versioned('md-sys-color').split('@function values-light')[1];
  for (const token of supportedTokens('md-sys-color')) {
    const paletteKey=expression(light,token).match(/'md-ref-palette',\s*'([^']+)'/)?.[1];
    if (!paletteKey) throw Error(`Unresolved color ${token}`);
    const group = token.startsWith('inverse-') ? 'inverse' : ['primary','secondary','tertiary','error'].find(g=>token===g||token.startsWith(`${g}-`)||token.startsWith(`on-${g}`)) || (token.includes('surface') ? 'surface' : token.startsWith('outline') ? 'outline' : 'utility');
    colors.find(g=>g.id===group).variables.push(variable('colors',group,'md-sys-color',token,scalar(versioned('md-ref-palette'),paletteKey)));
  }
  const family = {id:'family',label:'Typeface',icon:'font_download',variables:supportedTokens('md-ref-typeface').map(token=>variable('typography','family','md-ref-typeface',token,scalar(versioned('md-ref-typeface'),token),'Typeface'))};
  const roles = ['display','headline','title','body','label'].map(id=>({id,label:title(id),icon:'font_download',variables:[]}));
  for (const token of supportedTokens('md-sys-typescale')) {
    const expr=expression(versioned('md-sys-typescale'),token);
    const ref=expr.match(/'md-ref-typeface',\s*'([^']+)'/)?.[1];
    const data=ref ? {...scalar(versioned('md-ref-typeface'),ref),reference:refId(ref)} : scalar(versioned('md-sys-typescale'),token);
    const group=roles.find(g=>token.startsWith(`${g.id}-`));
    group.variables.push(variable('typography',group.id,'md-sys-typescale',token,data));
  }
  const shapes = ['corner-none','corner-extra-small','corner-small','corner-medium','corner-large','corner-extra-large','corner-full'];
  if (JSON.stringify([...shapes].sort())!==JSON.stringify(supportedTokens('md-sys-shape').sort())) throw Error('Upstream shape whitelist changed');
  const modules = [
    moduleData('colors','Colors','palette',colors,{structure:'grouped',colorFormats:['hex']}),
    moduleData('typography','Typography','font_download',[family,...roles],{
      fontFamily:{default:refId('brand'),options:[refId('brand'),refId('plain')],customizable:true},
      baseSize:{default:'typography.body.--md-sys-typescale-body-large-size',customizable:true},
      typeScale:{kind:'explicit',steps:roles.flatMap(g=>g.variables.filter(v=>v.name.endsWith('-size')).map(v=>v.id)),customizable:true},
      lineHeight:{default:'typography.body.--md-sys-typescale-body-large-line-height',options:roles.flatMap(g=>g.variables.filter(v=>v.name.endsWith('-line-height')).map(v=>v.id)),customizable:true},
    }),
    moduleData('layout','Layout','rounded_corner',[{id:'radius',label:'Shape',icon:'rounded_corner',variables:shapes.map(token=>variable('layout','radius','md-sys-shape',token,scalar(versioned('md-sys-shape'),token),'Shape'))}],{
      grid:{kind:'none'},
      // Required contract descriptor, not a spacing capability or token group.
      spacing:{kind:'scale'},
    }),
  ];
  const filenames=['md-sys-color','md-sys-typescale','md-ref-typeface','md-sys-shape','md-ref-palette'];
  const preset={schemaVersion:1,id:'materialdesign',metadata:{
    name:'Material Design',version:MATERIAL_VERSION,
    description:'Material Design 3, official Material Web v2.5.0 tokens (Google Material 3 v0.192). Default light color scheme; native rem typography and px shapes.',
    sources:filenames.flatMap(name=>[`tokens/_${name}.scss`,`tokens/versions/v0_192/_${name}.scss`]).map(path=>({url:`https://github.com/material-components/material-web/blob/${MATERIAL_COMMIT}/${path}`,version:`@material/web ${MATERIAL_VERSION}; Google Material 3 v0.192; commit ${MATERIAL_COMMIT}`})),
  },capabilities:{colors:{groups:colorGroups},typography:{fontFamily:true,baseSize:true,typeScale:true,lineHeight:true},layout:{grid:false,breakpoints:false,spacing:false,radius:true,tokens:false}},modules:modules.map(m=>({id:m.module,path:`${m.module}.json`}))};
  validatePreset(preset,'materialdesign');
  validateModules(preset,modules);
  return {preset,modules};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root=canonicalDirectory();
  const data=buildMaterialDesignPreset();
  const catalog=JSON.parse(readFileSync(join(root,'catalog.json'),'utf8'));
  const entry={id:'materialdesign',name:'Material Design',path:'materialdesign/preset.json'};
  const entries=[...catalog.presets.filter(p=>p.id!==entry.id),entry];
  const order=['bootstrap','tailwindcss','materialdesign','bulma','starttoken'];
  catalog.presets=entries.sort((a,b)=>(order.indexOf(a.id)<0?order.length:order.indexOf(a.id))-(order.indexOf(b.id)<0?order.length:order.indexOf(b.id)));
  validateCatalog(catalog);
  const outputs=[['catalog.json',catalog],['materialdesign/preset.json',data.preset],...data.modules.map(m=>[`materialdesign/${m.module}.json`,m])];
  for(const [path,value] of outputs){
    const text=JSON.stringify(value,null,2)+'\n';
    if(process.argv.includes('--check')) {
      if(readFileSync(join(root,path),'utf8')!==text)throw Error(`Out of date: ${path}`);
    } else {
      mkdirSync(dirname(join(root,path)),{recursive:true});
      writeFileSync(join(root,path),text);
    }
  }
  console.log(`Material Design: ${data.modules.flatMap(m=>m.submodules.flatMap(g=>g.variables)).length} official tokens ${process.argv.includes('--check')?'verified':'written'} in ${root}`);
}
