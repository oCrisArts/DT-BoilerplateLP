import type { IconLibrary } from './preset-contract/types';
import { validateIconLibrary } from './preset-contract/validate.mjs';
const base=`${import.meta.env.BASE_URL}data/icons/`;
export type IconCatalog={schemaVersion:1;version:string;libraries:{id:string;name:string;path:string;version:string;sha256:string}[]};
async function json(path:string){const r=await fetch(base+path);if(!r.ok)throw Error('Unable to load icon catalog');return r.json();}
export async function loadIconCatalog():Promise<IconCatalog>{return json('catalog.json');}
const pending=new Map<string,Promise<IconLibrary>>();
export function loadIconLibrary(id:string):Promise<IconLibrary>{
  if(!/^[a-z-]+$/.test(id))return Promise.reject(Error('Unknown icon library'));
  if(!pending.has(id))pending.set(id,json(id+'.json').then(validateIconLibrary).catch(e=>{pending.delete(id);throw e;}));
  return pending.get(id)!;
}
