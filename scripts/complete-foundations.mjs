import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {tokenTier} from '../src/data/preset-contract/token-metadata.mjs';

export function completeFoundations(preset,modules){
  const layout=modules.find(m=>m.module==='layout'),type=modules.find(m=>m.module==='typography');
  const add=(module,group,label,name,value,unit,path)=>{
    let g=module.submodules.find(s=>s.id===group);
    if(!g){g={id:group,label,icon:module.module==='typography'?'format_letter_spacing':'tune',variables:[]};module.submodules.push(g);}
    if(g.variables.some(v=>v.name===name))return;
    g.variables.push({id:`${module.module}.${group}.${name}`,module:module.module,submodule:group,name,figmaName:path||`${module.label}/${label}/${name}`,type:typeof value==='number'?'FLOAT':'STRING',value,...(unit?{unit}:{}),displayValue:`${value}${unit||''}`});
  };
  if(preset.id==='starttoken'){
    add(layout,'space','Space','spacing-0',0,'px','Layout/Space/0');
    add(layout,'radius','Radius','radius-full',9999,'px');
    for(const [n,v] of Object.entries({mobile:0,tablet:768,desktop:1024,wide:1440}))add(layout,'breakpoints','Breakpoints','breakpoint-'+n,v,'px');
    for(const v of [0,1,2,4,8])add(layout,'borderWidth','Border Width','border-width-'+v,v,'px');
    for(const v of ['none','solid','dashed','dotted','double'])add(layout,'borderStyle','Border Style','border-style-'+v,v);
    for(const v of [0,25,50,75,100])add(layout,'opacity','Opacity','opacity-'+v,v/100);
    for(const [n,v] of Object.entries({tight:-.025,normal:0,wide:.025}))add(type,'tracking','Tracking','letter-spacing-'+n,v,'em');
  }
  if(preset.id==='bootstrap'){
    for(const v of [1,2,3,4,5])add(layout,'borderWidth','Border Width',String(v),v,'px');
    add(layout,'borderStyle','Border Style','border-style','solid');
    for(const v of [0,25,50,75,100])add(layout,'opacity','Opacity',String(v),v/100);
  }
  if(preset.id==='bulma'){add(layout,'opacity','Opacity','button-disabled-opacity',.5);layout.submodules.find(g=>g.id==='opacity').variables.find(t=>t.name==='button-disabled-opacity').tier='component';add(layout,'borderWidth','Border Width','control-border-width',1,'px');add(layout,'borderStyle','Border Style','input-border-style','solid');layout.submodules.find(g=>g.id==='borderStyle').variables.find(t=>t.name==='input-border-style').tier='component';}
  if(preset.id==='materialdesign'){
    const colors=modules.find(m=>m.module==='colors');
    const source=readFileSync(new URL('./materialdesign-source/tokens/versions/v0_192/_md-sys-color.scss',import.meta.url),'utf8').split('@function values-light')[1];
    const palette=readFileSync(new URL('./materialdesign-source/tokens/versions/v0_192/_md-ref-palette.scss',import.meta.url),'utf8');
    let group=colors.submodules.find(g=>g.id==='palette');
    if(!group){group={id:'palette',label:'Reference Palette',icon:'palette',variables:[]};colors.submodules.unshift(group);}
    for(const token of colors.submodules.filter(g=>g.id!=='palette').flatMap(g=>g.variables)){
      const key=token.name.replace('--md-sys-color-','');
      const line=source.slice(source.indexOf("'"+key+"':")).split('),')[0];
      const target=line?.match(/'md-ref-palette',\s*'([^']+)'/)?.[1];
      if(!target)throw Error('Missing native palette reference '+key);
      const paletteLine=palette.split('\n').find(line=>line.includes("'"+target+"':"));
      const value=paletteLine?.match(/null,\s*(#[a-f0-9]+)/)?.[1];
      if(!value)throw Error('Missing native palette value '+target);
      const name='--md-ref-palette-'+target,id='colors.palette.'+name;
      if(!group.variables.some(v=>v.id===id))group.variables.push({id,module:'colors',submodule:'palette',name,figmaName:'Colors/Reference Palette/'+name,type:'COLOR',value,displayValue:value,tier:'primitive'});
      token.reference ||= id;
    }
    preset.capabilities.colors.groups=colors.submodules.map(g=>g.id);
  }
  if(preset.id==='tailwindcss')for(const [n,v] of Object.entries({tighter:-.05,tight:-.025,normal:0,wide:.025,wider:.05,widest:.1}))add(type,'tracking','Tracking','--tracking-'+n,v,'em');
  // Native theme/role aliases, never inferred from accidental equality alone.
  const all=modules.flatMap(m=>m.submodules.flatMap(g=>g.variables)),byId=new Map(all.map(t=>[t.id,t]));
  const aliases=preset.id==='bootstrap'?{primary:'blue',secondary:'gray-600',success:'green',info:'cyan',warning:'yellow',danger:'red',light:'gray-100',dark:'gray-900'}:preset.id==='bulma'?{'scheme-main':'white','scheme-main-bis':'white-bis','scheme-main-ter':'white-ter','scheme-invert':'black','scheme-invert-bis':'black-bis','scheme-invert-ter':'black-ter',text:'grey-dark','text-weak':'grey','text-strong':'grey-darker',primary:'turquoise',info:'cyan',success:'green',warning:'yellow',danger:'red',light:'white-ter',dark:'grey-darker',link:'blue',background:'white-ter',border:'grey-lighter','border-weak':'grey-lightest',code:'red','shadow-color':'black'}:{};
  for(const [name,target] of Object.entries(aliases)){
    const t=byId.get(`colors.${preset.id==='bootstrap'?'theme':'roles'}.${name}`),p=byId.get('colors.palette.'+target);
    if(t&&p&&!t.reference&&JSON.stringify(t.value)===JSON.stringify(p.value))t.reference=p.id;
  }
  for(const t of all)t.tier=tokenTier(t);
  for(const key of ['borderWidth','borderStyle','opacity'])preset.capabilities.layout[key]=layout.submodules.some(g=>g.id===key&&g.variables.length);
  preset.capabilities.layout.breakpoints=layout.submodules.some(g=>g.id==='breakpoints'&&g.variables.length);
  preset.capabilities.typography.letterSpacing=type.submodules.some(g=>g.variables.some(v=>/tracking|letter-spacing/.test(v.name)));
  const sources=preset.id==='bootstrap'?['https://github.com/twbs/bootstrap/blob/v5.3.3/scss/_utilities.scss']:preset.id==='bulma'?['https://github.com/jgthms/bulma/blob/1.0.2/sass/utilities/controls.scss','https://github.com/jgthms/bulma/blob/1.0.2/sass/form/shared.scss','https://bulma.io/documentation/elements/button/']:[];
  for(const url of sources)if(!preset.metadata.sources.some(s=>s.url===url))preset.metadata.sources.push({url,version:preset.metadata.version});
  return {preset,modules};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const base=new URL('../public/data/presets/',import.meta.url),read=p=>JSON.parse(readFileSync(new URL(p,base),'utf8'));
  for(const entry of read('catalog.json').presets){const dir=entry.path.slice(0,entry.path.lastIndexOf('/')+1),p=read(entry.path),m=p.modules.map(m=>read(dir+m.path));completeFoundations(p,m);for(const [path,value] of [[entry.path,p],...m.map(m=>[dir+m.module+'.json',m])])writeFileSync(new URL(path,base),JSON.stringify(value,null,2)+'\n');}
}
