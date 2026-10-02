import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { validateIconLibrary } from '../src/data/preset-contract/validate.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const cache=resolve(root,'node_modules/.cache/icon-sources');
const output=resolve(root,'public/data/icons');
mkdirSync(cache,{recursive:true});mkdirSync(output,{recursive:true});
const packs=[
  {id:'bootstrap-icons',name:'Bootstrap Icons',provider:'Bootstrap',pkg:'bootstrap-icons',version:'1.13.1',folder:'icons',delivery:['svg','sprite','font'],defaultSize:16,nativeSize:'1em',variants:['regular'],license:'MIT'},
  {id:'lucide',name:'Lucide',provider:'Lucide',pkg:'lucide-static',version:'0.487.0',folder:'icons',delivery:['svg','sprite','font'],defaultSize:24,nativeSize:'24px',variants:['outline'],license:'ISC',properties:{strokeWidth:{values:[1,1.5,2,2.5,3],default:2}}},
  {id:'phosphor',name:'Phosphor',provider:'Phosphor Icons',pkg:'@phosphor-icons/core',version:'2.1.1',folder:'assets',delivery:['svg','font'],defaultSize:256,nativeSize:'256 viewBox',variants:['thin','light','regular','bold','fill','duotone'],license:'MIT'},
  {id:'font-awesome',name:'Font Awesome',provider:'Fonticons',pkg:'@fortawesome/fontawesome-free',version:'6.7.2',folder:'svgs',delivery:['svg','font'],defaultSize:16,nativeSize:'1em; variable width',variants:['solid','regular','brands'],license:'CC-BY-4.0 (icons); OFL-1.1 (fonts); MIT (code)'},
  {id:'remix-icon',name:'Remix Icon',provider:'Remix Design',pkg:'remixicon',version:'4.6.0',folder:'icons',delivery:['svg','sprite','font'],defaultSize:24,nativeSize:'24px',variants:['line','fill'],license:'Apache-2.0'},
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fetchBytes(url){const r=await fetch(url);if(!r.ok)throw Error(`${r.status}: ${url}`);return Buffer.from(await r.arrayBuffer());}
const files=dir=>readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]);
const entries=[];
for(const pack of packs){
  const dest=resolve(cache,`${pack.id}-${pack.version}`);mkdirSync(dest,{recursive:true});
  const archive=resolve(dest,'source.tgz');
  const metadataFile=resolve(dest,'registry.json');
  if(!existsSync(metadataFile))writeFileSync(metadataFile,await fetchBytes(`https://registry.npmjs.org/${pack.pkg}/${pack.version}`));
  const metadata=JSON.parse(readFileSync(metadataFile,'utf8'));
  if(!existsSync(archive))writeFileSync(archive,await fetchBytes(metadata.dist.tarball));
  const bytes=readFileSync(archive);
  const integrity='sha512-'+createHash('sha512').update(bytes).digest('base64');
  if(metadata.dist.integrity!==integrity)throw Error(`Integrity mismatch: ${pack.id}`);
  if(!existsSync(resolve(dest,'package')))execFileSync('tar',['-xzf',archive,'-C',dest]);
  const svgDir=resolve(dest,'package',pack.folder);
  const icons=files(svgDir).filter(f=>f.endsWith('.svg')).map(file=>{
    const path=relative(svgDir,file).replaceAll('\\','/');
    let name=path.split('/').at(-1).slice(0,-4),variant=pack.variants[0];
    if(pack.id==='phosphor'){variant=path.split('/')[0];name=name.replace(new RegExp(`-${variant}$`),'');}
    if(pack.id==='font-awesome')variant=path.split('/')[0];
    if(pack.id==='remix-icon'){variant=name.endsWith('-fill')?'fill':'line';name=name.replace(/-(fill|line)$/,'');}
    return {name,svg:readFileSync(file,'utf8').replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/g,'').trim(),tags:[...new Set([...name.split(/[-_]/),...path.split('/').slice(0,-1)])],variant};
  }).filter(i=>pack.variants.includes(i.variant));
  const library={schemaVersion:1,...pack,source:{url:metadata.dist.tarball,integrity,license:pack.license},icons};delete library.pkg;delete library.folder;delete library.license;
  validateIconLibrary(library);const content=JSON.stringify(library);writeFileSync(resolve(output,pack.id+'.json'),content+'\n');
  entries.push({id:pack.id,name:pack.name,path:pack.id+'.json',version:pack.version,sha256:sha(content+'\n')});console.log(`${pack.id}: ${icons.length} official SVGs`);
}
// Google publishes Symbols in its source repository rather than an official SVG npm package.
// Pin its revision and preserve each upstream SVG; the initial offline selection is explicit.
const revision='737e3324305806514d7909874fa1818ae1808232';
const names=['home','search','settings','favorite','person','menu','close','check','add','remove','arrow_back','arrow_forward','download','upload','edit','delete','info','warning','error','help','mail','call','calendar_month','check_circle','account_circle','star','visibility','lock','shopping_cart','notifications','play_arrow','pause','share','print','cloud','folder','description','image','palette','grid_view'];
const materialCache=resolve(cache,'material-symbols-'+revision);mkdirSync(materialCache,{recursive:true});
const icons=[];
for(const name of names)for(const [variant,style] of [['outlined','materialsymbolsoutlined'],['rounded','materialsymbolsrounded'],['sharp','materialsymbolssharp']])for(const fill of [0,1]){
  const file=`${name}${fill?'_fill1':''}_24px.svg`,local=resolve(materialCache,`${style}-${file}`);
  if(!existsSync(local))writeFileSync(local,await fetchBytes(`https://raw.githubusercontent.com/google/material-design-icons/${revision}/symbols/web/${name}/${style}/${file}`));
  icons.push({name,variant:`${variant}${fill?'-fill':''}`,svg:readFileSync(local,'utf8'),tags:name.split('_')});
}
const material={schemaVersion:1,id:'material-symbols',name:'Material Symbols',provider:'Google',version:revision,delivery:['svg','font'],defaultSize:24,nativeSize:'24dp',variants:['outlined','outlined-fill','rounded','rounded-fill','sharp','sharp-fill'],properties:{FILL:{values:[0,1],default:0},wght:{values:[400],default:400},GRAD:{values:[0],default:0},opsz:{values:[24],default:24}},source:{url:`https://github.com/google/material-design-icons/tree/${revision}/symbols`,integrity:'sha256-'+sha(JSON.stringify(icons)),license:'Apache-2.0',scope:'40 common symbols, three styles and two fills; static SVG axes fixed to wght=400, GRAD=0, opsz=24.'},icons};
validateIconLibrary(material);const content=JSON.stringify(material)+'\n';writeFileSync(resolve(output,'material-symbols.json'),content);entries.splice(1,0,{id:material.id,name:material.name,path:material.id+'.json',version:material.version,sha256:sha(content)});
writeFileSync(resolve(output,'catalog.json'),JSON.stringify({schemaVersion:1,version:'1.0.0',libraries:entries},null,2)+'\n');
console.log(`material-symbols: ${icons.length} official SVGs; catalog v1.0.0`);
