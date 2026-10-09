import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
const resolve=path=>{
  const headers={};
  for(const route of config.routes){
    if(route.handle==='filesystem'){
      if(existsSync(new URL('../public'+path,import.meta.url)))return {path,headers,status:200};
    }else if(new RegExp('^'+route.src+'$').test(path)){
      Object.assign(headers,route.headers);
      if(!route.continue)return {path:route.dest,headers,status:route.status||200};
    }
  }
};
test('icon JSON is static with CORS and cache; missing icons never use SPA fallback',()=>{
  for(const file of ['catalog.json','bootstrap-icons.json']){
    const path='/data/icons/'+file,result=resolve(path);
    assert.equal(result.path,path);assert.equal(result.status,200);
    assert.equal(result.headers['Access-Control-Allow-Origin'],'*');
    assert.match(result.headers['Cache-Control'],/s-maxage=3600/);
    assert.ok(JSON.parse(readFileSync(new URL('../public'+path,import.meta.url),'utf8')));
  }
  assert.equal(resolve('/data/icons/missing.json').status,404);
  assert.equal(resolve('/some/spa/page').path,'/index.html');
});
