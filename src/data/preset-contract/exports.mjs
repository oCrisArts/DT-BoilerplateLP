import {category,codeName,codeSyntax,scopesFor,tokenTier} from './token-metadata.mjs';

// Dependency order makes Sass aliases valid even when the preset lists consumers first.
export function prepareTokens(payload) {
  const ids=new Map(),paths=new Set(),names=new Set(),result=[],visiting=new Set(),done=new Set();
  for(const t of payload){
    const name=codeName(t.figmaName);
    if(ids.has(t.id)||paths.has(t.figmaName)||names.has(name))throw Error('Duplicate token: '+t.figmaName);
    ids.set(t.id,t);paths.add(t.figmaName);names.add(name);
  }
  function visit(t){
    if(done.has(t.id))return;
    if(visiting.has(t.id))throw Error('Cyclic alias: '+t.id);
    visiting.add(t.id);
    let resolved={...t};
    if(t.reference){
      const parent=ids.get(t.reference);
      if(!parent||parent.type!==t.type)throw Error('Invalid alias: '+t.id);
      visit(parent);
      const target=result.find(v=>v.id===parent.id);
      if(t.unit!==target.unit)throw Error('Alias unit mismatch: '+t.id);
      resolved={...resolved,value:target.value,displayValue:target.displayValue};
    }
    visiting.delete(t.id);done.add(t.id);result.push(resolved);
  }
  payload.forEach(visit);return result;
}
export function nativeValue(t){
  if(typeof t.value==='number')return `${t.value}${t.unit||''}`;
  if(typeof t.value==='object')return `rgb(${t.value.r*255} ${t.value.g*255} ${t.value.b*255} / ${t.value.a})`;
  return t.value;
}
function cssValue(t){
  const value=nativeValue(t);
  if(category(t)==='fontFamily')return value.split(',').map(s=>{const f=s.trim().replace(/^['"]|['"]$/g,'');return /^(serif|sans-serif|monospace|system-ui|ui-serif|ui-sans-serif|ui-monospace|cursive|fantasy|emoji|math|fangsong)$/.test(f)?f:JSON.stringify(f);}).join(', ');
  // Configuration strings are data, not CSS declarations; quote them safely.
  if(t.type==='STRING'&&(!category(t)||/[;{}\n\r]/.test(value)))return JSON.stringify(value);
  return value;
}
function color(t){
  if(typeof t.value==='object')return {colorSpace:'srgb',components:[t.value.r,t.value.g,t.value.b],alpha:t.value.a};
  const value=t.value;
  if(value.startsWith('#')){let hex=value.slice(1);if(hex.length<5)hex=[...hex].map(c=>c+c).join('');return {colorSpace:'srgb',components:[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255),alpha:hex.length===8?parseInt(hex.slice(6),16)/255:1};}
  const match=value.match(/^(hsl|oklch)\((.*)\)$/),parts=match?.[2].split(/[\s,/]+/).filter(Boolean);
  if(!match||!parts)throw Error('Unsupported color: '+value);
  const components=parts.slice(0,3).map(Number.parseFloat);
  if(match[1]==='hsl'){components[1]/=100;components[2]/=100;}
  else if(parts[0].includes('%'))components[0]/=100;
  return {colorSpace:match[1],components,alpha:parts[3]?parseFloat(parts[3])/(parts[3].includes('%')?100:1):1};
}
function dtcgValue(t){
  const c=category(t);
  if(t.type==='COLOR')return ['color',color(t)];
  if(c==='fontFamily')return ['fontFamily',String(t.value).split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,''))];
  if(c==='fontWeight'&&typeof t.value==='number'&&t.value>=1&&t.value<=1000)return ['fontWeight',t.value];
  if(c==='borderStyle'&&['solid','dashed','dotted','double','groove','ridge','outset','inset'].includes(t.value))return ['strokeStyle',t.value];
  if(t.type==='FLOAT'&&['px','rem'].includes(t.unit))return ['dimension',{value:t.value,unit:t.unit}];
  // em/percent, expressions and configuration strings cannot be coerced into a
  // DTCG px/rem dimension. Their native unit/type is retained in the extension.
  return [t.type==='FLOAT'?'number':'string',t.value];
}
const segment=s=>s.replace(/~/g,'~0').replace(/\./g,'~1').replace(/\{/g,'~2').replace(/\}/g,'~3').replace(/^\$/,'~4');
export function dtcgPath(t){return t.figmaName.split('/').map(segment);}
export function exportTokens(payload){
  const tokens=prepareTokens(payload),byId=new Map(tokens.map(t=>[t.id,t])),dtcg=Object.create(null),theme=Object.create(null),all=Object.create(null);
  const lines={css:[],scss:[],sass:[]};
  for(const t of tokens){
    const name=codeName(t.figmaName),target=t.reference&&byId.get(t.reference);
    const raw=cssValue(t),ref=target&&codeName(target.figmaName);
    lines.css.push(`  --${name}: ${ref?`var(--${ref})`:raw};`);
    lines.scss.push(`$${name}: ${ref?`$${ref}`:raw};`);
    lines.sass.push(`$${name}: ${ref?`$${ref}`:raw}`);
    const [type,value]=dtcgValue(t),path=dtcgPath(t);let group=dtcg;
    for(const part of path.slice(0,-1)){if(group[part]?.$value!==undefined)throw Error('DTCG path collision');group=group[part]||=(Object.create(null));}
    const leaf=path.at(-1);if(group[leaf])throw Error('DTCG path collision');
    group[leaf]={$type:type,$value:target?`{${dtcgPath(target).join('.')}}`:value,$extensions:{'org.starttokens':{id:t.id,name:t.name,path:t.figmaName,type:t.type,unit:t.unit||null,value:t.value,displayValue:t.displayValue,reference:t.reference||null,tier:tokenTier(t),scopes:scopesFor(t),codeSyntax:codeSyntax(t)}}};
    // All tokens remain available in JS. Only real supported categories enter theme.extend.
    all[name]=nativeValue(t);
    const c=category(t);
    if(c&&c!=='sizing'&&c!=='borderStyle'){
      const entries=theme[c]||=(Object.create(null));
      entries[name]=c==='fontFamily'?String(t.value).split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,'')):nativeValue(t);
    }
  }
  const tailwind=`// Tailwind 3 config; Tailwind 4: load this file with @config.\n// Import tokens separately for values without a Tailwind theme category.\nexport const tokens = ${JSON.stringify(all,null,2)};\nexport default ${JSON.stringify({theme:{extend:theme}},null,2)};\n`;
  return {dtcg:JSON.stringify(dtcg,null,2)+'\n',css:':root {\n'+lines.css.join('\n')+'\n}\n',scss:lines.scss.join('\n')+'\n',sass:lines.sass.join('\n')+'\n',tailwind};
}
