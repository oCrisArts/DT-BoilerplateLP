import { completeFoundations } from './complete-foundations.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../public/data/presets/', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const write = (path, data) => writeFileSync(new URL(path, root), JSON.stringify(data, null, 2) + '\n');
export function upgradeFoundations(preset, modules) {
  const typography = modules.find(m => m.module === 'typography');
  if (preset.id === 'starttoken') {
    const group=typography.submodules.find(s=>s.id==='family');
    const primary=group.variables.find(v=>v.name==='font-family-primary') || group.variables.find(v=>v.name==='font-family-sans');
    const secondary=group.variables.find(v=>v.name==='font-family-secondary');
    const make=(role,value,original=primary)=>({...original,id:'typography.family.font-family-'+role,name:'font-family-'+role,figmaName:'Typography/Family/font-family-'+role,value,displayValue:value});
    group.variables=[make('primary',primary.value),make('secondary',secondary?.value||'Sora',secondary||primary)];
    typography.configuration.fontFamily={...typography.configuration.fontFamily,default:group.variables[0].id,options:group.variables.map(v=>v.id)};
  }
  const family = typography.configuration.fontFamily;
  const ids = family.options || [family.default];
  const role = (label, token) => ({ label, token, customizable: true });
  typography.configuration.fontRoles = { primary: role('Primary Font', family.default) };
  if (['starttoken','materialdesign'].includes(preset.id)) typography.configuration.fontRoles.secondary = role('Secondary Font', ids[1]);
  if (preset.id === 'tailwindcss') typography.configuration.fontRoles.secondary = role('Secondary Font', ids[1]);
  if (['bootstrap','tailwindcss','bulma'].includes(preset.id)) typography.configuration.fontRoles.monospace = role('Monospace Font', ids.at(-1));
  typography.configuration.typeScale.referenceRatio = preset.id === 'materialdesign' ? 1.2 : 1.25;
  if (preset.id === 'starttoken') {
    const colors = modules.find(m => m.module === 'colors');
    for (const v of colors.submodules.flatMap(s=>s.variables)) {
      for (const key of ['id','name','figmaName','reference']) if (typeof v[key] === 'string') v[key] = v[key].replace(/grayscale/gi, match => match[0] === 'G' ? 'Black' : 'black');
    }
    const palette = colors.submodules.find(s=>s.id==='palette');
    if (!palette.variables.some(v=>/^colors.palette.white(?:-|$)/.test(v.id))) {
      // Same neutral profile as Black, reflected around white. All steps remain editable
      // through StartToken's existing family recoloring mechanism.
      palette.variables.push(...palette.variables.filter(v=>/^colors.palette.black(?:-|$)/.test(v.id)).map(v=>{
        const value = Object.fromEntries(Object.entries(v.value).map(([k,n])=>[k,k==='a'?n:1-n]));
        const hex = '#'+['r','g','b'].map(k=>Math.round(value[k]*255).toString(16).padStart(2,'0')).join('');
        return {...v,id:v.id.replace('black','white'),name:v.name.replace('Black','White'),figmaName:v.figmaName.replace('Black','White'),value,displayValue:hex,preview:hex};
      }));
    }
  }
  const settings = {
    starttoken: ['material-symbols',24,'24px',[12,16,20,24,32,40],['xs','sm','md','lg','xl','2xl'],'icon-size-', 'StartToken project icon tokens.'],
    bootstrap: ['bootstrap-icons',16,'1em',[12,16,20,24,32,40],['xs','sm','md','lg','xl','2xl'],'icon-size-', 'Bootstrap icons scale with 1em; project sizes are reusable extensions.'],
    tailwindcss: ['lucide',24,'24px',[12,16,20,24,32,40],['3','4','5','6','8','10'],'--icon-size-', 'Tailwind has no default icon library. Lucide is a project default; sizes follow the 4px spacing unit.'],
    materialdesign: ['material-symbols',24,'24dp',[20,24,40,48],['small','default','large','extra-large'],'icon-size-', 'Material Symbols supports FILL, wght, GRAD and opsz. Project sizes preserve the Material optical range.'],
    bulma: ['font-awesome',16,'1em',[16,24,32,48],['small','normal','medium','large'],'icon-size-', 'Bulma provides icon container sizes, not a built-in library. Font Awesome is its documented integration.'],
  };
  const [library,base,native,values,names,prefix,description] = settings[preset.id];
  const variable = (submodule,name,value,type='STRING',unit) => ({id:`iconography.${submodule}.${name}`,module:'iconography',submodule,name,figmaName:`Iconography/${submodule}/${name}`,type,value,displayValue:`${value}${unit||''}`,...(unit?{unit}:{})});
  const configVars = [variable('configuration','icon-library',library),variable('configuration','icon-delivery','svg'),variable('configuration','icon-native-size',native),variable('configuration','icon-base-size',base,'FLOAT','px'),variable('configuration','icon-color-behavior','currentColor')];
  if(preset.id==='bootstrap')configVars.push(variable('configuration','icon-vertical-align',-.125,'FLOAT','em'));
  const scale = values.map((value,i)=>variable('sizes',prefix+names[i],value,'FLOAT','px'));
  const iconography = {schemaVersion:1,module:'iconography',label:'Icons',tabIcon:'wallpaper',configuration:{library:'iconography.configuration.icon-library',delivery:'iconography.configuration.icon-delivery',nativeSize:'iconography.configuration.icon-native-size',baseSize:'iconography.configuration.icon-base-size',colorBehavior:'iconography.configuration.icon-color-behavior',...(preset.id==='bootstrap'?{verticalAlign:'iconography.configuration.icon-vertical-align'}:{}),scale:{kind:preset.id==='tailwindcss'?'spacing':'proportional',steps:scale.map(v=>v.id),baseValue:base},description},submodules:[{id:'configuration',label:'Configuration',icon:'settings',variables:configVars},{id:'sizes',label:'Generated scale',icon:'linear_scale',variables:scale}]};
  preset.capabilities.iconography = {library:true,delivery:true,scale:true,colorBehavior:true};
  preset.modules = [{id:'colors',path:'colors.json'},{id:'typography',path:'typography.json'},{id:'iconography',path:'iconography.json'},{id:'layout',path:'layout.json'}];
  return completeFoundations(preset,[modules.find(m=>m.module==='colors'),typography,iconography,modules.find(m=>m.module==='layout')]);
}
if (process.argv[1] && import.meta.url === new URL('file:///' + process.argv[1].replaceAll('\\','/')).href) {
  for(const entry of read('catalog.json').presets){
    const dir=entry.path.slice(0,entry.path.lastIndexOf('/')+1), preset=read(entry.path);
    const upgraded=upgradeFoundations(preset,preset.modules.map(m=>read(dir+m.path)));
    write(entry.path,upgraded.preset);
    for(const module of upgraded.modules)write(dir+module.module+'.json',module);
  }
}
