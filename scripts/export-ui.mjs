import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportTokens} from '../src/data/preset-contract/exports.mjs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:420,height:747},acceptDownloads:true});
 await page.addInitScript(()=>{
  window.requests=[];window.copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async s=>{window.copied=s;}}});
  window.addEventListener('message',e=>{const m=e.data?.pluginMessage;if(!m)return;window.requests.push(m);if(m.type==='list-fonts')window.postMessage({pluginMessage:{type:'available-fonts',fonts:[{family:'Inter',style:'Regular'}]}},'*');});
 });
 await page.goto('http://127.0.0.1:5175',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'StartToken',exact:true}).click();
 await page.getByRole('tab',{name:/Typography/}).click();
 await page.getByLabel('Base Size').fill('24px');
 await page.getByRole('button',{name:'Generate scale',exact:true}).click();
 await page.getByRole('button',{name:'Generate tokens',exact:true}).click();
 await page.waitForFunction(()=>window.requests.some(m=>m.type==='generate-variables'));
 const payload=await page.evaluate(()=>window.requests.findLast(m=>m.type==='generate-variables').tokens),expected=exportTokens(payload);
 await page.locator('summary').filter({hasText:/^Export$/}).click();
 for(const [format,extension] of [['dtcg','json'],['css','css'],['scss','scss'],['sass','sass'],['tailwind','mjs']]){
  await page.getByLabel('Export format').selectOption(format);
  assert.equal(await page.getByLabel('Export preview').inputValue(),expected[format]);
  await page.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.evaluate(()=>window.copied),expected[format]);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download',exact:true}).click();const file=await download;
  assert.ok(file.suggestedFilename().endsWith('.'+extension));assert.equal(readFileSync(await file.path(),'utf8'),expected[format]);
 }
 await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('Denied');};document.execCommand=()=>{window.copied=document.activeElement.value;return true;};window.copied='';});
 await page.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.evaluate(()=>window.copied),expected.tailwind);
 await page.evaluate(()=>{document.execCommand=()=>false;});await page.getByRole('button',{name:'Copy',exact:true}).click();await page.getByText('Unable to copy. Select the preview text or download the file.').waitFor();
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.goto('http://127.0.0.1:5174',{waitUntil:'domcontentloaded'});
 const demo=page.locator('#hero .plugin-demo');await demo.getByRole('button',{name:'StartToken',exact:true}).click();
 await demo.locator('summary').filter({hasText:/^Export$/}).click();await demo.getByLabel('Export format').selectOption('css');assert.match(await demo.getByLabel('Export preview').inputValue(),/--space-0: 0px/);
 console.log('Export UI: five previews, copy/download bytes, generation payload parity, responsive plugin and LP demo passed.');
}finally{await browser.close();}
