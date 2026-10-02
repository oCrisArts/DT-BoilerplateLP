import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateIconLibrary, assertPath } from '../src/data/preset-contract/validate.mjs';
const root=new URL('../public/data/icons/',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const catalog=JSON.parse(read('catalog.json'));
if(catalog.schemaVersion!==1||!catalog.version||catalog.libraries.length!==6||new Set(catalog.libraries.map(l=>l.id)).size!==6)throw Error('Invalid icon catalog');
for(const entry of catalog.libraries){
  assertPath(entry.path);
  const bytes=read(entry.path),library=validateIconLibrary(JSON.parse(bytes));
  if(library.id!==entry.id||library.version!==entry.version||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Icon catalog integrity mismatch');
  console.log(`${library.name}: ${library.icons.length} icons validated.`);
}
